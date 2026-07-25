package com.trainbooking.paymentservice.controller;


import com.trainbooking.paymentservice.dto.CreateOrderRequest;
import com.trainbooking.paymentservice.dto.CreateOrderResponse;
import com.trainbooking.paymentservice.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<CreateOrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request
            )
    {
        CreateOrderResponse response = paymentService.createOrder(request);
        return ResponseEntity.ok(response);
    }

//    @PostMapping("/webhook")
//    public ResponseEntity<Void> webhook(
//            @RequestBody String payload,
//            @RequestHeader("X-Razorpay-Signature") String signature
//    ){
//        paymentService.handleWebhook(payload,signature);
//        return ResponseEntity.ok().build();
//    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(
            @RequestBody String payload
    ){
        paymentService.handleWebhook(payload,null);
        return ResponseEntity.ok().build();
    }


    @GetMapping("/{bookingId}")
    public ResponseEntity<Map<String,String>> getPaymentStatus(@PathVariable UUID bookingId){
        return paymentService.getPaymentByBookingId(bookingId)
                .map(p -> ResponseEntity.ok(
                        Map.of("bookingId", p.getBookingId().toString(),
                                "status",p.getStatus().toString(),
                                "razorpayOrderId", p.getRazorpayOrderId())
                        )
                ).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/checkout/{bookingId}", produces = MediaType.TEXT_HTML_VALUE)
    public String razorpayCheckoutPage(@PathVariable String bookingId){
        return paymentService.getCheckoutPage(bookingId);
    }

}
