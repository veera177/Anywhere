package com.app.start_app.user;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.app.start_app.security.CurrentUser;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class AddressController {

    private final AddressDAO addressDAO;

    public AddressController(AddressDAO addressDAO) {
        this.addressDAO = addressDAO;
    }

    @GetMapping("/{userId}/addresses")
    public List<Address> getAddresses(@PathVariable Integer userId, @AuthenticationPrincipal Integer authenticatedUserId) {
        CurrentUser.owns(authenticatedUserId, userId);
        return addressDAO.getAddressesByUserId(userId);
    }

    @GetMapping("/{userId}/addresses/{addressId}")
    public ResponseEntity<Address> getAddress(
            @PathVariable Integer userId,
            @PathVariable Integer addressId, @AuthenticationPrincipal Integer authenticatedUserId
    ) {
        CurrentUser.owns(authenticatedUserId, userId); Address address = addressDAO.getAddressById(userId, addressId);

        if (address == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(address);
    }

    @GetMapping("/{userId}/addresses/default")
    public ResponseEntity<Address> getDefaultAddress(@PathVariable Integer userId, @AuthenticationPrincipal Integer authenticatedUserId) {
        CurrentUser.owns(authenticatedUserId, userId);
        Address address = addressDAO.getDefaultAddress(userId);

        if (address == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(address);
    }

    @PostMapping("/{userId}/addresses")
    public ResponseEntity<String> addAddress(
            @PathVariable Integer userId,
            @RequestBody Address address, @AuthenticationPrincipal Integer authenticatedUserId
    ) {
        CurrentUser.owns(authenticatedUserId, userId); int result = addressDAO.addAddress(userId, address);

        if (result > 0) {
            return ResponseEntity.status(HttpStatus.CREATED).body("Address added successfully");
        }

        return ResponseEntity.badRequest().body("Address add failed");
    }

    @PutMapping("/{userId}/addresses/{addressId}")
    public ResponseEntity<String> updateAddress(
            @PathVariable Integer userId,
            @PathVariable Integer addressId,
            @RequestBody Address address, @AuthenticationPrincipal Integer authenticatedUserId
    ) {
        CurrentUser.owns(authenticatedUserId, userId); int result = addressDAO.updateAddress(userId, addressId, address);

        if (result == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok("Address updated successfully");
    }

    @DeleteMapping("/{userId}/addresses/{addressId}")
    public ResponseEntity<String> deleteAddress(
            @PathVariable Integer userId,
            @PathVariable Integer addressId, @AuthenticationPrincipal Integer authenticatedUserId
    ) {
        CurrentUser.owns(authenticatedUserId, userId); int result = addressDAO.deleteAddress(userId, addressId);

        if (result == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok("Address deleted successfully");
    }

    @PostMapping("/{userId}/addresses/{addressId}/select")
    public ResponseEntity<Address> selectAddressForCheckout(
            @PathVariable Integer userId,
            @PathVariable Integer addressId, @AuthenticationPrincipal Integer authenticatedUserId
    ) {
        CurrentUser.owns(authenticatedUserId, userId); Address address = addressDAO.getAddressById(userId, addressId);

        if (address == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(address);
    }

    @PutMapping("/{userId}/addresses/{addressId}/set-default")
    public ResponseEntity<String> setDefaultAddress(
            @PathVariable Integer userId,
            @PathVariable Integer addressId, @AuthenticationPrincipal Integer authenticatedUserId
    ) {
        CurrentUser.owns(authenticatedUserId, userId); int result = addressDAO.setDefaultAddress(userId, addressId);

        if (result == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok("Default address updated");
    }
}
