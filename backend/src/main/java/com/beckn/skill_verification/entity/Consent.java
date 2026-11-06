package com.beckn.skill_verification.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "consent", indexes = {
    @Index(name = "idx_consent_cand_skill", columnList = "candidateId, skillId")
})
public class Consent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long candidateId;
    private Long skillId;
    
    private Boolean consentGiven;
    private LocalDateTime consentTimestamp;
}
