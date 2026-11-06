package com.beckn.skill_verification.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "candidate_skill", indexes = {
    @Index(name = "idx_cs_candidate_skill", columnList = "candidateId, skillId"),
    @Index(name = "idx_cs_verification_status", columnList = "verificationStatus")
})
public class CandidateSkill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long candidateId; // userId of candidate
    private Long skillId;
    
    private String competencyLevel; // "Beginner", "Intermediate", "Advanced"
    private String verificationStatus; // "NOT VERIFIED", "PARTIALLY VERIFIED", "VERIFIED", "PENDING"
    private Integer confidenceScore; // 0-100
}
