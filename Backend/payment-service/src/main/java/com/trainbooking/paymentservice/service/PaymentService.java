package com.trainbooking.paymentservice.service;

import com.trainbooking.paymentservice.dto.CreateOrderRequest;
import com.trainbooking.paymentservice.dto.CreateOrderResponse;
import com.trainbooking.paymentservice.entity.Payment;

import java.util.Optional;
import java.util.UUID;

public interface PaymentService {

    CreateOrderResponse createOrder(CreateOrderRequest createOrderRequest);

    void handleWebhook(String payload, String razorpaySignature);

    Optional<Payment> getPaymentByBookingId(UUID bookingId);

    String getCheckoutPage(String orderId);
}
