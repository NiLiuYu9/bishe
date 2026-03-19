export const PRICE_UNITS = {
  per_call: '次',
  per_month: '月',
  per_year: '年'
} as const

export type PriceUnit = keyof typeof PRICE_UNITS

export function getPriceUnit(unit: string): string {
  return PRICE_UNITS[unit as PriceUnit] || unit
}

export function formatPrice(price: number | string, unit: string): string {
  const priceNum = typeof price === 'string' ? parseFloat(price) : price
  const unitText = getPriceUnit(unit)
  return `¥${priceNum}/${unitText}`
}
