import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DoctorContext } from '../../context/DoctorContext';
import { SocketContext } from '../../context/SocketContext';
import { toast } from 'react-toastify';
import { Phone, PhoneOff, ArrowLeft, Video, Mic, MicOff, Monitor, VideoOff } from 'lucide-react';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

const DoctorVideoCall = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { dToken, profileData } = useContext(DoctorContext);
  const { socket } = useContext(SocketContext);

  const [callActive, setCallActive] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const screenStream = useRef(null);

  const initWebRTC = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      peerConnection.current = new RTCPeerConnection(ICE_SERVERS);

      // Add local stream tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc_ice_candidate', {
            appointmentId,
            candidate: event.candidate
          });
        }
      };

      setCallActive(true);
      socket.emit('join_video', appointmentId);
      
      // The Doctor can act as the initiator if they join first. 
      // But we will also listen for offers in case the patient joined first.
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      
      socket.emit('webrtc_offer', {
        appointmentId,
        offer
      });

    } catch (err) {
      toast.error('Failed to access camera/microphone');
      console.error(err);
      navigate(-1);
    }
  }, [appointmentId, navigate, socket]);

  useEffect(() => {
    if (!socket || !dToken) return;

    initWebRTC();

    socket.on('webrtc_offer', async (data) => {
      if (!peerConnection.current) return;
      try {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit('webrtc_answer', { appointmentId, answer });
      } catch (e) {
        console.error("Error handling offer", e);
      }
    });

    socket.on('webrtc_answer', async (data) => {
      if (!peerConnection.current) return;
      try {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      } catch (e) {
        console.error("Error handling answer", e);
      }
    });

    socket.on('webrtc_ice_candidate', async (data) => {
      if (!peerConnection.current) return;
      try {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (e) {
        console.error("Error adding ice candidate", e);
      }
    });

    socket.on('video_call_ended', () => {
      handleEndCall(false); // End call remotely
    });

    return () => {
      handleEndCall(false);
    };
  }, [socket, initWebRTC, appointmentId, dToken]);

  const handleEndCall = (emitEvent = true) => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
    }
    if (screenStream.current) {
      screenStream.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    setCallActive(false);
    setCallEnded(true);
    
    if (emitEvent && socket) {
      socket.emit('video_ended', { appointmentId, endedBy: profileData?._id });
    }
  };

  const toggleMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStream.current = stream;
        
        const videoTrack = stream.getVideoTracks()[0];
        const sender = peerConnection.current.getSenders().find(s => s.track.kind === 'video');
        
        if (sender) {
          sender.replaceTrack(videoTrack);
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        videoTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.error("Error sharing screen", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenStream.current) {
      screenStream.current.getTracks().forEach(track => track.stop());
    }
    
    const videoTrack = localStream.current.getVideoTracks()[0];
    const sender = peerConnection.current.getSenders().find(s => s.track.kind === 'video');
    
    if (sender && videoTrack) {
      sender.replaceTrack(videoTrack);
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream.current;
    }

    setIsScreenSharing(false);
  };

  if (!dToken) {
    return null;
  }

  if (callEnded) {
    return (
      <div className='min-h-[80vh] flex flex-col items-center justify-center gap-6'>
        <div className='w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25'>
          <Phone className='w-10 h-10 text-white' />
        </div>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-800 dark:text-white mb-2'>
            Call Ended
          </h2>
          <p className='text-gray-500 dark:text-gray-400'>
            Your video consultation has ended successfully.
          </p>
        </div>
        <div className='flex gap-3'>
          <button
            onClick={() => navigate('/doctor-appointments')}
            className='px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2'
          >
            <ArrowLeft className='w-4 h-4' />
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-[80vh] flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl'>
        <div className='flex items-center gap-3'>
          <div className='w-3 h-3 bg-red-500 rounded-full animate-pulse' />
          <span className='text-white font-medium'>Live Consultation (WebRTC)</span>
        </div>
      </div>

      {/* Video Container */}
      <div className='flex-1 relative bg-gray-900 overflow-hidden' style={{ minHeight: '600px' }}>
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline 
          className='w-full h-full object-cover'
        />
        
        <div className='absolute bottom-20 right-6 w-48 h-64 bg-gray-800 rounded-xl overflow-hidden border-2 border-white shadow-xl z-10'>
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className='w-full h-full object-cover'
          />
        </div>

        {/* Controls */}
        <div className='absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-gray-800/80 backdrop-blur-md px-6 py-3 rounded-2xl z-20'>
          <button 
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
          >
            {isMuted ? <MicOff className='w-6 h-6' /> : <Mic className='w-6 h-6' />}
          </button>
          
          <button 
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
          >
            {isVideoOff ? <VideoOff className='w-6 h-6' /> : <Video className='w-6 h-6' />}
          </button>

          <button 
            onClick={toggleScreenShare}
            className={`p-4 rounded-full transition-all ${isScreenSharing ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
          >
            <Monitor className='w-6 h-6' />
          </button>

          <button 
            onClick={() => handleEndCall(true)}
            className='p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all ml-4'
          >
            <PhoneOff className='w-6 h-6' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorVideoCall;
