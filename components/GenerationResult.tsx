'use client'

import Image from 'next/image'
import { useState } from 'react'

type GenerationResultProps = {
  outputUrl: string
  onGenerateAnother: () => void
}

export const GenerationResult = ({ outputUrl, onGenerateAnother }: GenerationResultProps) => {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(outputUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `time-hug-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleKeyDownDownload = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleDownload()
    }
  }

  const handleKeyDownGenerate = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onGenerateAnother()
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Time Hug is ready! 🎉</h2>
        <p className="text-gray-600">Download your creation or generate another one.</p>
      </div>

      <div className="relative w-full max-w-lg aspect-square rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10">
        <Image
          src={outputUrl}
          alt="Generated Time Hug image showing you hugging your younger self"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 512px"
          priority
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <button
          type="button"
          onClick={handleDownload}
          onKeyDown={handleKeyDownDownload}
          disabled={isDownloading}
          className={`
            flex-1 flex items-center justify-center gap-2 px-6 py-3 
            bg-indigo-600 hover:bg-indigo-700 
            text-white font-semibold rounded-xl shadow-lg 
            transition-all hover:shadow-xl hover:scale-[1.02]
            focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2
            disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100
          `}
          aria-label="Download your Time Hug image"
          tabIndex={0}
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

        <button
          type="button"
          onClick={onGenerateAnother}
          onKeyDown={handleKeyDownGenerate}
          className="
            flex-1 flex items-center justify-center gap-2 px-6 py-3 
            bg-white hover:bg-gray-50 
            text-gray-700 font-semibold rounded-xl shadow-md 
            ring-1 ring-gray-200
            transition-all hover:shadow-lg
            focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2
          "
          aria-label="Generate another Time Hug"
          tabIndex={0}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
              clipRule="evenodd"
            />
          </svg>
          Generate Another
        </button>
      </div>
    </div>
  )
}

