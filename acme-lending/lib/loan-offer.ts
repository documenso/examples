const FIXED_LOAN_AMOUNT = 25_000
const FIXED_APR = 8.9
const FIXED_TERM_MONTHS = 24

export function getLoanOffer(amount = FIXED_LOAN_AMOUNT) {
  const monthlyRate = FIXED_APR / 100 / 12
  const monthlyPayment =
    (amount * monthlyRate) /
    (1 - Math.pow(1 + monthlyRate, -FIXED_TERM_MONTHS))

  return {
    amount,
    apr: FIXED_APR,
    termMonths: FIXED_TERM_MONTHS,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
  }
}
