"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    async function signup() {
        setError(null);
        setLoading(true);

        try {
            await apiFetch("/auth/signup", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });

            setSuccess(true);
            setTimeout(() => router.replace("/login"), 1500);
        } catch (e: any) {
            if (e.status === 409) {
                setError("이미 가입된 이메일입니다.");
            } else {
                setError("회원가입에 실패했습니다.");
            }
        }finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-[#1A365D]">
                        ABLE MATCH 회원가입
                    </h1>
                    <p className="text-sm text-gray-500">
                        간단한 정보로 바로 시작하세요
                    </p>
                </div>

                {success && (
                    <div className="bg-green-50 text-green-700 text-sm font-bold px-4 py-3 rounded-lg">
                        회원가입 완료! 로그인 페이지로 이동합니다.
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm font-bold px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700">
                            이메일
                        </label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="
w-full rounded-lg px-4 py-3 border
bg-white text-gray-900 placeholder-gray-400
dark:bg-slate-800 dark:text-gray-100 dark:placeholder-gray-400 dark:border-slate-600
focus:outline-none focus:ring-2 focus:ring-[#38B2AC]
"
                            placeholder="example@email.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700">
                            비밀번호
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="
w-full rounded-lg px-4 py-3 border
bg-white text-gray-900 placeholder-gray-400
dark:bg-slate-800 dark:text-gray-100 dark:placeholder-gray-400 dark:border-slate-600
focus:outline-none focus:ring-2 focus:ring-[#38B2AC]
"
                            placeholder="비밀번호 입력"
                        />
                    </div>

                    <button
                        onClick={signup}
                        disabled={loading}
                        className="w-full bg-[#1A365D] text-white py-3 rounded-xl font-bold text-lg hover:bg-[#152C4E] disabled:opacity-50"
                    >
                        {loading ? "가입 중..." : "회원가입"}
                    </button>
                </div>

                <p className="text-sm text-center text-gray-500">
                    이미 계정이 있나요?{" "}
                    <span
                        className="text-[#38B2AC] cursor-pointer font-bold hover:underline"
                        onClick={() => router.push("/login")}
                    >
                        로그인
                    </span>
                </p>
            </div>
        </div>
    );
}
