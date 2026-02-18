package com.company.event.contestPackage.problem;


import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TestCase {
    @NonNull
    private String input;
    @NonNull
    private String expectedOutput;
    @NonNull
    private boolean hidden;
}
