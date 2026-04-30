import React, { useState, useEffect, memo } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useGraphData } from './finalGraph/useGraphData';
import { GraphTooltip } from './finalGraph/GraphTooltip';
import { MembershipEvaluator } from './finalGraph/MembershipEvaluator';

const Step3FinalGraph = memo(({ data, criterionName }) => {
  const { sortedResults, denseData } = useGraphData(data);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  if (!data || (!data.levels && !data.results)) {
    return <p className="text-center mt-10 text-slate-500">Cargando datos...</p>;
  }

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col final-graph-container relative">
      <style>{`.final-graph-container svg * { clip-path: none !important; }`}</style>

      <h3 className="text-xl font-bold mb-4 text-center text-slate-800 uppercase shrink-0">
        {criterionName ? `Criterio: ${criterionName}` : 'Espectro Difuso Final'}
      </h3>

      <div className="w-full h-[400px] relative shrink-0">

        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-3"></div>
            <span className="text-sm font-semibold text-slate-400">Generando gráfica...</span>
          </div>
        )}

        <div className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isReady ? 'opacity-100' : 'opacity-0'}`}>
          {isReady && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={denseData} margin={{ top: 15, right: 50, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.5} vertical={false} />
                <XAxis
                  dataKey="x" type="number" domain={[0, 1]} allowDataOverflow={true}
                  ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]}
                  tick={{ fill: '#475569', fontWeight: 600, fontSize: 14 }}
                />
                <YAxis
                  domain={[0, 1]} tickCount={6} tickFormatter={(val) => Number(val.toFixed(2))}
                  tick={{ fill: '#475569', fontSize: 14 }}
                />
                <Tooltip
                  content={<GraphTooltip sortedResults={sortedResults} />}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }}
                  isAnimationActive={false}
                />
                {sortedResults.map((item) => (
                  <React.Fragment key={item.term}>
                    {item.isType2 ? (
                      <>
                        <Area type="linear" dataKey={`${item.term}_range`} fill={item.color} fillOpacity={0.25} stroke="none" isAnimationActive={false} />
                        <Line type="linear" dataKey={`${item.term}_upper`} stroke={item.color} strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                        <Line type="linear" dataKey={`${item.term}_lower`} stroke={item.color} strokeWidth={3} dot={false} isAnimationActive={false} />
                      </>
                    ) : (
                      <Line type="linear" dataKey={item.term} stroke={item.color} strokeWidth={4} dot={false} isAnimationActive={false} />
                    )}
                  </React.Fragment>
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-5 relative z-10 shrink-0">
        {sortedResults.map((item) => (
          <div key={`legend-${item.term}`} className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
            <span className="text-sm font-medium uppercase tracking-wide" style={{ color: item.color }}>{item.term}</span>
          </div>
        ))}
      </div>

      {/* Evaluador Manual */}
      {isReady && sortedResults.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 relative z-10">
          <MembershipEvaluator sortedResults={sortedResults} />
        </div>
      )}
    </div>
  );
});

export default Step3FinalGraph;