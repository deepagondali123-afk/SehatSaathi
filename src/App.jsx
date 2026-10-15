
import Dashboard from './components/Dashboard';
import ChatbotPage from './components/ChatbotPage';
import { Routes, Route } from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustStrip from './components/TrustStrip';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import EmotionalSupport from './components/EmotionalSupport';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import AuthPage from './components/AuthPage';

function HomePage() {
  return (
    <div className="ss-homepage">
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <Features />
        <HowItWorks />
        <EmotionalSupport />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/chat" element={<ChatbotPage />} />
    </Routes>
  );
}
