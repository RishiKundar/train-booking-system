package com.trainbooking.userservice.role.repo;

import com.trainbooking.userservice.role.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role,Long> {

    Optional<Role> findByRole(String role);
}
