import json
import logging
import os
import time
import subprocess
from confluent_kafka import Consumer, Producer
from minio import Minio

logging.basicConfig(level=logging.INFO, format='%(asctime)s | 🧠 [AI-3D-WORKER] %(levelname)s: %(message)s')

# Credentials (Environment variables se lenge, jaise media-worker me tha)
MINIO_ENDPOINT = os.environ.get("MINIO_ENDPOINT", "localhost:9000")
MINIO_ACCESS = os.environ.get("MINIO_ACCESS", "7KF1I2CYE25G2R7HWCVL")
MINIO_SECRET = os.environ.get("MINIO_SECRET", "2BYAzXng14JMBfjB3ZCj6SoHlSJqqzDL8Ke5LnBE")
BUCKET_NAME = "hyper-3d-assets"

minio_client = Minio(MINIO_ENDPOINT, access_key=MINIO_ACCESS, secret_key=MINIO_SECRET, secure=False)

# Kafka Setup
KAFKA_BROKER = os.environ.get("KAFKA_BROKER", 'localhost:9092')
consumer = Consumer({
    'bootstrap.servers': KAFKA_BROKER,
    'group.id': 'sf3d-generator-group',
    'auto.offset.reset': 'earliest',
    'enable.auto.commit': False
})
producer = Producer({'bootstrap.servers': KAFKA_BROKER})
consumer.subscribe(['3d.generation.requested'])

def generate_3d_from_image(image_path, output_glb_path):
    """
    STABLE FAST 3D (SF3D) INFERENCE WRAPPER
    Is function ke andar hum SF3D ka script call karte hain.
    """
    logging.info(f"🚀 Booting Stable Fast 3D on GPU for: {image_path}")
    
    # ACTUAL IMPLEMENTATION (When you download SF3D repo):
    # command = [
    #     'python', 'run_sf3d.py', 
    #     '--image', image_path, 
    #     '--output', output_glb_path
    # ]
    # subprocess.run(command, check=True)
    
    # 🛑 MOCK SIMULATION FOR NOW (Taki pipeline test ho sake)
    time.sleep(3) # Simulating GPU processing time (SF3D takes ~1-3 seconds)
    
    # Fake GLB generate kar rahe hain pipeline test karne ke liye
    with open(output_glb_path, 'wb') as f:
        f.write(b"mock_glb_binary_data") 
        
    logging.info("✅ SF3D Generation Complete.")
    return True

def process_ai_task(task):
    asset_id = task.get("asset_id")
    image_url = task.get("image_url") # e.g., http://hyper-minio:9000/hyper-3d-assets/raw/123.jpg
    
    if not asset_id or not image_url:
        return False
        
    object_name = image_url.split(f"/{BUCKET_NAME}/")[-1]
    local_image_path = f"/tmp/{asset_id}.jpg"
    local_glb_path = f"/tmp/{asset_id}_preview.glb"
    output_minio_key = f"generated/{asset_id}/preview.glb"

    try:
        # 1. Download source image from MinIO
        logging.info(f"Downloading source image: {object_name}")
        minio_client.fget_object(BUCKET_NAME, object_name, local_image_path)

        # 2. Run AI Generation (SF3D)
        success = generate_3d_from_image(local_image_path, local_glb_path)
        
        if success and os.path.exists(local_glb_path):
            # 3. Upload generated GLB back to MinIO
            logging.info(f"Uploading generated 3D Model to: {output_minio_key}")
            minio_client.fput_object(
                BUCKET_NAME, 
                output_minio_key, 
                local_glb_path, 
                content_type="model/gltf-binary"
            )

            # 4. Fire "Success" Event to Kafka (Hub/UI will listen to this)
            success_payload = {
                "asset_id": asset_id,
                "status": "ready",
                "preview_glb_url": f"http://{MINIO_ENDPOINT}/{BUCKET_NAME}/{output_minio_key}"
            }
            producer.produce('3d.generation.preview_ready', value=json.dumps(success_payload).encode('utf-8'))
            producer.flush()
            
            logging.info(f"🎉 Pipeline successfully completed for Asset: {asset_id}")
            return True
            
    except Exception as e:
        logging.error(f"❌ Worker crashed during task {asset_id}: {e}")
        return False
        
    finally:
        # 🧹 Cleanup local files so disk doesn't get full
        if os.path.exists(local_image_path): os.remove(local_image_path)
        if os.path.exists(local_glb_path): os.remove(local_glb_path)

def start_worker():
    logging.info("🎧 AI 3D Generation Worker entering Listening Mode...")
    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None: continue
            if msg.error(): continue 
            
            task = json.loads(msg.value().decode('utf-8'))
            logging.info(f"📥 Received generation task: {task.get('asset_id')}")
            
            # Process the task
            if process_ai_task(task):
                consumer.commit(msg) # Mark task as done
            else:
                # Agar fail hua toh hum retry logix likh sakte hain
                consumer.commit(msg) 
                
    except KeyboardInterrupt:
        pass
    finally:
        consumer.close()

if __name__ == '__main__':
    start_worker()