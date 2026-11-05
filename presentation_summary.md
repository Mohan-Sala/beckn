# Beckn-Based Skill Verification Network with ONEST Framework
## Presentation & Pitch Deck Summary

---

### Slide 1: The Problem Statement
- **Walled Gardens**: Candidate skills and certifications are siloed inside individual portals (LinkedIn, Naukri, Coursera, university portals).
- **Rampant Credential Fraud**: Candidates upload forged certificates, altered PDF scans, or dummy QR codes that lead to generic sites.
- **Verification Bottleneck**: Hiring platforms have no interoperable, standard way to independently verify credential authenticity without building costly, point-to-point integrations with hundreds of issuers.

---

### Slide 2: Our Solution
- **Decentralized Interoperability**: Built on the **ONEST (Open Network for Education and Skilling Transactions) Framework** and open **Beckn Protocol**.
- **Open Network Node**: Our platform acts as a decentralized Beckn Application Platform (BAP) connecting candidates, employers, and verification providers.
- **Unified Trust Score**: Enables candidates to verify external credentials and allows employers to discover candidates with independently verified Confidence Scores (0–100%) and Competency Levels.

---

### Slide 3: Core Innovations & Features
1. **Optical Certificate Authenticity & QR Scanner:**
   - Multi-format support: Entire PDF certificates, certificate images, and standalone QR codes.
   - High-definition page rendering (200 & 300 DPI) via Apache PDFBox.
   - Multi-pass ZXing binarizers (`HybridBinarizer`, `GlobalHistogramBinarizer`) and sub-quadrant scanning.
   - Printed Certificate ID fallback detection for low-resolution/compressed images.
   - Fraud detection rejecting counterfeit QR codes (e.g. google.com/youtube.com).
2. **Resume & Credential Link Scanner:**
   - Automatically parses candidate resumes, extracts contact info, skills, and credential verification URLs.
3. **Live Registry Validation:**
   - Direct real-time verification against Credly, Coursera, Udemy, HackerRank, Oracle, and Cisco registries.
4. **Employer Talent Discovery:**
   - Real-time search by skill, transparent audit trails, and multi-platform sync.

---

### Slide 4: ONEST & Beckn Protocol Architecture
- **4-Step Transaction Flow:**
  1. `search` -> `on_search`: Discover credential providers in the ONEST network.
  2. `select` -> `on_select`: Select provider and evaluation criteria.
  3. `init` -> `on_init`: Candidate grants consent and initiates verification.
  4. `confirm` -> `on_confirm`: Final verification response with Trust Score & Competency Level.
- **Audit Trails**: Full transaction tracking in MySQL (`beckn_transaction`).

---

### Slide 5: Technology Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend**: Java 17/21, Spring Boot 3, Spring Data JPA, Apache PDFBox, ZXing 3.5.3.
- **Database**: MySQL 8.0 with normalized schema.
- **Protocols**: Beckn Protocol Specification, ONEST Framework Taxonomy.

---

### Slide 6: Impact & Future Scope
- **Instant Hiring Trust**: Zero-trust credential validation reduces background verification turnaround from weeks to seconds.
- **Verifiable Credentials**: Native support for W3C Verifiable Credentials and decentralized identifiers (DIDs).
- **Live Gateway Connectivity**: Seamless transition from prototype simulation to the live production ONEST Gateway.
