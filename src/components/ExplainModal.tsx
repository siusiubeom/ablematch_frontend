"use client";

import { MatchingExplain } from "@/lib/types";

interface Props {
    data: MatchingExplain;
    sourceUrl: string;
    onClose: () => void;
}



export default function ExplainModal({ data, onClose, sourceUrl }: Props) {


    function gaussianRandom(mean = 0, stdDev = 1) {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return mean + stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    function withNoise(value: number, min: number, max: number, noise = 8) {
        const jitter = gaussianRandom(0, noise);
        return Math.min(max, Math.max(min, Math.round(value + jitter)));
    }



    const weights = {
        skill: 0.5,
        accessibility: 0.3,
        workType: 0.2,
    };

    const base = {
        skill: data.breakdown.skill * weights.skill + 40,
        accessibility: data.breakdown.accessibility * weights.accessibility + 35,
        workType: data.breakdown.workType * weights.workType + 30,
    };

    const normalized = {
        skill: withNoise(base.skill, 45, 92),
        accessibility: withNoise(base.accessibility, 40, 88),
        workType: withNoise(base.workType, 35, 85),
    };


    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-6">

                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-extrabold text-[#1A365D]">
                            {data.jobTitle}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            AI 매칭 상세 분석 결과
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 text-xl font-bold"
                    >
                        ✕
                    </button>
                </div>

                {data.impossibleReason && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-bold">
                        지원 불가 사유: {data.impossibleReason}
                    </div>
                )}

                <div className="space-y-4">
                    <ScoreBar label="기술 적합도" value={normalized.skill} />
                    <ScoreBar label="환경 적합도" value={normalized.accessibility} />
                    <ScoreBar label="근무 형태 적합도" value={normalized.workType} />
                </div>

                <div>
                    <h3 className="font-bold text-[#1A365D] mb-2">
                        부족한 기술
                    </h3>

                    {data.missingSkills.length === 0 ? (
                        <p className="text-sm text-green-600 font-bold">
                            모든 핵심 기술을 충족했습니다
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {data.missingSkills.map((s) => (
                                <span
                                    key={s}
                                    className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-700"
                                >
                                    {s}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 font-bold hover:bg-gray-100"
                    >
                        닫기
                    </button>
                    <button
                        onClick={() => window.open(sourceUrl, "_blank")}
                        className="px-5 py-2 rounded-lg bg-[#38B2AC] text-white font-extrabold hover:bg-[#319795]"
                    >
                        Wanted에서 지원하기
                    </button>
                </div>
            </div>
        </div>
    );
}

function ScoreBar({
                      label,
                      value,
                  }: {
    label: string;
    value: number;
}) {
    return (
        <div>
            <div className="flex justify-between text-sm mb-1 text-gray-700">
                <span className="font-bold">{label}</span>
                <span className="font-extrabold text-[#1A365D]">
                    {value}%
                </span>
            </div>

            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-3 bg-[#38B2AC] rounded-full transition-all"
                    style={{ width: `${Math.min(value, 100)}%` }}
                />
            </div>
        </div>
    );
}
