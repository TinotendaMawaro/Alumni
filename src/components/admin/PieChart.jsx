import { useState } from 'react';

export const CHART_COLORS = ['#facc15', '#a855f7', '#34d399', '#38bdf8', '#fb7185', '#fb923c', '#94a3b8'];

// Dependency-free SVG donut/pie chart. `data` is [{ label, value, color? }].
const PieChart = ({ data, centerLabel, centerValue, emptyText = 'No data yet' }) => {
  const [active, setActive] = useState(null);
  const items = data.filter(d => d.value > 0).map((d, i) => ({ ...d, color: d.color || CHART_COLORS[i % CHART_COLORS.length] }));
  const total = items.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return <div className="h-48 flex items-center justify-center text-xs text-slate-500">{emptyText}</div>;
  }

  const R = 15.915; // circumference ≈ 100, so dash lengths are percentages
  let offset = 25;
  const slices = items.map((d, i) => {
    const pct = (d.value / total) * 100;
    const slice = { ...d, pct, offset, index: i };
    offset -= pct;
    return slice;
  });
  const focus = active !== null ? slices[active] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-44 h-44 flex-shrink-0">
        <svg viewBox="0 0 42 42" className="w-full h-full -rotate-0">
          <circle cx="21" cy="21" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          {slices.map(s => (
            <circle
              key={s.label}
              cx="21" cy="21" r={R}
              fill="none"
              stroke={s.color}
              strokeWidth={active === s.index ? 7 : 6}
              strokeDasharray={`${Math.max(s.pct - (slices.length > 1 ? 0.6 : 0), 0)} ${100 - s.pct + (slices.length > 1 ? 0.6 : 0)}`}
              strokeDashoffset={s.offset}
              onMouseEnter={() => setActive(s.index)}
              onMouseLeave={() => setActive(null)}
              className="transition-all duration-200 cursor-pointer"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-2xl font-black text-white leading-none">{focus ? focus.value : centerValue ?? total}</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 mt-1 max-w-[6rem] truncate">
            {focus ? focus.label : centerLabel || 'Total'}
          </span>
        </div>
      </div>

      <ul className="flex-1 w-full space-y-1.5 text-xs">
        {slices.map(s => (
          <li
            key={s.label}
            onMouseEnter={() => setActive(s.index)}
            onMouseLeave={() => setActive(null)}
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition ${active === s.index ? 'bg-white/10' : ''}`}
          >
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-slate-200 truncate flex-1" title={s.label}>{s.label}</span>
            <span className="font-mono font-bold text-white">{s.value}</span>
            <span className="text-slate-500 w-10 text-right">{s.pct.toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PieChart;
