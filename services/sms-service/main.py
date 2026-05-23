from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
from contextlib import asynccontextmanager
from jose import jwt, JWTError
import json
import asyncio
import os

# --- Configuration ---
KAFKA_SERVER = os.getenv("KAFKA_SERVER", "kafka:9092")
KAFKA_TOPIC = "chat-messages"
USER_EVENTS_TOPIC = "user-events" # 👈 Naya topic add kiya
PUBLIC_KEY_PATH = "/app/certs/public_key.pem"
ALGORITHM = "RS256"

# RSA Public Key load karo (Jo Hyper-ID volume se share ho rahi hai)
try:
    with open(PUBLIC_KEY_PATH, "r") as f:
        RSA_PUBLIC_KEY = f.read()
except FileNotFoundError:
    print(f"❌ Error: Public key not found at {PUBLIC_KEY_PATH}")
    RSA_PUBLIC_KEY = None

# --- Auth Logic ---
def verify_hyper_token(token: str):
    """Go (Hyper-ID) ke token ko RS256 se verify karta hai."""
    try:
        payload = jwt.decode(
            token, 
            RSA_PUBLIC_KEY, 
            algorithms=[ALGORITHM], 
            issuer="hyper-id"
        )
        return payload  
    except JWTError as e:
        print(f"⚠️ JWT Verification Failed: {e}")
        return None

# --- Connection Management ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)

manager = ConnectionManager()

# --- Kafka Consumer 1: Chat Messages ---
async def consume_messages():
    consumer = AIOKafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=KAFKA_SERVER,
        group_id="chat-group",
        enable_auto_commit=False,  
        auto_offset_reset="earliest"
    )
    await consumer.start()
    try:
        async for msg in consumer:
            try:
                data = json.loads(msg.value.decode("utf-8"))
                receiver = data.get("receiver")
                
                formatted_msg = json.dumps({
                    "from": data.get('sender'), 
                    "msg": data.get('content'),
                    "timestamp": data.get('timestamp') 
                })

                if receiver in manager.active_connections:
                    await manager.send_personal_message(formatted_msg, receiver)
                    await consumer.commit()
                else:
                    print(f"⚠️ User {receiver} not on this node. Parking message...")
                    # Offline logic
                    await consumer.commit()

            except Exception as e:
                print(f"❌ Processing Error: {e}")
    finally:
        await consumer.stop()

# --- Kafka Consumer 2: User System Events (NAYA ADD KIYA) ---
async def consume_user_events():
    consumer = AIOKafkaConsumer(
        USER_EVENTS_TOPIC,
        bootstrap_servers=KAFKA_SERVER,
        group_id="sms-system-group", # Alag group ID taaki conflict na ho
        auto_offset_reset="earliest"
    )
    await consumer.start()
    try:
        async for msg in consumer:
            try:
                # Key se pata chalega event konsa hai
                event_type = msg.key.decode("utf-8") if msg.key else "UNKNOWN"
                event_data = json.loads(msg.value.decode("utf-8"))
                
                if event_type == "PROFILE_CREATED":
                    hid = event_data.get("hid")
                    nickname = event_data.get("nickname")
                    # Yahan SMS bhejne ka code trigger hoga!
                    print(f"🎉 [SMS SERVICE] NEW USER ALERT: Sending Welcome SMS to Commander {nickname} (HID: {hid})!")
                
                elif event_type == "PROFILE_UPDATED":
                    hid = event_data.get("hid")
                    print(f"🔄 [SMS SERVICE] Profile updated for HID: {hid}. Notifying via SMS...")
                    
            except Exception as e:
                print(f"❌ Event Processing Error: {e}")
    finally:
        await consumer.stop()

# --- App Lifespan ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Kafka Producer start
    app.state.producer = AIOKafkaProducer(bootstrap_servers=KAFKA_SERVER)
    await app.state.producer.start()
    
    # Dono consumers ko background me start karo
    chat_task = asyncio.create_task(consume_messages())
    events_task = asyncio.create_task(consume_user_events()) # 👈 Naya task start
    
    yield
    
    # Cleanup
    await app.state.producer.stop()
    chat_task.cancel()
    events_task.cancel()

app = FastAPI(lifespan=lifespan)

# --- Secure WebSocket Endpoint ---
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    user_id: str, 
    token: str = Query(None)
):
    if not token:
        print(f"🚫 Connection rejected: No token for user {user_id}")
        await websocket.close(code=1008) 
        return

    claims = verify_hyper_token(token)
    
    if not claims or claims.get("hid") != user_id:
        print(f"🚫 Connection rejected: Invalid token for user {user_id}")
        await websocket.close(code=1008)
        return

    await manager.connect(user_id, websocket)
    print(f"✅ User {user_id} ({claims.get('username')}) connected successfully.")

    try:
        while True:
            data = await websocket.receive_text()
            msg_json = json.loads(data)
            
            message_to_kafka = {
                "sender": user_id,
                "receiver": msg_json.get("receiver"),
                "content": msg_json.get("content")
            }
            await app.state.producer.send_and_wait(
                KAFKA_TOPIC, 
                json.dumps(message_to_kafka).encode("utf-8")
            )
    except WebSocketDisconnect:
        manager.disconnect(user_id)
        print(f"ℹ️ User {user_id} disconnected.")
    except Exception as e:
        manager.disconnect(user_id)
        print(f"⚠️ Error with user {user_id}: {e}")