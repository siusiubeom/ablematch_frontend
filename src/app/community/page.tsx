"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { apiFetch, BASE_URL } from "@/lib/api";
import { JobBoardItem, UserProfile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { getProfileImage } from "@/lib/profileImage";
import { MessageSquare, User, ImagePlus, Briefcase, Eye, Heart } from "lucide-react";

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

function OtherPeopleSection() {
    const [people, setPeople] = useState<any[]>([]);

    useEffect(() => {
        apiFetch("/api/public-profile/list").then((res: any) => {
            if (res) setPeople(res);
        });
    }, []);

    if (people.length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 className="font-bold mb-4 text-gray-900 dark:text-gray-100">
                다른 사용자 둘러보기
            </h3>

            <div className="space-y-3">
                {people.map((p) => (
                    <div
                        key={p.userId}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition"
                    >
                        <img
                            src={getProfileImage(p.profileImageUrl)}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                {p.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {p.headline}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


export default function CommunityPage() {
    const router = useRouter();
    const [tab, setTab] = useState<"feed" | "portfolio">("feed");
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

    type PublicProfile = {
        headline: string | null;
        bio: string | null;
        portfolioUrl: string | null;
        githubUrl: string | null;
        linkedinUrl: string | null;
        skills: string | null;
    };

    const [publicProfile, setPublicProfile] = useState<PublicProfile | null>(null);
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        if (tab !== "portfolio") return;
        apiFetch<PublicProfile>("/api/me/public-profile").then(setPublicProfile);
    }, [tab]);
    async function savePublicProfile() {
        if (!publicProfile) return;
        setSavingProfile(true);

        await apiFetch("/api/me/public-profile", {
            method: "PUT",
            body: JSON.stringify(publicProfile),
        });

        setSavingProfile(false);
    }


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

                <aside className="lg:col-span-3">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="h-20 bg-[#1A365D]" />
                        <div className="p-6 text-center">
                            {profileLoading ? (
                                <div className="animate-pulse space-y-3">
                                    <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto" />
                                </div>
                            ) : profile ? (
                                <>
                                    <img
                                        src={getProfileImage(profile.profileImageUrl)}
                                        className="w-24 h-24 rounded-full border-4 border-white -mt-16 mx-auto object-cover"
                                    />
                                    <h2 className="font-bold text-lg mt-4 text-gray-800">{profile.name}</h2>
                                    <p className="text-sm text-gray-500">{profile.preferredRole}</p>
                                </>
                            ) : null}
                        </div>
                    </div>
                </aside>

                <main className="lg:col-span-6 space-y-6">

                    <div className="flex rounded-2xl p-1 border bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
                        <button
                            onClick={() => setTab("feed")}
                            className={`flex-1 py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition ${
                                tab === "feed"
                                    ? "bg-[#1A365D] text-white shadow"
                                    : "text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                        >
                            <MessageSquare size={16} /> 커뮤니티
                        </button>

                        <button
                            onClick={() => setTab("portfolio")}
                            className={`flex-1 py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition ${
                                tab === "portfolio"
                                    ? "bg-[#1A365D] text-white shadow"
                                    : "text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                        >
                            <User size={16} /> 포트폴리오
                        </button>
                    </div>

                    {tab === "feed" && (
                        <>
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          className="w-full border border-gray-200 rounded p-3 text-sm text-gray-800"
          rows={3}
          placeholder="무엇을 공유하고 싶으신가요?"
      />

                                <div className="flex gap-2 mt-2">
                                    {newImages.map((img) => (
                                        <img key={img} src={`${API_BASE}${img}`} className="w-16 h-16 rounded object-cover" />
                                    ))}
                                </div>

                                <div className="flex justify-between mt-3">
                                    <label className="cursor-pointer flex items-center gap-2 text-sm text-gray-600">
                                        <ImagePlus size={18} />
                                        이미지
                                        <input
                                            hidden
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (f) uploadImage(f);
                                            }}
                                        />
                                    </label>

                                    <button
                                        onClick={createPost}
                                        className="px-5 py-2 rounded-lg font-bold text-white bg-[#38B2AC]"
                                    >
                                        게시하기
                                    </button>
                                </div>
                            </div>

                    {posts.map((post) => (
                        <div key={post.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <img
                                    src={getProfileImage(post.authorProfileImage)}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-bold text-sm text-gray-800">{post.authorName}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-800 mt-2">{post.content}</p>

                            {post.imageUrls.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                    {post.imageUrls.map((url) => (
                                        <img key={url} src={`${API_BASE}${url}`} className="rounded object-cover w-full"/>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-6 mt-4 text-sm text-gray-500 border-t border-gray-200 pt-3">
                                <button onClick={()=>{expandedPost===post.id?setExpandedPost(null):(setExpandedPost(post.id),loadComments(post.id));}}
                                        className="flex items-center gap-1">
                                    <MessageSquare size={16}/> {post.commentCount}
                                </button>
                            </div>

                            {expandedPost===post.id && (
                                <div className="mt-4 border-t border-gray-200 pt-4 space-y-3">
                                    {(comments[post.id]||[]).map(c=>(
                                        <div key={c.id} className="bg-gray-50 rounded p-3">
                                            <p className="text-xs font-semibold text-gray-700">{c.authorAlias}</p>
                                            <p className="text-sm text-gray-800">{c.content}</p>
                                        </div>
                                    ))}
                                    <div className="flex gap-2">
                                        <input value={newComment[post.id]||""}
                                               onChange={e=>setNewComment(p=>({...p,[post.id]:e.target.value}))}
                                               className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm text-gray-800"
                                               placeholder="댓글 작성..."/>
                                        <button onClick={()=>createComment(post.id)}
                                                className="px-3 py-2 bg-[#38B2AC] text-white rounded text-sm">등록</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
            </>
            )}
                    {tab === "portfolio" && (
                        publicProfile ? (
                            <div className="space-y-6">

                                {/* ===== PORTFOLIO EDIT CARD ===== */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 space-y-6">

                                    <div className="flex items-center gap-2 mb-2">
                                        <User size={18} className="text-[#1A365D]" />
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                            내 포트폴리오
                                        </h3>
                                    </div>

                                    <div className="space-y-4">

                                        <input
                                            className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg p-3 text-sm text-gray-900 dark:text-gray-100"
                                            placeholder="한 줄 소개 (Headline)"
                                            value={publicProfile.headline ?? ""}
                                            onChange={(e) =>
                                                setPublicProfile({ ...publicProfile, headline: e.target.value })
                                            }
                                        />

                                        <textarea
                                            className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg p-3 text-sm text-gray-900 dark:text-gray-100"
                                            rows={4}
                                            placeholder="자기소개 (Bio)"
                                            value={publicProfile.bio ?? ""}
                                            onChange={(e) =>
                                                setPublicProfile({ ...publicProfile, bio: e.target.value })
                                            }
                                        />

                                        <input
                                            className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg p-3 text-sm"
                                            placeholder="Portfolio URL"
                                            value={publicProfile.portfolioUrl ?? ""}
                                            onChange={(e) =>
                                                setPublicProfile({ ...publicProfile, portfolioUrl: e.target.value })
                                            }
                                        />

                                        <input
                                            className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg p-3 text-sm"
                                            placeholder="GitHub URL"
                                            value={publicProfile.githubUrl ?? ""}
                                            onChange={(e) =>
                                                setPublicProfile({ ...publicProfile, githubUrl: e.target.value })
                                            }
                                        />

                                        <input
                                            className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg p-3 text-sm"
                                            placeholder="LinkedIn URL"
                                            value={publicProfile.linkedinUrl ?? ""}
                                            onChange={(e) =>
                                                setPublicProfile({ ...publicProfile, linkedinUrl: e.target.value })
                                            }
                                        />

                                        <input
                                            className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg p-3 text-sm"
                                            placeholder="Skills (comma separated)"
                                            value={publicProfile.skills ?? ""}
                                            onChange={(e) =>
                                                setPublicProfile({ ...publicProfile, skills: e.target.value })
                                            }
                                        />

                                    </div>

                                    <button
                                        onClick={savePublicProfile}
                                        className="w-full py-3 rounded-xl font-bold text-white bg-[#38B2AC] hover:bg-[#319795] transition shadow"
                                    >
                                        {savingProfile ? "저장 중..." : "포트폴리오 저장"}
                                    </button>
                                </div>

                                <OtherPeopleSection />

                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-10 text-center text-gray-500 dark:text-gray-400">
                                로딩 중...
                            </div>
                        )
                    )}

                </main>

                <aside className="lg:col-span-3">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h3 className="font-bold flex items-center gap-2 mb-4 text-gray-800">
                            <Briefcase size={18}/> 최신 채용 공고
                        </h3>
                        {boardJobs.slice(0,4).map(job=>(
                            <div key={job.id} className="border-b border-gray-200 py-3">
                                <p className="text-sm font-semibold text-gray-800">{job.title}</p>
                                <p className="text-xs text-gray-500">{job.company}</p>
                                <div className="flex gap-3 text-xs text-gray-400 mt-1">
                                    <span className="flex items-center gap-1"><Eye size={12}/> {job.viewCount}</span>
                                    <span className="flex items-center gap-1"><Heart size={12}/> {job.likeCount}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

            </section>
        </>
    );
}
