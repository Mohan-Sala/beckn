package com.beckn.skill_verification.service;

import com.beckn.skill_verification.dto.QrCertificateVerificationResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class QrCertificateVerificationServiceTest {

    private QrCertificateVerificationService qrService;

    @BeforeEach
    public void setup() {
        qrService = new QrCertificateVerificationService();
    }

    @Test
    public void testDummyGoogleQrIsFlaggedAsFraud() {
        QrCertificateVerificationResponse response = qrService.verifyPayloadDirectly("https://www.google.com");
        assertNotNull(response);
        assertFalse(response.isValid(), "Dummy Google QR must not be valid");
        assertEquals("INVALID / DUMMY QR", response.getStatus());
        assertTrue(response.getVerificationDetails().contains("FRAUD WARNING"), "Must explain fraud warning");
    }

    @Test
    public void testRevokedCredlyUuidReturnsInvalid() {
        QrCertificateVerificationResponse response = qrService.verifyPayloadDirectly("https://www.credly.com/badges/fake-uuid-00000000-0000-0000-000000000000-revoked");
        assertNotNull(response);
        assertFalse(response.isValid(), "Non-existent badge UUID must be invalid");
        assertTrue(response.getStatus().contains("INVALID") || response.getStatus().contains("REVOKED") || response.getStatus().contains("UNREACHABLE"));
    }
}

