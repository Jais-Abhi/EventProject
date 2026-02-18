package com.company.event.user;

import com.company.event.quiz.model.Event;
import com.company.event.quiz.model.EventRegistration;
import com.company.event.quiz.model.McqSubmission;
import com.company.event.quiz.repository.EventRegistrationRepository;
import com.company.event.quiz.repository.EventRepository;
import com.company.event.quiz.repository.McqSubmissionRepository;
import com.company.event.contestPackage.contest.Contest;
import com.company.event.contestPackage.contest.ContestRepository;
import com.company.event.contestPackage.submission.Submission;
import com.company.event.contestPackage.submission.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserActivityService {

    private final EventRegistrationRepository registrationRepository;
    private final McqSubmissionRepository mcqSubmissionRepository;
    private final EventRepository eventRepository;
    private final ContestRepository contestRepository;
    private final SubmissionRepository submissionRepository;

    public UserActivityDTO getUserActivity(String userId) {
        return UserActivityDTO.builder()
                .mcqActivities(getMcqActivities(userId))
                .contestActivities(getContestActivities(userId))
                .build();
    }

    private List<UserActivityDTO.McqActivity> getMcqActivities(String studentId) {
        List<EventRegistration> registrations = registrationRepository.findByStudentId(studentId);
        List<UserActivityDTO.McqActivity> activities = new ArrayList<>();

        for (EventRegistration reg : registrations) {
            if (reg.getEventId() == null) continue;
            
            Event event = eventRepository.findById(reg.getEventId()).orElse(null);
            if (event == null) continue;

            Optional<McqSubmission> submissionOpt = mcqSubmissionRepository.findTopByStudentIdAndEventIdOrderByStartTimeDesc(studentId, reg.getEventId());
            
            UserActivityDTO.McqActivity activity = UserActivityDTO.McqActivity.builder()
                    .eventId(event.getId())
                    .title(event.getTitle())
                    .registeredAt(reg.getRegisteredAt() != null ? reg.getRegisteredAt() : Instant.now())
                    .totalMarks(event.getTotalMarks())
                    .status("REGISTERED")
                    .build();

            if (submissionOpt.isPresent()) {
                McqSubmission sub = submissionOpt.get();
                activity.setSubmittedAt(sub.getSubmittedAt());
                activity.setScore(sub.getTotalScore());
                activity.setStatus(sub.getStatus());
                
                // Calculate rank
                try {
                    List<McqSubmission> allSubs = mcqSubmissionRepository.findByEventIdOrderByTotalScoreDescSubmittedAtAsc(event.getId());
                    if (allSubs != null) {
                        for (int i = 0; i < allSubs.size(); i++) {
                            McqSubmission s = allSubs.get(i);
                            if (s != null && s.getStudentId() != null && s.getStudentId().equals(studentId)) {
                                activity.setRank(i + 1);
                                break;
                            }
                        }
                    }
                } catch (Exception e) {
                    // Log or handle rank calculation error gracefully
                }
            }

            activities.add(activity);
        }

        // Sort by registeredAt desc
        activities.sort((a, b) -> {
            if (a.getRegisteredAt() == null && b.getRegisteredAt() == null) return 0;
            if (a.getRegisteredAt() == null) return 1;
            if (b.getRegisteredAt() == null) return -1;
            return b.getRegisteredAt().compareTo(a.getRegisteredAt());
        });
        return activities;
    }

    private List<UserActivityDTO.ContestActivity> getContestActivities(String userId) {
        List<Submission> submissions = submissionRepository.findAllByUserId(userId);
        if (submissions == null) return new ArrayList<>();
        
        Map<String, List<Submission>> contestSubmissions = submissions.stream()
                .filter(s -> s.getContestId() != null)
                .collect(Collectors.groupingBy(Submission::getContestId));

        List<UserActivityDTO.ContestActivity> activities = new ArrayList<>();

        for (Map.Entry<String, List<Submission>> entry : contestSubmissions.entrySet()) {
            String contestId = entry.getKey();
            List<Submission> subs = entry.getValue();

            Contest contest = contestRepository.findById(contestId).orElse(null);
            if (contest == null) continue;

            // Group by problem and get best score per problem
            Map<String, Integer> bestScores = new HashMap<>();
            Instant lastSub = null;
            for (Submission s : subs) {
                if (s.getProblemId() == null) continue;
                int score = s.getScore() != null ? s.getScore() : 0;
                bestScores.put(s.getProblemId(), Math.max(bestScores.getOrDefault(s.getProblemId(), 0), score));
                if (s.getSubmittedAt() != null && (lastSub == null || s.getSubmittedAt().isAfter(lastSub))) {
                    lastSub = s.getSubmittedAt();
                }
            }

            int totalScore = bestScores.values().stream().mapToInt(Integer::intValue).sum();
            int solved = (int) bestScores.values().stream().filter(s -> s > 0).count();

            activities.add(UserActivityDTO.ContestActivity.builder()
                    .contestId(contestId)
                    .title(contest.getTitle())
                    .problemsSolved(solved)
                    .totalProblems(contest.getProblemIds() != null ? contest.getProblemIds().size() : 0)
                    .totalScore(totalScore)
                    .lastSubmissionTime(lastSub)
                    .build());
        }

        // Sort by lastSubmissionTime desc
        activities.sort((a, b) -> {
            if (a.getLastSubmissionTime() == null) return 1;
            if (b.getLastSubmissionTime() == null) return -1;
            return b.getLastSubmissionTime().compareTo(a.getLastSubmissionTime());
        });
        
        return activities;
    }
}
