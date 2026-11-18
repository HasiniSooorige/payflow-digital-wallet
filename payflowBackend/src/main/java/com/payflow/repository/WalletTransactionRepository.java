package com.payflow.repository;

import com.payflow.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WalletTransactionRepository
        extends JpaRepository<WalletTransaction, Long> {

    List<WalletTransaction>
    findByWallet_IdOrderByCreatedAtDesc(Long walletId);
}