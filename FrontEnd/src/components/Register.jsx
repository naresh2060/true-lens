
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Cpu, 
  ArrowRight, 
  Info, 
  Smartphone,
  Camera
} from 'lucide-react';
import Alert from './Alert';

const Register = ({ onNavigateHome }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cameraName, setCameraName] = useState('Detecting Hardware...');
  const [deviceName, setDeviceName] = useState('');
  const [alert, setAlert] = useState(null);

  const API_BASE_URL = "https://api.truelens.qzz.io";

  const triggerAlert = (variant, title, message) => {
    setAlert({ variant, title, message });
  };

  const getCameraName = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      const name = mediaStream.getVideoTracks()[0]?.label || 'Standard True Lens Module';
      mediaStream.getTracks().forEach(track => track.stop());
      return name;
    } catch (error) {
      return 'TL-GEN3-HW-MODULE';
    }
  };


  // Slug Converter
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

  useEffect(() => {
    const fetchCameraName = async () => {
      const name = await getCameraName();
      setCameraName(name);
    };
    fetchCameraName();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("device_name", convertToSlug(deviceName));
      formData.append("hardware_id", convertToSlug(cameraName));

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setIsSuccess(true);
      } else {
        triggerAlert('error', 'Registration Error', data.error || 'Failed to register the hardware signature.');
      }
    } catch (error) {
      triggerAlert('error', 'Authentication Error', 'Could not establish a connection to the Authentication Server.');
    } finally {
      setIsSubmitting(false);
    }
    setDeviceName('');
    //  document.getElementById("device_Name").value="";
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 animate-in zoom-in duration-500">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-100 text-center border border-slate-100">
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Sync Successful</h2>
          <p className="text-slate-500 mb-8 leading-relaxed text-sm">Hardware ID <b className="text-slate-900">{cameraName}</b> is now provisioned and secure on the True Lens network.</p>
          <button 
            onClick={onNavigateHome}
            className="inline-flex items-center justify-center w-full bg-slate-900 text-white py-4 rounded-2xl font-bold tracking-widest uppercase text-sm hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            Go to Home Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {alert && (
        <Alert 
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      
      <nav className="p-6">
        <button onClick={onNavigateHome} className="flex items-center gap-2 font-black text-slate-900 tracking-tight text-xl hover:opacity-70 transition-opacity">
          True<span className="text-indigo-600">Lens</span>
        </button>
      </nav>
      <main className="flex-grow flex items-center justify-center p-4 md:p-10">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden border border-white">
          <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-900 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-6 border border-indigo-500/30">
                Secure Provisioning
              </div>
              <h1 className="text-4xl font-extrabold leading-tight mb-4 text-white">
                Hardware <br /> 
                <span className="text-indigo-400 font-mono">Activation.</span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs"> Link your physical capture module to the True Lens network to start certifying media integrity. </p>
            </div>
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-indigo-900/40 rounded-full blur-[80px]" />
          </div>

          <div className="p-8 md:p-14 bg-white">
            <div className="mb-10">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Register Device</h2>
              <p className="text-slate-400 text-sm mt-1">Bind your hardware signature to a friendly name.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Device Name</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                  id='device_Name'
                    required 
                    type="text" 
                    value={deviceName} 
                    onChange={(e) => setDeviceName(e.target.value)} 
                    placeholder="e.g. Field Camera 01" 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm font-semibold text-slate-900 placeholder:text-slate-300" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Hardware ID (Detected)</label>
                <div className="relative">
                  <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required 
                    type="text" 
                    readOnly 
                    value={cameraName} 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-mono tracking-wider text-slate-600 cursor-not-allowed" 
                  />
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                <Info className="w-4 h-4 text-indigo-500 mt-0.5" />
                <p className="text-[11px] text-indigo-700/70 leading-relaxed italic"> This hardware ID will be used as the source for all future media verifications. </p>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full group bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-bold tracking-[0.15em] uppercase text-xs shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? 'Registering...' : (<>Initialize Registration <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>)}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
