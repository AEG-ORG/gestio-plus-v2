import React, { ReactNode } from 'react'
import { DocumentStatus, DocumentType } from '@/types'

interface DocumentTemplateProps {
  template: 'classic' | 'modern' | 'corporate' | 'minimalist'
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
    <div className="a4-container bg-white p-6 rounded-lg shadow-xl border border-gray-200 w-full aspect-[1/1.4142] flex flex-col justify-between overflow-hidden relative text-gray-800">
      
      {/* ------------------------------------------------------------- */}
      {/* HAUT & MILIEU (EN-TÊTE + DESCRIPTION + ARTICLES + TOTAUX)     */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-h-0 space-y-3">
        
        {/* --- 1. EN-TÊTE (SHRINK-0) --- */}
        <div className="shrink-0">
          {/* EN-TÊTE CLASSIQUE */}
          {template === 'classic' && (
            <div>
              <div className="flex justify-between items-center pb-2 mb-2 border-b-2 border-blue-900">
                <div className="flex items-center space-x-3">
                  {companyLogo ? (
                    <img src={companyLogo} alt="Logo" className="h-8 w-auto object-contain" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-blue-900 text-white font-black text-xs flex items-center justify-center shadow">
                      G+
                    </div>
                  )}
                  <div>
                    <span className="font-black text-xs tracking-wide block uppercase text-blue-900">{companyName}</span>
                    {companyAddress && <p className="text-[9px] text-gray-500 whitespace-pre-line">{companyAddress}</p>}
                  </div>
                </div>

                <div className="text-right">
                  <h1 className="text-base font-black tracking-widest uppercase text-blue-900">
                    {type === 'quote' ? t.quote : t.invoice}
                  </h1>
                  <div className="inline-block mt-0.5">{getStatusBadge(status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] py-1 px-2.5 bg-gray-50/80 rounded border border-gray-200">
                <div className="space-y-0.5">
                  <p><span className="font-bold text-gray-900">{type === 'quote' ? t.quoteNumber : t.invoiceNumber}</span> {documentNumber}</p>
                  <p><span className="font-bold text-gray-900">{t.date}</span> {currentDate}</p>
                  <p><span className="font-bold text-gray-900">{t.validUntil}</span> {validUntilDate}</p>
                </div>

                <div className="space-y-0.5 border-l pl-2.5 border-gray-200">
                  <p className="font-bold text-blue-900">{clientName || 'Nom Client'}</p>
                  <p className="font-semibold text-gray-700">{clientCompany}</p>
                  <p className="whitespace-pre-line text-gray-500 text-[9px] leading-tight">{clientAddress}</p>
                </div>
              </div>
            </div>
          )}

          {/* EN-TÊTE MODERNE */}
          {template === 'modern' && (
            <div>
              <div className="flex justify-between items-start pb-2 mb-2 border-b border-gray-200">
                <div>
                  <h1 className="text-xl font-light text-gray-900 uppercase tracking-tight">
                    {type === 'quote' ? t.quote : t.invoice}
                  </h1>
                  <p className="text-[10px] text-gray-500 font-mono">{documentNumber}</p>
                  <div className="mt-1">{getStatusBadge(status)}</div>
                </div>

                <div className="text-right flex items-center space-x-2">
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">{companyName}</span>
                    <p className="text-[9px] text-gray-500">{companyPhone} — {companyWeb}</p>
                  </div>
                  {companyLogo && <img src={companyLogo} alt="Logo" className="h-8 w-auto object-contain" />}
                </div>
              </div>

              <div className="flex justify-between text-[10px] text-gray-600 bg-gray-50 p-1.5 rounded">
                <div><span className="font-semibold text-gray-900">Client :</span> {clientName} ({clientCompany})</div>
                <div><span className="font-semibold text-gray-900">Date :</span> {currentDate}</div>
              </div>
            </div>
          )}

          {/* EN-TÊTE CORPORATE */}
          {template === 'corporate' && (
            <div>
              <div className="p-2 mb-2 bg-blue-900 text-white rounded flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  {companyLogo ? (
                    <img src={companyLogo} alt="Logo" className="h-7 w-auto object-contain bg-white p-0.5 rounded" />
                  ) : (
                    <div className="w-6 h-6 rounded bg-white text-blue-900 font-bold text-xs flex items-center justify-center">G+</div>
                  )}
                  <div>
                    <span className="font-black text-xs tracking-wider uppercase">{companyName}</span>
                    <p className="text-[8px] text-blue-200">{companyAddress}</p>
                  </div>
                </div>
                <div className="text-right">
                  <h1 className="text-sm font-black tracking-widest uppercase">{type === 'quote' ? t.quote : t.invoice}</h1>
                  <p className="text-[9px] text-blue-200">Réf: {documentNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] border-b pb-1">
                <div>
                  <p><span className="font-bold text-gray-900">Émis le :</span> {currentDate}</p>
                  <p><span className="font-bold text-gray-900">Validité :</span> {validUntilDate}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-900">{clientName} — {clientCompany}</p>
                  <p className="text-[9px] text-gray-500 whitespace-pre-line">{clientAddress}</p>
                </div>
              </div>
            </div>
          )}

          {/* EN-TÊTE MINIMALISTE */}
          {template === 'minimalist' && (
            <div className="border-b border-slate-200 pb-2 mb-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-lg font-light tracking-wide text-slate-900 uppercase">
                    {type === 'quote' ? t.quote : t.invoice}
                  </h1>
                  <p className="text-[10px] text-slate-500 font-mono">{documentNumber}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-xs text-slate-900 block">{companyName}</span>
                  {companyAddress && <p className="text-[8px] text-slate-500 whitespace-pre-line">{companyAddress}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] mt-2 pt-1.5 border-t border-slate-100">
                <div>
                  <p className="text-[8px] text-slate-400 uppercase tracking-wider font-semibold">Destinataire</p>
                  <p className="font-semibold text-slate-800">{clientName} ({clientCompany})</p>
                  <p className="text-slate-500 text-[9px] whitespace-pre-line">{clientAddress}</p>
                </div>
                <div className="text-right space-y-0.5">
                  <p><span className="text-slate-400">Date :</span> {currentDate}</p>
                  <p><span className="text-slate-400">Validité :</span> {validUntilDate}</p>
                  <div className="mt-0.5 flex justify-end">{getStatusBadge(status)}</div>
                </div>
              </div>
            </div>
          )}

          {/* DESCRIPTION MENTION */}
          {documentDescription && (
            <div className="text-[10px] bg-slate-50 py-1 px-2 rounded border border-slate-200 mt-2">
              <span className="font-bold uppercase tracking-wider mr-1 text-slate-700">{t.description} :</span>
              <span className="text-slate-800 font-medium">{documentDescription}</span>
            </div>
          )}
        </div>

        {/* --- 2. CONTENU CENTRAL (ARTICLES + TOTAUX) (FLEX-1) --- */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {children}
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* BAS (CONDITIONS & BLOC SIGNATURE / BON POUR ACCORD) (SHRINK-0)  */}
      {/* ------------------------------------------------------------- */}
      <div className="shrink-0 pt-2 border-t border-slate-300 text-[9px] text-gray-700">
        <div className="mb-2">
          <span className="font-bold uppercase tracking-wider text-slate-900">{t.conditions} :</span>{' '}
          {conditions}
        </div>

        <div className="flex justify-between items-end pt-1">
          <div className="w-36 border-t border-gray-400 pt-1 text-center">
            <p className="font-bold text-gray-900 uppercase text-[8px]">{t.goodForAgreement}</p>
            <p className="text-[8px] text-gray-400 mt-4">{t.signatureClient}</p>
          </div>
          <div className="w-36 border-t border-gray-400 pt-1 text-center">
            <p className="font-bold text-gray-900 uppercase text-[8px]">Date & Cachet</p>
            <p className="text-[8px] text-gray-400 mt-4">{t.dateAcceptance}</p>
          </div>
        </div>
      </div>

    </div>
  )
}