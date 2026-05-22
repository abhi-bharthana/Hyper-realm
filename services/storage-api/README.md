## 📦 Hyper-Storage: The Hybrid Data & Media Node

**Hyper-Storage** ek intelligent data management layer hai jo high-speed caching aur long-term persistent storage ko merge karta hai. Ye service hardware-agnostic vision ko support karti hai, taaki data kisi ek cloud provider par depend na rahe.

### 🛠️ Technical Stack
*   **Core Backend**: Go (Golang) for high-speed I/O operations.
*   **Fast Cache**: Redis (For session data, live tracking, and hot metadata).
*   **Object Storage**: S3-compatible storage (Ceph/MinIO) for media, documents, and logs.
*   **Security**: AES-256 Encryption at rest & Hyper-ID JWT-based Access Control.

---

### 🏗️ Hybrid Architecture (The Dual-Layer Logic)
Ye service do alag-alag storage patterns ko ek single API ke peeche hide karti hai:

1.  **Hot Layer (Redis)**: 
    *   Yahan wo data rehta hai jo bar-bar access hota hai (e.g., Active Bus coordinates, User Session tokens).
    *   **Latency**: $< 1ms$.
2.  **Cold Layer (S3/Ceph)**: 
    *   Bhari files jaise user profile pictures, driving licenses (Transit service ke liye), aur system logs yahan save hote hain.
    *   **Reliability**: High durability with data replication.

---

### 🛡️ Integration with Hyper-ID
Storage service bina authentication ke kaam nahi karti. 
*   Har request ke saath **Hyper-ID JWT** hona zaroori hai.
*   System check karta hai ki kya User A ke paas File B ko "Read" ya "Write" karne ki permission hai.
*   **Private Data**: User ka sensitive data (like medical records for Hyper-Med) end-to-end encrypted save hota hai.

---

### ☸️ Kubernetes & Infrastructure Setup
K8s-configs folder mein iski orchestration aise manage hoti hai:

*   **Persistent Volume Claims (PVC)**: Redis aur Ceph ke liye dedicated storage disks assign ki gayi hain taaki pod restart hone par data delete na ho.
*   **Storage Secrets**: S3 ki Access Key aur Secret Key ko K8s Secrets mein rakha gaya hai taaki GitHub par leak na hon.
*   **Service Mesh**: Storage API ko internal cluster network ke through hi access kiya ja sakta hai (Security Layer).

---

### 📂 Unified Storage API Example
Developer ko tension lene ki zaroorat nahi ki data kahan ja raha hai, wo bas ye endpoint hit karta hai:

```bash
# Example: Uploading a Profile Picture
POST /api/v1/storage/upload
Header: Authorization: Bearer <Hyper-ID-Token>
Body: { "file": "avatar.jpg", "type": "profile_pic" }
```

---
