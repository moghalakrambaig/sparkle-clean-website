package com.housecleaning.service;

import com.housecleaning.model.AdminPassword;
import com.housecleaning.repository.AdminPasswordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {

    @Autowired
    private AdminPasswordRepository repo;

    // ✅ Validate login
    public boolean validatePassword(String password) {
        return repo.findAll().stream()
                   .anyMatch(p -> p.getPassword().equals(password));
    }

    // ✅ Fetch all admin passwords
    public List<AdminPassword> getAllPasswords() {
        return repo.findAll();
    }

    // ✅ Add a new password
    public AdminPassword addPassword(AdminPassword password) {
        return repo.save(password);
    }

    // ✅ Delete a password by ID
    public boolean deletePassword(Long id) {
        if (repo.existsById(id)) {
            repo.deleteById(id);
            return true;
        }
        return false;
    }
}

 