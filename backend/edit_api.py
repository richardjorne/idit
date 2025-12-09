# backend/edit_api.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .edit_router import router as edit_router
from .images_router import router as images_router  # 刚刚新建的

app = FastAPI()

# CORS 与原来 api/index.py 保持一致
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # 可以根据需要改成具体前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 保持原来的路径结构：/api/edit-sessions、/api/images 等
app.include_router(edit_router, prefix="/api")
app.include_router(images_router, prefix="/api")

@app.get("/")
async def root():
    return {"status": "ok", "message": "Edit backend is running"}
