'use client'

import React, { useState } from 'react'

export default function NewDocumentPage() {
  const [title, setTitle] = useState('Nouveau Devis')

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <p className="text-gray-600">Le formulaire de création de documents charge correctement.</p>
    </div>
  )
}