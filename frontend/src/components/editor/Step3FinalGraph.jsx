import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '../../config';

const Step3FinalGraph = ({ data }) => {
  const sortedResults = useMemo(() => {
    if (!data || !data.results) return [];

    const withPermanentColors = data.results.map((item, index) => ({
      ...item,
      color: CHART_COLORS[index % CHART_COLORS.length]
    }));

    return withPermanentColors.sort((a, b) => {
      const coreA = Array.isArray(a.core) ? Number(a.core[0]) : 0;
      const coreB = Array.isArray(b.core) ? Number(b.core[0]) : 0;
      return coreA - coreB;
    });
  }, [data]);

  if (!data || !data.results) {
    return <p className="text-center mt-10 text-slate-500">Cargando gráfico final...</p>;
  }

  return (
    <div className="w-full h-[550px] mt-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
      <h3 className="text-2xl font-bold mb-4 text-center text-slate-800">Espectro Difuso Final</h3>
      
      {/* Gráfica */}
      <div className="flex-1 w-full min-h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.5} vertical={false} />
            <XAxis 
              dataKey="x" 
              type="number" 
              domain={[0, 1]}
              tickCount={11}
              tick={{ fill: '#475569', fontWeight: 600, fontSize: 14 }}
              allowDuplicatedCategory={false}
            />
            <YAxis 
              domain={[0, 1]} 
              tickCount={6} 
              tick={{ fill: '#475569', fontSize: 14 }}
            />
            <Tooltip 
              formatter={(value, name) => [Number(value).toFixed(3), name]}
              labelFormatter={(label) => `X: ${Number(label).toFixed(3)}`}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />

            {sortedResults.map((item) => {
              const lineData = [...(item.left_nodes || []), ...(item.right_nodes || [])].map(node => ({
                x: Number(node[0]),
                y: Number(node[1])
              }));

              return (
                <Line
                  key={item.term}
                  data={lineData}
                  type="linear"
                  dataKey="y"
                  name={item.term.toUpperCase()}
                  stroke={item.color} 
                  strokeWidth={4}
                  dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 8 }}
                  isAnimationActive={true}
                  animationDuration={1500}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-6 pb-2">
        {sortedResults.map((item) => (
            <div key={`legend-${item.term}`} className="flex items-center gap-2">
                
                <span 
                    className="w-3.5 h-3.5 rounded-full shadow-sm"
                    style={{ backgroundColor: item.color }} 
                />

                <span 
                    className="text-sm font-medium uppercase tracking-wide" 
                    style={{ color: item.color }}
                    >
                    {item.term}
                </span>
            </div>
        ))}
      </div>

    </div>
  );
};

export default Step3FinalGraph;