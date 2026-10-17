export type DocumentType = 'quote' | 'invoice' | 'credit_note'
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled'
export type DocumentStatus = QuoteStatus | InvoiceStatus
export type VatMode = 'global' | 'per_product'

export interface Item {
  description: string
  quantity: number
  unit: string
  unit_price: number
  vat_rate: number
}

export interface CatalogProduct {
  id: string
  label: string
  unit_price: number
  unit: string
  vat_rate: number
}

export interface ClientData {
  name: string
  company?: string
  email?: string
  address?: string
}

export interface CompanyInfo {
  name: string
  address: string
  phone: string
  web: string
  logo?: string | null
}

export interface DocumentData {
  id?: string
  type: DocumentType
  number: string
  status: DocumentStatus
  client_name: string
  client_email?: string
  client_company?: string
  client_address?: string
  description?: string
  items: Item[]
  vat_mode: VatMode
  global_vat_rate: number
  conditions: string
  total_ht: number
  total_vat: number
  total_ttc: number
  created_at?: string
}