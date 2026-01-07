/**
 * LLM Service Module
 * 
 * This module handles all LLM interactions using OpenRouter API.
 * It processes user reviews and generates:
 * - User-facing replies (empathetic responses)
 * - Admin summaries (concise overview)
 * - Recommended actions (actionable next steps)
 * 
 * All LLM calls are server-side only for security.
 */

import OpenAI from "openai";

// Input payload for LLM processing
type LlmPayload = {
    rating: number;  // 1-5 star rating
    review: string;  // User's review text
};

// Structured response from LLM
export type LlmResponse = {
    userReply: string;        // Response shown to user
    summary: string;          // Admin-facing summary
    recommendedNext: string;  // Suggested action for ops/support
};

/**
 * Generate AI insights for a user review
 * 
 * This function:
 * 1. Validates API key configuration
 * 2. Constructs a structured prompt
 * 3. Calls OpenRouter LLM API
 * 4. Returns JSON with three AI-generated fields
 * 
 * @param payload - Contains rating and review text
 * @returns Promise with userReply, summary, and recommendedNext
 * @throws Error if OPENROUTER_API_KEY is not configured
 */
export async function generateReviewInsights(
    payload: LlmPayload
): Promise<LlmResponse> {
  // Validate API key exists
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  // Initialize OpenRouter client (OpenAI-compatible)
  const client = new OpenAI({
    apiKey,
    baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1"
  });

  const prompt = `
You are a customer support assistant for a retail marketplace.
Given a user rating (1-5) and free-text review, return JSON strictly matching:
{
  "userReply": "string",
  "summary": "string",
  "recommendedNext": "string"
}
Constraints:
- userReply: 2-3 sentences, empathetic, concise.
- summary: one sentence.
- recommendedNext: one actionable step for ops/support.
- If review is empty, apologize and request details. If long, stay concise.
Input:
Rating: ${payload.rating}
Review: ${payload.review}
Return only JSON.`;

  const completion = await client.chat.completions.create({
    model: process.env.OPENROUTER_MODEL || "gpt-4o-mini",
    temperature: 0.4,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw);

    return {
        userReply: parsed.userReply || "Thanks for your feedback!",
        summary: parsed.summary || "Feedback received.",
        recommendedNext: parsed.recommendedNext || "Review this case."
    };
}

