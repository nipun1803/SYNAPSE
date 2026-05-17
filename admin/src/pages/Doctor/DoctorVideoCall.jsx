import React, { useState, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StreamVideo, StreamCall } from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { useStreamCall } from '../../hooks/useStreamCall';
import VideoGrid from '../../components/video/VideoGrid';
import CallControls from '../../components/video/CallControls';
import { CallLoading, CallError, CallEnded } from '../../components/video/CallStates';
import { DoctorContext } from '../../context/DoctorContext';
import { Shield, Stethoscope } from 'lucide-react';

/**
 * Doctor-side Video Call page.
 * Uses Stream Video SDK for managed WebRTC infrastructure.
 */
const DoctorVideoCall = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { dToken } = useContext(DoctorContext);
  const [hasEnded, setHasEnded] = useState(false);

  const { client, call, loading, error, callMeta, endCall, retry } =
    useStreamCall(appointmentId);

  const handleLeave = useCallback(async () => {
    await endCall();
    setHasEnded(true);
  }, [endCall]);

  const handleBack = useCallback(() => {
    navigate('/doctor-appointments');
  }, [navigate]);

  if (!dToken) return null;

  if (hasEnded) {
    return <CallEnded onBack={handleBack} />;
  }

  if (loading) {
    return <CallLoading />;
  }

  if (error) {
    return <CallError error={error} onRetry={retry} onBack={handleBack} />;
  }

  if (!client || !call) {
    return <CallLoading />;
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <div className="min-h-[85vh] flex flex-col rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.3)] border border-slate-800 bg-slate-950 m-4 sm:m-6">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 z-20">
            <div className="flex items-center gap-3.5">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wider">
                <Stethoscope className="w-4 h-4 text-emerald-400 animate-pulse" />
                DOCTOR CONSULTATION ROOM
              </div>
              <div className="h-4 w-px bg-slate-800 hidden sm:block" />
              <span className="text-slate-400 text-xs font-mono hidden sm:block">
                ID: {callMeta?.callId}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium">
              <Shield className="w-4 h-4 text-teal-400" />
              <span className="hidden sm:inline">HIPAA Encrypted Channel</span>
              <span className="sm:hidden">Secure</span>
            </div>
          </div>

          {/* Video Area */}
          <div className="flex-1 relative flex flex-col bg-slate-950" style={{ minHeight: '650px' }}>
            <VideoGrid />
            <CallControls onLeave={handleLeave} />
          </div>
        </div>
      </StreamCall>
    </StreamVideo>
  );
};

export default DoctorVideoCall;
