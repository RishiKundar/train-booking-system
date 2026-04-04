package com.trainbooking.userservice.user.repo;

import com.trainbooking.userservice.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailId(String emailId);

    boolean existsByEmailId(String emailId);

    boolean existsByUsername(String username);

    boolean existsByMobileNo(String mobileNo);

}
