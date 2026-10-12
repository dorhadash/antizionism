import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { categoryGroups } from '../../data/db.js';

export default function Claims({ selected, onChange, counts }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const root = useRef(null);
  const input = useRef(null);
  const trigger = useRef(null);
  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    function dismiss(e) { if (!root.current?.contains(e.target)) setOpen(false); }
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);
  const groups = categoryGroups.map(group => ({ ...group, claims: group.claims.filter(c =>
    `${group.name} ${c.claimShortText}`.toLowerCase().includes(query.toLowerCase().trim())) })).filter(g => g.claims.length);
  return <div className="category-picker" ref={root} onBlur={e => {
    // Clicking label text can briefly blur to the document before activating its checkbox.
    if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) setOpen(false);
  }} onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); trigger.current?.focus(); } }}>
    <button ref={trigger} className="category-trigger" aria-expanded={open} aria-controls="category-options" onClick={() => setOpen(!open)}>
      <span>{selected.length ? `Categories · ${selected.length} selected` : 'All categories'}</span><ChevronDown size={17} />
    </button>
    {open && <div id="category-options" className="category-popover">
      <label className="search-field picker-search"><Search size={17} /><span className="sr-only">Find a category</span><input ref={input} placeholder="Find a category…" value={query} onChange={e => setQuery(e.target.value)} /></label>
      <p className="picker-note">Show entries matching any selected category.</p>
      <div className="category-options">
        {!groups.length && <p className="muted">No matching categories.</p>}
        {groups.map(group => <fieldset key={group.key}><legend>{group.name}</legend>
          {group.claims.map(c => <label className="category-option" key={c.claimId} htmlFor={`category-${c.claimId}`}>
            <input id={`category-${c.claimId}`} type="checkbox" checked={selected.includes(c.claimId)} onChange={() => onChange(selected.includes(c.claimId) ? selected.filter(id => id !== c.claimId) : [...selected, c.claimId])} />
            <span>{c.claimShortText}</span><small>{counts[c.claimId] || 0}</small>
          </label>)}
        </fieldset>)}
      </div>
      <div className="picker-footer"><button className="text-button" disabled={!selected.length} onClick={() => onChange([])}>Clear categories</button><button className="button" onClick={() => { setOpen(false); trigger.current?.focus(); }}>Done</button></div>
    </div>}
  </div>;
}
