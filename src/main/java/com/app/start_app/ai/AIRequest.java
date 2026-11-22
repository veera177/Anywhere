package com.app.start_app.ai;

import lombok.Data;
import java.util.List;

@Data
public class AIRequest {
    private String message;
    private Integer userId;
    private String district;
    // Recent visible chat turns are used only to resolve conversational references
    // such as "yes, show me". They are never used for authentication or account data.
    private List<ChatTurn> conversationHistory;

    @Data
    public static class ChatTurn {
        private String sender;
        private String text;
    }
}
