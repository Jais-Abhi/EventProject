package com.company.event.contestPackage.submission;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends MongoRepository<Submission,String> {

    List<Submission> findAllByUserId(String userId);

    List<Submission> findAllByContestId(String contestId);

    List<Submission> findAllByProblemId(String problemId);

    boolean existsByUserIdAndProblemIdAndContestIdAndVerdict(
            String userId, String problemId, String contestId, String verdict);

    List<Submission> findAllByUserIdAndContestIdAndProblemId(
            String userId, String contestId, String problemId);
}
