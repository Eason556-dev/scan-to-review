"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();
  const shopId = searchParams.get("id") || "shop_001";
  
  const [language, setLanguage] = useState<"en" | "cn">("cn");
  const [reviews, setReviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string>("");

  const generateReviews = async () => {
    setLoading(true);
    setReviews([]);
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shopId, language }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate reviews");
      }

      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Error:", error);
      setToast("Failed to generate reviews. Please try again.");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReview = async (review: string) => {
    try {
      await navigator.clipboard.writeText(review);
      setToast("Copied!");
      setTimeout(() => setToast(""), 1000);
      
      // Wait 1 second then redirect
      setTimeout(() => {
        if (language === "cn") {
          // Try to open Xiaohongshu app, fallback to web
          window.location.href = "xhs://";
          setTimeout(() => {
            window.location.href = "https://www.xiaohongshu.com";
          }, 500);
        } else {
          // Open Google Maps
          window.location.href = "https://www.google.com/maps";
        }
      }, 1000);
    } catch (error) {
      console.error("Failed to copy:", error);
      setToast("Failed to copy");
      setTimeout(() => setToast(""), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Scan-to-Review
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate AI reviews for your favorite places
          </p>
        </div>

        {/* Language Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg flex gap-2">
            <button
              onClick={() => setLanguage("cn")}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                language === "cn"
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              🇨🇳 中文
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                language === "en"
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              🇺🇸 English
            </button>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={generateReviews}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </span>
            ) : (
              "Generate Reviews"
            )}
          </button>
        </div>

        {/* Reviews Grid */}
        {reviews.length > 0 && (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <div
                key={index}
                onClick={() => handleCopyReview(review)}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all cursor-pointer border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-600"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {review}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Click to copy and open {language === "cn" ? "Xiaohongshu" : "Google Maps"}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl z-50 animate-bounce">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
