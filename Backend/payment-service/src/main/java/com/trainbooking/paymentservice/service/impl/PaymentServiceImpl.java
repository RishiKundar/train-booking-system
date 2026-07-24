package com.trainbooking.paymentservice.service.impl;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.trainbooking.paymentservice.dto.CreateOrderRequest;
import com.trainbooking.paymentservice.dto.CreateOrderResponse;
import com.trainbooking.paymentservice.entity.Payment;
import com.trainbooking.paymentservice.entity.PaymentStatus;
import com.trainbooking.paymentservice.eventmodel.PaymentEvent;
import com.trainbooking.paymentservice.exception.PaymentException;
import com.trainbooking.paymentservice.kafka.PaymentEventProducer;
import com.trainbooking.paymentservice.repo.PaymentRepository;
import com.trainbooking.paymentservice.service.PaymentService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.HmacAlgorithms;
import org.apache.commons.codec.digest.HmacUtils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;


@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final RazorpayClient razorpayClient;
    private final PaymentEventProducer paymentEventProducer;


    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.webhook-secret}")
    private String webhookSecret;

    @Transactional
    @Override
    public CreateOrderResponse createOrder(CreateOrderRequest createOrderRequest) {
        log.info("Entering Create Order For Payment");
        Optional<Payment> optionalPayment = paymentRepository.findByBookingId(createOrderRequest.bookingId());

        if(optionalPayment.isPresent() && optionalPayment.get().getStatus() == PaymentStatus.CREATED){
            Payment payment = optionalPayment.get();
            return new CreateOrderResponse(
                    payment.getBookingId(),
                    payment.getRazorpayOrderId(),
                    createOrderRequest.amountInPaise(),
                    payment.getCurrency(),
                    keyId
                    );
        }

        try{
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", createOrderRequest.amountInPaise());
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "bkg_"+createOrderRequest.bookingId());
            orderRequest.put("payment_capture",1);

            Order order = razorpayClient.orders.create(orderRequest);
            String razorpayOrderId = order.get("id");
            log.info("Razorpay OrderId created: {} | bookingId: {}", razorpayOrderId, createOrderRequest.bookingId());

            Payment payment = new Payment();
            payment.setId(UUID.randomUUID());
            payment.setBookingId(createOrderRequest.bookingId());
            payment.setRazorpayOrderId(razorpayOrderId);
            payment.setAmount(BigDecimal.valueOf(createOrderRequest.amountInPaise()));
            payment.setCurrency("INR");
            payment.setStatus(PaymentStatus.CREATED);
            paymentRepository.save(payment);

            return new CreateOrderResponse(
                    createOrderRequest.bookingId(),
                    razorpayOrderId,
                    createOrderRequest.amountInPaise(),
                    "INR",
                    keyId
            );
        } catch (RazorpayException e) {
            log.error("Failed to create RazorPay order for bookingId : {}", createOrderRequest.bookingId());
            throw new PaymentException("Payment order creation failed: " + e.getMessage());
        }

    }

    @Transactional
    @Override
    public void handleWebhook(String payload, String razorpaySignature) {
        String generatedSignature = new HmacUtils(HmacAlgorithms.HMAC_SHA_256, webhookSecret).hmacHex(payload);

        if(!generatedSignature.equals(razorpaySignature)){
            log.warn("Invalid Razorpay Webhook Signature !!!!! Rejecting");
            throw new SecurityException("Invalid Webhook Signature");
        }

        JSONObject event = new JSONObject(payload);
        String eventType = event.getString("event");
        log.info("Razorpay webhook received -> event: {}", eventType);

        if("payment.captured".equals(eventType)){
            JSONObject paymentObj = event
                    .getJSONObject("payload")
                    .getJSONObject("payment")
                    .getJSONObject("entity");

            String razorpayPaymentId = paymentObj.getString("id");
            String razorpayOrderId   = paymentObj.getString("order_id");

            Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                    .orElseThrow(() -> new PaymentException("No payment found for orderId : " + razorpayOrderId));

            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setStatus(PaymentStatus.CAPTURED);
            paymentRepository.save(payment);

            paymentEventProducer.publish(new PaymentEvent(
                    payment.getBookingId(),
                    razorpayPaymentId,
                    razorpayOrderId,
                    "CAPTURED"
            ));

            log.info("Payment CAPTURED -> bookingId: {}", payment.getBookingId());
        } else if ("payment.failed".equals(eventType)){
            JSONObject paymentObj = event
                    .getJSONObject("payload")
                    .getJSONObject("payment")
                    .getJSONObject("entity");

            String razorpayOrderId   = paymentObj.getString("order_id");

            Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                    .orElseThrow(() -> new PaymentException("No payment found for orderId : " + razorpayOrderId));

            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);

            paymentEventProducer.publish(new PaymentEvent(
                    payment.getBookingId(),
                    null,
                    razorpayOrderId,
                    "FAILED"
            ));

            log.info("Payment FAILED -> bookingId: {}", payment.getBookingId());
        }
    }

    @Override
    public Optional<Payment> getPaymentByBookingId(UUID bookingId) {
        return paymentRepository.findByBookingId(bookingId);
    }
}
