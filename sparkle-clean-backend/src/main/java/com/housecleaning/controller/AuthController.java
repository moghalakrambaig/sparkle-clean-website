package com.housecleaning.controller;

import com.housecleaning.model.AdminPassword;
import com.housecleaning.service.AuthService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // allow frontend React app
public class AuthController {

    @Autowired
    private AuthService authService;

    // ✅ Login with password
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> payload) {
        String password = payload.get("password");
        boolean success = authService.validatePassword(password);

        Map<String, Object> response = new HashMap<>();
        response.put("success", success);

        if (success) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body(response);
        }
    }

    // ✅ Get all passwords
    @GetMapping("/passwords")
    public List<AdminPassword> getPasswords() {
        return authService.getAllPasswords();
    }

    // ✅ Add a new password
    @PostMapping("/passwords")
    public AdminPassword addPassword(@RequestBody AdminPassword password) {
        return authService.addPassword(password);
    }

    // ✅ Delete password by ID
    @DeleteMapping("/passwords/{id}")
    public ResponseEntity<Void> deletePassword(@PathVariable Long id) {
        boolean deleted = authService.deletePassword(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}