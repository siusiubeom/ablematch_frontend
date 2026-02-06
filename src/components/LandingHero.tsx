"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getToken } from "@/lib/auth";
import { motion } from "framer-motion";

export default function LandingHero({ setLoading, setStep }: any) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const accept = ".pdf,.doc,.docx,.hwp";

    const fileName = useMemo(() => {
        if (!file) return "PDF/DOC/DOCX/HWP";
        return file.name;
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
        <section className="bg-white text-slate-900 dark:bg-white dark:text-slate-900">
            {/* PART 1 — Big logo (left) + upload (right) */}
            <div className="max-w-7xl mx-auto px-6 pt-16 pb-14">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    {/* Left: Logo + minimal headline */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="relative w-full max-w-[520px] aspect-[3/1]">
                                <Image
                                    src="/ablematch_logo-Photoroom.png"
                                    alt="AbleMatch"
                                    fill
                                    priority
                                    className="object-contain"
                                />
                            </div>

                            <div className="mt-8 max-w-xl">
                                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05]">
                                    AI Career Matching
                                    <span className="block text-[#2E75B6]">for real opportunities</span>
                                </h1>
                                <p className="mt-3 text-base md:text-lg text-slate-600 dark:text-slate-600">
                                    이력서를 업로드하면, 당신에게 맞는 커리어 로드맵과 기업을 제안합니다.
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Minimal upload (no card/box) */}
                    <div className="lg:col-span-5">
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08, duration: 0.6 }}
                            className="w-full"
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
                        >
                            <input
                                ref={inputRef}
                                type="file"
                                accept={accept}
                                onChange={(e) => onFileSelected(e.target.files?.[0] || null)}
                                className="hidden"
                            />

                            <div className="text-sm font-semibold text-slate-500 dark:text-slate-500">
                                Upload
                            </div>

                            {/* Minimal “underline” input row */}
                            <div
                                className={[
                                    "mt-3 flex items-center justify-between gap-3 py-3 border-b",
                                    dragActive ? "border-[#2E75B6]" : "border-slate-200",
                                    "dark:border-slate-200",
                                ].join(" ")}
                            >
                                <div className="min-w-0">
                                    <div className="text-sm text-slate-700 dark:text-slate-700 truncate">
                                        {file ? "Selected:" : "Supported:"}{" "}
                                        <span className="font-semibold text-slate-900 dark:text-slate-900">
                      {fileName}
                    </span>
                                    </div>
                                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                                        Drag & drop or choose a file
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={pickFile}
                                    className="shrink-0 inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-[#2E75B6] hover:opacity-80 transition"
                                >
                                    Choose
                                </button>
                            </div>

                            <div className="mt-6 flex flex-col gap-3">
                                <button
                                    onClick={submit}
                                    disabled={!file}
                                    className={[
                                        "w-full py-3 text-base font-extrabold text-white transition",
                                        "focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2E75B6]/25",
                                        !file
                                            ? "bg-slate-300 cursor-not-allowed"
                                            : "bg-[#2E75B6] hover:bg-[#255f93]",
                                        "dark:bg-[#2E75B6] dark:hover:bg-[#255f93]",
                                    ].join(" ")}
                                >
                                    Start Matching
                                </button>

                                <button
                                    onClick={() => router.push("/community")}
                                    className="w-full py-3 text-sm font-bold text-slate-700 hover:text-slate-900 transition dark:text-slate-700 dark:hover:text-slate-900"
                                >
                                    Explore Community
                                </button>

                                {file ? (
                                    <button
                                        onClick={() => setFile(null)}
                                        className="text-xs font-semibold text-[#ED7D31] hover:opacity-80 transition self-start"
                                        type="button"
                                    >
                                        Remove selected file
                                    </button>
                                ) : null}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Thin divider (not a box) */}
                <div className="mt-14 h-px w-full bg-slate-200 dark:bg-slate-200" />
            </div>

            {/* PART 2 — Tagline section (minimal, big type) */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.7 }}
                    className="max-w-4xl"
                >
                    <div className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
                        신체적 제약이 아닌
                        <br />
                        <span className="text-[#ED7D31]">전문성</span>으로 평가받는 곳
                    </div>

                    <p className="mt-6 text-base md:text-lg text-slate-600 dark:text-slate-600 max-w-2xl">
                        AI가 전공, 학력, 접근성, 프로젝트 이력을 분석해
                        <br />
                        당신에게 맞는 로드맵과 기업을 제안합니다.
                    </p>
                </motion.div>

                <div className="mt-16 h-px w-full bg-slate-200 dark:bg-slate-200" />
            </div>

            {/* PART 3 — Introducing AbleMatch (minimal) */}
            <div className="max-w-7xl mx-auto px-6 pt-16 pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.7 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-10"
                >
                    <div className="lg:col-span-5">
                        <div className="text-sm font-bold text-[#2E75B6]">Introducing</div>
                        <h2 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight">
                            AbleMatch
                        </h2>
                    </div>

                    <div className="lg:col-span-7">
                        <p className="text-base md:text-lg text-slate-600 dark:text-slate-600 leading-relaxed">
                            AbleMatch는 구조적 장벽보다 역량과 환경 적합도를 중심으로 연결합니다.
                        </p>

                        <ul className="mt-6 space-y-3 text-slate-700 dark:text-slate-700">
                            <li className="flex gap-3">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#ED7D31]" />
                                <span>이력서 기반 자동 분석</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#ED7D31]" />
                                <span>현실적인 커리어 로드맵 제안</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#ED7D31]" />
                                <span>접근성 고려 기업/직무 추천</span>
                            </li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
