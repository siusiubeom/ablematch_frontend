import { ReactNode } from "react";

export default function FeatureCard({
                                        icon,
                                        title,
                                        desc,
                                    }: {
    icon: ReactNode;
    title: string;
    desc: string;
}) {
    return (
        <div className="
            p-6 rounded-2xl
            border border-gray-200
            bg-white
            shadow-sm
            transition
            hover:shadow-md
        ">
            <div className="
                w-12 h-12 mb-4
                rounded-xl
                bg-[#E6FFFA]
                text-[#1A365D]
                flex items-center justify-center
            ">
                {icon}
            </div>

            <h3 className="text-lg font-extrabold text-[#1A365D] mb-2">
                {title}
            </h3>

            <p className="text-sm leading-relaxed text-gray-700">
                {desc}
            </p>
        </div>
    );
}
