package com.beckn.skill_verification.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "beckn_transaction", indexes = {
    @Index(name = "idx_bt_tx_action", columnList = "transactionId, action"),
    @Index(name = "idx_bt_message_id", columnList = "messageId")
})
public class BecknTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String transactionId;
    
    @Column(nullable = false)
    private String messageId;
    
    private String action; // e.g., "search", "on_search", "init", "on_init"
    private String sender;
    private String receiver;
    private String status; // e.g., "SENT", "ACK", "CALLBACK_RECEIVED", "FAILED"
    
    @Column(columnDefinition = "TEXT")
    private String requestPayload;
    
    @Column(columnDefinition = "TEXT")
    private String responsePayload;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
