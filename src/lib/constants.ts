// src/lib/constants.ts
// Shared constants used across the application

import { QuoteStatus } from '@prisma/client';
import type { BadgeProps } from '@/components/ui/Badge';

/**
 * Badge variant mapping for quote statuses
 * Used consistently across QuotesTable, QuoteSummary, and QuoteViewer
 */
export const QUOTE_STATUS_VARIANTS: Record<QuoteStatus, BadgeProps['variant']> = {
  DRAFT: 'default',
  FINALIZED: 'warning',
  PRINTED: 'info',
  SENT: 'success',
  SAVED: 'info',
  ARCHIVED: 'danger',
} as const;

/**
 * Surcharge applied per bespoke/custom kitchen item
 * This covers additional manufacturing complexity for non-standard items
 */
export const BESPOKE_ITEM_SURCHARGE = 30;

/**
 * Price unit display labels
 */
export const PRICE_UNIT_LABELS = {
  UNIT: 'Each',
  LINEAR_METER: 'Per Linear Meter',
  SQUARE_METER: 'Per Square Meter',
} as const;

/**
 * Default autosave delay in milliseconds
 */
export const AUTOSAVE_DELAY_MS = 2000;

/**
 * Quote validity period in days from creation
 */
export const QUOTE_VALIDITY_DAYS = 30;
