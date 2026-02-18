package com.company.event.contestPackage.leaderboard;

import com.company.event.contestPackage.contest.Contest;
import com.company.event.contestPackage.contest.ContestRepository;
import com.company.event.contestPackage.submission.Submission;
import com.company.event.contestPackage.submission.SubmissionRepository;
import com.company.event.user.User;
import com.company.event.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final SubmissionRepository submissionRepository;
    private final ContestRepository contestRepository;
    private final UserRepository userRepository;

    public List<LeaderboardEntry> getLeaderboard(String contestId) {

        // Validate contest exists
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Contest Not Found."
                        ));

        List<Submission> submissions =
                submissionRepository.findAllByContestId(contestId);

        // Map<userId, Map<problemId, bestSubmission>>
        Map<String, Map<String, Submission>> bestSubmissions = new HashMap<>();

        for (Submission sub : submissions) {

            bestSubmissions
                    .computeIfAbsent(sub.getUserId(), k -> new HashMap<>());

            Map<String, Submission> userProblems =
                    bestSubmissions.get(sub.getUserId());

            Submission existing =
                    userProblems.get(sub.getProblemId());

            // Keep best score submission
            if (existing == null ||
                    sub.getScore() > existing.getScore()) {

                userProblems.put(sub.getProblemId(), sub);
            }
        }

        List<LeaderboardEntry> leaderboard = new ArrayList<>();

        for (String userId : bestSubmissions.keySet()) {

            Map<String, Submission> userProblems =
                    bestSubmissions.get(userId);

            int totalScore = 0;
            int solved = 0;
            Instant lastTime = null;

            for (Submission sub : userProblems.values()) {

                totalScore += sub.getScore();

                if (sub.getScore() > 0)
                    solved++;

                Instant submittedAt = Instant.from(sub.getSubmittedAt());

                if (lastTime == null ||
                        submittedAt.isAfter(lastTime)) {

                    lastTime = submittedAt;
                }
            }

            User user = userRepository.findById(userId).orElse(null);
            String username = user != null ? user.getUsername() : "Unknown";
            String rollNumber = user != null ? user.getRollNumber() : "N/A";

            leaderboard.add(
                    LeaderboardEntry.builder()
                            .userId(userId)
                            .username(username)
                            .rollNumber(rollNumber)
                            .totalScore(totalScore)
                            .problemsSolved(solved)
                            .lastSubmissionTime(lastTime)
                            .build()
            );
        }

        // Sort:
        leaderboard.sort((a, b) -> {

            if (b.getTotalScore() != a.getTotalScore()) {
                return Integer.compare(
                        b.getTotalScore(),
                        a.getTotalScore()
                );
            }

            // Handle null safety
            if (a.getLastSubmissionTime() == null) return 1;
            if (b.getLastSubmissionTime() == null) return -1;

            return a.getLastSubmissionTime()
                    .compareTo(b.getLastSubmissionTime());
        });

        return leaderboard;
    }
}
