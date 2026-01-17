'use client';

import { useState, DragEvent, ChangeEvent } from 'react';

interface ImageUploaderProps {
  onAnalyze: (file: File) => void;
  loading: boolean;
}

export default function ImageUploader({ onAnalyze, loading }: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (selectedFile: File) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleAnalyze = () => {
    if (file && onAnalyze) {
      onAnalyze(file);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
  };

  if (!preview) {
    return (
      <div
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
          dragActive
            ? 'border-gray-400 bg-gray-50 scale-[1.02]'
            : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="mb-5">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto">
            <svg
              className="h-8 w-8 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
        <p className="text-gray-700 font-medium mb-1">Drop your image here</p>
        <p className="text-gray-400 text-sm mb-5">or click to browse from your computer</p>
        <label className="cursor-pointer inline-flex items-center px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-all hover:shadow-md">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Choose File
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
          />
        </label>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden bg-gray-100">
        <img
          src={preview}
          alt="Preview"
          className="w-full h-64 object-contain"
        />
        <button
          onClick={reset}
          className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-xl text-gray-600 shadow-sm transition-all hover:shadow"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1.5 bg-white/90 rounded-lg text-xs font-medium text-gray-600 shadow-sm">
            Ready to analyze
          </span>
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className={`w-full py-3.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center ${
          loading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-900 hover:bg-gray-800 text-white hover:shadow-lg'
        }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing image...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Analyze Image
          </>
        )}
      </button>
    </div>
  );
}
