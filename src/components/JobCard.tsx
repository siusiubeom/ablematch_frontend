// components/JobCard.tsx
"use client";

import { MatchingCard } from "@/lib/types";

interface Props {
    job: MatchingCard;
    onClick: () => void;
}

export default function JobCard({ job, onClick }: Props) {
    return (
        <div
            onClick={onClick}
            className="rounded-xl border border-gray-200 p-6 relative overflow-hidden transition-shadow hover:shadow-md bg-white cursor-pointer"
        >
            <div className="absolute top-0 right-0 p-4">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                    적합도 {job.score}%
                </span>
            </div>

            <h3 className="text-lg font-bold mb-1">{job.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{job.company}</p>

            <div className="flex flex-wrap gap-2">
                {job.highlights.map((h) => (
                    <span
                        key={h}
                        className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1"
                    >
                        {h}
                    </span>
                ))}
            </div>
        </div>
    );
}
