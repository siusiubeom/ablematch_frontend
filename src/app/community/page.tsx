"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { apiFetch } from "@/lib/api";
import { JobBoardItem, UserProfile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { getProfileImage } from "@/lib/profileImage";
import {
    MessageSquare,
    Heart,
    Eye,
    Briefcase,
    ImagePlus,
} from "lucide-react";

type Comment = {
    id: string;
    authorAlias: string;
    content: string;
    createdAt: string;
    isPostAuthor: boolean;
    isOwner: boolean;
};

type FeedPost = {
    id: string;
    authorName: string;
    authorEmail: string;
    authorProfileImage: string | null;
    content: string;
    imageUrls: string[];
    likeCount: number;
    commentCount: number;
    createdAt: string;
    isOwner: boolean;
    isLikedByMe: boolean;
};

export default function CommunityPage() {
    const router = useRouter();

    const [feedLoading, setFeedLoading] = useState(true);
    const [initialFeedLoaded, setInitialFeedLoaded] = useState(false);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [posting, setPosting] = useState(false);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);

    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [newPost, setNewPost] = useState("");
    const [newImages, setNewImages] = useState<string[]>([]);

    const [expandedPost, setExpandedPost] = useState<string | null>(null);
    const [comments, setComments] = useState<Record<string, Comment[]>>({});
    const [newComment, setNewComment] = useState<Record<string, string>>({});

    const [boardJobs, setBoardJobs] = useState<JobBoardItem[]>([]);

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE;


    async function loadFeed() {
        if (!initialFeedLoaded) setFeedLoading(true);

        const res = await apiFetch<FeedPost[]>("/api/community/feed");
        if (res) setPosts(res);

        setFeedLoading(false);
        setInitialFeedLoaded(true);
    }

    useEffect(() => {
        loadFeed();
    }, []);


    useEffect(() => {
        apiFetch<UserProfile>("/api/me/profile")
            .then((res) => setProfile(res))
            .finally(() => setProfileLoading(false));
    }, []);


    async function loadComments(postId: string) {
        const res = await apiFetch<Comment[]>(
            `/api/community/${postId}/comments`
        );
        if (!res) return;
        setComments((prev) => ({ ...prev, [postId]: res }));
    }

    async function createComment(postId: string) {
        const token = localStorage.getItem("token");
        if (!token) return router.push("/login");

        const content = newComment[postId];
        if (!content?.trim()) return;

        await apiFetch(`/api/community/${postId}/comment`, {
            method: "POST",
            body: JSON.stringify({ content }),
        });

        setNewComment((p) => ({ ...p, [postId]: "" }));
        await loadComments(postId);
        loadFeed();
    }


    async function uploadImage(file: File) {
        const token = localStorage.getItem("token");
        if (!token) return router.push("/login");

        const form = new FormData();
        form.append("file", file);

        const res = await fetch(`${API_BASE}/api/community/upload`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: form,
        });

        const url = await res.text();
        setNewImages((prev) => [...prev, url]);
    }

    async function createPost() {
        const token = localStorage.getItem("token");
        if (!token) return router.push("/login");
        if (!newPost.trim() && newImages.length === 0) return;

        setPosting(true);

        await apiFetch("/api/community/post", {
            method: "POST",
            body: JSON.stringify({
                content: newPost,
                imageUrls: newImages,
            }),
        });

        setNewPost("");
        setNewImages([]);
        await loadFeed();
        setPosting(false);
    }

    useEffect(() => {
        setJobsLoading(true);
        apiFetch<JobBoardItem[]>("/api/jobs/board?sort=latest").then((res) => {
            if (res) setBoardJobs(res);
            setJobsLoading(false);
        });
    }, []);

    return (
        <>
            <Header />

            <section className="w-full max-w-[1600px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-gray-50 min-h-screen">

                <aside className="lg:col-span-3">
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="h-20 bg-[#1A365D]" />
                        <div className="p-6 text-center">
                            {profileLoading ? (
                                <div className="animate-pulse space-y-3">
                                    <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto" />
                                    <div className="h-4 bg-gray-200 rounded w-24 mx-auto" />
                                    <div className="h-3 bg-gray-200 rounded w-16 mx-auto" />
                                </div>
                            ) : profile ? (
                                <>
                                    <img
                                        src={getProfileImage(profile.profileImageUrl)}
                                        className="w-24 h-24 rounded-full border-4 border-white -mt-16 mx-auto object-cover"
                                    />
                                    <h2 className="font-bold text-lg mt-4">{profile.name}</h2>
                                    <p className="text-sm text-gray-500">
                                        {profile.preferredRole}
                                    </p>
                                </>
                            ) : (
                                <button
                                    onClick={() => router.push("/landing")}
                                    className="bg-[#38B2AC] text-white px-4 py-2 rounded"
                                >
                                    이력서 업로드
                                </button>
                            )}
                        </div>
                    </div>
                </aside>

                <main className="lg:col-span-6 space-y-6">

                    <div className="bg-white rounded-xl border shadow-sm p-5">
            <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="w-full border rounded p-3 text-sm"
                rows={3}
                placeholder="무엇을 공유하고 싶으신가요?"
                disabled={posting}
            />

                        <div className="flex gap-2 mt-2">
                            {newImages.map((img) => (
                                <img
                                    key={img}
                                    src={`${API_BASE}${img}`}
                                    className="w-16 h-16 rounded object-cover"
                                />
                            ))}
                        </div>

                        <div className="flex justify-between mt-3">
                            <label className="cursor-pointer flex items-center gap-2 text-sm text-gray-600">
                                <ImagePlus size={18} />
                                이미지
                                <input
                                    hidden
                                    disabled={posting}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) uploadImage(file);
                                    }}
                                />
                            </label>

                            <button
                                onClick={createPost}
                                disabled={posting}
                                className="px-5 py-2 rounded-lg font-bold text-white bg-[#38B2AC] disabled:opacity-50"
                            >
                                {posting ? "게시 중..." : "게시하기"}
                            </button>
                        </div>
                    </div>
                    {feedLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="bg-white p-6 rounded-xl border shadow-sm animate-pulse"
                                >
                                    <div className="flex gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 bg-gray-200 rounded w-24" />
                                            <div className="h-2 bg-gray-200 rounded w-16" />
                                        </div>
                                    </div>
                                    <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                                </div>
                            ))}
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center text-gray-400 py-10">
                            아직 게시글이 없습니다
                        </div>
                    ) : (
                        posts.map((post) => (
                            <div
                                key={post.id}
                                className="bg-white p-6 rounded-xl border shadow-sm"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <img
                                        src={getProfileImage(post.authorProfileImage)}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-bold text-sm">{post.authorName}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-700">{post.content}</p>

                                {post.imageUrls.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                        {post.imageUrls.map((url) => (
                                            <img
                                                key={url}
                                                src={`${API_BASE}${url}`}
                                                className="rounded object-cover w-full"
                                            />
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-6 mt-4 text-sm text-gray-500 border-t pt-3">
                                    <button
                                        onClick={async () => {
                                            await apiFetch(`/api/community/${post.id}/like`, {
                                                method: "POST",
                                            });
                                            loadFeed();
                                        }}
                                        className={`flex items-center gap-1 ${
                                            post.isLikedByMe ? "text-red-500" : ""
                                        }`}
                                    >
                                        <Heart
                                            size={16}
                                            fill={post.isLikedByMe ? "red" : "none"}
                                        />
                                        {post.likeCount}
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (expandedPost === post.id) {
                                                setExpandedPost(null);
                                            } else {
                                                setExpandedPost(post.id);
                                                loadComments(post.id);
                                            }
                                        }}
                                        className="flex items-center gap-1"
                                    >
                                        <MessageSquare size={16} />
                                        {post.commentCount}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </main>

                <aside className="lg:col-span-3">
                    <div className="bg-white rounded-xl border shadow-sm p-5">
                        <h3 className="font-bold flex items-center gap-2 mb-4">
                            <Briefcase size={18} />
                            최신 채용 공고
                        </h3>

                        {jobsLoading ? (
                            <div className="space-y-3 animate-pulse">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-10 bg-gray-200 rounded" />
                                ))}
                            </div>
                        ) : (
                            boardJobs.slice(0, 4).map((job) => (
                                <div key={job.id} className="border-b py-3">
                                    <p className="text-sm font-semibold">{job.title}</p>
                                    <p className="text-xs text-gray-500">{job.company}</p>
                                    <div className="flex gap-3 text-xs text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {job.viewCount}
                    </span>
                                        <span className="flex items-center gap-1">
                      <Heart size={12} /> {job.likeCount}
                    </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </aside>
            </section>
        </>
    );
}
