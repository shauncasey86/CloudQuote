'use client';

export function PrintControls() {
  const handleBack = () => {
    // If opened in a new tab/window, close it
    // Otherwise go back in history
    if (window.opener || window.history.length <= 1) {
      window.close();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="print-controls">
      <button
        className="back-btn"
        onClick={handleBack}
        type="button"
      >
        ← Close
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
