"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import {getProfileImage} from "@/lib/profileImage";

type Profile = {
    name: string;
    preferredRole: string;
    location: string | null;
    profileImageUrl: string | null;
};

export default function ProfilePage() {
    const router = useRouter();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

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
            }),
        });

        alert("저장되었습니다");
    }

    async function updateImage(url: string) {
        await apiFetch("/api/me/profile/image", {
            method: "POST",
            body: JSON.stringify({ url }),
        });
    }

    function detectLocation() {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;

            const geo = await apiFetch<any>(
                `/api/maps/geocode?query=${latitude},${longitude}`
            );

            setProfile((p) =>
                p
                    ? {
                        ...p,
                        location: geo?.roadAddress ?? "현재 위치",
                    }
                    : p
            );
        });
    }


    if (loading) return <p className="p-10">Loading...</p>;
    if (!profile) return <p className="p-10">No profile</p>;

    return (
        <>
            <Header />

            <section className="max-w-3xl mx-auto p-8 space-y-6">
                <h1 className="text-2xl font-bold">내 프로필</h1>

                <div className="flex items-center gap-4">
                    <img
                        src={getProfileImage(profile.profileImageUrl)}
                        className="w-24 h-24 rounded-full bg-gray-200"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>


                <input
                    value={profile.name}
                    onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                    }
                    className="w-full border p-3 rounded"
                    placeholder="이름"
                />

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                />


                <input
                    value={profile.preferredRole}
                    onChange={(e) =>
                        setProfile({ ...profile, preferredRole: e.target.value })
                    }
                    className="w-full border p-3 rounded"
                    placeholder="희망 직무"
                />

                <div className="space-y-2">
                    <input
                        value={profile.location ?? ""}
                        onChange={(e) =>
                            setProfile({ ...profile, location: e.target.value })
                        }
                        className="w-full border p-3 rounded"
                        placeholder="위치"
                    />

                    <button
                        onClick={detectLocation}
                        className="px-4 py-2 bg-blue-100 rounded"
                    >
                        현재 위치 감지
                    </button>
                </div>

                <button
                    onClick={saveProfile}
                    className="px-6 py-3 bg-[#1A365D] text-white rounded-lg font-bold"
                >
                    저장
                </button>
            </section>
        </>
    );
}

async function geocodeFromCoords(lat: number, lng: number) {
    const res = await apiFetch<{ lat: number; lng: number }>(
        `/api/maps/geocode?query=${lat},${lng}`
    );
    return res;
}
async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/me/profile/image`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
    });


    alert("업로드 완료");
}
