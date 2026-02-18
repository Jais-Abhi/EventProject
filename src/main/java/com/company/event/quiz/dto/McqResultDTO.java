package com.company.event.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class McqResultDTO {

    private Integer score;
    private Integer correctAnswers;
    private Integer wrongAnswers;
    private Integer rank;
}

