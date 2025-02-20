package com.marees.grievences_portal.service;

import com.marees.grievences_portal.models.AuditLog;
import com.marees.grievences_portal.models.Grievance;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface AuditLogService {

    void logGrievanceCreation(String username, Grievance grievance);

    void logGrievanceUpdate(String username, Grievance grievance);

    void logGrievanceDeletion(String username, Long grievanceId);

    List<AuditLog> getAllAuditLogs();

    List<AuditLog> getAuditLogsForGrievanceId(Long id);
}
