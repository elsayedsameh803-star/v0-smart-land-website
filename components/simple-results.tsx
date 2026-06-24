"use client"

interface SimpleAnalysisResult {
  score?: number
  metrics?: Array<{ label: string; value: string; status?: string }>
  issues?: Array<{ type: string; message: string }>
  recommendations?: string[]
}

interface SimpleResultsProps {
  result: any
}

export default function SimpleResults({ result }: SimpleResultsProps) {
  // Check if this is the new format or the fallback format
  const isNewFormat = result.performance !== undefined
  
  if (isNewFormat) {
    // New WebsiteAnalysisResult format
    return (
      <div className="space-y-6 bg-card rounded-xl border shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="text-5xl font-bold text-blue-600">{result.overallScore}</div>
          <div className="text-sm text-muted-foreground">
            <p>Overall Score</p>
            <p className="text-xs">out of 100</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{result.url}</p>
      </div>
    )
  }

  // Fallback format (metrics, issues, recommendations)
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="text-5xl font-bold text-blue-600">{result.score}</div>
          <div className="text-sm text-muted-foreground">
            <p>Overall Score</p>
            <p className="text-xs">out of 100</p>
          </div>
        </div>
      </div>

      {result.metrics && (
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <h3 className="font-bold mb-4">Metrics</h3>
          <div className="space-y-2">
            {result.metrics.map((metric: any, idx: number) => (
              <div key={idx} className="flex justify-between p-2 bg-muted rounded">
                <span>{metric.label}</span>
                <span className="font-medium">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.issues && (
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <h3 className="font-bold mb-4">Issues</h3>
          <div className="space-y-2">
            {result.issues.map((issue: any, idx: number) => (
              <div key={idx} className="p-2 bg-muted rounded text-sm">
                <span className="font-medium capitalize mr-2">[{issue.type}]</span>
                {issue.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {result.recommendations && (
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <h3 className="font-bold mb-4">Recommendations</h3>
          <ul className="space-y-2 list-disc list-inside">
            {result.recommendations.map((rec: string, idx: number) => (
              <li key={idx} className="text-sm">{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
