"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import {apiFetch, apiFetchRaw} from "@/lib/api";


export default function Home() {
    const router = useRouter();

    useEffect(() => {
        async function route() {
            const token = getToken();

            if (!token) {
                router.replace("/landing");
                return;
            }

            const res = await apiFetchRaw("/api/me/profile");

            if (res.status === 200) {
                router.replace("/dashboard");
            } else {
                router.replace("/landing");
            }
        }

        route();
    }, [router]);

    return null;
}
