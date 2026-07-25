package com.trainbooking.paymentservice.utils;


import org.springframework.stereotype.Component;

@Component
public class RazorPayCommonUtil {

    public static String generateCheckoutUrl(String baseUrl,String bookingId){
        return baseUrl + "/payments/checkout/" + bookingId;
    }
}
