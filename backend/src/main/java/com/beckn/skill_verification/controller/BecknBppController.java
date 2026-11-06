package com.beckn.skill_verification.controller;

import com.beckn.skill_verification.dto.beckn.*;
import com.beckn.skill_verification.service.BecknAuthService;
import com.beckn.skill_verification.service.QrCertificateVerificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Slf4j
@RestController
@RequestMapping("/api/bpp")
public class BecknBppController {

    private final BecknAuthService becknAuthService;
    private final QrCertificateVerificationService qrService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ScheduledExecutorService scheduler;
    private final RestTemplate restTemplate;

    @Autowired
    public BecknBppController(BecknAuthService becknAuthService, QrCertificateVerificationService qrService) {
        this(becknAuthService, qrService, Executors.newScheduledThreadPool(
                Math.max(16, Runtime.getRuntime().availableProcessors() * 4), r -> {
            Thread t = new Thread(r);
            t.setName("bpp-async-worker-" + t.getId());
            t.setDaemon(true);
            return t;
        }));
    }

    public BecknBppController(BecknAuthService becknAuthService, QrCertificateVerificationService qrService, ScheduledExecutorService scheduler) {
        this.becknAuthService = becknAuthService;
        this.qrService = qrService;
        this.scheduler = scheduler;
        
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);
        this.restTemplate = new RestTemplate(factory);
    }

    /**
     * Provider endpoint for /search
     */
    @PostMapping("/search")
    public ResponseEntity<BecknEnvelope> search(
            @RequestHeader Map<String, String> headers,
            @RequestBody BecknEnvelope request) {
        
        log.info("BPP NODE: Received '/search' from BAP: {}", 
                request.getContext() != null ? request.getContext().getBapId() : "unknown");

        // Schedule async callback to BAP /on_search after 600ms
        if (scheduler != null) {
            scheduler.schedule(() -> {
                try {
                    sendOnSearchCallback(request);
                } catch (Exception e) {
                    log.error("BPP NODE: Failed to send /on_search callback: {}", e.getMessage(), e);
                }
            }, 600, TimeUnit.MILLISECONDS);
        }

        return ResponseEntity.ok(buildAck());
    }

    /**
     * Provider endpoint for /init
     */
    @PostMapping("/init")
    public ResponseEntity<BecknEnvelope> init(
            @RequestHeader Map<String, String> headers,
            @RequestBody BecknEnvelope request) {
        
        log.info("BPP NODE: Received '/init' from BAP for transaction: {}", 
                request.getContext() != null ? request.getContext().getTransactionId() : "unknown");

        if (scheduler != null) {
            scheduler.schedule(() -> {
                try {
                    sendOnInitCallback(request);
                } catch (Exception e) {
                    log.error("BPP NODE: Failed to send /on_init callback: {}", e.getMessage(), e);
                }
            }, 600, TimeUnit.MILLISECONDS);
        }

        return ResponseEntity.ok(buildAck());
    }

    /**
     * Provider endpoint for /confirm
     */
    @PostMapping("/confirm")
    public ResponseEntity<BecknEnvelope> confirm(
            @RequestHeader Map<String, String> headers,
            @RequestBody BecknEnvelope request) {
        
        log.info("BPP NODE: Received '/confirm' from BAP for transaction: {}", 
                request.getContext() != null ? request.getContext().getTransactionId() : "unknown");

        if (scheduler != null) {
            scheduler.schedule(() -> {
                try {
                    sendOnConfirmCallback(request);
                } catch (Exception e) {
                    log.error("BPP NODE: Failed to send /on_confirm callback: {}", e.getMessage(), e);
                }
            }, 600, TimeUnit.MILLISECONDS);
        }

        return ResponseEntity.ok(buildAck());
    }

    private void sendOnSearchCallback(BecknEnvelope request) throws Exception {
        BecknContext reqCtx = request.getContext();
        String bapUri = reqCtx.getBapUri();
        String targetUrl = bapUri.replaceAll("/+$", "") + "/on_search";

        String skillName = "Certified Skill";
        try {
            if (request.getMessage() != null && request.getMessage().getIntent() != null
                    && request.getMessage().getIntent().getItem() != null
                    && request.getMessage().getIntent().getItem().getDescriptor() != null) {
                skillName = request.getMessage().getIntent().getItem().getDescriptor().getName();
            }
        } catch (Exception ignored) {}

        BecknContext callbackCtx = BecknContext.builder()
                .domain(reqCtx.getDomain())
                .country("IND")
                .city("std:080")
                .action("on_search")
                .coreVersion(reqCtx.getCoreVersion())
                .bapId(reqCtx.getBapId())
                .bapUri(bapUri)
                .bppId("onest-skill-registry-bpp")
                .bppUri("http://localhost:8080/api/bpp")
                .transactionId(reqCtx.getTransactionId())
                .messageId(UUID.randomUUID().toString())
                .timestamp(Instant.now().toString())
                .ttl("PT30S")
                .build();

        BecknProvider provider = BecknProvider.builder()
                .id("onest-accredited-registry-1")
                .descriptor(BecknDescriptor.builder()
                        .name("ONEST National Credential & Skill Verification Authority")
                        .code("ONEST_NSDC_REGISTRY")
                        .build())
                .items(List.of(BecknItem.builder()
                        .id("SKILL_VERIFY_" + skillName.toUpperCase().replaceAll("\\s+", "_"))
                        .descriptor(BecknDescriptor.builder().name(skillName).build())
                        .tags(Map.of("network", "ONEST", "verificationStandard", "W3C-VC-1.0"))
                        .build()))
                .build();

        BecknCatalog catalog = BecknCatalog.builder()
                .bppDescriptor(BecknDescriptor.builder()
                        .name("ONEST Open Skill Registry BPP")
                        .code("ONEST_BPP_01")
                        .build())
                .bppProviders(List.of(provider))
                .build();

        BecknEnvelope envelope = BecknEnvelope.builder()
                .context(callbackCtx)
                .message(BecknMessage.builder().catalog(catalog).build())
                .build();

        sendCallback(targetUrl, "/on_search", envelope);
    }

    private void sendOnInitCallback(BecknEnvelope request) throws Exception {
        BecknContext reqCtx = request.getContext();
        String targetUrl = reqCtx.getBapUri().replaceAll("/+$", "") + "/on_init";

        BecknContext callbackCtx = BecknContext.builder()
                .domain(reqCtx.getDomain())
                .country("IND")
                .city("std:080")
                .action("on_init")
                .coreVersion(reqCtx.getCoreVersion())
                .bapId(reqCtx.getBapId())
                .bapUri(reqCtx.getBapUri())
                .bppId("onest-skill-registry-bpp")
                .bppUri("http://localhost:8080/api/bpp")
                .transactionId(reqCtx.getTransactionId())
                .messageId(UUID.randomUUID().toString())
                .timestamp(Instant.now().toString())
                .ttl("PT30S")
                .build();

        BecknEnvelope envelope = BecknEnvelope.builder()
                .context(callbackCtx)
                .message(BecknMessage.builder()
                        .order(BecknOrder.builder()
                                .state("INITIALIZED")
                                .tags(Map.of("termsAccepted", "true", "consentRecorded", "true"))
                                .build())
                        .build())
                .build();

        sendCallback(targetUrl, "/on_init", envelope);
    }

    private void sendOnConfirmCallback(BecknEnvelope request) throws Exception {
        BecknContext reqCtx = request.getContext();
        String targetUrl = reqCtx.getBapUri().replaceAll("/+$", "") + "/on_confirm";

        BecknContext callbackCtx = BecknContext.builder()
                .domain(reqCtx.getDomain())
                .country("IND")
                .city("std:080")
                .action("on_confirm")
                .coreVersion(reqCtx.getCoreVersion())
                .bapId(reqCtx.getBapId())
                .bapUri(reqCtx.getBapUri())
                .bppId("onest-skill-registry-bpp")
                .bppUri("http://localhost:8080/api/bpp")
                .transactionId(reqCtx.getTransactionId())
                .messageId(UUID.randomUUID().toString())
                .timestamp(Instant.now().toString())
                .ttl("PT30S")
                .build();

        String credentialId = "";
        try {
            if (request.getMessage() != null && request.getMessage().getOrder() != null
                    && request.getMessage().getOrder().getItems() != null
                    && !request.getMessage().getOrder().getItems().isEmpty()) {
                var item = request.getMessage().getOrder().getItems().get(0);
                if (item.getTags() != null && item.getTags().containsKey("credentialId")) {
                    credentialId = String.valueOf(item.getTags().get("credentialId")).trim();
                }
            }
        } catch (Exception ignored) {}

        log.info("BPP NODE: Evaluating credential ID '{}' against ONEST registry", credentialId);

        String verdictState = "NOT VERIFIED";
        int confidenceScore = 20;
        String competencyLevel = "Unverified";
        String verifiableCredentialUri = "REJECTED: No credential ID provided for ONEST verification";

        // Perform real validation if credentialId is present and qrService is injected
        if (qrService != null && !credentialId.isBlank() && !"N/A".equalsIgnoreCase(credentialId)) {
            try {
                var qrRes = qrService.verifyQrPayload(credentialId);
                if (qrRes.isValid()) {
                    verdictState = "VERIFIED";
                    confidenceScore = 95;
                    competencyLevel = "Advanced";
                    verifiableCredentialUri = "urn:onest:credential:registry:" + UUID.randomUUID();
                    log.info("BPP NODE: Credential '{}' validated successfully: {}", credentialId, qrRes.getStatus());
                } else {
                    verdictState = "NOT VERIFIED";
                    confidenceScore = 15;
                    competencyLevel = "Unverified";
                    verifiableCredentialUri = "REJECTED: " + qrRes.getVerificationDetails();
                    log.warn("BPP NODE: Credential '{}' rejected: {}", credentialId, qrRes.getStatus());
                }
            } catch (Exception e) {
                log.warn("BPP NODE: Error verifying credential: {}", e.getMessage());
            }
        }

        BecknEnvelope envelope = BecknEnvelope.builder()
                .context(callbackCtx)
                .message(BecknMessage.builder()
                        .order(BecknOrder.builder()
                                .id("ONEST_CONFIRM_" + UUID.randomUUID().toString().substring(0, 8))
                                .state(verdictState)
                                .tags(Map.of(
                                        "confidenceScore", confidenceScore,
                                        "competencyLevel", competencyLevel,
                                        "credentialRegistry", "ONEST Open Network",
                                        "verifiableCredentialUri", verifiableCredentialUri
                                ))
                                .build())
                        .build())
                .build();

        sendCallback(targetUrl, "/on_confirm", envelope);
    }

    private void sendCallback(String targetUrl, String endpoint, BecknEnvelope envelope) {
        try {
            String jsonPayload = objectMapper.writeValueAsString(envelope);
            Map<String, String> authHeaders = becknAuthService.generateAuthHeaders("POST", endpoint, jsonPayload);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            authHeaders.forEach(headers::set);

            HttpEntity<String> entity = new HttpEntity<>(jsonPayload, headers);
            log.info("BPP NODE: Sending real HTTP callback to {} with signed Ed25519 headers", targetUrl);
            this.restTemplate.postForEntity(targetUrl, entity, String.class);
            log.info("BPP NODE: Callback delivered successfully to {}", targetUrl);
        } catch (Exception e) {
            log.error("BPP NODE: Error delivering callback to {}: {}", targetUrl, e.getMessage());
        }
    }

    @PreDestroy
    public void shutdown() {
        try {
            scheduler.shutdownNow();
        } catch (Exception ignored) {}
    }

    private BecknEnvelope buildAck() {
        return BecknEnvelope.builder()
                .message(BecknMessage.builder()
                        .ack(BecknAck.builder().status("ACK").build())
                        .build())
                .build();
    }
}
