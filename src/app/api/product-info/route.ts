// src/app/api/product-info/route.ts
import { NextResponse } from "next/server";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productName = searchParams.get("productName")?.trim();

  if (!productName) {
    return NextResponse.json(
      { error: "❌ Product name is required." },
      { status: 400 }
    );
  }

  try {
    // 🔍 Check if data is already cached
    const cacheKey = `product-info:${productName.toLowerCase()}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      console.log(`✅ [CACHE HIT] Fetched "${productName}" from Redis.`);
      return NextResponse.json(JSON.parse(cachedData));
    }

    console.log(
      `🔍 [FETCHING] Generating response for "${productName}" using OpenAI.`
    );

    // 🔑 Ensure API key is available
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("❌ OpenAI API key is missing.");
    }

    // 📜 Construct the prompt for OpenAI
    const prompt = `
      Provide a **concise 2-line description** of the product **"${productName}"**, including its history, manufacturer, and primary use.
      Then, list any **known health concerns** associated with this product in **bullet points**.
    `;

    // 🎯 Fetch response from OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error("❌ Failed to fetch response from OpenAI.");
    }

    const data = await response.json();
    const responseText =
      data.choices[0]?.message?.content || "No response available.";

    // 📝 Extract description and health concerns
    const sections = responseText.split("\n\n");
    const description = sections[0]?.trim() || "No description available.";

    // 🩺 Convert health concerns to bullet points
    let healthConcerns =
      sections[1]?.split("\n").filter((line) => line.trim().startsWith("-")) ||
      [];
    if (healthConcerns.length === 0) {
      healthConcerns = ["✅ No major health concerns reported."];
    }

    // 🎯 Final structured response
    const result = {
      productName,
      description,
      healthConcerns,
    };

    // ⏳ Store in Redis cache for 24 hours
    await redis.set(cacheKey, JSON.stringify(result));

    console.log(`✅ [CACHE STORE] Stored data for "${productName}" in Redis.`);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`❌ [ERROR] ${error.message}`);

    return NextResponse.json(
      { error: error.message || "Something went wrong." },
      { status: 500 }
    );
  }
}
