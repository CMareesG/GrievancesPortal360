package com.marees.grievences_portal.service;
import com.marees.grievences_portal.models.AuditLog;
import com.marees.grievences_portal.models.Grievance;
import com.marees.grievences_portal.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    @Autowired
    AuditLogRepository auditLogRepository;

    @Override
    public void logGrievanceCreation(String username, Grievance grievance){
        AuditLog log = new AuditLog();
        log.setAction("CREATE");
        log.setUsername(username);
        log.setGrievanceId(grievance.getId());
        log.setGrievanceContent(grievance.getContent());
        log.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(log);
    }

    @Override
    public void logGrievanceUpdate(String username, Grievance grievance){
        AuditLog log = new AuditLog();
        log.setAction("UPDATE");
        log.setUsername(username);
        log.setGrievanceId(grievance.getId());
        log.setGrievanceContent(grievance.getContent());
        log.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(log);
    }

    @Override
    public void logGrievanceDeletion(String username, Long grievanceId){
        AuditLog log = new AuditLog();
        log.setAction("DELETE");
        log.setUsername(username);
        log.setGrievanceId(grievanceId);
        log.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(log);
    }

    @Override
    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAll();
    }

    @Override
    public List<AuditLog> getAuditLogsForGrievanceId(Long id) {
        return auditLogRepository.findByGrievanceId(id);
    }
}
