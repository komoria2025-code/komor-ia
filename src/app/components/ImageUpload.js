'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image, Loader2 } from 'lucide-react'

export default function ImageUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value || null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return

    // Vérification type et taille
    if (!file.type.startsWith('image/')) {
      alert('Seules les images sont acceptées')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image trop lourde (max 5MB)')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload échoué')

      const data = await res.json()
      setPreview(data.url)
      onChange(data.url)
    } catch (error) {
      console.error(error)
      alert("Erreur lors de l'upload")
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const handleRemove = () => {
    setPreview(null)
    onChange('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      {preview ? (
        // Aperçu image
        <div className="relative rounded-xl overflow-hidden border border-gray-200">
          <img
            src={preview}
            alt="Aperçu"
            className="w-full h-48 object-cover"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-2">
            <span className="text-xs bg-black/50 text-white px-2 py-1 rounded">
              ✅ Image uploadée
            </span>
          </div>
        </div>
      ) : (
        // Zone de drop
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-sm text-gray-600">Upload en cours...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <Upload className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Glissez une image ou cliquez pour choisir
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WEBP — max 5MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files[0])}
        className="hidden"
      />
    </div>
  )
}
