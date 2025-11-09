import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-dvh w-full bg-white text-slate-900 antialiased">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-20 bg-black h-14 flex items-center justify-between px-4 md:px-6 lg:px-10">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#D71920] rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">UT</span>
          </div>
        </Link>

        <div className="text-white font-semibold text-sm md:text-base">
          Universidad del Tolima
        </div>

        <Link
          to="/login"
          className="text-white hover:opacity-80 transition-opacity focus:ring-2 focus:ring-white/60 focus:outline-none px-3 py-2 rounded"
        >
          Iniciar Sesión
        </Link>
      </header>

      {/* Hero Section */}
      <main className="pt-14">
        <div className="min-h-[80vh] flex items-center">
          <div className="mx-auto max-w-screen-2xl px-4 md:px-6 lg:px-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column - Text Content */}
              <div className="lg:col-span-6 xl:col-span-7 space-y-6">
                <h1 className="font-['Great_Vibes'] text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight">
                  Orgullo <span className="font-semibold text-black">Graduado</span>
                </h1>
                <p className="text-base md:text-lg text-slate-700 max-w-prose leading-relaxed">
                  Conecta con tu legado y fortalece el futuro de nuestra comunidad.
                </p>
              </div>

              {/* Right Column - Image */}
              <div className="lg:col-span-6 xl:col-span-5">
                <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] min-h-[400px] lg:min-h-[560px] rounded-l-[120px] md:rounded-l-[140px] lg:rounded-l-[160px] overflow-hidden">
                  <img
                    src="/auditorio-ut.jpg"
                    alt="Auditorio principal de la Universidad del Tolima"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-24 md:w-32 lg:w-40 bg-gradient-to-b from-[#D71920] to-[#ff6b6b] opacity-90 mix-blend-multiply"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;