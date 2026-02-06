"use client";

import { useEffect, useState } from "react";
import { MapPin, Briefcase, Star } from "lucide-react";
import { MatchingCard } from "@/lib/types";
import { apiFetch } from "@/lib/api";

interface Props {
    job: MatchingCard;
    onClick: () => void;
}

export default function JobCard({ job, onClick }: Props) {
    const [latlng, setLatlng] = useState<{ lat: number; lng: number } | null>(
        null
    );

    useEffect(() => {
        if (!job.company) return;

        apiFetch<any>(`/api/maps/geocode?query=${encodeURIComponent(job.company)}`)
            .then((res) => {
                if (res?.lat && res?.lng) {
                    setLatlng(res);
                }
            });
    }, [job.company]);

    return (
        <div
            onClick={onClick}
            className="group rounded-2xl border border-gray-200 bg-white hover:shadow-lg transition-all cursor-pointer overflow-hidden"
        >
            {latlng && (
                <iframe
                    className="w-full h-32"
                    src={`https://map.naver.com/v5/search/${job.company}`}
                    loading="lazy"
                />
            )}

            <div className="p-5 relative">
                <div className="absolute top-4 right-4 bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star size={12} /> {job.score}%
                </div>

                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1A365D] text-white flex items-center justify-center">
                        <Briefcase size={18} />
                    </div>

                    <div>
                        <h3 className="text-lg font-bold">{job.title}</h3>
                        <p className="text-sm text-gray-500">{job.company}</p>
                    </div>
                </div>

                {job.distanceKm && (
                    <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                        <MapPin size={12} />
                        {job.distanceKm.toFixed(1)} km 거리
                    </p>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                    {job.highlights.map((h) => (
                        <span
                            key={h}
                            className="text-xs bg-gray-100 px-2 py-1 rounded-full"
                        >
              {h}
            </span>
                    ))}
                </div>

                <div className="mt-4">
          <span className="px-3 py-1 bg-teal-50 text-[#38B2AC] text-xs font-bold rounded-full">
            {job.workType === "REMOTE"
                ? "재택"
                : job.workType === "HYBRID"
                    ? "하이브리드"
                    : "출근"}
          </span>
                </div>
            </div>
        </div>
    );
}
