"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getProfileImage } from "@/lib/profileImage";
import { apiFetch } from "@/lib/api";
import { UserProfile } from "@/lib/types";

function getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
}

function logout() {
    localStorage.removeItem("token");
}

interface HeaderProps {
    hideNav?: boolean;
}

export default function Header({ hideNav = false }: HeaderProps) {
    const router = useRouter();
    const [showProfile, setShowProfile] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!getToken());
    const [profileImage, setProfileImage] = useState<string | null>(null);

    useEffect(() => {
        if (!getToken()) return;

        apiFetch<UserProfile>("/api/me/profile").then((p) => {
            setProfileImage(p?.profileImageUrl ?? null);
        });
    }, []);

    return (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => router.push("/")}
                >
                    <Image
                        src="/icon.png"
                        alt="logo"
                        width={36}
                        height={36}
                        className="rounded"
                        priority
                    />
                    <span className="text-2xl font-bold tracking-tight text-[#1A365D]">
            ABLE MATCH
          </span>
                </div>

                {!hideNav && (
                    <nav className="flex items-center gap-16 font-bold text-gray-700">
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="hover:text-[#1A365D] transition"
                        >
                            대시보드
                        </button>
                        <button
                            onClick={() => router.push("/community")}
                            className="hover:text-[#1A365D] transition"
                        >
                            커뮤니티
                        </button>
                    </nav>
                )}

                <div className="flex items-center gap-3 relative">
                    <button
                        onClick={() => setShowProfile(!showProfile)}
                        className="w-9 h-9 rounded-full bg-gray-300 overflow-hidden border-2 border-white"
                    >
                        <img
                            src={getProfileImage(profileImage)}
                            alt="User"
                            className="w-full h-full object-cover"
                        />
                    </button>

                    {showProfile && (
                        <div className="absolute top-14 right-0 w-40 bg-white border rounded-xl shadow-lg text-sm z-50">
                            {isLoggedIn ? (
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsLoggedIn(false);
                                        router.push("/");
                                    }}
                                    className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <LogOut size={14} /> 로그아웃
                                </button>
                            ) : (
                                <button
                                    onClick={() => router.push("/login")}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50"
                                >
                                    로그인
                                </button>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
}
