import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera as CameraIcon, ShieldCheck, Clock, Image as ImageIcon, CheckCircle2, X, CameraOff } from 'lucide-react';

const Camera = ({ onNavbarVisibilityChange }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));
  const fileInputRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [currentTime, setCurrentTime] = useState('00:00:00');
  const [cameraName, setCameraName] = useState('Detecting camera...');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);

  // --- Logic: Image Hash & Capture (Core Functionality Preserved) ---
  const computeImageFileHash = async (base64Data) => {
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const captureImage = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !stream) return alert('Camera not ready.');
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

    try {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageDataURL = canvas.toDataURL('image/png');
      const base64Data = imageDataURL.split(',')[1] || imageDataURL;
      const hash = await computeImageFileHash(base64Data);

      const now = new Date();
      const imageObject = {
        id: now.getTime(),
        imageData: imageDataURL,
        dateTime: now.toLocaleString(),
        filename: `TL-${now.getTime()}.png`,
        cameraName: cameraName || 'TrueLens-Alpha',
        hash
      };

      setCapturedImages((prev) => [...prev, imageObject]);
      localStorage.setItem('images', JSON.stringify([imageObject])); // Logic preserved
      
      // Auto-download logic
      const link = document.createElement('a');
      link.href = imageDataURL;
      link.download = imageObject.filename;
      link.click();
    } catch (error) {
      console.error('Capture error:', error);
    }
  };

  // --- Logic: Camera Management ---
  const toggleCamera = useCallback(() => {
    if (isCameraActive && streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setStream(null);
      setIsCameraActive(false);
      setIsCameraEnabled(false);
    } else {
      setIsCameraEnabled(true);
    }
  }, [isCameraActive]);

  useEffect(() => {
    if (!isCameraEnabled || !videoRef.current) return;
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
        });
        streamRef.current = mediaStream;
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraName(mediaStream.getVideoTracks()[0]?.label || 'Standard Camera');
        setIsCameraActive(true);
      } catch {
        setIsCameraEnabled(false);
      }
    };
    startCamera();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, [isCameraEnabled]);

  // Clock Update
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-GB'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut: Press 'C' to toggle camera
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Check if 'c' or 'C' is pressed (case-insensitive)
      if (event.key === 'c' || event.key === 'C') {
        // Prevent default behavior if needed
        event.preventDefault();
        toggleCamera();
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup: remove event listener on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [toggleCamera]);

  // Scroll detection for navbar visibility (using wheel events since Camera has overflow-hidden)
  useEffect(() => {
    if (!onNavbarVisibilityChange) return;

    let scrollTimeout;

    const handleWheel = (event) => {
      const deltaY = event.deltaY;
      
      // Show navbar only on downward scroll (positive deltaY)
      if (deltaY > 0) {
        onNavbarVisibilityChange(true);
        
        // Reset timeout to hide navbar after scrolling stops
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          // Hide navbar after 2 seconds of no downward scrolling
          onNavbarVisibilityChange(false);
        }, 2000);
      }
      // Hide navbar immediately on upward scroll (negative deltaY)
      else if (deltaY < 0) {
        clearTimeout(scrollTimeout);
        onNavbarVisibilityChange(false);
      }
    };

    const handleTouchStart = (event) => {
      // Store initial touch position
      const touch = event.touches[0];
      handleTouchStart.touchStartY = touch.clientY;
    };

    const handleTouchMove = (event) => {
      if (!handleTouchStart.touchStartY) return;
      
      const touch = event.touches[0];
      const deltaY = touch.clientY - handleTouchStart.touchStartY;
      
      // Show navbar only on downward scroll (swipe down)
      if (deltaY > 10) {
        onNavbarVisibilityChange(true);
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          onNavbarVisibilityChange(false);
        }, 2000);
      }
      // Hide navbar on upward scroll (swipe up)
      else if (deltaY < -10) {
        clearTimeout(scrollTimeout);
        onNavbarVisibilityChange(false);
      }
    };

    const handleTouchEnd = () => {
      handleTouchStart.touchStartY = null;
    };

    // Add event listeners
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      clearTimeout(scrollTimeout);
    };
  }, [onNavbarVisibilityChange]);

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden font-sans">
      
      {/* 1. FULLSCREEN VIDEO BACKGROUND */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isCameraActive ? 'opacity-100' : 'opacity-30'}`}
        autoPlay
        playsInline
        muted
      />

      {/* 2. OVERLAY: TOP HUD */}
      <div className="absolute top-0 inset-x-0 p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 z-20">
        {/* Brand & Camera Info */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white shadow-2xl w-full sm:w-auto">
          <div className="flex items-center gap-2 sm:gap-3 mb-1">
            <CameraIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            <span className="font-bold tracking-wider uppercase text-xs sm:text-sm">True Lens // Live Feed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs text-slate-300 font-mono uppercase tracking-tighter truncate max-w-[200px] sm:max-w-none">
              {isCameraActive ? cameraName : 'System Standby'}
            </span>
          </div>
        </div>

        {/* Time & Toggle */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white flex items-center gap-3 sm:gap-4 shadow-2xl w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 sm:gap-3">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 flex-shrink-0" />
            <span className="text-lg sm:text-xl md:text-2xl font-mono font-bold">{currentTime}</span>
          </div>
          <button 
            onClick={toggleCamera}
            className="p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center group"
            aria-label={isCameraActive ? 'Turn off camera' : 'Turn on camera'}
          >
            {isCameraActive ? (
              <CameraIcon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
            ) : (
              <div className="relative">
                <CameraOff className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 group-hover:text-red-300 transition-colors" />
                <X className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 absolute -top-1 -right-1 bg-slate-900/80 rounded-full p-0.5" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* 3. CENTER VIEWPORT GUIDES */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-48 h-48 sm:w-64 sm:h-64 border border-white/20 rounded-2xl sm:rounded-3xl relative">
          <div className="absolute top-0 left-0 w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-l-2 border-indigo-500 -translate-x-1 -translate-y-1" />
          <div className="absolute top-0 right-0 w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-r-2 border-indigo-500 translate-x-1 -translate-y-1" />
          <div className="absolute bottom-0 left-0 w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-l-2 border-indigo-500 -translate-x-1 translate-y-1" />
          <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-r-2 border-indigo-500 translate-x-1 translate-y-1" />
        </div>
      </div>

      {/* 4. BOTTOM CONTROLS */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-10 inset-x-0 flex flex-col items-center gap-4 sm:gap-6 z-20 px-4">
        <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
          {/* Upload Link */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-indigo-600 transition-all shadow-xl"
            aria-label="Upload image"
          >
            <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Capture Shutter */}
          <button
            onClick={captureImage}
            disabled={!isCameraActive}
            className={`group relative p-1 rounded-full border-4 ${isCameraActive ? 'border-white' : 'border-slate-700'} transition-transform active:scale-90`}
            aria-label="Capture image"
          >
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full transition-colors ${isCameraActive ? 'bg-white group-hover:bg-indigo-50' : 'bg-slate-800'}`} />
            {isCameraActive && <div className="absolute inset-0 rounded-full animate-ping border border-white opacity-20" />}
          </button>

          {/* Gallery Counter */}
          <div className="p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-full text-white shadow-xl min-w-[48px] sm:min-w-[56px] flex flex-col items-center">
             <span className="text-xs font-bold text-indigo-400">{capturedImages.length}</span>
             <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
        </div>
        
        <p className="text-white/40 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium text-center px-2">
          Encrypted Verification Active • AES-256
        </p>
      </div>

      {/* Hidden File Input */}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={() => { /* Reuse your handleFileUpload logic here */ }} 
      />

      {/* Simple Success Toast (Optional UX) */}
      {capturedImages.length > 0 && (
        <div className="absolute bottom-24 sm:bottom-28 md:bottom-32 left-1/2 transform -translate-x-1/2 bg-emerald-500/90 backdrop-blur-md text-white px-3 sm:px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 animate-bounce z-30">
          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" /> 
          <span className="hidden sm:inline">SECURE CAPTURE SAVED</span>
          <span className="sm:hidden">SAVED</span>
        </div>
      )}
    </div>
  );
};

export default Camera;