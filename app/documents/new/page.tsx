'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, Save, ArrowLeft, UserPlus, PackagePlus, X, FileText, Eye } from 'lucide-react'
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

  // Dates
  const currentDate = new Date().toLocaleDateString('fr-FR')
  const validUntilDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')

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

  // Sélection d'un produit du catalogue pour remplir la ligne
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
        
        {/* COLONNE GAUCHE : Formulaire de Saisie (7 cols) */}
        <div className="lg:col-span-6 space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          
          {/* Paramètres principaux */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b">
            <div>
              <label className="block text-