import React from 'react';

export const Overlay: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none select-none flex flex-col justify-between p-6 md:p-12">
      
      {/* Header / Main Title */}
      <header className="flex flex-col gap-2 animate-fade-in-down">
        <h2 className="text-indigo-400 tracking-[0.2em] font-['Orbitron'] text-xs md:text-sm font-bold uppercase drop-shadow-[0_0_10px_rgba(79,70,229,0.8)]">
          Sistema Alfa Centauri • 1.2G Gravedad
        </h2>
        <h1 className="text-white font-['Orbitron'] text-4xl md:text-6xl lg:text-7xl font-bold uppercase leading-none tracking-tight drop-shadow-lg">
          Nova <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-400 to-emerald-400">
            Terra
          </span>
        </h1>
        <div className="mt-4 max-w-lg border-l-2 border-indigo-500 pl-4 bg-black/40 backdrop-blur-md rounded-r-lg p-3">
          <p className="text-indigo-100 font-['Rajdhani'] text-lg md:text-xl leading-snug font-medium">
            La joya azul y verde. Un mundo de bosques titanes, océanos profundos y dos soles.
          </p>
        </div>
      </header>

      {/* Footer / Call to Action / Data */}
      <footer className="flex flex-col md:flex-row justify-between items-end md:items-end gap-6 animate-fade-in-up">
        
        {/* Planet Lore / Continents */}
        <div className="hidden md:flex flex-col items-end gap-1 text-right text-indigo-200/60 font-['Rajdhani'] text-sm">
            <h4 className="uppercase tracking-widest text-indigo-400 text-xs font-bold">Geografía</h4>
            <span>Continente A: Horizonte Esmeralda</span>
            <span>Continente B: Corazón Salvaje</span>
            <span>Continente C: Espina de los Titanes</span>
        </div>

        {/* Planet Data Grid */}
        <div className="text-right md:text-left pointer-events-auto bg-black/70 backdrop-blur-xl p-5 rounded-lg border border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.15)]">
          <h3 className="text-indigo-300 font-['Orbitron'] text-xs uppercase tracking-widest mb-3 border-b border-indigo-500/30 pb-1">
            Datos Planetarios
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 font-['Rajdhani'] text-gray-300 text-sm md:text-base">
            
            <div className="flex flex-col">
              <span className="text-indigo-400/70 text-[10px] uppercase tracking-wider">Gravedad</span>
              <span className="text-white font-bold text-lg">1.20 G</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-indigo-400/70 text-[10px] uppercase tracking-wider">Atmósfera</span>
              <span className="text-white font-bold text-lg">26% O₂ <span className="text-xs text-indigo-300 font-normal">(Densa)</span></span>
            </div>

            <div className="flex flex-col">
              <span className="text-indigo-400/70 text-[10px] uppercase tracking-wider">Ciclo</span>
              <span className="text-white font-bold text-lg">28h <span className="text-xs text-gray-400">/ 550d</span></span>
            </div>

            <div className="flex flex-col">
              <span className="text-indigo-400/70 text-[10px] uppercase tracking-wider">Sistema</span>
              <span className="text-yellow-100 font-bold text-lg bg-gradient-to-r from-yellow-200 to-orange-400 text-transparent bg-clip-text">Binario</span>
            </div>
            
          </div>
        </div>

        {/* Book Buttons (CTA) */}
        <div className="flex flex-col gap-3 items-end">
          <h3 className="text-indigo-300 font-['Orbitron'] text-[10px] uppercase tracking-widest opacity-80 mb-1 hidden md:block">
            La Saga
          </h3>

          {/* Book I */}
          <a 
            href="https://amzn.eu/d/btdspNY" 
            target="_blank" 
            rel="noopener noreferrer"
            className="pointer-events-auto group relative w-full md:w-auto px-6 py-3 bg-indigo-900/60 border border-indigo-400/50 text-indigo-50 font-['Orbitron'] tracking-widest text-xs uppercase hover:bg-indigo-600/30 transition-all duration-300 backdrop-blur-md overflow-hidden rounded-sm flex items-center justify-end gap-4 shadow-[0_0_15px_rgba(79,70,229,0.2)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]"
          >
            <div className="flex flex-col items-end z-10">
              <span className="text-[9px] text-indigo-300 font-['Rajdhani']">El Valor del Cosmos I</span>
              <span className="font-bold text-white">Hacia la Conquista</span>
            </div>
            <span className="text-lg opacity-70 group-hover:translate-x-1 transition-transform z-10">↗</span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 -z-0 opacity-50"></div>
          </a>

          {/* Book II */}
          <a 
            href="https://amzn.eu/d/hLUcfx2" 
            target="_blank" 
            rel="noopener noreferrer"
            className="pointer-events-auto group relative w-full md:w-auto px-6 py-3 bg-purple-900/60 border border-purple-400/50 text-purple-50 font-['Orbitron'] tracking-widest text-xs uppercase hover:bg-purple-600/30 transition-all duration-300 backdrop-blur-md overflow-hidden rounded-sm flex items-center justify-end gap-4 shadow-[0_0_15px_rgba(147,51,234,0.2)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)]"
          >
            <div className="flex flex-col items-end z-10">
              <span className="text-[9px] text-purple-300 font-['Rajdhani']">El Valor del Cosmos II</span>
              <span className="font-bold text-white">Ecos de lo Desconocido</span>
            </div>
            <span className="text-lg opacity-70 group-hover:translate-x-1 transition-transform z-10">↗</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 -z-0 opacity-50"></div>
          </a>
        </div>
        
      </footer>
    </div>
  );
};