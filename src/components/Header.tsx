"use client";

import { Bell, Eye, Type, LogOut } from "lucide-react";
import {useState} from "react";

import { useRouter } from "next/navigation";

function getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
}

function logout() {
    localStorage.removeItem("token");
}


export default function Header() {
    const router = useRouter();
    const [showProfile, setShowProfile] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!getToken());

    return (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => router.push("/")}
                >
                    <div className="w-9 h-9 rounded flex items-center justify-center font-bold text-xl bg-[#1A365D] text-white">
                        A
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-[#1A365D]">
                        ABLE MATCH
                    </span>
                </div>

                <div className="flex items-center gap-3 relative">

                    <button
                        onClick={() => setShowProfile(!showProfile)}
                        className="w-9 h-9 rounded-full bg-gray-300 overflow-hidden border-2 border-white"
                    >
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                            alt="User"
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
