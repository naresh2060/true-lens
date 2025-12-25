import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera as CameraIcon, ShieldCheck, Clock, Image as ImageIcon, CheckCircle2, X, CameraOff } from 'lucide-react';
import Alert from './Alert';

const Camera = ({ onNavigateHome }) => {

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
  const [alert, setAlert] = useState(null);

  const triggerAlert = (variant, title, message) => {
    setAlert({ variant, title, message });
  };

  const captureImage = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const TARGET_URL = "https://api.truelens.qzz.io/uploadmedia";
  
    if (!video || !canvas || !stream) {
      triggerAlert('error', 'System Error', 'Camera interface not initialized.');
      return;
    }
  
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;
  
    try {
      const context = canvas.getContext('2d');
      const now = new Date();
      const timestamp = now.getTime();
      const fileName = `TL-AUTH-${timestamp}.png`;
  
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
      const rawPixelData = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const secureHash = await computeRawPixelHash(rawPixelData);
  
      const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      const pngImageFile = new File([pngBlob], fileName, {
        type: 'image/png',
        lastModified: timestamp,
      });
  
      const formData = new FormData();
      formData.append("media", pngImageFile);      
      formData.append("device-id", convertToSlug(cameraName)); 
  
      const response = await fetch(TARGET_URL, {
        method: "POST",
        body: formData, 
      });
  
      // Handle Errors (Flask returns JSON for errors, so we parse as text/json)
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server Error: ${response.status}`);
      }
  
      // --- MODIFIED DOWNLOAD LOGIC START ---
      // 1. Capture the response as a Blob (Binary file)
      const signedBlob = await response.blob();
      
      // 2. Create a local URL for the signed file
      const downloadUrl = window.URL.createObjectURL(signedBlob);
  
      // 3. Trigger direct download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `signed_${fileName}`; // This matches your Flask signed_filename logic
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      // 4. Cleanup memory
      window.URL.revokeObjectURL(downloadUrl);
      // --- MODIFIED DOWNLOAD LOGIC END ---
  
      const displayUrl = URL.createObjectURL(pngImageFile);
      const imageObject = {
        id: timestamp,
        rawPixels: rawPixelData,
        pngFile: pngImageFile,
        hash: secureHash,
        serverUrl: null, // Set to null as file was streamed directly
        displayUrl: displayUrl,
        fileName: fileName,
        dateTime: now.toLocaleString()
      };
  
      setCapturedImages((prev) => [imageObject, ...prev]);
      
      triggerAlert('success', 'Secure Capture Saved', 'Media hash verified and recorded on protocol.');
  
      const metaOnly = { ...imageObject, rawPixels: null, pngFile: null };
      localStorage.setItem('last_verified_capture', JSON.stringify(metaOnly));
  
    } catch (error) {
      console.error("Capture/Upload Process Failed:", error);
      triggerAlert('error', 'Authentication Failed', error.message);
    }
  };

  const convertToSlug = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const downloadFileFromUrl = (fileUrl, customName = 'truelens-capture.png') => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', customName); // Attempt to force download
    link.setAttribute('target', '_blank');    // Fallback: open in new tab if download fails
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
  
  
  
  const computeRawPixelHash = async (uint8Array) => {
    const hashBuffer = await crypto.subtle.digest('SHA-256', uint8Array);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

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
        triggerAlert('warning', 'Camera Error', 'Could not access the physical camera module.');
      }
    };
    startCamera();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, [isCameraEnabled]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-GB'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'c' || event.key === 'C') {
        event.preventDefault();
        toggleCamera();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleCamera]);

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden font-sans">
      
      {alert && (
        <Alert 
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

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
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white shadow-2xl w-full sm:w-auto">
          <button 
            onClick={onNavigateHome}
            className="flex items-center gap-2 sm:gap-3 mb-1 cursor-pointer hover:opacity-80 transition-opacity w-full text-left bg-transparent border-none p-0"
          >
            <CameraIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            <span className="font-bold tracking-wider uppercase text-xs sm:text-sm">True Lens // Live Feed</span>
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs text-slate-300 font-mono uppercase tracking-tighter truncate max-w-[200px] sm:max-w-none">
              {isCameraActive ? cameraName : 'System Standby'}
            </span>
          </div>
        </div>

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
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-indigo-600 transition-all shadow-xl"
            aria-label="Upload image"
          >
            <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={captureImage}
            disabled={!isCameraActive}
            className={`group relative p-1 rounded-full border-4 ${isCameraActive ? 'border-white' : 'border-slate-700'} transition-transform active:scale-90`}
            aria-label="Capture image"
          >
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full transition-colors ${isCameraActive ? 'bg-white group-hover:bg-indigo-50' : 'bg-slate-800'}`} />
            {isCameraActive && <div className="absolute inset-0 rounded-full animate-ping border border-white opacity-20" />}
          </button>

          <div className="p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-full text-white shadow-xl min-w-[48px] sm:min-w-[56px] flex flex-col items-center">
             <span className="text-xs font-bold text-indigo-400">{capturedImages.length}</span>
             <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
        </div>
        
        <p className="text-white/40 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium text-center px-2">
          Encrypted Verification Active • SHA-256
        </p>
      </div>

      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
             triggerAlert('info', 'File Analysis', 'Media selected. Authenticate through the portal.');
          }
        }} 
      />
    </div>
  );
};

export default Camera;