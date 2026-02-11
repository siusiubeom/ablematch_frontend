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
import { BASE_URL } from "@/lib/api";

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

    const API_BASE = BASE_URL;

    async function loadFeed() {
        if (!initialFeedLoaded) setFeedLoading(true);
        const res = await apiFetch<FeedPost[]>("/api/community/feed");
        if (res) setPosts(res);
        setFeedLoading(false);
        setInitialFeedLoaded(true);
    }

    useEffect(() => { loadFeed(); }, []);

    useEffect(() => {
        apiFetch<UserProfile>("/api/me/profile")
            .then((res) => setProfile(res))
            .finally(() => setProfileLoading(false));
    }, []);

    async function loadComments(postId: string) {
        const res = await apiFetch<Comment[]>(`/api/community/${postId}/comments`);
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

                <main className="lg:col-span-6 space-y-6">

                    <div className="bg-white rounded-xl border shadow-sm p-5">
                        <textarea
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            className="w-full border rounded p-3 text-sm text-gray-800"
                            rows={3}
                            placeholder="무엇을 공유하고 싶으신가요?"
                            disabled={posting}
                        />

                        <div className="flex justify-between mt-3">
                            <button
                                onClick={createPost}
                                disabled={posting}
                                className="px-5 py-2 rounded-lg font-bold text-white bg-[#38B2AC]"
                            >
                                게시하기
                            </button>
                        </div>
                    </div>

                    {posts.map((post) => (
                        <div key={post.id} className="bg-white p-6 rounded-xl border shadow-sm">

                            <p className="font-bold text-sm text-gray-800">{post.authorName}</p>
                            <p className="text-xs text-gray-500">
                                {new Date(post.createdAt).toLocaleDateString()}
                            </p>

                            <p className="text-sm text-gray-800 mt-2">{post.content}</p>

                            <div className="flex gap-6 mt-4 text-sm text-gray-500 border-t pt-3">
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

                            {expandedPost === post.id && (
                                <div className="mt-4 border-t pt-4 space-y-3">

                                    {(comments[post.id] || []).map((c) => (
                                        <div key={c.id} className="bg-gray-50 rounded p-3">
                                            <p className="text-xs font-semibold text-gray-700">
                                                {c.authorAlias}
                                            </p>
                                            <p className="text-sm text-gray-800">{c.content}</p>
                                        </div>
                                    ))}

                                    <div className="flex gap-2">
                                        <input
                                            value={newComment[post.id] || ""}
                                            onChange={(e) =>
                                                setNewComment((p) => ({
                                                    ...p,
                                                    [post.id]: e.target.value,
                                                }))
                                            }
                                            className="flex-1 border rounded px-3 py-2 text-sm text-gray-800"
                                            placeholder="댓글 작성..."
                                        />
                                        <button
                                            onClick={() => createComment(post.id)}
                                            className="px-3 py-2 bg-[#38B2AC] text-white rounded text-sm"
                                        >
                                            등록
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </main>
            </section>
        </>
    );
}
