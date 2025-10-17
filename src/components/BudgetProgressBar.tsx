export function BudgetProgressBar({ data }: { data: { used: number; total: number; percentage: number } }) {
  const { used, total, percentage } = data

  const getStatusColor = () => {
    if (percentage > 100) return 'bg-red-500'
    if (percentage > 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStatusText = () => {
    if (percentage > 100) return 'Over Budget'
    if (percentage > 80) return 'Caution'
    return 'On Track'
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-sm border">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Budget Progress</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            percentage > 100 ? 'bg-red-100 text-red-800' :
            percentage > 80 ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {getStatusText()}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Budget Used: ${used.toFixed(2)} / ${total.toFixed(2)}</span>
            <span>{percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                percentage > 100 ? 'bg-red-500' :
                percentage > 80 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}