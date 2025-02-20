package com.marees.grievences_portal.service;

import com.marees.grievences_portal.models.Grievance;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface GrievanceService {




    Grievance createGrievanceForUser(String username, String content, String department, String concernedStaffEmail, String studentEmail);

    Grievance toggleSolvedStatus(Long grievanceId, String userEmail);

    Grievance updateGrievanceForUser(Long grievanceId, Grievance grievance, String username);


    void deleteGrievancesForUser(Long grievanceId, String username);

    List<Grievance> findAllGrievances();

    List<Grievance> getGrievancesForUser(String username);


    Grievance upvoteGrievance(Long grievanceId, String username);

    List<Grievance> findByConcernedStaffEmail(String email);
}
