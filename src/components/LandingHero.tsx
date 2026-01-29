"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { Briefcase, MapPin, MessageSquare, Upload } from "lucide-react";

const STEPS = [
    "📄 이력서 업로드 중...",
    "🧠 AI가 역량을 분석 중...",
    "♿ 근무 환경 적합성 분석 중...",
    "✨ 최적의 직무 매칭 중...",
];

export default function LandingHero({
                                        setLoading,
                                        setStep,
                                    }: {
    setLoading: (v: boolean) => void;
    setStep: (v: number | ((s: number) => number)) => void;
}) {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);

    async function submit() {
        const token = getToken();
        if (!token) {
            router.push("/login");
            return;
        }
        if (!file) return;

        setLoading(true);
        setStep(0);

        const interval = setInterval(() => {
            setStep((s) => Math.min(s + 1, STEPS.length - 1));
        }, 1000);

        try {

            const formData = new FormData();
            formData.append("file", file);

            await fetch("https://ablematchbackend-1.onrender.com/api/resume/upload", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            await fetch("https://ablematchbackend-1.onrender.com/api/me/profile/from-resume", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            clearInterval(interval);
            router.replace("/dashboard");
        } catch {
            clearInterval(interval);
            setLoading(false);
            alert("업로드 실패");
        }
    }

    return (
        <section className="relative overflow-hidden py-24 text-center">
            <div className="max-w-6xl mx-auto px-6">
                <span className="inline-block py-1 px-3 rounded-full bg-teal-50 text-teal-700 font-bold mb-6 text-sm border border-teal-200">
                    Professional Career Platform
                </span>

                <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight">
                    신체적 제약이 아닌,<br />
                    <span className="text-[#38B2AC]">당신의 전문성</span>으로 평가받는 곳
                </h1>

                <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                    AI가 당신의 전공, 기술, 근무 가능 환경을 분석하여<br />
                    실제로 가능한 커리어만 추천합니다.
                </p>

                <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl text-center space-y-6">
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx,.hwp"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="w-full border p-3 rounded-lg"
                    />

                    {file && (
                        <p className="text-sm text-gray-600">
                            선택됨: <b>{file.name}</b>
                        </p>
                    )}

                    <button
                        onClick={submit}
                        className="group w-full text-white text-xl font-bold py-5 rounded-2xl shadow-xl transition-transform hover:-translate-y-1 bg-[#1A365D] hover:bg-[#152C4E] flex items-center justify-center gap-3"
                    >
                        <Upload /> 이력서 업로드하고 AI 매칭 시작
                    </button>
                </div>

                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <Feature
                        icon={<Briefcase />}
                        title="기술 중심 매칭"
                        desc="장애 유형보다 보유 기술 스택을 우선 매칭합니다."
                    />
                    <Feature
                        icon={<MapPin />}
                        title="배리어프리 검증"
                        desc="실제 근무 환경 접근성 데이터를 분석합니다."
                    />
                    <Feature
                        icon={<MessageSquare />}
                        title="현직자 커뮤니티"
                        desc="직무별 멘토링과 생생한 취업 정보를 공유하세요."
                    />
                </div>
            </div>
        </section>
    );
}

function Feature({
                     icon,
                     title,
                     desc,
                 }: {
    icon: React.ReactNode;
    title: string;
    desc: string;
}) {
    return (
        <div className="p-6 rounded-2xl border bg-white shadow-sm">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-blue-50 text-[#1A365D]">
                {icon}
            </div>

            <h3 className="font-extrabold text-lg tracking-tight text-gray-900 mb-2">
                {title}
            </h3>

            <p className="text-sm leading-relaxed text-gray-600">
                {desc}
            </p>
        </div>
    );
}
