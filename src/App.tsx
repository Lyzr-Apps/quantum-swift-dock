import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import parseLLMJson from '@/utils/jsonParser'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  date: Date
  notes?: string
}

interface FinancialMetrics {
  summary: {
    total_income: number
    total_expenses: number
    net_balance: number
    period: string
  }
  budget_analysis: {
    monthly_budget: number
    spent: number
    remaining: number
    percentage_used: number
    status: 'On Track' | 'Caution' | 'Over Budget'
  }
  category_breakdown: Array<{
    category: string
    amount: number
    percentage: number
  }>
  chart_data: {
    pie_chart: { category: string; value: number }[]
    bar_chart: { category: string; amount: number }[]
    progress_bar: { used: number; total: number; percentage: number }
  }
  transactions_processed: number
  valid_transactions: number
  invalid_transactions: number
}

interface FinancialAnalysis {
  result: FinancialMetrics
  confidence: number
  metadata: {
    processing_time: string
    analysis_date: string
    transactions_analyzed: number
  }
}

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budget, setBudget] = useState<number>(2000)
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [analysisResult, setAnalysisResult] = useState<FinancialAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('budget-tracker-transactions')
    const savedBudget = localStorage.getItem('budget-tracker-budget')

    if (savedTransactions) {
      const parsed = parseLLMJson(savedTransactions, [])
      if (Array.isArray(parsed)) {
        setTransactions(parsed.map(t => ({ ...t, date: new Date(t.date) })))
      }
    }

    if (savedBudget) {
      const budgetValue = parseFloat(savedBudget)
      if (!isNaN(budgetValue)) {
        setBudget(budgetValue)
      }
    }
  }, [])

  // Save to localStorage and analyze
  useEffect(() => {
    localStorage.setItem('budget-tracker-transactions', JSON.stringify(transactions))
    if (transactions.length > 0) {
      analyzeFinancialData()
    } else {
      setAnalysisResult(null)
    }
  }, [transactions])

  useEffect(() => {
    localStorage.setItem('budget-tracker-budget', budget.toString())
  }, [budget])

  const analyzeFinancialData = async () => {
    setIsAnalyzing(true)
    try {
      // Simulate AI analysis for demo
      setTimeout(() => {
        const calc = calculateFinancialMetrics()
        setAnalysisResult({
          result: calc,
          confidence: 0.95,
          metadata: {
            processing_time: 'fast',
            analysis_date: new Date().toISOString().split('T')[0],
            transactions_analyzed: transactions.length
          }
        })
      }, 1000)
    } catch (error) {
      console.error('Analysis error:', error)
      // Fallback to local calculation
      const calc = calculateFinancialMetrics()
      setAnalysisResult({
        result: calc,
        confidence: 0.8,
        metadata: {
          processing_time: 'local',
          analysis_date: new Date().toISOString().split('T')[0],
          transactions_analyzed: transactions.length
        }
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const calculateFinancialMetrics = (): FinancialMetrics => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const netBalance = income - expenses
    const spent = expenses
    const remaining = budget - spent
    const percentageUsed = spent > 0 ? (spent / budget) * 100 : 0
    const status = percentageUsed > 100 ? 'Over Budget' : percentageUsed > 80 ? 'Caution' : 'On Track'

    const categoryBreakdown: { [key: string]: number } = {}
    transactions.forEach(t => {
      if (t.type === 'expense') {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount
      }
    })

    const totalExpenses = Object.values(categoryBreakdown).reduce((sum, amount) => sum + amount, 0)
    const categoryBreakdownList = Object.entries(categoryBreakdown).map(([category, amount]) => ({
      category,
      amount: parseFloat(amount.toFixed(2)),
      percentage: parseFloat(((amount / totalExpenses) * 100).toFixed(2))
    }))

    return {
      summary: {
        total_income: parseFloat(income.toFixed(2)),
        total_expenses: parseFloat(expenses.toFixed(2)),
        net_balance: parseFloat(netBalance.toFixed(2)),
        period: new Date().toISOString().slice(0, 7)
      },
      budget_analysis: {
        monthly_budget: parseFloat(budget.toFixed(2)),
        spent: parseFloat(spent.toFixed(2)),
        remaining: parseFloat(remaining.toFixed(2)),
        percentage_used: parseFloat(percentageUsed.toFixed(2)),
        status
      },
      category_breakdown: categoryBreakdownList,
      chart_data: {
        pie_chart: categoryBreakdownList.map(item => ({
          category: item.category,
          value: item.amount
        })),
        bar_chart: categoryBreakdownList.map(item => ({
          category: item.category,
          amount: item.amount
        })),
        progress_bar: {
          used: parseFloat(spent.toFixed(2)),
          total: parseFloat(budget.toFixed(2)),
          percentage: parseFloat(percentageUsed.toFixed(2))
        }
      },
      transactions_processed: transactions.length,
      valid_transactions: transactions.length,
      invalid_transactions: 0
    }
  }

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString()
    }
    setTransactions(prev => [...prev, newTransaction])
    setShowModal(false)
  }

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t))
    setEditingTransaction(null)
    setShowModal(false)
  }

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const simpleCategories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
    'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Other'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budget Tracker</h1>
            <p className="text-sm text-gray-600">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} with AI Analysis</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-2 max-w-[400px] mx-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {analysisResult?.result && (
              <>
                {/* Budget Analysis Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">Total Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-600">${analysisResult.result.summary.total_income.toFixed(2)}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-red-600">${analysisResult.result.summary.total_expenses.toFixed(2)}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">Net Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-2xl font-bold ${
                        analysisResult.result.summary.net_balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${analysisResult.result.summary.net_balance.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">Budget Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        analysisResult.result.budget_analysis.percentage_used > 100
                          ? 'bg-red-100 text-red-800'
                          : analysisResult.result.budget_analysis.percentage_used > 80
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {analysisResult.result.budget_analysis.status}
                      </span>
                      <p className="text-sm text-gray-600 mt-2">
                        {analysisResult.result.budget_analysis.percentage_used.toFixed(1)}% used
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <!-- Budget Progress Bar -->
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Monthly Budget</p>
                        <p className="font-medium text-lg">${analysisResult.result.budget_analysis.monthly_budget.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Amount Spent</p>
                        <p className="font-medium text-lg text-red-600">${analysisResult.result.budget_analysis.spent.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className={`h-4 rounded-full transition-all duration-300 ${
                            analysisResult.result.budget_analysis.percentage_used > 100 ? 'bg-red-500' :
                            analysisResult.result.budget_analysis.percentage_used > 80 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(analysisResult.result.budget_analysis.percentage_used, 100)}%` }}
                        />
                      </div>
                      <p className="text-center text-sm font-medium mt-2">
                        {analysisResult.result.budget_analysis.percentage_used.toFixed(1)}% of budget used
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <!-- Charts and Transactions List -->
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Spending by Category</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {analysisResult.result.chart_data.pie_chart.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                          {analysisResult.result.chart_data.pie_chart.map((item, index) => (
                            <div key={item.category} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{
                                  backgroundColor: '#' + ['ff6b6b', '4ecdc4', '45b7d1', '96ceb4', '#ffeaa7',
                                    'dda0dd', '98d8c8', 'f7dc6f', '#bb8fce', '#85c1e9'][index % 10]
                                }} />
                                <span className="font-medium">{item.category}</span>
                              </div>
                              <span className="font-bold">${item.value.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500 py-8">No expense data available</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      {[...transactions]
                        .sort((a, b) => b.date.getTime() - a.date.getTime())
                        .slice(0, 5)
                        .map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors mb-2">
                            <div className="flex items-center space-x-3">
                              <div className={`w-2 h-8 rounded-full ${
                                transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2"<span className={`text-sm font-medium ${
                                    transaction.type === 'income' ? 'text-green-700' : 'text-red-700'
                                  }`}
                                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                </span>
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">{transaction.category}</span>
                                  <span className="text-xs text-gray-600">{transaction.date.toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      {transactions.length === 0 && (
                        <p className="text-center text-gray-500 py-4">No transactions yet</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <!-- Top Spending Categories -->
                {analysisResult.result.category_breakdown.length > 0 && (
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Top Spending Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{analysisResult.result.category_breakdown.slice(0, 4).map((category, index) => (
                          <div key={category.category} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                            <div>
                              <span className="font-medium">{category.category}</span>
                              {index === 0 && <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">Top</span>}
                            </div>
                            <p className="font-bold text-gray-900">${category.amount.toFixed(2)}</p>
                          </div>
                        ))}</div>
                    </CardContent>
                  </Card>
                )}

              </>
            )}

            {!analysisResult && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500 text-lg mb-2">Welcome to Budget Tracker with AI!</p>
                  <p className="text-gray-600">Add your first transaction to see financial analysis</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Budget (USD)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  placeholder="Enter monthly budget"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-600">This month's budget target</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Export Transactions</h4>
                  <Button
                    onClick={() => {
                      const dataStr = JSON.stringify(transactions, null, 2)
                      const blob = new Blob([dataStr], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `budget-tracker-${new Date().toISOString().split('T')[0]}.json`
                      a.click()
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Export JSON
                  </Button>

                  <h4 className="text-sm font-medium text-gray-700">Import Transactions</h4>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const files = e.target.files
                      if (files && files.length > 0) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          try {
                            const content = event.target?.result as string
                            const parsed = parseLLMJson(content, [])
                            const importedTransactions = Array.isArray(parsed) ? parsed.map(t => ({ ...t, date: new Date(t.date) })) : []
                            if (importedTransactions.length > 0) {
                              setTransactions(prev => [...prev, ...importedTransactions])
                            }
                          } catch (error) {
                            alert('Failed to import data. Please check file format.')
                          }
                        }
                        reader.readAsText(files[0])
                      }
                    }}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const amount = formData.get('amount') as string
              const category = formData.get('category') as string
              const date = formData.get('date') as string
              const type = formData.get('type') as 'income' | 'expense'
              const notes = formData.get('notes') as string

              const numAmount = parseFloat(amount)
              if (isNaN(numAmount) || numAmount <= 0) return
              if (!category || !date) return

              addTransaction({
                type,
                amount: numAmount,
                category,
                date: new Date(date),
                notes: notes.trim() || undefined
              })
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <select name="type" defaultValue={'expense'} className="px-3 py-2 border rounded-md">
                <option value='expense'>Expense</option>
                <option value='income'>Income</option>
              </select>
              <select name="category" required className="px-3 py-2 border rounded-md">
                {simpleCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <input
              type="number"
              name="amount"
              placeholder="Amount"
              min="0"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="date"
              name="date"
              required
              defaultValue={editingTransaction?.date.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <textarea
              name="notes"
              placeholder="Notes (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex gap-3">
              <Button type="submit" className="flex-1">
                {editingTransaction ? 'Update' : 'Add'} Transaction
              </Button>
              <Button type="button" variant="outline" onClick={onCancel => {
                setShowModal(false)
                setEditingTransaction(null)
              }}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App