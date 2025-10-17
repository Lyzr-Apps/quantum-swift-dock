import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Transaction } from '../types/budget'

export const categories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Income',
  'Other'
]

const categoryColors: { [key: string]: string } = {
  'Food & Dining': 'bg-orange-100 text-orange-800',
  'Transportation': 'bg-blue-100 text-blue-800',
  'Shopping': 'bg-purple-100 text-purple-800',
  'Entertainment': 'bg-pink-100 text-pink-800',
  'Bills & Utilities': 'bg-yellow-100 text-yellow-800',
  'Healthcare': 'bg-red-100 text-red-800',
  'Education': 'bg-green-100 text-green-800',
  'Travel': 'bg-indigo-100 text-indigo-800',
  'Income': 'bg-emerald-100 text-emerald-800',
  'Other': 'bg-gray-100 text-gray-800'
}

interface TransactionListProps {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  const sortedTransactions = [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime())

  if (sortedTransactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No transactions yet. Add your first transaction to get started!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {sortedTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-8 rounded-full ${
                  transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${
                      transaction.type === 'income' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={`text-xs px-2 py-0.5 ${categoryColors[transaction.category] || 'bg-gray-100 text-gray-800'}`}>
                      {transaction.category}
                    </Badge>
                    <span className="text-xs text-gray-600">
                      {transaction.date.toLocaleDateString()}
                    </span>
                    {transaction.notes && (
                      <span className="text-xs text-gray-500 italic truncate max-w-xs">
                        {transaction.notes}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(transaction)}
                  className="h-8 w-8"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this transaction?')) {
                      onDelete(transaction.id)
                    }
                  }}
                  className="h-8 w-8 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}