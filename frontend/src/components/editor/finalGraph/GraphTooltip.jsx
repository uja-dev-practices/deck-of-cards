const TermInfo = ({ title, color, children }) => (
  <div className="flex flex-col text-xs font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
    <span className="uppercase font-black mb-1.5" style={{ color }}>{title}</span>
    {children}
  </div>
);

export const GraphTooltip = ({ active, payload, label, sortedResults }) => {
  if (!active || !payload || !payload.length) return null;
  const dataPoint = payload[0].payload;
  
  const activeTerms = sortedResults.filter(item => 
    item.isType2 ? (dataPoint[`${item.term}_upper`] ?? 0) > 0 : (dataPoint[item.term] ?? 0) > 0
  );

  if (activeTerms.length === 0) return null;

  return (
    <div className="bg-white p-4 border border-slate-200 shadow-xl rounded-2xl min-w-[200px] animate-fade-in relative z-50">
      <p className="text-slate-800 font-black border-b border-slate-100 pb-2 mb-3 text-sm flex justify-between items-center gap-4">
        <span>Punto X:</span> <span className="text-blue-600">{Number(label).toFixed(3)}</span>
      </p>
      <div className="flex flex-col gap-3">
        {activeTerms.map(item => {
          if (item.isType2) {
            const lower = dataPoint[`${item.term}_lower`] ?? 0;
            const upper = dataPoint[`${item.term}_upper`] ?? 0;
            const range = Math.abs(upper - lower);

            return range <= 0.001 ? (
              <TermInfo key={item.term} title={item.term} color={item.color}>
                <span className="text-slate-600 flex justify-between gap-4">Pertenencia: <b>{Number(upper).toFixed(3)}</b></span>
              </TermInfo>
            ) : (
              <TermInfo key={item.term} title={item.term} color={item.color}>
                <span className="text-slate-600 flex justify-between gap-4">Mínimo: <b>{Number(lower).toFixed(3)}</b></span>
                <span className="text-slate-600 flex justify-between gap-4 mt-0.5">Máximo: <b>{Number(upper).toFixed(3)}</b></span>
                <span className="text-slate-500 font-bold mt-1.5 pt-1.5 border-t border-slate-200 flex justify-between gap-4">
                  Incertidumbre: <span>{Number(range).toFixed(3)}</span>
                </span>
              </TermInfo>
            );
          }
          return (
            <TermInfo key={item.term} title={item.term} color={item.color}>
              <span className="text-slate-600 flex justify-between gap-4">Pertenencia: <b>{Number(dataPoint[item.term]).toFixed(3)}</b></span>
            </TermInfo>
          );
        })}
      </div>
    </div>
  );
};