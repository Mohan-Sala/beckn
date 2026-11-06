package com.beckn.skill_verification.service;
import com.beckn.skill_verification.controller.BecknController;


import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;

@Slf4j
@Component
public class MockBecknClient implements BecknClient {

    @Autowired
    private ApplicationContext applicationContext;
    
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    @Override
    public void search(String candidateId, String skillName, String transactionId) {
        log.info("MOCK BECKN CLIENT: Simulated 'search' sent. Transaction: {}", transactionId);
        // Simulate async callback after 2 seconds
        scheduler.schedule(() -> {
            try {
                BecknController controller = applicationContext.getBean(BecknController.class);
                controller.handleOnSearch(transactionId, "mock-provider-123", "Provider discovery successful");
            } catch (Exception e) {
                log.error("Failed to simulate on_search", e);
            }
        }, 2, TimeUnit.SECONDS);
    }

    @Override
    public void init(String transactionId, String providerId, String credentialId) {
        log.info("MOCK BECKN CLIENT: Simulated 'init' sent. Transaction: {}", transactionId);
        scheduler.schedule(() -> {
            try {
                BecknController controller = applicationContext.getBean(BecknController.class);
                controller.handleOnInit(transactionId, "Init successful, quote generated");
            } catch (Exception e) {
                log.error("Failed to simulate on_init", e);
            }
        }, 2, TimeUnit.SECONDS);
    }

    @Override
    public void confirm(String transactionId, String providerId, String credentialId) {
        log.info("MOCK BECKN CLIENT: Simulated 'confirm' sent. Transaction: {}", transactionId);
        scheduler.schedule(() -> {
            try {
                BecknController controller = applicationContext.getBean(BecknController.class);
                controller.handleOnConfirm(transactionId, "VERIFIED", 95);
            } catch (Exception e) {
                log.error("Failed to simulate on_confirm", e);
            }
        }, 2, TimeUnit.SECONDS);
    }
}
