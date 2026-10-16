import { supabase } from './supabase'

export async function getNextDocumentNumber(companyId: string, type: 'quote' | 'invoice'): Promise<string> {
  const prefix = type === 'invoice' ? 'FAC' : 'DEV'
  const year = new Date().getFullYear()
  
  const { data, error } = await supabase
    .from('documents')
    .select('number')
    .eq('company_id', companyId)
    .eq('type', type)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) throw error

  let nextSeq = 1
  if (data && data.length > 0) {
    const lastNum = data[0].number // Format attendu : FAC-2026-0001
    const parts = lastNum.split('-')
    const lastSeq = parseInt(parts[parts.length - 1], 10)
    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1
    }
  }

  const seqPadded = String(nextSeq).padStart(4, '0')
  return `${prefix}-${year}-${seqPadded}`
}