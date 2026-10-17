import React, { ReactNode } from 'react'
import { DocumentStatus, DocumentType } from '@/types'

interface DocumentTemplateProps {
  template: 'classic' | 'modern' | 'corporate'
  type: DocumentType
  status: DocumentStatus
  companyName: string
  companyAddress: string
  companyPhone: string
  companyWeb: string
  companyLogo: string | null
  clientName: string
  clientCompany: string
  clientAddress: string
  documentNumber: string
  currentDate: string
  validUntilDate: string
  documentDescription: string
  conditions: string
  currency: string
  getStatusBadge: (status: DocumentStatus) => ReactNode
  children: ReactNode
  t: any
}

export default function DocumentTemplate({
  template,
  type,
  status,
  companyName,
  companyAddress,
  companyPhone,
  companyWeb,
  companyLogo,
  clientName,
  clientCompany,
  clientAddress,
  documentNumber,
  currentDate,
  validUntilDate,
  documentDescription,
  conditions,
  currency,
  getStatusBadge,
  children,
  t
}: DocumentTemplateProps) {
  return (
    <div
      className={`a4-page bg-white p-6 rounded-xl shadow-lg border text-gray-800 w-full flex flex-col justify-between relative ${
        template === 'corporate' ? 'border-blue-800 border-2' : 'border-gray-200'
      }`}
      style={{ minHeight: '297mm', boxSizing: 'border-box' }}
    >
      {/* 1. EN-TÊTE ET ZONE CENTRALE */}
      <div className="space-y-4">
        {template === 'classic' && (
          <div>
            <div className="flex justify-between items-center pb-2.5 mb-2.5 border-b-2 border-blue-900">
              <div className="flex items-center space-x-3">
                {companyLogo ? (
                  <img src={companyLogo} alt="Logo" className="h-10 w-auto object-contain" />
                ) : (
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-base shadow-md bg-blue-900 text-white">
                    G+
                  </div>
                )}
                <div>
                  <span className="font-black text-sm tracking-wide block uppercase text-blue-900">{companyName}</span>
                  {companyAddress && <p className="text-[9px] text-gray-500 whitespace-pre-line">{companyAddress}</p>}
                </div>
              </div>

              <div className="text-right">
                <h1 className="text-xl font-black tracking-widest uppercase mb-0.5 text-blue-900">
                  {type === 'quote' ? t.quote : t.invoice}
                </h1>
                <div className="inline-block">{getStatusBadge(status)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs py-1.5 px-3 bg-gray-50/50 rounded-lg border border-gray-200">
              <div className="space-y-0.5">
                <p><span className="font-bold text-gray-900">{type === 'quote' ? t.quoteNumber : t.invoiceNumber}</span> {documentNumber}</p>
                <p><span className="font-bold text-gray-900">{t.date}</span> {currentDate}</p>
                <p><span className="font-bold text-gray-900">{t.validUntil}</span> {validUntilDate}</p>
              </div>

              <div className="space-y-0.5 border-l pl-3 border-gray-200">
                <p className="font-bold text-xs text-blue-900">{clientName || 'Nom Client'}</p>
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
                <p className="text-xs text-gray-500 font-medium mt-0.5">{documentNumber}</p>
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
            <div className="p-3 mb-2.5 bg-blue-900 text-white rounded-lg flex justify-between items-center">
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
                <p className="text-[10px] text-blue-200">Réf: {documentNumber}</p>
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

        {documentDescription && (
          <div className="text-xs bg-blue-50/30 py-1 px-2.5 rounded border border-blue-100">
            <span className="font-bold uppercase tracking-wider mr-2 text-blue-900">{t.description} :</span>
            <span className="text-gray-800 font-medium">{documentDescription}</span>
          </div>
        )}

        {/* ARTICLES ET TOTAUX */}
        <div className="space-y-4">
          {children}
        </div>
      </div>

      {/* 2. PIED DE PAGE FIXE : CONDITIONS ET SIGNATURES (CALÉ EN BAS) */}
      <div className="pt-3 mt-6 text-[10px] text-gray-700" style={{ borderTop: '2px solid #1e3a8a' }}>
        <div className="mb-2">
          <span className="font-bold uppercase tracking-wider text-blue-900">{t.conditions} :</span>{' '}
          {conditions}
        </div>

        <div className="pt-2 flex justify-around text-center">
          <div className="w-36 border-t border-gray-400 pt-1">
            <p className="font-bold text-gray-900 uppercase text-[9px]">{t.goodForAgreement}</p>
            <p className="text-[9px] text-gray-400 mt-4">{t.signatureClient}</p>
          </div>
          <div className="w-36 border-t border-gray-400 pt-1">
            <p className="font-bold text-gray-900 uppercase text-[9px]">Date</p>
            <p className="text-[9px] text-gray-400 mt-4">{t.dateAcceptance}</p>
          </div>
        </div>
      </div>
    </div>
  )
}