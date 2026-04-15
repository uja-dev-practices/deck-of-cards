import React from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip } from 'recharts';

export default function Chart({ baseScale, mfDefinitions, selectedTerm, colors }) {
  const scaleKeys = Object.keys(baseScale);

  return (
    <div className="w-full bg-slate-50/50 rounded-2xl border border-slate-200 p-2 mb-6">
      <ResponsiveContainer width="99%" height={320}>
        <ComposedChart margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" dataKey="x" domain={[0, 1]} ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]} tick={{ fill: '#475569', fontWeight: 600, fontSize: 12 }} />
          <YAxis domain={[0, 1]} tick={{ fill: '#475569', fontSize: 12 }} />
          <Tooltip formatter={(value) => typeof value === 'number' ? value.toFixed(2) : value} />

          {scaleKeys.map((name, index) => {
            const val = baseScale[name];
            const mf = mfDefinitions[name];
            if (!mf) return null;
            const color = colors[index % colors.length];
            const isSelected = selectedTerm === name;
            const trapezeData = [ { x: mf.supportStart, y: 0 }, { x: mf.coreStart, y: 1 }, { x: mf.coreEnd, y: 1 }, { x: mf.supportEnd, y: 0 } ];

            return (
              <React.Fragment key={`mf-${name}`}>
                <ReferenceLine x={val} stroke={color} strokeDasharray="4 4" strokeWidth={isSelected ? 2 : 1} label={{ position: 'top', value: name, fill: color, fontWeight: isSelected ? '900' : 'normal', fontSize: 12 }} />
                <ReferenceArea x1={mf.supportStart} x2={mf.supportEnd} fill={color} fillOpacity={isSelected ? 0.3 : 0.05} />
                <ReferenceArea x1={mf.coreStart} x2={mf.coreEnd} fill={color} fillOpacity={isSelected ? 0.6 : 0.15} />
                <Line data={trapezeData} dataKey="y" type="linear" stroke={color} strokeWidth={isSelected ? 4 : 2} dot={isSelected ? { r: 5, fill: color, stroke: '#fff', strokeWidth: 2 } : false} activeDot={false} isAnimationActive={false} />
              </React.Fragment>
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}