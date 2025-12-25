import React, { useState } from "react";
import "./styles/styles.css"
import Camera from "./components/Camera";
import Home from "./components/Home";
import Navbar from "./components/Navbar";

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showNavbar, setShowNavbar] = useState(true);

  const handleAccessCamera = () => {
    setCurrentPage('camera');
    setShowNavbar(false); // Hide navbar initially on Camera page
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setShowNavbar(true); // Show navbar on Home page
  };

  return (
    <>
      {showNavbar && <Navbar onNavigateHome={handleBackToHome} />}
      {currentPage === 'home' ? (
        <Home onAccessCamera={handleAccessCamera} />
      ) : (
        <Camera onBackToHome={handleBackToHome} onNavbarVisibilityChange={setShowNavbar} />
      )}
    </>
  );
}

export default App;
