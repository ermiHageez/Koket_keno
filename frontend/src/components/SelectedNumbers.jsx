import React, { useState, useEffect } from "react";
import "./componentsCSS/SelectedNumbers.css";

const SelectedNumbers = ({ selectedNumbers, onSelectChange = () => {}, disabled = false }) => {
  // If parent provides selectedNumbers we treat this as a controlled component.
  const isControlled = Array.isArray(selectedNumbers);
  const [internalSelected, setInternalSelected] = useState([]);

  useEffect(() => {
    if (!isControlled) return;
    // When controlled, nothing to keep in internal state, but clear any internal errors/state if needed
    // No-op for now.
  }, [selectedNumbers, isControlled]);

  const handleSelect = (num) => {
    if (disabled) return;

    const source = isControlled ? [...selectedNumbers] : [...internalSelected];
    let updated;
    if (source.includes(num)) {
      updated = source.filter((n) => n !== num);
    } else {
      if (source.length >= 10) {
        // simple inline feedback by ignoring extra selects (parent can show UI)
        return;
      }
      updated = [...source, num];
    }

    // Notify parent
    try {
      onSelectChange(updated);
    } catch (e) {
      // ignore
    }

    if (!isControlled) {
      setInternalSelected(updated);
    }
  };

  const displaySelected = isControlled ? selectedNumbers : internalSelected;

  return (
    <div className="keno-container">
      <div className="number-grid">
        {Array.from({ length: 80 }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            className={`number-btn ${displaySelected.includes(num) ? "selected" : ""}`}
            onClick={() => handleSelect(num)}
            disabled={disabled}
            type="button"
          >
            {num}
          </button>
        ))}
      </div>

      <div className="selected-display">
        <h3>Selected Numbers:</h3>
        {displaySelected.length > 0 ? (
          <div className="selected-list">
            {displaySelected.map((num) => (
              <button key={num} className="chosen-btn" type="button">
                {num}
              </button>
            ))}
          </div>
        ) : (
          <p>No numbers selected yet.</p>
        )}
      </div>
    </div>
  );
};

export default SelectedNumbers;
