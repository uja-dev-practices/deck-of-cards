import React, { useState, useEffect, useRef } from 'react';
import CriterionInput from '../CriterionInput';
import CardEditor from '../CardEditor';
import BlankCardsCounter from '../BlankCardsCounter';
import AddLevelButton from '../AddLevelButton';

export default function Step1BaseScale({
  criterionName, handleCriterionChange,
  levels, handleLevelChange, handleAddLevel, handleRemoveLevel,
  blankCards, handleBlankCardChange,
  errors, handleGenerateBaseScale, isLoading
}) {
  const [isZoomActive, setIsZoomActive] = useState(true);
  const containerRef = useRef(null);
  const tableRef = useRef(null);
  const [dimensions, setDimensions] = useState({ container: 1000, table: 0 });

  useEffect(() => {
    const updateMeasurements = () => {
      if (containerRef.current && tableRef.current) {
        setDimensions({
          container: containerRef.current.offsetWidth,
          table: tableRef.current.scrollWidth
        });
      }
    };
    const timeoutId = setTimeout(updateMeasurements, 50);
    window.addEventListener('resize', updateMeasurements);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateMeasurements);
    };
  }, [levels, blankCards]);

  const needsZoom = dimensions.table > dimensions.container;
  const dynamicScale = needsZoom ? (dimensions.container / dimensions.table) * 0.95 : 1;
  const currentScale = isZoomActive && needsZoom ? dynamicScale : 1;

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center animate-fade-in relative overflow-visible">
        
        <div className="flex justify-between items-center w-full mb-4 border-b pb-3 relative z-30">
            <h2 className="text-xl font-bold text-slate-800">
                Paso 1: Escala de Referencia (Mesa)
            </h2>
            {needsZoom && (
            <button 
                onClick={() => {
                if (containerRef.current) containerRef.current.scrollLeft = 0;
                    setIsZoomActive(!isZoomActive);
                }} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm border text-sm ${isZoomActive ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}
            >
                <span>{isZoomActive ? '🔍' : '🖼️'}</span>
                {isZoomActive ? 'Ver de cerca (Scroll)' : 'Ajustar mesa'}
            </button>
            )}
        </div>

        <CriterionInput criterionName={criterionName} setCriterionName={handleCriterionChange} error={errors.criterion} />
        
        <div ref={containerRef} className={`w-full mt-2 transition-all relative ${!isZoomActive && needsZoom ? 'overflow-x-auto flex justify-start pb-12 pt-4 px-4 custom-scrollbar' : 'overflow-visible flex justify-center pb-12 pt-4'}`}>
            <div className={`flex flex-row items-start min-w-max transition-transform duration-500 ease-out px-4 origin-top`} style={{ transform: `scale(${currentScale})`, marginBottom: isZoomActive && currentScale < 1 ? `-${(1 - currentScale) * 300}px` : '0px' }}>
            
                <div ref={tableRef} className="flex flex-row items-start relative px-10 overflow-visible">
                    {levels.map((level, index) => (
                    <React.Fragment key={index}>
                        
                        {/* CARTA DE NIVEL */}
                        <div className="flex flex-col items-center mx-2 relative z-20">
                            <CardEditor index={index} level={level} handleLevelChange={handleLevelChange} handleRemoveLevel={handleRemoveLevel} totalLevels={levels.length} error={errors.levels[index]} canRemove={levels.length > 3} />
                        </div>

                        {/* HUECO ENTRE CARTAS Y CONTADOR */}
                        {index < levels.length - 1 && (
                        <div className="flex flex-col items-center justify-start mx-1 relative min-w-[120px]">
                            <div className="absolute w-[calc(100%+2rem)] h-1 bg-slate-200 top-[80px] -translate-y-1/2 z-0"></div>
                            
                            <div className="mt-[60px] flex flex-col items-center relative z-10 w-full">
                                <BlankCardsCounter index={index} blankCardsCount={blankCards[index]} handleBlankCardChange={handleBlankCardChange} />
                            </div>
                        </div>
                        )}
                    </React.Fragment>
                    ))}
                    
                    {/* LÍNEA HACIA EL BOTÓN DE AÑADIR */}
                    <div className="flex flex-col items-center justify-start relative min-w-[40px]">
                        <div className="absolute w-full h-1 bg-slate-200 top-[80px] -translate-y-1/2 z-0 rounded"></div>
                    </div>

                    {/* BOTÓN AÑADIR NIVEL */}
                    <div className="flex flex-col items-center mx-2 relative z-20">
                        <AddLevelButton handleAddLevel={handleAddLevel} />
                    </div>

                </div>

            </div>
        </div>
        
        {/* Generar Gráfica Continua */}
        <div className="w-full max-w-lg mt-8 pt-6 border-t border-slate-200 flex flex-col items-center z-20 relative bg-white">
            <button onClick={handleGenerateBaseScale} disabled={isLoading} className={`w-full py-3 text-white text-lg font-bold rounded-xl shadow-md transition-all active:scale-[0.98] ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}>
            {isLoading ? 'Calculando...' : 'Generar Gráfica Continua'}
            </button>
        </div>
    </div>
  );
}