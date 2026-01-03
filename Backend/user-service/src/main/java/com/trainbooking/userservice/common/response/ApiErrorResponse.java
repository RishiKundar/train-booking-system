package com.trainbooking.userservice.common.response;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApiErrorResponse {

    private boolean success;
    private String errorCode;
    private String message;
}
