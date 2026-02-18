package com.company.event.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TopPerformerDTO {

    private String studentId;
    private String username;
    private String rollNumber;
    private Double score;
    private int rank;
}
