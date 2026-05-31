import json
import logging
import os
import subprocess
from confluent_kafka import Consumer, KafkaError
from minio import Minio

# Import our custom AI Engine
from ai_transcriber import process_auto_captions

logging.basicConfig(level=logging.INFO, format='🎬 [MEDIA-WORKER] %(message)s')

minio_client = Minio(
    "localhost:9000", # Change to your MinIO container IP if running inside Docker
    access_key="hyper_admin",
    secret_key="hyper_secret_123",
    secure=False
)
BUCKET_NAME = "hyper-users-data"

conf = {
    'bootstrap.servers': 'localhost:29092', # 🚀 FIXED: Now using the EXTERNAL Kafka port
    'group.id': 'media-transcoder-group',
    'auto.offset.reset': 'earliest'
}
consumer = Consumer(conf)
consumer.subscribe(['media.transcode.tasks'])

def process_video(object_key):
    logging.info(f"Downloading raw asset: {object_key}")
    
    # 📁 Temp paths setup
    file_name = object_key.split('/')[-1]
    raw_path = f"/tmp/raw_{file_name}"
    hls_dir = f"/tmp/hls_{file_name.split('.')[0]}"
    os.makedirs(hls_dir, exist_ok=True)
    
    # 1️⃣ Download raw video from Storage Cluster
    minio_client.fget_object(BUCKET_NAME, object_key, raw_path)
    
    # 2️⃣ 🧠 AI AUTO-CAPTIONING (Whisper)
    vtt_file_path = process_auto_captions(raw_path, hls_dir)
    
    # 3️⃣ 🎬 FFMPEG HLS TRANSCODING
    logging.info(f"Spinning up HLS FFmpeg Engine for {object_key}...")
    m3u8_path = os.path.join(hls_dir, "master.m3u8")
    
    command = [
        'ffmpeg', '-i', raw_path,
        '-map', '0:v?', '-map', '0:a?', 
        '-c:v', 'copy',      # Video fast copy
        '-c:a', 'aac',       # Audio web compatible
        '-f', 'hls',
        '-hls_time', '10',
        '-hls_playlist_type', 'vod',
        '-hls_segment_filename', os.path.join(hls_dir, 'segment_%03d.ts'),
        m3u8_path
    ]
    subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    # 4️⃣ UPLOAD EVERYTHING BACK TO MINIO (HLS chunks + Captions)
    logging.info("Uploading HLS Shards & Captions to Storage Cluster...")
    hls_prefix = f"{object_key.split('.')[0]}_hls"
    
    for filename in os.listdir(hls_dir):
        file_path = os.path.join(hls_dir, filename)
        minio_key = f"{hls_prefix}/{filename}"
        
        # Determine Content Type
        if filename.endswith('.m3u8'): content_type = "application/x-mpegURL"
        elif filename.endswith('.ts'): content_type = "video/MP2T"
        elif filename.endswith('.vtt'): content_type = "text/vtt"
        else: content_type = "application/octet-stream"
        
        minio_client.fput_object(BUCKET_NAME, minio_key, file_path, content_type=content_type)
        
    logging.info(f"✅ Processing Complete. HLS & Subs ready at: {hls_prefix}")
    
    # 🧹 Cleanup temp files
    os.remove(raw_path)
    for f in os.listdir(hls_dir): os.remove(os.path.join(hls_dir, f))
    os.rmdir(hls_dir)

def start_worker():
    logging.info("Neural Media Transcoder Online. Listening for tasks...")
    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None: continue
            if msg.error():
                err_code = msg.error().code()
                if err_code == KafkaError._PARTITION_EOF:
                    continue
                elif err_code == KafkaError.UNKNOWN_TOPIC_OR_PART:
                    # Ignore and wait: Topic will auto-create when Go backend sends the first video
                    continue
                else:
                    logging.error(f"Kafka Error: {msg.error()}")
                    continue # 🚀 THE FIX: Don't 'break', keep the worker alive forever!
                
            task = json.loads(msg.value().decode('utf-8'))
            object_key = task.get("object_key")
            
            if object_key:
                process_video(object_key)
                
    except KeyboardInterrupt: pass
    finally: consumer.close()

if __name__ == '__main__':
    start_worker()