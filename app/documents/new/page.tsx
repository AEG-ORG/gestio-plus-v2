'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, Save, ArrowLeft, UserPlus, PackagePlus, X } from 'lucide-react'
import Link from 'next/link'

interface Item {
  description: string
  quantity: number
  unit: string
  unit_price: number
  vat_rate: number
}

interface Client {
  name: string
  email: string
  phone: string
  address: string
}

interface CatalogProduct {
  label: string
  unit_price: number
  unit: string
  vat_rate: number
}

export default function NewDocumentPage() {
  // Document
  const [type, setType] = useState<'quote' | 'invoice'>('quote')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  
  // TVA
  const [vatMode, setVatMode] = useState<'global' | 'per_product'>('global')
  const [globalVatRate, setGlobalVatRate] = useState<number>(20)

  // Articles
  const [items, setItems] = useState<Item[]>([
    { description: '', quantity: 1, unit: 'Unité', unit_price: 0, vat_rate: 20 }
  ])

  // Modales
  const [showClientModal, setShowClientModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [activeItemIndexForProduct, setActiveItemIndexForProduct] = useState<number | null>(null)

  // Formulaires Modales
  const [newClient, setNewClient] = useState<Client>({ name: '', email: '', phone: '', address: '' })
  const [newProduct, setNewProduct] = useState<CatalogProduct>({ label: '', unit_price: 0, unit: 'Unité', vat_rate: 20 })

  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Gestion des lignes d'articles
  const addItem = () => {
    setItems([
      ...items,
      { description: '', quantity: 1, unit: 'Unité', unit_price: 0, vat_rate: vatMode === 'global' ? globalVatRate : 20 }
    ])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof Item, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  // Calculs
  const getItemTotalHt = (item: Item) => item.quantity * item.unit_price

  const subtotalHt = items.reduce((acc, item) => acc + getItemTotalHt(item), 0)

  const totalVat = items.reduce((acc, item) => {
    const rate = vatMode === 'global' ? globalVatRate : item.vat_rate
    return acc + (getItemTotalHt(item) * (rate / 100))
  }, 0)

  const totalTtc = subtotalHt + totalVat

  // Modal Ajout Client
  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClient.name) return
    setClientName(newClient.name)
    if (newClient.email) setClientEmail(newClient.email)
    setShowClientModal(false)
    setNewClient({ name: '', email: '', phone: '', address: '' })
  }

  // Modal Ajout Produit
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProduct.label) return

    if (activeItemIndexForProduct !== null) {
      const newItems = [...items]
      newItems[activeItemIndexForProduct] = {
        ...newItems[activeItemIndexForProduct],
        description: newProduct.label,
        unit_price: newProduct.unit_price,
        unit: newProduct.unit,
        vat_rate: newProduct.vat_rate
      }
      setItems(newItems)
    }

    setShowProductModal(false)
    setNewProduct({ label: '', unit_price: 0, unit: 'Unité', vat_rate: 20 })
    setActiveItemIndexForProduct(null)
  }

  const handleOpenProductModal = (index: number) => {
    setActiveItemIndexForProduct(index)
    setShowProductModal(true)
  }

  // Enregistrement final
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccessMessage('')

    try {
      const year = new Date().getFullYear()
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      const prefix = type === 'invoice' ? 'FAC' : 'DEV'
      const documentNumber = `${prefix}-${year}-${randomNum}`

      const formattedItems = items.map(item => ({
        ...item,
        vat_rate: vatMode === 'global' ? globalVatRate : item.vat_rate,
        total_ht: getItemTotalHt(item)
      }))

      const { error } = await supabase.from('documents').insert([
        {
          type,
          number: documentNumber,
          client_name: clientName,
          client_email: clientEmail,
          items: formattedItems,
          total_ht: subtotalHt,
          total_ttc: totalTtc,
          status: 'draft',
          created_at: new Date().toISOString()
        }
      ])

      if (error) throw error

      setSuccessMessage(`Document ${documentNumber} enregistré avec succès !`)
      setClientName('')
      setClientEmail('')
      setItems([{ description: '', quantity: 1, unit: 'Unité', unit_price: 0, vat_rate: 20 }])
    } catch (err: any) {
      alert("Erreur lors de l'enregistrement : " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 sm:p-8">
        
        {/* En-tête */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <Link href="/documents" className="flex items-center text-gray-600 hover:text-gray-900 text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-1" /> Retour
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {type === 'quote' ? 'Nouveau Devis' : 'Nouvelle Facture'}
          </h1>
        </div>

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Options de document et TVA */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de document</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'quote' | 'invoice')}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                <option value="quote">Devis</option>
                <option value="invoice">Facture</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gestion de la TVA</label>
              <select
                value={vatMode}
                onChange={(e) => setVatMode(e.target.value as 'global' | 'per_product')}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                <option value="global">Même TVA pour tous les produits</option>
                <option value="per_product">TVA spécifique par produit</option>
              </select>
            </div>

            {vatMode === 'global' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Taux de TVA globale (%)</label>
                <select
                  value={globalVatRate}
                  onChange={(e) => setGlobalVatRate(parseFloat(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value={20}>20 %</option>
                  <option value={10}>10 %</option>
                  <option value={5.5}>5,5 %</option>
                  <option value={2.1}>2,1 %</option>
                  <option value={0}>0 % (Franchise)</option>
                </select>
              </div>
            )}
          </div>

          {/* Saisie Client */}
          <div className="bg-white border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-md font-semibold text-gray-800">Informations Client</h2>
              <button
                type="button"
                onClick={() => setShowClientModal(true)}
                className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-md border border-blue-200"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" /> Ajouter un nouveau client
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nom / Raison sociale</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Entreprise Martin"
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Adresse email</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@exemple.com"
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tableau des Articles */}
          <div className="space-y-3">
            <h2 className="text-md font-semibold text-gray-800">Lignes d'articles</h2>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-100 text-gray-700 font-semibold border-b">
                  <tr>
                    <th className="py-2.5 px-3">Désignation</th>
                    <th className="py-2.5 px-2 w-20 text-center">Qté</th>
                    <th className="py-2.5 px-2 w-28">Unité</th>
                    <th className="py-2.5 px-2 w-28 text-right">Prix U. HT (€)</th>
                    {vatMode === 'per_product' && (
                      <th className="py-2.5 px-2 w-24 text-right">TVA (%)</th>
                    )}
                    <th className="py-2.5 px-3 w-28 text-right">Total HT (€)</th>
                    <th className="py-2.5 px-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {items.map((item, index) => {
                    const totalHtLine = getItemTotalHt(item)
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              required
                              placeholder="Description de la prestation / produit"
                              value={item.description}
                              onChange={(e) => updateItem(index, 'description', e.target.value)}
                              className="w-full border border-gray-300 rounded p-1.5 text-xs outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleOpenProductModal(index)}
                              title="Ajouter depuis / vers le catalogue"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                            >
                              <PackagePlus className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min="0.01"
                            step="any"
                            required
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full border border-gray-300 rounded p-1.5 text-xs text-center outline-none"
                          />
                        </td>

                        <td className="py-2 px-2">
                          <select
                            value={item.unit}
                            onChange={(e) => updateItem(index, 'unit', e.target.value)}
                            className="w-full border border-gray-300 rounded p-1.5 text-xs outline-none"
                          >
                            <option value="Unité">Unité</option>
                            <option value="Heure">Heure</option>
                            <option value="Jour">Jour</option>
                            <option value="Mètre">Mètre</option>
                            <option value="m²">m²</option>
                            <option value="Kg">Kg</option>
                            <option value="Forfait">Forfait</option>
                          </select>
                        </td>

                        <td className="py-2 px-2">
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="w-full border border-gray-300 rounded p-1.5 text-xs text-right outline-none"
                          />
                        </td>

                        {vatMode === 'per_product' && (
                          <td className="py-2 px-2">
                            <select
                              value={item.vat_rate}
                              onChange={(e) => updateItem(index, 'vat_rate', parseFloat(e.target.value))}
                              className="w-full border border-gray-300 rounded p-1.5 text-xs text-right outline-none"
                            >
                              <option value={20}>20 %</option>
                              <option value={10}>10 %</option>
                              <option value={5.5}>5.5 %</option>
                              <option value={2.1}>2.1 %</option>
                              <option value={0}>0 %</option>
                            </select>
                          </td>
                        )}

                        <td className="py-2 px-3 text-right font-medium text-gray-900">
                          {totalHtLine.toFixed(2)} €
                        </td>

                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            disabled={items.length === 1}
                            className="text-red-500 hover:text-red-700 disabled:opacity-30 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 pt-1"
            >
              <Plus className="w-4 h-4 mr-1" /> Ajouter une ligne d'article
            </button>
          </div>

          {/* Récapitulatif Totaux */}
          <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-end space-y-1.5 text-right border">
            <p className="text-sm text-gray-600">Total HT : <span className="font-semibold text-gray-900">{subtotalHt.toFixed(2)} €</span></p>
            <p className="text-sm text-gray-600">
              Total TVA {vatMode === 'global' ? `(${globalVatRate}%)` : 'cumulée'} : <span className="font-semibold text-gray-900">{totalVat.toFixed(2)} €</span>
            </p>
            <p className="text-xl font-bold text-gray-900 pt-1 border-t w-48">
              Total TTC : {totalTtc.toFixed(2)} €
            </p>
          </div>

          {/* Soumission */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Enregistrement en cours...' : 'Enregistrer le document'}</span>
          </button>

        </form>
      </div>

      {/* MODALE CLIENT */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowClientModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-blue-600" /> Ajouter un nouveau client
            </h3>
            <form onSubmit={handleSaveClient} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nom / Raison Sociale *</label>
                <input
                  type="text"
                  required
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="Nom de la personne ou entreprise"
                  className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="contact@client.com"
                  className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="text"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  placeholder="06 00 00 00 00"
                  className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Adresse</label>
                <textarea
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  placeholder="Adresse complète"
                  rows={2}
                  className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                >
                  Valider et sélectionner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE NOUVEAU PRODUIT */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <PackagePlus className="w-5 h-5 mr-2 text-blue-600" /> Ajouter un nouveau produit
            </h3>
            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Désignation *</label>
                <input
                  type="text"
                  required
                  value={newProduct.label}
                  onChange={(e) => setNewProduct({ ...newProduct, label: e.target.value })}
                  placeholder="Nom du produit ou service"
                  className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Prix Unitaire HT (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.unit_price}
                    onChange={(e) => setNewProduct({ ...newProduct, unit_price: parseFloat(e.target.value) || 0 })}
                    className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Unité</label>
                  <select
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Unité">Unité</option>
                    <option value="Heure">Heure</option>
                    <option value="Jour">Jour</option>
                    <option value="Mètre">Mètre</option>
                    <option value="m²">m²</option>
                    <option value="Kg">Kg</option>
                    <option value="Forfait">Forfait</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Taux de TVA (%)</label>
                <select
                  value={newProduct.vat_rate}
                  onChange={(e) => setNewProduct({ ...newProduct, vat_rate: parseFloat(e.target.value) })}
                  className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={20}>20 %</option>
                  <option value={10}>10 %</option>
                  <option value={5.5}>5,5 %</option>
                  <option value={2.1}>2,1 %</option>
                  <option value={0}>0 %</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                >
                  Insérer dans la ligne
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}