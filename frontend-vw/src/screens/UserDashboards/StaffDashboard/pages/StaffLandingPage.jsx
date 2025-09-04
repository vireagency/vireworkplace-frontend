// src/screens/UserDashboards/StaffDashboard/pages/StaffLandingPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
// Update import path if your shadcn card is in a different path:
import { Card } from "@/components/ui/card";

const ACTION_CARDS = [
  {
    id: "check-in",
    title: "Check In",
    subtitle: "Check in, log time, stay accountable",
    to: "/staff/check-in",
  },
  {
    id: "check-out",
    title: "Check Out",
    subtitle: "Wrap up, check out, track progress",
    to: "/staff/check-out",
  },
  {
    id: "tasks",
    title: "Tasks",
    subtitle: "View, manage, and complete tasks",
    to: "/staff/tasks",
  },
  {
    id: "evaluation",
    title: "Evaluation",
    subtitle: "Submit and improve performance",
    to: "/staff/evaluation",
  },
];

export default function StaffLandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative bg-black flex flex-col items-center">
      {/* BIG central radial glow behind content */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-start justify-center pointer-events-none"
      >
        <div
          style={{
            width: 1200,
            height: 700,
            background:
              "radial-gradient(circle at center, rgba(0,170,68,0.14) 0%, rgba(0,51,0,0) 45%)",
            filter: "blur(150px)",
            transform: "translateY(-80px)",
          }}
        />
      </div>

      {/* Top badge with its own small glow (positioned near top center) */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="relative inline-block">
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: "-6px",
              borderRadius: "9999px",
              background:
                "radial-gradient(circle at center, rgba(0,170,68,0.45) 0%, rgba(0,51,0,0) 40%)",
              filter: "blur(18px)",
              zIndex: 0,
            }}
          />
          <div
            className="relative z-10 text-sm font-medium px-3 py-1 rounded-full text-[#CFFFE1]"
            style={{
              background: "rgba(0,0,0,0.25)",
              border: "1px solid rgba(0,170,68,0.35)",
            }}
          >
            Vire Workplace
          </div>
        </div>
      </div>

      {/* Content container */}
      <div className="z-40 w-full max-w-6xl px-6 py-28">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="inline-flex items-center gap-3 text-white font-extrabold text-3xl sm:text-4xl">
            <span role="img" aria-label="wave">
              👋
            </span>
            <span>Hi, William! Welcome to Vire Workplace</span>
          </h1>
          <p className="text-gray-300 mt-3 text-base">
            Select an activity to continue
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ACTION_CARDS.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(c.to)}
              className="group w-full text-left"
            >
              {/* Use Card if available; else change to div */}
              <Card
                className={
                  "w-full h-full bg-[#0A0A0A] rounded-lg p-6 transition-shadow duration-200 " +
                  "border-[1px] border-[#00FF00] hover:shadow-[0_10px_50px_rgba(0,255,0,0.12)]"
                }
              >
                <div className="flex flex-col h-full">
                  <h3 className="text-white font-semibold text-lg">
                    {c.title}
                  </h3>
                  <p className="text-gray-400 text-sm mt-3">{c.subtitle}</p>
                </div>
              </Card>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
