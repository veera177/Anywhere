package com.app.start_app.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * Structured intent parsed from the user's message via Gemini.
 * Only these intents are recognized; anything else defaults to UNKNOWN.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class IntentResult {

    public static final String SEARCH_FOOD = "SEARCH_FOOD";
    public static final String SEARCH_GROCERY = "SEARCH_GROCERY";
    public static final String SEARCH_MEDICINE = "SEARCH_MEDICINE";
    public static final String TRACK_ORDER = "TRACK_ORDER";
    public static final String BOOK_COURIER = "BOOK_COURIER";
    public static final String REPEAT_ORDER = "REPEAT_ORDER";
    public static final String NEARBY_PHARMACY = "NEARBY_PHARMACY";
    public static final String GENERAL_APP_HELP = "GENERAL_APP_HELP";
    public static final String PLATFORM_INFO_SERVICES = "PLATFORM_INFO_SERVICES";
    public static final String PLATFORM_INFO_DELIVERY_FEE = "PLATFORM_INFO_DELIVERY_FEE";
    public static final String PLATFORM_INFO_RADIUS = "PLATFORM_INFO_RADIUS";
    public static final String COUNT_RESTAURANTS = "COUNT_RESTAURANTS";
    public static final String COUNT_GROCERY_STORES = "COUNT_GROCERY_STORES";
    public static final String COUNT_PHARMACIES = "COUNT_PHARMACIES";
    public static final String COUNT_DISTRICTS_COVERED = "COUNT_DISTRICTS_COVERED";
    public static final String FILTER_CHEAPEST_FOOD = "FILTER_CHEAPEST_FOOD";
    public static final String FILTER_CHEAPEST_GROCERY = "FILTER_CHEAPEST_GROCERY";
    public static final String CHECK_STORE_OPEN_NOW = "CHECK_STORE_OPEN_NOW";
    public static final String ADDRESS_HELP = "ADDRESS_HELP";
    public static final String FAQ_QUESTION = "FAQ_QUESTION";
    public static final String UNKNOWN = "UNKNOWN";

    @JsonProperty("intent")
    private String intent;

    @JsonProperty("item")
    private String item;

    @JsonProperty("district")
    private String district;

    @JsonProperty("orderId")
    private String orderId;

    public String getIntentOrDefault() {
        return intent == null || intent.isBlank() ? UNKNOWN : intent.trim().toUpperCase();
    }
}
