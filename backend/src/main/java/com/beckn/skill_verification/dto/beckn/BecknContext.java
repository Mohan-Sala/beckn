package com.beckn.skill_verification.dto.beckn;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BecknContext {
    private String domain; // e.g. "onest:work-opportunities" or "onest:learning-experiences"
    private String country; // "IND"
    private String city; // "std:080"
    private String action; // "search", "select", "init", "confirm", "on_search", etc.
    
    @JsonProperty("core_version")
    @Builder.Default
    private String coreVersion = "1.1.0";
    
    @JsonProperty("bap_id")
    private String bapId;
    
    @JsonProperty("bap_uri")
    private String bapUri;
    
    @JsonProperty("bpp_id")
    private String bppId;
    
    @JsonProperty("bpp_uri")
    private String bppUri;
    
    @JsonProperty("transaction_id")
    private String transactionId;
    
    @JsonProperty("message_id")
    private String messageId;
    
    private String timestamp; // ISO 8601 UTC
    
    @Builder.Default
    private String ttl = "PT30S";
}

