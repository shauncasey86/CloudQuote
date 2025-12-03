'use client';

export function PrintControls() {
  return (
    <div className="print-controls">
      <button
        className="back-btn"
        onClick={() => window.history.back()}
        type="button"
      >
        ← Back
      </button>
      <button
        className="print-btn"
        onClick={() => window.print()}
        type="button"
      >
        🖨️ Print Quote
      </button>
    </div>
  );
}
