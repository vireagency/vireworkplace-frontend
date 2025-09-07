import React from "react";
import { useToast } from "./use-toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-lg px-4 py-3 shadow-lg ${
            t.className || "bg-gray-900 text-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              {t.title && <p className="font-semibold">{t.title}</p>}
              {t.description && <p className="text-sm">{t.description}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="ml-4 text-sm text-gray-300 hover:text-white"
            >
              ✖
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
