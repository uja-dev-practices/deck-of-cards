import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ComposedChart, Area, Line,
  XAxis, YAxis, CartesianGrid,
  ReferenceArea, ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

// ── Fake demo data ──────────────────────────────────────────────────────────

const STEP1_CARDS  = ['Bajo', 'Medio', 'Alto', 'Perfecto'];
const STEP1_BLANKS = [3, 1, 4]; // huecos asimétricos entre cartas

const STEP2_TERMS = [
  { name: 'Bajo',          xVal: 0.08, mf: { supportStart: 0.00, coreStart: 0.00, coreEnd: 0.06, supportEnd: 0.30 } },
  { name: 'Medio',         xVal: 0.38, mf: { supportStart: 0.18, coreStart: 0.38, coreEnd: 0.38, supportEnd: 0.59 } }, // pico/triángulo
  { name: 'Alto',          xVal: 0.65, mf: { supportStart: 0.52, coreStart: 0.60, coreEnd: 0.69, supportEnd: 0.77 } },
  { name: 'Perfecto', xVal: 0.92, mf: { supportStart: 0.74, coreStart: 0.88, coreEnd: 1.00, supportEnd: 1.00 } },
];
const STEP2_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];

// Igual que interpolateY en useGraphData.js:
//   · Zona buffer justo fuera del soporte → 0   (ancla la línea en y=0)
//   · Más allá del buffer                → null (corte, sin línea horizontal)
const TRAP_BUF = 1.1e-4;
function trapVal(x, s0, c0, c1, s1) {
  if (x < s0 - TRAP_BUF || x > s1 + TRAP_BUF) return null;
  if (x < s0 || x > s1) return 0;
  if (x >= c0 && x <= c1) return 1;
  if (x < c0 && c0 > s0) return (x - s0) / (c0 - s0);
  if (x > c1 && s1 > c1) return (s1 - x) / (s1 - c1);
  return 0;
}

// Solo 'Alto' es IT2 (tiene subescala). UMF más ancha; LMF con el mismo núcleo trapecial que el paso 2.
const STEP3_TERMS = [
  { name: 'Bajo',          color: '#ef4444', type: 't1', pts: [0.00, 0.00, 0.06, 0.30] },
  { name: 'Medio',         color: '#f59e0b', type: 't1', pts: [0.18, 0.38, 0.38, 0.59] },
  { name: 'Alto',          color: '#10b981', type: 't2', u: [0.49, 0.57, 0.71, 0.81], l: [0.56, 0.60, 0.69, 0.76] },
  { name: 'Perfecto',      color: '#3b82f6', type: 't1', pts: [0.74, 0.88, 1.00, 1.00] },
];

// Puntos clave del trapecio (piezas lineales → basta con vértices, como en el paso 2).
// Recharts interpola el trazo entre ellos con animación fluida.
function getTermLineData(term) {
  const name = term.name;

  if (term.type === 't1') {
    const [s0, c0, c1, s1] = term.pts;
    const xs = new Set([s0, c0, c1, s1]);
    if (s0 <= 0.001) xs.add(s0 - TRAP_BUF);
    if (s1 >= 0.999) xs.add(s1 + TRAP_BUF);
    return Array.from(xs).sort((a, b) => a - b).map(x => ({
      x,
      [name]: trapVal(x, s0, c0, c1, s1),
    }));
  }

  const xs = new Set([...term.u, ...term.l]);
  return Array.from(xs).sort((a, b) => a - b).map(x => {
    const upper = trapVal(x, ...term.u);
    const lower = trapVal(x, ...term.l);
    return {
      x,
      [`${name}_upper`]: upper,
      [`${name}_lower`]: lower,
      [`${name}_range`]: (lower === null && upper === null)
        ? null
        : [lower ?? 0, upper ?? 0],
    };
  });
}

const STEP_LABELS = [
  { n: 1, label: 'Escala' },
  { n: 2, label: 'Modelado' },
  { n: 3, label: 'Espectro IT2' },
];

// ── Step sub-components ─────────────────────────────────────────────────────

function Step1Content({ count }) {
  const done = count >= STEP1_CARDS.length;
  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 py-2">
      <p className="text-[11px] font-bold text-blue-500 self-start">Criterio: Calidad Investigadora</p>
      <div className="flex items-center justify-center">
        {STEP1_CARDS.map((name, i) => (
          <React.Fragment key={name}>
            {i > 0 && (
              <div className="flex flex-col items-center mx-1 mb-9">
                <div className={`h-px w-10 transition-all duration-500 ${i < count ? 'bg-slate-300' : 'bg-slate-100'}`} />
                <span className={`text-[10px] font-bold mt-1 transition-all duration-500 ${i < count ? 'text-slate-400' : 'text-slate-100'}`}>
                  ×{STEP1_BLANKS[i - 1]}
                </span>
              </div>
            )}
            <div
              style={{
                opacity: i < count ? 1 : 0,
                transform: i < count ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.85)',
                transition: 'opacity 0.4s ease, transform 0.4s ease',
              }}
            >
              <div className={`w-20 h-28 bg-white border-2 rounded-2xl shadow-sm flex flex-col items-center justify-center relative transition-all duration-300 ${i === count - 1 ? 'border-blue-300 shadow-blue-100 shadow-md' : 'border-slate-200'}`}>
                <span className="absolute top-1.5 left-2.5 text-[10px] font-black text-slate-200">{i + 1}</span>
                <span className="absolute bottom-1.5 right-2.5 text-[10px] font-black text-slate-200 rotate-180">{i + 1}</span>
                <span className="text-xs font-bold text-slate-700 text-center px-1.5 leading-tight">{name}</span>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div className={`flex items-center justify-center gap-2.5 transition-all duration-500 ${done ? 'opacity-100' : 'opacity-0'}`}>
        <span className="text-xs font-bold text-emerald-600">✓ {STEP1_CARDS.length} niveles definidos</span>
        <div className="h-1.5 w-24 rounded-full bg-emerald-100">
          <div className="h-1.5 rounded-full bg-emerald-500 w-full" />
        </div>
      </div>
    </div>
  );
}

function Step2Content({ count }) {
  const visibleTerms = STEP2_TERMS.slice(0, count);
  const activeIndex = count - 1;
  const showSubscale = count >= 3;

  return (
    <div className="w-full flex flex-col justify-center gap-2 py-1">
      <div className="flex flex-wrap gap-1.5">
        {STEP2_TERMS.map((term, i) => {
          const color = STEP2_COLORS[i % STEP2_COLORS.length];
          const isVisible = i < count;
          const isActive = i === activeIndex;
          return (
            <span
              key={term.name}
              className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold border-2 transition-all duration-500"
              style={
                isActive
                  ? { backgroundColor: color, borderColor: color, color: '#fff', transform: 'scale(1.1)' }
                  : isVisible
                  ? { borderColor: color, color: '#64748b', backgroundColor: 'white' }
                  : { borderColor: '#e2e8f0', color: '#cbd5e1', backgroundColor: 'white' }
              }
            >
              {term.name}
              {i === 2 && showSubscale && (
                <span className="ml-1 text-[8px] font-black bg-purple-100 text-purple-600 rounded px-0.5">IT2</span>
              )}
            </span>
          );
        })}
      </div>

      <div className="w-full rounded-2xl border border-slate-200 p-2" style={{ backgroundColor: '#f8fafc' }}>
        <ResponsiveContainer width="99%" height={148}>
          <ComposedChart margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" dataKey="x" domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
            <YAxis domain={[0, 1]} ticks={[0, 0.5, 1]} tick={{ fill: '#94a3b8', fontSize: 10 }} width={24} />
            {visibleTerms.map((term, i) => {
              const color = STEP2_COLORS[i % STEP2_COLORS.length];
              const isActive = i === activeIndex;
              return (
                <ReferenceLine
                  key={`ref-${term.name}`}
                  x={term.xVal}
                  stroke={color}
                  strokeDasharray="4 4"
                  strokeWidth={isActive ? 2 : 1}
                  label={{ position: 'top', value: term.name, fill: color, fontWeight: isActive ? '900' : '600', fontSize: 10 }}
                />
              );
            })}
            {visibleTerms.map((term, i) => {
              const color = STEP2_COLORS[i % STEP2_COLORS.length];
              const isActive = i === activeIndex;
              return (
                <ReferenceArea
                  key={`area-${term.name}`}
                  x1={term.mf.supportStart}
                  x2={term.mf.supportEnd}
                  fill={color}
                  fillOpacity={isActive ? 0.22 : 0.07}
                />
              );
            })}
            {visibleTerms.map((term, i) => {
              const color = STEP2_COLORS[i % STEP2_COLORS.length];
              const isActive = i === activeIndex;
              const trapezeData = [
                { x: term.mf.supportStart, y: 0 },
                { x: term.mf.coreStart,    y: 1 },
                { x: term.mf.coreEnd,      y: 1 },
                { x: term.mf.supportEnd,   y: 0 },
              ];
              return (
                <Line
                  key={`line-${term.name}`}
                  data={trapezeData}
                  dataKey="y"
                  type="linear"
                  stroke={color}
                  strokeWidth={isActive ? 3 : 2}
                  dot={isActive ? { r: 4, fill: color, stroke: '#fff', strokeWidth: 2 } : false}
                  activeDot={false}
                  isAnimationActive={isActive}
                  animationDuration={500}
                  animationEasing="ease-out"
                />
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Mini SubscaleModal inline */}
      <div className={`w-full rounded-xl border border-purple-200 bg-purple-50/60 overflow-hidden transition-all duration-500 ${showSubscale ? 'opacity-100 max-h-32' : 'opacity-0 max-h-0 border-transparent pointer-events-none'}`}>
        <div className="px-3 py-1.5 border-b border-purple-100 flex items-center gap-1.5">
          <span className="text-[9px] font-black text-purple-700 uppercase tracking-wider">Diseñar Subescala</span>
          <span className="text-[9px] text-purple-300">·</span>
          <span className="text-[9px] font-bold text-emerald-600">Alto</span>
          <span className="text-[9px] text-purple-300">·</span>
          <span className="text-[9px] text-slate-400">Pendiente Descendente</span>
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
        </div>
        <div className="px-3 py-2.5 flex items-center justify-center gap-2">
          <div className="w-9 h-12 bg-white border-2 border-slate-200 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-xs font-black text-slate-300">1</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-end gap-1">
              <div className="flex flex-col items-center">
                <span className="text-[7px] font-bold text-slate-400 leading-none">MÍN</span>
                <span className="text-[10px] font-black text-slate-700 bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-sm">2</span>
              </div>
              <span className="text-[9px] text-slate-300 mb-0.5">—</span>
              <div className="flex flex-col items-center">
                <span className="text-[7px] font-bold text-slate-400 leading-none">MÁX</span>
                <span className="text-[10px] font-black text-slate-700 bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-sm">5</span>
              </div>
            </div>
            <span className="text-[8px] font-bold text-blue-500 whitespace-nowrap">¿Dudas? Rango ✓</span>
          </div>
          <div className="w-9 h-12 bg-white border-2 border-slate-200 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-xs font-black text-slate-300">2</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex flex-col items-center">
              <span className="text-[7px] font-bold text-slate-400 leading-none">CARTAS</span>
              <span className="text-[10px] font-black text-slate-700 bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-sm">3</span>
            </div>
            <span className="text-[8px] font-semibold text-slate-400 whitespace-nowrap">Distancia exacta</span>
          </div>
          <div className="w-9 h-12 bg-white border-2 border-slate-200 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-xs font-black text-slate-300">3</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3Content({ count }) {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-2 py-1">
      <p className="text-[11px] font-bold text-blue-500 self-start">Espectro difuso · Calidad Investigadora</p>
      <div className="w-full rounded-2xl border border-slate-200 px-2 pt-2 pb-1.5" style={{ backgroundColor: '#f8fafc' }}>
        <ResponsiveContainer width="99%" height={168}>
          <ComposedChart margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" dataKey="x" domain={[0, 1]} allowDataOverflow={true} ticks={[0, 0.25, 0.5, 0.75, 1]} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
            <YAxis domain={[0, 1]} ticks={[0, 0.5, 1]} tick={{ fill: '#94a3b8', fontSize: 10 }} width={24} />
            {STEP3_TERMS.slice(0, count).map((term, i) => {
              const isNewest = i === count - 1;
              const data = getTermLineData(term);
              return (
                <React.Fragment key={term.name}>
                  {term.type === 't1' ? (
                    <Line
                      data={data}
                      type="linear"
                      dataKey={term.name}
                      stroke={term.color}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={false}
                      isAnimationActive={isNewest}
                      animationDuration={900}
                      animationEasing="ease-out"
                    />
                  ) : (
                    <>
                      <Area data={data} type="linear" dataKey={`${term.name}_range`} fill={term.color} fillOpacity={0.35} stroke="none" connectNulls={false} isAnimationActive={isNewest} animationDuration={900} animationEasing="ease-out" />
                      <Line data={data} type="linear" dataKey={`${term.name}_upper`} stroke={term.color} strokeWidth={1.5} strokeDasharray="5 4" dot={false} connectNulls={false} isAnimationActive={isNewest} animationDuration={900} animationEasing="ease-out" />
                      <Line data={data} type="linear" dataKey={`${term.name}_lower`} stroke={term.color} strokeWidth={2.5} dot={false} connectNulls={false} isAnimationActive={isNewest} animationDuration={900} animationEasing="ease-out" />
                    </>
                  )}
                </React.Fragment>
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 px-1 pt-0.5 pb-0.5">
          {STEP3_TERMS.map((term, i) => (
            <div
              key={term.name}
              className="flex items-center gap-1.5 transition-all duration-500"
              style={{ opacity: i < count ? 1 : 0, transform: i < count ? 'translateY(0)' : 'translateY(4px)' }}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: term.color }} />
              <span className="text-[10px] font-bold" style={{ color: term.color }}>{term.name}</span>
              {term.type === 't2' && i < count && (
                <span className="text-[8px] font-black bg-purple-100 text-purple-600 rounded px-0.5">IT2</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function AuthDemoPanel() {
  const [step, setStep] = useState(1);
  const [count, setCount] = useState(0);
  const [fading, setFading] = useState(false);
  const innerTimerRef = useRef(null);

  const transitionTo = useCallback((nextStep) => {
    if (innerTimerRef.current) clearTimeout(innerTimerRef.current);
    setFading(true);
    innerTimerRef.current = setTimeout(() => {
      setStep(nextStep);
      setCount(0);
      setFading(false);
    }, 440);
  }, []);

  useEffect(() => {
    let timeout;
    if (step === 1) {
      if (count < STEP1_CARDS.length) {
        timeout = setTimeout(() => setCount(c => c + 1), 580);
      } else {
        timeout = setTimeout(() => transitionTo(2), 950);
      }
    } else if (step === 2) {
      if (count < STEP2_TERMS.length) {
        timeout = setTimeout(() => setCount(c => c + 1), 920);
      } else {
        timeout = setTimeout(() => transitionTo(3), 1300);
      }
    } else if (step === 3) {
      if (count < STEP3_TERMS.length) {
        timeout = setTimeout(() => setCount(c => c + 1), 920);
      } else {
        timeout = setTimeout(() => transitionTo(1), 2800);
      }
    }
    return () => clearTimeout(timeout);
  }, [step, count, transitionTo]);

  useEffect(() => {
    return () => { if (innerTimerRef.current) clearTimeout(innerTimerRef.current); };
  }, []);

  return (
    <div
      className="mt-5 flex-1 w-full flex flex-col gap-3 min-h-0 transition-opacity duration-500"
      style={{ opacity: fading ? 0 : 1 }}
    >
      {/* Step breadcrumb */}
      <div className="shrink-0 flex items-center gap-1">
        {STEP_LABELS.map((s, i) => (
          <React.Fragment key={s.n}>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all duration-300 ${step === s.n ? 'bg-blue-100' : ''}`}>
              <span className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-black transition-all duration-300 ${step === s.n ? 'bg-blue-600 text-white' : step > s.n ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                {step > s.n ? '✓' : s.n}
              </span>
              <span className={`text-[10px] font-bold transition-all duration-300 ${step === s.n ? 'text-blue-700' : step > s.n ? 'text-emerald-600' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <span className="text-slate-300 text-xs mx-0.5">›</span>
            )}
          </React.Fragment>
        ))}
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-500 font-bold">En vivo</span>
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center min-h-0">
        {step === 1 && <Step1Content count={count} />}
        {step === 2 && <Step2Content count={count} />}
        {step === 3 && <Step3Content count={count} />}
      </div>
    </div>
  );
}
