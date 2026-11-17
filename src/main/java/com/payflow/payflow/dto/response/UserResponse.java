package com.payflow.payflow.dto.response;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String phoneNumber,
        LocalDateTime createdAt
) {
}