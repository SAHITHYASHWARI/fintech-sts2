import cv2
import numpy as np
import sys
import os

def preprocess_bill(image_path, output_path):
    img = cv2.imread(image_path)
    if img is None:
        print("Could not read image:", image_path)
        return False
        
    # 1. Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 2. Resize if too small or very large (standardize width to 1600px)
    h, w = gray.shape
    scale = 1600.0 / w
    if scale != 1.0:
        gray = cv2.resize(gray, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)
        
    # 3. CLAHE (Contrast Limited Adaptive Histogram Equalization) for thermal / faded receipts
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
    enhanced = clahe.apply(gray)
    
    # 4. Bilateral filter to remove noise while preserving crisp text edges
    denoised = cv2.bilateralFilter(enhanced, 9, 75, 75)
    
    # 5. Adaptive Gaussian Threshold
    thresh = cv2.adaptiveThreshold(
        denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 21, 10
    )
    
    # Write enhanced and thresh
    cv2.imwrite(output_path, thresh)
    enhanced_path = output_path.replace('.png', '_enhanced.png')
    cv2.imwrite(enhanced_path, enhanced)
    print("Preprocessed successfully to", output_path)
    return True

if __name__ == '__main__':
    img_in = sys.argv[1]
    img_out = sys.argv[2]
    preprocess_bill(img_in, img_out)

