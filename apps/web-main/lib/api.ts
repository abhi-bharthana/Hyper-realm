// web-main/lib/api.ts

// 🧠 Smart URL Resolver: BFF (Backend For Frontend) Pattern
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // 🌐 BROWSER SIDE: Relative path
    return "/api/v1";
  }
  // 🖥️ SERVER SIDE (SSR): Targetting new Safe Port 8088
  return "http://127.0.0.1:8088/api/v1";
};

export const API_URLS = {
  HUB: getBaseUrl(),     
  ID: getBaseUrl(),      
  STORAGE: getBaseUrl()  
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

// =========================================================================
// 🏷️ NATIVE OBJECT TAGGING ENGINE METHODS (Direct MinIO Mapping Metadata)
// =========================================================================

// 🎯 Save/Update Tags onto an asset node object
export const saveAssetTags = async (objectKey: string, tags: string[]): Promise<any> => {
  try {
    const response = await fetchClient(`${API_URLS.STORAGE}/storage/asset/tags`, {
      method: "POST",
      body: JSON.stringify({
        object_key: objectKey,
        tags: tags
      })
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  } catch (error) {
    console.error("Tag Save Transaction Failure:", error);
    throw error;
  }
};

// 🎯 Fetch Tags array directly from MinIO object metadata blocks
export const getAssetTags = async (objectKey: string): Promise<string[]> => {
  try {
    const response = await fetchClient(`${API_URLS.STORAGE}/storage/asset/tags?object_key=${encodeURIComponent(objectKey)}`, {
      method: "GET"
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.tags || [];
  } catch (error) {
    console.error("Tag Fetch Transaction Failure:", error);
    return [];
  }
};

// =========================================================================
// 📊 ECOSYSTEM AUDIT LOGS TELEMETRY METHODS (Timeline Activity Engine)
// =========================================================================

// 🎯 Fetch dynamic audit mutation traces (Global stack or targeted object key filter)
export const fetchAuditFootprints = async (userId: string, objectKey?: string): Promise<any[]> => {
  try {
    let url = `${API_URLS.STORAGE}/audit/footprints?user_id=${encodeURIComponent(userId)}`;
    if (objectKey) {
      url += `&object_key=${encodeURIComponent(objectKey)}`;
    }

    const response = await fetchClient(url, { method: "GET" });
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.footprints || [];
  } catch (error) {
    console.error("Failed to compile streaming audit logs engine:", error);
    return [];
  }
};