export const dynamic = 'force-dynamic'
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getNextDocumentNumber } from '@/lib/documents'
import { Plus, Trash2, Save } from 'lucide-react'

interface ItemLine {
  description: string
  quantity: number
  unitPrice: number
  vatRate: number
}

export default function NewDocumentPage() {
  const [docType, setDocType] = useState<'quote' | 'invoice'>('invoice')
  const [clientName, setClientName] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [items, setItems] = useState<ItemLine[]>([
    { description: '', quantity: 1, unitPrice: 0, vatRate: 20 }
  ])
  const [loading, setLoading] = useState(false)

  // Ajouter une ligne de prestation
  const addItemLine = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, vatRate: 20 }])
  }

  // Supprimer une ligne
  const removeItemLine = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  // Mettre à jour une ligne
  const updateItem = (index: number, field: keyof ItemLine, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  // Calculs automatiques
  const totalHt = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0)
  const totalVat = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice * item.vatRate) / 100, 0)
  const totalTtc = totalHt + totalVat

  // Enregistrement avec numérotation légale automatique
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Récupérer l'ID de l'entreprise (à adapter selon ton système d'auth)
      const { data: company } = await supabase.from('companies').select('id').single()
      
      if (!company) {
        throw new Error('Aucune entreprise configurée.')
      }

      // 2. Générer le numéro légal séquentiel sans trou
      const documentNumber = await getNextDocumentNumber(company.id, docType)

      // 3. Enregistrer le document principal dans Supabase
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .insert([
          {
            company_id: company.id,
            type: docType,
            number: documentNumber,
            status: 'draft',
            issue_date: new Date().toISOString().split('T')[0],
            total_ht: totalHt,
            total_vat: totalVat,
            total_ttc: totalTtc,
          },
        ])
        .select()
        .single()

      if (docError) throw docError

      // 4. Enregistrer les lignes du document
      if (doc) {
        const itemRecords = items.map((item) => ({
          document_id: doc.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          vat_rate: item.vatRate,
          total_ht: item.quantity * item.unitPrice,
        }))

        const { error: itemsError } = await supabase.from('items').insert(itemRecords)
        if (itemsError) throw itemsError
      }

      alert(`Document enregistré sous le N° ${documentNumber} !`)
      
      // Réinitialiser le formulaire
      setItems([{ description: '', quantity: 1, unitPrice: 0, vatRate: 20 }])
      setClientName('')
      setClientAddress('')

    } catch (err: any) {
      alert('Erreur lors de l’enregistrement : ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Nouveau {docType === 'invoice' ? 'Facture' : 'Devis'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type de document */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setDocType('invoice')}
            className={`px-4 py-2 rounded-md font-medium ${
              docType === 'invoice' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Facture
          </button>
          <button
            type="button"
            onClick={() => setDocType('quote')}
            className={`px-4 py-2 rounded-md font-medium ${
              docType === 'quote' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Devis
          </button>
        </div>

        {/* Client */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom du Client</label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm"
              placeholder="Ex: Client ABC"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Adresse</label>
            <input
              type="text"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm"
              placeholder="Adresse de facturation"
            />
          </div>
        </div>

        {/* Lignes d'articles */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Lignes du document</h3>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-center bg-gray-50 p-3 rounded-md">
                <input
                  type="text"
                  placeholder="Désignation"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  className="flex-grow border rounded-md p-2 text-sm"
                  required
                />
                <input
                  type="number"
                  placeholder="Qté"
                  value={item.quantity}
                  min={1}
                  onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  className="w-20 border rounded-md p-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Prix U. HT (€)"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  className="w-28 border rounded-md p-2 text-sm"
                />
                <select
                  value={item.vatRate}
                  onChange={(e) => updateItem(index, 'vatRate', parseFloat(e.target.value))}
                  className="w-24 border rounded-md p-2 text-sm"
                >
                  <option value={20}>20 %</option>
                  <option value={10}>10 %</option>
                  <option value={5.5}>5,5 %</option>
                  <option value={0}>0 %</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeItemLine(index)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItemLine}
            className="mt-3 flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline"
          >
            <Plus size={16} /> Ajouter une ligne
          </button>
        </div>

        {/* Totaux */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <div className="w-64 space-y-2 text-right">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Total HT :</span>
              <span>{totalHt.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Total TVA :</span>
              <span>{totalVat.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
              <span>Total TTC :</span>
              <span>{totalTtc.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Soumission */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 disabled:opacity-50"
          >
            <Save size={18} /> {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}