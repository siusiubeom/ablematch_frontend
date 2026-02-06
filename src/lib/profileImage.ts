export function getProfileImage(url: string | null | undefined) {
    if (!url) {
        return "https://api.dicebear.com/7.x/avataaars/svg?seed=profile";
    }

    if (url.startsWith("http")) return url;

    return `${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`;
}
