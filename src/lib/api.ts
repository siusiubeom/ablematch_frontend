export const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://ablematchbackend-1.onrender.com";

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
    if (res.status === 404) {
        return null;
    }
    if (!res.ok) {
        const text = await res.text();
        const error: any = new Error(text || "API error");
        error.status = res.status;
        throw error;
    }

    if (res.status === 204 || res.headers.get("content-length") === "0") {
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


