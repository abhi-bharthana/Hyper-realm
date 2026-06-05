// web-main/lib/api.ts

// 🧠 Smart URL Resolver: Direct API Connection (Bypassing Next.js Proxy)
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // 🌐 BROWSER SIDE: Hit NGINX API Gateway directly via dynamic hostname
    const host = window.location.hostname;
    return `http://${host}:8088/api/v1`;
  }
  // 🖥️ SERVER SIDE (SSR): Targetting new Safe Port 8088
  return "http://127.0.0.1:8088/api/v1";
};

export const API_URLS = {
  HUB: getBaseUrl(),     
  
  // 🚀 NGINX BYPASS: Direct Go Backend (8080) par hit marega Auth ke liye
  ID: typeof window !== "undefined" 
    ? `http://${window.location.hostname}:8080/api/v1` 
    : "http://127.0.0.1:8080/api/v1",      
    
  STORAGE: getBaseUrl(), 
  
  // 🚀 DEV FIX: Bypass Nginx (8088), direct Hit Go Backend (4000) for OS & Wellbeing
  OS: typeof window !== "undefined" 
    ? `http://${window.location.hostname}:4000/api/v1` 
    : "http://127.0.0.1:4000/api/v1"
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

  // 🛡️ Global 401 Unauthorized Handler
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;

      // 🛡️ EMERGENCY BRAKE: Agar user onboarding par hai, toh session kill MAT karo
      if (currentPath === "/onboarding") {
        console.warn("⚠️ Background sync returned 401 during onboarding. Ignoring logout guard to prevent loops.");
      } else if (currentPath !== "/login" && currentPath !== "/register") {
        console.warn("⚠️ Session expired or invalid token. Redirecting to login...");
        localStorage.removeItem("hyper_id_token"); // Token sirf sahi mein expire hone par udayenge
        window.location.href = "/login";
      }
    }
    throw new Error("Session expired");
  }

  return response;
}

// 🚀 NAYA: Smart Response Parser (Keeps code DRY and handles empty/JSON errors cleanly)
async function processResponse(res: Response) {
  if (!res.ok) {
    const errorText = await res.text();
    try {
      // JSON try karenge taaki humara "not_found" logic stores mein safely chalta rahe
      const errorJson = JSON.parse(errorText);
      throw new Error(JSON.stringify(errorJson)); 
    } catch {
      throw new Error(errorText || `HTTP Error ${res.status}`);
    }
  }
  
  // Safe parsing for empty responses (like 204 No Content)
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

export const api = {
  get: async (url: string, options?: RequestInit) => {
    const res = await fetchClient(url, { ...options, method: "GET" });
    return processResponse(res);
  },
  
  post: async (url: string, body?: any, options?: RequestInit) => {
    const res = await fetchClient(url, { 
      ...options, 
      method: "POST", 
      body: body ? JSON.stringify(body) : undefined 
    });
    return processResponse(res);
  },

  put: async (url: string, body?: any, options?: RequestInit) => {
    const res = await fetchClient(url, { 
      ...options, 
      method: "PUT", 
      body: body ? JSON.stringify(body) : undefined 
    });
    return processResponse(res);
  },

  delete: async (url: string, options?: RequestInit) => {
    const res = await fetchClient(url, { ...options, method: "DELETE" });
    return processResponse(res);
  },

  raw: fetchClient
};

// =========================================================================
// 🏷️ NATIVE OBJECT TAGGING ENGINE METHODS (Direct MinIO Mapping Metadata)
// =========================================================================

export const saveAssetTags = async (objectKey: string, tags: string[]): Promise<any> => {
  try {
    // 🚀 Now utilizing the built-in api.post (Cleaner, No duplicate error handling)
    return await api.post(`${API_URLS.STORAGE}/storage/asset/tags`, {
      object_key: objectKey,
      tags: tags
    });
  } catch (error) {
    console.error("Tag Save Transaction Failure:", error);
    throw error;
  }
};

export const getAssetTags = async (objectKey: string): Promise<string[]> => {
  try {
    const data = await api.get(`${API_URLS.STORAGE}/storage/asset/tags?object_key=${encodeURIComponent(objectKey)}`);
    return data.tags || [];
  } catch (error) {
    console.error("Tag Fetch Transaction Failure:", error);
    return [];
  }
};

// =========================================================================
// 📊 ECOSYSTEM AUDIT LOGS TELEMETRY METHODS (Timeline Activity Engine)
// =========================================================================

export const fetchAuditFootprints = async (userId: string, objectKey?: string): Promise<any[]> => {
  try {
    let url = `${API_URLS.STORAGE}/storage/audit/footprints?user_id=${encodeURIComponent(userId)}`;
    if (objectKey) {
      url += `&object_key=${encodeURIComponent(objectKey)}`;
    }

    const data = await api.get(url);
    return data.footprints || [];
  } catch (error) {
    console.error("Failed to compile streaming audit logs engine:", error);
    return [];
  }
};