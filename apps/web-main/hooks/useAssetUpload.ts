export function useAssetUpload() {
  const uploadAsset = async (file: File) => {
    return { success: true, asset_id: 'dummy_id' };
  };
  return { uploadAsset, isUploading: false, uploadProgress: 0 };
}
