'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Search, FileText, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface Document {
  id: string
  type: 'quote' | 'invoice' | 'credit_note'
  number: string
  client_name: string
  status: 'draft' | 'sent' | 'paid' | 'cancelled'
  total_ht: number
  total_ttc: number
  created_at: string
}

export default function DocumentsListPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (err: any) {
      console.error('Erreur chargement documents:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.number?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || doc.type === filterType
    return matchesSearch && matchesType
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Payé</span>
      case 'sent':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">Envoyé</span>
      case 'cancelled':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Annulé</span>
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">Brouillon</span>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Retour à l'accueil
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Vos Documents</h1>
            <p className="text-sm text-gray-500">Gérez l'ensemble de vos devis, factures et avoirs.</p>
          </div>
          <Link
            href="/documents/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium shadow hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5 mr-1" /> Nouveau Document
          </Link>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher par client ou numéro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="quote">Devis</option>
              <option value="invoice">Factures</option>
            </select>
            <button
              onClick={fetchDocuments}
              className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
              title="Rafraîchir"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tableau des documents */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Chargement des documents...</div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-8 text-center text-gray-500 space-y-2">
              <FileText className="w-12 h-12 mx-auto text-gray-300" />
              <p>Aucun document trouvé.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Numéro</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Total HT</th>
                    <th className="py-3 px-4 text-right">Total TTC</th>
                    <th className="py-3 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-medium capitalize">
                        {doc.type === 'quote' ? 'Devis' : doc.type === 'invoice' ? 'Facture' : 'Avoir'}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-blue-600">{doc.number}</td>
                      <td className="py-3 px-4 text-gray-900 font-medium">{doc.client_name}</td>
                      <td className="py-3 px-4">{getStatusBadge(doc.status)}</td>
                      <td className="py-3 px-4 text-right font-medium">{Number(doc.total_ht).toFixed(2)} €</td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900">{Number(doc.total_ttc).toFixed(2)} €</td>
                      <td className="py-3 px-4 text-right text-gray-400">
                        {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}