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
        # Issuer 'hyper-id' check karega aur RSA Public Key se signature verify karega
        payload = jwt.decode(
            token, 
            RSA_PUBLIC_KEY, 
            algorithms=[ALGORITHM], 
            issuer="hyper-id"
        )
        return payload  # Ismein 'hid', 'username', aur 'status' milega
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

# --- Kafka Consumer ---
async def consume_messages():
    consumer = AIOKafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=KAFKA_SERVER,
        group_id="sms-group",
        enable_auto_commit=False,  # 👈 1. Auto-commit OFF kar diya
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

                # 2. Check agar user IS current pod pe active hai
                if receiver in manager.active_connections:
                    await manager.send_personal_message(formatted_msg, receiver)
                    
                    # 3. Message successfully deliver hone ke BAAD hi commit karo
                    await consumer.commit()
                    # print(f"✅ Delivered & Committed for {receiver}")
                
                else:
                    # 4. User offline hai, YA kisi dusre K8s Pod pe connected hai
                    print(f"⚠️ User {receiver} not on this node. Parking message...")
                    
                    # TERA NEXT LOGIC YAHAN AAYEGA:
                    # Chuki tera Redis already setup hai, yahan message ko drop karne ke 
                    # bajaye Redis List (Offline Queue) mein push kar de.
                    # Example: await redis_client.rpush(f"pending_msgs:{receiver}", formatted_msg)
                    
                    # Queue mein safe hone ke baad hi Kafka ko commit signal de taaki partition block na ho
                    await consumer.commit()

            except Exception as e:
                print(f"❌ Processing Error: {e}")
                # 5. ERROR AAYA TOH COMMIT MAT KARO!
                # Isse Kafka next poll mein ye message dubara retry karega
                
    finally:
        await consumer.stop()

# --- App Lifespan ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Kafka Producer start
    app.state.producer = AIOKafkaProducer(bootstrap_servers=KAFKA_SERVER)
    await app.state.producer.start()
    # Consumer task in background
    consumer_task = asyncio.create_task(consume_messages())
    yield
    # Cleanup
    await app.state.producer.stop()
    consumer_task.cancel()

app = FastAPI(lifespan=lifespan)

# --- Secure WebSocket Endpoint ---
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    user_id: str, 
    token: str = Query(None) # Token URL query se aayega: ?token=...
):
    # 1. Check karo token hai ya nahi
    if not token:
        print(f"🚫 Connection rejected: No token for user {user_id}")
        await websocket.close(code=1008) # Policy Violation
        return

    # 2. RSA Verification
    claims = verify_hyper_token(token)
    
    # 3. Validation: Token sahi hona chahiye aur 'hid' URL ke 'user_id' se match karna chahiye
    if not claims or claims.get("hid") != user_id:
        print(f"🚫 Connection rejected: Invalid token for user {user_id}")
        await websocket.close(code=1008)
        return

    # 4. Auth successful, connect user
    await manager.connect(user_id, websocket)
    print(f"✅ User {user_id} ({claims.get('username')}) connected successfully.")

    try:
        while True:
            data = await websocket.receive_text()
            msg_json = json.loads(data)
            
            # Kafka ko data produce karna
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