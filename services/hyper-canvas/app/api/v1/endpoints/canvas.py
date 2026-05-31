import json
import logging
from fastapi import APIRouter, HTTPException, Depends, Request
from psycopg2.extras import RealDictCursor

# 🚀 FIX: In teeno mein 'app.' prefix lagaya hai
from app.core.database import get_db_connection
from app.core.security import get_current_user_hid
from app.models.schemas import CanvasCreate

logger = logging.getLogger(__name__)

router = APIRouter()

# ==========================================
# 📊 CANVAS STORAGE STATS API
# ==========================================
@router.get("/storage")
async def get_canvas_storage_stats(user_hid: str = Depends(get_current_user_hid)):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        query = """
            SELECT 
                COALESCE(SUM(pg_column_size(content) + pg_column_size(title) + pg_column_size(tags)), 0) as total_bytes,
                COUNT(id) as total_notes
            FROM hyper_documents 
            WHERE user_hid = %s AND is_archived = FALSE;
        """
        cursor.execute(query, (user_hid,))
        stats = cursor.fetchone()
        
        return {
            "category": "notes",
            "total_bytes": stats["total_bytes"],
            "total_notes": stats["total_notes"]
        }
    except Exception as e:
        logger.error(f"Failed to fetch storage stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate storage")
    finally:
        cursor.close()
        conn.close()

# ==========================================
# 🗂️ GET ALL CANVASES
# ==========================================
@router.get("")
async def get_all_canvases(user_hid: str = Depends(get_current_user_hid)):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("""
            SELECT id, title, aspect_ratio, updated_at 
            FROM hyper_documents 
            WHERE user_hid = %s AND is_archived = FALSE 
            ORDER BY updated_at DESC
        """, (user_hid,))
        canvases = cursor.fetchall()
        return {"canvases": canvases}
    except Exception as e:
        logger.error(f"Failed to fetch canvases: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch canvases")
    finally:
        cursor.close()
        conn.close()

# ==========================================
# ➕ CREATE NEW CANVAS
# ==========================================
@router.post("")
async def create_canvas(canvas: CanvasCreate, user_hid: str = Depends(get_current_user_hid)):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("""
            INSERT INTO hyper_documents (user_hid, title, aspect_ratio, content) 
            VALUES (%s, %s, %s, %s) RETURNING id, title, aspect_ratio
        """, (user_hid, canvas.title, canvas.aspect_ratio, "[]"))
        new_canvas = cursor.fetchone()
        conn.commit()
        return new_canvas
    except Exception as e:
        logger.error(f"Failed to create canvas: {e}")
        raise HTTPException(status_code=500, detail="Failed to create canvas")
    finally:
        cursor.close()
        conn.close()

# ==========================================
# 📄 GET SPECIFIC CANVAS BY ID
# ==========================================
@router.get("/{canvas_id}")
async def get_canvas_by_id(canvas_id: str, user_hid: str = Depends(get_current_user_hid)):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("SELECT * FROM hyper_documents WHERE id = %s AND user_hid = %s AND is_archived = FALSE", (canvas_id, user_hid))
        canvas = cursor.fetchone()
        
        if not canvas:
            raise HTTPException(status_code=404, detail="Canvas node not found")
            
        content = canvas["content"]
        if isinstance(content, dict) or isinstance(content, list):
            content = json.dumps(content)
            
        return {
            "id": str(canvas["id"]),
            "title": canvas["title"],
            "aspect_ratio": canvas["aspect_ratio"],
            "content": content,
            "updated_at": canvas["updated_at"].isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch canvas node: {e}")
        raise HTTPException(status_code=500, detail="Matrix synchronization failed")
    finally:
        cursor.close()
        conn.close()

# ==========================================
# 💾 UPDATE CANVAS
# ==========================================
@router.patch("/{canvas_id}")
async def update_canvas(canvas_id: str, request: Request, user_hid: str = Depends(get_current_user_hid)):
    data = await request.json()
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        update_fields = []
        values = []
        
        if "title" in data:
            update_fields.append("title = %s")
            values.append(data["title"])
        if "aspect_ratio" in data:
            update_fields.append("aspect_ratio = %s")
            values.append(data["aspect_ratio"])
        if "content" in data:
            update_fields.append("content = %s")
            values.append(data["content"])

        if not update_fields:
            return {"status": "no data to update"}

        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        
        query = f"UPDATE hyper_documents SET {', '.join(update_fields)} WHERE id = %s AND user_hid = %s"
        values.extend([canvas_id, user_hid])
        
        cursor.execute(query, tuple(values))
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Failed to patch canvas: {e}")
        raise HTTPException(status_code=500, detail="Database save failed")
    finally:
        cursor.close()
        conn.close()

# ==========================================
# 🗑️ DELETE CANVAS NODE
# ==========================================
@router.delete("/{canvas_id}")
async def delete_canvas(canvas_id: str, user_hid: str = Depends(get_current_user_hid)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE hyper_documents SET is_archived = TRUE WHERE id = %s AND user_hid = %s", (canvas_id, user_hid))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Canvas not found")
        conn.commit()
        return {"status": "success", "message": "Node Purged"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete canvas: {e}")
        raise HTTPException(status_code=500, detail="Matrix purge failed")
    finally:
        cursor.close()
        conn.close()