import { StreamClient } from '@stream-io/node-sdk';

let streamClient = null;

/**
 * Get or create the singleton Stream client instance.
 * Lazily initialized to avoid crashing if Stream env vars are missing.
 */
export function getStreamClient() {
  if (streamClient) return streamClient;

  const apiKey = process.env.STREAM_API_KEY;
  const apiSecret = process.env.STREAM_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.warn('[Stream] STREAM_API_KEY or STREAM_API_SECRET not configured. Video calls will be unavailable.');
    return null;
  }

  streamClient = new StreamClient(apiKey, apiSecret);
  return streamClient;
}

export default getStreamClient;
