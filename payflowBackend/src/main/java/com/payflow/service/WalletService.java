package com.payflow.service;

import com.payflow.dto.request.DepositRequest;
import com.payflow.dto.request.WithdrawalRequest;
import com.payflow.dto.response.WalletResponse;
import com.payflow.dto.response.WalletTransactionResponse;
import com.payflow.entity.User;
import com.payflow.entity.Wallet;
import com.payflow.entity.WalletTransaction;
import com.payflow.enums.TransactionType;
import com.payflow.repository.UserRepository;
import com.payflow.repository.WalletRepository;
import com.payflow.repository.WalletTransactionRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public WalletService(
            WalletRepository walletRepository,
            WalletTransactionRepository transactionRepository,
            UserRepository userRepository) {

        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public WalletResponse createWallet(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));

        if (walletRepository.existsByUser_Id(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Wallet already exists"
            );
        }

        Wallet wallet = new Wallet();
        wallet.setUser(user);

        Wallet savedWallet = walletRepository.save(wallet);

        return mapToWalletResponse(savedWallet);
    }

    @Transactional(readOnly = true)
    public WalletResponse getMyWallet(String email) {

        Wallet wallet = walletRepository.findByUser_Email(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Wallet not found"
                ));

        return mapToWalletResponse(wallet);
    }

    @Transactional
    public WalletResponse deposit(
            String email,
            DepositRequest request) {

        Wallet wallet = getWalletForUpdate(email);

        BigDecimal newBalance =
                wallet.getBalance().add(request.amount());

        wallet.setBalance(newBalance);

        walletRepository.save(wallet);

        WalletTransaction transaction = new WalletTransaction(
                wallet,
                TransactionType.DEPOSIT,
                request.amount(),
                newBalance,
                request.description()
        );

        transactionRepository.save(transaction);

        return mapToWalletResponse(wallet);
    }

    @Transactional
    public WalletResponse withdraw(
            String email,
            WithdrawalRequest request) {

        Wallet wallet = getWalletForUpdate(email);

        if (wallet.getBalance().compareTo(request.amount()) < 0) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Insufficient wallet balance"
            );
        }

        BigDecimal newBalance =
                wallet.getBalance().subtract(request.amount());

        wallet.setBalance(newBalance);

        walletRepository.save(wallet);

        WalletTransaction transaction = new WalletTransaction(
                wallet,
                TransactionType.WITHDRAWAL,
                request.amount(),
                newBalance,
                request.description()
        );

        transactionRepository.save(transaction);

        return mapToWalletResponse(wallet);
    }

    @Transactional(readOnly = true)
    public List<WalletTransactionResponse> getTransactionHistory(
            String email) {

        Wallet wallet = walletRepository.findByUser_Email(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Wallet not found"
                ));

        return transactionRepository
                .findByWallet_IdOrderByCreatedAtDesc(wallet.getId())
                .stream()
                .map(this::mapToTransactionResponse)
                .toList();
    }

    private Wallet getWalletForUpdate(String email) {

        return walletRepository.findByUserEmailForUpdate(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Wallet not found"
                ));
    }

    private WalletResponse mapToWalletResponse(Wallet wallet) {

        return new WalletResponse(
                wallet.getId(),
                wallet.getBalance(),
                wallet.getCurrency(),
                wallet.getCreatedAt()
        );
    }

    private WalletTransactionResponse mapToTransactionResponse(
            WalletTransaction transaction) {

        return new WalletTransactionResponse(
                transaction.getId(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getBalanceAfter(),
                transaction.getDescription(),
                transaction.getCreatedAt()
        );
    }
}