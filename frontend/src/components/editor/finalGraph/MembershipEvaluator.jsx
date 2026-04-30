import { useState } from 'react';
import { interpolateY } from './useGraphData';

const evaluateMembership = (x, sortedResults) => {
  if (!sortedResults || sortedResults.length === 0) return [];
  return sortedResults.map(item => {
    if (item.isType2) {
      const lower = interpolateY(x, item.lowerNodes) ?? 0;
      const upper = interpolateY(x, item.upperNodes) ?? 0;
      return { term: item.term, color: item.color, isType2: true, lower, upper };
    }
    const y = interpolateY(x, item.nodes) ?? 0;
    return { term: item.term, color: item.color, isType2: false, y };
  });
};

const filterActive = (results) =>
  results.filter(r => r.isType2 ? r.upper > 0 : r.y > 0);

const TermResult = ({ result }) => {
  const uncertainty = result.isType2 ? Math.abs(result.upper - result.lower) : 0;
  const isSimple = !result.isType2 || uncertainty <= 0.001;
  const displayY = result.isType2 ? result.upper : result.y;

  return (
    <div className="flex flex-col text-xs font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
      <span className="uppercase font-black mb-1.5" style={{ color: result.color }}>
        {result.term}
      </span>
      {isSimple ? (
        <span className="text-slate-600 flex justify-between gap-4">
          Pertenencia: <b>{displayY.toFixed(3)}</b>
        </span>
      ) : (
        <>
          <span className="text-slate-600 flex justify-between gap-4">
            Mínimo: <b>{result.lower.toFixed(3)}</b>
          </span>
          <span className="text-slate-600 flex justify-between gap-4 mt-0.5">
            Máximo: <b>{result.upper.toFixed(3)}</b>
          </span>
          <span className="text-slate-500 font-bold mt-1.5 pt-1.5 border-t border-slate-200 flex justify-between gap-4">
            Incertidumbre: <span>{uncertainty.toFixed(3)}</span>
          </span>
        </>
      )}
    </div>
  );
};

export const MembershipEvaluator = ({ sortedResults }) => {
  const [inputValue, setInputValue] = useState('');

  const handleChange = (e) => {
    const raw = e.target.value;
    if (raw === '') { setInputValue(''); return; }
    const dotIdx = raw.indexOf('.');
    if (dotIdx !== -1 && raw.length - dotIdx - 1 > 4) {
      setInputValue(raw.slice(0, dotIdx + 5));
    } else {
      setInputValue(raw);
    }
  };

  const trimmed = inputValue.trim();
  const xNum = trimmed === '' ? null : parseFloat(trimmed);
  const isValidNumber = xNum !== null && !isNaN(xNum) && isFinite(xNum);

  const activeResults = isValidNumber
    ? filterActive(evaluateMembership(xNum, sortedResults))
    : null;

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* Input group */}
      <div className="flex items-center gap-2 shrink-0">
        <label
          htmlFor="eval-x-input"
          className="text-xs font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap"
        >
          Evaluar X:
        </label>
        <input
          id="eval-x-input"
          type="number"
          step="0.0001"
          value={inputValue}
          onChange={handleChange}
          placeholder="ej. 0.35"
          className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-shadow placeholder:text-slate-400"
        />
      </div>

      {/* Results */}
      <div className="flex flex-row flex-wrap gap-3 items-center">
        {trimmed === '' && (
          <span className="text-xs text-slate-400 italic">
            Introduce un valor para obtener el grado de pertenencia.
          </span>
        )}
        {trimmed !== '' && !isValidNumber && (
          <span className="text-xs text-red-400 italic">Valor no válido.</span>
        )}
        {isValidNumber && activeResults.length === 0 && (
          <span className="text-xs text-slate-400 italic">
            Ningún término activo en X = {xNum.toFixed(4)}.
          </span>
        )}
        {isValidNumber && activeResults.map(r => (
          <TermResult key={r.term} result={r} />
        ))}
      </div>
    </div>
  );
};
