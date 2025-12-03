// src/lib/pricing.ts

interface QuoteItem {
  quantity: number;
  unitPrice: number;
  priceUnit: 'UNIT' | 'LINEAR_METER' | 'SQUARE_METER';
}

interface AdditionalCost {
  amount: number;
  taxable: boolean;
}

interface PriceCalculation {
  items: QuoteItem[];
  additionalCosts: AdditionalCost[];
  houseTypeMultiplier?: number; // Deprecated - kept for compatibility, not used
  vatRate: number;
}

interface QuoteTotals {
  subtotal: number;
  vatAmount: number;
  total: number;
}

export function calculateQuoteTotal(input: PriceCalculation): QuoteTotals {
  // Calculate line item totals (no multiplier - allowance items are already £0)
  const itemsSubtotal = input.items.reduce((sum, item) => {
    return sum + item.unitPrice * item.quantity;
  }, 0);

  // Separate taxable and non-taxable additional costs
  const taxableAdditional = input.additionalCosts
    .filter((c) => c.taxable)
    .reduce((sum, c) => sum + c.amount, 0);

  const nonTaxableAdditional = input.additionalCosts
    .filter((c) => !c.taxable)
    .reduce((sum, c) => sum + c.amount, 0);

  // Calculate VAT on taxable amounts
  const taxableTotal = itemsSubtotal + taxableAdditional;
  const vatAmount = taxableTotal * (input.vatRate / 100);

  // Final total
  const subtotal = itemsSubtotal + taxableAdditional + nonTaxableAdditional;
  const total = taxableTotal + vatAmount + nonTaxableAdditional;

  return {
    subtotal: round(subtotal, 2),
    vatAmount: round(vatAmount, 2),
    total: round(total, 2),
  };
}

function round(value: number, decimals: number): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
