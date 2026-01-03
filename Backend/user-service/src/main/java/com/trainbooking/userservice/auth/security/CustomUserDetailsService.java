package com.trainbooking.userservice.auth.security;

import com.trainbooking.userservice.user.entity.User;
import com.trainbooking.userservice.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        Optional<User> userOptional = userRepository.findByEmailId(username);

        return userOptional.map(CustomUserDetails::new).orElseThrow(() -> new UsernameNotFoundException("User not Found"));
    }
}
