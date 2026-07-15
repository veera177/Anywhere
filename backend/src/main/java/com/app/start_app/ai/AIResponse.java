package com.app.start_app.ai;

import lombok.Data;

@Data
public class AIResponse {
    private String reply;
    private String action; // e.g., "NAVIGATE_FOOD", "ADD_TO_CART", "NONE"
    private Object actionData; // payload for action (like view name or product details)
    
    public AIResponse() {
        this.action = "NONE";
    }

    public AIResponse(String reply) {
        this.reply = reply;
        this.action = "NONE";
    }
    
    public AIResponse(String reply, String action, Object actionData) {
        this.reply = reply;
        this.action = action;
        this.actionData = actionData;
    }
}
