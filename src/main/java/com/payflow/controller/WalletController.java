package com.payflow.controller;

import com.payflow.dto.request.DepositRequest;
import com.payflow.dto.request.WithdrawalRequest;
import com.payflow.dto.response.WalletResponse;
import com.payflow.dto.response.WalletTransactionResponse;
import com.payflow.service.WalletService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallets")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WalletResponse createWallet(Authentication authentication) {

        return walletService.createWallet(authentication.getName());
    }

    @GetMapping("/me")
    public WalletResponse getMyWallet(Authentication authentication) {

        return walletService.getMyWallet(authentication.getName());
    }

    @PostMapping("/me/deposit")
    public WalletResponse deposit(
            Authentication authentication,
            @Valid @RequestBody DepositRequest request) {

        return walletService.deposit(
                authentication.getName(),
                request
        );
    }

    @PostMapping("/me/withdraw")
    public WalletResponse withdraw(
            Authentication authentication,
            @Valid @RequestBody WithdrawalRequest request) {

        return walletService.withdraw(
                authentication.getName(),
                request
        );
    }

    @GetMapping("/me/transactions")
    public List<WalletTransactionResponse> getTransactions(
            Authentication authentication) {

        return walletService.getTransactionHistory(
                authentication.getName()
        );
    }
}