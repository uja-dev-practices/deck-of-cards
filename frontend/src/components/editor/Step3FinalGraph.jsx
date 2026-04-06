import React, { useMemo } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '../../config';

const Step3FinalGraph = ({ data, criterionName }) => {
  const sortedResults = useMemo(() => {
    const rawItems = data?.levels || data?.results || [];

    const processed = rawItems.map((item, index) => {
      const isType2 = !!item.lower && !!item.upper;
      const color = CHART_COLORS[index % CHART_COLORS.length] || '#333';

      let lineData = [];
      let coreVal = 0;
      let termName = item.term || (item.lower && item.lower.term) || `Termino ${index}`;

      if (isType2) {
        const lowerNodes = [...(item.lower.left_nodes || []), ...(item.lower.right_nodes || [])];
        const upperNodes = [...(item.upper.left_nodes || []), ...(item.upper.right_nodes || [])];

        lineData = lowerNodes.map((lNode, i) => {
          const uNode = upperNodes[i];
          const lowerY = Number(lNode[1]);
          const upperY = Number(uNode ? uNode[1] : lNode[1]);
          return { x: Number(lNode[0]), lowerY, upperY, range: [lowerY, upperY] };
        });
        coreVal = Array.isArray(item.lower.core) ? Number(item.lower.core[0]) : 0;
      } else {
        const nodes = [...(item.left_nodes || []), ...(item.right_nodes || [])];
        lineData = nodes.map(node => ({ x: Number(node[0]), y: Number(node[1]) }));
        coreVal = Array.isArray(item.core) ? Number(item.core[0]) : 0;
      }

      return { ...item, term: termName, isType2, lineData, color, coreVal };
    });

    return processed.sort((a, b) => a.coreVal - b.coreVal);
  }, [data]);

  if (!data || (!data.levels && !data.results)) {
    return <p className="text-center mt-10 text-slate-500">Cargando gráfico final...</p>;
  }

  return (
    <div className="w-full h-[550px] mt-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">

      {/* Título */}
      <h3 className="text-2xl font-bold mb-4 text-center text-slate-800">
        {criterionName ? `Criterio: ${criterionName}` : 'Espectro Difuso Final'}
      </h3>
      
      {/* Gráfica */}
      <div className="flex-1 w-full min-h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.5} vertical={false} />
            <XAxis 
              dataKey="x" type="number" domain={[0, 1]} tickCount={11}
              tick={{ fill: '#475569', fontWeight: 600, fontSize: 14 }} allowDuplicatedCategory={false}
            />
            <YAxis domain={[0, 1]} tickCount={6} tick={{ fill: '#475569', fontSize: 14 }} />
            <Tooltip 
              formatter={(value, name) => Array.isArray(value) ? [`[${Number(value[0]).toFixed(3)}, ${Number(value[1]).toFixed(3)}]`, name] : [Number(value).toFixed(3), name]}
              labelFormatter={(label) => `X: ${Number(label).toFixed(3)}`}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />

            {sortedResults.map((item) => {
              if (item.isType2) {
                return (
                  <React.Fragment key={item.term}>
                    <Area data={item.lineData} type="linear" dataKey="range" name={`${item.term.toUpperCase()} (Incertidumbre)`} fill={item.color} fillOpacity={0.25} stroke="none" isAnimationActive={true} animationDuration={1500} />
                    <Line data={item.lineData} type="linear" dataKey="upperY" name={`${item.term.toUpperCase()} (Máx)`} stroke={item.color} strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 6 }} isAnimationActive={true} animationDuration={1500} />
                    <Line data={item.lineData} type="linear" dataKey="lowerY" name={`${item.term.toUpperCase()} (Mín)`} stroke={item.color} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8 }} isAnimationActive={true} animationDuration={1500} />
                  </React.Fragment>
                );
              } else {
                return <Line key={item.term} data={item.lineData} type="linear" dataKey="y" name={item.term.toUpperCase()} stroke={item.color} strokeWidth={4} dot={{ r: 5, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8 }} isAnimationActive={true} animationDuration={1500} />;
              }
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda */}
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