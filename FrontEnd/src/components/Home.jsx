import React from 'react';
import { Camera, ShieldCheck, Video, Github, Twitter, Instagram } from 'lucide-react';

const Home = ({ onAccessCamera }) => {
  return (
    <div className="w-screen min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      
      {/* --- NAVBAR --- */}
     

      {/* --- BODY / HERO SECTION --- */}
      <main className="flex-grow flex items-center justify-center px-4 py-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white">
        <div className="max-w-4xl text-center">
          <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-indigo-600 uppercase bg-indigo-50 rounded-full">
            Securing the world against AI
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight">
            See your world in <br />
            <span className="text-indigo-600">Perfect Clarity.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            True Lens provides professional-grade visual monitoring with end-to-end encryption. 
            Capture, verify, and secure your most important moments with our advanced AI-driven optics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={onAccessCamera}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-xl hover:-translate-y-1"
            >
              <Video className="w-5 h-5" />
              Access your camera
            </button>
            <button className="flex items-center gap-2 bg-white border-2 border-slate-200 hover:border-indigo-600 hover:text-indigo-600 text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-sm">
              <ShieldCheck className="w-5 h-5" />
              Verify
            </button>
          </div>

          {/* Subtle Visual Element */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex flex-col items-center font-bold">4K RESOLUTION</div>
            <div className="flex flex-col items-center font-bold">AI MOTION</div>
            <div className="flex flex-col items-center font-bold">CLOUD SYNC</div>
            <div className="flex flex-col items-center font-bold">AES-256</div>
          </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-slate-800 pb-12">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4 text-white font-bold text-xl">
              <Camera className="w-6 h-6" />
              True Lens
            </div>
            <p className="text-sm leading-relaxed">
              Leading the industry in optical verification and smart security systems since 2024.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-white cursor-pointer transition">Smart Features</li>
              <li className="hover:text-white cursor-pointer transition">Cloud Storage</li>
              <li className="hover:text-white cursor-pointer transition">Enterprise</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-white cursor-pointer transition">About Us</li>
              <li className="hover:text-white cursor-pointer transition">Privacy Policy</li>
              <li className="hover:text-white cursor-pointer transition">Terms of Service</li>
            </ul>
          </div>

          {/* Social Icons */}
          <div className="flex gap-4">
            <Twitter className="w-5 h-5 hover:text-white cursor-pointer" />
            <Instagram className="w-5 h-5 hover:text-white cursor-pointer" />
            <Github className="w-5 h-5 hover:text-white cursor-pointer" />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2025 True Lens Technologies Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Status: All Systems Operational</span>
            <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 animate-pulse"></span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;