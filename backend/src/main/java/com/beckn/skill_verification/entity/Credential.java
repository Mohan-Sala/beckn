package com.beckn.skill_verification.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "credential", indexes = {
    @Index(name = "idx_cred_candidate_skill", columnList = "candidateId, skillId"),
    @Index(name = "idx_cred_credential_id", columnList = "credentialId")
})
public class Credential {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long candidateId;
    private Long skillId;
    
    private String certificateName;
    private String credentialId;
    private String issuer;
    private String filePath;
    private String status; // "UPLOADED", "VERIFIED"
}
