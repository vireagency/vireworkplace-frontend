import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card"; // adjust import path if needed

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
    <div className="min-h-[70vh] relative bg-black flex items-center justify-center py-12">
      {/* central subtle radial glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          width: 920,
          height: 520,
          background:
            "radial-gradient(circle at center, rgba(0,170,68,0.14) 0%, rgba(0,51,0,0) 45%)",
          filter: "blur(120px)",
          zIndex: 0,
        }}
      />
      {/* Top badge handled by dashboard layout; landing content below */}
      <div className="relative z-10 w-full max-w-6xl px-6">
        <div className="text-center">
          <h1 className="inline-flex items-center gap-3 text-white font-semibold text-2xl">
            <span role="img" aria-label="wave">
              👋
            </span>
            <span>Hi, William! Welcome to Vire Workplace</span>
          </h1>
          <p className="text-gray-300 mt-2 text-sm">
            Select an activity to continue
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {ACTION_CARDS.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(c.to)}
              className="group text-left w-full"
            >
              <Card className="w-full h-full bg-[#0A0A0A] border rounded-lg p-6 transition-shadow duration-200 border-[rgba(0,255,0,0.85)] hover:shadow-[0_8px_40px_rgba(0,255,0,0.14)]">
                <div className="flex flex-col h-full">
                  <h3 className="text-white font-bold text-lg leading-tight">
                    {c.title}
                  </h3>
                  <p className="text-gray-400 text-sm mt-2">{c.subtitle}</p>
                </div>
              </Card>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
