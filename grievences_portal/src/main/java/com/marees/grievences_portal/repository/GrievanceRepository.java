package com.marees.grievences_portal.repository;

import com.marees.grievences_portal.models.Grievance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GrievanceRepository extends JpaRepository<Grievance,Long> {
    List<Grievance> findByOwnerUserName(String ownerUserName);

    List<Grievance> findByConcernedStaffEmail(String email);
}
