package com.app.start_app.medicine;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class PharmacyController {

    private final PharmacyDAO pharmacyDAO;

    public PharmacyController(PharmacyDAO pharmacyDAO) {
        this.pharmacyDAO = pharmacyDAO;
    }

    // GET PHARMACIES
    @GetMapping("/api/pharmacies")
    public List<Pharmacy> getPharmacies(
            @RequestParam(required = false) String district
    ) {
        return pharmacyDAO.getPharmacies(district);
    }
}
