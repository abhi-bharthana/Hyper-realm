import cv2
import os

def process_vision_task(input_path, output_path):
    print(f"🧠 Processing image: {input_path}")
    
    # Image read karo
    image = cv2.imread(input_path)
    if image is None:
        raise ValueError("Image load nahi ho payi ya corrupt hai!")

    # Phase 1 Logic: Convert to Grayscale & Edge Detection (Canny)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200)

    # Output save karo
    cv2.imwrite(output_path, edges)
    print(f"✅ Image processed and saved at: {output_path}")
    
    return True