package com.beckn.skill_verification.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrCertificateVerificationResponse {

    @JsonProperty("isValid")
    private boolean isValid;

    private String status;              // AUTHENTIC, INVALID / DUMMY QR, INVALID / REVOKED, NO_QR_FOUND, UNVERIFIED_PAYLOAD
    private String issuer;              // Credly, Coursera, Oracle, Udemy, HackerRank, etc.
    private String certificateTitle;    // e.g. AWS Certified Solutions Architect
    private String credentialId;        // e.g. Badge UUID or certificate ID
    private String qrPayload;           // Decoded URL or string content from QR code
    private String verificationDetails; // Human-readable explanation of verification checks
    private String extractedCertId;     // If text certificate ID or serial number was detected
    private List<String> detectedFeatures; // e.g. ["High-DPI QR Scan", "Embedded Image Scan", "Issuer Whitelist Matched"]
    private String error;
}

