package com.beckn.skill_verification.service;

import lombok.extern.slf4j.Slf4j;
import org.bouncycastle.crypto.generators.Ed25519KeyPairGenerator;
import org.bouncycastle.crypto.params.Ed25519KeyGenerationParameters;
import org.bouncycastle.crypto.params.Ed25519PrivateKeyParameters;
import org.bouncycastle.crypto.params.Ed25519PublicKeyParameters;
import org.bouncycastle.crypto.signers.Ed25519Signer;
import org.bouncycastle.jcajce.provider.digest.Blake2b;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class BecknAuthService {

    @Value("${beckn.bap-id:skill-verification-bap.onest.network}")
    private String bapId;

    @Value("${beckn.key-id:key-1}")
    private String keyId;

    @Value("${beckn.private-key:}")
    private String configuredPrivateKey;

    @Value("${beckn.public-key:}")
    private String configuredPublicKey;

    private Ed25519PrivateKeyParameters privateKeyParams;
    private Ed25519PublicKeyParameters publicKeyParams;
    private String base64PublicKey;

    @PostConstruct
    public void init() {
        try {
            if (configuredPrivateKey != null && !configuredPrivateKey.isBlank()
                    && configuredPublicKey != null && !configuredPublicKey.isBlank()) {
                byte[] privBytes = Base64.getDecoder().decode(configuredPrivateKey.trim());
                byte[] pubBytes = Base64.getDecoder().decode(configuredPublicKey.trim());
                privateKeyParams = new Ed25519PrivateKeyParameters(privBytes, 0);
                publicKeyParams = new Ed25519PublicKeyParameters(pubBytes, 0);
                base64PublicKey = configuredPublicKey.trim();
                log.info("BecknAuthService: Loaded configured Ed25519 keypair for BAP ID: {}", bapId);
            } else {
                // Generate a fresh Ed25519 keypair
                Ed25519KeyPairGenerator keyPairGenerator = new Ed25519KeyPairGenerator();
                keyPairGenerator.init(new Ed25519KeyGenerationParameters(new SecureRandom()));
                var keyPair = keyPairGenerator.generateKeyPair();
                privateKeyParams = (Ed25519PrivateKeyParameters) keyPair.getPrivate();
                publicKeyParams = (Ed25519PublicKeyParameters) keyPair.getPublic();
                base64PublicKey = Base64.getEncoder().encodeToString(publicKeyParams.getEncoded());
                log.info("BecknAuthService: Generated active Ed25519 public key: {}", base64PublicKey);
            }
        } catch (Exception e) {
            log.error("Failed to initialize Beckn Ed25519 keys: {}", e.getMessage(), e);
        }
    }

    public String getPublicKey() {
        return base64PublicKey;
    }

    public String getBapId() {
        return bapId;
    }

    public String getKeyId() {
        return keyId;
    }

    /**
     * Compute BLAKE-512 or SHA-256 Digest header value according to Beckn specifications.
     */
    public String generateDigestHeader(String requestBody) {
        try {
            MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
            byte[] hash = sha256.digest(requestBody.getBytes(StandardCharsets.UTF_8));
            return "SHA-256=" + Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            log.error("Digest generation failed: {}", e.getMessage());
            return "";
        }
    }

    /**
     * Generate standard Beckn RFC-compliant Authorization header.
     * Format:
     * Signature keyId="bap_id|key_id|ed25519",algorithm="ed25519",created="...",expires="...",headers="(request-target) created expires digest",signature="..."
     */
    public Map<String, String> generateAuthHeaders(String httpMethod, String requestPath, String requestBody) {
        Map<String, String> headers = new HashMap<>();
        long created = Instant.now().getEpochSecond();
        long expires = created + 300; // 5 minutes TTL

        String digest = generateDigestHeader(requestBody);
        headers.put("Digest", digest);

        String normalizedMethod = httpMethod.toLowerCase();
        String signingString = String.format(
                "(request-target): %s %s\ncreated: %d\nexpires: %d\ndigest: %s",
                normalizedMethod, requestPath, created, expires, digest
        );

        byte[] signatureBytes = sign(signingString.getBytes(StandardCharsets.UTF_8));
        String base64Signature = Base64.getEncoder().encodeToString(signatureBytes);

        String fullKeyId = String.format("%s|%s|ed25519", bapId, keyId);
        String authHeader = String.format(
                "Signature keyId=\"%s\",algorithm=\"ed25519\",created=\"%d\",expires=\"%d\",headers=\"(request-target) created expires digest\",signature=\"%s\"",
                fullKeyId, created, expires, base64Signature
        );

        headers.put("Authorization", authHeader);
        return headers;
    }

    /**
     * Sign arbitrary bytes with the BAP's Ed25519 private key.
     */
    public byte[] sign(byte[] data) {
        Ed25519Signer signer = new Ed25519Signer();
        signer.init(true, privateKeyParams);
        signer.update(data, 0, data.length);
        return signer.generateSignature();
    }

    /**
     * Verify an incoming signature given the sender's public key.
     */
    public boolean verify(byte[] data, byte[] signature, byte[] publicKey) {
        try {
            Ed25519PublicKeyParameters pubParams = new Ed25519PublicKeyParameters(publicKey, 0);
            Ed25519Signer verifier = new Ed25519Signer();
            verifier.init(false, pubParams);
            verifier.update(data, 0, data.length);
            return verifier.verifySignature(signature);
        } catch (Exception e) {
            log.warn("Beckn signature verification failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Parses and validates a standard Beckn Authorization header against the payload and sender's Ed25519 public key.
     * Prevents replay attacks (verifies TTL) and data tampering (verifies SHA-256 digest and signature).
     */
    public boolean verifyAuthHeader(String authHeader, String httpMethod, String requestPath, String requestBody, byte[] senderPublicKey) {
        if (authHeader == null || !authHeader.startsWith("Signature ")) {
            return false;
        }

        try {
            Map<String, String> params = new HashMap<>();
            String headerContent = authHeader.substring(10).trim();
            Pattern paramPattern = Pattern.compile("([a-zA-Z0-9_-]+)=\"([^\"]*)\"");
            Matcher matcher = paramPattern.matcher(headerContent);
            while (matcher.find()) {
                params.put(matcher.group(1), matcher.group(2));
            }

            long created = Long.parseLong(params.getOrDefault("created", "0"));
            long expires = Long.parseLong(params.getOrDefault("expires", "0"));
            String signatureBase64 = params.get("signature");

            if (signatureBase64 == null || expires == 0) {
                return false;
            }

            // Replay attack prevention: verify message is within valid time window
            long now = Instant.now().getEpochSecond();
            if (now > expires || created > now + 60) {
                log.warn("Beckn request rejected: Timestamp expired (created={}, expires={}, now={})", created, expires, now);
                return false;
            }

            // Digest verification
            String expectedDigest = generateDigestHeader(requestBody);

            String signingString = String.format(
                    "(request-target): %s %s\ncreated: %d\nexpires: %d\ndigest: %s",
                    httpMethod.toLowerCase(), requestPath, created, expires, expectedDigest
            );

            byte[] signatureBytes = Base64.getDecoder().decode(signatureBase64);
            return verify(signingString.getBytes(StandardCharsets.UTF_8), signatureBytes, senderPublicKey);
        } catch (Exception e) {
            log.warn("Error parsing or verifying Beckn Auth header: {}", e.getMessage());
            return false;
        }
    }
}

