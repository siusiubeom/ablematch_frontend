"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {
    Briefcase,
    MessageSquare,
    CheckCircle,
    MapPin,
    Star,
} from "lucide-react";
import Header from "@/components/Header";
import ExplainModal from "@/components/ExplainModal";
import { apiFetch } from "@/lib/api";
import {MatchingExplain, MatchingCard, UserProfile, RecommendedCourse, JobBoardItem} from "@/lib/types";
import {useRouter} from "next/navigation";
import {getProfileImage} from "@/lib/profileImage";

function getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
}
import { Eye, Heart, Building2, Flame, Clock } from "lucide-react";
import JobCard from "@/components/JobCard";


export default function Dashboard() {
    const [tab, setTab] = useState<"matching" | "community">("matching");

    const [jobs, setJobs] = useState<MatchingCard[]>([]);
    const [selectedJob, setSelectedJob] = useState<MatchingCard | null>(null);
    const [explain, setExplain] = useState<MatchingExplain | null>(null);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [courses, setCourses] = useState<RecommendedCourse[]>([]);

    const [boardJobs, setBoardJobs] = useState<JobBoardItem[]>([]);
    const [boardSort, setBoardSort] = useState<
        "latest" | "popular" | "likes" | "company"
    >("latest");


    const router = useRouter();

    useEffect(() => {
        if (!getToken()) {
            router.replace("/");
        }
    }, []);


    function fetchMyProfile() {
        return apiFetch<UserProfile>("/api/me/profile");
    }

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            setProfileLoading(false);
            return;
        }

        const loadProfile = async () => {
            const profile = await fetchMyProfile();
            setProfile(profile); // profile may be null
            setProfileLoading(false);
        };

        loadProfile();
    }, []);






    useEffect(() => {
        const loadMatching = async () => {
            const res = await apiFetch<{
                status: string;
                data: MatchingCard[];
            }>("/api/matching");

            if (!res) return;

            if (res.status === "READY") {
                setJobs(res.data.slice(0, 20));
            }
        };

        loadMatching();
    }, []);

    useEffect(() => {
        console.log("MATCHING JOB SAMPLE:", jobs[0]);
    }, [jobs]);

    const SKILL_MAP: Record<string, string[]> = {
        "전공 적합": [profile?.major ?? ""],
        "기술 스택": ["Spring", "Backend"],
        "재택근무 가능": ["Remote"],
    };
    const skills = useMemo(() => {
        if (!profile) return [];

        return Array.from(
            new Set(
                jobs.flatMap((job) =>
                    job.highlights.flatMap(
                        (h) => SKILL_MAP[h] ?? []
                    )
                )
            )
        ).filter(Boolean);
    }, [jobs, profile]);

    useEffect(() => {
        console.log("PROFILE:", profile);
        console.log("SKILLS:", skills);
    }, [profile, skills]);


    const effectiveSkills = useMemo(() => {
        if (skills.length > 0) return skills;
        if (profile?.major) return [profile.major];
        return [];
    }, [skills, profile?.major]);

    const lastSkillsRef = useRef<string>("");

    useEffect(() => {
        if (effectiveSkills.length === 0) return;

        const key = effectiveSkills.join(",");
        if (lastSkillsRef.current === key) return;
        lastSkillsRef.current = key;

        apiFetch<RecommendedCourse[]>(
            `/api/courses/by-skills?` +
            effectiveSkills.map(s => `skills=${encodeURIComponent(s)}`).join("&")
        ).then(res => {
            if (!res) return;
            setCourses(res);
        });
    }, [effectiveSkills]);

    useEffect(() => {
        if (tab !== "community") return;

        apiFetch<JobBoardItem[]>(
            `/api/jobs/board?sort=${boardSort}`
        ).then((res) => {
            if (!res) return;
            setBoardJobs(res);
        });
    }, [tab, boardSort]);







    async function openExplain(job: MatchingCard) {
        const data = await apiFetch<MatchingExplain>(
            `/api/matching/${job.jobId}/explain`
        );
        setSelectedJob(job);
        setExplain(data);
    }


    return (
        <>
            <Header />

            <section className="w-full max-w-[1600px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-gray-50 text-gray-900">
                <aside className="lg:col-span-3 space-y-6">
                    <div className="rounded-2xl shadow-sm border p-6 relative bg-white">
                        <div className="absolute top-0 left-0 w-full h-20 bg-[#1A365D]" />

                        <div className="relative flex flex-col items-center mt-8">
                            <img
                                className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 mb-4"
                                src={getProfileImage(profile?.profileImageUrl)}
                                alt="avatar"
                            />

                            {profileLoading ? (
                                <>
                                    <div className="h-5 w-24 bg-gray-200 rounded mb-2" />
                                    <div className="h-4 w-32 bg-gray-100 rounded" />
                                </>
                            ) : profile ? (
                                <>
                                    <h2 className="text-xl font-bold">
                                        {profile.name}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {profile.preferredRole}
                                    </p>

                                    <button
                                        onClick={() => router.push("/profile")}
                                        className="mt-3 px-4 py-2 bg-[#1A365D] text-white text-sm font-bold rounded-lg hover:bg-[#2C5282]"
                                    >
                                        내 프로필 보기
                                    </button>


                                    <div className="mt-6 w-full pt-6 border-t text-sm space-y-2">
                                        <div className="flex justify-between">
                                            <span>전공</span>
                                            <span className="font-bold">
                                                {profile.major}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>학점</span>
                                            <span className="font-bold">
                                                {profile.gpa}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-red-500">
                                    프로필을 불러오지 못했습니다
                                </p>
                            )}
                            <button
                                onClick={() => router.push("/landing")}
                                className="mt-4 text-sm font-bold text-[#38B2AC] hover:underline"
                            >
                                이력서 다시 업로드
                            </button>
                        </div>
                    </div>

                    <div className="rounded-2xl border p-6 text-center bg-white">
                        <h3 className="font-bold mb-4 flex items-center justify-center gap-2">
                            <Star className="text-yellow-400" /> 내 역량 분석
                        </h3>
                        <div className="w-32 h-32 mx-auto rounded-full border-4 border-[#38B2AC] flex items-center justify-center">
                            <span className="text-xl font-bold">Top 15%</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            시장 평균 대비
                        </p>
                    </div>

                    <div className="rounded-2xl shadow-sm border p-6 bg-[#1A365D] text-white">
                        <h3 className="font-bold mb-2">Upskilling Plan</h3>
                        <p className="text-xs opacity-80 mb-4">
                            매칭률을 높일 수 있는 추천 강의입니다.
                        </p>

                        {courses.length === 0 ? (
                            <p className="text-xs opacity-70">추천 강의가 없습니다.</p>
                        ) : (
                            <ul className="space-y-2">
                                {courses.slice(0, 5).map((course) => (
                                    <li key={course.url}>
                                        <a
                                            href={course.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block px-3 py-2 rounded-lg bg-[#38B2AC] text-center font-bold hover:bg-[#319795]"
                                        >
                                            {course.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                </aside>

                <main className="lg:col-span-6 space-y-6">
                    <div className="flex rounded-xl p-1 border bg-white">
                        <button
                            onClick={() => setTab("matching")}
                            className={`flex-1 py-3 font-bold rounded-lg flex items-center justify-center gap-2 ${
                                tab === "matching"
                                    ? "bg-[#1A365D] text-white shadow"
                                    : "text-gray-500"
                            }`}
                        >
                            <Briefcase size={16} /> AI 직무 매칭
                        </button>
                        <button
                            onClick={() => setTab("community")}
                            className={`flex-1 py-3 font-bold rounded-lg flex items-center justify-center gap-2 ${
                                tab === "community"
                                    ? "bg-[#1A365D] text-white shadow"
                                    : "text-gray-500"
                            }`}
                        >
                            <Briefcase size={16} /> 채용 공고
                        </button>
                    </div>

                    {tab === "matching" && (
                        <div className="space-y-6">

                            <div className="p-4 rounded-xl flex items-center justify-between shadow-sm bg-gradient-to-r from-[#1A365D] to-[#2C5282] text-white">
                                <div>
                                    <p className="text-xs font-bold opacity-70 mb-1">
                                        AI ANALYSIS COMPLETE
                                    </p>
                                    <h3 className="font-bold text-lg">
                                        상위 적합 직무를 발견했습니다
                                    </h3>
                                </div>
                                <div className="bg-white/10 p-2 rounded-lg">
                                    <Briefcase />
                                </div>
                            </div>

                            {jobs.length === 0 && (
                                <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
                                    <div className="w-12 h-12 border-4 border-[#38B2AC] border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="text-sm font-bold">
                                        AI가 직무를 분석 중입니다…
                                    </p>
                                </div>
                            )}


                            {jobs.map((job) => (
                                <JobCard
                                    key={job.jobId}
                                    job={job}
                                    onClick={() => openExplain(job)}
                                />
                            ))}
                        </div>
                    )}


                    {tab === "community" && (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800">
                                    올라온 채용 공고
                                </h2>

                                <div className="flex bg-gray-100 rounded-lg p-1 text-sm font-semibold">
                                    <button
                                        onClick={() => setBoardSort("latest")}
                                        className={`px-3 py-1 rounded-md flex items-center gap-1 ${
                                            boardSort === "latest" ? "bg-white shadow" : "text-gray-500"
                                        }`}
                                    >
                                        <Clock size={14} /> 최신
                                    </button>
                                    <button
                                        onClick={() => setBoardSort("popular")}
                                        className={`px-3 py-1 rounded-md flex items-center gap-1 ${
                                            boardSort === "popular" ? "bg-white shadow" : "text-gray-500"
                                        }`}
                                    >
                                        <Flame size={14} /> 조회
                                    </button>
                                    <button
                                        onClick={() => setBoardSort("likes")}
                                        className={`px-3 py-1 rounded-md flex items-center gap-1 ${
                                            boardSort === "likes" ? "bg-white shadow" : "text-gray-500"
                                        }`}
                                    >
                                        <Heart size={14} /> 좋아요
                                    </button>
                                    <button
                                        onClick={() => setBoardSort("company")}
                                        className={`px-3 py-1 rounded-md flex items-center gap-1 ${
                                            boardSort === "company" ? "bg-white shadow" : "text-gray-500"
                                        }`}
                                    >
                                        <Building2 size={14} /> 회사
                                    </button>
                                </div>
                            </div>

                            {boardJobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="rounded-2xl border bg-white p-6 transition hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                                    onClick={async () => {
                                        await apiFetch(`/api/jobs/board/${job.id}/view`, {
                                            method: "POST",
                                        });

                                        setBoardJobs((prev) =>
                                            prev.map((j) =>
                                                j.id === job.id
                                                    ? { ...j, viewCount: j.viewCount + 1 }
                                                    : j
                                            )
                                        );

                                        window.open(job.sourceUrl, "_blank");
                                    }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                {job.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {job.company}
                                            </p>

                                            <span className="inline-block mt-3 px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full">
                                            {job.workType}
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-2 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Eye size={16} />
                                                {job.viewCount}
                                            </div>
                                            <div className="flex items-center gap-1 text-red-500">
                                                <Heart size={16} />
                                                {job.likeCount}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}


                </main>

                <aside className="lg:col-span-3 space-y-6">
                    <div className="rounded-2xl border p-6 bg-white h-[400px] flex items-center justify-center text-gray-400">
                        광고 배너
                    </div>

                    <div className="rounded-2xl border p-6 bg-white h-[300px] flex items-center justify-center text-gray-400">
                        스폰서 영역
                    </div>
                </aside>

            </section>

            {explain && selectedJob && (
                <ExplainModal
                    data={explain}
                    sourceUrl={selectedJob.sourceUrl}
                    company={selectedJob.company}
                    onClose={() => {
                        setExplain(null);
                        setSelectedJob(null);
                    }}
                />
            )}
        </>
    );
}
