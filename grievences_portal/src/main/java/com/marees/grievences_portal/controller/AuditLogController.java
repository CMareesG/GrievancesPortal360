package com.marees.grievences_portal.controller;
import com.marees.grievences_portal.models.AuditLog;
import com.marees.grievences_portal.models.Grievance;
import com.marees.grievences_portal.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditLogController {
    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<List<AuditLog>> getAllAuditLogs() {
        List<AuditLog> auditLogs = auditLogService.getAllAuditLogs();
        return ResponseEntity.ok(auditLogs);
    }

    public ResponseEntity<List<AuditLog>> getAuditLogsForNoteId(@PathVariable Long grievanceId) {
        List<AuditLog> auditLogs = auditLogService.getAuditLogsForGrievanceId(grievanceId);
        return ResponseEntity.ok(auditLogs);
    }
    // Logging note creation
    @PostMapping("/create")
    public ResponseEntity<String> logNoteCreation(@RequestParam String username, @RequestBody Grievance note) {
        auditLogService.logGrievanceCreation(username, note);
        return ResponseEntity.ok("Audit log for note creation added successfully.");
    }

    // Logging note update
    @PutMapping("/update")
    public ResponseEntity<String> logNoteUpdate(@RequestParam String username, @RequestBody Grievance grievance) {
        auditLogService.logGrievanceUpdate(username, grievance);
        return ResponseEntity.ok("Audit log for note update added successfully.");
    }

    // Logging note deletion
    @DeleteMapping("/delete/{grievanceId}")
    public ResponseEntity<String> logNoteDeletion(@RequestParam String username, @PathVariable Long grievanceId) {
        auditLogService.logGrievanceDeletion(username, grievanceId);
        return ResponseEntity.ok("Audit log for note deletion added successfully.");
    }

}