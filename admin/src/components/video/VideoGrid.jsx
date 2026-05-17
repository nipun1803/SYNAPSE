import React from 'react';
import {
  useCallStateHooks,
  ParticipantView,
  CallingState,
} from '@stream-io/video-react-sdk';
import { Users, VideoOff, ShieldCheck } from 'lucide-react';

/**
 * Premium Video grid for doctor panel — displays local and remote participants with state-of-the-art UI.
 */
const VideoGrid = () => {
  const { useParticipants, useCallCallingState } = useCallStateHooks();
  const participants = useParticipants();
  const callingState = useCallCallingState();

  if (callingState === CallingState.JOINING) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 min-h-[600px]">
        <div className="text-center relative z-10 max-w-md p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-2xl shadow-2xl flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6 shadow-lg shadow-emerald-500/20" />
          <h3 className="text-white font-bold text-xl mb-2">Joining Doctor Consultation Room...</h3>
          <p className="text-slate-400 text-sm">Establishing secure encrypted medical line</p>
        </div>
      </div>
    );
  }

  if (!participants || participants.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 min-h-[600px]">
        <div className="text-center p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-2xl shadow-2xl flex flex-col items-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
            <VideoOff className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-white font-bold text-xl mb-2">No Video Feed</h3>
          <p className="text-slate-400 text-sm">Waiting for participants to connect video devices.</p>
        </div>
      </div>
    );
  }

  const isAlone = participants.length === 1;

  return (
    <div className="flex-1 relative bg-slate-950 overflow-hidden min-h-[600px] flex items-center justify-center">
      {isAlone ? (
        <>
          {/* Full screen local video when alone */}
          <div className="absolute inset-0 w-full h-full opacity-40 blur-md">
            <ParticipantView
              participant={participants[0]}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Premium Waiting overlay for Doctor */}
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/85 pointer-events-none overflow-hidden px-4">
            {/* Background glowing effects */}
            <div className="absolute w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[120px] -top-20 -left-20 animate-pulse" />
            <div className="absolute w-[500px] h-[500px] bg-teal-600/15 rounded-full blur-[120px] -bottom-20 -right-20 animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="text-center relative z-10 max-w-lg px-8 py-12 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-2xl shadow-[0_0_80px_rgba(16,185,129,0.15)] flex flex-col items-center">
              <div className="relative mb-6">
                <div className="absolute -inset-4 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 relative transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <Users className="w-10 h-10 text-white" />
                </div>
              </div>
              <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Secure Medical Line Active
              </span>
              <h3 className="text-white font-bold text-2xl tracking-tight mb-3">
                Waiting for the patient to join
              </h3>
              <p className="text-slate-300 text-sm max-w-sm mb-8 leading-relaxed">
                Your consultation room is standing by. The patient will appear on HD video exactly when they join the session.
              </p>
              <div className="flex items-center justify-center gap-2 bg-slate-950/80 px-6 py-3 rounded-2xl border border-slate-800 shadow-inner">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-slate-300">HIPAA Compliant Encrypted Channel</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Remote participant (full screen) */}
          <div className="absolute inset-0 w-full h-full">
            <ParticipantView
              participant={participants.find((p) => !p.isLocalParticipant) || participants[1]}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Local participant (picture-in-picture) */}
          <div className="absolute bottom-28 right-8 w-48 sm:w-56 aspect-[3/4] bg-slate-950 rounded-2xl overflow-hidden border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] ring-4 ring-emerald-500/20 z-20 transition-all duration-300 hover:scale-105 hover:border-emerald-400 hover:shadow-emerald-500/25">
            <div className="absolute top-3 left-3 z-30 px-2 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-[11px] font-medium text-white border border-white/15 flex items-center gap-1.5 shadow-md">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Doctor (You)
            </div>
            <ParticipantView
              participant={participants.find((p) => p.isLocalParticipant) || participants[0]}
              className="h-full w-full object-cover"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default VideoGrid;
