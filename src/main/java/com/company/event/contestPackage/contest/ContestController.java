package com.company.event.contestPackage.contest;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/contest")
@RequiredArgsConstructor
public class ContestController {

    private final ContestService contestService;

    @PostMapping
    public ResponseEntity<ContestResponse> createContest(@RequestBody ContestRequest request) {
        return ResponseEntity.ok(contestService.createContest(request));
    }

    @GetMapping
    public ResponseEntity<?> getAllContests() {
        return ResponseEntity.ok(contestService.getAllContests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getContest(@PathVariable String id) {

        ContestResponse contest = contestService.getContestById(id);
        String status = contestService.getContestStatus(contest);

        Map<String, Object> response = new HashMap<>();
        response.put("contest", contest);
        response.put("status", status);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteContest(@PathVariable String id) {
        contestService.deleteContest(id);
        return ResponseEntity.ok("Contest deleted successfully.");
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContestResponse> updateContest(
            @PathVariable String id,
            @RequestBody ContestRequest request
    ) {
        return ResponseEntity.ok(contestService.updateContest(request, id));
    }
}
