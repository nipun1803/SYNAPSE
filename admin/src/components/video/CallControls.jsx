import React from 'react';
import { useCallStateHooks } from '@stream-io/video-react-sdk';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor } from 'lucide-react';

/**
 * Premium Call control bar — reusable across doctor and admin panels with state-of-the-art UI.
 */
const CallControls = ({ onLeave }) => {
  const { useMicrophoneState, useCameraState, useScreenShareState } =
    useCallStateHooks();

  const { microphone, isMute: isMicMuted } = useMicrophoneState();
  const { camera, isMute: isCameraMuted } = useCameraState();
  const { screenShare, isMute: isScreenShareOff } = useScreenShareState();

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3.5 bg-slate-950/85 backdrop-blur-2xl px-8 py-4 rounded-full shadow-[0_20px_70px_rgba(0,0,0,0.7)] border border-white/15 z-30 group hover:border-white/25 transition-all duration-300">
      <button
        onClick={() => microphone.toggle()}
        className={`p-4 rounded-full transition-all duration-300 transform active:scale-90 ${
          isMicMuted
            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40 ring-4 ring-rose-600/20'
            : 'bg-white/10 hover:bg-white/20 text-white hover:shadow-lg hover:shadow-white/10'
        }`}
        title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
      >
        {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      <button
        onClick={() => camera.toggle()}
        className={`p-4 rounded-full transition-all duration-300 transform active:scale-90 ${
          isCameraMuted
            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40 ring-4 ring-rose-600/20'
            : 'bg-white/10 hover:bg-white/20 text-white hover:shadow-lg hover:shadow-white/10'
        }`}
        title={isCameraMuted ? 'Turn on camera' : 'Turn off camera'}
      >
        {isCameraMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
      </button>

      <button
        onClick={() => screenShare.toggle()}
        className={`p-4 rounded-full transition-all duration-300 transform active:scale-90 ${
          !isScreenShareOff
            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/40 ring-4 ring-blue-600/20'
            : 'bg-white/10 hover:bg-white/20 text-white hover:shadow-lg hover:shadow-white/10'
        }`}
        title={!isScreenShareOff ? 'Stop sharing screen' : 'Share screen'}
      >
        <Monitor className="w-5 h-5" />
      </button>

      <div className="w-px h-8 bg-white/20 mx-2" />

      <button
        onClick={onLeave}
        className="p-4 bg-red-600 hover:bg-red-500 text-white rounded-full transition-all duration-300 transform active:scale-90 shadow-lg shadow-red-600/50 hover:shadow-red-600/70 ring-4 ring-red-600/20 flex items-center justify-center"
        title="Leave consultation call"
      >
        <PhoneOff className="w-5 h-5" />
      </button>
    </div>
  );
};

export default CallControls;
