package com.payflow.repository;

import com.payflow.entity.Wallet;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {

    boolean existsByUser_Id(Long userId);

    Optional<Wallet> findByUser_Email(String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT w
        FROM Wallet w
        JOIN FETCH w.user u
        WHERE u.email = :email
    """)
    Optional<Wallet> findByUserEmailForUpdate(
            @Param("email") String email
    );
}