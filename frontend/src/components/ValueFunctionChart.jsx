import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ValueFunctionChart({ result }) {
    if (!result) return null;

  return (
    <div className="w-full max-w-4xl mt-12 p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
        <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center">
            Función de Valor: {result.criterion_name}
        </h3>
      
        <div className="w-full mt-4">
            <ResponsiveContainer width="100%" height={400}>
            <LineChart
                data={Object.entries(result.values).map(([label, value]) => ({
                nombre: label,
                valor: value
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="nombre" tick={{ fill: '#475569', fontWeight: 600 }} dy={10} />
                <YAxis domain={[0, 1]} tick={{ fill: '#475569' }} dx={-10} />
                <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [value.toFixed(4), 'Valor DoC']}
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                />
                <Line
                    type="monotone"
                    dataKey="valor"
                    stroke="#2563eb"
                    strokeWidth={4}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                    dot={{ r: 6, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                    animationDuration={1500}
                />
            </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
}