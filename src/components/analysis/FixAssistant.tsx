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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-surface-200 px-6 py-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-surface-900">
                {isRtl ? "مساعد الإصلاح بالذكاء الاصطناعي" : "AI Fix Assistant"}
              </h3>
              <p className="text-sm text-surface-500">
                {isRtl ? "إليك كيفية إصلاح هذه المشكلة المحددة" : "Here's how to fix this specific issue"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
            aria-label={isRtl ? "إغلاق" : "Close"}
          >
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 bg-surface-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("steps")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                activeTab === "steps" ? "bg-white text-surface-900 shadow-sm" : "text-surface-500 hover:text-surface-700"
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
                  activeTab === "code" ? "bg-white text-surface-900 shadow-sm" : "text-surface-500 hover:text-surface-700"
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
              <div className="p-4 rounded-xl bg-primary-50 border border-primary-200">
                <h4 className="text-sm font-semibold text-primary-800 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  {isRtl ? "الشرح" : "Explanation"}
                </h4>
                <p className="text-sm text-primary-700">
                  {isRtl ? finding.whyItMattersAr : finding.whyItMatters}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-surface-900 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  {isRtl ? "دليل خطوة بخطوة" : "Step-by-Step Guide"}
                </h4>
                <div className="space-y-3">
                  <div className="flex gap-3 p-3 rounded-lg bg-surface-50 border border-surface-200">
                    <div className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </div>
                    <p className="text-sm text-surface-700">
                      {isRtl ? finding.howToFixAr : finding.howToFix}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-accent-50 border border-accent-200">
                <h4 className="text-sm font-semibold text-accent-800 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {isRtl ? "النتيجة المتوقعة" : "Expected Outcome"}
                </h4>
                <p className="text-sm text-accent-700">
                  {isRtl ? finding.expectedBenefitAr : finding.expectedBenefit}
                </p>
              </div>
            </div>
          )}

          {/* Code Example */}
          {activeTab === "code" && finding.technicalExample && (
            <div>
              <h4 className="text-sm font-semibold text-surface-900 mb-3 flex items-center gap-2">
                <Code className="w-4 h-4" />
                {isRtl ? "مثال برمجي" : "Code Example"}
              </h4>
              <pre className="text-sm bg-surface-900 text-surface-100 p-4 rounded-xl overflow-x-auto">
                <code>{finding.technicalExample}</code>
              </pre>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-700 font-medium transition-colors text-sm"
          >
            {isRtl ? "إغلاق" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}