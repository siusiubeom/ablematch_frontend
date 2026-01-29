"use client";

import { useState } from "react";
import Header from "@/components/Header";
import LandingHero from "@/components/LandingHero";
import FeatureCard from "@/components/FeatureCard";

const STEPS = [
    "📄 이력서 업로드 중...",
    "🧠 AI가 역량을 분석 중...",
    "♿ 근무 환경 적합성 분석 중...",
    "✨ 최적의 직무 매칭 중...",
];

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);

    return (
        <>
            <Header />

            {loading && (
                <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center text-white">
                    <div className="w-20 h-20 border-4 border-[#38B2AC] border-t-transparent rounded-full animate-spin mb-6" />
                    <h2 className="text-2xl font-bold animate-pulse">
                        {STEPS[step]}
                    </h2>
                </div>
            )}

            <main className="bg-gray-50 py-20 space-y-24">
                <LandingHero
                    setLoading={setLoading}
                    setStep={setStep}
                />

            </main>
        </>
    );
}
