package com.beckn.skill_verification.service;
import com.beckn.skill_verification.controller.BecknController;


import com.beckn.skill_verification.service.BecknClient;
import com.beckn.skill_verification.entity.BecknTransaction;
import com.beckn.skill_verification.repository.BecknTransactionRepository;
import com.beckn.skill_verification.entity.Consent;
import com.beckn.skill_verification.repository.ConsentRepository;
import com.beckn.skill_verification.entity.VerificationRecord;
import com.beckn.skill_verification.repository.VerificationRecordRepository;
import com.beckn.skill_verification.entity.VerificationHistory;
import com.beckn.skill_verification.repository.VerificationHistoryRepository;
import com.beckn.skill_verification.entity.Credential;
import com.beckn.skill_verification.repository.CredentialRepository;
import com.beckn.skill_verification.entity.CandidateSkill;
import com.beckn.skill_verification.repository.CandidateSkillRepository;
import com.beckn.skill_verification.entity.Skill;
import com.beckn.skill_verification.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VerificationService {

    private final CredentialRepository credentialRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final ConsentRepository consentRepository;
    private final VerificationRecordRepository verificationRecordRepository;
    private final VerificationHistoryRepository verificationHistoryRepository;
    private final SkillRepository skillRepository;
    private final BecknTransactionRepository becknTransactionRepository;

    private final BecknClient mockBecknClient;
    private final BecknClient realBecknClient;

    @Value("${app.integration.mode:MOCK}")
    private String integrationMode;

    public VerificationRecord verifySkill(Long candidateId, Long skillId) {
        // 1. Consent Validation
        Consent consent = consentRepository.findByCandidateIdAndSkillId(candidateId, skillId)
                .orElseThrow(() -> new RuntimeException("Consent not given for verification"));
        if (!consent.getConsentGiven()) {
            throw new RuntimeException("Consent not given for verification");
        }

        // 2. Credential Validation
        Credential credential = credentialRepository.findByCandidateIdAndSkillId(candidateId, skillId)
                .orElseThrow(() -> new RuntimeException("No credential uploaded for this skill"));
        
        Skill skill = skillRepository.findById(skillId).orElseThrow();

        // 3. Initialize Verification Record
        VerificationRecord record = verificationRecordRepository.findByCandidateIdAndSkillId(candidateId, skillId);
        if (record == null) {
            record = new VerificationRecord();
            record.setCandidateId(candidateId);
            record.setSkillId(skillId);
        }
        
        // Initial State Transition
        record.setFinalStatus("REQUESTED");
        record.setCredentialStatus("DISCOVERING");
        record.setEducationStatus("PENDING");
        record.setAssessmentStatus("PENDING");
        record.setConfidenceScore(0);
        record.setCompetencyLevel("UNKNOWN");
        record = verificationRecordRepository.save(record);
        
        updateCandidateSkillStatus(candidateId, skillId, "REQUESTED", 0, "UNKNOWN");

        // 4. Create Beckn Transaction
        String txId = UUID.randomUUID().toString();
        BecknTransaction tx = new BecknTransaction();
        tx.setTransactionId(txId);
        tx.setMessageId(UUID.randomUUID().toString());
        tx.setAction("search");
        tx.setSender("SKILL_VERIFICATION_BAP");
        tx.setReceiver("ONEST_BGN");
        tx.setStatus("SENT");
        tx.setRequestPayload(String.format("{\"candidateId\": %d, \"skillId\": %d, \"credentialId\": \"%s\"}", candidateId, skillId, credential.getCredentialId()));
        becknTransactionRepository.save(tx);
        
        // Save initial history
        VerificationHistory history = new VerificationHistory();
        history.setCandidateId(candidateId);
        history.setSkillId(skillId);
        history.setTransactionId(txId);
        history.setStatus("REQUESTED");
        history.setProvider(integrationMode);
        verificationHistoryRepository.save(history);

        // 5. Route to correct client
        BecknClient client = "REAL".equalsIgnoreCase(integrationMode) ? realBecknClient : mockBecknClient;
        client.search(candidateId.toString(), skill.getName(), txId);

        return record;
    }

    // Callbacks from BecknController
    public void processOnSearch(String transactionId, String providerId) {
        BecknTransaction tx = becknTransactionRepository.findFirstByTransactionIdAndActionOrderByIdDesc(transactionId, "search").orElse(null);
        if (tx != null) {
            tx.setStatus("ACK");
            becknTransactionRepository.save(tx);
        }
        
        VerificationHistory history = verificationHistoryRepository.findFirstByTransactionIdOrderByCreatedAtDesc(transactionId)
                .orElse(null);
        if (history == null) {
            log.warn("processOnSearch: No history found for transaction {}", transactionId);
            return;
        }

        history.setStatus("DISCOVERING");
        history.setProvider(providerId);
        verificationHistoryRepository.save(history);
        
        VerificationRecord record = verificationRecordRepository.findByCandidateIdAndSkillId(history.getCandidateId(), history.getSkillId());
        if (record != null) {
            record.setFinalStatus("DISCOVERING");
            record.setCredentialStatus("PROVIDER_SELECTED");
            verificationRecordRepository.save(record);
        }
        
        updateCandidateSkillStatus(history.getCandidateId(), history.getSkillId(), "DISCOVERING", 0, "UNKNOWN");
        
        Credential credential = credentialRepository.findByCandidateIdAndSkillId(history.getCandidateId(), history.getSkillId()).orElse(null);
        String credId = (credential != null && credential.getCredentialId() != null) ? credential.getCredentialId() : "N/A";

        BecknClient client = "REAL".equalsIgnoreCase(integrationMode) ? realBecknClient : mockBecknClient;
        client.init(transactionId, providerId, credId);
    }

    public void processOnInit(String transactionId) {
        BecknTransaction tx = becknTransactionRepository.findFirstByTransactionIdAndActionOrderByIdDesc(transactionId, "init")
                .or(() -> becknTransactionRepository.findFirstByTransactionIdAndActionOrderByIdDesc(transactionId, "search"))
                .orElse(null);
        if (tx != null) {
            tx.setStatus("ACK");
            becknTransactionRepository.save(tx);
        }
        
        VerificationHistory history = verificationHistoryRepository.findFirstByTransactionIdOrderByCreatedAtDesc(transactionId)
                .orElse(null);
        if (history == null) {
            log.warn("processOnInit: No history found for transaction {}", transactionId);
            return;
        }

        history.setStatus("INITIALIZED");
        verificationHistoryRepository.save(history);
        
        VerificationRecord record = verificationRecordRepository.findByCandidateIdAndSkillId(history.getCandidateId(), history.getSkillId());
        if (record != null) {
            record.setFinalStatus("INITIALIZED");
            record.setCredentialStatus("IN_PROGRESS");
            verificationRecordRepository.save(record);
        }
        
        updateCandidateSkillStatus(history.getCandidateId(), history.getSkillId(), "INITIALIZED", 0, "UNKNOWN");
        
        Credential credential = credentialRepository.findByCandidateIdAndSkillId(history.getCandidateId(), history.getSkillId()).orElse(null);
        String credId = (credential != null && credential.getCredentialId() != null) ? credential.getCredentialId() : "N/A";
        String providerId = history.getProvider() != null ? history.getProvider() : "onest-skill-registry-bpp";

        BecknClient client = "REAL".equalsIgnoreCase(integrationMode) ? realBecknClient : mockBecknClient;
        client.confirm(transactionId, providerId, credId);
    }

    public void processOnConfirm(String transactionId, String verificationStatus, int score) {
        VerificationHistory history = verificationHistoryRepository.findFirstByTransactionIdOrderByCreatedAtDesc(transactionId)
                .orElse(null);
        if (history == null) {
            log.warn("processOnConfirm: No history found for transaction {}", transactionId);
            return;
        }
        
        boolean isApproved = "VERIFIED".equalsIgnoreCase(verificationStatus) || score >= 70;
        // Strictly less than 100 (capped at 95% maximum for approved, 20% for unapproved)
        int totalScore = isApproved ? Math.min(Math.max(score, 85), 95) : Math.min(score, 20);
        
        String competency = isApproved ? (totalScore >= 90 ? "Advanced" : "Intermediate") : "Unverified";
        String finalStatus = isApproved ? (totalScore >= 90 ? "VERIFIED" : "PARTIALLY VERIFIED") : "NOT VERIFIED";
        
        history.setStatus(finalStatus);
        history.setConfidence(totalScore);
        history.setCompetencyLevel(competency);
        history.setCompletedAt(LocalDateTime.now());
        verificationHistoryRepository.save(history);
        
        VerificationRecord record = verificationRecordRepository.findByCandidateIdAndSkillId(history.getCandidateId(), history.getSkillId());
        if (record != null) {
            record.setFinalStatus(finalStatus);
            record.setCredentialStatus(isApproved ? "VERIFIED" : "REJECTED");
            record.setEducationStatus(isApproved ? "VERIFIED" : "REJECTED");
            record.setAssessmentStatus(isApproved ? "VERIFIED" : "REJECTED");
            record.setConfidenceScore(totalScore);
            record.setCompetencyLevel(competency);
            record.setVerifiedAt(LocalDateTime.now());
            verificationRecordRepository.save(record);
        }
        
        updateCandidateSkillStatus(history.getCandidateId(), history.getSkillId(), finalStatus, totalScore, competency);
        
        Credential credential = credentialRepository.findByCandidateIdAndSkillId(history.getCandidateId(), history.getSkillId()).orElse(null);
        if (credential != null) {
            credential.setStatus(finalStatus);
            credentialRepository.save(credential);
        }
    }
    
    private void updateCandidateSkillStatus(Long candidateId, Long skillId, String status, int score, String competency) {
        CandidateSkill cs = candidateSkillRepository.findByCandidateIdAndSkillId(candidateId, skillId).orElse(null);
        if (cs != null) {
            cs.setVerificationStatus(status);
            cs.setConfidenceScore(score);
            cs.setCompetencyLevel(competency);
            candidateSkillRepository.save(cs);
        }
    }
}
