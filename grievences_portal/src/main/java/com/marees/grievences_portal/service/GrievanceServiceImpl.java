package com.marees.grievences_portal.service;

import com.marees.grievences_portal.models.AppRole;
import com.marees.grievences_portal.models.Grievance;
import com.marees.grievences_portal.models.User;
import com.marees.grievences_portal.repository.GrievanceRepository;
import com.marees.grievences_portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class GrievanceServiceImpl implements GrievanceService {

    @Autowired
    public GrievanceRepository grievancesRepository;

    @Autowired
    public UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Override
    public Grievance createGrievanceForUser(String username, String content, String department, String concernedStaffEmail, String studentEmail) {
        Grievance grievance = new Grievance();
        grievance.setContent(content);
        grievance.setOwnerUserName(username);
        grievance.setStudentEmail(studentEmail);
        grievance.setCreatedAt(LocalDateTime.now()); // Set the current time
        grievance.setDepartment(department); // Set the department
        grievance.setConcernedStaffEmail(concernedStaffEmail);// Set the concerned staff

        Grievance savedGrievance = grievancesRepository.save(grievance);
        auditLogService.logGrievanceCreation(username, grievance);
        return savedGrievance;
    }

    @Override
    public Grievance toggleSolvedStatus(Long grievanceId, String userName) {
        Optional<Grievance> grievanceOptional = grievancesRepository.findById(grievanceId);
        if (grievanceOptional.isPresent()) {
            Grievance grievance = grievanceOptional.get();
            Optional<User> user = userRepository.findByUserName(userName);

            Set<AppRole> allowedRoles = Set.of(AppRole.ROLE_TEACHING, AppRole.ROLE_NONTEACHING, AppRole.ROLE_ADMIN);
            if (user.isPresent() && allowedRoles.contains(user.get().getRole().getRoleName())) {
                grievance.setIsSolved(!grievance.getIsSolved()); // Toggle the solved status
                return grievancesRepository.save(grievance); // Save and return the updated grievance
            }
        }
        return null; // Return null if the grievance is not found or the user is not authorized
    }

    @Override
    public Grievance updateGrievanceForUser(Long grievanceId, Grievance grievance, String username) {
        Grievance existingGrievance = grievancesRepository.findById(grievanceId)
                .orElseThrow(() -> new RuntimeException("Grievance Not Found"));

        // Ensure the user is the owner or handle authorization
        if (!existingGrievance.getOwnerUserName().equals(username)) {
            throw new RuntimeException("You are not authorized to update this grievance");
        }

        // Update the grievance fields
        existingGrievance.setContent(grievance.getContent());
        existingGrievance.setDepartment(grievance.getDepartment());
        existingGrievance.setConcernedStaffEmail(grievance.getConcernedStaffEmail());

        Grievance updatedGrievance = grievancesRepository.save(existingGrievance);
        auditLogService.logGrievanceUpdate(username, grievance);
        return updatedGrievance;
    }

    @Override
    public void deleteGrievancesForUser(Long grievanceId, String username) {
        Grievance grievance = grievancesRepository.findById(grievanceId).orElseThrow(
                () -> new RuntimeException("Grievance Not Found"));
        auditLogService.logGrievanceDeletion(username, grievanceId);
        grievancesRepository.delete(grievance);
    }

    @Override
    public List<Grievance> findAllGrievances() {
        return grievancesRepository.findAll();
    }

    @Override
    public List<Grievance> getGrievancesForUser(String username) {
        List<Grievance> personalGrievances = grievancesRepository.findByOwnerUserName(username);
        return personalGrievances;
    }

    @Override
    public Grievance upvoteGrievance(Long grievanceId, String username) {
        Optional<Grievance> grievanceOptional = grievancesRepository.findById(grievanceId);
        if (grievanceOptional.isPresent()) {
            Grievance grievance = grievanceOptional.get();
            // Toggle upvote: if user has already upvoted, remove the upvote; otherwise, add the upvote
            if (grievance.getUsersWhoUpvoted().contains(username)) {
                grievance.getUsersWhoUpvoted().remove(username);
                grievance.setUpvoteCount(grievance.getUpvoteCount() - 1); // Decrease upvote count
            } else {
                grievance.getUsersWhoUpvoted().add(username);
                grievance.setUpvoteCount(grievance.getUpvoteCount() + 1); // Increase upvote count
            }
            return grievancesRepository.save(grievance); // Save the updated grievance
        }
        throw new RuntimeException("Grievance not found");
    }

    @Override
    public List<Grievance> findByConcernedStaffEmail(String email) {
        return grievancesRepository.findByConcernedStaffEmail(email);
    }
}
