import logging
from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware  <-- 1. Isko hata de

from app.api.v1.endpoints import canvas

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Hyper-Canvas API")

# ==========================================
# 🚀 2. YEH POORA BLOCK HATA DE YA COMMENT KAR DE
# ==========================================
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=False,
#     allow_methods=["*"],
#     allow_headers=["*", "x-google-token", "Authorization", "Content-Type"],
# )
# ==========================================

# Includes API Router
app.include_router(
    canvas.router,
    prefix="/api/v1/canvas",
    tags=["Canvas Management"]
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8083, reload=True)