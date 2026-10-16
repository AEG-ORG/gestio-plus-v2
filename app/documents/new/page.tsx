'use client'


import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Item {
  description: string
  quantity: number
  unit_price: number
  vat_rate: number
}

export default function NewDocumentPage() {
  const [type, setType] = useState<'quote' | 'invoice'>('quote')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [items, setItems] = useState<Item[]>([{ description: '', quantity: 1, unit_price: 0, vat_rate: 20 }])
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, vat_rate: 20 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof Item, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  // Calculs automatiques
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0)
  const totalVat = items.reduce((acc, item) => acc + (item.quantity * item.unit_price * (item.vat_rate / 100)), 0)
  const totalTtc = subtotal + totalVat

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccessMessage('')

    try {
      const year = new Date().getFullYear()
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      const prefix = type === 'invoice' ? 'FAC' : 'DEV'
      const documentNumber = `${prefix}-${year}-${randomNum}`

      const { error } = await supabase.from('documents').insert([
        {
          type,
          number: documentNumber,
          client_name: clientName,
          client_email: clientEmail,
          items,
          total_ht: subtotal,
          total_ttc: totalTtc,
          status: 'draft',
          created_at: new Date().toISOString()
        }
      ])

      if (error) throw error

      setSuccessMessage(`Document ${documentNumber} enregistré avec succès !`)
      setClientName('')
      setClientEmail('')
      setItems([{ description: '', quantity: 1, unit_price: 0, vat_rate: 20 }])
    } catch (err: any) {
      alert("Erreur lors de l'enregistrement : " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 sm:p-8">
        
        {/* En-tête */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-1" /> Retour
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Créer un Devis / Facture</h1>
        </div>

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Type et Client */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de document</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'quote' | 'invoice')}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="quote">Devis</option>
                <option value="invoice">Facture</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Entreprise Dupont"
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email du client</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="client@exemple.com"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Articles */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Lignes de la prestation</h2>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 items-center bg-gray-50 p-3 rounded-lg border">
                  <input
                    type="text"
                    required
                    placeholder="Description de l'article"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md p-2 text-sm outline-none w-full"
                  />
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Qté"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-20 border border-gray-300 rounded-md p-2 text-sm outline-none"
                  />
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Prix U. HT"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    className="w-28 border border-gray-300 rounded-md p-2 text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="text-red-500 hover:text-red-700 p-2 disabled:opacity-30"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="mt-3 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4 mr-1" /> Ajouter une ligne
            </button>
          </div>

          {/* Totaux */}
          <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-end space-y-1 text-right">
            <p className="text-sm text-gray-600">Total HT : <span className="font-semibold text-gray-900">{subtotal.toFixed(2)} €</span></p>
            <p className="text-sm text-gray-600">Total TVA : <span className="font-semibold text-gray-900">{totalVat.toFixed(2)} €</span></p>
            <p className="text-lg font-bold text-gray-900">Total TTC : {totalTtc.toFixed(2)} €</p>
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Enregistrement...' : 'Enregistrer le document'}</span>
          </button>

        </form>
      </div>
    </div>
  )
}