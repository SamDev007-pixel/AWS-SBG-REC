'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scanner } from '@yudiel/react-qr-scanner';
import { QrCode, ArrowLeft, Camera, FlipHorizontal, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function OnSpotScannerPage() {
  const router = useRouter();
  const [isMirrored, setIsMirrored] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  function handleCameraScan(rawValue: string) {
    if (!rawValue) return;

    try {
      // Validate that the URL is a valid registration URL
      // Expected pattern: /events/[eventId]/register
      const url = new URL(rawValue);
      const pathname = url.pathname; // /events/[eventId]/register

      const match = pathname.match(/^\/events\/([a-f0-9\-]+)\/register/i);
      if (match && match[1]) {
        const eventId = match[1];
        setIsRedirecting(true);
        setErrorMsg(null);
        // Redirect directly to the registration page with onSpot=true
        router.push(`/events/${eventId}/register?onSpot=true`);
      } else {
        setErrorMsg('Invalid QR code format. Please scan a valid event registration QR code.');
      }
    } catch (e) {
      // If parsing as URL fails, fallback to checking if it is a raw UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(rawValue)) {
        setIsRedirecting(true);
        setErrorMsg(null);
        router.push(`/events/${rawValue}/register?onSpot=true`);
      } else {
        setErrorMsg('Invalid QR code scanned. Make sure you are scanning the Event On-Spot QR.');
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,153,0,0.03)_0%,transparent_60%)] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <Link
            href="/events"
            className="w-9 h-9 hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-slate-800">Scan to Register</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">On-Spot Registration</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#FF9900]/10 border border-[#FF9900]/20 rounded-full text-[10px] font-bold text-[#FF9900] tracking-wider uppercase select-none">
          <Camera size={11} className="stroke-[2.5]" />
          Scanner Active
        </div>
      </header>

      {/* Main viewport */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 max-w-sm mx-auto w-full">
        {isRedirecting ? (
          <div className="text-center py-10 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#FF9900] mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-slate-700">Redirecting to registration...</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Setting up your registration form</p>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-6 text-center">
            {/* Instruction */}
            <div>
              <h2 className="text-sm font-bold text-slate-700">Point camera at the QR code</h2>
              <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
                Scan the On-Spot Registration QR Code projected or displayed at the venue to open the form.
              </p>
            </div>

            {/* Camera feed widget */}
            <div className="relative w-full aspect-square bg-[#101720] rounded-3xl overflow-hidden shadow-xl flex items-center justify-center border-4 border-white ring-1 ring-slate-200">
              <div
                className="absolute inset-0 w-full h-full"
                style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
              >
                <Scanner
                  onScan={(result) => {
                    if (result && result.length > 0 && result[0].rawValue) {
                      handleCameraScan(result[0].rawValue);
                    }
                  }}
                  onError={(error) => console.log('Scan error:', error?.message)}
                  sound={false}
                  components={{ finder: false }}
                  constraints={{ facingMode: 'environment' }}
                  styles={{ container: { width: '100%', height: '100%' } }}
                />
              </div>

              {/* HUD Target markers */}
              <div className="absolute inset-0 pointer-events-none p-5">
                <div className="absolute top-5 left-5 w-6 h-6 border-t-2 border-l-2 border-[#FF9900] rounded-tl-md" />
                <div className="absolute top-5 right-5 w-6 h-6 border-t-2 border-r-2 border-[#FF9900] rounded-tr-md" />
                <div className="absolute bottom-5 left-5 w-6 h-6 border-b-2 border-l-2 border-[#FF9900] rounded-bl-md" />
                <div className="absolute bottom-5 right-5 w-6 h-6 border-b-2 border-r-2 border-[#FF9900] rounded-br-md" />
              </div>

              {/* Mirror View Control */}
              <button
                type="button"
                onClick={() => setIsMirrored(!isMirrored)}
                title="Mirror Camera"
                className="absolute top-4 right-4 z-20 bg-slate-900/65 hover:bg-slate-900/85 text-white p-2 rounded-xl border border-white/10 backdrop-blur-sm transition-all active:scale-95 flex items-center justify-center shadow-sm cursor-pointer"
              >
                <FlipHorizontal size={14} />
              </button>

              {/* Sweeping laser */}
              <div className="absolute left-5 right-5 h-0.5 bg-gradient-to-r from-transparent via-[#FF9900] to-transparent opacity-85 shadow-[0_0_10px_#FF9900] animate-[laser-sweep_2.5s_infinite] pointer-events-none" />
            </div>

            {/* Error notifications */}
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs text-left leading-relaxed">
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
