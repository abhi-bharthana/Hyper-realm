import json
import logging
import os
import subprocess
import time
import re
import traceback
from confluent_kafka import Consumer, KafkaError
from minio import Minio

from ai_transcriber import process_auto_captions

logging.basicConfig(level=logging.INFO, format='%(asctime)s | ⚙️ [MEDIA-WORKER] %(levelname)s: %(message)s')

try:
    MINIO_ENDPOINT = os.environ.get("MINIO_ENDPOINT", "localhost:7480")
    MINIO_ACCESS = os.environ["MINIO_ACCESS"]
    MINIO_SECRET = os.environ["MINIO_SECRET"]
except KeyError as e:
    raise RuntimeError(f"CRITICAL SECURITY HALT: Missing Environment Variable {e}")

BUCKET_NAME = "hyper-users-data"
minio_client = Minio(MINIO_ENDPOINT, access_key=MINIO_ACCESS, secret_key=MINIO_SECRET, secure=False)

conf = {
    'bootstrap.servers': os.environ.get("KAFKA_BROKER", 'localhost:29092'),
    'group.id': 'media-transcoder-v11', # Naya ID
    'auto.offset.reset': 'earliest',
    'enable.auto.commit': False, 
    'max.poll.interval.ms': 7200000 
}
consumer = Consumer(conf)
consumer.subscribe(['media.transcode.tasks'])

def wait_for_services():
    logging.info("Checking Storage Cluster health...")
    while True:
        try:
            if not minio_client.bucket_exists(BUCKET_NAME):
                minio_client.make_bucket(BUCKET_NAME)
            logging.info("✅ Storage Cluster is Online and Ready.")
            break
        except Exception as e:
            time.sleep(5)

def cleanup_temp_workspace(object_key):
    file_name = object_key.split('/')[-1]
    raw_path = f"/tmp/raw_{file_name}"
    base_name = file_name.rsplit('.', 1)[0]
    hls_dir = f"/tmp/hls_{base_name}"
    try:
        if os.path.exists(raw_path): os.remove(raw_path)
        if os.path.exists(hls_dir):
            for f in os.listdir(hls_dir): os.remove(os.path.join(hls_dir, f))
            os.rmdir(hls_dir)
        logging.info(f"🧹 Workspace cleaned for {file_name}.")
    except Exception as e: pass

def sweep_orphaned_assets():
    logging.info("🧹 Sweeping storage for unprocessed orphaned assets...")
    try:
        objects = minio_client.list_objects(BUCKET_NAME, recursive=True)
        raw_videos = []
        processed_folders = set()

        for obj in objects:
            if obj.object_name.endswith(('.mkv', '.mp4', '.mov', '.webm')):
                raw_videos.append(obj.object_name)
            elif obj.object_name.endswith('master.m3u8'):
                # 🚀 FIX: Ab ye pura folder path yaad rakhega!
                processed_folders.add(os.path.dirname(obj.object_name))

        orphans = []
        for vid in raw_videos:
            # 🚀 FIX: Full path match
            expected_folder = f"{vid.rsplit('.', 1)[0]}_hls"
            if expected_folder not in processed_folders:
                orphans.append(vid)

        if orphans:
            logging.info(f"🚨 Found {len(orphans)} unprocessed assets! Initiating EMERGENCY SWEEP...")
            for orphan in orphans:
                success = process_video(orphan)
                if success: cleanup_temp_workspace(orphan)
                
    except Exception as e:
        logging.error(f"Sweep failed: {e}")

def analyze_media(file_path):
    cmd = ['ffprobe', '-v', 'error', '-print_format', 'json', '-show_streams', file_path]
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    data = json.loads(result.stdout)
    videos = [s for s in data.get('streams', []) if s.get('codec_type') == 'video']
    audios = [s for s in data.get('streams', []) if s.get('codec_type') == 'audio']
    subs = [s for s in data.get('streams', []) if s.get('codec_type') == 'subtitle']
    return len(videos) > 0, audios, subs

def process_video(object_key):
    file_name = object_key.split('/')[-1]
    raw_path = f"/tmp/raw_{file_name}"
    base_name = file_name.rsplit('.', 1)[0]
    hls_dir = f"/tmp/hls_{base_name}"
    
    # 🚀 FIX: HLS Folder ab original video ke sath same folder mein banega!
    hls_prefix = f"{object_key.rsplit('.', 1)[0]}_hls" 
    
    try:
        os.makedirs(hls_dir, exist_ok=True)
        
        if not os.path.exists(raw_path):
            logging.info(f"Downloading raw asset: {object_key}")
            minio_client.fget_object(BUCKET_NAME, object_key, raw_path)
        else:
            logging.info(f"⏭️ CHECKPOINT: Local raw asset found. Skipping MinIO download.")
        
        has_video, audios, subs = analyze_media(raw_path)
        logging.info(f"Media Info - Video: {has_video}, Audios: {len(audios)}, Subs: {len(subs)}")
        
        captions_path = os.path.join(hls_dir, "captions.vtt")
        if len(audios) > 0:
            if not os.path.exists(captions_path):
                process_auto_captions(raw_path, hls_dir)
            else:
                logging.info(f"⏭️ CHECKPOINT: AI Captions already exist. Skipping Whisper processing!")
        else:
            logging.warning("⚠️ No audio stream detected!")
            
        logging.info("Spinning up Web-Safe H.264 HLS Engine...")
        command = ['ffmpeg', '-y', '-i', raw_path]
        var_map_elements = []
        
        if has_video:
            command.extend(['-map', '0:v:0', '-c:v', 'libx264', '-preset', 'fast', '-crf', '22'])
            v_map = "v:0"
            if len(audios) > 0: v_map += ",agroup:aud"
            var_map_elements.append(v_map)

        for output_idx, a in enumerate(audios):
            command.extend(['-map', f'0:a:{output_idx}'])
            tags = a.get('tags', {})
            lang_code = next((v for k, v in tags.items() if k.lower() == 'language'), 'unk')[:3].lower()
            title = next((v for k, v in tags.items() if k.lower() == 'title'), lang_code)
            safe_title = re.sub(r'_+', '_', "".join(c if c.isalnum() else '_' for c in title)).strip('_').capitalize()
            if safe_title == "Unk": safe_title = f"Audio_{output_idx+1}"
            
            a_map = f"a:{output_idx}"
            if has_video: a_map += ",agroup:aud"
            a_map += f",language:{lang_code},name:{safe_title}"
            var_map_elements.append(a_map)

        if len(audios) > 0: 
            command.extend(['-c:a', 'aac', '-b:a', '192k', '-ac', '2', '-ar', '48000'])

        command.extend([
            '-f', 'hls', '-hls_time', '10', '-hls_playlist_type', 'vod',
            '-master_pl_name', 'master.m3u8', '-var_stream_map', " ".join(var_map_elements).strip(),
            '-hls_segment_filename', os.path.join(hls_dir, 'stream_%v_data_%03d.ts'),
            os.path.join(hls_dir, 'stream_%v.m3u8')
        ])
        
        result = subprocess.run(command, capture_output=True, text=True)
        if result.returncode != 0: raise RuntimeError(f"FFmpeg Fatal Error:\n{result.stderr}")
        
        # Subtitle Injection
        valid_subs = [ (i, s) for i, s in enumerate(subs) if s.get('codec_name') not in ['hdmv_pgs_subtitle', 'dvd_subtitle'] ]
        if valid_subs:
            for output_idx, (original_idx, s) in enumerate(valid_subs):
                sub_file = os.path.join(hls_dir, f"sub_{output_idx}.vtt")
                subprocess.run(['ffmpeg', '-y', '-i', raw_path, '-map', f'0:s:{original_idx}', sub_file], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                
            master_path = os.path.join(hls_dir, 'master.m3u8')
            if os.path.exists(master_path):
                with open(master_path, 'r') as f: m3u8_content = f.read()
                m3u8_content = m3u8_content.replace('#EXT-X-STREAM-INF:', '#EXT-X-STREAM-INF:SUBTITLES="subs",')
                sub_lines = []
                for output_idx, (original_idx, s) in enumerate(valid_subs):
                    tags = s.get('tags', {})
                    lang = next((v for k, v in tags.items() if k.lower() == 'language'), 'eng')[:3].lower()
                    title = next((v for k, v in tags.items() if k.lower() == 'title'), f"Subtitle_{output_idx+1}")
                    title = "".join(c if c.isalnum() or c.isspace() else '_' for c in title).strip('_')
                    default = "YES" if output_idx == 0 else "NO"
                    sub_lines.append(f'\n#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",LANGUAGE="{lang}",NAME="{title}",DEFAULT={default},AUTOSELECT=YES,URI="sub_{output_idx}.vtt"')
                with open(master_path, 'w') as f: f.write(m3u8_content + "".join(sub_lines))

        logging.info("Uploading HLS Shards & Meta to Storage Cluster...")
        for filename in os.listdir(hls_dir):
            file_path = os.path.join(hls_dir, filename)
            minio_key = f"{hls_prefix}/{filename}"
            if filename.endswith('.m3u8'): content_type = "application/x-mpegURL"
            elif filename.endswith('.ts'): content_type = "video/MP2T"
            elif filename.endswith('.vtt'): content_type = "text/vtt"
            else: content_type = "application/octet-stream"
            minio_client.fput_object(BUCKET_NAME, minio_key, file_path, content_type=content_type)
            
        logging.info(f"✅ Transcoding & Upload Complete for {base_name}.")
        return True 
    except Exception as e:
        logging.error(f"❌ Pipeline crashed: {e}")
        return False 

def start_worker():
    wait_for_services()
    sweep_orphaned_assets()
    logging.info("🎧 Neural Media Transcoder entering Realtime Listen Mode...")
    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None: continue
            if msg.error(): continue 
            task = json.loads(msg.value().decode('utf-8'))
            object_key = task.get("object_key")
            if object_key:
                success = False
                for retry in range(3):
                    if process_video(object_key):
                        success = True
                        break
                    time.sleep(min(2 ** retry, 30))
                if success:
                    consumer.commit(msg)
                else:
                    consumer.commit(msg)
                cleanup_temp_workspace(object_key)
    except KeyboardInterrupt: pass
    finally: consumer.close()

if __name__ == '__main__':
    start_worker()