export function useGenerationQueue(assetId: string | null) {
  return { status: assetId ? 'ready' : 'idle', generatedUrl: assetId ? 'dummy_url' : null };
}
