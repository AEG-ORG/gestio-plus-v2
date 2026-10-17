'use client'

import React, { useState, useEffect, ChangeEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, Save, ArrowLeft, UserPlus, PackagePlus, X, Upload, Image as ImageIcon } from 'lucide-react'
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
  // Document State
  const [type, setType] = useState<'quote' | 'invoice'>('quote')
  const [clientName, setClientName] = useState('Marie Philippe')
  const [clientCompany, setClientCompany] = useState('COGIP')
  const [clientAddress, setClientAddress] = useState('13, quai Branly\n75002 Paris')
  const [clientEmail, setClientEmail] = useState('marie.philippe@cogip.fr')
  const [documentDescription, setDocumentDescription] = useState('Prestation de rénovation et d\'aménagement')
  const [conditions, setConditions] = useState(
    'Règlement : [30 % à la commande, solde à la livraison] — Mode : [Virement bancaire] — Pénalités de retard : taux directeur BCE + 10 pts. Délai de rétractation : 14 jours.'
  )
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)

  // Artisan Info
  const [companyName, setCompanyName] = useState('BATIPRO SARL')
  const [companyAddress, setCompanyAddress] = useState('123 Rue de la République, 75011 Paris')
  const [companyPhone, setCompanyPhone] = useState('01 23 45 67 89')
  const [companyWeb, setCompanyWeb] = useState('www.batipro-renov.fr')

  // TVA State
  const [vatMode, setVatMode] = useState<'global' | 'per_product'>('global')
  const [globalVatRate, setGlobalVatRate] = useState<number>(20)

  // Catalogue
  const [catalog] = useState<CatalogProduct[]>([
    { id: '1', label: 'Prestation de conseil & étude', unit_price: 100, unit: 'Heure', vat_rate: 20 },
    { id: '2', label: 'Peinture murale acrylique', unit_price: 45, unit: 'm²', vat_rate: 10 },
    { id: '3', label: 'Pose de revêtement de sol PVC', unit_price: 60, unit: 'm²', vat_rate: 20 },
    { id: '4', label: 'Forfait installation sanitaire', unit_price: 350, unit: 'Forfait', vat_rate: 20 },
  ])

  // Articles
  const [items, setItems] = useState<Item[]>([
    { description: 'Prestation 1 - Préparation des supports', quantity: 5, unit: 'Unité', unit_price: 100, vat_rate: 20 },
    { description: 'Prestation 2 - Application sous-couche', quantity: 5, unit: 'Unité', unit_price: 100, vat_rate: 20 },
    { description: 'Prestation 3 - Finitions et fin de chantier', quantity: 5, unit: 'Unité', unit_price: 100, vat_rate: 20 }
  ])

  // Modales
  const [showClientModal, setShowClientModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [activeItemIndexForProduct, setActiveItemIndexForProduct] = useState<number | null>(null)

  const [newClient, setNewClient] = useState({ name: '', company: '', email: '', address: '' })
  const [newProduct, setNewProduct] = useState({ label: '', unit_price: 0, unit: 'Unité', vat_rate: 20 })

  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Dates
  const [currentDate, setCurrentDate] = useState<string>('')
  const [validUntilDate, setValidUntilDate] = useState<string>('')

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('fr-FR'))
    setValidUntilDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'))
  }, [])

  // Gestion du Logo
  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Articles Handlers
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

  // Modal Handlers
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

  // Supabase Save
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

  // Découpage automatique pour format A4 (6 articles par page)
  const ITEMS_PER_PAGE = 6
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE) || 1
  const pages = Array.from({ length: totalPages }, (_, pageIndex) => {
    return items.slice(pageIndex * ITEMS_PER_PAGE, (pageIndex + 1) * ITEMS_PER_PAGE)
  })

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8 font-sans text-gray-900">
      
      {/* Barre supérieure */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-6">
        <Link href="/documents" className="flex items-center text-gray-700 hover:text-gray-900 text-sm font-medium">
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
        <div className="max-w-7xl mx-auto mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-medium">
          {successMessage}
        </div>
      )}

      {/* Grille principale 2 Colonnes */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLONNE GAUCHE : Formulaire de Saisie */}
        <div className="lg:col-span-6 space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          
          {/* Logo Artisan & Infos */}
          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg space-y-3">
            <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Identité / Logo Artisan</h2>
            <div className="flex items-center gap-4">
              {companyLogo ? (
                <div className="relative w-16 h-16 border rounded bg-white overflow-hidden flex items-center justify-center">
                  <img src={companyLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => setCompanyLogo(null)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="w-16 h-16 border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100/50 text-blue-600">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[9px] font-semibold">Logo</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              )}

              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Nom de l'entreprise"
                  className="w-full border border-gray-300 rounded p-1.5 text-xs text-gray-900 font-semibold outline-none bg-white placeholder-gray-400"
                />
                <input
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="Adresse de l'entreprise"
                  className="w-full border border-gray-300 rounded p-1.5 text-xs text-gray-900 outline-none bg-white placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Paramètres principaux */}
          <div className="grid grid-cols-2 gap-4 pb-2 border-b">
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">Type de document</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'quote' | 'invoice')}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="quote">Devis</option>
                <option value="invoice">Facture</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">Gestion de la TVA</label>
              <select
                value={vatMode}
                onChange={(e) => setVatMode(e.target.value as 'global' | 'per_product')}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="global">TVA identique (Globale)</option>
                <option value="per_product">TVA spécifique par produit</option>
              </select>
            </div>
          </div>

          {vatMode === 'global' && (
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">Taux de TVA globale (%)</label>
              <select
                value={globalVatRate}
                onChange={(e) => setGlobalVatRate(parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value={20}>20 %</option>
                <option value={10}>10 %</option>
                <option value={5.5}>5,5 %</option>
                <option value={0}>0 %</option>
              </select>
            </div>
          )}

          {/* Client */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Information Client</h2>
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
                className="border border-gray-300 rounded-lg p-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="Entreprise / Société"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder-gray-400"
              />
            </div>
            <textarea
              placeholder="Adresse complète"
              rows={2}
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder-gray-400"
            />
          </div>

          {/* Description courte */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">Description courte du document</label>
            <input
              type="text"
              value={documentDescription}
              onChange={(e) => setDocumentDescription(e.target.value)}
              placeholder="Ex: Prestation de rénovation"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder-gray-400"
            />
          </div>

          {/* Section Lignes Articles */}
          <div className="space-y-3 pt-2">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Lignes d'articles</h2>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 border rounded-lg space-y-2">
                  
                  {/* Sélecteur Catalogue & Désignation */}
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-5">
                      <select
                        onChange={(e) => handleSelectCatalogProduct(index, e.target.value)}
                        defaultValue=""
                        className="w-full border border-blue-300 bg-white rounded p-1.5 text-xs text-blue-900 font-semibold outline-none"
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
                        placeholder="Désignation de la prestation"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="w-full border border-gray-300 rounded p-1.5 text-xs text-gray-900 font-medium outline-none bg-white placeholder-gray-500"
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

                  {/* Quantité, Unité, Prix, Total */}
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3">
                      <label className="block text-[10px] font-semibold text-gray-700">Qté</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded p-1.5 text-xs text-gray-900 outline-none bg-white font-medium"
                      />
                    </div>

                    <div className="col-span-3">
                      <label className="block text-[10px] font-semibold text-gray-700">Unité</label>
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(index, 'unit', e.target.value)}
                        className="w-full border border-gray-300 rounded p-1.5 text-xs text-gray-900 outline-none bg-white font-medium"
                      >
                        <option value="Unité">Unité</option>
                        <option value="Heure">Heure</option>
                        <option value="Jour">Jour</option>
                        <option value="m²">m²</option>
                        <option value="Forfait">Forfait</option>
                      </select>
                    </div>

                    <div className="col-span-3">
                      <label className="block text-[10px] font-semibold text-gray-700">Prix U. HT (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded p-1.5 text-xs text-gray-900 outline-none bg-white font-medium"
                      />
                    </div>

                    {vatMode === 'per_product' ? (
                      <div className="col-span-2">
                        <label className="block text-[10px] font-semibold text-gray-700">TVA %</label>
                        <select
                          value={item.vat_rate}
                          onChange={(e) => updateItem(index, 'vat_rate', parseFloat(e.target.value))}
                          className="w-full border border-gray-300 rounded p-1.5 text-xs text-gray-900 outline-none bg-white font-medium"
                        >
                          <option value={20}>20%</option>
                          <option value={10}>10%</option>
                          <option value={5.5}>5.5%</option>
                          <option value={0}>0%</option>
                        </select>
                      </div>
                    ) : (
                      <div className="col-span-2 text-right">
                        <label className="block text-[10px] font-semibold text-gray-700">Total HT</label>
                        <span className="text-xs font-bold text-gray-900">{getItemTotalHt(item).toFixed(2)} €</span>
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

          {/* Conditions de vente personnalisables */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
              Conditions Générales de Règlement
            </label>
            <textarea
              rows={3}
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

        </div>


        {/* COLONNE DROITE : APERÇU A4 MULTI-PAGES EN TEMPS RÉEL */}
        <div className="lg:col-span-6 space-y-8">
          
          {pages.map((pageItems, pageIndex) => {
            const isLastPage = pageIndex === totalPages - 1

            return (
              <div
                key={pageIndex}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-gray-800 w-full min-h-[842px] flex flex-col justify-between relative overflow-hidden"
                style={{ aspectRatio: '1 / 1.414' }} // Ratio A4
              >
                
                <div>
                  {/* En-tête Répété sur chaque Page A4 */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-3">
                      {companyLogo ? (
                        <img src={companyLogo} alt="Logo" className="h-12 w-auto object-contain" />
                      ) : (
                        <div className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                          G+
                        </div>
                      )}
                      <div>
                        <span className="font-extrabold text-blue-900 text-lg tracking-wide block">{companyName}</span>
                        {companyAddress && <p className="text-[10px] text-gray-500">{companyAddress}</p>}
                      </div>
                    </div>

                    <div className="text-right text-[10px] text-blue-900 space-y-0.5 font-semibold">
                      <p className="font-bold text-xs text-blue-800">{companyName}</p>
                      <p className="text-gray-500">{companyPhone}</p>
                      <p className="text-gray-500">{companyWeb}</p>
                      <p className="text-blue-600 font-bold">Page {pageIndex + 1} / {totalPages}</p>
                    </div>
                  </div>

                  {/* Titre Document */}
                  <div className="text-center my-4">
                    <h1 className="text-2xl font-black tracking-widest text-blue-800 uppercase">
                      {type === 'quote' ? 'DEVIS' : 'FACTURE'}
                    </h1>
                  </div>

                  {/* Méta-informations & Client */}
                  <div className="grid grid-cols-2 gap-4 text-xs mb-4 border-t-2 border-b-2 border-blue-800 py-3">
                    <div className="space-y-0.5">
                      <p><span className="font-bold text-gray-900">{type === 'quote' ? 'Devis No:' : 'Facture No:'}</span> #DEV-2026-1234</p>
                      <p><span className="font-bold text-gray-900">Date:</span> {currentDate}</p>
                      <p><span className="font-bold text-gray-900">Validité jusqu'au:</span> {validUntilDate}</p>
                    </div>

                    <div className="space-y-0.5">
                      <p className="font-bold text-blue-900 text-xs">{clientName || 'Nom Client'}</p>
                      <p className="font-semibold text-gray-700">{clientCompany}</p>
                      <p className="whitespace-pre-line text-gray-600 text-[11px]">{clientAddress || 'Adresse client'}</p>
                    </div>
                  </div>

                  {/* Description courte (Page 1 uniquement) */}
                  {pageIndex === 0 && documentDescription && (
                    <div className="mb-4 text-xs">
                      <span className="font-bold text-blue-900 uppercase tracking-wider mr-2">DESCRIPTION:</span>
                      <span className="text-gray-800">{documentDescription}</span>
                    </div>
                  )}

                  {/* Tableau des Articles pour cette Page */}
                  <div className="overflow-hidden rounded-md mb-4 border border-gray-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-blue-800 text-white font-bold">
                        <tr>
                          <th className="py-2 px-3">Description</th>
                          <th className="py-2 px-2 text-center w-16">Qté</th>
                          <th className="py-2 px-3 text-right w-20">Prix U.</th>
                          {vatMode === 'per_product' && <th className="py-2 px-2 text-right w-14">TVA</th>}
                          <th className="py-2 px-3 text-right w-24">Total HT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-gray-50/50">
                        {pageItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 text-gray-900 font-medium">
                              {item.description || 'Ligne de prestation'}
                            </td>
                            <td className="py-2 px-2 text-center text-gray-700">
                              {item.quantity} {item.unit !== 'Unité' ? item.unit : ''}
                            </td>
                            <td className="py-2 px-3 text-right text-gray-700">
                              {item.unit_price.toFixed(2)}€
                            </td>
                            {vatMode === 'per_product' && (
                              <td className="py-2 px-2 text-right text-gray-600">
                                {item.vat_rate}%
                              </td>
                            )}
                            <td className="py-2 px-3 text-right font-semibold text-gray-900">
                              {getItemTotalHt(item).toFixed(2)}€
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totaux (Dernière Page Uniquement) */}
                  {isLastPage && (
                    <div className="flex justify-end text-xs mb-6">
                      <div className="w-56 space-y-1.5">
                        <div className="flex justify-between text-gray-700">
                          <span>Total HT</span>
                          <span className="font-semibold text-gray-900">{subtotalHt.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                          <span>TVA {vatMode === 'global' ? `${globalVatRate}%` : ''}</span>
                          <span className="font-semibold text-gray-900">{totalVat.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between bg-blue-800 text-white p-2 rounded font-bold text-sm">
                          <span>Total TTC</span>
                          <span>{totalTtc.toFixed(2)}€</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Bas de page & Conditions (Dernière Page Uniquement) */}
                {isLastPage && (
                  <div className="border-t-2 border-blue-800 pt-3 space-y-3 text-[10px] text-gray-700">
                    <div>
                      <span className="font-bold text-blue-900 uppercase">CONDITIONS:</span>{' '}
                      {conditions}
                    </div>

                    <div className="pt-2 flex justify-around text-center">
                      <div className="w-36 border-t border-gray-400 pt-1">
                        <p className="font-bold text-gray-900">BON POUR ACCORD</p>
                        <p className="text-[9px] text-gray-500 mt-5">Signature client</p>
                      </div>
                      <div className="w-36 border-t border-gray-400 pt-1">
                        <p className="font-bold text-gray-900">DATE</p>
                        <p className="text-[9px] text-gray-500 mt-5">Date d'acceptation</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )
          })}

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
                className="w-full border p-2 rounded outline-none text-gray-900 bg-white"
              />
              <input
                type="text"
                placeholder="Entreprise"
                value={newClient.company}
                onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                className="w-full border p-2 rounded outline-none text-gray-900 bg-white"
              />
              <input
                type="email"
                placeholder="Email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                className="w-full border p-2 rounded outline-none text-gray-900 bg-white"
              />
              <textarea
                placeholder="Adresse"
                rows={2}
                value={newClient.address}
                onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                className="w-full border p-2 rounded outline-none text-gray-900 bg-white"
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
                className="w-full border p-2 rounded outline-none text-gray-900 bg-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Prix Unitaire HT (€)"
                  required
                  value={newProduct.unit_price}
                  onChange={(e) => setNewProduct({ ...newProduct, unit_price: parseFloat(e.target.value) || 0 })}
                  className="border p-2 rounded outline-none text-gray-900 bg-white"
                />
                <select
                  value={newProduct.unit}
                  onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                  className="border p-2 rounded outline-none text-gray-900 bg-white"
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