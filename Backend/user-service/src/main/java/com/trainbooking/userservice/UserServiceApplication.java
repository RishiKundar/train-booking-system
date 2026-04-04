package com.trainbooking.userservice;

import com.trainbooking.userservice.auth.dto.SignupRequest;
import com.trainbooking.userservice.auth.service.AuthService;
import com.trainbooking.userservice.token.repo.RefreshTokenRepository;
import com.trainbooking.userservice.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
@RequiredArgsConstructor
public class UserServiceApplication implements ApplicationRunner {


	private final AuthService authService;

	private final UserRepository userRepository;

	public static void main(String[] args) {
		SpringApplication.run(UserServiceApplication.class, args);
	}

	@Override
	public void run(ApplicationArguments args) throws Exception {

		if(!userRepository.existsByUsername("super_admin")){
			SignupRequest signupRequest = new SignupRequest();

			signupRequest.setUsername("super_admin");
			signupRequest.setFirstName("Admin");
			signupRequest.setLastName("");
			signupRequest.setEmail("admin@example.com");
			signupRequest.setPassword("admin123");
			signupRequest.setMobileNo("9999999999");
			signupRequest.setMiddleName("");

			authService.createAdmin(signupRequest);
		}

	}
}
