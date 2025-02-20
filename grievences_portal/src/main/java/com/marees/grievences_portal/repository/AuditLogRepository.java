package com.marees.grievences_portal.repository;

import com.marees.grievences_portal.models.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByGrievanceId(Long grievanceId);
}
