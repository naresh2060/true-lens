import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ShieldCheck, 
  Fingerprint, 
  UploadCloud, 
  CheckCircle2, 
  Cpu, 
  History, 
  Hash,
  AlertCircle,
  XCircle,
  RotateCcw
} from 'lucide-react';

const Verify = () => {
  const [status, setStatus] = useState('idle');
  const [selectedFile, setSelectedFile] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const TargetURL = "https://api.truelens.qzz.io/verifymedia";

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setStatus('idle');
      setVerificationData(null);
      setErrorMessage(null);
    }
  };

  // Reset state to try again
  const handleReset = () => {
    setStatus('idle');
    setVerificationData(null);
    setErrorMessage(null);
  };

  // Verification process
  const handleAuthenticate = async () => {
    if (!selectedFile) {
      return;
    }

    setStatus('verifying');
    setVerificationData(null);
    setErrorMessage(null);
  
    try {
      const formData = new FormData();
      formData.append("media", selectedFile); 
  
      const response = await fetch(TargetURL, {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
      
      if (response.ok && data.success === true) {
        setVerificationData({
          downloadUrl: data.download_url,
          deviceId: data.source_device || "TRUE-LENS-001",
          hash: data.hash || "8f3e...b2a1",
          timestamp: data.timestamp || new Date().toISOString(),
          fileName: data.file_name || selectedFile.name
        });
        setStatus('success');
      } else {
        // Explicit failure state
        setErrorMessage(data.error || 'The hardware signature could not be verified for this media.');
        setStatus('error');
      }
  
    } catch (error) {
      console.error("Network Error:", error);
      setErrorMessage("Authentication server unreachable. Please check your connection.");
      setStatus('error');
    }
  };

  const isIdle = status === 'idle';
  const isVerifying = status === 'verifying';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <div className="min-h-screen bg-slate-50 overflow-y-auto font-sans selection:bg-indigo-100 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 lg:py-12 max-w-7xl mx-auto">
        
        {/* PAGE HEADER */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12 mt-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold tracking-widest uppercase mb-3 sm:mb-4">
            <Fingerprint className="w-4 h-4" /> Hardware Authenticator
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-3 sm:mb-4 px-2">
            Verify Capture <span className="text-indigo-600">Integrity.</span>
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed px-2">
            Upload media captured with True Lens hardware to verify its authenticity and cryptographic lineage.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-stretch">
          
          {/* LEFT COLUMN: INPUT SECTION */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 h-full flex flex-col transition-all duration-300">
            <div className="space-y-4 sm:space-y-6 lg:space-y-8 flex-grow">
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 sm:mb-3">
                  Binary Image Analysis
                </label>
                <div className={`group cursor-pointer relative border-2 border-dashed rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center transition-all duration-300 ${selectedFile ? 'border-indigo-400 bg-indigo-50/10' : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30'}`}>
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform ${selectedFile ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                    <UploadCloud className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base truncate px-4">
                    {selectedFile ? selectedFile.name : 'Drop media to analyze'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Click to change` : 'RAW, PNG, or JPEG captured via True Lens'}
                  </p>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    disabled={isVerifying}
                  />
                </div>
              </div>

              {/* CTA Button */}
              <button 
                onClick={handleAuthenticate}
                disabled={isVerifying || !selectedFile}
                className={`
                  w-full py-3 sm:py-4 lg:py-5 rounded-xl sm:rounded-2xl font-bold tracking-[0.2em] uppercase text-xs sm:text-sm transition-all active:scale-[0.98] 
                  flex items-center justify-center gap-3
                  ${isVerifying 
                    ? 'bg-indigo-500 text-white cursor-wait' 
                    : isError 
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-100'
                      : 'bg-slate-900 hover:bg-indigo-600 text-white shadow-xl shadow-indigo-100 disabled:opacity-30 disabled:hover:bg-slate-900'
                  }
                `}
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Metadata...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authenticate Capture</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: RESULT SECTION */}
          <div className={`h-full flex flex-col transition-all duration-700 ${!isIdle ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-4'}`}>
            <div className={`flex-1 rounded-2xl sm:rounded-3xl p-1 border-2 transition-colors duration-500 
              ${isSuccess ? 'border-emerald-500 bg-emerald-50/30' : 
                isError ? 'border-rose-500 bg-rose-50/30' : 
                'border-slate-200 bg-white'}`}>
              <div className="bg-white rounded-[1.2rem] sm:rounded-[1.4rem] p-4 sm:p-6 lg:p-8 shadow-sm h-full flex flex-col">
                
                {/* Status Header */}
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 lg:mb-10">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 flex-shrink-0 
                    ${isSuccess ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 
                      isError ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 
                      'bg-slate-100 text-slate-300'}`}>
                    {isError ? <XCircle className="w-6 h-6 sm:w-8 sm:h-8" /> : <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" />}
                  </div>
                  <div className="min-w-0">
                    <h2 className={`text-lg sm:text-xl font-black uppercase tracking-tight transition-colors duration-500
                      ${isSuccess ? 'text-emerald-600' : 
                        isError ? 'text-rose-600' : 
                        'text-slate-400'}`}>
                      {isSuccess ? 'Hardware Verified' : isError ? 'Verification Failed' : 'Awaiting Data'}
                    </h2>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {isSuccess ? 'Confirmed Physical Camera Capture' : 
                       isError ? 'Hardware Attestation Rejected' : 
                       'Upload to begin analysis'}
                    </p>
                  </div>
                </div>

                {/* Data Grid */}
                <div className="space-y-2 sm:space-y-3 lg:space-y-4 flex-grow">
                  {/* Fix: Added missing isMono prop to resolve inference error at line 200 */}
                  <DataRow 
                    icon={<Cpu />} 
                    label="Source Device" 
                    value={isSuccess && verificationData ? verificationData.deviceId : "---"} 
                    isMono={false}
                    status={status}
                  />
                  {isSuccess && verificationData?.fileName && (
                    /* Fix: Added missing isMono prop to resolve inference error at line 207 */
                    <DataRow 
                      icon={<ShieldCheck />} 
                      label="File Name" 
                      value={verificationData.fileName} 
                      isMono={false}
                      status={status}
                    />
                  )}
                  {isSuccess && verificationData?.timestamp && (
                    /* Fix: Added missing isMono prop to resolve inference error at line 215 */
                    <DataRow 
                      icon={<History />} 
                      label="Auth Timestamp" 
                      value={new Date(verificationData.timestamp).toLocaleString()} 
                      isMono={false}
                      status={status}
                    />
                  )}
                  <DataRow 
                    icon={<Hash />} 
                    label="Audit Trail Hash" 
                    value={isSuccess && verificationData ? (verificationData.hash || "8f3e...b2a1") : "---"} 
                    isMono 
                    status={status}
                  />
                </div>

                {/* Message & CTA */}
                {(isSuccess || isError) && (
                  <div className="mt-4 sm:mt-6 lg:mt-8 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-start gap-2 sm:gap-3 border transition-colors
                      ${isSuccess ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                      <AlertCircle className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 
                        ${isSuccess ? 'text-emerald-600' : 'text-rose-600'}`} />
                      <p className={`text-[10px] sm:text-[11px] leading-relaxed 
                        ${isSuccess ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isSuccess 
                          ? "Success. This media is confirmed to have originated from a verified physical camera sensor."
                          : (errorMessage || "The uploaded media failed hardware attestation. This could be due to post-processing or synthetic generation.")}
                      </p>
                    </div>
                    
                    {isSuccess && verificationData?.downloadUrl && (
                      <a 
                        href={verificationData.downloadUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full p-3 sm:p-4 bg-indigo-600 rounded-xl sm:rounded-2xl border border-indigo-700 hover:bg-indigo-700 transition-all text-center shadow-lg shadow-indigo-100"
                      >
                        <p className="text-[10px] sm:text-[11px] text-white font-bold uppercase tracking-[0.2em]">
                          Download Certified Copy
                        </p>
                      </a>
                    )}
                    
                    {isError && (
                      <button 
                        onClick={handleReset}
                        className="group w-full p-3 sm:p-4 bg-rose-600 rounded-xl sm:rounded-2xl border border-rose-700 hover:bg-rose-700 transition-all text-center shadow-lg shadow-rose-100 flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-3 h-3 text-white group-hover:rotate-[-45deg] transition-transform" />
                        <p className="text-[10px] sm:text-[11px] text-white font-bold uppercase tracking-[0.2em]">
                          Try Different Capture
                        </p>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Subtle Audit Note */}
            <p className="mt-3 sm:mt-4 text-[9px] sm:text-[10px] text-slate-400 text-center font-medium uppercase tracking-[0.2em] px-2">
              Secured by True Lens Hardware Attestation
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

// Helper Component for the Data Rows
// Fix: Added default value for isMono to make it optional in TypeScript inference
const DataRow = ({ icon, label, value, isMono = false, status }) => {
  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <div className={`group flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300
      ${isSuccess ? 'bg-emerald-50/30 border-emerald-50 hover:bg-white hover:border-emerald-200' : 
        isError ? 'bg-rose-50/30 border-rose-50 hover:bg-white hover:border-rose-200' : 
        'bg-slate-50 border-transparent hover:border-slate-200 hover:bg-white'}`}>
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <div className={`transition-colors duration-300 flex-shrink-0 
          ${isSuccess ? 'text-emerald-500' : 
            isError ? 'text-rose-400' : 
            'text-slate-400 group-hover:text-indigo-500'}`}>
          {React.cloneElement(icon, { size: 16, className: "sm:w-[18px] sm:h-[18px]" })}
        </div>
        <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</span>
      </div>
      <span className={`text-xs sm:text-sm font-bold ml-2 sm:ml-4 text-right truncate max-w-[50%] sm:max-w-none transition-colors duration-300
        ${isMono ? 'font-mono text-[10px] sm:text-xs' : ''}
        ${isSuccess ? 'text-emerald-700' : isError ? 'text-rose-700' : 'text-slate-800'}`}>
        {value}
      </span>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Verify />);
}

export default Verify;