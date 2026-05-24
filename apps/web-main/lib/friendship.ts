// apps/web-main/lib/friendship.ts
import { API_BASE_URL } from "./constants"; // Apna backend URL

export const sendFriendRequest = async (receiverId: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/friends/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ receiver_id: receiverId }),
  });

  if (!response.ok) throw new Error("Failed to send request");
  return await response.json();
};