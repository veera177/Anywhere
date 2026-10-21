package com.app.start_app.ai;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public AIResponse chat(@RequestBody AIRequest request, Authentication authentication) {
        // Never trust a userId supplied in the JSON body; cart/order actions must
        // be scoped to the identity authenticated by the JWT filter.
        request.setUserId(authentication != null && authentication.getPrincipal() instanceof Number id
                ? id.intValue() : null);
        return aiService.processMessage(request);
    }
}
