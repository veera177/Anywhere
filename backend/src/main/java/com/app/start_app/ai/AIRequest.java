package com.app.start_app.ai;

import lombok.Data;

@Data
public class AIRequest {
    private String message;
    private Integer userId;
    private String district;
}
