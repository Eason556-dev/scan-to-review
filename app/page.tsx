"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// 1. 定义商店数据（临时数据库）
const SHOPS: Record<string, { name: string; query: string }> = {
  "shop_001": { name: "Happy Lamb Hot Pot", query: "Happy Lamb Hot Pot Toronto" },
  "shop_002": { name: "Daming Lake Chinese Food", query: "Daming Lake Chinese Food" }
};

// 2. 内部组件：负责逻辑（读取URL、生成文案）
function ReviewComponent() {
  const searchParams = useSearchParams();
  // 获取 shopId，默认为 shop_001
  const shopId = searchParams.get("id") || "shop_001";
  const shop = SHOPS[shopId] || SHOPS["shop_001"]; // 兜底逻辑

  const [language, setLanguage] = useState<"en" | "cn">("cn");
  const [reviews, setReviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const generateReviews = async () => {
    setLoading(true);
    setReviews([]);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopId, language }),
      });

      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      setToast("Error generating reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAndJump = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast("Copied! Opening App...");
      
      setTimeout(() => {
        if (language === "cn") {
          // 尝试跳转小红书
          window.location.href = "xhs://"; 
          // 500ms后如果没反应，跳转网页版（作为兜底）
          setTimeout(() => {
             // 这里的 window.location.href 不会覆盖上面的跳转，只有在 App 没唤起时才有效
             // 但现代浏览器限制较多，用户可能需要手动点
          }, 500);
        } else {
          // 跳转 Google Maps 搜索该店铺
          const query = encodeURIComponent(shop.query);
          window.location.href = `https://www.google.com/maps/search/?api=1&query=${query}`;
        }
        setToast("");
      }, 1000);
    } catch (err) {
      setToast("Failed to copy");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      {/* 标题 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          {shop.name}
        </h1>
        <p className="text-gray-500 text-sm mt-2">Get AI Review & Post</p>
      </div>

      {/* 语言切换 */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setLanguage("cn")}
          className={`px-6 py-2 rounded-full transition-all ${
            language === "cn"
              ? "bg-black text-white shadow-lg"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          🇨🇳 小红书
        </button>
        <button
          onClick={() => setLanguage("en")}
          className={`px-6 py-2 rounded-full transition-all ${
            language === "en"
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          🇺🇸 Google Maps
        </button>
      </div>

      {/* 生成按钮 */}
      <button
        onClick={generateReviews}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-xl active:scale-95 transition-transform disabled:opacity-50"
      >
        {loading ? "AI Writing..." : "✨ Generate Reviews"}
      </button>

      {/* 结果卡片 */}
      <div className="mt-8 space-y-4">
        {reviews.map((review, i) => (
          <div
            key={i}
            onClick={() => handleCopyAndJump(review)}
            className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md cursor-pointer active:bg-gray-50 transition-colors"
          >
            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{review}</p>
            <div className="mt-3 flex items-center justify-end text-xs text-purple-600 font-medium">
              <span>Tap to Copy & Open App →</span>
            </div>
          </div>
        ))}
      </div>

      {/* 提示条 */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-2 rounded-full text-sm backdrop-blur-sm animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}

// 3. 外部组件：用 Suspense 包裹内部组件 (修复 Cloudflare 报错的关键！)
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Shop...</div>}>
        <ReviewComponent />
      </Suspense>
    </div>
  );
}