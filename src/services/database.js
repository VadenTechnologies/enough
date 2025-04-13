/* eslint-disable */ 
const DB_NAME = 'enough_db'
const DB_VERSION = 2

let db = null
let dbInitialized = false
let eventListeners = {}

export async function initializeDatabase() {
  if (db) return db

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      dbInitialized = true
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      // Create object stores
      if (!db.objectStoreNames.contains('categories')) {
        const categoriesStore = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true })
        categoriesStore.createIndex('name', 'name', { unique: true })
      }
      if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains('bills')) {
        db.createObjectStore('bills', { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains('incomes')) {
        db.createObjectStore('incomes', { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' })
      }
      if (!db.objectStoreNames.contains('categoryBudgets')) {
        const categoryBudgetsStore = db.createObjectStore('categoryBudgets', { keyPath: 'id', autoIncrement: true })
        categoryBudgetsStore.createIndex('categoryId', 'categoryId', { unique: false })
        categoryBudgetsStore.createIndex('weekStart', 'weekStart', { unique: false })
      }
    }
  })
}

// Helper function to get object store
export async function getStore(storeName, mode = 'readonly') {
  if (!dbInitialized) {
    await initializeDatabase()
  }
  const db = await initializeDatabase()
  return db.transaction(storeName, mode).objectStore(storeName)
}

// Event handling system
export function onDatabaseEvent(eventName, callback) {
  if (!eventListeners[eventName]) {
    eventListeners[eventName] = []
  }
  eventListeners[eventName].push(callback)
  return () => {
    // Return unsubscribe function
    eventListeners[eventName] = eventListeners[eventName].filter(cb => cb !== callback)
  }
}

// Helper function to emit events
export function emitDatabaseEvent(eventName, data) {
  if (eventListeners[eventName]) {
    eventListeners[eventName].forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error in database event listener for ${eventName}:`, error)
      }
    })
  }
}

// Categories
export async function getCategories() {
  const store = await getStore('categories')
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function addCategory(category) {
  const store = await getStore('categories', 'readwrite')
  return new Promise((resolve, reject) => {
    const request = store.add(category)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function updateCategory(id, category) {
  const store = await getStore('categories', 'readwrite')
  return new Promise((resolve, reject) => {
    const request = store.put({ ...category, id })
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function deleteCategory(id) {
  const store = await getStore('categories', 'readwrite')
  return new Promise((resolve, reject) => {
    const request = store.delete(id)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Transactions
export async function getTransactions() {
  const store = await getStore('transactions')
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getTransactionsByDate(date) {
  const store = await getStore('transactions')
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => {
      const transactions = request.result.filter(t => t.date === date)
      resolve(transactions)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function addTransaction(transaction) {
  const store = await getStore('transactions', 'readwrite')
  return new Promise((resolve, reject) => {
    const request = store.add(transaction)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function updateTransaction(id, transaction) {
  const store = await getStore('transactions', 'readwrite')
  return new Promise((resolve, reject) => {
    const request = store.put({ ...transaction, id })
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function deleteTransaction(id) {
  const store = await getStore('transactions', 'readwrite')
  return new Promise((resolve, reject) => {
    const request = store.delete(id)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Bills
export async function getBills() {
  const store = await getStore('bills')
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function addBill(bill) {
  try {
    const store = await getStore('bills', 'readwrite')
    const newBill = {
      ...bill,
      id: crypto.randomUUID(),
      dueDate: new Date(new Date(bill.dueDate).setUTCHours(12, 0, 0, 0)).toISOString(),
      amount: Number(bill.amount)
    }
    await store.add(newBill)
    emitDatabaseEvent('billAdded', newBill)
    return newBill
  } catch (error) {
    console.error('Error adding bill:', error)
    throw error
  }
}

export async function updateBill(id, bill) {
  const store = await getStore('bills', 'readwrite')
  return new Promise((resolve, reject) => {
    const request = store.put({ ...bill, id })
    request.onsuccess = () => {
      emitDatabaseEvent('billUpdated', { ...bill, id })
      resolve()
    }
    request.onerror = () => reject(request.error)
  })
}

export async function deleteBill(id) {
  const store = await getStore('bills', 'readwrite')
  return new Promise((resolve, reject) => {
    const request = store.delete(id)
    request.onsuccess = () => {
      emitDatabaseEvent('billDeleted', { id })
      resolve()
    }
    request.onerror = () => reject(request.error)
  })
}

// Incomes
export async function getIncomes() {
  const store = await getStore('incomes')
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function addIncome(income) {
  try {
    const store = await getStore('incomes', 'readwrite')
    const newIncome = {
      ...income,
      id: crypto.randomUUID(),
      dueDate: new Date(new Date(income.dueDate).setUTCHours(12, 0, 0, 0)).toISOString(),
      amount: Number(income.amount)
    }
    await store.add(newIncome)
    emitDatabaseEvent('incomeAdded', newIncome)
    return newIncome
  } catch (error) {
    console.error('Error adding income:', error)
    throw error
  }
}

export async function updateIncome(id, income) {
  const store = await getStore('incomes', 'readwrite')
  return new Promise((resolve, reject) => {
    const request = store.put({ ...income, id })
    request.onsuccess = () => {
      emitDatabaseEvent('incomeUpdated', { ...income, id })
      resolve()
    }
    request.onerror = () => reject(request.error)
  })
}

export async function deleteIncome(id) {
  const store = await getStore('incomes', 'readwrite')
  return new Promise((resolve, reject) => {
    const request = store.delete(id)
    request.onsuccess = () => {
      emitDatabaseEvent('incomeDeleted', { id })
      resolve()
    }
    request.onerror = () => reject(request.error)
  })
}

// Settings
export async function getSetting(key) {
  const store = await getStore('settings')
  return new Promise((resolve, reject) => {
    const request = store.get(key)
    request.onsuccess = () => resolve(request.result?.value)
    request.onerror = () => reject(request.error)
  })
}

export async function setSetting(key, value) {
  const store = await getStore('settings', 'readwrite')
  return new Promise((resolve, reject) => {
    const request = store.put({ key, value })
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Category Budgets
export async function getCategoryBudgets(bills, incomes, weekStart, weekEnd) {
  try {
    console.log('📊 WEEKLY BUDGET CALCULATION STARTED', {
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString()
    })

    // Get all categories and transactions
    const [categories, transactions] = await Promise.all([
      getCategories(),
      getTransactions()
    ])
    
    console.log('📋 LOADED DATA', {
      categoriesCount: categories?.length,
      transactionsCount: transactions?.length
    })

    if (!categories || categories.length === 0) {
      console.log('❌ No categories found')
      return []
    }

    // Calculate weekly budgets for each category
    const budgets = categories.map(category => {
      console.log(`\n🔍 PROCESSING CATEGORY: ${category.name}`)

      // Calculate weekly budget amount
      const monthlyAmount = Number(category.budget) || 0
      let weeklyAmount = Number(category.weeklyBudget)
      if (!weeklyAmount) {
        switch (category.frequency) {
          case 'weekly':
            weeklyAmount = monthlyAmount
            break
          case 'bi-weekly':
            weeklyAmount = monthlyAmount / 2
            break
          case 'monthly':
          default:
            weeklyAmount = monthlyAmount / 4.33
        }
      }

      // Calculate previous week's dates
      const prevWeekStart = new Date(weekStart)
      prevWeekStart.setDate(prevWeekStart.getDate() - 7)
      const prevWeekEnd = new Date(weekEnd)
      prevWeekEnd.setDate(prevWeekEnd.getDate() - 7)

      // Find transactions for previous week
      const prevWeekTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date)
        return t.categoryId === category.id && 
               t.type === 'expense' &&
               transactionDate >= prevWeekStart && 
               transactionDate <= prevWeekEnd
      })

      // Calculate previous week's spent amount
      const prevWeekSpent = prevWeekTransactions.reduce((total, transaction) => {
        return total + (Number(transaction.amount) || 0)
      }, 0)

      // Calculate previous week's adjustments
      const prevWeekAdjustments = transactions
        .filter(t => t.isOverpayment && t.adjustments)
        .flatMap(t => t.adjustments)
        .filter(a => a.target === category.id)
        .reduce((total, a) => total + (Number(a.amount) || 0), 0)

      // Calculate previous week's remaining balance (negative means overspent)
      const prevWeekRemaining = weeklyAmount - prevWeekSpent + prevWeekAdjustments
      const carryoverBalance = prevWeekRemaining < 0 ? Math.abs(prevWeekRemaining) : 0

      console.log('💰 BUDGET CALCULATION', {
        categoryName: category.name,
        weeklyAmount,
        prevWeekSpent,
        prevWeekAdjustments,
        prevWeekRemaining,
        carryoverBalance
      })

      // Find all transactions for this category in the current week
      const categoryTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date)
        return t.categoryId === category.id && 
               t.type === 'expense' &&
               transactionDate >= weekStart && 
               transactionDate <= weekEnd
      })

      console.log('💳 TRANSACTIONS FOUND', {
        categoryName: category.name,
        transactionsCount: categoryTransactions.length,
        transactions: categoryTransactions.map(t => ({
          date: t.date,
          amount: t.amount,
          description: t.description
        }))
      })

      // Calculate total spent in this category (expenses only)
      const spent = categoryTransactions.reduce((total, transaction) => {
        return total + (Number(transaction.amount) || 0)
      }, 0)

      // Find any adjustments that affect this category
      const adjustments = transactions
        .filter(t => t.isOverpayment && t.adjustments)
        .flatMap(t => t.adjustments)
        .filter(a => a.target === category.id)
        .reduce((total, a) => total + (Number(a.amount) || 0), 0)

      // Calculate remaining budget, subtracting the carryover balance
      const remaining = weeklyAmount - spent + adjustments - carryoverBalance

      console.log('📈 FINAL CALCULATION', {
        categoryName: category.name,
        weeklyAmount,
        spent,
        adjustments,
        carryoverBalance,
        remaining
      })

      return {
        id: category.id,
        categoryId: category.id,
        category: category.name,
        amount: weeklyAmount,
        spent,
        adjustments,
        carryoverBalance,
        remaining: remaining,
        weekStart: weekStart.toISOString()
      }
    })

    console.log('✅ WEEKLY BUDGET CALCULATION COMPLETE', {
      totalCategories: budgets.length,
      budgets: budgets.map(b => ({
        category: b.category,
        amount: b.amount,
        spent: b.spent,
        carryoverBalance: b.carryoverBalance,
        remaining: b.remaining
      }))
    })

    return budgets
  } catch (error) {
    console.error('❌ Error getting category budgets:', error)
    return []
  }
}

export async function addCategoryBudget(budget) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['categoryBudgets'], 'readwrite')
    const store = transaction.objectStore('categoryBudgets')
    const request = store.add(budget)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function updateCategoryBudget(budget) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['categoryBudgets'], 'readwrite')
    const store = transaction.objectStore('categoryBudgets')
    const request = store.put(budget)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function deleteCategoryBudget(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['categoryBudgets'], 'readwrite')
    const store = transaction.objectStore('categoryBudgets')
    const request = store.delete(id)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Data Export/Import
export async function exportData() {
  const db = await initializeDatabase()
  const data = {
    categories: await getCategories(),
    transactions: await getTransactions(),
    bills: await getBills(),
    incomes: await getIncomes(),
    settings: await new Promise((resolve, reject) => {
      const store = db.transaction('settings', 'readonly').objectStore('settings')
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
  return JSON.stringify(data)
}

export async function importData(jsonData) {
  const data = JSON.parse(jsonData)
  
  // Clear existing data
  const db = await initializeDatabase()
  const stores = ['categories', 'transactions', 'bills', 'incomes', 'settings']
  
  for (const storeName of stores) {
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName)
    await new Promise((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Import new data
  for (const category of data.categories) {
    await addCategory(category)
  }
  for (const transaction of data.transactions) {
    await addTransaction(transaction)
  }
  for (const bill of data.bills) {
    await addBill(bill)
  }
  for (const income of data.incomes) {
    await addIncome(income)
  }
  for (const setting of data.settings) {
    await setSetting(setting.key, setting.value)
  }
}

export async function calculateTotalMonthlyBudget() {
  try {
    const [incomes, bills, categories] = await Promise.all([getIncomes(), getBills(), getCategories()])
    if (!incomes || incomes.length === 0) return 0

    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Calculate total monthly income
    const monthlyIncome = incomes.reduce((total, income) => {
      const amount = Number(income.amount) || 0
      // For recurring incomes, calculate next occurrence
      if (income.isRecurring) {
        const dueDateParts = income.dueDate.split('T')[0].split('-')
        let nextDueDate = new Date(
          parseInt(dueDateParts[0]), // year
          parseInt(dueDateParts[1]) - 1, // month (0-based)
          parseInt(dueDateParts[2]) // day
        )
        nextDueDate.setHours(0, 0, 0, 0)
        
        // Move the date forward until we find the next occurrence
        while (nextDueDate < now) {
          switch (income.frequency) {
            case 'weekly':
              nextDueDate.setDate(nextDueDate.getDate() + 7)
              break
            case 'bi-weekly':
              nextDueDate.setDate(nextDueDate.getDate() + 14)
              break
            case 'monthly':
              nextDueDate.setMonth(nextDueDate.getMonth() + 1)
              break
            case 'quarterly':
              nextDueDate.setMonth(nextDueDate.getMonth() + 3)
              break
            case 'yearly':
              nextDueDate.setFullYear(nextDueDate.getFullYear() + 1)
              break
          }
        }
        
        // Check if the next occurrence is in the current month
        const nextMonth = nextDueDate.getMonth()
        const nextYear = nextDueDate.getFullYear()
        
        if (nextMonth === currentMonth && nextYear === currentYear) {
          return total + amount
        }
      } else {
        // For non-recurring incomes, check if they're in the current month
        const incomeDate = new Date(income.dueDate)
        const incomeMonth = incomeDate.getMonth()
        const incomeYear = incomeDate.getFullYear()
        
        if (incomeMonth === currentMonth && incomeYear === currentYear) {
          return total + amount
        }
      }
      
      return total
    }, 0)

    // Calculate total monthly bills
    const monthlyBills = bills.reduce((total, bill) => {
      const amount = Number(bill.amount) || 0
      // For recurring bills, calculate next occurrence
      if (bill.isRecurring) {
        const dueDateParts = bill.dueDate.split('T')[0].split('-')
        let nextDueDate = new Date(
          parseInt(dueDateParts[0]), // year
          parseInt(dueDateParts[1]) - 1, // month (0-based)
          parseInt(dueDateParts[2]) // day
        )
        nextDueDate.setHours(0, 0, 0, 0)
        
        // Move the date forward until we find the next occurrence
        while (nextDueDate < now) {
          switch (bill.frequency) {
            case 'weekly':
              nextDueDate.setDate(nextDueDate.getDate() + 7)
              break
            case 'bi-weekly':
              nextDueDate.setDate(nextDueDate.getDate() + 14)
              break
            case 'monthly':
              nextDueDate.setMonth(nextDueDate.getMonth() + 1)
              break
            case 'quarterly':
              nextDueDate.setMonth(nextDueDate.getMonth() + 3)
              break
            case 'yearly':
              nextDueDate.setFullYear(nextDueDate.getFullYear() + 1)
              break
          }
        }
        
        // Check if the next occurrence is in the current month
        const nextMonth = nextDueDate.getMonth()
        const nextYear = nextDueDate.getFullYear()
        
        if (nextMonth === currentMonth && nextYear === currentYear) {
          return total + amount
        }
      } else {
        // For non-recurring bills, check if they're in the current month
        const billDate = new Date(bill.dueDate)
        const billMonth = billDate.getMonth()
        const billYear = billDate.getFullYear()
        
        if (billMonth === currentMonth && billYear === currentYear) {
          return total + amount
        }
      }
      
      return total
    }, 0)

    // Calculate total monthly category budgets
    const monthlyBudgets = categories.reduce((total, category) => {
      const amount = Number(category.budget) || 0
      // Convert weekly budgets to monthly
      if (category.frequency === 'weekly') {
        return total + (amount * 4.33) // Average weeks in a month
      } else if (category.frequency === 'bi-weekly') {
        return total + (amount * 2.165) // Average bi-weekly in a month
      } else {
        return total + amount // Monthly budget
      }
    }, 0)

    // Return income minus bills and budgets
    return monthlyIncome - monthlyBills - monthlyBudgets
  } catch (error) {
    console.error('Error calculating total monthly budget:', error)
    return 0
  }
}

// Overpayment Functions
export async function handleOverpayment(transaction) {
  try {
    console.log("HandeOverPayment Started!")
    // Validate the overpayment
    if (!transaction.isOverpayment || !transaction.originalBudget || !transaction.adjustments) {
      throw new Error('Invalid overpayment data')
    }

    // Validate that adjustments sum up to the overpayment amount
    const overpaymentAmount = Number(transaction.amount) - Number(transaction.originalBudget)
    const adjustmentsSum = transaction.adjustments.reduce((sum, a) => sum + Number(a.amount), 0)
    
    if (Math.abs(overpaymentAmount - adjustmentsSum) > 0.01) {
      throw new Error('Adjustments must sum up to the overpayment amount')
    }

    // Get categories for logging
    const categories = await getCategories()
    const getCategory = (id) => categories.find(c => c.id === id)

    // Create the original transaction with the budget amount
    const originalCategory = getCategory(transaction.categoryId)
    const originalTransaction = {
      date: transaction.date,
      description: transaction.description,
      amount: Number(transaction.originalBudget),
      type: transaction.type,
      categoryId: transaction.categoryId,
      category: originalCategory?.name || 'Uncategorized'
    }

    console.log('Creating original transaction:', {
      ...originalTransaction,
      categoryName: originalCategory?.name
    })

    // Save the original transaction using addTransaction
    const originalId = await addTransaction(originalTransaction)

    // Create and save adjustment transactions one by one
    const adjustmentIds = []
    for (const adjustment of transaction.adjustments) {
      const targetCategory = getCategory(adjustment.target)
      const adjustmentTransaction = {
        date: transaction.date,
        description: `Overpay - ${transaction.description}`,
        amount: Number(adjustment.amount),
        type: transaction.type,
        categoryId: adjustment.target,
        category: targetCategory?.name || 'Uncategorized',
        isAdjustment: true
      }

      console.log('Creating adjustment transaction:', {
        ...adjustmentTransaction,
        categoryName: targetCategory?.name
      })

      const id = await addTransaction(adjustmentTransaction)
      adjustmentIds.push(id)
    }

    // Get all transactions to find and delete the extra uncategorized one
    const allTransactions = await getTransactions()
    const extraTransaction = allTransactions.find(t => 
      t.description === `Overpay Adjustment - ${transaction.description}` &&
      t.category === 'Uncategorized' &&
      t.date === transaction.date &&
      !adjustmentIds.includes(t.id)
    )

    if (extraTransaction) {
      console.log('Deleting extra uncategorized transaction:', extraTransaction)
      await deleteTransaction(extraTransaction.id)
    }

    return true
  } catch (error) {
    console.error('Error handling overpayment:', error)
    throw error
  }
} 