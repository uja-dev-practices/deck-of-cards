import React, { useMemo } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '../../config';

// 1. Función auxiliar
const interpolateY = (x, nodes) => {
  if (!nodes || nodes.length === 0) return null;
  const EPSILON = 1e-5;
  const MICRO_STEP = 0.0001;

  const firstX = nodes[0][0];
  const lastX = nodes[nodes.length - 1][0];

  if (x < firstX - MICRO_STEP - EPSILON) return null;
  if (x > lastX + MICRO_STEP + EPSILON) return null;

  if (x < firstX - EPSILON) return 0;
  if (x > lastX + EPSILON) return 0;

  for (let i = nodes.length - 1; i >= 0; i--) {
    if (Math.abs(nodes[i][0] - x) < EPSILON) {
      return nodes[i][1];
    }
  }

  for (let i = 0; i < nodes.length - 1; i++) {
    const x1 = nodes[i][0];
    const x2 = nodes[i + 1][0];
    
    if (Math.abs(x2 - x1) < EPSILON) continue;

    if (x >= x1 && x <= x2) {
      const y1 = nodes[i][1];
      const y2 = nodes[i + 1][1];
      return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
    }
  }
  return null;
};

const Step3FinalGraph = ({ data, criterionName }) => {
  
  // Extracción de Nodos Base
  const sortedResults = useMemo(() => {
    const rawItems = data?.levels || data?.results || [];

    const processed = rawItems.map((item, index) => {
      const isType2 = !!item.lower && !!item.upper;
      const color = CHART_COLORS[index % CHART_COLORS.length] || '#333';
      let termName = item.term || (item.lower && item.lower.term) || `Termino ${index}`;

      if (isType2) {
        const lowerNodes = [...(item.lower.left_nodes || []), ...(item.lower.right_nodes || [])].map(n => [Number(n[0]), Number(n[1])]).sort((a,b)=>a[0]-b[0]);
        const upperNodes = [...(item.upper.left_nodes || []), ...(item.upper.right_nodes || [])].map(n => [Number(n[0]), Number(n[1])]).sort((a,b)=>a[0]-b[0]);
        const coreVal = Array.isArray(item.lower.core) ? Number(item.lower.core[0]) : 0;
        return { ...item, term: termName, isType2, lowerNodes, upperNodes, color, coreVal };
      } else {
        const nodes = [...(item.left_nodes || []), ...(item.right_nodes || [])].map(n => [Number(n[0]), Number(n[1])]).sort((a,b)=>a[0]-b[0]);
        const coreVal = Array.isArray(item.core) ? Number(item.core[0]) : 0;
        return { ...item, term: termName, isType2, nodes, color, coreVal };
      }
    });

    return processed.sort((a, b) => a.coreVal - b.coreVal);
  }, [data]);

  // Generación inteligente de datos
  const denseData = useMemo(() => {
    const xSet = new Set();
    const steps = 1000;
    
    for (let i = 0; i <= steps; i++) {
      xSet.add(Number((i / steps).toFixed(4)));
    }
    
    sortedResults.forEach(item => {
      const addNodes = (nodes) => {
        nodes.forEach(n => {
          const x = n[0];
          xSet.add(Number((x - 0.0001).toFixed(4)));
          xSet.add(Number(x.toFixed(4)));
          xSet.add(Number((x + 0.0001).toFixed(4)));
        });
      };
      if (item.isType2) {
        addNodes(item.lowerNodes);
        addNodes(item.upperNodes);
      } else {
        addNodes(item.nodes);
      }
    });

    const xValues = Array.from(xSet).sort((a, b) => a - b);
        
    const dataPoints = [];
    xValues.forEach(x => {
      const point = { x };
      
      sortedResults.forEach(item => {
        if (item.isType2) {
          const lowerRaw = interpolateY(x, item.lowerNodes);
          const upperRaw = interpolateY(x, item.upperNodes);
          
          point[`${item.term}_lower`] = lowerRaw;
          point[`${item.term}_upper`] = upperRaw;
          
          if (lowerRaw === null && upperRaw === null) {
            point[`${item.term}_range`] = null;
          } else {
            point[`${item.term}_range`] = [lowerRaw !== null ? lowerRaw : 0, upperRaw !== null ? upperRaw : 0];
          }
        } else {
          point[item.term] = interpolateY(x, item.nodes);
        }
      });
      dataPoints.push(point);
    });
    return dataPoints;
  }, [sortedResults]);

  // Tooltip
  const renderCustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload; 
      
      const activeTerms = sortedResults.filter(item => {
        if (item.isType2) {
          return dataPoint[`${item.term}_upper`] !== null && dataPoint[`${item.term}_upper`] > 0;
        } else {
          return dataPoint[item.term] !== null && dataPoint[item.term] > 0;
        }
      });

      if (activeTerms.length === 0) return null;

      return (
        <div className="bg-white p-4 border border-slate-200 shadow-xl rounded-2xl min-w-[200px] animate-fade-in relative z-50">
          <p className="text-slate-800 font-black border-b border-slate-100 pb-2 mb-3 text-sm flex justify-between items-center gap-4">
            <span>Punto X:</span> 
            <span className="text-blue-600">{Number(label).toFixed(3)}</span>
          </p>
          <div className="flex flex-col gap-3">
            {activeTerms.map(item => {
              if (item.isType2) {
                const lower = dataPoint[`${item.term}_lower`] !== null ? dataPoint[`${item.term}_lower`] : 0;
                const upper = dataPoint[`${item.term}_upper`] !== null ? dataPoint[`${item.term}_upper`] : 0;
                const range = Math.abs(upper - lower);

                if (range <= 0.001) {
                  return (
                    <div key={item.term} className="flex flex-col text-xs font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="uppercase font-black mb-1.5" style={{ color: item.color }}>{item.term}</span>
                      <span className="text-slate-600 flex justify-between gap-4">
                        Pertenencia: <b>{Number(upper).toFixed(3)}</b>
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={item.term} className="flex flex-col text-xs font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="uppercase font-black mb-1.5" style={{ color: item.color }}>{item.term}</span>
                    <span className="text-slate-600 flex justify-between gap-4">Mínimo: <b>{Number(lower).toFixed(3)}</b></span>
                    <span className="text-slate-600 flex justify-between gap-4 mt-0.5">Máximo: <b>{Number(upper).toFixed(3)}</b></span>
                    <span className="text-slate-500 font-bold mt-1.5 pt-1.5 border-t border-slate-200 flex justify-between gap-4">
                      Incertidumbre: <span>{Number(range).toFixed(3)}</span>
                    </span>
                  </div>
                );
              } else {
                const val = dataPoint[item.term];
                return (
                  <div key={item.term} className="flex flex-col text-xs font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="uppercase font-black mb-1.5" style={{ color: item.color }}>{item.term}</span>
                    <span className="text-slate-600 flex justify-between gap-4">
                      Pertenencia: <b>{Number(val).toFixed(3)}</b>
                    </span>
                  </div>
                );
              }
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  if (!data || (!data.levels && !data.results)) {
    return <p className="text-center mt-10 text-slate-500">Cargando gráfico final...</p>;
  }

  return (
    <div className="w-full h-[550px] mt-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col final-graph-container">
    
      <style>{`
        .final-graph-container svg * {
          clip-path: none !important;
        }
      `}</style>

      <h3 className="text-2xl font-bold mb-4 text-center text-slate-800">
        {criterionName ? `Criterio: ${criterionName}` : 'Espectro Difuso Final'}
      </h3>
      
      <div className="flex-1 w-full min-h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={denseData} margin={{ top: 15, right: 50, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.5} vertical={false} />
            <XAxis 
              dataKey="x" 
              type="number" 
              domain={[0, 1]} 
              allowDataOverflow={true}
              ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]} 
              tick={{ fill: '#475569', fontWeight: 600, fontSize: 14 }} 
            />
            <YAxis 
              domain={[0, 1]} 
              tickCount={6} 
              tickFormatter={(val) => Number(val.toFixed(2))} 
              tick={{ fill: '#475569', fontSize: 14 }} 
            />
            
            <Tooltip content={renderCustomTooltip} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }} />

            {sortedResults.map((item) => {
              if (item.isType2) {
                return (
                  <React.Fragment key={item.term}>
                    <Area type="linear" dataKey={`${item.term}_range`} fill={item.color} fillOpacity={0.25} stroke="none" isAnimationActive={false} />
                    <Line type="linear" dataKey={`${item.term}_upper`} stroke={item.color} strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 5 }} isAnimationActive={false} />
                    <Line type="linear" dataKey={`${item.term}_lower`} stroke={item.color} strokeWidth={3} dot={false} activeDot={{ r: 7 }} isAnimationActive={false} />
                  </React.Fragment>
                );
              } else {
                return <Line key={item.term} type="linear" dataKey={item.term} stroke={item.color} strokeWidth={4} dot={false} activeDot={{ r: 7 }} isAnimationActive={false} />;
              }
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-6 pb-2">
        {sortedResults.map((item) => (
            <div key={`legend-${item.term}`} className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium uppercase tracking-wide" style={{ color: item.color }}>{item.term}</span>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Step3FinalGraph;