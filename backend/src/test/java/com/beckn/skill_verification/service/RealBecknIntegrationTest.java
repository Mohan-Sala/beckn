package com.beckn.skill_verification.service;

import com.beckn.skill_verification.controller.BecknBppController;
import com.beckn.skill_verification.controller.BecknController;
import com.beckn.skill_verification.dto.beckn.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;

class RealBecknIntegrationTest {

    private BecknAuthService authService;
    private BecknController bapController;
    private BecknBppController bppController;

    private AtomicReference<String> lastOnSearchTx = new AtomicReference<>();
    private AtomicReference<String> lastOnSearchProvider = new AtomicReference<>();
    private AtomicReference<String> lastOnConfirmTx = new AtomicReference<>();
    private AtomicInteger lastOnConfirmScore = new AtomicInteger();

    @BeforeEach
    void setUp() {
        authService = new BecknAuthService();
        ReflectionTestUtils.setField(authService, "bapId", "skill-verification-bap.onest.network");
        ReflectionTestUtils.setField(authService, "keyId", "key-1");
        authService.init();

        // Plain Java test implementation without dynamic bytecode proxies
        VerificationService testVerificationService = new VerificationService(
                null, null, null, null, null, null, null, null, null
        ) {
            @Override
            public void processOnSearch(String transactionId, String providerId) {
                lastOnSearchTx.set(transactionId);
                lastOnSearchProvider.set(providerId);
            }

            @Override
            public void processOnInit(String transactionId) {
            }

            @Override
            public void processOnConfirm(String transactionId, String status, int score) {
                lastOnConfirmTx.set(transactionId);
                lastOnConfirmScore.set(score);
            }
        };

        bapController = new BecknController(null, testVerificationService);
        bppController = new BecknBppController(authService, null, null);
    }

    @Test
    void testBppSearchHandshakeAndAck() {
        String txId = UUID.randomUUID().toString();
        BecknContext context = BecknContext.builder()
                .domain("onest:work-opportunities")
                .action("search")
                .bapId("skill-verification-bap.onest.network")
                .bapUri("http://localhost:8080/api/beckn")
                .transactionId(txId)
                .messageId(UUID.randomUUID().toString())
                .build();

        BecknEnvelope searchRequest = BecknEnvelope.builder()
                .context(context)
                .message(BecknMessage.builder()
                        .intent(BecknIntent.builder()
                                .item(BecknItem.builder()
                                        .descriptor(BecknDescriptor.builder().name("Java").build())
                                        .build())
                                .build())
                        .build())
                .build();

        ResponseEntity<BecknEnvelope> ackResponse = bppController.search(Collections.emptyMap(), searchRequest);

        assertNotNull(ackResponse);
        assertEquals(200, ackResponse.getStatusCode().value());
        assertNotNull(ackResponse.getBody());
        assertEquals("ACK", ackResponse.getBody().getMessage().getAck().getStatus());
    }

    @Test
    void testBapOnSearchCallbackProcessing() {
        String txId = UUID.randomUUID().toString();
        BecknContext callbackCtx = BecknContext.builder()
                .domain("onest:work-opportunities")
                .action("on_search")
                .bapId("skill-verification-bap.onest.network")
                .bppId("onest-skill-registry-bpp")
                .transactionId(txId)
                .build();

        BecknCatalog catalog = BecknCatalog.builder()
                .bppProviders(Collections.singletonList(
                        BecknProvider.builder()
                                .id("provider-onest-01")
                                .descriptor(BecknDescriptor.builder().name("ONEST Skills Authority").build())
                                .build()
                ))
                .build();

        BecknEnvelope onSearchPayload = BecknEnvelope.builder()
                .context(callbackCtx)
                .message(BecknMessage.builder().catalog(catalog).build())
                .build();

        Map<String, String> headers = new HashMap<>();
        headers.put("authorization", "Signature keyId=mock");

        ResponseEntity<BecknEnvelope> response = bapController.onSearch(headers, onSearchPayload);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("ACK", response.getBody().getMessage().getAck().getStatus());

        assertEquals(txId, lastOnSearchTx.get());
        assertEquals("provider-onest-01", lastOnSearchProvider.get());
    }

    @Test
    void testBapOnConfirmCallbackProcessing() {
        String txId = UUID.randomUUID().toString();
        BecknContext callbackCtx = BecknContext.builder()
                .domain("onest:work-opportunities")
                .action("on_confirm")
                .bapId("skill-verification-bap.onest.network")
                .transactionId(txId)
                .build();

        Map<String, Object> tags = new HashMap<>();
        tags.put("confidenceScore", 95);
        tags.put("competencyLevel", "Advanced");

        BecknOrder order = BecknOrder.builder()
                .id("ORDER_123")
                .state("VERIFIED")
                .tags(tags)
                .build();

        BecknEnvelope onConfirmPayload = BecknEnvelope.builder()
                .context(callbackCtx)
                .message(BecknMessage.builder().order(order).build())
                .build();

        ResponseEntity<BecknEnvelope> response = bapController.onConfirm(Collections.emptyMap(), onConfirmPayload);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("ACK", response.getBody().getMessage().getAck().getStatus());

        assertEquals(txId, lastOnConfirmTx.get());
        assertEquals(95, lastOnConfirmScore.get());
    }
}
