package com.payflow.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record WalletResponse(
        Long walletId,
        BigDecimal balance,
        String currency,
        LocalDateTime createdAt
) {
}