'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Analysis {
  id: number;
  filename: string;
  result: 'authentic' | 'manipulated';
  date: string;
  confidence: number;
}

export default function DashboardPage() {
  const [recentAnalyses] = useState<Analysis[]>([
    { id: 1, filename: 'screenshot_001.png', result: 'authentic', date: '2026-01-17', confidence: 0.95 },
    { id: 2, filename: 'document_scan.jpg', result: 'manipulated', date: '2026-01-16', confidence: 0.87 },
    { id: 3, filename: 'receipt_photo.png', result: 'authentic', date: '2026-01-15', confidence: 0.92 },
  ]);

  const stats = {
    totalAnalyses: 47,
    authenticCount: 38,
    manipulatedCount: 9,
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={true} />
      
      <main className="flex-1 pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm">Your analysis overview</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-gray-500 text-xs mb-1">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalAnalyses}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-gray-500 text-xs mb-1">Authentic</p>
              <p className="text-2xl font-semibold text-green-600">{stats.authenticCount}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-gray-500 text-xs mb-1">Manipulated</p>
              <p className="text-2xl font-semibold text-red-600">{stats.manipulatedCount}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/analyze"
                className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-gray-900 text-sm font-medium">New Analysis</h3>
                  <p className="text-gray-500 text-xs">Upload an image</p>
                </div>
              </Link>

              <Link
                href="/history"
                className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-gray-900 text-sm font-medium">History</h3>
                  <p className="text-gray-500 text-xs">View past analyses</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Analyses */}
          <div>
            <h2 className="text-sm font-medium text-gray-900 mb-3">Recent Analyses</h2>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">File</th>
                    <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">Result</th>
                    <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">Confidence</th>
                    <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAnalyses.map((analysis) => (
                    <tr key={analysis.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-gray-900 text-sm">{analysis.filename}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          analysis.result === 'authentic'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {analysis.result === 'authentic' ? 'Authentic' : 'Manipulated'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-600 text-sm">{Math.round(analysis.confidence * 100)}%</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-500 text-sm">{analysis.date}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
