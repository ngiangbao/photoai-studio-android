// The server kicks off a Veo video job and immediately returns an
// `operationName` (the job is async and can take 1-3 minutes) - see
// server.ts's /api/veo/generate-video, /api/veo/status and /api/veo/download.
// Before this file existed, nothing on the frontend ever called the status
// or download endpoints: the UI fired the generate request, stored the raw
// operationName, and showed a "processing" card forever with no way to
// actually see or save the finished video. This service does the missing
// work: poll until the job is done, then download the real video bytes.

export interface VeoCompletedVideo {
  blobUrl: string;
  mimeType: string;
}

export interface VeoPollOptions {
  operationName: string;
  apiKey: string;
  /** How often to re-check job status, in ms. Default 5s. */
  intervalMs?: number;
  /** Give up after this long, in ms. Default 5 minutes. */
  timeoutMs?: number;
  /** Called on every poll tick with elapsed time, so callers can show progress. */
  onTick?: (elapsedMs: number) => void;
  /** Checked before each poll/download step; return true to abort early. */
  isCancelled?: () => boolean;
}

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    return data?.error || fallback;
  } catch {
    return fallback;
  }
}

async function pollAndDownload({
  operationName,
  apiKey,
  intervalMs = 5000,
  timeoutMs = 5 * 60 * 1000,
  onTick,
  isCancelled,
}: VeoPollOptions): Promise<VeoCompletedVideo> {
  const startedAt = Date.now();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (isCancelled?.()) {
      throw new Error('cancelled');
    }

    const elapsed = Date.now() - startedAt;
    if (elapsed > timeoutMs) {
      throw new Error(
        'Video generation is taking longer than expected (over 5 minutes). Please try again later.',
      );
    }
    onTick?.(elapsed);

    const statusRes = await fetch('/api/veo/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operationName, apiKey }),
    });

    if (!statusRes.ok) {
      throw new Error(await readErrorMessage(statusRes, 'Failed to check video generation status.'));
    }

    const statusData = await statusRes.json();
    if (statusData.done) {
      if (!statusData.hasDownloadUri) {
        throw new Error('Video generation finished, but no video was returned.');
      }
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  if (isCancelled?.()) {
    throw new Error('cancelled');
  }

  const downloadRes = await fetch('/api/veo/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operationName, apiKey }),
  });

  if (!downloadRes.ok) {
    throw new Error(await readErrorMessage(downloadRes, 'Failed to download the generated video.'));
  }

  const blob = await downloadRes.blob();
  return {
    blobUrl: URL.createObjectURL(blob),
    mimeType: blob.type || 'video/mp4',
  };
}

export const veoService = {
  pollAndDownload,
};
