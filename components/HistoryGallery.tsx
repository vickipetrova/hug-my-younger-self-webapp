'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getPublicUrl } from '@/lib/storage'

type Generation = {
  id: string
  status: string
  output_image: string | null
  input_images: string[]
  created_at: string | null
  error_message: string | null
  credits_charged: number
}

type HistoryGalleryProps = {
  generations: Generation[]
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Unknown date'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
    processing: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Processing' },
    pending: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pending' },
    failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  )
}

type ModalState = {
  isOpen: boolean
  generation: Generation | null
}

export const HistoryGallery = ({ generations }: HistoryGalleryProps) => {
  const [modal, setModal] = useState<ModalState>({ isOpen: false, generation: null })
  const [isDownloading, setIsDownloading] = useState(false)

  const handleOpenModal = (generation: Generation) => {
    setModal({ isOpen: true, generation })
  }

  const handleCloseModal = () => {
    setModal({ isOpen: false, generation: null })
  }

  const handleKeyDownCard = (e: React.KeyboardEvent, generation: Generation) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleOpenModal(generation)
    }
  }

  const handleKeyDownClose = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
      e.preventDefault()
      handleCloseModal()
    }
  }

  const handleDownload = async (outputImage: string) => {
    setIsDownloading(true)
    try {
      const url = getPublicUrl(outputImage)
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `time-hug-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  // Empty state
  if (generations.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg ring-1 ring-black/5 p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-100 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-10 h-10 text-indigo-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No generations yet</h2>
        <p className="text-gray-600 mb-6">
          Create your first Time Hug by uploading photos of you and your younger self.
        </p>
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full shadow-lg transition-all hover:shadow-xl"
          tabIndex={0}
          aria-label="Create your first Time Hug"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684z" />
          </svg>
          Create Your First Time Hug
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {generations.map((generation) => (
          <div
            key={generation.id}
            role="button"
            tabIndex={0}
            onClick={() => handleOpenModal(generation)}
            onKeyDown={(e) => handleKeyDownCard(e, generation)}
            className="group bg-white rounded-2xl shadow-md ring-1 ring-black/5 overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            aria-label={`View generation from ${formatDate(generation.created_at)}`}
          >
            {/* Image */}
            <div className="relative aspect-square bg-gray-100">
              {generation.status === 'completed' && generation.output_image ? (
                <Image
                  src={getPublicUrl(generation.output_image)}
                  alt="Generated Time Hug"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : generation.status === 'processing' || generation.status === 'pending' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-50">
                  <svg className="animate-spin w-8 h-8 text-indigo-500 mb-2" viewBox="0 0 24 24" fill="none">
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
                  <span className="text-sm text-indigo-700">Processing...</span>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-8 h-8 text-red-400 mb-2"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-red-600">Generation failed</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <StatusBadge status={generation.status} />
                <span className="text-xs text-gray-400">{generation.credits_charged} credit</span>
              </div>
              <p className="text-sm text-gray-500">{formatDate(generation.created_at)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal.isOpen && modal.generation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleCloseModal}
          onKeyDown={handleKeyDownClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 id="modal-title" className="text-xl font-bold text-gray-900">
                  Time Hug
                </h2>
                <p className="text-sm text-gray-500">{formatDate(modal.generation.created_at)}</p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600"
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 text-gray-600"
                >
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {modal.generation.status === 'completed' && modal.generation.output_image ? (
                <>
                  <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg mb-6">
                    <Image
                      src={getPublicUrl(modal.generation.output_image)}
                      alt="Generated Time Hug"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 600px"
                      priority
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleDownload(modal.generation!.output_image!)}
                      disabled={isDownloading}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                      aria-label="Download image"
                    >
                      {isDownloading ? (
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
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-5 h-5"
                          >
                            <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                            <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                          </svg>
                          Download
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : modal.generation.status === 'failed' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-8 h-8 text-red-500"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Generation Failed</h3>
                  <p className="text-gray-600 mb-4">
                    {modal.generation.error_message || 'Something went wrong during generation.'}
                  </p>
                  <Link
                    href="/generate"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
                  >
                    Try Again
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="animate-spin w-12 h-12 text-indigo-500 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing</h3>
                  <p className="text-gray-600">Your Time Hug is being created. This may take a moment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

