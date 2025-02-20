package com.marees.grievences_portal.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Grievance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Lob
    private String content;

    private LocalDateTime createdAt;

    private String ownerUserName;

    @Column(name = "user_email")
    private String studentEmail;

    @Column(name = "is_solved")
    private Boolean isSolved = false;

    private String department;

    private int upvoteCount = 0;

    @ElementCollection
    private Set<String> usersWhoUpvoted = new HashSet<>();

    @Column(name = "concerned_staff_email") // Ensure the column name is consistent with the database
    private String concernedStaffEmail;
}
