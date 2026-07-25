package com.trainbooking.notificationservice.kafka;


import com.trainbooking.notificationservice.dto.UserResponse;
import com.trainbooking.notificationservice.eventmodel.NotificationEvent;
import com.trainbooking.notificationservice.service.EmailService;
import com.trainbooking.notificationservice.template.EmailNotificationTemplate;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;

@Component
@Slf4j
@RequiredArgsConstructor
public class NotificationKafkaConsumer {

    private final EmailService emailService;
    private final RestTemplate restTemplate;

    @Value("${services.user.url}")
    private String USER_SERVICE_URL;

    @KafkaListener(topics = "notification-events", groupId = "notification-group")
    public void consumes(NotificationEvent notificationEvent){
        log.info("Received notification event for BookingId: {}", notificationEvent.getBookingId());
        try{
            ResponseEntity<UserResponse> userResponse =
                    restTemplate.getForEntity(USER_SERVICE_URL+"/api/users/"+notificationEvent.getUserId(),
                            UserResponse.class);
            if(!userResponse.getStatusCode().is2xxSuccessful() || userResponse.getBody() == null){
                log.error("Could not fetch user details for UserId: {}", notificationEvent.getUserId());
                return;
            }
            String email = userResponse.getBody().emailId();
            String username = userResponse.getBody().firstName();
            HashMap<String,Object> emailTemplate = EmailNotificationTemplate
                    .getNotificationTemplate(notificationEvent.getStatus(),
                            notificationEvent,
                            email,
                            username);
            emailService.sendBookingMail(email,emailTemplate.get("subject").toString(),emailTemplate.get("body").toString());
        } catch (Exception e) {
            log.error("Error processing notification for BookingId: {}", notificationEvent.getBookingId(), e);
        }
    }
}
