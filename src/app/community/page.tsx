"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { apiFetch } from "@/lib/api";
import { JobBoardItem, UserProfile } from "@/lib/types";
import { useRouter } from "next/navigation";
import {getProfileImage} from "@/lib/profileImage";
import {
    MessageSquare,
    Heart,
    Eye,
    Briefcase,
    Clock,
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
    author: string;
    content: string;
    likeCount: number;
    commentCount: number;
    createdAt: string;
    isOwner: boolean;
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

    const [expandedPost, setExpandedPost] = useState<string | null>(null);
    const [comments, setComments] = useState<Record<string, Comment[]>>({});
    const [newComment, setNewComment] = useState<Record<string, string>>({});
    async function loadComments(postId: string) {
        const res = await apiFetch<Comment[]>(`/api/community/${postId}/comments`);
        if (!res) return;

        setComments(prev => ({ ...prev, [postId]: res }));
    }

    async function createComment(postId: string) {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        const content = newComment[postId];
        if (!content?.trim()) return;

        await apiFetch(`/api/community/${postId}/comment`, {
            method: "POST",
            body: JSON.stringify({ content }),
        });

        setNewComment(prev => ({ ...prev, [postId]: "" }));

        await loadComments(postId);

        setPosts(prev =>
            prev.map(p =>
                p.id === postId
                    ? { ...p, commentCount: p.commentCount + 1 }
                    : p
            )
        );
    }





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
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login"); // UX redirect
            return;
        }

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

            <section className="w-full max-w-[1600px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-gray-50 min-h-screen">

            <aside className="lg:col-span-3 space-y-6">
                <div className="bg-white text-gray-900 rounded-xl shadow-sm border overflow-hidden">
                        <div className="h-20 bg-[#1A365D]" />

                    <div className="px-6 pb-6 text-center">
                            {profileLoading ? (
                                <p className="mt-6 text-sm text-gray-500">Loading...</p>
                            ) : profile ? (
                                <>
                                    <img
                                        src={getProfileImage(profile.profileImageUrl)}
                                        className="w-20 h-20 rounded-full border-4 border-white bg-gray-200 mx-auto -mt-10 mb-3"
                                    />
                                    <div className="mt-12">
                                        <h2 className="font-bold text-lg">{profile.name}</h2>
                                        <p className="text-sm text-gray-500">
                                            {profile.preferredRole}
                                        </p>

                                        <span className="inline-block mt-3 px-3 py-1 text-xs bg-green-50 text-green-700 rounded-full font-bold">
              활동 중
            </span>

                                        <button
                                            onClick={() => router.push("/profile")}
                                            className="mt-4 w-full py-2 bg-[#1A365D] text-white rounded-lg text-sm font-bold"
                                        >
                                            프로필 보기
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="mt-6 text-sm text-gray-500">
                                        아직 이력서가 없습니다
                                    </p>
                                    <button
                                        onClick={() => router.push("/landing")}
                                        className="mt-3 w-full py-2 bg-[#38B2AC] text-white rounded-lg font-bold"
                                    >
                                        이력서 업로드
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </aside>


                <main className="lg:col-span-6 space-y-6">

                    <div className="bg-white text-gray-900 rounded-xl border shadow-sm p-5">
    <textarea
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
        className="
w-full p-3 rounded-lg border text-sm
bg-white text-gray-900 placeholder-gray-400 border-gray-300
focus:outline-none focus:ring-2 focus:ring-[#38B2AC]
"
        rows={3}
        placeholder="커리어 고민이나 정보를 공유해보세요..."
    />
                        <div className="flex justify-end mt-3">
                            <button
                                onClick={createPost}
                                className="px-5 py-2 rounded-lg font-bold text-white bg-[#38B2AC]"
                            >
                                게시하기
                            </button>
                        </div>
                    </div>

                    {posts.map((post) => (
                            <div
                                key={post.id}
                                className="bg-white text-gray-900 p-6 rounded-xl border shadow-sm"
                            >
                                <div className="flex items-start justify-between mb-3">

                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                            익
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">익명</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {post.isOwner && (
                                        <button
                                            onClick={async () => {
                                                const token = localStorage.getItem("token");
                                                if (!token) {
                                                    router.push("/login");
                                                    return;
                                                }
                                                await apiFetch(`/api/community/post/${post.id}`, {
                                                    method: "DELETE",
                                                });
                                                loadFeed();
                                            }}
                                            className="text-xs text-red-500 hover:underline"
                                        >
                                            삭제
                                        </button>
                                    )}
                                </div>

                                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                                    {post.content}
                                </p>


                                <div className="flex gap-6 border-t pt-3 text-sm text-gray-500">
                                    <button className="flex items-center gap-1 hover:text-[#1A365D]">
                                        <Heart size={16} /> {post.likeCount}
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
                                        className="flex items-center gap-1 hover:text-[#1A365D]"
                                    >
                                        <MessageSquare size={16} /> {post.commentCount}
                                    </button>
                                </div>

                                {expandedPost === post.id && (
                                    <div className="mt-4 border-t pt-4 space-y-3">
                                        {comments[post.id]?.map((c) => (
                                            <div key={c.id} className="text-sm flex items-center gap-2">
                                                <span
                                                    className={`font-bold mr-2 ${
                                                        c.isPostAuthor ? "text-blue-600" : ""
                                                    }`}
                                                >
  {c.authorAlias}
</span>
                                                <span className="text-gray-700">{c.content}</span>
                                                {c.isOwner && (
                                                <button
                                                    onClick={async () => {
                                                        const token = localStorage.getItem("token");
                                                        if (!token) {
                                                            router.push("/login");
                                                            return;
                                                        }

                                                        await apiFetch(`/api/community/comment/${c.id}`, {
                                                            method: "DELETE",
                                                        });
                                                        loadComments(post.id);
                                                        loadFeed();
                                                    }}
                                                    className="text-xs text-red-400 hover:underline"
                                                >
                                                    삭제
                                                </button>
                                                )}

                                            </div>
                                        ))}

                                        <div className="flex gap-2 mt-3">
                                            <input
                                                value={newComment[post.id] || ""}
                                                onChange={(e) =>
                                                    setNewComment((prev) => ({
                                                        ...prev,
                                                        [post.id]: e.target.value,
                                                    }))
                                                }
                                                className="flex-1 border rounded px-3 py-2 text-sm"
                                                placeholder="댓글 작성..."
                                            />
                                            <button
                                                onClick={() => createComment(post.id)}
                                                className="px-3 py-2 bg-[#38B2AC] text-white rounded text-sm font-bold"
                                            >
                                                작성
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}


                        </main>

                <aside className="lg:col-span-3 space-y-6">

                    <div className="bg-white text-gray-900 rounded-xl border shadow-sm p-5">

                    <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <Briefcase size={18} />
                            최신 채용 공고
                        </h3>

                        {boardJobs.slice(0, 4).map((job) => (
                            <div
                                key={job.id}
                                className="border-b py-3 last:border-none cursor-pointer hover:bg-gray-50 rounded-md px-2"
                                onClick={async () => {
                                    await apiFetch(`/api/jobs/board/${job.id}/view`, {
                                        method: "POST",
                                    });
                                    window.open(job.sourceUrl, "_blank");
                                }}
                            >
                                <p className="text-sm font-semibold">{job.title}</p>
                                <p className="text-xs text-gray-500">{job.company}</p>
                                {job.dueDateText && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        마감: {job.dueDateText}
                                    </p>
                                )}

                                <div className="flex gap-3 mt-1 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Eye size={12} /> {job.viewCount}
          </span>
                                    <span className="flex items-center gap-1">
            <Heart size={12} /> {job.likeCount}
          </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

            </section>
        </>
    );
}
