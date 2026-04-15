export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto shrink-0 w-full pt-8 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6">
          
          {/* Proyecto */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl font-black text-slate-800 tracking-tight">Deck of Cards</span>
              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-md">
                Software Científico
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
              Plataforma web para la elicitación de escalas de valor y construcción de conjuntos difusos interpretables (DoC-MF).
            </p>
          </div>

          {/* Desarrollo */}
          <div className="lg:col-span-3 flex flex-col">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Ingeniería y Desarrollo</h4>
            <ul className="text-sm font-bold text-slate-700 space-y-2">
              <li className="flex flex-wrap items-center gap-2">
                Alexis López Moral 
                <span className="text-slate-400 font-medium text-[10px] font-mono bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">Frontend</span>
              </li>
              <li className="flex flex-wrap items-center gap-2">
                Mireya Cueto Garrido 
                <span className="text-slate-400 font-medium text-[10px] font-mono bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">Backend</span>
              </li>
            </ul>
          </div>

          {/* Dirección Científica */}
          <div className="lg:col-span-2 flex flex-col">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Dirección Científica</h4>
            <p className="text-sm font-bold text-slate-700">Luis Martínez López</p>
          </div>

          {/* Enlaces Institucionales y Código */}
          <div className="lg:col-span-3 flex flex-col gap-5 sm:items-start lg:items-end">
            
            {/* Universidad de Jaén */}
            <a 
              href="https://www.ujaen.es/" 
              target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-3 w-fit"
              title="Ir a la web oficial de la Universidad de Jaén"
            >
              <div className="text-right border-r-2 border-slate-300 group-hover:border-blue-600 pr-3 flex flex-col justify-center h-9 transition-colors">
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none mb-1">Universidad</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] leading-none">de Jaén</span>
              </div>
              <img 
                src="/uja-logo.png" 
                alt="Logo UJA" 
                className="w-9 h-9 object-contain grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100" 
              />
            </a>

            {/* Repositorio GitHub */}
            <a 
              href="https://github.com/alexislopez-dev/deck-of-cards"
              target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-3 w-fit"
              title="Ver código fuente en GitHub"
            >
              <div className="text-right border-r-2 border-slate-300 group-hover:border-slate-800 pr-3 flex flex-col justify-center h-9 transition-colors">
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none mb-1">Repositorio</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] leading-none">Oficial</span>
              </div>
              <svg className="w-9 h-9 text-slate-400 group-hover:text-slate-800 transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>

          </div>
        </div>

        {/* Sub-Footer: Copyright y Referencia Científica */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
            © {new Date().getFullYear()} Deck of Cards App.
          </p>
          <p className="text-[10px] font-medium text-slate-400 text-center md:text-right">
            Basado en la metodología DoC-MF propuesta por D. García-Zamora, B. Dutta, J.R. Figueira y L. Martínez (EJOR, 2024).
          </p>
        </div>

      </div>
    </footer>
  );
}