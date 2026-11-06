package com.beckn.skill_verification.dto.beckn;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BecknOrder {
    private String id;
    private String state;
    private BecknProvider provider;
    private List<BecknItem> items;
    private Map<String, Object> quote;
    private Map<String, Object> payment;
    private Map<String, Object> fulfillment;
    private Map<String, Object> tags;
}

