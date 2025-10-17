import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Plus, Settings, Download, Upload, Edit, Trash2 } from 'lucide-react'
import { BudgetProgressBar } from './components/BudgetProgressBar'
import { TransactionList } from './components/TransactionList'
import { FinancialCharts } from './components/FinancialCharts'
import { BudgetAnalysis } from './components/BudgetAnalysis'
import { TransactionForm } from './components/TransactionForm'
import { SettingsPanel } from './components/SettingsPanel'
import { Transaction, BudgetData, FinancialAnalysis } from './types/budget'
import { callAIAgent } from '@/utils/aiAgent'
import parseLLMJson from '@/utils/jsonParser'

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

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('budget-tracker-transactions', JSON.stringify(transactions))
    analyzeFinancialData()
  }, [transactions])

  useEffect(() => {
    localStorage.setItem('budget-tracker-budget', budget.toString())
  }, [budget])

  const analyzeFinancialData = async () => {
    if (transactions.length === 0) {
      setAnalysisResult(null)
      return
    }

    setIsAnalyzing(true)
    try {
      const prompt = `Analyze these financial transactions for ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}:

Monthly Budget: $${budget}
Transactions:
${transactions.map(t => `${t.type === 'income' ? '+' : '-'}$${t.amount} - ${t.category} - ${t.date.toISOString().split('T')[0]} - ${t.notes}`).join('\n')}

Provide a comprehensive financial analysis including total income, expenses, net balance, budget utilization, category breakdown, spending patterns, and recommendations. Return data in the exact JSON format specified.`

      const result = await callAIAgent(prompt, '68f2a3d90dcba2963ba6e9d5')
      if (result?.response) {
        const parsedAnalysis = parseLLMJson(result.response, null)
        if (parsedAnalysis?.result) {
          setAnalysisResult(parsedAnalysis)
        }
      }
    } catch (error) {
      console.error('Failed to analyze financial data:', error)
      // Fallback calculation
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
    }
    setIsAnalyzing(false)
  }

  const calculateFinancialMetrics = () => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const netBalance = income - expenses
    const spent = expenses
    const remaining = budget - spent
    const percentageUsed = spent > 0 ? (spent / budget) * 100 : 0

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

    const status = percentageUsed > 100 ? 'Over Budget' : percentageUsed > 80 ? 'Caution' : 'On Track'

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

  const exportData = (format: 'csv' | 'json') => {
    if (format === 'json') {
      const dataStr = JSON.stringify(transactions, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `budget-tracker-${new Date().toISOString().split('T')[0]}.json`
      a.click()
    } else {
      // CSV export
      const headers = ['Date', 'Type', 'Category', 'Amount', 'Notes']
      const rows = transactions.map(t => [
        t.date.toISOString().split('T')[0],
        t.type,
        t.category,
        t.amount.toString(),
        t.notes || ''
      ])
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `budget-tracker-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    }
  }

  const importData = (file: File) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        let importedTransactions: Transaction[] = []

        if (file.name.endsWith('.json')) {
          const parsed = parseLLMJson(content, [])
          importedTransactions = Array.isArray(parsed) ? parsed.map(t => ({ ...t, date: new Date(t.date) })) : []
        } else if (file.name.endsWith('.csv')) {
          // Simple CSV parsing
          const lines = content.split('\n')
          const headers = lines[0].split(',')

          importedTransactions = lines.slice(1).map(line => {
            const values = line.split(',')
            if (values.length >= 4) {
              return {
                id: Date.now().toString() + Math.random(),
                date: new Date(values[0]),
                type: values[1].toLowerCase() as 'income' | 'expense',
                category: values[2],
                amount: parseFloat(values[3]) || 0,
                notes: values[4] || ''
              } as Transaction
            }
            return null
          }).filter(Boolean) as Transaction[]
        }

        if (importedTransactions.length > 0) {
          setTransactions(prev => [...prev, ...importedTransactions])
        }
      } catch (error) {
        alert('Failed to import data. Please check file format.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budget Tracker</h1>
            <p className="text-sm text-gray-600">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
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
                <BudgetAnalysis data={analysisResult.result} isLoading={isAnalyzing} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <FinancialCharts
                      data={analysisResult.result.chart_data}
                      transactions={transactions}
                    />
                  </div>
                  <div>
                    <div className="space-y-6">
                      <BudgetProgressBar data={analysisResult.result.chart_data.progress_bar} />
                      <TransactionList
                        transactions={transactions}
                        onEdit={(transaction) => {
                          setEditingTransaction(transaction)
                          setShowModal(true)
                        }}
                        onDelete={deleteTransaction}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsPanel
              budget={budget}
              onBudgetChange={setBudget}
              transactions={transactions}
              onExport={exportData}
              onImport={importData}
            />
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
          <TransactionForm
            transaction={editingTransaction}
            onSubmit={editingTransaction ? updateTransaction : addTransaction}
            onCancel={() => {
              setShowModal(false)
              setEditingTransaction(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App