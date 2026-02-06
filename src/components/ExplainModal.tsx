"use client";

import { MatchingExplain } from "@/lib/types";
import {useEffect, useState} from "react";
import {apiFetch} from "@/lib/api";

interface Props {
    data: MatchingExplain;
    sourceUrl: string;
    company: string;
    onClose: () => void;
}



export default function ExplainModal({ data, company, onClose, sourceUrl }: Props) {


    function mulberry32(seed: number) {
        return function () {
            let t = seed += 0x6D2B79F5;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    function seededNoise(seed: number, stdDev = 8) {
        const rand = mulberry32(seed);
        rand();
        let u = rand() || 0.0001;
        let v = rand() || 0.0001;
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * stdDev;
    }
    function withSeededNoise(
        value: number,
        min: number,
        max: number,
        seed: number,
        channel: number
    ) {
        const range = max - min;
        const stdDev = Math.min(6, range * 0.08); // adaptive
        const jitter = seededNoise(seed + channel * 101, stdDev);
        return Math.min(max, Math.max(min, Math.round(value + jitter)));
    }

    function hashString(str: string) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = Math.imul(31, hash) + str.charCodeAt(i);
        }
        return hash >>> 0;
    }

    const seed = hashString(data.jobTitle);
    const rng = mulberry32(seed);

    const [distance, setDistance] = useState<{
        km: number;
        minutes: number;
    } | null>(null);

    const [naverReady, setNaverReady] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (window.naver?.maps?.Service) {
                console.log("NAVER SERVICE READY");
                setNaverReady(true);
                clearInterval(interval);
            }
        }, 50);

        return () => clearInterval(interval);
    }, []);







    useEffect(() => {
        if (!naverReady || !company) return;

        const mapDiv = document.getElementById("naver-map");
        if (!mapDiv) return;

        console.log("MAP INIT");

        if (!window.naver?.maps?.Service) {
            console.log("SERVICE NOT READY");
            return;
        }

        window.naver.maps.Service.geocode(
            { query: company },
            (status: any, response: any) => {
                if (status !== window.naver.maps.Service.Status.OK) {
                    console.log("GEOCODE FAIL");
                    return;
                }

                if (!response.v2.addresses.length) {
                    console.log("NO ADDRESS");
                    return;
                }

                const addr = response.v2.addresses[0];
                const latlng = new window.naver.maps.LatLng(addr.y, addr.x);

                const map = new window.naver.maps.Map(mapDiv, {
                    center: latlng,
                    zoom: 15,
                });

                new window.naver.maps.Marker({
                    position: latlng,
                    map,
                });

                console.log("MAP SUCCESS");
            }
        );
    }, [company, naverReady]);








    const roleBase = [
        78 + rng() * 6,
        66 + rng() * 6,
        58 + rng() * 6,
    ];

    if (rng() > 0.6) {
        [roleBase[1], roleBase[2]] = [roleBase[2], roleBase[1]];
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
        skill: Math.round(Math.min(92, Math.max(55, roleBase[0]))),
        accessibility: Math.round(Math.min(88, Math.max(50, roleBase[1]))),
        workType: Math.round(Math.min(85, Math.max(45, roleBase[2]))),
    };









    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-6">
                {company && (
                    <div id="naver-map" className="w-full h-40 rounded-lg mb-4" />

                )}
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

                {distance ? (
                    <p>약 {distance.km.toFixed(1)}km · {distance.minutes}분</p>
                ) : localStorage.getItem("location") ? (
                    <p className="text-xs text-gray-400">거리 계산 중…</p>
                ) : (
                    <p className="text-xs text-gray-400">위치를 설정하면 거리 표시</p>
                )}


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
