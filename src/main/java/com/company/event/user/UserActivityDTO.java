package com.company.event.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserActivityDTO {
    private List<McqActivity> mcqActivities;
    private List<ContestActivity> contestActivities;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class McqActivity {
        private String eventId;
        private String title;
        private Instant registeredAt;
        private Instant submittedAt;
        private String status; // REGISTERED, COMPLETED, IN_PROGRESS
        private Double score;
        private Integer totalMarks;
        private Integer rank;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ContestActivity {
        private String contestId;
        private String title;
        private Integer problemsSolved;
        private Integer totalProblems;
        private Integer totalScore;
        private Instant lastSubmissionTime;
        private Integer rank;
    }
}
