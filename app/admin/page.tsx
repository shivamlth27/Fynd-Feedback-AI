"use client";

import { useEffect, useMemo, useState } from "react";

type Review = {
  id: string;
  rating: number;
  reviewText: string;
  userReply: string;
  summary: string;
  recommendedNext: string;
  status: string;
  createdAt: string;
};

type ApiShape =
  | { data: Review[] }
  | {
      error: string;
    };

const POLL_MS = 6000;
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMINS_BASIC_AUTH_TOKEN;

export default function AdminDashboard() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/reviews", {
        headers: {
          "Content-Type": "application/json",
          ...(ADMIN_TOKEN
            ? { Authorization: `Bearer ${ADMIN_TOKEN}` }
            : undefined)
        }
      });
      const json = (await res.json()) as ApiShape;
      if (!res.ok || "error" in json) {
        setError(
          "error" in json ? json.error : "Failed to load submissions"
        );
        return;
      }
      setReviews(json.data);
      setError(null);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      console.error(err);
      setError("Network error while loading submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handle = setInterval(fetchData, POLL_MS);
    return () => clearInterval(handle);
  }, []);

  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: 0, counts: {} as Record<number, number> };
    const counts: Record<number, number> = {};
    reviews.forEach((r) => {
      counts[r.rating] = (counts[r.rating] || 0) + 1;
    });
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return { avg: total / reviews.length, counts };
  }, [reviews]);

  const filteredReviews = useMemo(
    () =>
      ratingFilter === "all"
        ? reviews
        : reviews.filter((r) => r.rating === ratingFilter),
    [reviews, ratingFilter]
  );

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) return "Auto-refreshing every 6s";
    const d = new Date(lastUpdated);
    return `Last updated at ${d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit"
    })}`;
  }, [lastUpdated]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="eyebrow">Internal · Admin only</div>
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-slate-600">
            Live feed of user submissions with AI summaries and next actions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Filter by rating:</span>
            <select
              className="select w-auto text-xs"
              value={ratingFilter}
              onChange={(e) =>
                setRatingFilter(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
            >
              <option value="all">All</option>
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>{`${r}★`}</option>
              ))}
            </select>
          </div>
          <button className="button" onClick={fetchData} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh now"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <div className="text-sm text-slate-500">Total submissions</div>
          <div className="text-2xl font-semibold">{reviews.length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-500">Average rating</div>
          <div className="text-2xl font-semibold">
            {stats.avg ? stats.avg.toFixed(2) : "—"}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-500">Counts by rating</div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <span key={r} className="badge">
                {r}★ {stats.counts[r] || 0}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="text-xs text-slate-500">
        {lastUpdatedLabel}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full table-auto border-separate border-spacing-y-3 text-left text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="pr-4">Rating</th>
              <th className="pr-4">Review</th>
              <th className="pr-4">Summary</th>
              <th className="pr-4">Next action</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map((r) => (
              <tr key={r.id} className="align-top row-hover">
                <td className="pr-4">
                  <span className="badge">{r.rating}★</span>
                </td>
                <td className="pr-4 max-w-xs whitespace-pre-wrap text-slate-800">
                  {r.reviewText}
                </td>
                <td className="pr-4 max-w-xs whitespace-pre-wrap text-slate-800">
                  {r.summary}
                </td>
                <td className="pr-4 max-w-xs whitespace-pre-wrap text-slate-800">
                  {r.recommendedNext}
                </td>
                <td className="text-slate-500">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {filteredReviews.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-slate-500">
                  No submissions match this filter yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

