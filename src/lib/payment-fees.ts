// Shared fee constants & helpers usable from client and server.
export const CARD_FEE_PCT = 0.03; // 3%
export const ACH_FEE_CENTS = 50; // $0.50 flat

export type PaymentMethodKind = "CREDIT_CARD" | "BANK_ACCOUNT";

export function calcProcessingFee(
  amountCents: number,
  type: PaymentMethodKind
): number {
  if (type === "CREDIT_CARD") return Math.round(amountCents * CARD_FEE_PCT);
  return ACH_FEE_CENTS;
}

export function feeLabel(type: PaymentMethodKind): string {
  return type === "CREDIT_CARD" ? "3% card fee" : "ACH fee";
}
