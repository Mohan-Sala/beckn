package com.beckn.skill_verification.controller;

import com.beckn.skill_verification.dto.CandidateProfileDto;
import com.beckn.skill_verification.entity.Credential;
import com.beckn.skill_verification.repository.CredentialRepository;
import com.beckn.skill_verification.service.CandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
public class CandidateController {
    
    private final CandidateService candidateService;
    private final CredentialRepository credentialRepository;
    private final com.beckn.skill_verification.service.ResumeVerificationService resumeVerificationService;
    private final com.beckn.skill_verification.service.QrCertificateVerificationService qrCertificateVerificationService;
    
    @GetMapping("/{id}")
    public ResponseEntity<CandidateProfileDto> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(candidateService.getCandidateProfile(id));
    }
    
    @PostMapping("/{id}/credentials")
    public ResponseEntity<Credential> addCredential(
            @PathVariable Long id,
            @RequestParam("skillId") Long skillId,
            @RequestParam("certificateName") String certificateName,
            @RequestParam("credentialId") String credentialId,
            @RequestParam("issuer") String issuer,
            @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {
        
        Credential credential = credentialRepository.findByCandidateIdAndSkillId(id, skillId)
                .orElse(new Credential());
        
        credential.setCandidateId(id);
        credential.setSkillId(skillId);
        credential.setCertificateName(certificateName);
        credential.setCredentialId(credentialId);
        credential.setIssuer(issuer);
        credential.setStatus("UPLOADED");
        
        if (file != null && !file.isEmpty()) {
            String rawFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "credential.pdf";
            String cleanFilename = Paths.get(rawFilename).getFileName().toString().replaceAll("[^a-zA-Z0-9._-]", "_");
            String ext = cleanFilename.contains(".") ? cleanFilename.substring(cleanFilename.lastIndexOf(".")).toLowerCase() : "";
            
            // Strict extension whitelisting for security (prevent arbitrary file execution)
            if (!java.util.List.of(".pdf", ".png", ".jpg", ".jpeg", ".webp").contains(ext)) {
                return ResponseEntity.badRequest().build();
            }

            Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            // Path traversal protection (CWE-22) and unique file naming
            String safeFileName = java.util.UUID.randomUUID().toString() + "_" + cleanFilename;
            Path targetPath = uploadDir.resolve(safeFileName).normalize();
            if (!targetPath.startsWith(uploadDir)) {
                throw new SecurityException("Directory traversal attempt blocked");
            }

            Files.write(targetPath, file.getBytes());
            credential.setFilePath("uploads/" + safeFileName);
        }
        
        return ResponseEntity.ok(credentialRepository.save(credential));
    }

    @GetMapping("/{id}/credentials")
    public ResponseEntity<List<Credential>> getCredentials(@PathVariable Long id) {
        return ResponseEntity.ok(credentialRepository.findByCandidateId(id));
    }
    
    @GetMapping("/{candidateId}/credentials/{skillId}")
    public ResponseEntity<Credential> getCredentialForSkill(@PathVariable Long candidateId, @PathVariable Long skillId) {
        Optional<Credential> cred = credentialRepository.findByCandidateIdAndSkillId(candidateId, skillId);
        return cred.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/verify-external-badge")
    public ResponseEntity<?> verifyExternalBadge(@RequestParam String id) {
        System.out.println("Verifying external badge: " + id);
        try {
            java.net.HttpURLConnection connection = (java.net.HttpURLConnection) new java.net.URL("https://www.credly.com/badges/" + id).openConnection();
            connection.setRequestProperty("User-Agent", "Mozilla/5.0");
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(3000);
            connection.setReadTimeout(3000);
            int responseCode = connection.getResponseCode();
            
            if (responseCode >= 200 && responseCode < 400) {
                java.io.BufferedReader in = new java.io.BufferedReader(new java.io.InputStreamReader(connection.getInputStream()));
                String inputLine;
                StringBuilder content = new StringBuilder();
                while ((inputLine = in.readLine()) != null) {
                    content.append(inputLine);
                }
                in.close();
                connection.disconnect();
                
                String html = content.toString();
                if (html.contains("Unable to verify badge") || html.contains("error-view__title")) {
                    return ResponseEntity.ok().body(java.util.Collections.singletonMap("valid", false));
                }
                return ResponseEntity.ok().body(java.util.Collections.singletonMap("valid", true));
            } else {
                return ResponseEntity.ok().body(java.util.Collections.singletonMap("valid", false));
            }
        } catch (Exception e) {
            System.out.println("Error verifying badge: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok().body(java.util.Collections.singletonMap("valid", false));
        }
    }

    @PostMapping("/verify-resume")
    public ResponseEntity<?> verifyResumeFile(@RequestParam("file") MultipartFile file) {
        try {
            var response = resumeVerificationService.verifyResumeFile(file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error processing resume: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", "Failed to process resume: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-certificate-qr")
    public ResponseEntity<?> verifyCertificateQr(@RequestParam("file") MultipartFile file) {
        try {
            var response = qrCertificateVerificationService.verifyCertificateFile(file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error verifying certificate: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", "Failed to scan certificate: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-qr-payload")
    public ResponseEntity<?> verifyQrPayload(@RequestBody java.util.Map<String, String> request) {
        try {
            String payload = request.getOrDefault("payload", "");
            var response = qrCertificateVerificationService.verifyPayloadDirectly(payload);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error verifying QR payload: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", "Failed to verify payload: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-resume-text")
    public ResponseEntity<?> verifyResumeText(@RequestBody java.util.Map<String, String> request) {
        try {
            String text = request.getOrDefault("text", "");
            var response = resumeVerificationService.verifyResumeText(text);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error processing resume text: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", "Failed to process text: " + e.getMessage()));
        }
    }
}

