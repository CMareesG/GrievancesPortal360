package com.marees.grievences_portal.controller;

import com.marees.grievences_portal.models.Grievance;
import com.marees.grievences_portal.repository.GrievanceRepository;
import com.marees.grievences_portal.service.GrievanceService;
import com.marees.grievences_portal.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/grievances")
public class GrievancesController {
    @Autowired
    private GrievanceService grievanceService;

    @Autowired
    private GrievanceRepository grievanceRepository;

    @Autowired
    private UserService userService;

    @PostMapping
    public Grievance createGrievance(@RequestBody Grievance grievance, @AuthenticationPrincipal UserDetails userDetails) {
        String userName = userDetails.getUsername(); // This is usually the username, not the email
        String studentEmail = userService.getUserEmailByUsername(userName); // Get the email using a service method

        grievance.setOwnerUserName(userName); // Set the owner username from the authenticated user
        grievance.setStudentEmail(studentEmail); // Set the student's email
        grievance.setCreatedAt(LocalDateTime.now()); // Set the current date and time
        return grievanceService.createGrievanceForUser(
                userName,
                grievance.getContent(),
                grievance.getDepartment(),
                grievance.getConcernedStaffEmail(),
                studentEmail // Pass the student email to the service method
        );
    }


    @GetMapping("/all")
    public ResponseEntity<List<Grievance>> getAllGrievances() {
        List<Grievance> grievances = grievanceService.findAllGrievances();
        return ResponseEntity.ok(grievances);
    }

    @PutMapping("/{grievanceId}")
    public Grievance updateGrievance(@PathVariable Long grievanceId, @RequestBody Grievance grievance, @AuthenticationPrincipal UserDetails userDetails) {
        String userName = userDetails.getUsername();
        return grievanceService.updateGrievanceForUser(grievanceId, grievance, userName);
    }

    @GetMapping
    public List<Grievance> getGrievances(@AuthenticationPrincipal UserDetails userDetails) {
        String userName = userDetails.getUsername();
        return grievanceService.getGrievancesForUser(userName);
    }

    @DeleteMapping("/{grievanceId}")
    public ResponseEntity<String> deleteGrievance(@PathVariable Long grievanceId, @AuthenticationPrincipal UserDetails userDetails) {
        Optional<Grievance> grievance = grievanceRepository.findById(grievanceId);
        if (grievance.isPresent() && !grievance.get().getIsSolved()) {
            grievanceService.deleteGrievancesForUser(grievanceId, grievance.get().getOwnerUserName());
            return ResponseEntity.ok("Grievance deleted successfully");
        } else if (grievance.isPresent() && grievance.get().getIsSolved()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Cannot delete a solved grievance");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Grievance not found");
        }
    }

    @PutMapping("/{id}/toggle-solved")
    public ResponseEntity<Grievance> toggleSolvedStatus(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        Grievance updatedGrievance = grievanceService.toggleSolvedStatus(id, userDetails.getUsername());
        if (updatedGrievance != null) {
            return ResponseEntity.ok(updatedGrievance); // Return the updated grievance object
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // Return 403 if not authorized
        }
    }

    // New endpoint to handle upvoting
    @PutMapping("/{grievanceId}/upvote")
    public ResponseEntity<Grievance> upvoteGrievance(@PathVariable Long grievanceId, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Grievance updatedGrievance = grievanceService.upvoteGrievance(grievanceId, userDetails.getUsername());
            return ResponseEntity.ok(updatedGrievance); // Return the updated grievance with upvote count
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null); // Return 400 if there's an issue (e.g., user has already upvoted)
        }
    }

    @GetMapping("/to-me")
    public List<Grievance> getGrievancesToMe(@RequestParam String email) {
        return grievanceService.findByConcernedStaffEmail(email); // Modify service accordingly
    }

}
