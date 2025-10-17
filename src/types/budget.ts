export interface Transaction {
  id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  date: Date
  notes?: string
}

export interface BudgetData {
  monthly_budget: number
  spent: number
  remaining: number
  percentage_used: number
  status: 'On Track' | 'Caution' | 'Over Budget'
}

export interface CategoryBreakdown {
  category: string
  amount: number
  percentage: number
}

export interface ChartData {
  pie_chart: { category: string; value: number }[]
  bar_chart: { category: string; amount: number }[]
  progress_bar: { used: number; total: number; percentage: number }
}

export interface FinancialMetrics {
  summary: {
    total_income: number
    total_expenses: number
    net_balance: number
    period: string
  }
  budget_analysis: BudgetData
  category_breakdown: CategoryBreakdown[]
  chart_data: ChartData
  transactions_processed: number
  valid_transactions: number
  invalid_transactions: number
}

export interface FinancialAnalysis {
  result: FinancialMetrics
  confidence: number
  metadata: {
    processing_time: string
    analysis_date: string
    transactions_analyzed: number
  }
}