import { useState } from 'react';

interface UploadResponse {
  success: boolean;
  asset_id?: string;
  status?: string;
  message: string;
}

export function useAssetUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadAsset = async (file: File): Promise<UploadResponse> => {
    setIsUploading(true);
    setUploadProgress(10); // Initial progress

    try {
      // 1. Prepare Multipart Form Data
      const formData = new FormData();
      formData.append('file', file);

      // 2. Get User Token (Hyper-ID ecosystem se token nikalna)
      // Assuming you store your JWT in localStorage or cookies
      const token = localStorage.getItem('hyper_token') || '';

      // 3. Send to Go Backend (3D Lab API - Phase 2)
      // Note: Replace 8082 with your actual 3D-Lab API port
      const response = await fetch('http://localhost:8082/api/v1/assets/upload', {
        method: 'POST',
        headers: {
          'x-user-hid': token, // Required by your DB schema for owner_id
          // Content-Type is NOT set manually for FormData, browser handles boundary
        },
        body: formData,
      });

      setUploadProgress(80);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setUploadProgress(100);
      return data;

    } catch (error: any) {
      console.error('Asset upload error:', error);
      return { success: false, message: error.message };
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000); // UI reset delay
    }
  };

  return { uploadAsset, isUploading, uploadProgress };
}