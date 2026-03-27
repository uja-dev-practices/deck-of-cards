import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { CHART_COLORS } from '../../config';

const Step3FinalGraph = ({ data }) => {
  if (!data || !data.results) return <p>Cargando gráfico final...</p>;

  const resultsWithOriginalIndex = data.results.map((item, index) => ({
    ...item,
    originalIndex: index
  }));

  const sortedResults = [...resultsWithOriginalIndex].sort((a, b) => {
    const valA = a.core ? a.core[0] : 0;
    const valB = b.core ? b.core[0] : 0;
    return valA - valB;
  });

  return (
    <div className="w-full h-[500px] mt-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-2xl font-bold mb-8 text-center text-slate-800">Espectro Difuso Final</h3>
      
      <ResponsiveContainer width="100%" height="90%">
        <LineChart margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
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
            formatter={(value, name) => [value.toFixed(3), name]}
            labelFormatter={(label) => `X: ${Number(label).toFixed(3)}`}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          
          <Legend 
            wrapperStyle={{ paddingTop: '30px' }} 
            iconType="circle"
            payload={sortedResults.map(item => ({
              id: item.term,
              type: 'circle',
              value: item.term.toUpperCase(),
              color: CHART_COLORS[item.originalIndex % CHART_COLORS.length]
            }))}
          />

          {sortedResults.map((item) => {
            const lineData = [...item.left_nodes, ...item.right_nodes].map(node => ({
              x: node[0],
              y: node[1]
            }));

            return (
              <Line
                key={item.term}
                data={lineData}
                type="linear"
                dataKey="y"
                name={item.term.toUpperCase()}
                stroke={CHART_COLORS[item.originalIndex % CHART_COLORS.length]}
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
  );
};

export default Step3FinalGraph;