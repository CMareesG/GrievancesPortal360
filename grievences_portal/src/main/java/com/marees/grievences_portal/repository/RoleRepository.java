package com.marees.grievences_portal.repository;

import com.marees.grievences_portal.models.AppRole;
import com.marees.grievences_portal.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role,Long> {
    Optional<Role> findByRoleName(AppRole approle);
}
