package com.beckn.skill_verification.controller;

import com.beckn.skill_verification.dto.beckn.BecknAck;
import com.beckn.skill_verification.dto.beckn.BecknEnvelope;
import com.beckn.skill_verification.dto.beckn.BecknMessage;
import com.beckn.skill_verification.dto.beckn.BecknProvider;
import com.beckn.skill_verification.entity.BecknTransaction;
import com.beckn.skill_verification.repository.BecknTransactionRepository;
import com.beckn.skill_verification.service.VerificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/beckn")
@RequiredArgsConstructor
public class BecknController {

    private final BecknTransactionRepository transactionRepository;
    private final VerificationService verificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Inbound callback from Beckn Gateway / BPP for '/search' discovery
     */
    @PostMapping("/on_search")
    public ResponseEntity<BecknEnvelope> onSearch(
            @RequestHeader Map<String, String> headers,
            @RequestBody BecknEnvelope payload) {
        
        log.info("Received Beckn '/on_search' callback. Authorization: {}", headers.get("authorization"));

        if (payload != null && payload.getContext() != null) {
            String txId = payload.getContext().getTransactionId();
            String providerId = "onest-registry-provider";

            try {
                if (payload.getMessage() != null 
                        && payload.getMessage().getCatalog() != null 
                        && payload.getMessage().getCatalog().getBppProviders() != null 
                        && !payload.getMessage().getCatalog().getBppProviders().isEmpty()) {
                    BecknProvider provider = payload.getMessage().getCatalog().getBppProviders().get(0);
                    providerId = provider.getId();
                }
            } catch (Exception e) {
                log.warn("Could not extract provider from catalog: {}", e.getMessage());
            }

            log.info("Processing 'on_search' for transaction: {}, provider: {}", txId, providerId);
            verificationService.processOnSearch(txId, providerId);
        }

        return ResponseEntity.ok(buildAckEnvelope("on_search"));
    }

    /**
     * Inbound callback from Beckn Gateway / BPP for '/init'
     */
    @PostMapping("/on_init")
    public ResponseEntity<BecknEnvelope> onInit(
            @RequestHeader Map<String, String> headers,
            @RequestBody BecknEnvelope payload) {
        
        log.info("Received Beckn '/on_init' callback for transaction: {}", 
                payload != null && payload.getContext() != null ? payload.getContext().getTransactionId() : "unknown");

        if (payload != null && payload.getContext() != null) {
            String txId = payload.getContext().getTransactionId();
            verificationService.processOnInit(txId);
        }

        return ResponseEntity.ok(buildAckEnvelope("on_init"));
    }

    /**
     * Inbound callback from Beckn Gateway / BPP for '/confirm'
     */
    @PostMapping("/on_confirm")
    public ResponseEntity<BecknEnvelope> onConfirm(
            @RequestHeader Map<String, String> headers,
            @RequestBody BecknEnvelope payload) {
        
        log.info("Received Beckn '/on_confirm' callback for transaction: {}", 
                payload != null && payload.getContext() != null ? payload.getContext().getTransactionId() : "unknown");

        if (payload != null && payload.getContext() != null) {
            String txId = payload.getContext().getTransactionId();
            String status = "VERIFIED";
            int score = 95;

            try {
                if (payload.getMessage() != null && payload.getMessage().getOrder() != null) {
                    var order = payload.getMessage().getOrder();
                    if (order.getState() != null) {
                        status = order.getState();
                    }
                    if (order.getTags() != null && order.getTags().containsKey("confidenceScore")) {
                        Object scoreObj = order.getTags().get("confidenceScore");
                        score = Integer.parseInt(scoreObj.toString());
                    }
                }
            } catch (Exception e) {
                log.warn("Could not parse order state/score: {}", e.getMessage());
            }

            verificationService.processOnConfirm(txId, status, score);
        }

        return ResponseEntity.ok(buildAckEnvelope("on_confirm"));
    }

    private BecknEnvelope buildAckEnvelope(String action) {
        return BecknEnvelope.builder()
                .message(BecknMessage.builder()
                        .ack(BecknAck.builder().status("ACK").build())
                        .build())
                .build();
    }

    // Retained for Mock simulation backwards compatibility
    public void handleOnSearch(String transactionId, String providerId, String message) {
        log.info("Mock callback handleOnSearch for transaction: {}", transactionId);
        verificationService.processOnSearch(transactionId, providerId);
    }

    public void handleOnInit(String transactionId, String message) {
        log.info("Mock callback handleOnInit for transaction: {}", transactionId);
        verificationService.processOnInit(transactionId);
    }

    public void handleOnConfirm(String transactionId, String status, int confidenceScore) {
        log.info("Mock callback handleOnConfirm for transaction: {}", transactionId);
        verificationService.processOnConfirm(transactionId, status, confidenceScore);
    }
}
