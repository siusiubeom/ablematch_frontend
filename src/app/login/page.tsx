"use client";

import { useState } from "react";
import { setToken } from "@/lib/auth";
import {apiFetch, apiFetchRaw} from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    async function login() {
        setError(null);
        setLoading(true);

        try {
            const res = await apiFetch<{ accessToken: string }>("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });

            if (!res) {
                throw new Error("Login failed");
            }

            setToken(res.accessToken);

            const profileRes = await apiFetchRaw("/api/me/profile");

            if (profileRes.status === 200) {
                router.replace("/dashboard");
            } else {
                router.replace("/");
            }
        } catch {
            setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 space-y-6">

                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-[#1A365D]">
                        ABLE MATCH 로그인
                    </h1>
                    <p className="text-sm text-gray-500">
                        계정에 로그인하여 AI 매칭을 시작하세요
                    </p>
                </div>

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
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
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
                            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#38B2AC]"
                            placeholder="비밀번호 입력"
                        />
                    </div>

                    <button
                        onClick={login}
                        disabled={loading}
                        className="w-full bg-[#1A365D] text-white py-3 rounded-xl font-bold text-lg hover:bg-[#152C4E] disabled:opacity-50"
                    >
                        {loading ? "로그인 중..." : "로그인"}
                    </button>
                </div>

                <p className="text-sm text-center text-gray-500">
                    계정이 없나요?{" "}
                    <span
                        className="text-[#38B2AC] cursor-pointer font-bold hover:underline"
                        onClick={() => router.push("/signup")}
                    >
                        회원가입
                    </span>
                </p>
            </div>
        </div>
    );
}
