/**
 * Signal Fetchers
 * Background data fetchers for HN, GitHub, etc.
 * These are meant to be called by QStash scheduled jobs
 */

import type { Signal } from "./types";

// ==========================================
// HACKER NEWS FETCHER
// ==========================================

const HN_API_BASE = "https://hacker-news.firebaseio.com/v0";

interface HNStory {
  id: number;
  title: string;
  url?: string;
  score: number;
  by: string;
  descendants?: number; // comment count
}

export async function fetchHackerNewsSignals(
  limit: number = 10
): Promise<Signal[]> {
  try {
    // Get top story IDs
    const topStoriesRes = await fetch(`${HN_API_BASE}/topstories.json`);
    if (!topStoriesRes.ok) throw new Error("Failed to fetch HN top stories");

    const storyIds: number[] = await topStoriesRes.json();
    const topIds = storyIds.slice(0, limit);

    // Fetch story details in parallel
    const stories = await Promise.all(
      topIds.map(async (id): Promise<HNStory | null> => {
        try {
          const res = await fetch(`${HN_API_BASE}/item/${id}.json`);
          if (!res.ok) return null;
          return res.json();
        } catch {
          return null;
        }
      })
    );

    // Convert to signals
    return stories
      .filter((s): s is HNStory => s !== null && s.title)
      .map((story) => ({
        title: story.title,
        summary: `${story.score} points • ${
          story.descendants || 0
        } comments • by ${story.by}`,
        source: "hn" as const,
        score: story.score,
        url: story.url,
      }));
  } catch (error) {
    console.error("HN fetch error:", error);
    return [];
  }
}

// ==========================================
// GITHUB TRENDING FETCHER
// ==========================================

const GITHUB_API_BASE = "https://api.github.com";

interface GitHubRepo {
  full_name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  html_url: string;
}

export async function fetchGitHubTrendingSignals(
  limit: number = 10,
  language?: string
): Promise<Signal[]> {
  try {
    // Search for recently created repos with high stars
    const since = new Date();
    since.setDate(since.getDate() - 7); // Last 7 days
    const dateStr = since.toISOString().split("T")[0];

    let query = `created:>${dateStr} stars:>50`;
    if (language) {
      query += ` language:${language}`;
    }

    const url = `${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(
      query
    )}&sort=stars&order=desc&per_page=${limit}`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "content-agent-fetcher",
      },
    });

    if (!res.ok) {
      if (res.status === 403) {
        throw new Error("GitHub rate limit exceeded");
      }
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const data = await res.json();
    const repos: GitHubRepo[] = data.items || [];

    return repos.map((repo) => ({
      title: repo.full_name,
      summary: `${repo.description || "No description"} • ⭐ ${
        repo.stargazers_count
      }${repo.language ? ` • ${repo.language}` : ""}`,
      source: "github" as const,
      score: repo.stargazers_count,
      url: repo.html_url,
    }));
  } catch (error) {
    console.error("GitHub fetch error:", error);
    return [];
  }
}

// ==========================================
// COMBINED FETCHER
// ==========================================

export interface FetchAllOptions {
  hnLimit?: number;
  githubLimit?: number;
  githubLanguage?: string;
}

export async function fetchAllSignals(
  options: FetchAllOptions = {}
): Promise<Signal[]> {
  const { hnLimit = 10, githubLimit = 10, githubLanguage } = options;

  const [hnSignals, ghSignals] = await Promise.all([
    fetchHackerNewsSignals(hnLimit),
    fetchGitHubTrendingSignals(githubLimit, githubLanguage),
  ]);

  return [...hnSignals, ...ghSignals];
}
