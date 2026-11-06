package com.beckn.skill_verification.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "verification_history", indexes = {
    @Index(name = "idx_vh_transaction_id", columnList = "transactionId"),
    @Index(name = "idx_vh_candidate_id", columnList = "candidateId")
})
public class VerificationHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long candidateId;
    private Long skillId;
    
    private String status; // FAILED, PARTIALLY_VERIFIED, VERIFIED
    private Integer confidence;
    private String competencyLevel;
    private String provider; // e.g., ONEST, MOCK
    private String transactionId; // Reference to BecknTransaction

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
