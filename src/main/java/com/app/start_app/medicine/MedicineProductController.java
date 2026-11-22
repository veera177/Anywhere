package com.app.start_app.medicine;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.app.start_app.user.ProfileDistrictService;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class MedicineProductController {

    private final MedicineProductDAO medicineProductDAO;
    private final ProfileDistrictService profileDistrictService;

    public MedicineProductController(MedicineProductDAO medicineProductDAO,
                                     ProfileDistrictService profileDistrictService) {
        this.medicineProductDAO = medicineProductDAO;
        this.profileDistrictService = profileDistrictService;
    }

    // GET MEDICINE PRODUCTS — district comes from the profile, not the query string.
    @GetMapping("/api/medicine-products")
    public List<MedicineProduct> getMedicineProducts(
            @AuthenticationPrincipal Integer userId,
            @RequestParam(required = false) Integer pharmacyId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean inStock
    ) {
        String profileDistrict = profileDistrictService.requireDistrict(userId);
        return medicineProductDAO.getMedicineProducts(profileDistrict, pharmacyId, name, inStock);
    }

    // PLACE ORDER
    @PostMapping("/api/medicine-order")
    public String placeOrder(
            @RequestParam int productId
    ) {
        throw new ResponseStatusException(HttpStatus.GONE,
                "Direct ordering is unavailable. Add the item to cart and complete checkout.");
    }
}
