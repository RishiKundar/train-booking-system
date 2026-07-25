package com.trainbooking.notificationservice.template;

import com.trainbooking.notificationservice.eventmodel.NotificationEvent;
import org.springframework.stereotype.Component;

import java.util.HashMap;

@Component
public class EmailNotificationTemplate {

    public static HashMap<String,Object> getNotificationTemplate(String status, NotificationEvent event, String userEmail, String userName){
        HashMap<String,Object> templateDtls = new HashMap<>();
        if(status.equals("CONFIRMED")){
            // Confirmed Notification Template
            String subject = "Booking Confirmed! PNR: " + event.getPnr();
            String body = String.format("Hello %s,\n\nYour train booking is CONFIRMED!\n\n" +
                            "PNR: %s\nTrain ID: %d\nDate: %s\nSeats: %d\nFare: ₹%s\n\n" +
                            "Have a safe journey!",
                    userName, event.getPnr(), event.getTrainId(),
                    event.getTravelDate(), event.getSeats(), event.getFare());
            templateDtls.put("subject", subject);
            templateDtls.put("body",body);
        }else if(status.equals("PAYMENT_FAILED")){
            String subject = "Booking Update: " + event.getStatus();
            String body = String.format("Hello %s,\n\nYour train booking (PNR: %s) status is now %s.\n\n" +
                            "If this was a payment failure, your seats have been released.",
                    userName, event.getPnr(), event.getStatus());
            templateDtls.put("subject", subject);
            templateDtls.put("body",body);
        }else{
            // CANCELLED Notification Template
            String subject = "Booking Update: " + event.getStatus();
            String body = String.format("Hello %s,\n\nYour train booking (PNR: %s) status is now %s.\n\n" +
                            "Your seats have been released.",
                    userName, event.getPnr(), event.getStatus());
            templateDtls.put("subject", subject);
            templateDtls.put("body",body);
        }
        return templateDtls;
    }
}
