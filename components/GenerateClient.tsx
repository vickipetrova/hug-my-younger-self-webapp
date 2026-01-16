'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ImageUpload } from '@/components/ImageUpload'
import { GenerationResult } from '@/components/GenerationResult'
import { uploadImage, type UploadResult } from '@/lib/storage'

type GenerationState =
  | { status: 'idle' }
  | { status: 'ready' }
  | { status: 'uploading'; progress: string }
  | { status: 'generating' }
  | { status: 'completed'; outputUrl: string }
  | { status: 'error'; message: string }

type Template = {
  id: string
  name: string
  description: string
  creditCost: number
}

type GenerateClientProps = {
  userId: string
  credits: number
  template: Template
}

export const GenerateClient = ({ userId, credits, template }: GenerateClientProps) => {
  const { id: templateId, name: templateName, description: templateDescription, creditCost } = template
  const [recentPhoto, setRecentPhoto] = useState<File | null>(null)
  const [youngerPhoto, setYoungerPhoto] = useState<File | null>(null)
  const [state, setState] = useState<GenerationState>({ status: 'idle' })

  const canGenerate = recentPhoto && youngerPhoto && credits >= creditCost
  const hasEnoughCredits = credits >= creditCost

  const handleRecentPhotoChange = useCallback((file: File | null) => {
    setRecentPhoto(file)
    setState({ status: 'idle' })
  }, [])

  const handleYoungerPhotoChange = useCallback((file: File | null) => {
    setYoungerPhoto(file)
    setState({ status: 'idle' })
  }, [])

  const handleGenerate = async () => {
    if (!recentPhoto || !youngerPhoto || !canGenerate) return

    try {
      // Upload images
      setState({ status: 'uploading', progress: 'Uploading recent photo...' })
      const recentResult = await uploadImage(recentPhoto, userId, 'recent')
      if (!recentResult.success) {
        setState({ status: 'error', message: recentResult.error.message })
        return
      }

      setState({ status: 'uploading', progress: 'Uploading younger photo...' })
      const youngerResult = await uploadImage(youngerPhoto, userId, 'younger')
      if (!youngerResult.success) {
        setState({ status: 'error', message: youngerResult.error.message })
        return
      }

      // Call generation API
      setState({ status: 'generating' })
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recentImagePath: recentResult.data.path,
          youngerImagePath: youngerResult.data.path,
          templateId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setState({ status: 'error', message: data.error || 'Generation failed' })
        return
      }

      setState({ status: 'completed', outputUrl: data.outputUrl })
    } catch (error) {
      console.error('Generation error:', error)
      setState({ status: 'error', message: 'Something went wrong. Please try again.' })
    }
  }

  const handleGenerateAnother = useCallback(() => {
    setRecentPhoto(null)
    setYoungerPhoto(null)
    setState({ status: 'idle' })
  }, [])

  const handleKeyDownGenerate = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && canGenerate) {
      e.preventDefault()
      handleGenerate()
    }
  }

  const isProcessing = state.status === 'uploading' || state.status === 'generating'

  // Show result view when completed
  if (state.status === 'completed') {
    return (
      <div className="py-8">
        <GenerationResult outputUrl={state.outputUrl} onGenerateAnother={handleGenerateAnother} />
        <div className="mt-8 text-center">
          <Link
            href="/history"
            className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1"
            tabIndex={0}
            aria-label="View your past generations"
          >
            See past generations
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Title and description */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{templateName}</h1>
        <p className="text-gray-600 max-w-md mx-auto">{templateDescription}</p>
      </div>

      {/* Upload boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto w-full">
        <ImageUpload
          label="Photo 1: Recent You"
          sublabel="A current photo of yourself"
          value={recentPhoto}
          onChange={handleRecentPhotoChange}
          disabled={isProcessing}
        />
        <ImageUpload
          label="Photo 2: Younger You"
          sublabel="A childhood or younger photo"
          value={youngerPhoto}
          onChange={handleYoungerPhotoChange}
          disabled={isProcessing}
        />
      </div>

      {/* Error message */}
      {state.status === 'error' && (
        <div
          className="mx-auto max-w-md w-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-center"
          role="alert"
        >
          <p className="font-medium">Error</p>
          <p className="text-sm">{state.message}</p>
        </div>
      )}

      {/* Insufficient credits warning */}
      {!hasEnoughCredits && (
        <div className="mx-auto max-w-md w-full bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-3 rounded-xl text-center">
          <p className="font-medium">Not enough credits</p>
          <p className="text-sm">
            You need {creditCost} credit{creditCost !== 1 ? 's' : ''} to generate. You have {credits}.
          </p>
        </div>
      )}

      {/* Generate button */}
      <div className="text-center">
        <button
          type="button"
          onClick={handleGenerate}
          onKeyDown={handleKeyDownGenerate}
          disabled={!canGenerate || isProcessing}
          className={`
            inline-flex items-center justify-center gap-2 px-8 py-4
            bg-indigo-600 hover:bg-indigo-700
            text-white text-lg font-semibold rounded-full shadow-lg
            transition-all hover:shadow-xl hover:scale-[1.02]
            focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg
          `}
          aria-label={`Generate Time Hug for ${creditCost} credit${creditCost !== 1 ? 's' : ''}`}
          tabIndex={0}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {state.status === 'uploading' ? state.progress : 'Generating your Time Hug...'}
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684zM13.949 13.684a1 1 0 00-1.898 0l-.184.551a1 1 0 01-.632.633l-.551.183a1 1 0 000 1.898l.551.183a1 1 0 01.633.633l.183.551a1 1 0 001.898 0l.184-.551a1 1 0 01.632-.633l.551-.183a1 1 0 000-1.898l-.551-.184a1 1 0 01-.633-.632l-.183-.551z" />
              </svg>
              Generate ({creditCost} credit{creditCost !== 1 ? 's' : ''})
            </>
          )}
        </button>
      </div>

      {/* See past generations link */}
      <div className="text-center">
        <Link
          href="/history"
          className="text-gray-500 hover:text-indigo-600 text-sm inline-flex items-center gap-1 transition-colors"
          tabIndex={0}
          aria-label="View your past generations"
        >
          See past generations
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
    </div>
  )
}

