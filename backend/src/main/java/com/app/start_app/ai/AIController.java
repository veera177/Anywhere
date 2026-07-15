package com.app.start_app.ai;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public AIResponse chat(@RequestBody AIRequest request) {
        return aiService.processMessage(request);
    }
}
