import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Download, Upload } from 'lucide-react'
import { Transaction } from '../types/budget'

interface SettingsPanelProps {
  budget: number
  onBudgetChange: (budget: number) => void
  transactions: Transaction[]
  onExport: (format: 'csv' | 'json') => void
  onImport: (file: File) => void
}

export function SettingsPanel({ budget, onBudgetChange, transactions, onExport, onImport }: SettingsPanelProps) {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      onImport(files[0])
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Budget Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="budget">Monthly Budget (USD)</Label>
            <Input
              id="budget"
              type="number"
              value={budget}
              onChange={(e) => onBudgetChange(Number(e.target.value))}
              min="0"
              step="0.01"
              placeholder="Enter monthly budget"
            />
          </div>
          <p className="text-sm text-gray-600">
            This month's budget target
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={() => onExport('json')} variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button onClick={() => onExport('csv')} variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <p className="text-sm text-gray-600">
            Download all transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="import-file" className="font-medium cursor-pointer">
            Import from file:
          </Label>
          <input
            id="import-file"
            type="file"
            accept=".json,.csv"
            onChange={handleFileSelect}
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-sm text-gray-600">
            Upload transactions from JSON or CSV file
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transactions Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Total Transactions</p>
            <p className="text-xl font-bold">{transactions.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Income Transactions</p>
            <p className="text-lg font-medium text-green-600">{transactions.filter(t => t.type === 'income').length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Expense Transactions</p>
            <p className="text-lg font-medium text-red-600">{transactions.filter(t => t.type === 'expense').length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}