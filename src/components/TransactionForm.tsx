import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Transaction } from '../types/budget'
import { categories } from './TransactionList'

interface TransactionFormProps {
  transaction?: Transaction | null
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void
  onCancel: () => void
}

export function TransactionForm({ transaction, onSubmit, onCancel }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>(transaction?.type || 'expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(transaction?.category || '')
  const [date, setDate] = useState<Date | undefined>(transaction?.date || new Date())
  const [notes, setNotes] = useState(transaction?.notes || '')

  useEffect(() => {
    if (transaction) {
      setType(transaction.type)
      setAmount(transaction.amount.toString())
      setCategory(transaction.category)
      setDate(transaction.date)
      setNotes(transaction.notes || '')
    }
  }, [transaction])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount')
      return
    }
    if (!category) {
      alert('Please select a category')
      return
    }
    if (!date) {
      alert('Please select a date')
      return
    }

    onSubmit({
      type,
      amount: numAmount,
      category,
      date,
      notes: notes.trim() || undefined
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant={type === 'expense' ? 'default' : 'outline'}
          onClick={() => setType('expense')}
          className={type === 'expense' ? 'bg-red-500 hover:bg-red-600' : ''}
        >
          Expense
        </Button>
        <Button
          type="button"
          variant={type === 'income' ? 'default' : 'outline'}
          onClick={() => setType('income')}
          className={type === 'income' ? 'bg-green-500 hover:bg-green-600' : ''}
        >
          Income
        </Button>
      </div>

      <div>
        <Input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="0"
          step="0.01"
          className="w-full"
        />
      </div>

      <div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories
              .filter(cat => type === 'income' ? cat === 'Income' : cat !== 'Income')
              .map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="flex-1">
          {transaction ? 'Update' : 'Add'} Transaction
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}