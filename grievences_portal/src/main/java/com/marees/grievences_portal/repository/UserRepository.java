package com.marees.grievences_portal.repository;

import com.marees.grievences_portal.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByUserName(String username);

    Boolean existsByUserName(String user1);
    Boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);
}
