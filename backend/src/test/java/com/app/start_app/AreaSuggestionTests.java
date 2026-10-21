package com.app.start_app;

import com.app.start_app.area.AreaDAO;
import com.app.start_app.area.AreaSuggestionController;
import com.app.start_app.area.DistrictArea;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

@SpringBootTest
public class AreaSuggestionTests {

    @Autowired
    private AreaDAO areaDAO;

    @Autowired
    private AreaSuggestionController areaSuggestionController;

    @Test
    public void testChengalpattuDistrictLocalSearch() {
        List<DistrictArea> areas = areaDAO.searchAreas("Chengalpattu", "chengal");
        Assertions.assertNotNull(areas);
        Assertions.assertFalse(areas.isEmpty(), "Should find local areas for 'chengal' in Chengalpattu");
        
        boolean hasBusStand = areas.stream().anyMatch(a -> a.getAreaName().contains("Chengalpattu Bus Stand"));
        Assertions.assertTrue(hasBusStand, "Should find 'Chengalpattu Bus Stand'");

        // Verify district scoping: All results belong to district_id 23 (Chengalpattu)
        for (DistrictArea area : areas) {
            Assertions.assertEquals(23, area.getDistrictId(), "Area must belong strictly to Chengalpattu");
        }
    }

    @Test
    public void testControllerEndpointReturnsConsistentResponse() {
        ResponseEntity<List<Map<String, Object>>> response = areaSuggestionController.getSuggestions("chengalpattu", "chengal");
        Assertions.assertTrue(response.getStatusCode().is2xxSuccessful());
        
        List<Map<String, Object>> body = response.getBody();
        Assertions.assertNotNull(body);
        Assertions.assertFalse(body.isEmpty(), "Endpoint should return suggestion list");

        Map<String, Object> first = body.get(0);
        Assertions.assertTrue(first.containsKey("name"));
        Assertions.assertTrue(first.containsKey("subtext"));
        Assertions.assertTrue(first.containsKey("latitude"));
        Assertions.assertTrue(first.containsKey("longitude"));
        Assertions.assertTrue(first.containsKey("pincode"));
    }

    @Test
    public void testDistrictScopingExcludesOtherDistricts() {
        List<DistrictArea> salemAreas = areaDAO.searchAreas("Salem", "Junction");
        List<DistrictArea> trichyAreas = areaDAO.searchAreas("Trichy", "Junction");

        Assertions.assertFalse(salemAreas.isEmpty());
        Assertions.assertFalse(trichyAreas.isEmpty());

        for (DistrictArea area : salemAreas) {
            Assertions.assertEquals(1, area.getDistrictId());
        }
        for (DistrictArea area : trichyAreas) {
            Assertions.assertEquals(2, area.getDistrictId());
        }
    }

    @Test
    public void testReverseGeocodeEndpointHandlesCallsGracefully() {
        // Chengalpattu Bus Stand coordinates: 12.6860, 79.9760
        ResponseEntity<Map<String, Object>> response = areaSuggestionController.reverseGeocode(12.6860, 79.9760);
        Assertions.assertTrue(response.getStatusCode().is2xxSuccessful());
        Assertions.assertNotNull(response.getBody());
    }

    @Test
    public void testEmptyOrUnknownReturnsSafeList() {
        ResponseEntity<List<Map<String, Object>>> response = areaSuggestionController.getSuggestions("", "");
        Assertions.assertTrue(response.getStatusCode().is2xxSuccessful());
        Assertions.assertNotNull(response.getBody());
        Assertions.assertTrue(response.getBody().isEmpty());
    }
}