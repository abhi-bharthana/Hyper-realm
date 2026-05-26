import json
import os
import time
from kafka import KafkaConsumer
from storage import download_image, upload_image
from processor import process_vision_task

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "hyper-kafka:9092")
TOPIC = "job.vision.process"

def start_worker():
    print("👁️ Hyper-Vision Worker Initializing...")
    
    consumer = KafkaConsumer(
        TOPIC,
        bootstrap_servers=[KAFKA_BROKER],
        group_id="vision-worker-group-1",
        value_deserializer=lambda m: json.loads(m.decode('utf-8'))
    )
    
    print(f"🎧 Listening on topic: {TOPIC}...")

    # Temp folder output ke liye
    os.makedirs("/tmp/vision", exist_ok=True)

    for message in consumer:
        job = message.value
        job_id = job.get("job_id")
        file_key = job.get("file_key")  # MinIO mein file ka naam
        
        print(f"\n🚀 New Task Triggered | Job ID: {job_id} | File: {file_key}")
        
        local_input = f"/tmp/vision/in_{file_key}"
        local_output = f"/tmp/vision/out_{file_key}"
        
        try:
            # 1. Fetch file
            download_image(file_key, local_input)
            
            # 2. Process file
            process_vision_task(local_input, local_output)
            
            # 3. Upload result back
            output_key = f"processed/{file_key}"
            upload_image(local_output, output_key)
            
            print(f"🎯 Job {job_id} Completed Successfully!")
            # Yahan par optionally Redis update ya naya Kafka event bhej sakte ho (Status: Done)

        except Exception as e:
            print(f"❌ Job {job_id} Failed: {str(e)}")
            
        finally:
            # Cleanup temp files taaki memory bhare nahi
            if os.path.exists(local_input): os.remove(local_input)
            if os.path.exists(local_output): os.remove(local_output)

if __name__ == "__main__":
    time.sleep(15) # Wait for Kafka & MinIO to boot up first
    start_worker()