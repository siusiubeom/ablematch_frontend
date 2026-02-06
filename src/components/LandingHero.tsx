"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { Upload } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingHero({ setLoading, setStep }: any) {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);

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
        <section className="relative overflow-hidden bg-white">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-orange-50" />

            <div className="relative max-w-7xl mx-auto px-6 py-32 text-center">

                {/* HERO TITLE */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-6xl md:text-7xl font-extrabold tracking-tight"
                >
                    Career Matching <br />
                    <span className="text-[#1A365D]">Powered by AI</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto"
                >
                    A professional platform that evaluates expertise, not limitations.
                    We connect talent with accessible, realistic opportunities.
                </motion.p>

                {/* GLASS UPLOAD CARD */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-16 max-w-xl mx-auto backdrop-blur-md bg-white/70 border border-white shadow-2xl p-8 rounded-3xl"
                >
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx,.hwp"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="w-full border p-3 rounded-lg"
                    />

                    <button
                        onClick={submit}
                        className="mt-6 w-full py-4 rounded-xl text-white font-bold text-lg bg-[#1A365D] hover:bg-[#142845] transition shadow-lg"
                    >
                        <Upload className="inline mr-2" />
                        Start AI Matching
                    </button>

                    <button
                        onClick={() => router.push("/community")}
                        className="mt-3 w-full py-3 rounded-xl border font-semibold hover:bg-gray-100"
                    >
                        Explore Community
                    </button>
                </motion.div>

                {/* INTRODUCING US */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mt-32 max-w-4xl mx-auto text-left"
                >
                    <h2 className="text-4xl font-bold mb-6 text-[#1A365D]">
                        Introducing AbleMatch
                    </h2>

                    <p className="text-gray-600 leading-relaxed text-lg">
                        AbleMatch is an AI-driven career platform built to remove
                        structural barriers in employment. We analyze skills,
                        accessibility conditions, and realistic job environments to
                        recommend opportunities that truly work.
                    </p>

                    <p className="mt-4 text-gray-600 leading-relaxed text-lg">
                        Our mission is to redefine hiring standards — focusing on
                        capability, not constraints. We empower individuals and companies
                        to meet where potential actually exists.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
