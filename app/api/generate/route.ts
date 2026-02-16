export const runtime = 'edge';

import { shops } from '@/lib/shops';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { shopId, language } = await request.json();

    if (!shopId || !language) {
      return NextResponse.json(
        { error: 'Missing shopId or language' },
        { status: 400 }
      );
    }

    const shop = shops[shopId];
    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    const prompt = shop.prompts[language as 'en' | 'cn'];
    if (!prompt) {
      return NextResponse.json(
        { error: 'Language not supported' },
        { status: 400 }
      );
    }

    // Get API key from environment variable
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Call DeepSeek API to generate 3 reviews
    const systemPrompt = language === 'cn' 
      ? '你是一位专业的美食评论家，擅长撰写生动有趣的餐厅评价。请生成3篇不同风格的评价，每篇都要真实自然，适合在社交媒体上分享。'
      : 'You are a professional food critic. Generate 3 authentic, natural restaurant reviews suitable for sharing on social media platforms. Each review should have a different style and perspective.';

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `${prompt}\n\nRestaurant: ${shop.name}\nCuisine: ${shop.cuisine}\n\nPlease generate exactly 3 reviews, each on a new line.`,
          },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate reviews' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Parse the response to extract 3 reviews
    // Split by newlines and filter empty lines
    const reviewLines = content
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0 && !line.match(/^\d+[\.\)]/));

    // If we have exactly 3 reviews, use them; otherwise split the content
    let reviews: string[] = [];
    if (reviewLines.length >= 3) {
      reviews = reviewLines.slice(0, 3);
    } else {
      // Fallback: split by common separators or create 3 variations
      const parts = content.split(/\n\n+/).filter((p: string) => p.trim().length > 20);
      if (parts.length >= 3) {
        reviews = parts.slice(0, 3);
      } else {
        // Last resort: create 3 reviews from the content
        reviews = [
          content.substring(0, Math.floor(content.length / 3)),
          content.substring(Math.floor(content.length / 3), Math.floor(content.length * 2 / 3)),
          content.substring(Math.floor(content.length * 2 / 3)),
        ].filter(r => r.trim().length > 0);
      }
    }

    // Ensure we have exactly 3 reviews
    while (reviews.length < 3) {
      reviews.push(reviews[reviews.length - 1] || content);
    }

    return NextResponse.json({ reviews: reviews.slice(0, 3) });
  } catch (error) {
    console.error('Error generating reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
