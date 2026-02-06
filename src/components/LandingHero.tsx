"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getToken } from "@/lib/auth";
import {
    Upload,
    Sparkles,
    ShieldCheck,
    Building2,
    ArrowRight,
    FileText,
    CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingHero({ setLoading, setStep }: any) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const accept = ".pdf,.doc,.docx,.hwp";

    const fileLabel = useMemo(() => {
        if (!file) return "이력서/포트폴리오를 업로드하세요";
        return `${file.name} (${Math.round(file.size / 1024)}KB)`;
    }, [file]);

    function pickFile() {
        inputRef.current?.click();
    }

    function onFileSelected(f?: File | null) {
        if (!f) return;
        setFile(f);
    }

    function onDrop(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const dropped = e.dataTransfer.files?.[0];
        if (!dropped) return;
        onFileSelected(dropped);
    }

    async function submit() {
        const token = getToken();
        if (!token) {
            router.push("/login");
            return;
        }
        if (!file) return;

        setLoading(true);
        setStep(0);

        const formData = new FormData();
        formData.append("file", file);

        await fetch("/api/resume/upload", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });

        await fetch("/api/me/profile/from-resume", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });

        router.replace("/dashboard");
    }

    return (
        <section
            className={[
                "relative overflow-hidden bg-white text-slate-900",
                "dark:bg-white dark:text-slate-900",
            ].join(" ")}
        >
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#2E75B61a,transparent_55%),radial-gradient(ellipse_at_bottom,#ED7D311a,transparent_55%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,white_70%)] dark:bg-[linear-gradient(to_bottom,transparent,white_70%)]" />
                <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [background-size:48px_48px]" />
                <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl opacity-30 bg-[#2E75B6]" />
                <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl opacity-25 bg-[#ED7D31]" />
            </div>

            <div className="relative max-w-7xl mx-auto px-6 pt-10 pb-24">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative h-10 w-44">
                            <Image
                                src="/ablematch_logo-Photoroom.png"
                                alt="AbleMatch"
                                fill
                                priority
                                className="object-contain"
                            />
                        </div>
                        <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur dark:bg-white/80 dark:border-slate-200 dark:text-slate-700">
              <Sparkles className="h-4 w-4 text-[#ED7D31]" />
              AI Career Matching
            </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.push("/community")}
                            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 backdrop-blur hover:bg-white transition dark:bg-white/80 dark:border-slate-200 dark:text-slate-700 dark:hover:bg-white"
                        >
                            <Building2 className="h-4 w-4 text-[#2E75B6]" />
                            Community
                        </button>
                        <button
                            onClick={() => router.push("/login")}
                            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(46,117,182,0.22)] transition hover:translate-y-[-1px] active:translate-y-0 bg-[#2E75B6]"
                        >
                            Sign in <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 backdrop-blur dark:bg-white/70 dark:border-slate-200 dark:text-slate-700"
                        >
                            <ShieldCheck className="h-4 w-4 text-[#2E75B6]" />
                            신체적 제약이 아닌 <span className="text-[#ED7D31]">전문성</span>으로 평가받는 곳
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05, duration: 0.7 }}
                            className="mt-6 text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05]"
                        >
                            당신의 이력을
                            <span className="relative mx-2 inline-block">
                <span className="relative z-10 text-[#2E75B6]">AI</span>
                <span className="absolute -bottom-2 left-0 right-0 h-3 rounded-full bg-[#2E75B6]/15" />
              </span>
                            로 해석해
                            <br />
                            <span className="text-slate-900">
                “1% 적합 기업”과 커리어 로드맵
              </span>
                            을 제안합니다
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.18, duration: 0.6 }}
                            className="mt-6 text-lg text-slate-600 max-w-2xl dark:text-slate-600"
                        >
                            전공·학력·프로젝트 이력과 접근성 조건을 함께 분석해,
                            현실적으로 <span className="font-semibold text-slate-800">성장 가능한</span> 기회를 추천합니다.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.6 }}
                            className="mt-8 flex flex-wrap gap-3"
                        >
                            {[
                                { icon: FileText, text: "이력서 기반 자동 프로필 생성" },
                                { icon: Sparkles, text: "AI 커리어 로드맵 & 스킬 갭 분석" },
                                { icon: Building2, text: "접근성 고려 매칭 + 기업 추천" },
                            ].map((it) => (
                                <div
                                    key={it.text}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 backdrop-blur dark:bg-white/70 dark:border-slate-200 dark:text-slate-700"
                                >
                                    <it.icon className="h-4 w-4 text-[#2E75B6]" />
                                    {it.text}
                                </div>
                            ))}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.32, duration: 0.6 }}
                            className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl"
                        >
                            {[
                                { k: "분석 속도", v: "1분 내", sub: "프로필/로드맵 생성" },
                                { k: "추천 정확도", v: "Top 1%", sub: "적합도 중심 매칭" },
                                { k: "기준", v: "전문성", sub: "제약보다 역량" },
                            ].map((s) => (
                                <div
                                    key={s.k}
                                    className="rounded-3xl border border-slate-200 bg-white/70 p-5 backdrop-blur shadow-[0_12px_40px_rgba(15,23,42,0.06)] dark:bg-white/70 dark:border-slate-200"
                                >
                                    <div className="text-sm font-semibold text-slate-500">{s.k}</div>
                                    <div className="mt-1 text-2xl font-extrabold text-slate-900">
                                        {s.v}
                                    </div>
                                    <div className="mt-1 text-sm text-slate-600">{s.sub}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    <div className="lg:col-span-5">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.6 }}
                            className="relative rounded-[28px] border border-slate-200 bg-white/80 backdrop-blur p-6 shadow-[0_18px_60px_rgba(15,23,42,0.12)] dark:bg-white/80 dark:border-slate-200"
                        >

                            <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/60" />
                            <div className="pointer-events-none absolute -inset-[2px] rounded-[30px] opacity-30 blur-xl bg-[conic-gradient(from_180deg_at_50%_50%,#2E75B6,#ED7D31,#2E75B6)]" />

                            <div className="relative">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="text-lg font-extrabold tracking-tight">
                                            지금 바로 매칭 시작
                                        </div>
                                        <div className="mt-1 text-sm text-slate-600">
                                            이력서를 업로드하면 AI가 자동으로 분석합니다.
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white dark:border-slate-200 dark:text-slate-700">
                                        <CheckCircle2 className="h-4 w-4 text-[#ED7D31]" />
                                        Secure
                                    </div>
                                </div>

                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept={accept}
                                    onChange={(e) => onFileSelected(e.target.files?.[0] || null)}
                                    className="hidden"
                                />

                                <div
                                    onClick={pickFile}
                                    onDragEnter={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setDragActive(true);
                                    }}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setDragActive(true);
                                    }}
                                    onDragLeave={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setDragActive(false);
                                    }}
                                    onDrop={onDrop}
                                    role="button"
                                    tabIndex={0}
                                    className={[
                                        "mt-6 rounded-3xl border-2 border-dashed p-5 transition cursor-pointer select-none",
                                        "bg-white dark:bg-white",
                                        dragActive
                                            ? "border-[#2E75B6] shadow-[0_0_0_6px_rgba(46,117,182,0.10)]"
                                            : "border-slate-200 hover:border-slate-300",
                                    ].join(" ")}
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="h-12 w-12 rounded-2xl grid place-items-center"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg, rgba(46,117,182,0.16), rgba(237,125,49,0.16))",
                                            }}
                                        >
                                            <Upload className="h-6 w-6 text-[#2E75B6]" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-semibold text-slate-900 truncate">
                                                {fileLabel}
                                            </div>
                                            <div className="text-sm text-slate-600">
                                                드래그 앤 드롭 또는 클릭 (PDF/DOC/DOCX/HWP)
                                            </div>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {file ? (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 8 }}
                                                className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 border border-slate-200 dark:bg-slate-50 dark:border-slate-200"
                                            >
                                                <div className="text-sm text-slate-700 min-w-0 truncate">
                                                    선택됨: <span className="font-semibold">{file.name}</span>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setFile(null);
                                                    }}
                                                    className="text-sm font-semibold text-[#ED7D31] hover:opacity-80"
                                                >
                                                    제거
                                                </button>
                                            </motion.div>
                                        ) : null}
                                    </AnimatePresence>
                                </div>

                                <button
                                    onClick={submit}
                                    disabled={!file}
                                    className={[
                                        "mt-6 w-full rounded-2xl py-4 text-base font-extrabold text-white",
                                        "shadow-[0_18px_45px_rgba(46,117,182,0.25)] transition",
                                        "focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2E75B6]/25",
                                        !file
                                            ? "opacity-60 cursor-not-allowed bg-slate-400"
                                            : "hover:translate-y-[-1px] active:translate-y-0 bg-[linear-gradient(90deg,#2E75B6_0%,#2E75B6_45%,#ED7D31_100%)]",
                                    ].join(" ")}
                                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    AI Matching 시작하기
                  </span>
                                </button>

                                <button
                                    onClick={() => router.push("/community")}
                                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-800 hover:bg-slate-50 transition dark:bg-white dark:border-slate-200 dark:text-slate-800 dark:hover:bg-slate-50"
                                >
                                    커뮤니티 둘러보기
                                </button>

                                <div className="mt-4 text-xs text-slate-500 leading-relaxed">
                                    업로드된 파일은 프로필 생성 및 추천에만 사용됩니다.
                                </div>
                            </div>
                        </motion.div>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                "접근성 조건을 반영한 추천",
                                "프로젝트 기반 역량 평가",
                                "현실적인 커리어 로드맵",
                                "기업/직무 매칭 리포트",
                            ].map((t) => (
                                <div
                                    key={t}
                                    className="rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur dark:bg-white/70 dark:border-slate-200"
                                >
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                        <CheckCircle2 className="h-4 w-4 text-[#ED7D31]" />
                                        {t}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7 }}
                    className="mt-20 rounded-[32px] border border-slate-200 bg-white/70 backdrop-blur p-10 shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:bg-white/70 dark:border-slate-200"
                >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                        <div className="md:col-span-5">
                            <div className="text-sm font-bold text-[#2E75B6]">Introducing</div>
                            <div className="mt-2 text-3xl font-extrabold tracking-tight">
                                AbleMatch
                            </div>
                            <div className="mt-3 text-slate-600">
                                제약이 아니라 <span className="font-semibold text-slate-800">가능성</span>을
                                기준으로 연결합니다.
                            </div>
                        </div>

                        <div className="md:col-span-7 space-y-4 text-slate-600 leading-relaxed">
                            <p>
                                AbleMatch는 전공·학력·프로젝트 경험을 분석하고, 접근성 조건까지
                                함께 고려하여 “실제로 가능한” 커리어 기회를 추천하는 AI 커리어 플랫폼입니다.
                            </p>
                            <p>
                                우리는 채용의 기준을 바꿉니다 — 제약이 아니라 역량을 중심으로,
                                개인과 기업이 <span className="font-semibold text-slate-800">진짜 잠재력</span>이
                                있는 지점에서 만날 수 있도록 돕습니다.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
