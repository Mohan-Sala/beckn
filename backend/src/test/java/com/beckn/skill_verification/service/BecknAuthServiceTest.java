package com.beckn.skill_verification.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class BecknAuthServiceTest {

    private BecknAuthService authService;

    @BeforeEach
    void setUp() {
        authService = new BecknAuthService();
        ReflectionTestUtils.setField(authService, "bapId", "skill-verification-bap.onest.network");
        ReflectionTestUtils.setField(authService, "keyId", "key-1");
        authService.init();
    }

    @Test
    void testEd25519KeyGeneration() {
        assertNotNull(authService.getPublicKey());
        assertFalse(authService.getPublicKey().isBlank());
        // Ed25519 public key should be 32 bytes (44 chars in base64)
        byte[] pubBytes = Base64.getDecoder().decode(authService.getPublicKey());
        assertEquals(32, pubBytes.length);
    }

    @Test
    void testDigestGeneration() {
        String body = "{\"context\":{\"action\":\"search\"}}";
        String digestHeader = authService.generateDigestHeader(body);
        assertNotNull(digestHeader);
        assertTrue(digestHeader.startsWith("SHA-256="));
    }

    @Test
    void testAuthorizationHeaderGenerationAndVerification() {
        String body = "{\"context\":{\"domain\":\"onest:work-opportunities\",\"action\":\"search\"}}";
        Map<String, String> headers = authService.generateAuthHeaders("POST", "/search", body);

        assertNotNull(headers.get("Digest"));
        assertNotNull(headers.get("Authorization"));

        String auth = headers.get("Authorization");
        assertTrue(auth.contains("Signature keyId=\"skill-verification-bap.onest.network|key-1|ed25519\""));
        assertTrue(auth.contains("algorithm=\"ed25519\""));
        assertTrue(auth.contains("signature="));
    }

    @Test
    void testSignAndVerify() {
        byte[] payload = "beckn-transaction-payload-test".getBytes(StandardCharsets.UTF_8);
        byte[] signature = authService.sign(payload);
        assertNotNull(signature);
        assertEquals(64, signature.length); // Ed25519 signatures are 64 bytes

        byte[] pubKeyBytes = Base64.getDecoder().decode(authService.getPublicKey());
        boolean isValid = authService.verify(payload, signature, pubKeyBytes);
        assertTrue(isValid, "Generated signature should be cryptographically valid");

        // Verify tampering is detected
        byte[] tampered = "beckn-transaction-payload-tampered".getBytes(StandardCharsets.UTF_8);
        boolean isTamperedValid = authService.verify(tampered, signature, pubKeyBytes);
        assertFalse(isTamperedValid, "Tampered payload should fail verification");
    }

    @Test
    void testVerifyAuthHeader() {
        String body = "{\"context\":{\"domain\":\"onest:work-opportunities\",\"action\":\"search\"}}";
        Map<String, String> headers = authService.generateAuthHeaders("POST", "/search", body);
        String authHeader = headers.get("Authorization");

        byte[] pubKeyBytes = Base64.getDecoder().decode(authService.getPublicKey());
        boolean isValid = authService.verifyAuthHeader(authHeader, "POST", "/search", body, pubKeyBytes);
        assertTrue(isValid, "Auth header should pass cryptographic verification");

        // Test body tampering detection
        boolean isTamperedValid = authService.verifyAuthHeader(authHeader, "POST", "/search", body + "tampered", pubKeyBytes);
        assertFalse(isTamperedValid, "Tampered body should fail auth header verification");
    }
}

