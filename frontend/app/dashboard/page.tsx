'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Scan {
  scan_id: number;
  source_site: string;
  source_url: string;
  image_url: string;
  scanned_at: string;
  image: {
    id: number;
    hash: string;
    filename: string;
    is_manipulated: boolean | null;
    confidence_score: number | null;
    total_scans: number;
  };
}

interface ScanStats {
  total_scans: number;
  unique_images: number;
  manipulated_found: number;
  top_sites: { site: string; count: number }[];
  daily_activity: { date: string; count: number }[];
}

interface UserStats {
  username: string;
  tier: string;
  upload_count: number;
  upload_limit: number | null;
  remaining: number | null;
}

interface ScanResult {
  status?: string;
  message?: string;
  is_manipulated?: boolean;
  confidence_score?: number;
  heatmap_filename?: string;
  error?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [scanStats, setScanStats] = useState<ScanStats | null>(null);
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  
  // Modal state
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData(token);
  }, [router]);

  const fetchData = async (token: string) => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [userRes, statsRes, scansRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/stats`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/scan-stats`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/scans?per_page=5`, { headers })
      ]);

      if (!userRes.ok) {
        if (userRes.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch data');
      }

      const [userData, statsData, scansData] = await Promise.all([
        userRes.json(),
        statsRes.json(),
        scansRes.json()
      ]);

      setUserStats(userData);
      setScanStats(statsData);
      setRecentScans(scansData.scans || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Notify extension about logout (for session sync)
    window.postMessage({
      type: 'PROOFLY_AUTH',
      action: 'logout'
    }, '*');
    
    router.push('/login');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle file upload for scanning
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setScanResult({ error: 'Please select an image file' });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);

    setScanLoading(true);
    setScanResult(null);

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setScanResult({
          status: 'success',
          message: data.is_cached ? 'Image already analyzed' : 'Image uploaded successfully',
          is_manipulated: data.is_manipulated,
          confidence_score: data.confidence_score,
          heatmap_filename: data.heatmap_filename
        });
        // Refresh data
        if (token) fetchData(token);
      } else {
        setScanResult({ error: data.error || 'Scan failed' });
      }
    } catch {
      setScanResult({ error: 'Connection failed. Is the server running?' });
    } finally {
      setScanLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const openScanModal = () => {
    setShowScanModal(true);
    setScanResult(null);
    setPreviewUrl(null);
  };

  const closeScanModal = () => {
    setShowScanModal(false);
    setScanResult(null);
    setPreviewUrl(null);
  };

  const getTierBadge = (tier: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      free: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Free' },
      pro: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Pro' },
      pro_max: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Pro Max' }
    };
    const badge = badges[tier] || badges.free;
    return (
      <span className={`${badge.bg} ${badge.text} text-xs font-medium px-2 py-0.5 rounded`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar isLoggedIn={true} onLogout={handleLogout} />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={true} onLogout={handleLogout} />
      
      <main className="flex-1 pt-20 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Welcome, {userStats?.username}
              </h1>
              <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                {getTierBadge(userStats?.tier || 'free')}
                {userStats?.remaining != null && (
                  <span>• {userStats?.remaining} scans remaining</span>
                )}
              </p>
            </div>
            <button
              onClick={openScanModal}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              New Scan
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-gray-900">{scanStats?.total_scans || 0}</p>
                  <p className="text-gray-500 text-xs">Total Scans</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-gray-900">{scanStats?.unique_images || 0}</p>
                  <p className="text-gray-500 text-xs">Unique Images</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-gray-900">{scanStats?.manipulated_found || 0}</p>
                  <p className="text-gray-500 text-xs">Fakes Found</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-gray-900">{scanStats?.top_sites?.length || 0}</p>
                  <p className="text-gray-500 text-xs">Sites Scanned</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Scans */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-medium text-gray-900">Recent Scans</h2>
                  <Link href="/history" className="text-sm text-gray-500 hover:text-gray-700">
                    View all →
                  </Link>
                </div>
                
                {recentScans.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">No scans yet</p>
                    <p className="text-gray-400 text-xs mt-1">Use the extension to scan images</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {recentScans.map((scan) => (
                      <div key={scan.scan_id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {scan.image.is_manipulated === true ? (
                              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            ) : scan.image.is_manipulated === false ? (
                              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {scan.source_site && (
                                <span className="text-sm font-medium text-gray-900 truncate">
                                  {scan.source_site}
                                </span>
                              )}
                              {scan.image.is_manipulated !== null && (
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  scan.image.is_manipulated 
                                    ? 'bg-red-100 text-red-700' 
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {scan.image.is_manipulated ? 'Fake' : 'Authentic'}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 text-xs mt-0.5 truncate">
                              {scan.image_url || scan.image.filename || `Image #${scan.image.id}`}
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                              {formatDate(scan.scanned_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Top Sites */}
              {scanStats?.top_sites && scanStats.top_sites.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h2 className="font-medium text-gray-900">Top Sites</h2>
                  </div>
                  <div className="p-4 space-y-3">
                    {scanStats.top_sites.slice(0, 5).map((site, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 truncate">{site.site}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {site.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Usage */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h2 className="font-medium text-gray-900">Usage</h2>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Scans used</span>
                    <span className="text-sm font-medium text-gray-900">
                      {userStats?.upload_count || 0}
                      {userStats?.upload_limit && ` / ${userStats.upload_limit}`}
                    </span>
                  </div>
                  {userStats?.upload_limit && (
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-gray-900 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${Math.min(100, ((userStats.upload_count || 0) / userStats.upload_limit) * 100)}%` 
                        }}
                      />
                    </div>
                  )}
                  {userStats?.tier === 'free' && (
                    <button className="w-full mt-4 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                      Upgrade to Pro
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h2 className="font-medium text-gray-900">Quick Actions</h2>
                </div>
                <div className="p-2">
                  <button
                    onClick={openScanModal}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Upload Image</p>
                      <p className="text-xs text-gray-500">Analyze from file</p>
                    </div>
                  </button>
                  <Link
                    href="/extension"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Get Extension</p>
                      <p className="text-xs text-gray-500">Scan on any site</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Scan Modal */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Scan Image</h2>
              <button
                onClick={closeScanModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              {!scanResult ? (
                <>
                  {/* Upload Area */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      dragActive 
                        ? 'border-gray-900 bg-gray-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    />
                    
                    {scanLoading ? (
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-3"></div>
                        <p className="text-gray-600 text-sm">Analyzing image...</p>
                      </div>
                    ) : previewUrl ? (
                      <div className="flex flex-col items-center">
                        <img src={previewUrl} alt="Preview" className="max-h-40 rounded-lg mb-3" />
                        <p className="text-gray-500 text-sm">Analyzing...</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-900 font-medium mb-1">Drop image here</p>
                        <p className="text-gray-500 text-sm">or click to browse</p>
                        <p className="text-gray-400 text-xs mt-2">PNG, JPG, GIF up to 16MB</p>
                      </>
                    )}
                  </div>

                  {/* URL Input (optional) */}
                  <div className="mt-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white text-gray-400">or paste image URL</span>
                      </div>
                    </div>
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      className="mt-3 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          const url = (e.target as HTMLInputElement).value;
                          if (url) {
                            try {
                              setScanLoading(true);
                              setPreviewUrl(url);
                              const response = await fetch(url);
                              const blob = await response.blob();
                              const file = new File([blob], 'image.jpg', { type: blob.type });
                              handleFileUpload(file);
                            } catch {
                              setScanResult({ error: 'Failed to fetch image from URL' });
                              setScanLoading(false);
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </>
              ) : (
                /* Result Display */
                <div className="text-center py-4">
                  {scanResult.error ? (
                    <>
                      <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <p className="text-gray-900 font-medium mb-1">Error</p>
                      <p className="text-gray-500 text-sm">{scanResult.error}</p>
                    </>
                  ) : (
                    <>
                      {previewUrl && (
                        <img src={previewUrl} alt="Scanned" className="max-h-32 rounded-lg mx-auto mb-4" />
                      )}
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        scanResult.is_manipulated ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        {scanResult.is_manipulated ? (
                          <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        ) : (
                          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <p className="text-gray-900 font-semibold text-lg mb-1">
                        {scanResult.is_manipulated ? 'Potentially Fake' : 'Likely Authentic'}
                      </p>
                      <p className="text-gray-500 text-sm mb-2">{scanResult.message}</p>
                      
                      {/* Show heatmap for manipulated images */}
                      {scanResult.is_manipulated && scanResult.heatmap_filename && (
                        <div className="mt-4 mb-4">
                          <p className="text-gray-500 text-xs mb-2">Detected Tampering:</p>
                          <img 
                            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${scanResult.heatmap_filename}`}
                            alt="Heatmap showing tampered regions"
                            className="max-h-48 rounded-lg mx-auto border border-red-200"
                          />
                          <p className="text-gray-400 text-xs mt-2">Red/yellow areas indicate manipulated regions</p>
                        </div>
                      )}
                    </>
                  )}
                  
                  <button
                    onClick={() => {
                      setScanResult(null);
                      setPreviewUrl(null);
                    }}
                    className="mt-6 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Scan Another
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
