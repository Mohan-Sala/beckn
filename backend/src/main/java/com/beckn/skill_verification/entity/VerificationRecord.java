package com.beckn.skill_verification.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "verification_record", indexes = {
    @Index(name = "idx_vr_candidate_skill", columnList = "candidateId, skillId")
})
public class VerificationRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long candidateId;
    private Long skillId;
    
    private String credentialStatus; // e.g. "VERIFIED", "FAILED"
    private String educationStatus;
    private String assessmentStatus;
    
    private Integer confidenceScore;
    private String competencyLevel;
    
    private String finalStatus;
    private LocalDateTime verifiedAt;
}
