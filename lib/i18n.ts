export type Language = 'fr' | 'es' | 'en'

export interface TranslationDictionary {
  backToDocuments: string
  createQuote: string
  createInvoice: string
  save: string
  saving: string
  print: string
  invoiceQuote: string
  artisanIdentity: string
  documentType: string
  status: string
  languageLabel: string
  vatManagement: string
  globalVat: string
  perProductVat: string
  globalVatRate: string
  clientInfo: string
  newClient: string
  clientNamePlaceholder: string
  clientCompanyPlaceholder: string
  clientAddressPlaceholder: string
  shortDescription: string
  lineItems: string
  catalogPlaceholder: string
  designationPlaceholder: string
  qty: string
  unit: string
  unitPriceHt: string
  addArticle: string
  termsAndConditions: string
  quote: string
  invoice: string
  quoteNumber: string
  invoiceNumber: string
  date: string
  validUntil: string
  description: string
  descriptionHeader: string
  quantity: string
  unitPrice: string
  vat: string
  totalHt: string
  totalTtc: string
  conditions: string
  goodForAgreement: string
  signatureClient: string
  dateAcceptance: string
  page: string
  draft: string
  sent: string
  accepted: string
  rejected: string
  expired: string
  paid: string
  partiallyPaid: string
  overdue: string
  cancelled: string
}

export const translations: Record<Language, TranslationDictionary> = {
  fr: {
    backToDocuments: 'Documents',
    createQuote: 'Création de Devis',
    createInvoice: 'Création de Facture',
    save: 'Enregistrer',
    saving: 'Enregistrement...',
    print: 'Imprimer / PDF',
    invoiceQuote: 'Facturer le devis',
    artisanIdentity: 'Identité / Logo Artisan',
    documentType: 'Type de document',
    status: 'Statut',
    languageLabel: 'Langue',
    vatManagement: 'Gestion TVA',
    globalVat: 'TVA Globale',
    perProductVat: 'TVA / produit',
    globalVatRate: 'Taux de TVA globale (%)',
    clientInfo: 'Information Client',
    newClient: 'Nouveau Client',
    clientNamePlaceholder: 'Nom du Client',
    clientCompanyPlaceholder: 'Entreprise / Société',
    clientAddressPlaceholder: 'Adresse complète',
    shortDescription: 'Description courte du document',
    lineItems: 'Lignes d\'articles',
    catalogPlaceholder: '-- Choisir du catalogue --',
    designationPlaceholder: 'Désignation de la prestation',
    qty: 'Qté',
    unit: 'Unité',
    unitPriceHt: 'Prix U. HT (€)',
    addArticle: 'Ajouter une ligne',
    termsAndConditions: 'Conditions Générales de Règlement',
    quote: 'DEVIS',
    invoice: 'FACTURE',
    quoteNumber: 'Devis No:',
    invoiceNumber: 'Facture No:',
    date: 'Date:',
    validUntil: 'Validité jusqu\'au:',
    description: 'DESCRIPTION:',
    descriptionHeader: 'Description',
    quantity: 'Qté',
    unitPrice: 'Prix U.',
    vat: 'TVA',
    totalHt: 'Total HT',
    totalTtc: 'Total TTC',
    conditions: 'CONDITIONS:',
    goodForAgreement: 'BON POUR ACCORD',
    signatureClient: 'Signature client',
    dateAcceptance: 'Date d\'acceptation',
    page: 'Page',
    draft: 'Brouillon',
    sent: 'Envoyé',
    accepted: 'Accepté / Signé',
    rejected: 'Refusé',
    expired: 'Expiré',
    paid: 'Payée',
    partiallyPaid: 'Partiellement payée',
    overdue: 'En retard',
    cancelled: 'Annulée'
  },
  es: {
    backToDocuments: 'Documentos',
    createQuote: 'Creación de Presupuesto',
    createInvoice: 'Creación de Factura',
    save: 'Guardar',
    saving: 'Guardando...',
    print: 'Imprimir / PDF',
    invoiceQuote: 'Facturar presupuesto',
    artisanIdentity: 'Identidad / Logo',
    documentType: 'Tipo de documento',
    status: 'Estado',
    languageLabel: 'Idioma',
    vatManagement: 'Gestión IVA',
    globalVat: 'IVA Global',
    perProductVat: 'IVA / producto',
    globalVatRate: 'Tasa de IVA global (%)',
    clientInfo: 'Información del Cliente',
    newClient: 'Nuevo Cliente',
    clientNamePlaceholder: 'Nombre del Cliente',
    clientCompanyPlaceholder: 'Empresa',
    clientAddressPlaceholder: 'Dirección completa',
    shortDescription: 'Descripción corta',
    lineItems: 'Líneas de artículos',
    catalogPlaceholder: '-- Elegir del catálogo --',
    designationPlaceholder: 'Descripción del servicio',
    qty: 'Cant.',
    unit: 'Unidad',
    unitPriceHt: 'Precio U. sin IVA (€)',
    addArticle: 'Añadir línea',
    termsAndConditions: 'Términos y condiciones',
    quote: 'PRESUPUESTO',
    invoice: 'FACTURA',
    quoteNumber: 'Presupuesto N°:',
    invoiceNumber: 'Factura N°:',
    date: 'Fecha:',
    validUntil: 'Válido hasta:',
    description: 'DESCRIPCIÓN:',
    descriptionHeader: 'Descripción',
    quantity: 'Cant.',
    unitPrice: 'Precio U.',
    vat: 'IVA',
    totalHt: 'Subtotal',
    totalTtc: 'Total',
    conditions: 'CONDICIONES:',
    goodForAgreement: 'CONFORME Y ACEPTADO',
    signatureClient: 'Firma cliente',
    dateAcceptance: 'Fecha de aceptación',
    page: 'Página',
    draft: 'Borrador',
    sent: 'Enviado',
    accepted: 'Aceptado / Firmado',
    rejected: 'Rechazado',
    expired: 'Vencido',
    paid: 'Pagada',
    partiallyPaid: 'Parcialmente pagada',
    overdue: 'Atrasada',
    cancelled: 'Cancelada'
  },
  en: {
    backToDocuments: 'Documents',
    createQuote: 'Create Quote',
    createInvoice: 'Create Invoice',
    save: 'Save',
    saving: 'Saving...',
    print: 'Print / PDF',
    invoiceQuote: 'Convert to Invoice',
    artisanIdentity: 'Business Identity / Logo',
    documentType: 'Document type',
    status: 'Status',
    languageLabel: 'Language',
    vatManagement: 'Tax Management',
    globalVat: 'Global VAT',
    perProductVat: 'VAT / item',
    globalVatRate: 'Global VAT rate (%)',
    clientInfo: 'Client Information',
    newClient: 'New Client',
    clientNamePlaceholder: 'Client Name',
    clientCompanyPlaceholder: 'Company',
    clientAddressPlaceholder: 'Full Address',
    shortDescription: 'Short description',
    lineItems: 'Line items',
    catalogPlaceholder: '-- Select from catalog --',
    designationPlaceholder: 'Service description',
    qty: 'Qty',
    unit: 'Unit',
    unitPriceHt: 'Unit Price Excl. VAT (€)',
    addArticle: 'Add line item',
    termsAndConditions: 'Terms & Conditions',
    quote: 'QUOTE',
    invoice: 'INVOICE',
    quoteNumber: 'Quote No:',
    invoiceNumber: 'Invoice No:',
    date: 'Date:',
    validUntil: 'Valid until:',
    description: 'DESCRIPTION:',
    descriptionHeader: 'Description',
    quantity: 'Qty',
    unitPrice: 'Unit Price',
    vat: 'VAT',
    totalHt: 'Subtotal',
    totalTtc: 'Total Amount',
    conditions: 'TERMS & CONDITIONS:',
    goodForAgreement: 'APPROVED AND ACCEPTED',
    signatureClient: 'Client signature',
    dateAcceptance: 'Acceptance date',
    page: 'Page',
    draft: 'Draft',
    sent: 'Sent',
    accepted: 'Accepted / Signed',
    rejected: 'Rejected',
    expired: 'Expired',
    paid: 'Paid',
    partiallyPaid: 'Partially Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled'
  }
}