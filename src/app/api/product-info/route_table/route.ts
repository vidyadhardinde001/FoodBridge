import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

// Define file path for storage
const filePath = path.join(process.cwd(), "ingredients_health.json");

// Load existing data or create a new file
const loadIngredientData = () => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf-8");
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
};

// Save data back to the file
const saveIngredientData = (data: any) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

// Fetch from OpenAI (limit response to 5 tokens)
const fetchFromOpenAI = async (ingredient: string): Promise<string> => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing in environment variables.");
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    max_tokens: 5, // Limit output to max 5 tokens
    messages: [
      { role: "system", content: "You are an expert in food ingredients and health effects. Answer with a max of 5 words." },
      { role: "user", content: `What are the health concerns related to ${ingredient}?` },
    ],
  });

  return response.choices[0]?.message?.content || "No data available.";
};

// API Route Handler
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ingredient = searchParams.get("ingredient");

    if (!ingredient) {
      return NextResponse.json({ error: "Ingredient is required" }, { status: 400 });
    }

    let data = loadIngredientData();

    // Check if the ingredient already exists in the file
    if (data[ingredient]) {
      return NextResponse.json({ healthConcerns: data[ingredient] });
    }

    // Fetch from OpenAI
    const healthConcerns = await fetchFromOpenAI(ingredient);
    data[ingredient] = healthConcerns;
    saveIngredientData(data); // Store in file

    return NextResponse.json({ healthConcerns });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
