import { useState, useEffect, useRef, useCallback } from 'react';
import { StreamVideoClient } from '@stream-io/video-react-sdk';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

/**
 * Custom hook for managing Stream Video call lifecycle.
 *
 * Handles:
 * - Token fetching from backend
 * - StreamVideoClient initialization
 * - Call creation and joining
 * - Cleanup on unmount
 * - Error states and loading states
 */
export function useStreamCall(appointmentId) {
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [callMeta, setCallMeta] = useState(null);
  const cleanupRef = useRef(false);

  const initializeCall = useCallback(async () => {
    if (!appointmentId) {
      setError('No appointment ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Step 1: Fetch Stream token from our backend
      const res = await fetch(`${BASE_URL}/api/video/token`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to get video token');
      }

      const { token, apiKey, callId, userId, userName, userType } = data;
      setCallMeta({ userId, userName, userType, callId });

      // Step 2: Create Stream Video Client
      const user = { id: userId, name: userName, type: 'authenticated' };
      const videoClient = new StreamVideoClient({
        apiKey,
        user,
        token,
      });

      // Step 3: Create and join the call
      const videoCall = videoClient.call('default', callId);
      await videoCall.join({ create: true });

      if (!cleanupRef.current) {
        setClient(videoClient);
        setCall(videoCall);
        setLoading(false);
      } else {
        // Component unmounted during init — clean up
        await videoCall.leave();
        videoClient.disconnectUser();
      }
    } catch (err) {
      console.error('[useStreamCall] Error:', err);
      if (!cleanupRef.current) {
        setError(err.message || 'Failed to initialize video call');
        setLoading(false);
      }
    }
  }, [appointmentId]);

  // End call and notify backend
  const endCall = useCallback(async () => {
    try {
      // Notify backend
      await fetch(`${BASE_URL}/api/video/end`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId }),
      });
    } catch (err) {
      console.error('[useStreamCall] Error ending call:', err);
    }

    // Leave call and disconnect
    if (call) {
      try {
        await call.leave();
      } catch (e) {
        // Call may already be left
      }
    }
    if (client) {
      try {
        client.disconnectUser();
      } catch (e) {
        // Client may already be disconnected
      }
    }

    setCall(null);
    setClient(null);
  }, [call, client, appointmentId]);

  useEffect(() => {
    cleanupRef.current = false;
    initializeCall();

    return () => {
      cleanupRef.current = true;
      // Cleanup on unmount
      if (call) {
        call.leave().catch(() => {});
      }
      if (client) {
        client.disconnectUser().catch(() => {});
      }
    };
  }, [appointmentId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    client,
    call,
    loading,
    error,
    callMeta,
    endCall,
    retry: initializeCall,
  };
}
