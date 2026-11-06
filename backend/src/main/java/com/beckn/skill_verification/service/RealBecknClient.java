package com.beckn.skill_verification.service;

import com.beckn.skill_verification.dto.beckn.*;
import com.beckn.skill_verification.entity.BecknTransaction;
import com.beckn.skill_verification.repository.BecknTransactionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class RealBecknClient implements BecknClient {

    private final BecknAuthService becknAuthService;
    private final BecknTransactionRepository transactionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${beckn.gateway-url:http://localhost:8080/api/bpp}")
    private String gatewayUrl;

    @Value("${beckn.bap-id:skill-verification-bap.onest.network}")
    private String bapId;

    @Value("${beckn.bap-uri:http://localhost:8080/api/beckn}")
    private String bapUri;

    @Value("${beckn.domain:onest:work-opportunities}")
    private String domain;

    private final RestTemplate restTemplate = createPooledRestTemplate();

    private static RestTemplate createPooledRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(8000);
        factory.setReadTimeout(12000);
        return new RestTemplate(factory);
    }

    @Override
    public void search(String candidateId, String skillName, String transactionId) {
        String messageId = UUID.randomUUID().toString();
        log.info("REAL BECKN CLIENT: Dispatching '/search' for skill '{}' to Gateway: {}", skillName, gatewayUrl);

        try {
            BecknContext context = BecknContext.builder()
                    .domain(domain)
                    .country("IND")
                    .city("std:080")
                    .action("search")
                    .coreVersion("1.1.0")
                    .bapId(bapId)
                    .bapUri(bapUri)
                    .transactionId(transactionId)
                    .messageId(messageId)
                    .timestamp(Instant.now().toString())
                    .ttl("PT30S")
                    .build();

            BecknIntent intent = BecknIntent.builder()
                    .item(BecknItem.builder()
                            .descriptor(BecknDescriptor.builder().name(skillName).build())
                            .tags(Map.of("candidateId", candidateId))
                            .build())
                    .build();

            BecknEnvelope envelope = BecknEnvelope.builder()
                    .context(context)
                    .message(BecknMessage.builder().intent(intent).build())
                    .build();

            String jsonPayload = objectMapper.writeValueAsString(envelope);
            sendBecknRequest("/search", jsonPayload, transactionId, messageId, "search");

        } catch (Exception e) {
            log.error("Failed to construct or send Beckn 'search' request: {}", e.getMessage(), e);
        }
    }

    @Override
    public void init(String transactionId, String providerId, String credentialId) {
        String messageId = UUID.randomUUID().toString();
        log.info("REAL BECKN CLIENT: Dispatching '/init' for provider '{}' to Gateway: {}", providerId, gatewayUrl);

        try {
            BecknContext context = BecknContext.builder()
                    .domain(domain)
                    .country("IND")
                    .city("std:080")
                    .action("init")
                    .coreVersion("1.1.0")
                    .bapId(bapId)
                    .bapUri(bapUri)
                    .bppId(providerId)
                    .transactionId(transactionId)
                    .messageId(messageId)
                    .timestamp(Instant.now().toString())
                    .ttl("PT30S")
                    .build();

            BecknOrder order = BecknOrder.builder()
                    .provider(BecknProvider.builder().id(providerId).build())
                    .items(List.of(BecknItem.builder()
                            .id("VERIFY_ITEM_1")
                            .tags(Map.of("credentialId", credentialId, "consent", "true"))
                            .build()))
                    .build();

            BecknEnvelope envelope = BecknEnvelope.builder()
                    .context(context)
                    .message(BecknMessage.builder().order(order).build())
                    .build();

            String jsonPayload = objectMapper.writeValueAsString(envelope);
            sendBecknRequest("/init", jsonPayload, transactionId, messageId, "init");

        } catch (Exception e) {
            log.error("Failed to construct or send Beckn 'init' request: {}", e.getMessage(), e);
        }
    }

    @Override
    public void confirm(String transactionId, String providerId, String credentialId) {
        String messageId = UUID.randomUUID().toString();
        log.info("REAL BECKN CLIENT: Dispatching '/confirm' for transaction '{}' to Gateway: {}", transactionId, gatewayUrl);

        try {
            BecknContext context = BecknContext.builder()
                    .domain(domain)
                    .country("IND")
                    .city("std:080")
                    .action("confirm")
                    .coreVersion("1.1.0")
                    .bapId(bapId)
                    .bapUri(bapUri)
                    .bppId(providerId)
                    .transactionId(transactionId)
                    .messageId(messageId)
                    .timestamp(Instant.now().toString())
                    .ttl("PT30S")
                    .build();

            BecknOrder order = BecknOrder.builder()
                    .id("ORDER_" + UUID.randomUUID().toString().substring(0, 8))
                    .state("ACCEPTED")
                    .provider(BecknProvider.builder().id(providerId).build())
                    .items(List.of(BecknItem.builder()
                            .id("VERIFY_ITEM_1")
                            .tags(Map.of("credentialId", credentialId, "evidenceVerified", "true"))
                            .build()))
                    .build();

            BecknEnvelope envelope = BecknEnvelope.builder()
                    .context(context)
                    .message(BecknMessage.builder().order(order).build())
                    .build();

            String jsonPayload = objectMapper.writeValueAsString(envelope);
            sendBecknRequest("/confirm", jsonPayload, transactionId, messageId, "confirm");

        } catch (Exception e) {
            log.error("Failed to construct or send Beckn 'confirm' request: {}", e.getMessage(), e);
        }
    }

    private void sendBecknRequest(String endpoint, String jsonPayload, String transactionId, String messageId, String action) {
        String targetUrl = gatewayUrl.replaceAll("/+$", "") + endpoint;

        // Generate Ed25519 authorization headers & BLAKE/SHA digest
        Map<String, String> authHeaders = becknAuthService.generateAuthHeaders("POST", endpoint, jsonPayload);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        authHeaders.forEach(headers::set);

        HttpEntity<String> requestEntity = new HttpEntity<>(jsonPayload, headers);

        // Record in Database
        try {
            BecknTransaction tx = new BecknTransaction();
            tx.setTransactionId(transactionId);
            tx.setMessageId(messageId);
            tx.setAction(action);
            tx.setSender(bapId);
            tx.setReceiver(gatewayUrl);
            tx.setStatus("SENT");
            tx.setRequestPayload(jsonPayload);
            transactionRepository.save(tx);
        } catch (Exception e) {
            log.warn("Failed to persist BecknTransaction log: {}", e.getMessage());
        }

        try {
            log.info("Sending HTTP POST to Beckn Gateway: {} with Ed25519 Signature", targetUrl);
            ResponseEntity<String> response = this.restTemplate.postForEntity(targetUrl, requestEntity, String.class);
            log.info("Beckn Gateway responded with HTTP Status: {}, Body: {}", response.getStatusCode(), response.getBody());
        } catch (Exception e) {
            log.error("HTTP error sending Beckn request to {}: {}", targetUrl, e.getMessage());
        }
    }
}
