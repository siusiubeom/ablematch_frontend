"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { getToken } from "@/lib/auth";
import { h1 } from "framer-motion/client";
import { BASE_URL } from "@/lib/api";

export default function LandingHero({ setLoading, setStep }: any) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const accept = ".pdf,.docx,.hwp";

    const fileName = useMemo(() => {
        if (!file) return "PDF / DOCX / HWP";
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
        console.log("TOKEN:", token);

        if (!token) {
            router.push("/login");
            return;
        }

        if (!file) {
            console.log("NO FILE SELECTED");
            return;
        }

        console.log("FILE OBJECT:", file);
        console.log("FILE NAME:", file.name);
        console.log("FILE SIZE:", file.size);
        console.log("FILE TYPE:", file.type);

        setLoading(true);
        setStep(0);

        const formData1 = new FormData();
        formData1.append("file", file);

        for (const [key, value] of formData1.entries()) {
            console.log("FORMDATA ENTRY:", key, value);
        }

        try {
            console.log("=== UPLOAD START ===");

            const res1 = await fetch(`${BASE_URL}/api/resume/upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData1,
            });

            console.log("UPLOAD STATUS:", res1.status);
            const text1 = await res1.text();
            console.log("UPLOAD RESPONSE BODY:", text1);

            if (!res1.ok) {
                console.error("UPLOAD FAILED");
                setLoading(false);
                return;
            }

        } catch (e) {
            console.error("UPLOAD ERROR:", e);
            setLoading(false);
            return;
        }

        try {
            const formData2 = new FormData();
            formData2.append("file", file);

            console.log("=== PROFILE BUILD START ===");

            const res2 = await fetch(`${BASE_URL}/api/me/profile/from-resume`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData2,
            });

            console.log("PROFILE STATUS:", res2.status);
            const text2 = await res2.text();
            console.log("PROFILE RESPONSE BODY:", text2);

        } catch (e) {
            console.error("PROFILE ERROR:", e);
        }

        router.replace("/dashboard");
    }



    return (
        <section className="bg-white text-slate-900 dark:bg-white dark:text-slate-900">
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full blur-3xl opacity-20 bg-[#2E75B6]" />
                    <div className="absolute -bottom-40 -right-40 h-[560px] w-[560px] rounded-full blur-3xl opacity-15 bg-[#ED7D31]" />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 pt-8 pb-28">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[72vh]">
                        <div className="lg:col-span-7">
                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1.15, ease: "easeOut" }}
                                className="-ml-12"
                            >
                                <div className="relative w-full max-w-[960px] aspect-[3/1] mt-10">
                                    <Image
                                        src="/ablematch_logo-Photoroom.png"
                                        alt="AbleMatch"
                                        fill
                                        priority
                                        className="object-contain scale-[1.22]"
                                    />
                                </div>
                                <div className="mt-28">
                                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.03]">
                                        AI로 연결하는
                                        <span className="block text-[#2E75B6]">커리어 매칭</span>
                                    </h1>

                                    <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-600 max-w-2xl">
                                        이력서 업로드 한 번으로, 현실적으로 가능한 로드맵과 기업을 제안합니다.
                                    </p>
                                </div>
                            </motion.div>
                        </div>


                        <div className="lg:col-span-5">
                            <motion.div
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.12, duration: 1.0, ease: "easeOut" }}
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
                                className="pt-6"
                            >
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept={accept}
                                    onChange={(e) => onFileSelected(e.target.files?.[0] || null)}
                                    className="hidden"
                                />

                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-sm font-semibold text-[#2E75B6]">
                                            이력서 업로드
                                        </div>
                                        <div className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-500">
                                            PDF / DOCX / HWP
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={pickFile}
                                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-[#ED7D31] hover:opacity-80 transition"
                                    >
                                        파일 선택
                                    </button>
                                </div>

                                <div
                                    className={[
                                        "mt-6 border-b pb-4 transition-colors",
                                        dragActive ? "border-[#2E75B6]" : "border-slate-200",
                                        "dark:border-slate-200",
                                    ].join(" ")}
                                >
                                    <div className="text-sm md:text-base text-slate-700 dark:text-slate-700 truncate">
        <span className="font-semibold text-slate-900 dark:text-slate-900">
          {file ? "선택됨" : "여기에 파일을 놓으세요"}
        </span>
                                        {file ? ` — ${fileName}` : " 또는 ‘파일 선택’ 클릭"}
                                    </div>

                                    <div className="mt-2 text-xs md:text-sm text-slate-500 dark:text-slate-500">
                                        드래그 앤 드롭 지원
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-col gap-4">
                                    <button
                                        onClick={submit}
                                        disabled={!file}
                                        className={[
                                            "w-full py-4 text-base md:text-lg font-extrabold text-white transition",
                                            "focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2E75B6]/25",
                                            !file
                                                ? "bg-slate-300 cursor-not-allowed"
                                                : "bg-[#2E75B6] hover:bg-[#255f93]",
                                            "dark:bg-[#2E75B6] dark:hover:bg-[#255f93]",
                                        ].join(" ")}
                                    >
                                        AI 매칭 시작
                                    </button>

                                    <button
                                        onClick={() => router.push("/community")}
                                        className="w-full py-4 text-sm md:text-base font-bold text-slate-700 hover:text-[#2E75B6] transition dark:text-slate-700"
                                    >
                                        커뮤니티 둘러보기
                                    </button>

                                    {file ? (
                                        <button
                                            onClick={() => setFile(null)}
                                            className="text-sm font-semibold text-[#ED7D31] hover:opacity-80 transition self-start"
                                            type="button"
                                        >
                                            파일 제거
                                        </button>
                                    ) : null}
                                </div>
                            </motion.div>
                        </div>

                    </div>

                    <div className="mt-20 h-px w-full bg-slate-200 dark:bg-slate-200" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.35 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="lg:col-span-7"
                    >
                        <div className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.02]">
                            신체적 제약이 아닌
                            <br />
                            <span className="text-[#ED7D31]">전문성</span>으로
                            <br />
                            평가받는 곳
                        </div>

                        <p className="mt-8 text-lg md:text-xl text-slate-600 dark:text-slate-600 max-w-2xl">
                            전공·학력·프로젝트 이력과 접근성 조건을 함께 분석해
                            <br />
                            실제로 가능한 선택지만 제안합니다.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.35 }}
                        transition={{ delay: 0.15, duration: 1.2, ease: "easeOut" }}
                        className="lg:col-span-5"
                    >
                        <div className="relative w-full aspect-[4/3]">
                            <Image
                                src="/working.webp"
                                alt="Working"
                                fill
                                className="object-cover"
                                priority={false}
                            />
                        </div>
                    </motion.div>
                </div>

                <div className="mt-24 h-px w-full bg-slate-200 dark:bg-slate-200" />
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-24 pb-28">
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 1.25, ease: "easeOut" }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-12"
                >
                    <div className="lg:col-span-5">
                        <div className="text-sm font-bold text-[#2E75B6]">Introducing</div>
                        <h2 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">
                            AbleMatch
                        </h2>
                    </div>

                    <div className="lg:col-span-7">
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-600 leading-relaxed">
                            AbleMatch는 “직무 적합성”과 “근무 환경”을 함께 보는
                            지체장애 특화 커리어 플랫폼입니다.
                        </p>

                        <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-600 leading-relaxed">
                            기존 채용 시장에서 부족했던 배리어프리 환경 정보의 공백을 줄이고,
                            전공과 역량이 제대로 반영되는 연결을 목표로 합니다.
                        </p>

                        <ul className="mt-10 space-y-4 text-base md:text-lg text-slate-700 dark:text-slate-700">
                            <li className="flex gap-4">
                                <span className="mt-3 h-2 w-2 rounded-full bg-[#2E75B6]" />
                                <span>
                  이력서의 전공·자격·프로젝트 경험을 직무기술서와 매칭하고,
                  접근성·편의시설·재택 여부 같은 조건을 함께 반영합니다.
                </span>
                            </li>
                            <li className="flex gap-4">
                                <span className="mt-3 h-2 w-2 rounded-full bg-[#2E75B6]" />
                                <span>
                  기업의 편의시설 정보를 시각적으로 제공해,
                  지원 전 불확실함을 줄이는 방향을 지향합니다.
                </span>
                            </li>
                            <li className="flex gap-4">
                                <span className="mt-3 h-2 w-2 rounded-full bg-[#2E75B6]" />
                                <span>
                  단기 매칭을 넘어, 멘토링·스터디 같은 커리어 성장 흐름까지 연결합니다.
                </span>
                            </li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
