export const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8090";

export async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T | null> {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    });

    if (!res.ok) {
        // DO NOT THROW — EVER
        console.warn(
            `[apiFetch] ${res.status} ${path}`,
            await res.text()
        );
        return null;
    }

    return res.json();
}

export async function apiFetchRaw(
    path: string,
    options: RequestInit = {}
) {
    const token = localStorage.getItem("token");

    return fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        cache: "no-store",
    });
}


