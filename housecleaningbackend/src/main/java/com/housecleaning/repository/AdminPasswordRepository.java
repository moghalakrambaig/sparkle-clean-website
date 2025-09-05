package com.housecleaning.repository;

import com.housecleaning.model.AdminPassword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminPasswordRepository extends JpaRepository<AdminPassword, Long> {
}

