package com.trainbooking.userservice.common.exception;

public class AuthException extends RuntimeException{

    private final String errorCode;

    public AuthException(String message, String errorCode){
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode(){
        return errorCode;
    }

}
