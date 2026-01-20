'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageUploader from '@/components/ImageUploader';
import ResultCard from '@/components/ResultCard';

interface AnalysisResult {
  result?: 'authentic' | 'manipulated';
  confidence?: number;
  error?: string;
  heatmap_url?: string;
  original_url?: string;
  filename?: string;
  heatmap_filename?: string;
}

export default function AnalyzePage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (file: File) => {
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      // Map backend response to our interface
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const analysisResult: AnalysisResult = {
        result: data.is_manipulated ? 'manipulated' : 'authentic',
        confidence: data.confidence_score ? data.confidence_score / 100 : undefined,
        error: data.error,
        filename: data.filename,
        heatmap_filename: data.heatmap_filename,
        // Build URLs for images
        original_url: data.filename ? `${apiUrl}/uploads/${data.filename}` : undefined,
        heatmap_url: data.heatmap_filename ? `${apiUrl}/uploads/${data.heatmap_filename}` : undefined,
      };
      
      setResult(analysisResult);
    } catch (error) {
      setResult({ error: 'Failed to analyze image. Make sure the backend is running.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-sm mb-5">
              <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Analyze Image
            </h1>
            <p className="text-gray-500 text-base max-w-md mx-auto">
              Upload an image to verify its authenticity using our AI-powered detection system
            </p>
          </div>

          {/* Main Upload Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <ImageUploader onAnalyze={handleAnalyze} loading={loading} />

            {result && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <ResultCard result={result} />
              </div>
            )}
          </div>

          {/* Tips Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-gray-900 font-semibold text-sm mb-1">High Resolution</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Use high-resolution images for better accuracy</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-gray-900 font-semibold text-sm mb-1">Original Files</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Avoid heavily compressed or re-saved files</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-gray-900 font-semibold text-sm mb-1">Screenshots</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Original screenshots work best for analysis</p>
            </div>
          </div>

          {/* Supported Formats */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Supported formats: JPG, PNG, WebP • Max file size: 10MB
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
