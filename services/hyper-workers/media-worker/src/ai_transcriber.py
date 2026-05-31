import whisper
import os
import datetime

# 🧠 Loading the Neural AI Model (Base model is fast, use 'small' or 'medium' for better accuracy)
print("🧠 [AI ENGINE] Booting Whisper Neural Model...")
model = whisper.load_model("base") 

def generate_vtt(segments):
    """Converts Whisper AI segments into WebVTT format for browser players"""
    vtt_content = "WEBVTT\n\n"
    for segment in segments:
        start = datetime.timedelta(seconds=segment['start'])
        end = datetime.timedelta(seconds=segment['end'])
        
        # Format: 00:00:00.000
        start_fmt = f"0{start}"[:12] if start.seconds < 3600 else str(start)[:12]
        end_fmt = f"0{end}"[:12] if end.seconds < 3600 else str(end)[:12]
        
        # Format adjustment for VTT (needs . instead of , for milliseconds)
        start_fmt = start_fmt.replace(',', '.')
        end_fmt = end_fmt.replace(',', '.')

        text = segment['text'].strip()
        vtt_content += f"{start_fmt} --> {end_fmt}\n{text}\n\n"
        
    return vtt_content

def process_auto_captions(video_path, output_dir):
    """Extracts audio and generates VTT subtitles"""
    print(f"🎙️ [AI ENGINE] Extracting Audio & Generating Captions for {video_path}...")
    
    # Run Whisper Transcriber
    result = model.transcribe(video_path)
    
    vtt_text = generate_vtt(result["segments"])
    
    vtt_path = os.path.join(output_dir, "captions.vtt")
    with open(vtt_path, "w", encoding="utf-8") as f:
        f.write(vtt_text)
        
    print(f"✅ [AI ENGINE] Captions Generated: {vtt_path}")
    return vtt_path