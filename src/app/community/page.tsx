"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { apiFetch, BASE_URL } from "@/lib/api";
import { JobBoardItem, UserProfile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { getProfileImage } from "@/lib/profileImage";
import { MessageSquare, User, ImagePlus, Briefcase, Eye, Heart } from "lucide-react";
import {
    MapPin,
    ExternalLink,
    Github,
    Linkedin,
    Pencil,
    X,
    UserPlus,
    Users,
    GraduationCap,
    BriefcaseBusiness,
} from "lucide-react";

type Experience = {
    id: string;
    company: string;
    title: string;
    location?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    description?: string | null;
    imageUrl?: string | null;
};

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

type PublicProfileView = {
    userId: string;
    name: string;
    headline: string | null;
    bio: string | null;
    profileImageUrl: string | null;
    skills: string | null;
};

function normalizeUrl(url?: string | null) {
    if (!url) return null;
    const u = url.trim();
    if (!u) return null;
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    return `https://${u}`;
}

function splitSkills(skills?: string | null) {
    if (!skills) return [];
    return skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 30);
}

function PillLink({
                      icon,
                      label,
                      href,
                  }: {
    icon: React.ReactNode;
    label: string;
    href?: string | null;
}) {
    const url = normalizeUrl(href);
    const disabled = !url;

    return (
        <a
            href={url ?? undefined}
            target={url ? "_blank" : undefined}
            rel={url ? "noopener noreferrer" : undefined}
            className={[
                "inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-semibold transition",
                disabled
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-200 text-gray-800 hover:bg-gray-50",
            ].join(" ")}
            onClick={(e) => {
                if (!url) e.preventDefault();
            }}
        >
            {icon}
            {label}
            {url && <ExternalLink size={14} className="opacity-60" />}
        </a>
    );
}

function SectionCard({
                         title,
                         icon,
                         children,
                         right,
                     }: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    right?: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {icon}
                    <h3 className="font-bold text-gray-900">{title}</h3>
                </div>
                {right}
            </div>
            <div className="px-6 py-5">{children}</div>
        </div>
    );
}



function OtherPeopleSection() {
    const [people, setPeople] = useState<PublicProfileView[]>([]);
    const [open, setOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detail, setDetail] = useState<PublicProfileView | null>(null);

    useEffect(() => {
        apiFetch<PublicProfileView[]>("/api/public-profile/list").then((res) => {
            if (res) setPeople(res);
        });
    }, []);

    async function openUser(userId: string) {
        setOpen(true);
        setDetail(null);
        setDetailLoading(true);

        const res = await apiFetch<PublicProfileView>(`/api/public-profile/${userId}`);
        if (res) setDetail(res);

        setDetailLoading(false);
    }

    if (people.length === 0) return null;



    return (
        <>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Users size={16} />
                        다른 사용자 둘러보기
                    </h3>
                    <span className="text-xs text-gray-400">추천</span>
                </div>

                <div className="space-y-2">
                    {people.map((p) => (
                        <div
                            key={p.userId}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition"
                            onClick={() => openUser(p.userId)}
                        >
                            <img
                                src={getProfileImage(p.profileImageUrl)}
                                className="w-11 h-11 rounded-full object-cover border border-gray-100"
                                alt={p.name}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-900 truncate">
                                    {p.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {p.headline ?? ""}
                                </p>
                            </div>

                            <button
                                className="shrink-0 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-gray-800 hover:bg-gray-50"
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                <span className="inline-flex items-center gap-1">
                  <UserPlus size={14} />
                  연결
                </span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {open && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div className="font-bold text-gray-900">프로필 보기</div>
                            <button
                                className="p-2 rounded-lg hover:bg-gray-100"
                                onClick={() => setOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6">
                            {detailLoading ? (
                                <div className="space-y-3">
                                    <div className="h-5 w-40 bg-gray-100 rounded" />
                                    <div className="h-4 w-64 bg-gray-100 rounded" />
                                    <div className="h-24 bg-gray-100 rounded" />
                                </div>
                            ) : detail ? (
                                <div className="space-y-5">
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={getProfileImage(detail.profileImageUrl)}
                                            className="w-20 h-20 rounded-full object-cover border border-gray-100"
                                            alt={detail.name}
                                        />
                                        <div className="flex-1">
                                            <div className="text-xl font-bold text-gray-900">
                                                {detail.name}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {detail.headline ?? ""}
                                            </div>
                                            {detail.bio && (
                                                <div className="text-sm text-gray-600 mt-3 whitespace-pre-line">
                                                    {detail.bio}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {splitSkills(detail.skills).length > 0 && (
                                        <div>
                                            <div className="font-bold text-gray-900 mb-2">Skills</div>
                                            <div className="flex flex-wrap gap-2">
                                                {splitSkills(detail.skills).map((s) => (
                                                    <span
                                                        key={s}
                                                        className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold"
                                                    >
                            {s}
                          </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500">불러오지 못했습니다.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
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

    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [expLoading, setExpLoading] = useState(false);

    const [newExp, setNewExp] = useState({
        company: "",
        title: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
    });
    useEffect(() => {
        if (tab !== "portfolio") return;

        setExpLoading(true);
        apiFetch<Experience[]>("/api/me/experience")
            .then((res) => res && setExperiences(res))
            .finally(() => setExpLoading(false));
    }, [tab]);
    async function createExperience() {
        await apiFetch("/api/me/experience", {
            method: "POST",
            body: JSON.stringify(newExp),
        });

        setNewExp({
            company: "",
            title: "",
            location: "",
            startDate: "",
            endDate: "",
            description: "",
        });

        const res = await apiFetch<Experience[]>("/api/me/experience");
        if (res) setExperiences(res);
    }
    async function uploadExpImage(id: string, file: File) {
        const token = localStorage.getItem("token");
        if (!token) return;

        const form = new FormData();
        form.append("file", file);

        await fetch(`${API_BASE}/api/me/experience/${id}/image`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: form,
        });

        const res = await apiFetch<Experience[]>("/api/me/experience");
        if (res) setExperiences(res);
    }


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

                    <div className="flex rounded-xl p-1 border bg-white">
                        <button
                            onClick={() => setTab("feed")}
                            className={`flex-1 py-3 font-bold rounded-lg flex items-center justify-center gap-2 ${
                                tab === "feed"
                                    ? "bg-[#1A365D] text-white shadow"
                                    : "text-gray-500"
                            }`}
                        >
                            <MessageSquare size={16} /> 커뮤니티
                        </button>

                        <button
                            onClick={() => setTab("portfolio")}
                            className={`flex-1 py-3 font-bold rounded-lg flex items-center justify-center gap-2 ${
                                tab === "portfolio"
                                    ? "bg-[#1A365D] text-white shadow"
                                    : "text-gray-500"
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

                                <div className="space-y-6">

                                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                        <div className="h-36 bg-gradient-to-r from-[#1A365D] to-[#2C5282]" />

                                        <div className="px-6 pb-6">
                                            <div className="flex items-end justify-between">
                                                <img
                                                    src={getProfileImage(profile?.profileImageUrl)}
                                                    className="w-32 h-32 rounded-full border-4 border-white -mt-16 object-cover bg-gray-200"
                                                    alt="avatar"
                                                />

                                                <div className="flex gap-2">
                                                    <button
                                                        className="px-4 py-2 rounded-full border border-gray-200 font-bold text-sm text-gray-800 hover:bg-gray-50 transition"
                                                        onClick={() => {
                                                            // scroll to edit section if you want, or keep as is
                                                            const el = document.getElementById("public-profile-edit");
                                                            el?.scrollIntoView({ behavior: "smooth", block: "start" });
                                                        }}
                                                    >
                  <span className="inline-flex items-center gap-2">
                    <Pencil size={16} />
                    프로필 편집
                  </span>
                                                    </button>

                                                    <button
                                                        className="px-4 py-2 rounded-full font-bold text-sm text-white bg-[#0A66C2] hover:bg-[#004182] transition"
                                                        onClick={savePublicProfile}
                                                    >
                                                        {savingProfile ? "저장 중..." : "저장"}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <h2 className="text-2xl font-bold text-gray-900">
                                                    {profile?.name ?? "이름"}
                                                </h2>

                                                <p className="text-gray-700 mt-1">
                                                    {publicProfile.headline || profile?.preferredRole || "Headline"}
                                                </p>

                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-gray-600">
                                                    {profile?.location && (
                                                        <span className="inline-flex items-center gap-1">
                    <MapPin size={16} />
                                                            {profile.location}
                  </span>
                                                    )}

                                                    {profile?.major && (
                                                        <span className="inline-flex items-center gap-1">
                    <GraduationCap size={16} />
                                                            {profile.major}
                  </span>
                                                    )}

                                                    {profile?.gpa && (
                                                        <span className="text-gray-500">
                    GPA {profile.gpa}
                  </span>
                                                    )}
                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <PillLink
                                                        icon={<ExternalLink size={16} />}
                                                        label="Portfolio"
                                                        href={publicProfile.portfolioUrl}
                                                    />
                                                    <PillLink
                                                        icon={<Github size={16} />}
                                                        label="GitHub"
                                                        href={publicProfile.githubUrl}
                                                    />
                                                    <PillLink
                                                        icon={<Linkedin size={16} />}
                                                        label="LinkedIn"
                                                        href={publicProfile.linkedinUrl}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <SectionCard
                                        title="소개"
                                        icon={<User size={16} className="text-gray-700" />}
                                        right={
                                            <button
                                                className="text-sm font-bold text-[#0A66C2] hover:underline"
                                                onClick={() => {
                                                    const el = document.getElementById("public-profile-edit");
                                                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                                                }}
                                            >
                                                편집
                                            </button>
                                        }
                                    >
                                        <p className="text-sm text-gray-700 whitespace-pre-line">
                                            {publicProfile.bio?.trim()
                                                ? publicProfile.bio
                                                : "자기소개를 추가해 보세요. (예: 어떤 분야에 관심이 있고, 어떤 경험을 했는지)"}
                                        </p>
                                    </SectionCard>

                                    <SectionCard
                                        title="경력"
                                        icon={<BriefcaseBusiness size={16} className="text-gray-700" />}
                                    >
                                        <div className="space-y-4">

                                            {experiences.map((exp) => (
                                                <div key={exp.id} className="border rounded-xl p-4 space-y-2">
                                                    <div className="flex justify-between">
                                                        <div>
                                                            <div className="font-bold text-gray-900">{exp.title}</div>
                                                            <div className="text-sm text-gray-600">{exp.company}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {exp.startDate} ~ {exp.endDate || "현재"}
                                                            </div>
                                                        </div>

                                                        <label className="cursor-pointer text-sm text-[#0A66C2]">
                                                            이미지
                                                            <input
                                                                hidden
                                                                type="file"
                                                                onChange={(e) => {
                                                                    const f = e.target.files?.[0];
                                                                    if (f) uploadExpImage(exp.id, f);
                                                                }}
                                                            />
                                                        </label>
                                                    </div>

                                                    {exp.imageUrl && (
                                                        <img
                                                            src={`${API_BASE}${exp.imageUrl}`}
                                                            className="w-20 h-20 rounded object-cover"
                                                        />
                                                    )}

                                                    {exp.description && (
                                                        <p className="text-sm text-gray-700">{exp.description}</p>
                                                    )}
                                                </div>
                                            ))}

                                            <div className="border rounded-xl p-4 space-y-2">
                                                <input
                                                    placeholder="회사"
                                                    value={newExp.company}
                                                    onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                                                    className="w-full border rounded p-2"
                                                />
                                                <input
                                                    placeholder="직함"
                                                    value={newExp.title}
                                                    onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                                                    className="w-full border rounded p-2"
                                                />
                                                <textarea
                                                    placeholder="설명"
                                                    value={newExp.description}
                                                    onChange={(e) =>
                                                        setNewExp({ ...newExp, description: e.target.value })
                                                    }
                                                    className="w-full border rounded p-2"
                                                />

                                                <button
                                                    onClick={createExperience}
                                                    className="px-4 py-2 bg-[#0A66C2] text-white rounded font-bold"
                                                >
                                                    추가
                                                </button>
                                            </div>

                                        </div>
                                    </SectionCard>


                                    <SectionCard
                                        title="학력"
                                        icon={<GraduationCap size={16} className="text-gray-700" />}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-700">
                                                🎓
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-gray-900">
                                                    {profile?.major ?? "전공"}
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {profile?.preferredRole ?? "관심 직무"}
                                                </div>
                                                {profile?.gpa && (
                                                    <div className="text-xs text-gray-500 mt-1">GPA {profile.gpa}</div>
                                                )}
                                            </div>
                                        </div>
                                    </SectionCard>

                                    <SectionCard
                                        title="기술"
                                        icon={<Briefcase size={16} className="text-gray-700" />}
                                    >
                                        {splitSkills(publicProfile.skills).length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {splitSkills(publicProfile.skills).map((s) => (
                                                    <span
                                                        key={s}
                                                        className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold"
                                                    >
                  {s}
                </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-600">
                                                아직 등록된 기술이 없습니다. 아래에서 Skills를 추가해 보세요.
                                            </div>
                                        )}
                                    </SectionCard>

                                    <div id="public-profile-edit" className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                            <div className="font-bold text-gray-900">프로필 편집</div>
                                            <button
                                                onClick={savePublicProfile}
                                                className="px-4 py-2 rounded-full font-bold text-sm text-white bg-[#0A66C2] hover:bg-[#004182] transition"
                                            >
                                                {savingProfile ? "저장 중..." : "저장"}
                                            </button>
                                        </div>

                                        <div className="px-6 py-5 space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1">
                                                    Headline
                                                </label>
                                                <input
                                                    className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-900"
                                                    value={publicProfile.headline ?? ""}
                                                    onChange={(e) =>
                                                        setPublicProfile({ ...publicProfile, headline: e.target.value })
                                                    }
                                                    placeholder="예) Backend Engineer | ML | Vet AI"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1">
                                                    Bio
                                                </label>
                                                <textarea
                                                    className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-900"
                                                    rows={5}
                                                    value={publicProfile.bio ?? ""}
                                                    onChange={(e) =>
                                                        setPublicProfile({ ...publicProfile, bio: e.target.value })
                                                    }
                                                    placeholder="자기소개를 작성하세요..."
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 mb-1">
                                                        Portfolio URL
                                                    </label>
                                                    <input
                                                        className="w-full border border-gray-200 rounded-lg p-3 text-sm"
                                                        value={publicProfile.portfolioUrl ?? ""}
                                                        onChange={(e) =>
                                                            setPublicProfile({ ...publicProfile, portfolioUrl: e.target.value })
                                                        }
                                                        placeholder="https://..."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 mb-1">
                                                        GitHub URL
                                                    </label>
                                                    <input
                                                        className="w-full border border-gray-200 rounded-lg p-3 text-sm"
                                                        value={publicProfile.githubUrl ?? ""}
                                                        onChange={(e) =>
                                                            setPublicProfile({ ...publicProfile, githubUrl: e.target.value })
                                                        }
                                                        placeholder="https://github.com/..."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 mb-1">
                                                        LinkedIn URL
                                                    </label>
                                                    <input
                                                        className="w-full border border-gray-200 rounded-lg p-3 text-sm"
                                                        value={publicProfile.linkedinUrl ?? ""}
                                                        onChange={(e) =>
                                                            setPublicProfile({ ...publicProfile, linkedinUrl: e.target.value })
                                                        }
                                                        placeholder="https://linkedin.com/in/..."
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1">
                                                    Skills (comma separated)
                                                </label>
                                                <input
                                                    className="w-full border border-gray-200 rounded-lg p-3 text-sm"
                                                    value={publicProfile.skills ?? ""}
                                                    onChange={(e) =>
                                                        setPublicProfile({ ...publicProfile, skills: e.target.value })
                                                    }
                                                    placeholder="React, Spring, ML, ..."
                                                />
                                                <p className="text-xs text-gray-400 mt-2">
                                                    예: React, Spring, Machine Learning
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <OtherPeopleSection />
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center text-gray-500">
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
