import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '../../lib/archive.mjs';

export default function Calendar({ month, selectedDate, counts, onMonthChange, onDateSelect, minMonth, maxMonth }) {
  const stripRef = useRef(null);
  const [year, monthNumber] = month.split('-').map(Number);
  const dayCount = new Date(year, monthNumber, 0).getDate();
  useEffect(() => {
    const strip = stripRef.current;
    const revealSelected = () => {
      const selected = strip?.querySelector('[aria-pressed="true"]');
      if (selected) strip.scrollLeft = selected.offsetLeft - strip.offsetLeft - (strip.clientWidth - selected.offsetWidth) / 2;
    };
    revealSelected();
    const observer = new ResizeObserver(revealSelected);
    if (strip) observer.observe(strip);
    return () => observer.disconnect();
  }, [month, selectedDate]);
  function step(amount) {
    const d = new Date(year, monthNumber - 1 + amount, 1);
    onMonthChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return <section className="calendar" aria-label="Browse by event date">
    <div className="month-controls">
      <button className="icon-button" aria-label="Previous month" disabled={month <= minMonth} onClick={() => step(-1)}><ChevronLeft size={18} /></button>
      <label className="sr-only" htmlFor="archive-month">Month and year</label>
      <input id="archive-month" type="month" value={month} min={minMonth} max={maxMonth} onChange={e => e.target.value && onMonthChange(e.target.value)} />
      <button className="icon-button" aria-label="Next month" disabled={month >= maxMonth} onClick={() => step(1)}><ChevronRight size={18} /></button>
    </div>
    <div className="day-strip" ref={stripRef}>
      {Array.from({ length: dayCount }, (_, i) => {
        const date = `${month}-${String(i + 1).padStart(2, '0')}`;
        const count = counts[date] || 0;
        return <button key={date} className="day-button" aria-pressed={selectedDate === date} aria-label={`${formatDate(date)}: ${count} ${count === 1 ? 'entry' : 'entries'}`} onClick={() => onDateSelect(date)}>
          <span>{i + 1}</span><small>{count || '–'}</small>
        </button>;
      })}
    </div>
  </section>;
}
