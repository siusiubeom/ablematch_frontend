"use client";

import { useState } from "react";
import Header from "@/components/Header";
import LandingHero from "@/components/LandingHero";

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);

    return (
        <>

            <Header hideNav />

            {loading && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center text-white">
                    <div className="w-20 h-20 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            <LandingHero setLoading={setLoading} setStep={setStep} />
        </>
    );
}
