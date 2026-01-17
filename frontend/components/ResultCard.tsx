interface AnalysisResult {
  result?: 'authentic' | 'manipulated';
  confidence?: number;
  error?: string;
}

interface ResultCardProps {
  result: AnalysisResult | null;
}

export default function ResultCard({ result }: ResultCardProps) {
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

          {result.confidence && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Confidence</span>
                <span className={isAuthentic ? 'text-green-600' : 'text-red-600'}>
                  {Math.round(result.confidence * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isAuthentic ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${result.confidence * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
