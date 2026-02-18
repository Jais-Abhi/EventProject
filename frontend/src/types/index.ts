// User
export interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    fatherName?: string;
    course: string;
    branch: string;
    role: 'ADMIN' | 'STUDENT'; // Assuming role is returned or inferred
}

// Event (MCQ)
export interface Event {
    id: string;
    title: string;
    type: string; // "MCQ"
    startTime: string;
    endTime: string;
    durationInMinutes: number;
    attendanceProcessed: boolean;
    totalMarks: number;
    status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
}

// Contest
export interface Contest {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    problemIds: string[];
    status?: 'UPCOMING' | 'LIVE' | 'ENDED'; // Derived or from API
}

// Problem
export interface Problem {
    id: string;
    title: string;
    description: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    testCases?: TestCase[]; // Hidden in some views
}

export interface TestCase {
    input: string;
    expectedOutput: string;
    hidden: boolean;
}

// Submission
export interface Submission {
    id: string;
    userId: string;
    contestId: string;
    problemId: string;
    code: string;
    language: string;
    verdict: string; // "ACCEPTED", "WRONG_ANSWER", etc.
    score: number;
    submittedAt: string;
}

// MCQ Types
export interface Question {
    questionId?: string; // or id? Spec says CreateQuestionDTO doesn't have id, but fetching usually does.
    questionText: string;
    options: string[];
    marks: number;
    negativeMarks: number;
    // correctOption is hidden for students
}

export interface McqResult {
    score: number;
    correctAnswers: number;
    wrongAnswers: number;
    rank: number;
}

export interface LeaderboardEntry {
    userId: string;
    totalScore: number;
    problemsSolved: number;
    lastSubmissionTime: string;
}
