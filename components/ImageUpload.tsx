'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { validateFile, type UploadError } from '@/lib/storage'

type ImageUploadProps = {
  label: string
  sublabel?: string
  value: File | null
  onChange: (file: File | null) => void
  disabled?: boolean
  error?: string
}

export const ImageUpload = ({
  label,
  sublabel,
  value,
  onChange,
  disabled = false,
  error,
}: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      const validation = validateFile(file)
      if (validation) {
        setValidationError(validation.message)
        return
      }

      setValidationError(null)

      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      onChange(file)
    },
    [onChange]
  )

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (disabled) return

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFile(files[0])
      }
    },
    [disabled, handleFile]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFile(files[0])
      }
    },
    [handleFile]
  )

  const handleClick = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click()
    }
  }, [disabled])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
        e.preventDefault()
        inputRef.current?.click()
      }
    },
    [disabled]
  )

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl(null)
      setValidationError(null)
      onChange(null)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    },
    [previewUrl, onChange]
  )

  const displayError = error || validationError

  return (
    <div className="flex flex-col gap-2">
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {sublabel && <p className="text-xs text-gray-500">{sublabel}</p>}
      </div>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`${label} - ${value ? 'Click to replace' : 'Click or drag to upload'}`}
        aria-disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative w-full aspect-square rounded-2xl border-2 border-dashed transition-all
          ${isDragging ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : ''}
          ${value ? 'border-transparent' : 'border-gray-300 hover:border-indigo-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${displayError ? 'border-red-400 bg-red-50' : ''}
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
          overflow-hidden
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif"
          onChange={handleInputChange}
          disabled={disabled}
          className="sr-only"
          aria-hidden="true"
        />

        {previewUrl && value ? (
          <>
            <Image
              src={previewUrl}
              alt={`Preview of ${label}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 300px"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <span className="text-white font-medium text-sm bg-black/50 px-3 py-1.5 rounded-full">
                Click to replace
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Remove image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-indigo-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700 text-center">
              {isDragging ? 'Drop image here' : 'Drag & drop or click'}
            </p>
            <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WebP, GIF, HEIC up to 10MB</p>
          </div>
        )}
      </div>

      {displayError && (
        <p className="text-sm text-red-600 text-center" role="alert">
          {displayError}
        </p>
      )}
    </div>
  )
}

