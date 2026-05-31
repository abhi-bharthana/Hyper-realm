from pydantic import BaseModel

class CanvasCreate(BaseModel):
    title: str = "New Neural Node"
    aspect_ratio: str = "infinite"