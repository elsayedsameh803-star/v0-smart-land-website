"use client";

import { X, Lightbulb, Code, Target, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Finding } from "@/lib/types";

interface FixAssistantProps {
  finding: Finding;
  locale: string;
  onClose: () => void;
}

export function FixAssistant({ finding, locale, onClose }: FixAssistantProps) {
  const isRtl = locale === "ar";
  const [activeTab, setActiveTab] = useState<"steps" | "code">("steps");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-dark-900 rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-gold-500/10 border border-gold-500/10">
        {/* Header */}
        <div className="sticky top-0 bg-dark-900 border-b border-gold-500/10 px-6 py-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {isRtl ? "مساعد الإصلاح بالذكاء الاصطناعي" : "AI Fix Assistant"}
              </h3>
              <p className="text-sm text-dark-400">
                {isRtl ? "إليك كيفية إصلاح هذه المشكلة المحددة" : "Here's how to fix this specific issue"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gold-500/10 transition-colors"
            aria-label={isRtl ? "إغلاق" : "Close"}
          >
            <X className="w-5 h-5 text-dark-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 bg-dark-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("steps")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                activeTab === "steps" ? "bg-dark-700 text-gold-300 shadow-sm" : "text-dark-400 hover:text-gold-400"
              )}
            >
              <Target className="w-4 h-4" />
              {isRtl ? "خطوات الإصلاح" : "Fix Steps"}
            </button>
            {finding.technicalExample && (
              <button
                onClick={() => setActiveTab("code")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                  activeTab === "code" ? "bg-dark-700 text-gold-300 shadow-sm" : "text-dark-400 hover:text-gold-400"
                )}
              >
                <Code className="w-4 h-4" />
                {isRtl ? "مثال برمجي" : "Code Example"}
              </button>
            )}
          </div>

          {/* Steps */}
          {activeTab === "steps" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gold-500/10 border border-gold-500/20">
                <h4 className="text-sm font-semibold text-gold-300 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  {isRtl ? "الشرح" : "Explanation"}
                </h4>
                <p className="text-sm text-dark-300">
                  {isRtl ? finding.whyItMattersAr : finding.whyItMatters}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  {isRtl ? "دليل خطوة بخطوة" : "Step-by-Step Guide"}
                </h4>
                <div className="space-y-3">
                  <div className="flex gap-3 p-3 rounded-lg bg-dark-800 border border-gold-500/10">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 text-dark-950 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </div>
                    <p className="text-sm text-dark-300">
                      {isRtl ? finding.howToFixAr : finding.howToFix}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gold-500/10 border border-gold-500/20">
                <h4 className="text-sm font-semibold text-gold-300 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {isRtl ? "النتيجة المتوقعة" : "Expected Outcome"}
                </h4>
                <p className="text-sm text-dark-300">
                  {isRtl ? finding.expectedBenefitAr : finding.expectedBenefit}
                </p>
              </div>
            </div>
          )}

          {/* Code Example */}
          {activeTab === "code" && finding.technicalExample && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Code className="w-4 h-4" />
                {isRtl ? "مثال برمجي" : "Code Example"}
              </h4>
              <pre className="text-sm bg-dark-950 text-gold-200 p-4 rounded-xl overflow-x-auto border border-gold-500/10">
                <code>{finding.technicalExample}</code>
              </pre>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-dark-800 hover:bg-dark-700 text-gold-300 font-medium transition-colors text-sm border border-gold-500/10"
          >
            {isRtl ? "إغلاق" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}