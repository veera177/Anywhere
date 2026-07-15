package com.app.start_app.medicine;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class MedicineProductController {

    private final MedicineProductDAO medicineProductDAO;

    public MedicineProductController(MedicineProductDAO medicineProductDAO) {
        this.medicineProductDAO = medicineProductDAO;
    }

    // GET MEDICINE PRODUCTS
    @GetMapping("/api/medicine-products")
    public List<MedicineProduct> getMedicineProducts(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) Integer pharmacyId
    ) {
        return medicineProductDAO.getMedicineProducts(district, pharmacyId);
    }

    // PLACE ORDER
    @PostMapping("/api/medicine-order")
    public String placeOrder(
            @RequestParam int productId
    ) {
        medicineProductDAO.reduceStock(productId);
        return "Order placed successfully";
    }
}
