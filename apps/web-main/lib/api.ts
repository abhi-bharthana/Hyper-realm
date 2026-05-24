// web-main/lib/api.ts

export const API_URLS = {
  HUB: "http://localhost:8081/api/v1", // Go Backend Core API mapping
  ID: "http://localhost:8081/api/v1"  // Hyper-ID scope endpoint mapping
};
async function fetchClient(url: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("hyper_id_token") : null;
  const headers = new Headers(options.headers);
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });

  // Global 401 Unauthorized Handler
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;

      // 🛡️ EMERGENCY BRAKE: Agar user onboarding par hai, toh session kill MAT karo
      if (currentPath === "/onboarding") {
        console.warn("⚠️ Background sync returned 401 during onboarding. Ignoring logout guard to prevent loops.");
      } else if (currentPath !== "/login" && currentPath !== "/register") {
        console.warn("Session expired or invalid token. Redirecting to login...");
        localStorage.removeItem("hyper_id_token"); // Token sirf sahi mein expire hone par udayenge
        window.location.href = "/login";
      }
    }
    throw new Error("Session expired");
  }

  return response;
}

export const api = {
  get: async (url: string, options?: RequestInit) => {
    const res = await fetchClient(url, { ...options, method: "GET" });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  
  post: async (url: string, body?: any, options?: RequestInit) => {
    const res = await fetchClient(url, { 
      ...options, 
      method: "POST", 
      body: body ? JSON.stringify(body) : undefined 
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  raw: fetchClient
};