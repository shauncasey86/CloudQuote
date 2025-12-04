'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export function PrintControls() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isProductionMode = searchParams.get('mode') === 'production';

  const handleBack = () => {
    // If opened in a new tab/window, close it
    // Otherwise go back in history
    if (window.opener || window.history.length <= 1) {
      window.close();
    } else {
      window.history.back();
    }
  };

  const toggleMode = () => {
    const newMode = isProductionMode ? '' : 'production';
    const url = newMode ? `${pathname}?mode=${newMode}` : pathname;
    window.location.href = url;
  };

  return (
    <div className="print-controls">
      <button
        className="back-btn"
        onClick={handleBack}
        type="button"
      >
        ← CLOSE
      </button>
      <button
        className="mode-btn"
        onClick={toggleMode}
        type="button"
      >
        {isProductionMode ? '💰 SHOW PRICES' : '🏭 PRODUCTION COPY'}
      </button>
      <button
        className="print-btn"
        onClick={() => window.print()}
        type="button"
      >
        🖨️ PRINT {isProductionMode ? 'PRODUCTION SHEET' : 'QUOTE'}
      </button>
    </div>
  );
}
