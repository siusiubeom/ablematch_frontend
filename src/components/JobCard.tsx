"use client";

import { useEffect, useState } from "react";
import { Briefcase, CheckCircle, MapPin } from "lucide-react";
import { MatchingCard } from "@/lib/types";
import { apiFetch } from "@/lib/api";

interface Props {
    job: MatchingCard;
    onClick: () => void;
}

export default function JobCard({ job, onClick }: Props) {


    return (
        <div
            className="rounded-xl border p-6 relative overflow-hidden transition-shadow hover:shadow-md bg-white cursor-pointer"
            onClick={onClick}
        >

            <div className="absolute top-0 right-0 p-4">
        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
          적합도 {job.score}%
        </span>
            </div>

            <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#1A365D] text-white flex items-center justify-center">
                    <Briefcase size={18} />
                </div>

                <div>
                    <h3 className="text-lg font-bold">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.company}</p>
                </div>
            </div>

            {job.dueDateText && (
                <p className="text-xs text-gray-400 mt-1">
                    마감: {job.dueDateText}
                </p>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
                {job.highlights.map((h) => (
                    <span
                        key={h}
                        className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1"
                    >
            <CheckCircle size={12} /> {h}
          </span>
                ))}
            </div>


            <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <span className="text-sm font-bold flex items-center gap-1 text-[#38B2AC] bg-teal-50 px-3 py-1 rounded-lg">
          <MapPin size={12} />
            {job.workType === "REMOTE"
                ? "재택 근무"
                : job.workType === "HYBRID"
                    ? "하이브리드"
                    : "출근 근무"}
        </span>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick();
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-sm"
                >
                    상세 보기
                </button>
            </div>
        </div>
    );
}
