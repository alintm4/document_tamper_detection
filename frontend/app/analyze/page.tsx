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
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to analyze image. Make sure the backend is running.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20 pb-12 px-4">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Analyze Image
            </h1>
            <p className="text-gray-500 text-sm">
              Upload an image to verify its authenticity
            </p>
          </div>

          <ImageUploader onAnalyze={handleAnalyze} loading={loading} />

          {result && (
            <div className="mt-6">
              <ResultCard result={result} />
            </div>
          )}

          {/* Tips Section */}
          <div className="mt-10 p-5 bg-gray-50 rounded-lg">
            <h3 className="text-gray-900 font-medium mb-3 text-sm">Tips for best results</h3>
            <ul className="space-y-2 text-gray-500 text-sm">
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                Use high-resolution images
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                Avoid heavily compressed files
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                Original screenshots work best
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
