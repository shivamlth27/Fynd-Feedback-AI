"use client";

import { useState } from "react";

type ApiResponse =
  | {
      data: {
        userReply: string;
        summary: string;
        recommendedNext: string;
      };
    }
  | { error: string };

export default function UserDashboard() {
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [result, setResult] =
    useState<Extract<ApiResponse, { data: unknown }> | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmed = review.trim();
    if (!trimmed) {
      setError("Please add a short review so we can help.");
      setSuccess(false);
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setResult(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, reviewText: trimmed })
      });
      const json = (await res.json()) as ApiResponse;
      if (!res.ok || "error" in json) {
        setError(
          "error" in json ? json.error : "Something went wrong. Try again."
        );
        return;
      }
      setResult(json);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Network issue. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card">
        <div className="mb-4">
          <div className="eyebrow">User dashboard</div>
          <h1 className="mb-1 text-xl font-semibold">Share your feedback</h1>
          <p className="text-sm text-slate-600">
            Tell us how your experience felt. We&rsquo;ll generate a short,
            human-sounding reply just for you.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="rating">
              Rating
            </label>
            <select
              id="rating"
              className="select"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r} Star{r > 1 ? "s" : ""} {r === 1 ? "(Very unhappy)" : ""}
                  {r === 3 ? "(Neutral)" : ""}
                  {r === 5 ? "(Delighted)" : ""}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              1 = very unhappy, 5 = delighted.
            </p>
          </div>
          <div>
            <label className="label" htmlFor="review">
              Review
            </label>
            <textarea
              id="review"
              className="textarea"
              rows={5}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Tell us what happened..."
            />
            <p className="mt-1 text-xs text-slate-500">
              {review.length === 0
                ? "A short sentence is enough—just tell us what happened."
                : `${review.length} characters`}
            </p>
          </div>
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit feedback"}
          </button>
          {success && !error && result && "data" in result && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Submitted successfully
            </div>
          )}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <p className="mt-4 text-xs text-slate-500">
            We share a summary of your feedback with our internal team so they
            can spot trends and follow up when needed.
          </p>
        </form>
      </div>

      <div className="card relative">
        <h2 className="mb-2 text-lg font-semibold">AI Response</h2>
        {!result && (
          <p className="text-sm text-slate-500">
            After you hit submit, we&rsquo;ll generate a short, friendly reply here
            based on your rating and review.
          </p>
        )}
        {result && "data" in result && (
          <div className="space-y-4 text-sm text-slate-800">
            <div>
              <div className="label">Your reply</div>
              <p className="whitespace-pre-wrap rounded-md bg-slate-50 p-3">
                {result.data.userReply}
              </p>
            </div>
          </div>
        )}
        {loading && (
          <div className="ai-overlay">
            <div className="ai-spinner" />
            <span className="text-sm text-slate-600">Generating AI response...</span>
          </div>
        )}
      </div>
    </div>
  );
}

