import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReviewInsights } from "@/lib/llm";
import { rateLimit } from "@/lib/rateLimit";

function isAuthorized(req: NextRequest) {
    const adminSecret = process.env.ADMINS_BASIC_AUTH_TOKEN;
    if (!adminSecret) return true; // open by default
    const header = req.headers.get("authorization");
    if (!header) return false;
    const token = header.replace("Bearer ", "");
    return token === adminSecret;
}

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.ip ||
    "unknown";
  const rl = rateLimit(ip, "GET:/api/reviews");
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Please retry shortly.",
        retryAfterSec: rl.retryAfterSec
      },
      {
        status: 429,
        headers: rl.retryAfterSec
          ? { "Retry-After": rl.retryAfterSec.toString() }
          : undefined
      }
    );
  }

  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await prisma.review.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/reviews error", error);
    return NextResponse.json(
      { error: "Failed to load reviews" },
      { status: 500 }
    );
  }
}

type PostBody = {
    rating?: number;
    reviewText?: string;
};

export async function POST(req: NextRequest) {
    try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.ip ||
      "unknown";
    const rl = rateLimit(ip, "POST:/api/reviews");
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please retry shortly.",
          retryAfterSec: rl.retryAfterSec
        },
        {
          status: 429,
          headers: rl.retryAfterSec
            ? { "Retry-After": rl.retryAfterSec.toString() }
            : undefined
        }
      );
    }

        const body = (await req.json()) as PostBody;
        const rating = Number(body.rating);
        const reviewText = (body.reviewText || "").trim();

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: "rating must be an integer between 1 and 5" },
                { status: 400 }
            );
        }

        if (reviewText.length === 0) {
            return NextResponse.json(
                { error: "reviewText cannot be empty" },
                { status: 400 }
            );
        }

        const llm = await generateReviewInsights({
            rating,
            review: reviewText
        });

        const saved = await prisma.review.create({
            data: {
                rating,
                reviewText,
                userReply: llm.userReply,
                summary: llm.summary,
                recommendedNext: llm.recommendedNext,
                status: "completed"
            }
        });

        return NextResponse.json(
            { data: { ...saved, ...llm } },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/reviews error", error);
        return NextResponse.json(
            { error: "Failed to process review" },
            { status: 500 }
        );
    }
}

