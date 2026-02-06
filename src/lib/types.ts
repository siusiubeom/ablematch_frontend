export interface MatchingCard {
    jobId: string;
    title: string;
    company: string;
    score: number;
    highlights: string[];
    workType: string;
    sourceUrl: string;
    distanceKm?: number;
    dueDateText?: string; // ADD
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
    company?: string;
    companyAddress?: string;
}


export type UserProfile = {
    id: string;
    name: string;
    major: string;
    gpa: string;
    preferredRole: string;
    location: string | null;
    profileImageUrl: string | null;
};

export interface RecommendedCourse {
    skill: string;
    title: string;
    url: string;
}

export type JobBoardItem = {
    id: string;
    title: string;
    company: string;
    workType: string;
    sourceUrl: string;
    viewCount: number;
    likeCount: number;
    dueDateText?: string;
};
