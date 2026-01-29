export interface MatchingCard {
    jobId: string;
    title: string;
    company: string;
    score: number;
    highlights: string[];
    workType: string;
    sourceUrl: string;
}

export interface MatchingExplain {
    jobTitle: string;
    score: number;
    breakdown: {
        skill: number;
        accessibility: number;
        workType: number;
    };
    missingSkills: string[];
    impossibleReason?: string;
}



export type UserProfile = {
    id: string;
    name: string;
    major: string;
    gpa: string;
    preferredRole: string;
};

export interface RecommendedCourse {
    skill: string;
    title: string;
    url: string;
}