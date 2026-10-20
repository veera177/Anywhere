package com.app.start_app.order;

import java.util.List;

public class ReorderResult {

    private List<String> addedItems;
    private List<String> unavailableItems;

    public ReorderResult(List<String> addedItems, List<String> unavailableItems) {
        this.addedItems = addedItems;
        this.unavailableItems = unavailableItems;
    }

    public List<String> getAddedItems() { return addedItems; }
    public void setAddedItems(List<String> addedItems) { this.addedItems = addedItems; }
    public List<String> getUnavailableItems() { return unavailableItems; }
    public void setUnavailableItems(List<String> unavailableItems) { this.unavailableItems = unavailableItems; }
}
