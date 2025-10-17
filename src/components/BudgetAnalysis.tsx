import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FinancialMetrics } from '../types/budget'

interface BudgetAnalysisProps {
  data: FinancialMetrics
  isLoading?: boolean
}

export function BudgetAnalysis({ data, isLoading }: BudgetAnalysisProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Analysis</CardTitle>
          <CardDescription>Loading financial insights...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track': return 'bg-green-100 text-green-800'
      case 'Caution': return 'bg-yellow-100 text-yellow-800'
      case 'Over Budget': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Total Income</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">${data.summary.total_income.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">${data.summary.total_expenses.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Net Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${
            data.summary.net_balance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            ${data.summary.net_balance.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Budget Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge className={`px-3 py-1 ${getStatusColor(data.budget_analysis.status)}`}>
            {data.budget_analysis.status}
          </Badge>
          <p className="text-sm text-gray-600 mt-2">
            {data.budget_analysis.percentage_used.toFixed(1)}% used
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Budget Progress</CardTitle>
          <CardDescription>Your spending vs monthly budget</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600">Monthly Budget</span>
                <span className="font-medium">${data.budget_analysis.monthly_budget.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600">Amount Spent</span>
                <span className="font-medium text-red-600">${data.budget_analysis.spent.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600">Remaining</span>
                <span className={`font-medium ${
                  data.budget_analysis.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${data.budget_analysis.remaining.toFixed(2)}
                </span>
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>0%</span>
                  <span>100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-300 ${
                      data.budget_analysis.percentage_used > 100 ? 'bg-red-500' :
                      data.budget_analysis.percentage_used > 80 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(data.budget_analysis.percentage_used, 100)}%` }}
                  />
                </div>
                <p className="text-center text-sm font-medium mt-2">
                  {data.budget_analysis.percentage_used.toFixed(1)}% of budget used
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {data.category_breakdown.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
            <CardDescription>Categories where you spend the most</CardDescription>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.category_breakdown.slice(0, 4).map((category, index) => (
              <div key={category.category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                <span className="font-medium">{category.category}</span>
                {index === 0 && <Badge className="ml-2 bg-yellow-100 text-yellow-800">Top</Badge>}
                </div>
                <p className="font-bold text-gray-900">${category.amount.toFixed(2)}
                  <span className="text-sm font-normal text-gray-600 ml-1">({category.percentage}%)</span>
                </p>
              </div>
            ))}
          </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}