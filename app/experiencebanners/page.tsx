// app/experiencebanners/page.tsx
/* eslint-disable react/no-unescaped-entities */
import React from "react";
import Image from "next/image";

type Experience = {
  position: string;
  companyLogo: string; // path to logo under /public/photos/
  dateIn: string;
  dateOut?: string;
  description: string;
};

function diffInMonths(fromISO: string, toISO?: string) {
  const start = new Date(fromISO);
  const end = toISO ? new Date(toISO) : new Date();
  const y = end.getFullYear() - start.getFullYear();
  const m = end.getMonth() - start.getMonth();
  return y * 12 + m + (end.getDate() >= start.getDate() ? 0 : -1);
}

function formatTotal(months: number) {
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  const yStr = yrs > 0 ? `${yrs} yr${yrs > 1 ? "s" : ""}` : "";
  const mStr = mos > 0 ? `${mos} mo${mos > 1 ? "s" : ""}` : "";
  return [yStr, mStr].filter(Boolean).join(" ");
}

function formatMonthYear(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", { month: "short", year: "numeric" });
}

const EXPERIENCES: Experience[] = [
  {
    position: "Full Stack Engineer",
    companyLogo: "/photos/globant-logo.png",
    dateIn: "2024-11-01",
    description:
      "Contractor for ExxonMobil account. Support for Corporate Financial Services apps: Vendors, On-Premise, Cloud-Based, SaaS.",
  },
  {
    position: "Full Stack Engineer",
    companyLogo: "/photos/middlesoft.png",
    dateIn: "2023-04-01",
    dateOut: "2025-06-01",
    description:
      "Developed the company’s Intranet, Human Resources and Sales APIs. Software solutions for Techint.",
  },
  {
    position: "Supply Chain Data Analyst",
    companyLogo: "/photos/exxon-logo.png",
    dateIn: "2020-10-01",
    dateOut: "2022-12-01",
    description: "Supply chain data governance (SAP Stripes & GOM).",
  },
];

export default function ExperienceBanners() {
  return (
    <section className="w-full py-10">
      <h1 className="text-md sm:text-xl font-bold text-left text-gray-800 dark:text-gray-100 mb-8 select-none">
        job experience
      </h1>

      <div className="space-y-6">
        {EXPERIENCES.map((exp, i) => {
          const totalMonths = diffInMonths(exp.dateIn, exp.dateOut);
          const total = formatTotal(totalMonths);
          const startLabel = formatMonthYear(exp.dateIn);
          const endLabel = exp.dateOut ? formatMonthYear(exp.dateOut) : "Present";

          return (
            <article
              key={`${exp.companyLogo}-${exp.position}-${i}`}
              className="relative overflow-hidden rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow select-none"
            >
              {/* Accent bar */}
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-indigo-500 to-sky-500" />

              <div className="p-5 sm:p-6 pl-6 sm:pl-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg sm:text-xl font-semibold">{exp.position}</h3>
                    <Image
                      src={exp.companyLogo}
                      alt="Company logo"
                      width={86}
                      height={36}
                      className="object-contain select-none"
                    />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 border border-gray-200 dark:border-gray-700">
                      {total}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {startLabel} — {endLabel}
                    </span>
                  </div>

                  <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-200 leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
