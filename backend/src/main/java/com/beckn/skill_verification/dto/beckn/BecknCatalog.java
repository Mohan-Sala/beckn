package com.beckn.skill_verification.dto.beckn;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BecknCatalog {
    @JsonProperty("bpp/descriptor")
    private BecknDescriptor bppDescriptor;

    @JsonProperty("bpp/providers")
    private List<BecknProvider> bppProviders;
}

