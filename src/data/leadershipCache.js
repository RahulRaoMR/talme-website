const LEADERSHIP_API_URL = "/api/leadership";
const LEADERSHIP_CACHE_KEY = "talme-leadership-cache-v1";

let leadershipRequest = null;

export function readCachedLeaders() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LEADERSHIP_CACHE_KEY) || "null");
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function cacheLeaders(leaders) {
  try {
    window.localStorage.setItem(LEADERSHIP_CACHE_KEY, JSON.stringify(leaders));
  } catch {
    // The page still works if browser storage is unavailable or full.
  }
}

export function fetchLeadershipData() {
  if (!leadershipRequest) {
    leadershipRequest = (async () => {
      const response = await fetch(LEADERSHIP_API_URL);
      const rawResponse = await response.text();
      let result;

      try {
        result = rawResponse ? JSON.parse(rawResponse) : null;
      } catch {
        result = null;
      }

      if (!response.ok || !Array.isArray(result)) {
        throw new Error(result?.error || "Unable to load shared leadership.");
      }

      cacheLeaders(result);
      return result;
    })().finally(() => {
      leadershipRequest = null;
    });
  }

  return leadershipRequest;
}

export function prefetchLeadershipData() {
  fetchLeadershipData().catch(() => {});
}
