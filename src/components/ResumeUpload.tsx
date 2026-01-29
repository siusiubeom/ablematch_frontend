"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
    "📄 이력서 업로드 중...",
    "🧠 AI가 역량을 분석 중...",
    "♿ 근무 환경 적합성 분석 중...",
    "✨ 최적의 직무 매칭 중...",
];

export default function ResumeUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);
    const router = useRouter();



    async function readFileText(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    async function submit() {
        if (!file || loading) return;

        setLoading(true);
        setStep(0);

        const interval = setInterval(() => {
            setStep((s) => Math.min(s + 1, STEPS.length - 1));
        }, 1200);

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No auth token");

            const resumeText = await readFileText(file);

            const formData = new FormData();
            formData.append("file", file);

            await fetch("http://localhost:8090/api/resume/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            await fetch("http://localhost:8090/api/me/profile/from-resume", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ resumeText }),
            });

            clearInterval(interval);

            setTimeout(() => {
                router.replace("/dashboard");
            }, 800);

        } catch (e) {
            console.error(e);
            alert("업로드 실패");
            clearInterval(interval);
            setLoading(false);
        }
    }


    return (
        <>
            <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow text-center space-y-6">
                <h2 className="text-2xl font-bold">이력서 업로드</h2>
                <p className="text-sm text-gray-500">
                    PDF / Word / HWP 파일을 업로드하세요.
                </p>

                <input
                    type="file"
                    accept=".pdf,.doc,.docx,.hwp"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full border p-3 rounded"
                    disabled={loading}
                />

                {file && (
                    <p className="text-sm text-gray-600">
                        선택됨: <b>{file.name}</b>
                    </p>
                )}

                <button
                    onClick={submit}
                    disabled={loading}
                    className="w-full bg-[#1A365D] text-white py-3 rounded-xl font-bold disabled:opacity-50"
                >
                    AI 매칭 시작
                </button>
            </div>

            {loading && (
                <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center text-white">
                    <div className="w-20 h-20 border-4 border-[#38B2AC] border-t-transparent rounded-full animate-spin mb-6" />
                    <h2 className="text-2xl font-bold animate-pulse">
                        {STEPS[step]}
                    </h2>
                </div>
            )}
        </>
    );
}
