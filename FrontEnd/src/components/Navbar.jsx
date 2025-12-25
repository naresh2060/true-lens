import React from 'react'
import { Camera } from 'lucide-react'

function Navbar({ onNavigateHome }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="flex justify-between items-center h-16">
    {/* Brand Name */}
    <div 
      onClick={onNavigateHome}
      className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
    >
      <Camera className="w-8 h-8 text-indigo-600" />
      <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
        True Lens
      </span>
    </div>

    {/* Nav Button */}
    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full font-medium transition-all duration-200 shadow-lg shadow-indigo-200 active:scale-95">
      Register your camera
    </button>
  </div>
</div>
</nav>
  )
}

export default Navbar
