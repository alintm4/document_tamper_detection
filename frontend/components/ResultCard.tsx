interface AnalysisResult {
  result?: 'authentic' | 'manipulated';
  confidence?: number;
  error?: string;
  heatmap_url?: string;
  original_url?: string;
}

interface ResultCardProps {
  result: AnalysisResult | null;
  showHeatmap?: boolean; // Set to false for history/past scans
}

export default function ResultCard({ result, showHeatmap = true }: ResultCardProps) {
  if (!result) return null;

  if (result.error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h3 className="text-red-800 font-medium text-sm">Error</h3>
            <p className="text-red-600 text-sm">{result.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const isAuthentic = result.result === 'authentic';

  return (
    <div className={`p-5 rounded-lg ${
      isAuthentic
        ? 'bg-green-50 border border-green-200'
        : 'bg-red-50 border border-red-200'
    }`}>
      <div className="flex items-start space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isAuthentic ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {isAuthentic ? (
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01" />
            </svg>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className={`font-medium ${
            isAuthentic ? 'text-green-800' : 'text-red-800'
          }`}>
            {isAuthentic ? 'Authentic' : 'Potentially Manipulated'}
          </h3>
          
          <p className={`text-sm mt-1 ${isAuthentic ? 'text-green-600' : 'text-red-600'}`}>
            {isAuthentic
              ? 'This image appears to be genuine.'
              : 'This image may have been altered.'}
          </p>
        </div>
      </div>

      {/* Heatmap Overlay - Only shown for manipulated images and when showHeatmap is true */}
      {!isAuthentic && showHeatmap && result.heatmap_url && (
        <div className="mt-4 pt-4 border-t border-red-200">
          <h4 className="text-sm font-medium text-red-800 mb-3">Tampering Analysis</h4>
          <div className="grid grid-cols-2 gap-3">
            {result.original_url && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Original</p>
                <img 
                  src={result.original_url} 
                  alt="Original" 
                  className="w-full h-auto rounded-lg border border-gray-200"
                />
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 mb-1">Detected Regions</p>
              <img 
                src={result.heatmap_url} 
                alt="Heatmap overlay showing tampered regions" 
                className="w-full h-auto rounded-lg border border-red-200"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Red/yellow areas indicate potentially manipulated regions
          </p>
        </div>
      )}
    </div>
  );
}
