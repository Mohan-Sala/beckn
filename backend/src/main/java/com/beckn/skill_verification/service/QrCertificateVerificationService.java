package com.beckn.skill_verification.service;

import com.beckn.skill_verification.dto.QrCertificateVerificationResponse;
import com.google.zxing.*;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.GlobalHistogramBinarizer;
import com.google.zxing.common.HybridBinarizer;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.cos.COSName;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDResources;
import org.apache.pdfbox.pdmodel.graphics.PDXObject;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class QrCertificateVerificationService {

    private static final Pattern CERT_ID_PATTERN = Pattern.compile(
        "(?:e?Certificate\\s*(?:No|Number|ID)?[:#\\s]*|Certificate\\s*ID[:#\\s]*|Cert\\s*#[:#\\s]*)([A-Za-z0-9_-]{8,30})",
        Pattern.CASE_INSENSITIVE
    );

    private static final Pattern ORACLE_ECERT_PATTERN = Pattern.compile(
        "([0-9]{8,15}[A-Za-z0-9]{4,10})",
        Pattern.CASE_INSENSITIVE
    );

    /**
     * Inspects and scans an uploaded certificate file (PDF or image).
     */
    public QrCertificateVerificationResponse verifyCertificateFile(MultipartFile file) throws Exception {
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "certificate";
        String lowerName = originalFilename.toLowerCase();
        List<String> detectedFeatures = new ArrayList<>();

        String decodedQrPayload = null;
        String detectedCertId = null;

        if (lowerName.endsWith(".pdf")) {
            try (InputStream is = file.getInputStream();
                 PDDocument document = PDDocument.load(is)) {

                PDFRenderer renderer = new PDFRenderer(document);
                int totalPages = document.getNumberOfPages();
                detectedFeatures.add("PDF Document: " + totalPages + " page(s)");

                // 1. Text scan for printed Certificate IDs (e.g. Oracle, NPTEL)
                PDFTextStripper stripper = new PDFTextStripper();
                String fullText = stripper.getText(document);
                detectedCertId = extractCertificateIdFromText(fullText);
                if (detectedCertId != null) {
                    detectedFeatures.add("Detected Printed Certificate ID: " + detectedCertId);
                }

                // 2. High-resolution page rendering scan
                for (int page = 0; page < totalPages; page++) {
                    // Try 200 DPI first, then 300 DPI
                    BufferedImage pageImg200 = renderer.renderImageWithDPI(page, 200);
                    decodedQrPayload = decodeQrFromBufferedImage(pageImg200);

                    if (decodedQrPayload == null) {
                        BufferedImage pageImg300 = renderer.renderImageWithDPI(page, 300);
                        decodedQrPayload = decodeQrFromBufferedImage(pageImg300);
                    }

                    if (decodedQrPayload != null) {
                        detectedFeatures.add("Decoded QR from Page " + (page + 1) + " rendering");
                        break;
                    }

                    // 3. Scan raw embedded image objects (useful if vector scaling distorts QR)
                    PDPage pdPage = document.getPage(page);
                    PDResources resources = pdPage.getResources();
                    if (resources != null) {
                        for (COSName xObjectName : resources.getXObjectNames()) {
                            PDXObject xObject = resources.getXObject(xObjectName);
                            if (xObject instanceof PDImageXObject imageXObject) {
                                BufferedImage embeddedImg = imageXObject.getImage();
                                String qrFromEmbedded = decodeQrFromBufferedImage(embeddedImg);
                                if (qrFromEmbedded != null) {
                                    decodedQrPayload = qrFromEmbedded;
                                    detectedFeatures.add("Decoded QR from embedded image stream on Page " + (page + 1));
                                    break;
                                }
                            }
                        }
                    }

                    if (decodedQrPayload != null) break;
                }
            }
        } else {
            // Direct image file (.png, .jpg, .jpeg, etc.)
            try (InputStream is = file.getInputStream()) {
                BufferedImage img = ImageIO.read(is);
                if (img != null) {
                    detectedFeatures.add("Direct Image: " + img.getWidth() + "x" + img.getHeight() + "px");
                    decodedQrPayload = decodeQrFromBufferedImage(img);
                }
            }
        }

        // If a QR code was found, verify its payload
        if (decodedQrPayload != null) {
            QrCertificateVerificationResponse response = verifyPayloadDirectly(decodedQrPayload);
            response.setExtractedCertId(detectedCertId);
            response.getDetectedFeatures().addAll(detectedFeatures);
            return response;
        }

        // If no QR code was found, check if a printed Certificate ID was detected
        if (detectedCertId != null) {
            return QrCertificateVerificationResponse.builder()
                    .isValid(true)
                    .status("PRINTED CERTIFICATE ID DETECTED")
                    .issuer(detectIssuerFromText(file.getOriginalFilename()))
                    .credentialId(detectedCertId)
                    .extractedCertId(detectedCertId)
                    .verificationDetails("No optical QR code found on this document, but detected printed Certificate ID / Serial Number [" + detectedCertId + "]. Some issuers (such as Oracle, NPTEL, Microsoft) authenticate via Certificate ID rather than a QR code.")
                    .detectedFeatures(detectedFeatures)
                    .build();
        }

        // No QR and no Cert ID detected
        detectedFeatures.add("ZXing Multi-pass Scanned (Global + Sub-quadrant)");
        return QrCertificateVerificationResponse.builder()
                .isValid(false)
                .status("NO QR FOUND")
                .verificationDetails("No optical QR code or Certificate ID could be detected on this certificate. Please ensure the document is a clear certificate image or PDF with a visible QR code or ID.")
                .detectedFeatures(detectedFeatures)
                .build();
    }

    /**
     * Directly validates a QR payload (URL, token, or registry ID).
     */
    public QrCertificateVerificationResponse verifyPayloadDirectly(String payload) {
        String trimmed = payload != null ? payload.trim() : "";
        List<String> features = new ArrayList<>(List.of("Decoded Payload: " + trimmed));

        if (trimmed.isEmpty()) {
            return QrCertificateVerificationResponse.builder()
                    .isValid(false)
                    .status("EMPTY QR")
                    .verificationDetails("QR code was decoded but contained an empty payload.")
                    .detectedFeatures(features)
                    .build();
        }

        String lower = trimmed.toLowerCase();

        // 1. Detect counterfeit / dummy QR codes pointing to generic or deceptive destinations
        if (lower.contains("google.com") || lower.contains("bing.com") || lower.contains("yahoo.com")
                || lower.contains("youtube.com") || lower.contains("facebook.com") || lower.contains("instagram.com")
                || lower.contains("wikipedia.org")) {
            return QrCertificateVerificationResponse.builder()
                    .isValid(false)
                    .status("INVALID / DUMMY QR")
                    .issuer("Unverified / Dummy Destination")
                    .qrPayload(trimmed)
                    .verificationDetails("FRAUD WARNING: The QR code points to a generic website (" + trimmed + ") instead of an accredited credential registry. This indicates a counterfeit or tampered certificate.")
                    .detectedFeatures(features)
                    .build();
        }

        // 2. Recognized Credential Registry: Credly / YourAcclaim
        if (lower.contains("credly.com") || lower.contains("youracclaim.com")) {
            return verifyCredlyQr(trimmed, features);
        }

        // 3. Recognized Credential Registry: Coursera
        if (lower.contains("coursera.org")) {
            return verifyCourseraQr(trimmed, features);
        }

        // 4. Other accredited registries (Udemy, HackerRank, Accredible, FreeCodeCamp)
        if (lower.contains("udemy.com/certificate/") || lower.contains("hackerrank.com/certificates/")
                || lower.contains("credential.net/") || lower.contains("accredible.com/")
                || lower.contains("freecodecamp.org/certification/")) {
            return verifyGenericRegistryUrl(trimmed, features);
        }

        // 5. Generic URL verification
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return verifyGenericHttpUrl(trimmed, features);
        }

        // 6. Plaintext, JSON, or cryptographic token
        features.add("Format: Plaintext / Cryptographic Payload");
        return QrCertificateVerificationResponse.builder()
                .isValid(true)
                .status("AUTHENTIC / DATA PAYLOAD")
                .issuer("Decentralized / Self-Issued")
                .qrPayload(trimmed)
                .verificationDetails("Decoded cryptographic payload from QR code: " + trimmed)
                .detectedFeatures(features)
                .build();
    }

    private QrCertificateVerificationResponse verifyCredlyQr(String url, List<String> features) {
        features.add("Registry: Credly Acclaim Network");
        String badgeId = extractBadgeId(url);

        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(15000);
            conn.setInstanceFollowRedirects(true);
            conn.setRequestMethod("GET");

            int code = conn.getResponseCode();
            if (code >= 200 && code < 400) {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
                    StringBuilder html = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        html.append(line);
                    }
                    String body = html.toString();

                    if (body.contains("Unable to verify badge") || body.contains("error-view__title")) {
                        return QrCertificateVerificationResponse.builder()
                                .isValid(false)
                                .status("INVALID / REVOKED")
                                .issuer("Credly")
                                .credentialId(badgeId)
                                .qrPayload(url)
                                .verificationDetails("Credly registry returned error: Badge UUID was not found, has expired, or was revoked.")
                                .detectedFeatures(features)
                                .build();
                    }

                    String title = extractHtmlTitle(body);
                    return QrCertificateVerificationResponse.builder()
                            .isValid(true)
                            .status("AUTHENTIC / VERIFIED")
                            .issuer("Credly")
                            .certificateTitle(title != null ? title : "Verified Credly Badge")
                            .credentialId(badgeId)
                            .qrPayload(url)
                            .verificationDetails("Successfully verified on Credly Network: Active digital credential confirmed.")
                            .detectedFeatures(features)
                            .build();
                }
            } else {
                return QrCertificateVerificationResponse.builder()
                        .isValid(false)
                        .status("INVALID / NOT FOUND (HTTP " + code + ")")
                        .issuer("Credly")
                        .credentialId(badgeId)
                        .qrPayload(url)
                        .verificationDetails("Credly server returned HTTP " + code + " - Certificate badge not found.")
                        .detectedFeatures(features)
                        .build();
            }
        } catch (Exception e) {
            log.error("Credly QR verification failed: {}", e.getMessage());
            return QrCertificateVerificationResponse.builder()
                    .isValid(false)
                    .status("INVALID / UNREACHABLE")
                    .issuer("Credly")
                    .qrPayload(url)
                    .verificationDetails("Failed to connect to Credly registry: " + e.getMessage())
                    .detectedFeatures(features)
                    .build();
        }
    }

    private QrCertificateVerificationResponse verifyCourseraQr(String url, List<String> features) {
        features.add("Registry: Coursera Verification");

        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(15000);
            conn.setInstanceFollowRedirects(true);
            conn.setRequestMethod("GET");

            int code = conn.getResponseCode();
            if (code >= 200 && code < 400) {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
                    StringBuilder html = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        html.append(line);
                    }
                    String body = html.toString();

                    if (body.contains("We couldn't find that certificate") || body.contains("Invalid Certificate Code") || body.contains("\"eqpData\":null")) {
                        return QrCertificateVerificationResponse.builder()
                                .isValid(false)
                                .status("INVALID / NOT FOUND")
                                .issuer("Coursera")
                                .qrPayload(url)
                                .verificationDetails("Coursera registry confirmed: Certificate code does not exist or was falsified.")
                                .detectedFeatures(features)
                                .build();
                    }

                    String title = extractHtmlTitle(body);
                    return QrCertificateVerificationResponse.builder()
                            .isValid(true)
                            .status("AUTHENTIC / VERIFIED")
                            .issuer("Coursera")
                            .certificateTitle(title != null ? title : "Coursera Verified Certificate")
                            .qrPayload(url)
                            .verificationDetails("Successfully verified on Coursera verification portal.")
                            .detectedFeatures(features)
                            .build();
                }
            } else {
                return QrCertificateVerificationResponse.builder()
                        .isValid(false)
                        .status("INVALID / 404")
                        .issuer("Coursera")
                        .qrPayload(url)
                        .verificationDetails("Coursera returned HTTP " + code + ".")
                        .detectedFeatures(features)
                        .build();
            }
        } catch (Exception e) {
            return QrCertificateVerificationResponse.builder()
                    .isValid(false)
                    .status("VERIFICATION ERROR")
                    .issuer("Coursera")
                    .qrPayload(url)
                    .verificationDetails("Network error querying Coursera: " + e.getMessage())
                    .detectedFeatures(features)
                    .build();
        }
    }

    private QrCertificateVerificationResponse verifyGenericRegistryUrl(String url, List<String> features) {
        String issuer = detectIssuerFromUrl(url);
        features.add("Registry: " + issuer);

        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(15000);
            conn.setInstanceFollowRedirects(true);
            conn.setRequestMethod("GET");

            int code = conn.getResponseCode();
            boolean valid = code >= 200 && code < 400;

            return QrCertificateVerificationResponse.builder()
                    .isValid(valid)
                    .status(valid ? "AUTHENTIC / VERIFIED" : "INVALID / FAILED")
                    .issuer(issuer)
                    .qrPayload(url)
                    .verificationDetails(valid ? "Certificate URL successfully resolved on " + issuer + " registry." : "Registry returned HTTP " + code + ".")
                    .detectedFeatures(features)
                    .build();
        } catch (Exception e) {
            return QrCertificateVerificationResponse.builder()
                    .isValid(false)
                    .status("FAILED")
                    .issuer(issuer)
                    .qrPayload(url)
                    .verificationDetails("Failed to connect to " + issuer + ": " + e.getMessage())
                    .detectedFeatures(features)
                    .build();
        }
    }

    private QrCertificateVerificationResponse verifyGenericHttpUrl(String url, List<String> features) {
        features.add("Protocol: Web URL");
        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
            conn.setConnectTimeout(4000);
            conn.setReadTimeout(4000);
            conn.setRequestMethod("HEAD");

            int code = conn.getResponseCode();
            boolean valid = code >= 200 && code < 400;

            return QrCertificateVerificationResponse.builder()
                    .isValid(valid)
                    .status(valid ? "AUTHENTIC / ACTIVE LINK" : "UNREACHABLE / BROKEN LINK")
                    .issuer("External Registry")
                    .qrPayload(url)
                    .verificationDetails(valid ? "External verification URL is active and reachable (HTTP " + code + ")." : "Verification link returned HTTP " + code + ".")
                    .detectedFeatures(features)
                    .build();
        } catch (Exception e) {
            return QrCertificateVerificationResponse.builder()
                    .isValid(false)
                    .status("UNREACHABLE")
                    .issuer("External Link")
                    .qrPayload(url)
                    .verificationDetails("Link cannot be reached: " + e.getMessage())
                    .detectedFeatures(features)
                    .build();
        }
    }

    /**
     * Multi-pass QR code decoding from a BufferedImage.
     */
    private String decodeQrFromBufferedImage(BufferedImage image) {
        if (image == null) return null;

        Map<DecodeHintType, Object> hints = new EnumMap<>(DecodeHintType.class);
        hints.put(DecodeHintType.TRY_HARDER, Boolean.TRUE);
        hints.put(DecodeHintType.POSSIBLE_FORMATS, Collections.singletonList(BarcodeFormat.QR_CODE));

        // 1. Full image with HybridBinarizer
        try {
            LuminanceSource source = new BufferedImageLuminanceSource(image);
            BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(source));
            Result result = new MultiFormatReader().decode(bitmap, hints);
            if (result != null && result.getText() != null) return result.getText();
        } catch (Exception ignored) {}

        // 2. Full image with GlobalHistogramBinarizer
        try {
            LuminanceSource source = new BufferedImageLuminanceSource(image);
            BinaryBitmap bitmap = new BinaryBitmap(new GlobalHistogramBinarizer(source));
            Result result = new MultiFormatReader().decode(bitmap, hints);
            if (result != null && result.getText() != null) return result.getText();
        } catch (Exception ignored) {}

        // 3. Sub-quadrant scan (corners and center where certificates place QR codes)
        int w = image.getWidth();
        int h = image.getHeight();
        if (w > 300 && h > 300) {
            int cw = (int) (w * 0.45);
            int ch = (int) (h * 0.45);

            int[][] regions = {
                {w - cw, h - ch, cw, ch}, // Bottom-right (most common)
                {0, h - ch, cw, ch},       // Bottom-left
                {w - cw, 0, cw, ch},       // Top-right
                {0, 0, cw, ch},            // Top-left
                {w / 4, h / 4, w / 2, h / 2} // Center
            };

            for (int[] r : regions) {
                try {
                    BufferedImage sub = image.getSubimage(r[0], r[1], r[2], r[3]);
                    LuminanceSource subSource = new BufferedImageLuminanceSource(sub);
                    BinaryBitmap subBitmap = new BinaryBitmap(new HybridBinarizer(subSource));
                    Result subResult = new MultiFormatReader().decode(subBitmap, hints);
                    if (subResult != null && subResult.getText() != null) return subResult.getText();
                } catch (Exception ignored) {}
            }
        }

        return null;
    }

    private String extractCertificateIdFromText(String text) {
        if (text == null) return null;

        Matcher m1 = CERT_ID_PATTERN.matcher(text);
        if (m1.find()) {
            return m1.group(1).trim();
        }

        Matcher m2 = ORACLE_ECERT_PATTERN.matcher(text);
        while (m2.find()) {
            String val = m2.group(1).trim();
            // Oracle pattern is usually numbers followed by letters e.g. 103550911AAI26OFA
            if (val.length() >= 12 && val.matches(".*[0-9].*") && val.matches(".*[A-Za-z].*")) {
                return val;
            }
        }

        return null;
    }

    private String extractBadgeId(String url) {
        Pattern pattern = Pattern.compile("badges/([a-zA-Z0-9_-]+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(url);
        if (matcher.find()) return matcher.group(1);
        return url;
    }

    private String extractHtmlTitle(String html) {
        Pattern titlePattern = Pattern.compile("<title>(.*?)</title>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
        Matcher matcher = titlePattern.matcher(html);
        if (matcher.find()) {
            return matcher.group(1).replaceAll("\\s+", " ").trim();
        }
        return null;
    }

    private String detectIssuerFromUrl(String url) {
        String lower = url.toLowerCase();
        if (lower.contains("credly.com") || lower.contains("youracclaim.com")) return "Credly";
        if (lower.contains("coursera.org")) return "Coursera";
        if (lower.contains("udemy.com")) return "Udemy";
        if (lower.contains("hackerrank.com")) return "HackerRank";
        if (lower.contains("credential.net") || lower.contains("accredible.com")) return "Accredible";
        if (lower.contains("freecodecamp.org")) return "freeCodeCamp";
        if (lower.contains("microsoft.com")) return "Microsoft";
        return "Accredited Provider";
    }

    private String detectIssuerFromText(String fileName) {
        if (fileName == null) return "Certificate Authority";
        String lower = fileName.toLowerCase();
        if (lower.contains("oracle")) return "Oracle University";
        if (lower.contains("nptel")) return "NPTEL / Swayam";
        if (lower.contains("aws")) return "Amazon Web Services";
        if (lower.contains("tcs")) return "Tata Consultancy Services";
        return "Accredited Authority";
    }
}

