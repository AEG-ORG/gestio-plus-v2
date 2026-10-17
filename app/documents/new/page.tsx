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

interface CatalogProduct {
  id: string
  label: string
  unit_price: number
  unit: string
  vat_rate: number
}

export default function NewDocumentPage() {
  // Document
  const [type, setType] = useState<'quote' | 'invoice'>('quote')
  const [clientName, setClientName] = useState('Marie Philippe')
  const [clientCompany, setClientCompany] = useState('COGIP')
  const [clientAddress, setClientAddress] = useState('13, quai Branly\n75002 Paris')
  const [clientEmail, setClientEmail] = useState('marie.philippe@cogip.fr')
  const [documentDescription, setDocumentDescription] = useState('Prestation de rénovation et d\'aménagement')
  
  // TVA
  const [vatMode, setVatMode] = useState<'global' | 'per_product'>('global')
  const [globalVatRate, setGlobalVatRate] = useState<number>(20)

  // Catalogue factice de produits pour sélection rapide
  const [catalog] = useState<CatalogProduct[]>([
    { id: '1', label: 'Prestation de conseil', unit_price: 100, unit: 'Heure', vat_rate: 20 },
    { id: '2', label: 'Peinture murale', unit_price: 45, unit: 'm²', vat_rate: 10 },
    { id: '3', label: 'Pose de revêtement de sol', unit_price: 60, unit: 'm²', vat_rate: 20 },
    { id: '4', label: 'Forfait installation sanitaire', unit_price: 350, unit: 'Forfait', vat_rate: 20 },
  ])

  // Articles
  const [items, setItems] = useState<Item[]>([
    { description: 'Prestation 1', quantity: 5, unit: 'Unité', unit_price: 100, vat_rate: 20 },
    { description: 'Prestation 2', quantity: 5, unit: 'Unité', unit_price: 100, vat_rate: 20 },
    { description: 'Prestation 3', quantity: 5, unit: 'Unité', unit_price: 100, vat_rate: 20 }
  ])

  // Modales
  const [showClientModal, setShowClientModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [activeItemIndexForProduct, setActiveItemIndexForProduct] = useState<number | null>(null)

  // Nouveaux objets modales
  const [newClient, setNewClient] = useState({ name: '', company: '', email: '', address: '' })
  const [newProduct, setNewProduct] = useState({ label: '', unit_price: 0, unit: 'Unité', vat_rate: 20 })

  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Dates gérées de manière sécurisée côté client pour le build Vercel
  const [currentDate, setCurrentDate] = useState<string>('')
  const [validUntilDate, setValidUntilDate] = useState<string>('')

  React.useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('fr-FR'))
    setValidUntilDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'))
  }, [])

  // Manipulation des articles
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

  // Sélection d'un produit du catalogue
  const handleSelectCatalogProduct = (index: number, productId: string) => {
    const selected = catalog.find((p) => p.id === productId)
    if (!selected) return

    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      description: selected.label,
      unit_price: selected.unit_price,
      unit: selected.unit,
      vat_rate: vatMode === 'global' ? globalVatRate : selected.vat_rate
    }
    setItems(newItems)
  }

  // Calculs
  const getItemTotalHt = (item: Item) => (item.quantity || 0) * (item.unit_price || 0)
  const subtotalHt = items.reduce((acc, item) => acc + getItemTotalHt(item), 0)
  const totalVat = items.reduce((acc, item) => {
    const rate = vatMode === 'global' ? globalVatRate : item.vat_rate
    return acc + (getItemTotalHt(item) * (rate / 100))
  }, 0)
  const totalTtc = subtotalHt + totalVat

  // Ajout Client
  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClient.name) return
    setClientName(newClient.name)
    setClientCompany(newClient.company)
    setClientEmail(newClient.email)
    setClientAddress(newClient.address)
    setShowClientModal(false)
    setNewClient({ name: '', company: '', email: '', address: '' })
  }

  // Ajout Produit
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

  // Enregistrement dans Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccessMessage('')

    try {
      const year = new Date().getFullYear()
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      const prefix = type === 'invoice' ? 'FAC' : 'DEV'
      const documentNumber = `#${prefix}-${year}-${randomNum}`

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
    } catch (err: any) {
      alert("Erreur lors de l'enregistrement : " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      
      {/* Barre supérieure */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-6">
        <Link href="/documents" className="flex items-center text-gray-600 hover:text-gray-900 text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux documents
        </Link>
        <h1 className="text-xl font-bold text-gray-900">
          Création de {type === 'quote' ? 'Devis' : 'Facture'}
        </h1>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium shadow text-sm flex items-center space-x-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Enregistrement...' : 'Enregistrer'}</span>
        </button>
      </div>

      {successMessage && (
        <div className="max-w-7xl mx-auto mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {successMessage}
        </div>
      )}

      {/* Grille principale 2 Colonnes */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLONNE GAUCHE : Formulaire de Saisie */}
        <div className="lg:col-span-6 space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          
          {/* Paramètres principaux */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Type de document</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'quote' | 'invoice')}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="quote">Devis</option>
                <option value="invoice">Facture</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Gestion de la TVA</label>
              <select
                value={vatMode}
                onChange={(e) => setVatMode(e.target.value as 'global' | 'per_product')}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="global">TVA identique (Globale)</option>
                <option value="per_product">TVA spécifique par produit</option>
              </select>
            </div>
          </div>

          {vatMode === 'global' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Taux de TVA globale (%)</label>
              <select
                value={globalVatRate}
                onChange={(e) => setGlobalVatRate(parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={20}>20 %</option>
                <option value={10}>10 %</option>
                <option value={5.5}>5,5 %</option>
                <option value={0}>0 %</option>
              </select>
            </div>
          )}

          {/* Section Client */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Information Client</h2>
              <button
                type="button"
                onClick={() => setShowClientModal(true)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" /> Nouveau Client
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nom du Client"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Entreprise / Société"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <textarea
              placeholder="Adresse complète"
              rows={2}
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description courte du document */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description courte du document</label>
            <input
              type="text"
              value={documentDescription}
              onChange={(e) => setDocumentDescription(e.target.value)}
              placeholder="Ex: Prestation de rénovation"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Section Lignes Produits */}
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Lignes d'articles</h2>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 border rounded-lg space-y-2">
                  
                  {/* Sélecteur de Catalogue & Désignation */}
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-5">
                      <select
                        onChange={(e) => handleSelectCatalogProduct(index, e.target.value)}
                        defaultValue=""
                        className="w-full border border-blue-200 bg-blue-50/50 rounded p-1.5 text-xs text-blue-900 font-medium outline-none"
                      >
                        <option value="" disabled>-- Choisir du catalogue --</option>
                        {catalog.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.label} ({cat.unit_price}€)</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-7 flex gap-1">
                      <input
                        type="text"
                        placeholder="Désignation"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="w-full border border-gray-300 rounded p-1.5 text-xs outline-none bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setActiveItemIndexForProduct(index)
                          setShowProductModal(true)
                        }}
                        title="Créer nouveau produit"
                        className="p-1.5 text-blue-600 hover:bg-blue-100 bg-white rounded border border-blue-300"
                      >
                        <PackagePlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Quantité, Unité, Prix U. HT, Total HT */}
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3">
                      <label className="block text-[10px] text-gray-500">Quantité</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded p-1.5 text-xs outline-none bg-white"
                      />
                    </div>

                    <div className="col-span-3">
                      <label className="block text-[10px] text-gray-500">Unité</label>
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(index, 'unit', e.target.value)}
                        className="w-full border border-gray-300 rounded p-1.5 text-xs outline-none bg-white"
                      >
                        <option value="Unité">Unité</option>
                        <option value="Heure">Heure</option>
                        <option value="Jour">Jour</option>
                        <option value="m²">m²</option>
                        <option value="Forfait">Forfait</option>
                      </select>
                    </div>

                    <div className="col-span-3">
                      <label className="block text-[10px] text-gray-500">Prix U. HT (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded p-1.5 text-xs outline-none bg-white"
                      />
                    </div>

                    {vatMode === 'per_product' ? (
                      <div className="col-span-2">
                        <label className="block text-[10px] text-gray-500">TVA %</label>
                        <select
                          value={item.vat_rate}
                          onChange={(e) => updateItem(index, 'vat_rate', parseFloat(e.target.value))}
                          className="w-full border border-gray-300 rounded p-1.5 text-xs outline-none bg-white"
                        >
                          <option value={20}>20%</option>
                          <option value={10}>10%</option>
                          <option value={5.5}>5.5%</option>
                          <option value={0}>0%</option>
                        </select>
                      </div>
                    ) : (
                      <div className="col-span-2 text-right">
                        <label className="block text-[10px] text-gray-500">Total HT</label>
                        <span className="text-xs font-bold text-gray-800">{getItemTotalHt(item).toFixed(2)} €</span>
                      </div>
                    )}

                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        className="text-red-500 hover:text-red-700 disabled:opacity-30 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 pt-1"
            >
              <Plus className="w-4 h-4 mr-1" /> Ajouter une ligne
            </button>
          </div>

        </div>


        {/* COLONNE DROITE : APERÇU TEMPS RÉEL (STYLE BATIPRO BLEU) */}
        <div className="lg:col-span-6 sticky top-6">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-gray-800 min-h-[700px] flex flex-col justify-between">
            
            <div>
              {/* En-tête Bleu */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 bg-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    G+
                  </div>
                  <span className="font-extrabold text-blue-900 text-lg tracking-wide">BATIPRO</span>
                </div>

                <div className="text-right text-xs text-blue-900 space-y-0.5 font-semibold">
                  <p className="font-bold text-sm text-blue-800">NOM DE MON ENTREPRISE</p>
                  <p className="text-gray-500">123 Rue de la République</p>
                  <p className="text-gray-500">01 23 45 67 89</p>
                  <p className="text-gray-500">www.monentreprise.fr</p>
                </div>
              </div>

              {/* Titre Document */}
              <div className="text-center my-6">
                <h1 className="text-3xl font-black tracking-widest text-blue-800 uppercase">
                  {type === 'quote' ? 'DEVIS' : 'FACTURE'}
                </h1>
              </div>

              {/* Méta-informations & Client */}
              <div className="grid grid-cols-2 gap-6 text-xs mb-6 border-t-2 border-b-2 border-blue-800 py-4">
                <div className="space-y-1">
                  <p><span className="font-bold text-gray-900">{type === 'quote' ? 'Devis No:' : 'Facture No:'}</span> #DEV-2026-1234</p>
                  <p><span className="font-bold text-gray-900">Date:</span> {currentDate}</p>
                  <p><span className="font-bold text-gray-900">Validité jusqu'au:</span> {validUntilDate}</p>
                  <p><span className="font-bold text-gray-900">Client:</span> 123456</p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-blue-900 text-sm">{clientName || 'Nom Client'}</p>
                  <p className="font-semibold text-gray-700">{clientCompany}</p>
                  <p className="whitespace-pre-line text-gray-600">{clientAddress || 'Adresse client'}</p>
                  <p className="text-gray-500">{clientEmail}</p>
                </div>
              </div>

              {/* Description courte */}
              {documentDescription && (
                <div className="mb-6 text-xs">
                  <span className="font-bold text-blue-900 uppercase tracking-wider mr-2">DESCRIPTION</span>
                  <span className="text-gray-700">{documentDescription}</span>
                </div>
              )}

              {/* Tableau Bleu Style BatiPro */}
              <div className="overflow-hidden rounded-md mb-6 border border-gray-100">
                <table className="w-full text-left text-xs">
                  <thead className="bg-blue-800 text-white font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-2 text-center w-16">Quantity</th>
                      <th className="py-2.5 px-3 text-right w-20">Price</th>
                      {vatMode === 'per_product' && <th className="py-2.5 px-2 text-right w-14">TVA</th>}
                      <th className="py-2.5 px-3 text-right w-24">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-gray-50/50">
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 text-gray-800 font-medium">
                          {item.description || 'Ligne de prestation'}
                        </td>
                        <td className="py-2.5 px-2 text-center text-gray-600">
                          {item.quantity} {item.unit !== 'Unité' ? item.unit : ''}
                        </td>
                        <td className="py-2.5 px-3 text-right text-gray-600">
                          {item.unit_price.toFixed(2)}€
                        </td>
                        {vatMode === 'per_product' && (
                          <td className="py-2.5 px-2 text-right text-gray-500">
                            {item.vat_rate}%
                          </td>
                        )}
                        <td className="py-2.5 px-3 text-right font-semibold text-gray-900">
                          {getItemTotalHt(item).toFixed(2)}€
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totaux */}
              <div className="flex justify-end text-xs mb-8">
                <div className="w-60 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Total HT</span>
                    <span className="font-semibold text-gray-900">{subtotalHt.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>TVA {vatMode === 'global' ? `${globalVatRate}%` : ''}</span>
                    <span className="font-semibold text-gray-900">{totalVat.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between bg-blue-800 text-white p-2.5 rounded font-bold text-sm">
                    <span>Total TTC</span>
                    <span>{totalTtc.toFixed(2)}€</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Pied de Page & Conditions */}
            <div className="border-t-2 border-blue-800 pt-4 space-y-4 text-[10px] text-gray-600">
              <div>
                <span className="font-bold text-blue-900 uppercase">CONDITIONS</span>{' '}
                Règlement : [30 % à la commande, solde à la livraison] — Mode : [Virement bancaire] — Pénalités de retard : taux directeur BCE + 10 pts.
              </div>

              <div className="pt-4 flex justify-around text-center">
                <div className="w-36 border-t border-gray-400 pt-1">
                  <p className="font-bold text-gray-800">BON POUR ACCORD</p>
                  <p className="text-[9px] text-gray-400 mt-6">Signature client</p>
                </div>
                <div className="w-36 border-t border-gray-400 pt-1">
                  <p className="font-bold text-gray-800">DATE</p>
                  <p className="text-[9px] text-gray-400 mt-6">Date d'acceptation</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* MODALE CLIENT */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button onClick={() => setShowClientModal(false)} className="absolute top-4 right-4 text-gray-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-blue-600" /> Ajouter un client
            </h3>
            <form onSubmit={handleSaveClient} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Nom *"
                required
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                className="w-full border p-2 rounded outline-none"
              />
              <input
                type="text"
                placeholder="Entreprise"
                value={newClient.company}
                onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                className="w-full border p-2 rounded outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                className="w-full border p-2 rounded outline-none"
              />
              <textarea
                placeholder="Adresse"
                rows={2}
                value={newClient.address}
                onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                className="w-full border p-2 rounded outline-none"
              />
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-semibold">
                Enregistrer le client
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODALE PRODUIT */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button onClick={() => setShowProductModal(false)} className="absolute top-4 right-4 text-gray-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <PackagePlus className="w-5 h-5 mr-2 text-blue-600" /> Créer un nouveau produit
            </h3>
            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Désignation *"
                required
                value={newProduct.label}
                onChange={(e) => setNewProduct({ ...newProduct, label: e.target.value })}
                className="w-full border p-2 rounded outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Prix Unitaire HT (€)"
                  required
                  value={newProduct.unit_price}
                  onChange={(e) => setNewProduct({ ...newProduct, unit_price: parseFloat(e.target.value) || 0 })}
                  className="border p-2 rounded outline-none"
                />
                <select
                  value={newProduct.unit}
                  onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                  className="border p-2 rounded outline-none"
                >
                  <option value="Unité">Unité</option>
                  <option value="Heure">Heure</option>
                  <option value="Jour">Jour</option>
                  <option value="m²">m²</option>
                  <option value="Forfait">Forfait</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-semibold">
                Ajouter à la ligne
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}