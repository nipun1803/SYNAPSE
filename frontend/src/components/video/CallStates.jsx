import React from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

/**
 * Premium Error, loading, and ended state components for the video call flow.
 */

export const CallLoading = () => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 bg-slate-950 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
    <div className="absolute w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] -top-20 -left-20 animate-pulse" />
    <div className="absolute w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -bottom-20 -right-20 animate-pulse" style={{ animationDelay: '1s' }} />

    <div className="relative z-10 flex flex-col items-center">
      <div className="relative mb-8">
        <div className="absolute -inset-4 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
        <div className="w-24 h-24 rounded-3xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-xl flex items-center justify-center shadow-2xl shadow-blue-500/20 relative">
          <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-lg animate-bounce">
          <ShieldCheck className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="text-center max-w-md">
        <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-3 inline-block">
          Secured Protocol Active
        </span>
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
          Setting up your consultation
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Establishing a secure, encrypted WebRTC tunnel for your video consultation...
        </p>
      </div>
    </div>
  </div>
);

export const CallError = ({ error, onRetry, onBack }) => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 bg-slate-950 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
    <div className="absolute w-[400px] h-[400px] bg-rose-600/10 rounded-full blur-[100px] -top-20 -left-20" />
    
    <div className="relative z-10 flex flex-col items-center">
      <div className="relative mb-6">
        <div className="absolute -inset-4 rounded-full bg-rose-500/20 blur-xl animate-pulse" />
        <div className="w-24 h-24 rounded-3xl bg-rose-950/50 border border-rose-800/80 backdrop-blur-xl flex items-center justify-center shadow-2xl shadow-rose-500/30 relative">
          <AlertTriangle className="w-12 h-12 text-rose-500" />
        </div>
      </div>
      <div className="text-center max-w-md mb-8">
        <span className="px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold uppercase tracking-widest mb-3 inline-block">
          Connection Issue
        </span>
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
          Unable to start consultation
        </h2>
        <p className="text-slate-300 text-sm mb-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 font-mono text-xs">
          {error}
        </p>
        <p className="text-slate-400 text-xs">
          Please verify your camera and microphone permissions in browser settings and try connecting again.
        </p>
      </div>
      <div className="flex flex-wrap gap-4 justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 text-sm shadow-xl shadow-blue-600/30 transform active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
        )}
        <button
          onClick={onBack}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 text-sm transform active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </button>
      </div>
    </div>
  </div>
);

export const CallEnded = ({ onBack }) => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center gap-8 bg-slate-950 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
    <div className="absolute w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

    <div className="relative z-10 flex flex-col items-center">
      <div className="relative mb-6">
        <div className="absolute -inset-4 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-2xl shadow-emerald-500/40 relative">
          <CheckCircle2 className="w-16 h-16 text-white" />
        </div>
      </div>
      <div className="text-center max-w-md mb-8">
        <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-3 inline-block">
          Session Completed
        </span>
        <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
          Consultation Ended
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          The secure video session has been successfully closed. Thank you for using Synapse Telehealth.
        </p>
      </div>
      <button
        onClick={onBack}
        className="px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold transition-all duration-300 shadow-xl shadow-blue-600/30 flex items-center gap-3 transform active:scale-95 text-base"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Appointments
      </button>
    </div>
  </div>
);
