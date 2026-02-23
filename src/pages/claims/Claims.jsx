import React, { useMemo, useRef, useState } from "react";
import "../../styles/claimsStyles.css";
import { claims } from "../../data/db.js";

export default function Claims({ onClaimSelect }) {
  // "" means none selected
  const [selectedClaimId, setSelectedClaimId] = useState("");
  const [isClearing, setIsClearing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const animTimerRef = useRef(null);

  const claimOptions = useMemo(() => {
    return claims
      .map((c) => ({
        claimId: c.claimId,
        label: c.claimShortText ? c.claimShortText : c.keyword,
      }))
      .filter((c) => c.claimId && c.label);
  }, []);

  const triggerSelectAnim = () => {
    setIsAnimating(false);
    window.requestAnimationFrame(() => {
      setIsAnimating(true);
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
      animTimerRef.current = setTimeout(() => setIsAnimating(false), 220);
    });
  };

  const handleDropdownChange = (e) => {
    const nextId = e.target.value; // "" if "Select"
    setSelectedClaimId(nextId);
    onClaimSelect(nextId);
    triggerSelectAnim();
  };

  const handleClear = () => {
    // Fade out, then clear, then fade back in
    setIsClearing(true);
    setTimeout(() => {
      setSelectedClaimId("");
      onClaimSelect("");
      triggerSelectAnim();
      setIsClearing(false);
    }, 160);
  };

  return (
    <div className="claim-container">
      <div
        className={[
          "claim-select-wrap",
          selectedClaimId ? "has-selection" : "",
          isClearing ? "is-clearing" : "",
          isAnimating ? "select-animate" : "",
        ].join(" ")}
      >
        <select
          className="claim-dropdown"
          value={selectedClaimId}
          onChange={handleDropdownChange}
          aria-label="Select claim"
        >
          <option value="">Select</option>
          {claimOptions.map((c) => (
            <option key={c.claimId} value={c.claimId}>
              {c.label}
            </option>
          ))}
        </select>

        {selectedClaimId && (
          <button
            type="button"
            className="claim-clear-btn"
            onClick={handleClear}
            aria-label="Clear selected claim"
            title="Clear"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
