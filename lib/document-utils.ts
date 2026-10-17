import { Item, VatMode, DocumentStatus } from '@/types'

export function calculateItemTotalHt(item: Item): number {
  return (item.quantity || 0) * (item.unit_price || 0)
}

export function calculateSubtotalHt(items: Item[]): number {
  return items.reduce((acc, item) => acc + calculateItemTotalHt(item), 0)
}

export function calculateTotalVat(items: Item[], vatMode: VatMode, globalVatRate: number): number {
  return items.reduce((acc, item) => {
    const rate = vatMode === 'global' ? globalVatRate : item.vat_rate
    return acc + calculateItemTotalHt(item) * (rate / 100)
  }, 0)
}

export function calculateTotalTtc(items: Item[], vatMode: VatMode, globalVatRate: number): number {
  const subtotal = calculateSubtotalHt(items)
  const vat = calculateTotalVat(items, vatMode, globalVatRate)
  return subtotal + vat
}

export function getStatusLabel(status: DocumentStatus): string {
  switch (status) {
    case 'draft': return 'Brouillon'
    case 'sent': return 'Envoyé'
    case 'accepted': return 'Accepté / Signé'
    case 'rejected': return 'Refusé'
    case 'expired': return 'Expiré'
  }
}