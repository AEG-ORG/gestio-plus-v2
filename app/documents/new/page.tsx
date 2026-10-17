'use client'

import React, { useState, useEffect, useRef, ChangeEvent } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Item,
  CatalogProduct,
  DocumentStatus,
  DocumentType,
  VatMode
} from '@/types'
import {
  calculateItemTotalHt,
  calculateSubtotalHt,
  calculateTotalVat,
  calculateTotalTtc,
  getStatusLabel
} from '@/lib/document-utils'
import { translations, Language } from '@/lib/i18n'
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  UserPlus,
  PackagePlus,
  X,
  Upload,
  Printer,
  FileCheck,
  ChevronDown,
  LayoutTemplate
} from 'lucide-react'
import Link from 'next/link'

interface LanguageSelectorProps {
  currentLanguage: Language
  onLanguageChange: (lang: Language) => void
}

const languages = [
  {
    code: 'fr' as Language,
    label: 'Français',
    flag: (
      <svg className="w-4 h-3 rounded-sm object-cover" viewBox="0 0 640 480">
        <g fillRule="evenodd" strokeWidth="1pt">
          <path fill="#fff" d="M0 0h640v480H0z"/>
          <path fill="#00267f" d="M0 0h213.3v480H0z"/>
          <path fill="#f31830" d="M426.7 0H640v480H426.7z"/>
        </g>
      </svg>
    )
  },
  {
    code: 'es' as Language,
    label: 'Español',
    flag: (
      <svg className="w-4 h-3 rounded-sm object-cover" viewBox="0 0 640 480">
        <path fill="#c60b1e" d="M0 0h640v480H0z"/>
        <path fill="#ffc400" d="M0 120h640v240H0z"/>
      </svg>
    )
  },
  {
    code: 'en' as Language,
    label: 'English',
    flag: (
      <svg className="w-4 h-3 rounded-sm object-cover" viewBox="0 0 640 480">
        <path fill="#012169" d="M0 0h640v480H0z"/>
        <path fill="#fff" d="m0 0 640 480M640 0 0 480" stroke="#fff" strokeWidth="60"/>
        <path fill="#c8102e" d="m0 0 640 480M640 0 0 480" stroke="#c8102e" strokeWidth="40"/>
        <path fill="#fff" d="M280 0h80v480h-80zM0 200h640v80H0z"/>
        <path fill="#c8102e" d="M300 0h40v480h-40zM0 220h640v40H0z"/>
      </svg>
    )
  }
]

function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selected = languages.find((l) => l.code === currentLanguage) || languages[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gray-50 border border-gray-300 hover:bg-gray-100 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-800 shadow-sm transition outline-none"
      >
        {selected.flag}
        <span>{selected.label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                onLanguageChange(lang.code)
                setIsOpen(false)
              }}
              className={`flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-medium hover:bg-blue-50 transition ${
                currentLanguage === lang.code ? 'bg-blue-50/80 font-bold text-blue-900' : 'text-gray-700'
              }`}
            >
              {lang.flag}
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function NewDocumentPage() {
  const [type, setType] = useState<DocumentType>('quote')
  const [status, setStatus] = useState<DocumentStatus>('draft')
  const [language, setLanguage] = useState<Language>('fr')
  const t = translations[language]

  const [template, setTemplate] = useState<'classic' | 'modern' | 'corporate'>('classic')

  const [clientName, setClientName] = useState('Marie Philippe')
  const [clientCompany, setClientCompany] = useState('COGIP')
  const [clientAddress, setClientAddress] = useState('13, quai Branly\n75002 Paris')
  const [clientEmail, setClientEmail] = useState('marie.philippe@cogip.fr')
  const [documentDescription, setDocumentDescription] = useState('Prestation de rénovation et d\'aménagement')
  const [conditions, setConditions] = useState(
    'Règlement : [30 % à la commande, solde à la livraison] — Mode : [Virement bancaire]'
  )
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)

  const [companyName, setCompanyName] = useState('BATIPRO SARL')
  const [companyAddress, setCompanyAddress] = useState('123 Rue de la République, 75011 Paris')
  const [companyPhone, setCompanyPhone] = useState('01 23 45 67 89')
  const [companyWeb, setCompanyWeb] = useState('www.batipro-renov.fr')

  const [vatMode, setVatMode] = useState<VatMode>('global')
  const [globalVatRate, setGlobalVatRate] = useState<number>(20)
  const [currency, setCurrency] = useState<string>('€')

  const [discountValue, setDiscountValue] = useState<number>(0)
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent')

  const [catalog] = useState<CatalogProduct[]>([
    { id: '1', label: 'Prestation de conseil & étude', unit_price: 100, unit: 'Heure', vat_rate: 20 },
    { id: '2', label: 'Peinture murale acrylique', unit_price: 45, unit: 'm²', vat_rate: 10 },
    { id: '3', label: 'Pose de revêtement de sol', unit_price: 60, unit: 'm²', vat_rate: 20 },
  ])

  const [items, setItems] = useState<Item[]>([
    { description: 'Prestation 1 - Préparation des supports', quantity: 5, unit: 'Unité', unit_price: 100, vat_rate: 20 }
  ])

  const [showClientModal, setShowClientModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [activeItemIndexForProduct, setActiveItemIndexForProduct] = useState<number | null>(null)

  const [newClient, setNewClient] = useState({ name: '', company: '', email: '', address: '' })
  const [newProduct, setNewProduct] = useState({ label: '', unit_price: 0, unit: 'Unité', vat_rate: 20 })

  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const [currentDate, setCurrentDate] = useState<string>('')
  const [validUntilDate, setValidUntilDate] = useState<string>('')

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('fr-FR'))
    setValidUntilDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'))
  }, [])

  const handleTypeChange = (newType: DocumentType) => {
    setType(newType)
    setStatus('draft')
  }

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setCompanyLogo(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

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

  const rawSubtotalHt = calculateSubtotalHt(items)
  
  let calculatedDiscountAmount = 0
  if (discountValue > 0) {
    if (discountType === 'percent') {
      calculatedDiscountAmount = (rawSubtotalHt * discountValue) / 100
    } else {
      calculatedDiscountAmount = discountValue
    }
  }
  const subtotalHt = Math.max(0, rawSubtotalHt - calculatedDiscountAmount)

  const totalVat = vatMode === 'global'
    ? (subtotalHt * globalVatRate) / 100
    : items.reduce((acc, item) => acc + (calculateItemTotalHt(item) * item.vat_rate) / 100, 0) * (subtotalHt / (rawSubtotalHt || 1))

  const totalTtc = subtotalHt + totalVat

  const handleConvertToInvoice = () => {
    setType('invoice')
    setStatus('draft')
    setSuccessMessage('Devis converti en Facture avec succès.')
  }

  const handlePrint = () => {
    window.print()
  }

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
        total_ht: calculateItemTotalHt(item)
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
          status,
          language,
          created_at: new Date().toISOString()
        }
      ])

      if (error) throw error
      setSuccessMessage('Document enregistré avec succès !')
    } catch (err: any) {
      alert('Erreur lors de l\'enregistrement : ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (st: DocumentStatus) => {
    switch (st) {
      case 'draft':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-300">{t.draft}</span>
      case 'sent':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">{t.sent}</span>
      case 'accepted':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">{t.accepted}</span>
      case 'rejected':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">{t.rejected}</span>
      case 'expired':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">{t.expired}</span>
      case 'paid':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">{t.paid}</span>
      case 'partially_paid':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-300">{t.partiallyPaid}</span>
      case 'overdue':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">{t.overdue}</span>
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-600 border border-gray-400">{t.cancelled}</span>
      default:
        return null
    }
  }

  const ITEMS_PER_PAGE = 12
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE) || 1
  const pages = Array.from({ length: totalPages }, (_, pageIndex) => {
    return items.slice(pageIndex * ITEMS_PER_PAGE, (pageIndex + 1) * ITEMS_PER_PAGE)
  })

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 pb-12">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }

          html, body {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            overflow: hidden !important;
          }

          .no-print {
            display: none !important;
          }

          #printable-area {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
          }

          .a4-page {
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            box-sizing: border-box !important;
            padding: 10mm 15mm 10mm 15mm !important;
            margin: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            outline: none !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            gap: 16px !important;
            overflow: hidden !important;
            page-break-after: always;
            page-break-inside: avoid;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          ::-webkit-scrollbar {
            display: none !important;
          }
        }
      `}</style>

      {/* HEADER FIXE */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm no-print px-4 sm:px-6 lg:px-8 py-3 mb-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
          
          <div className="flex items-center space-x-3">
            <Link href="/documents" className="flex items-center text-gray-700 hover:text-gray-900 text-sm font-medium">
              <ArrowLeft className="w-4 h-4 mr-1" /> {t.backToDocuments}
            </Link>
            <span className="text-gray-300">|</span>
            <h1 className="text-lg font-bold text-gray-900">
              {type === 'quote' ? t.createQuote : t.createInvoice}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {type === 'quote' && status === 'accepted' && (
              <button
                onClick={handleConvertToInvoice}
                type="button"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center space-x-1.5 shadow transition"
              >
                <FileCheck className="w-4 h-4" />
                <span>{t.invoiceQuote}</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              type="button"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg font-medium border border-gray-300 text-xs flex items-center space-x-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              <span>{t.print}</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-medium shadow text-xs flex items-center space-x-1.5 disabled:opacity-50 transition"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? t.saving : t.save}</span>
            </button>

            <LanguageSelector
              currentLanguage={language}
              onLanguageChange={(lang) => setLanguage(lang)}
            />
          </div>

        </div>
      </div>

      {successMessage && (
        <div className="max-w-7xl mx-auto mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-medium no-print">
          {successMessage}
        </div>
      )}

      {/* GRILLE 2 COLONNES */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLONNE GAUCHE (Formulaire) */}
        <div className="lg:col-span-6 space-y-5 bg-white p-6 rounded-xl shadow-sm border border-gray-200 no-print">
          
          <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-lg space-y-2">
            <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wider">{t.artisanIdentity}</h2>
            <div className="flex items-center gap-3">
              {companyLogo ? (
                <div className="relative w-14 h-14 border rounded bg-white overflow-hidden flex items-center justify-center">
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
                <label className="w-14 h-14 border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100/50 text-blue-600">
                  <Upload className="w-4 h-4 mb-0.5" />
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

          {/* SÉLECTEUR DE MODÈLE */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <LayoutTemplate className="w-4 h-4 text-blue-600" /> Modèle de document
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTemplate('classic')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                  template === 'classic'
                    ? 'bg-blue-600 text-white border-blue-600 shadow'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                Classique
              </button>
              <button
                type="button"
                onClick={() => setTemplate('modern')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                  template === 'modern'
                    ? 'bg-blue-600 text-white border-blue-600 shadow'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                Moderne
              </button>
              <button
                type="button"
                onClick={() => setTemplate('corporate')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                  template === 'corporate'
                    ? 'bg-blue-600 text-white border-blue-600 shadow'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                Corporate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pb-2 border-b">
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">{t.documentType}</label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value as DocumentType)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs text-gray-900 outline-none bg-white"
              >
                <option value="quote">{t.quote}</option>
                <option value="invoice">{t.invoice}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">{t.status}</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DocumentStatus)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs text-gray-900 font-medium outline-none bg-white"
              >
                {type === 'quote' ? (
                  <>
                    <option value="draft">{t.draft}</option>
                    <option value="sent">{t.sent}</option>
                    <option value="accepted">{t.accepted}</option>
                    <option value="rejected">{t.rejected}</option>
                    <option value="expired">{t.expired}</option>
                  </>
                ) : (
                  <>
                    <option value="draft">{t.draft}</option>
                    <option value="sent">{t.sent}</option>
                    <option value="paid">{t.paid}</option>
                    <option value="partially_paid">{t.partiallyPaid}</option>
                    <option value="overdue">{t.overdue}</option>
                    <option value="cancelled">{t.cancelled}</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">Devise</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs text-gray-900 font-semibold outline-none bg-white"
              >
                <option value="€">Euros (€)</option>
                <option value="$">Dollars ($)</option>
                <option value="£">Livres (£)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-2 border-b">
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">{t.vatManagement}</label>
              <select
                value={vatMode}
                onChange={(e) => setVatMode(e.target.value as VatMode)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs text-gray-900 outline-none bg-white"
              >
                <option value="global">{t.globalVat}</option>
                <option value="per_product">{t.perProductVat}</option>
              </select>
            </div>

            {vatMode === 'global' && (
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">{t.globalVatRate}</label>
                <select
                  value={globalVatRate}
                  onChange={(e) => setGlobalVatRate(parseFloat(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs text-gray-900 outline-none bg-white"
                >
                  <option value={20}>20 %</option>
                  <option value={10}>10 %</option>
                  <option value={5.5}>5,5 %</option>
                  <option value={0}>0 %</option>
                </select>
              </div>
            )}
          </div>

          {/* GESTION DE LA REMISE */}
          <div className="pb-2 border-b space-y-2">
            <label className="block text-xs font-semibold text-gray-900">Remise globale</label>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-7">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Valeur de la remise"
                  value={discountValue || ''}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs text-gray-900 outline-none bg-white font-medium"
                />
              </div>
              <div className="col-span-5">
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'percent' | 'amount')}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs text-gray-900 outline-none bg-white font-medium"
                >
                  <option value="percent">Pourcentage (%)</option>
                  <option value="amount">Montant ({currency})</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{t.clientInfo}</h2>
              <button
                type="button"
                onClick={() => setShowClientModal(true)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" /> {t.newClient}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder={t.clientNamePlaceholder}
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 text-sm text-gray-900 outline-none bg-white placeholder-gray-400"
              />
              <input
                type="text"
                placeholder={t.clientCompanyPlaceholder}
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 text-sm text-gray-900 outline-none bg-white placeholder-gray-400"
              />
            </div>
            <textarea
              placeholder={t.clientAddressPlaceholder}
              rows={2}
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-900 outline-none bg-white placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">{t.shortDescription}</label>
            <input
              type="text"
              value={documentDescription}
              onChange={(e) => setDocumentDescription(e.target.value)}
              placeholder="Ex: Prestation de rénovation"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-900 outline-none bg-white placeholder-gray-400"
            />
          </div>

          <div className="space-y-3 pt-1">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{t.lineItems}</h2>

            <div className="space-y-2.5">
              {items.map((item, index) => (
                <div key={index} className="p-2.5 bg-gray-50 border rounded-lg space-y-2">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-5">
                      <select
                        onChange={(e) => handleSelectCatalogProduct(index, e.target.value)}
                        defaultValue=""
                        className="w-full border border-blue-300 bg-white rounded p-1.5 text-xs text-blue-900 font-semibold outline-none"
                      >
                        <option value="" disabled>{t.catalogPlaceholder}</option>
                        {catalog.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.label} ({cat.unit_price}{currency})</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-7 flex gap-1">
                      <input
                        type="text"
                        placeholder={t.designationPlaceholder}
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

                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3">
                      <label className="block text-[10px] font-semibold text-gray-700">{t.qty}</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded p-1.5 text-xs text-gray-900 outline-none bg-white font-medium"
                      />
                    </div>

                    <div className="col-span-3">
                      <label className="block text-[10px] font-semibold text-gray-700">{t.unit}</label>
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
                      <label className="block text-[10px] font-semibold text-gray-700">{t.unitPriceHt} ({currency})</label>
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
                        <label className="block text-[10px] font-semibold text-gray-700">{t.vat} %</label>
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
                        <label className="block text-[10px] font-semibold text-gray-700">{t.totalHt}</label>
                        <span className="text-xs font-bold text-gray-900">{calculateItemTotalHt(item).toFixed(2)} {currency}</span>
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
              <Plus className="w-4 h-4 mr-1" /> {t.addArticle}
            </button>
          </div>

          <div className="pt-1">
            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
              {t.termsAndConditions}
            </label>
            <textarea
              rows={2}
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-xs text-gray-900 outline-none bg-white"
            />
          </div>

        </div>


        {/* COLONNE DROITE (APERÇU A4) */}
        <div id="printable-area" className="lg:col-span-6 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto space-y-6 pr-1">
          
          {pages.map((pageItems, pageIndex) => {
            const isLastPage = pageIndex === totalPages - 1

            return (
              <div
                key={pageIndex}
                className={`a4-page bg-white p-6 rounded-xl shadow-lg border text-gray-800 w-full min-h-[842px] flex flex-col justify-between relative overflow-hidden ${
                  template === 'corporate' ? 'border-blue-800 border-2' : 'border-gray-200'
                }`}
              >
                
                {/* BLOC SUPÉRIEUR */}
                <div className="space-y-4">
                  
                  {template === 'classic' && (
                    <div>
                      <div className="flex justify-between items-center pb-2.5 mb-2.5 border-b-2 border-blue-900">
                        <div className="flex items-center space-x-3">
                          {companyLogo ? (
                            <img src={companyLogo} alt="Logo" className="h-10 w-auto object-contain" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-base shadow-md" style={{ backgroundColor: '#1e40af', color: '#ffffff', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                              G+
                            </div>
                          )}
                          <div>
                            <span className="font-black text-sm tracking-wide block uppercase" style={{ color: '#1e3a8a' }}>{companyName}</span>
                            {companyAddress && <p className="text-[9px] text-gray-500 whitespace-pre-line">{companyAddress}</p>}
                          </div>
                        </div>

                        <div className="text-right">
                          <h1 className="text-xl font-black tracking-widest uppercase mb-0.5" style={{ color: '#1e3a8a' }}>
                            {type === 'quote' ? t.quote : t.invoice}
                          </h1>
                          <div className="inline-block">{getStatusBadge(status)}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs py-1.5 px-3 bg-gray-50/50 rounded-lg border border-gray-200">
                        <div className="space-y-0.5">
                          <p><span className="font-bold text-gray-900">{type === 'quote' ? t.quoteNumber : t.invoiceNumber}</span> #{type === 'quote' ? 'DEV' : 'FAC'}-2026-1234</p>
                          <p><span className="font-bold text-gray-900">{t.date}</span> {currentDate}</p>
                          <p><span className="font-bold text-gray-900">{t.validUntil}</span> {validUntilDate}</p>
                        </div>

                        <div className="space-y-0.5 border-l pl-3 border-gray-200">
                          <p className="font-bold text-xs" style={{ color: '#1e3a8a' }}>{clientName || 'Nom Client'}</p>
                          <p className="font-semibold text-gray-700">{clientCompany}</p>
                          <p className="whitespace-pre-line text-gray-600 text-[10px] leading-tight">{clientAddress || 'Adresse client'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {template === 'modern' && (
                    <div>
                      <div className="flex justify-between items-start pb-3 mb-3 border-b border-gray-200">
                        <div>
                          <h1 className="text-3xl font-light tracking-tight text-gray-900 uppercase">
                            {type === 'quote' ? t.quote : t.invoice}
                          </h1>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">#{type === 'quote' ? 'DEV' : 'FAC'}-2026-1234</p>
                          <div className="mt-2">{getStatusBadge(status)}</div>
                        </div>

                        <div className="text-right flex items-center space-x-3">
                          <div>
                            <span className="font-bold text-sm text-gray-900 block">{companyName}</span>
                            <p className="text-[9px] text-gray-500">{companyPhone} — {companyWeb}</p>
                          </div>
                          {companyLogo && <img src={companyLogo} alt="Logo" className="h-10 w-auto object-contain" />}
                        </div>
                      </div>

                      <div className="flex justify-between text-xs text-gray-600 bg-gray-50/60 p-2.5 rounded-lg">
                        <div>
                          <span className="font-semibold text-gray-900">Client :</span> {clientName} ({clientCompany})
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-gray-900">Date :</span> {currentDate}
                        </div>
                      </div>
                    </div>
                  )}

                  {template === 'corporate' && (
                    <div>
                      <div className="p-3 mb-2.5 bg-blue-900 text-white rounded-lg flex justify-between items-center" style={{ backgroundColor: '#1e3a8a', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                        <div className="flex items-center space-x-3">
                          {companyLogo ? (
                            <img src={companyLogo} alt="Logo" className="h-9 w-auto object-contain bg-white p-1 rounded" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-white text-blue-900 flex items-center justify-center font-bold text-sm">G+</div>
                          )}
                          <div>
                            <span className="font-black text-sm tracking-wider uppercase">{companyName}</span>
                            <p className="text-[9px] text-blue-200">{companyAddress}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <h1 className="text-lg font-black tracking-widest uppercase">{type === 'quote' ? t.quote : t.invoice}</h1>
                          <p className="text-[10px] text-blue-200">Réf: #{type === 'quote' ? 'DEV' : 'FAC'}-2026-1234</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs border-b pb-2">
                        <div>
                          <p><span className="font-bold text-gray-900">Émis le :</span> {currentDate}</p>
                          <p><span className="font-bold text-gray-900">Validité :</span> {validUntilDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-900">{clientName} — {clientCompany}</p>
                          <p className="text-[10px] text-gray-600 whitespace-pre-line">{clientAddress}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {pageIndex === 0 && documentDescription && (
                    <div className="text-xs bg-blue-50/30 py-1 px-2.5 rounded border border-blue-100">
                      <span className="font-bold uppercase tracking-wider mr-2" style={{ color: '#1e3a8a' }}>{t.description} :</span>
                      <span className="text-gray-800 font-medium">{documentDescription}</span>
                    </div>
                  )}

                  {/* TABLEAU DES ARTICLES */}
                  <div className="overflow-hidden rounded-md border border-gray-200 shadow-sm">
                    <table className="w-full text-left text-xs table-fixed border-collapse">
                      <thead>
                        <tr style={{ backgroundColor: template === 'modern' ? '#374151' : '#1e40af', color: '#ffffff', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                          <th className="py-1.5 px-3 font-bold">{t.descriptionHeader}</th>
                          <th className="py-1.5 px-2 text-center w-16 font-bold">{t.quantity}</th>
                          <th className="py-1.5 px-3 text-right w-20 font-bold">{t.unitPrice}</th>
                          {vatMode === 'per_product' && <th className="py-1.5 px-2 text-right w-14 font-bold">{t.vat}</th>}
                          <th className="py-1.5 px-3 text-right w-24 font-bold">{t.totalHt}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {pageItems.map((item, idx) => (
                          <tr key={idx} className="align-top">
                            <td className="py-1.5 px-3 text-gray-900 font-medium break-words whitespace-pre-wrap leading-relaxed">
                              {item.description || 'Ligne de prestation'}
                            </td>
                            <td className="py-1.5 px-2 text-center text-gray-700 whitespace-nowrap">
                              {item.quantity} {item.unit !== 'Unité' ? item.unit : ''}
                            </td>
                            <td className="py-1.5 px-3 text-right text-gray-700 whitespace-nowrap">
                              {item.unit_price.toFixed(2)}{currency}
                            </td>
                            {vatMode === 'per_product' && (
                              <td className="py-1.5 px-2 text-right text-gray-600 whitespace-nowrap">
                                {item.vat_rate}%
                              </td>
                            )}
                            <td className="py-1.5 px-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                              {calculateItemTotalHt(item).toFixed(2)}{currency}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* TOTAUX AVEC REMISE (Parenthèses uniquement si pourcentage) */}
                  {isLastPage && (
                    <div className="flex justify-end text-xs">
                      <div className="w-52 space-y-0.5 bg-gray-50/80 p-2 rounded-lg border border-gray-200">
                        <div className="flex justify-between text-gray-700">
                          <span>Sous-total HT</span>
                          <span className="font-semibold text-gray-900">{rawSubtotalHt.toFixed(2)}{currency}</span>
                        </div>

                        {discountValue > 0 && (
                          <div className="flex justify-between text-emerald-700 font-medium">
                            <span>
                              Remise {discountType === 'percent' ? `(${discountValue}%)` : `${discountValue}${currency}`}
                            </span>
                            <span>-{calculatedDiscountAmount.toFixed(2)}{currency}</span>
                          </div>
                        )}

                        {discountValue > 0 && (
                          <div className="flex justify-between text-gray-700 border-t pt-0.5 border-gray-200">
                            <span>{t.totalHt} net</span>
                            <span className="font-semibold text-gray-900">{subtotalHt.toFixed(2)}{currency}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-gray-700">
                          <span>{t.vat} {vatMode === 'global' ? `${globalVatRate}%` : ''}</span>
                          <span className="font-semibold text-gray-900">{totalVat.toFixed(2)}{currency}</span>
                        </div>

                        <div className="flex justify-between p-1.5 rounded font-bold text-sm shadow-sm" style={{ backgroundColor: template === 'modern' ? '#374151' : '#1e40af', color: '#ffffff', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                          <span>{t.totalTtc}</span>
                          <span>{totalTtc.toFixed(2)}{currency}</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* BLOC INFÉRIEUR : PIED DE PAGE & SIGNATURES */}
                {isLastPage && (
                  <div className="pt-2 text-[10px] text-gray-700 shrink-0" style={{ borderTop: '2px solid #1e3a8a' }}>
                    <div className="mb-1.5">
                      <span className="font-bold uppercase tracking-wider" style={{ color: '#1e3a8a' }}>{t.conditions} :</span>{' '}
                      {conditions}
                    </div>

                    <div className="pt-1 flex justify-around text-center">
                      <div className="w-36 border-t border-gray-400 pt-1">
                        <p className="font-bold text-gray-900 uppercase text-[9px]">{t.goodForAgreement}</p>
                        <p className="text-[9px] text-gray-400 mt-3">{t.signatureClient}</p>
                      </div>
                      <div className="w-36 border-t border-gray-400 pt-1">
                        <p className="font-bold text-gray-900 uppercase text-[9px]">Date</p>
                        <p className="text-[9px] text-gray-400 mt-3">{t.dateAcceptance}</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )
          })}

        </div>

      </div>

      {/* MODALES CLIENT ET PRODUIT */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button onClick={() => setShowClientModal(false)} className="absolute top-4 right-4 text-gray-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-blue-600" /> {t.newClient}
            </h3>
            <form onSubmit={handleSaveClient} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Nom *"
                required
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                className="w-full border p-2 rounded outline-none bg-white text-gray-900"
              />
              <input
                type="text"
                placeholder="Entreprise"
                value={newClient.company}
                onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                className="w-full border p-2 rounded outline-none bg-white text-gray-900"
              />
              <input
                type="email"
                placeholder="Email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                className="w-full border p-2 rounded outline-none bg-white text-gray-900"
              />
              <textarea
                placeholder="Adresse"
                rows={2}
                value={newClient.address}
                onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                className="w-full border p-2 rounded outline-none bg-white text-gray-900"
              />
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-semibold">
                {t.save}
              </button>
            </form>
          </div>
        </div>
      )}

      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button onClick={() => setShowProductModal(false)} className="absolute top-4 right-4 text-gray-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <PackagePlus className="w-5 h-5 mr-2 text-blue-600" /> Nouveau produit
            </h3>
            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Désignation *"
                required
                value={newProduct.label}
                onChange={(e) => setNewProduct({ ...newProduct, label: e.target.value })}
                className="w-full border p-2 rounded outline-none bg-white text-gray-900"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder={`Prix Unitaire HT (${currency})`}
                  required
                  value={newProduct.unit_price}
                  onChange={(e) => setNewProduct({ ...newProduct, unit_price: parseFloat(e.target.value) || 0 })}
                  className="border p-2 rounded outline-none bg-white text-gray-900"
                />
                <select
                  value={newProduct.unit}
                  onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                  className="border p-2 rounded outline-none bg-white text-gray-900"
                >
                  <option value="Unité">Unité</option>
                  <option value="Heure">Heure</option>
                  <option value="Jour">Jour</option>
                  <option value="m²">m²</option>
                  <option value="Forfait">Forfait</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-semibold">
                {t.save}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}