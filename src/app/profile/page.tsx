"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { getProfileImage } from "@/lib/profileImage";

type Profile = {
    name: string;
    preferredRole: string;
    gpa: string;
    location: string | null;
    profileImageUrl: string | null;
};

export default function ProfilePage() {
    const router = useRouter();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [locLoading, setLocLoading] = useState(false);

    useEffect(() => {
        apiFetch<Profile>("/api/me/profile").then((res) => {
            setProfile(res);
            setLoading(false);
        });
    }, []);

    async function saveProfile() {
        if (!profile) return;

        await apiFetch("/api/me/profile", {
            method: "PUT",
            body: JSON.stringify({
                name: profile.name,
                preferredRole: profile.preferredRole,
                location: profile.location,
                gpa: profile.gpa,
            }),
        });

        alert("저장되었습니다");
    }

    async function detectLocation() {
        setLocLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;

                    const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/maps/reverse?lat=${latitude}&lng=${longitude}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
                            },
                        }
                    );

                    if (!res.ok) throw new Error("reverse failed");

                    const address = await res.text();

                    setProfile((p) =>
                        p
                            ? {
                                ...p,
                                location: address || "현재 위치",
                            }
                            : p
                    );
                } catch (e) {
                    alert("위치를 가져오지 못했습니다.");
                } finally {
                    setLocLoading(false);
                }
            },
            () => {
                alert("위치 권한이 거부되었거나 오류가 발생했습니다.");
                setLocLoading(false);
            }
        );
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.length) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/me/profile/image`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: formData,
            }
        );

        if (!res.ok) {
            alert("업로드 실패");
            return;
        }

        const updated = await res.json();
        setProfile(updated);
    }

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-10 h-10 border-4 border-[#38B2AC] border-t-transparent rounded-full animate-spin" />
            </div>
        );

    if (!profile) return <p className="p-10">No profile</p>;

    return (
        <>
            <Header />

            <section className="max-w-3xl mx-auto p-8 space-y-8 bg-white text-gray-900">
                <h1 className="text-3xl font-extrabold tracking-tight">내 프로필</h1>

                {/* Avatar */}
                <div className="flex items-center gap-6">
                    <img
                        src={getProfileImage(profile.profileImageUrl)}
                        className="w-28 h-28 rounded-full bg-gray-200 border-4 border-white shadow-md"
                    />

                    <label className="text-sm font-bold text-[#2E75B6] cursor-pointer hover:opacity-80">
                        프로필 이미지 변경
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </label>
                </div>

                <input
                    value={profile.name}
                    onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                    }
                    className="w-full border border-gray-200 p-4 rounded-lg focus:ring-2 focus:ring-[#2E75B6]/30 outline-none"
                    placeholder="이름"
                />

                <input
                    pattern="[0-9.]+\/[0-9.]+"
                    value={profile.gpa}
                    onChange={(e) =>
                        setProfile({ ...profile, gpa: e.target.value })
                    }
                    className="w-full border border-gray-200 p-4 rounded-lg focus:ring-2 focus:ring-[#2E75B6]/30 outline-none"
                    placeholder="학점 (예: 4.12/4.5)"
                />

                <input
                    value={profile.preferredRole}
                    onChange={(e) =>
                        setProfile({ ...profile, preferredRole: e.target.value })
                    }
                    className="w-full border border-gray-200 p-4 rounded-lg focus:ring-2 focus:ring-[#2E75B6]/30 outline-none"
                    placeholder="희망 직무"
                />

                <div className="space-y-3">
                    <input
                        value={profile.location ?? ""}
                        onChange={(e) =>
                            setProfile({ ...profile, location: e.target.value })
                        }
                        className="w-full border border-gray-200 p-4 rounded-lg focus:ring-2 focus:ring-[#2E75B6]/30 outline-none"
                        placeholder="위치"
                    />

                    <button
                        onClick={detectLocation}
                        className="px-4 py-2 text-sm font-bold text-[#2E75B6] bg-[#2E75B6]/10 rounded-lg hover:opacity-80 transition"
                    >
                        {locLoading ? "위치 찾는 중..." : "현재 위치 감지"}
                    </button>
                </div>

                <button
                    onClick={saveProfile}
                    className="w-full py-4 bg-[#1A365D] text-white font-extrabold rounded-lg hover:bg-[#2C5282] transition"
                >
                    저장
                </button>
            </section>
        </>
    );
}
