"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { apiFetch } from "@/lib/api";
import { JobBoardItem, UserProfile } from "@/lib/types";
import { useRouter } from "next/navigation";
import {getProfileImage} from "@/lib/profileImage";

type FeedPost = {
    id: string;
    author: string;
    content: string;
    likeCount: number;
    commentCount: number;
    createdAt: string;
};

export default function CommunityPage() {
    const router = useRouter();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);

    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [newPost, setNewPost] = useState("");

    const [boardJobs, setBoardJobs] = useState<JobBoardItem[]>([]);
    const [boardSort, setBoardSort] = useState<
        "latest" | "popular" | "likes" | "company"
    >("latest");

    useEffect(() => {
        apiFetch<UserProfile>("/api/me/profile")
            .then((res) => setProfile(res))
            .finally(() => setProfileLoading(false));
    }, []);

    useEffect(() => {
        loadFeed();
    }, []);

    async function loadFeed() {
        const res = await apiFetch<FeedPost[]>("/api/community/feed");
        if (res) setPosts(res);
    }

    async function createPost() {
        if (!newPost.trim()) return;

        await apiFetch("/api/community/post", {
            method: "POST",
            body: JSON.stringify({ content: newPost }),
        });

        setNewPost("");
        loadFeed();
    }

    useEffect(() => {
        apiFetch<JobBoardItem[]>(`/api/jobs/board?sort=${boardSort}`).then(
            (res) => {
                if (res) setBoardJobs(res);
            }
        );
    }, [boardSort]);

    return (
        <>
            <Header />

            <section className="w-full max-w-[1600px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-gray-50">

                {/* LEFT PROFILE */}
                <aside className="lg:col-span-3 space-y-6">
                    <div className="rounded-2xl border p-6 bg-white text-center">
                        {profileLoading ? (
                            <p>Loading...</p>
                        ) : profile ? (
                            <>
                                <img
                                    src={getProfileImage(profile.profileImageUrl)}
                                    className="w-24 h-24 rounded-full mx-auto mb-4"
                                />
                                <h2 className="font-bold text-lg">{profile.name}</h2>
                                <p className="text-sm text-gray-500">
                                    {profile.preferredRole}
                                </p>

                                <button
                                    onClick={() => router.push("/profile")}
                                    className="mt-4 px-4 py-2 bg-[#1A365D] text-white rounded-lg text-sm font-bold"
                                >
                                    내 프로필 보기
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-gray-500 mb-4">
                                    아직 이력서가 없습니다
                                </p>
                                <button
                                    onClick={() => router.push("/landing")}
                                    className="px-4 py-2 bg-[#38B2AC] text-white rounded-lg font-bold"
                                >
                                    이력서 업로드
                                </button>
                            </>
                        )}
                    </div>
                </aside>

                {/* CENTER FEED */}
                <main className="lg:col-span-6 space-y-6">

                    {/* POST BOX */}
                    <div className="p-5 rounded-xl border bg-white">
            <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="w-full p-3 rounded-lg border bg-gray-50"
                rows={3}
                placeholder="동료들과 커리어 이야기를 나눠보세요..."
            />
                        <div className="flex justify-end mt-3">
                            <button
                                onClick={createPost}
                                className="px-5 py-2 rounded-lg font-bold text-white bg-[#38B2AC]"
                            >
                                작성하기
                            </button>
                        </div>
                    </div>

                    {/* FEED */}
                    {posts.map((post) => (
                        <div key={post.id} className="p-5 rounded-xl border bg-white">
                            <div className="flex justify-between text-sm text-gray-500 mb-2">
                                <span>{post.author}</span>
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>

                            <p>{post.content}</p>

                            <div className="flex gap-5 text-xs text-gray-500 font-bold mt-2">
                                <span>❤️ {post.likeCount}</span>
                                <span>💬 {post.commentCount}</span>
                            </div>
                        </div>
                    ))}
                </main>

                {/* RIGHT JOB BOARD */}
                <aside className="lg:col-span-3 space-y-6">

                    <div className="flex gap-2">
                        <button onClick={() => setBoardSort("latest")} className="px-3 py-2 border rounded">최신</button>
                        <button onClick={() => setBoardSort("popular")} className="px-3 py-2 border rounded">조회수</button>
                        <button onClick={() => setBoardSort("likes")} className="px-3 py-2 border rounded">좋아요</button>
                        <button onClick={() => setBoardSort("company")} className="px-3 py-2 border rounded">회사</button>
                    </div>

                    {boardJobs.map((job) => (
                        <div
                            key={job.id}
                            className="rounded-xl border p-5 bg-white hover:shadow cursor-pointer"
                            onClick={async () => {
                                await apiFetch(`/api/jobs/board/${job.id}/view`, {
                                    method: "POST",
                                });

                                window.open(job.sourceUrl, "_blank");
                            }}
                        >
                            <h3 className="font-bold">{job.title}</h3>
                            <p className="text-sm text-gray-500">{job.company}</p>

                            <div className="flex gap-3 mt-2 text-xs text-gray-500">
                                <span>👁 {job.viewCount}</span>
                                <span>❤️ {job.likeCount}</span>
                                <span>{job.workType}</span>
                            </div>
                        </div>
                    ))}
                </aside>
            </section>
        </>
    );
}
