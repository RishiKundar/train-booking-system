package com.trainbooking.userservice.user.entity;


import com.trainbooking.userservice.role.entity.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users",
        indexes = {
            @Index(name = "idx_users_email", columnList = "email_id"),
            @Index(name = "idx_users_mobile", columnList = "mobile_no")
        },
        schema = "user_service"
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "UUID")
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "middle_name", length = 100)
    private String middleName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "email_id", nullable = false, unique = true, length = 150)
    private String emailId;

    @Column(name = "mobile_no", nullable = false, unique = true, length = 20)
    private String mobileNo;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(name = "is_mobile_verified")
    private Boolean isMobileVerified = false;

    @Column(name = "is_email_verified")
    private Boolean isEmailVerified = false;

    @Column(name = "active_flag")
    private Boolean activeFlag = true;

    @Column(name = "is_account_locked")
    private Boolean isAccountLocked = false;

    @Column(name = "incorrect_password_cnt")
    private Integer incorrectPasswordCnt = 0;

    @Column(name = "acc_unlock_time")
    private LocalDateTime accUnlockTime;

    @Column(name = "password_last_changed")
    private LocalDateTime passwordLastChanged;

    @Column(name = "created_date", nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"),
            schema = "user_service"
    )
    private Set<Role> roles;

    @PrePersist
    protected void onCreate(){
        this.createdDate = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate(){
        this.updatedDate = LocalDateTime.now();
    }

}
