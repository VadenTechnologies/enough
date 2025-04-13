<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 h-32 bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50 z-50" style="padding-top: calc(env(safe-area-inset-top) + 1.5rem)">
      <div class="h-full flex items-center justify-between px-6 pb-6">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
          enough.
        </h1>
        <div class="flex items-center space-x-4">
          <button 
            @click="showAddTransaction = true"
            class="p-3 text-blue-400 hover:text-blue-300 rounded-lg hover:bg-blue-400/10 transition-colors"
          >
            <PlusIcon class="w-6 h-6" />
          </button>
          <router-link 
            to="/settings"
            class="p-3 text-purple-400 hover:text-purple-300 rounded-lg hover:bg-purple-400/10 transition-colors"
          >
            <Cog6ToothIcon class="w-6 h-6" />
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="pb-28" style="padding-top: 8rem">
      <router-view></router-view>
    </main>

    <!-- Add Transaction Modal -->
    <div v-if="showAddTransaction" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-gray-800/90 rounded-2xl border border-gray-700/50 p-6 w-full max-w-md mx-auto shadow-xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-white bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Add Transaction
          </h2>
          <button @click="showAddTransaction = false" class="text-gray-400 hover:text-gray-300 p-1 hover:bg-gray-700/50 rounded-lg transition-all duration-200">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
        <form @submit.prevent="handleAddTransaction" class="space-y-4">
          <!-- Summary View -->
          <div v-if="newTransaction.isOverpayment" class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
              <div>
                <p class="text-sm text-gray-400">Type</p>
                <p class="font-medium text-white">{{ newTransaction.type === 'expense' ? 'Expense' : 'Income' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-400">Amount</p>
                <p :class="['font-medium', newTransaction.type === 'expense' ? 'text-red-400' : 'text-green-400']">
                  ${{ newTransaction.amount || '0.00' }}
                </p>
              </div>
            </div>
            <div class="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
              <div>
                <p class="text-sm text-gray-400">Category</p>
                <p class="font-medium text-white">{{ newTransaction.categoryId || 'Uncategorized' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-400">Date</p>
                <p class="font-medium text-white">{{ newTransaction.date }}</p>
              </div>
            </div>
          </div>

          <!-- Full Form -->
          <template v-else>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Transaction Type</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  @click="newTransaction.type = 'expense'"
                  class="flex items-center justify-center space-x-2 p-4 rounded-xl border-2 transition-all duration-200"
                  :class="[
                    newTransaction.type === 'expense'
                      ? 'bg-red-500/20 border-red-500 text-red-400'
                      : 'bg-gray-700/50 border-gray-600/50 text-gray-400 hover:bg-gray-700/70'
                  ]"
                >
                  <ArrowDownIcon class="w-5 h-5" />
                  <span>Expense</span>
                </button>
                <button
                  type="button"
                  @click="newTransaction.type = 'income'"
                  class="flex items-center justify-center space-x-2 p-4 rounded-xl border-2 transition-all duration-200"
                  :class="[
                    newTransaction.type === 'income'
                      ? 'bg-green-500/20 border-green-500 text-green-400'
                      : 'bg-gray-700/50 border-gray-600/50 text-gray-400 hover:bg-gray-700/70'
                  ]"
                >
                  <ArrowUpIcon class="w-5 h-5" />
                  <span>Income</span>
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <input 
                v-model="newTransaction.description"
                type="text"
                class="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                placeholder="Enter transaction description"
                required
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Amount</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                <input 
                  v-model="newTransaction.amount"
                  type="number"
                  step="0.01"
                  class="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl pl-8 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                  placeholder="0.00"
                  required
                >
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <div class="relative">
                <div 
                  class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 cursor-pointer flex items-center justify-between"
                  @click="showCategoryDropdown = !showCategoryDropdown"
                >
                  <span class="text-white">{{ selectedCategory || 'Select a category' }}</span>
                  <ChevronDownIcon 
                    class="w-4 h-4 text-gray-400 transition-transform duration-200"
                    :class="{ 'transform rotate-180': showCategoryDropdown }"
                  />
                </div>
                <div 
                  v-if="showCategoryDropdown"
                  class="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                >
                  <div class="sticky top-0 bg-gray-800 border-b border-gray-700 p-2">
                    <input 
                      v-model="categorySearch"
                      type="text"
                      class="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Search categories..."
                      @click.stop
                    >
                  </div>
                  <div 
                    v-if="categorySearch"
                    class="p-1"
                  >
                    <div 
                      v-for="category in filteredCategories" 
                      :key="category.id"
                      class="px-3 py-2 hover:bg-gray-700 cursor-pointer rounded-lg text-white"
                      @click="selectCategory(category)"
                    >
                      {{ category.name }}
                    </div>
                  </div>
                  <div 
                    v-else
                    class="p-1"
                  >
                    <template v-if="newTransaction.type === 'income'">
                      <div 
                        v-for="income in incomes" 
                        :key="income.id"
                        class="px-3 py-2 hover:bg-gray-700 cursor-pointer rounded-lg text-white"
                        @click="selectCategory(income)"
                      >
                        {{ income.description }}
                      </div>
                      <div 
                        class="px-3 py-2 hover:bg-gray-700 cursor-pointer rounded-lg text-white"
                        @click="selectCategory({ id: 'other', name: 'Other Income' })"
                      >
                        Other Income
                      </div>
                    </template>
                    <template v-else>
                      <div class="mb-2">
                        <div class="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-700/50 rounded-lg">
                          Budget Categories
                        </div>
                        <div class="pl-2">
                          <div 
                            v-for="category in categories" 
                            :key="category.id"
                            class="px-3 py-2 hover:bg-gray-700 cursor-pointer rounded-lg text-white"
                            @click="selectCategory(category)"
                          >
                            {{ category.name }}
                          </div>
                        </div>
                      </div>
                      <div class="mb-2">
                        <div class="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-700/50 rounded-lg">
                          Bills
                        </div>
                        <div class="pl-2">
                          <div 
                            v-for="bill in bills" 
                            :key="bill.id"
                            class="px-3 py-2 hover:bg-gray-700 cursor-pointer rounded-lg text-white"
                            @click="selectCategory(bill)"
                          >
                            {{ bill.description }}
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Date</label>
              <input 
                v-model="newTransaction.date"
                type="date"
                class="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                required
              >
            </div>
          </template>

          <!-- Overpayment Section -->
          <div v-if="newTransaction.type === 'expense'" class="space-y-4">
            <button 
              type="button"
              @click="newTransaction.isOverpayment = !newTransaction.isOverpayment"
              class="w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200"
              :class="[
                newTransaction.isOverpayment
                  ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                  : 'bg-gray-700/50 border-gray-600/50 text-gray-400 hover:bg-gray-700/70'
              ]"
            >
              <span class="text-sm font-medium">Is this an overpayment?</span>
              <div class="w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200"
                :class="[
                  newTransaction.isOverpayment
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-600'
                ]"
              >
                <svg 
                  v-if="newTransaction.isOverpayment"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  class="w-3.5 h-3.5 text-gray-900"
                >
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </button>

            <div v-if="newTransaction.isOverpayment" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Original Budget Amount</label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                  <input 
                    v-model="newTransaction.originalBudget"
                    type="number"
                    step="0.01"
                    class="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl pl-8 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                    placeholder="0.00"
                    required
                  >
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Adjustments</label>
                <div class="space-y-3">
                  <div class="p-3 bg-gray-700/30 rounded-xl">
                    <div class="flex justify-between items-center mb-1.5">
                      <span class="text-sm text-gray-400">Overpayment Amount:</span>
                      <span class="font-medium text-white">${{ getOverpaymentAmount }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-400">Remaining to Adjust:</span>
                      <span :class="['font-medium', getRemainingAmount === '0.00' ? 'text-green-400' : 'text-yellow-400']">
                        ${{ getRemainingAmount }}
                      </span>
                    </div>
                  </div>
                  <div v-for="(adjustment, index) in newTransaction.adjustments" :key="index" class="space-y-2">
                    <label class="block text-sm font-medium text-gray-300 mb-1">Reallocation source</label>
                    <select 
                      v-model="adjustment.target"
                      class="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                    >
                      <option value="" disabled>Select category</option>
                      <option v-for="category in categories" :key="category.id" :value="category.id">
                        {{ category.name }}
                      </option>
                    </select>
                    <div class="flex items-center space-x-2">
                      <div class="relative flex-1">
                        <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                        <input 
                          v-model="adjustment.amount"
                          type="number"
                          step="0.01"
                          class="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl pl-8 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                          placeholder="0.00"
                          required
                        >
                      </div>
                      <button 
                        type="button"
                        @click="removeAdjustment(index)"
                        class="p-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <XMarkIcon class="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <button 
                    type="button"
                    @click="addAdjustment"
                    class="w-full flex items-center justify-center space-x-2 p-2.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <PlusIcon class="w-5 h-5" />
                    <span>Add Adjustment</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-2">
            <button 
              type="button"
              @click="showAddTransaction = false"
              class="px-5 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="px-5 py-3 text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-all duration-200"
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <nav class="fixed bottom-0 left-0 right-0 h-24 bg-gray-800/50 backdrop-blur-lg border-t border-gray-700/50" style="padding-bottom: env(safe-area-inset-bottom)">
      <div class="h-full flex items-center justify-around px-4 pb-6 pt-2">
        <router-link 
          v-for="link in navigationLinks" 
          :key="link.name"
          :to="link.path"
          class="flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all duration-200"
        >
          <component 
            :is="link.icon" 
            class="w-7 h-7 mb-1.5 stroke-[1.5]"
            :class="[
              $route.name === link.name 
                ? 'text-' + link.gradient.split('-')[1]
                : 'text-gray-400'
            ]"
          />
          <span 
            class="text-xs font-medium"
            :class="[
              $route.name === link.name 
                ? link.gradient + ' bg-gradient-to-r bg-clip-text text-transparent'
                : 'text-gray-400'
            ]"
          >{{ link.label }}</span>
        </router-link>
      </div>
  </nav>

    <!-- SVG Gradients -->
    <svg width="0" height="0" class="hidden">
      <defs>
        <linearGradient id="dashboardGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color: rgb(96, 165, 250);" />
          <stop offset="100%" style="stop-color: rgb(129, 140, 248);" />
        </linearGradient>
        <linearGradient id="calendarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color: rgb(168, 85, 247);" />
          <stop offset="100%" style="stop-color: rgb(236, 72, 153);" />
        </linearGradient>
        <linearGradient id="transactionsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color: rgb(74, 222, 128);" />
          <stop offset="100%" style="stop-color: rgb(34, 197, 94);" />
        </linearGradient>
        <linearGradient id="billsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color: rgb(251, 113, 133);" />
          <stop offset="100%" style="stop-color: rgb(244, 63, 94);" />
        </linearGradient>
      </defs>
    </svg>

    <!-- Transaction Log View -->
    <TransactionLogView 
      v-if="currentView === 'transactions'"
      @transaction-added="handleTransactionAdded"
    />

    <!-- Bills View -->
    <BillsView 
      v-if="currentView === 'bills'"
      :bills="bills"
      :categories="categories"
      @bill-added="handleBillAdded"
      @bill-updated="handleBillUpdated"
      @bill-deleted="handleBillDeleted"
    />
  </div>
</template>

<script>
import { 
  HomeIcon, 
  CalendarIcon, 
  DocumentTextIcon, 
  Cog6ToothIcon, 
  PlusIcon, 
  CreditCardIcon, 
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'
import { addTransaction, getCategories, getBills, handleOverpayment, getIncomes, getTransactions } from './services/database'
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { LocalNotifications } from '@capacitor/local-notifications'
import { notificationService } from './services/notificationService'
import { startOfWeek, endOfWeek } from 'date-fns'

export default {
  name: 'App',
  components: {
    HomeIcon,
    CalendarIcon,
    DocumentTextIcon,
    Cog6ToothIcon,
    PlusIcon,
    CreditCardIcon,
    XMarkIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ChevronDownIcon
  },
  data() {
    return {
      showAddTransaction: false,
      categories: [],
      bills: [],
      incomes: [],
      newTransaction: {
        type: 'expense',
        description: '',
        amount: '',
        categoryId: '',
        date: new Date().toISOString().split('T')[0],
        isOverpayment: false,
        originalBudget: '',
        adjustments: []
      },
      navigationLinks: [
        {
          name: 'dashboard',
          path: '/',
          label: 'Dashboard',
          icon: HomeIcon,
          gradient: 'from-blue-400 to-indigo-400',
          color: "indigo-400"
        },
        {
          name: 'calendar',
          path: '/calendar',
          label: 'Calendar',
          icon: CalendarIcon,
          gradient: 'from-purple-400 to-pink-400'
        },
        {
          name: 'transactions',
          path: '/transactions',
          label: 'Transactions',
          icon: DocumentTextIcon,
          gradient: 'from-green-400 to-emerald-400'
        },
        {
          name: 'bills',
          path: '/bills',
          label: 'Bills',
          icon: CreditCardIcon,
          gradient: 'from-red-400 to-rose-400'
        }
      ],
      showCategoryDropdown: false,
      categorySearch: ''
    }
  },
  computed: {
    getOverpaymentAmount() {
      console.log('Calculating overpayment amount...')
      console.log('Transaction amount:', this.newTransaction.amount)
      console.log('Original budget:', this.newTransaction.originalBudget)
      
      if (!this.newTransaction.amount || !this.newTransaction.originalBudget) {
        console.log('Missing amount or budget, returning 0.00')
        return '0.00'
      }
      
      const amount = parseFloat(this.newTransaction.amount)
      const budget = parseFloat(this.newTransaction.originalBudget)
      
      console.log('Parsed amount:', amount)
      console.log('Parsed budget:', budget)
      
      if (isNaN(amount) || isNaN(budget)) {
        console.log('Invalid numbers, returning 0.00')
        return '0.00'
      }
      
      const result = (amount - budget).toFixed(2)
      console.log('Final overpayment amount:', result)
      return result
    },
    getRemainingAmount() {
      console.log('Calculating remaining amount...')
      console.log('Overpayment amount:', this.getOverpaymentAmount)
      
      if (!this.newTransaction.amount || !this.newTransaction.originalBudget) {
        console.log('Missing amount or budget, returning 0.00')
        return '0.00'
      }
      
      const amount = parseFloat(this.newTransaction.amount)
      const budget = parseFloat(this.newTransaction.originalBudget)
      
      console.log('Parsed amount:', amount)
      console.log('Parsed budget:', budget)
      
      if (isNaN(amount) || isNaN(budget)) {
        console.log('Invalid numbers, returning 0.00')
        return '0.00'
      }
      
      const overpaymentAmount = amount - budget
      console.log('Overpayment amount before adjustments:', overpaymentAmount)
      
      const adjustmentsTotal = this.newTransaction.adjustments.reduce((sum, adj) => {
        const adjAmount = parseFloat(adj.amount) || 0
        console.log('Adjustment amount:', adjAmount)
        return sum + adjAmount
      }, 0)
      
      console.log('Total adjustments:', adjustmentsTotal)
      
      const result = (overpaymentAmount - adjustmentsTotal).toFixed(2)
      console.log('Final remaining amount:', result)
      return result
    },
    selectedCategory() {
      if (this.newTransaction.type === 'income') {
        const income = this.incomes.find(i => i.id === this.newTransaction.categoryId)
        return income ? income.description : 'Other Income'
      } else {
        const category = this.categories.find(c => c.id === this.newTransaction.categoryId)
        if (category) return category.name
        const bill = this.bills.find(b => b.id === this.newTransaction.categoryId)
        return bill ? bill.description : ''
      }
    },
    filteredCategories() {
      if (!this.categorySearch) return []
      const search = this.categorySearch.toLowerCase()
      return this.categories.filter(category => 
        category.name.toLowerCase().includes(search)
      )
    }
  },
  methods: {
    async getCategoryBudget(categoryId) {
      // First check if it's a bill
      const bill = this.bills.find(b => b.id === categoryId)
      if (bill) {
        return Number(bill.amount).toFixed(2)
      }
      
      // Then check if it's a category
      const category = this.categories.find(c => c.id === categoryId)
      if (category) {
        // Get weekly budget amount
        const weeklyBudget = Number(category.weeklyBudget || 0).toFixed(2)

        // Get current week's start and end dates using date-fns
        const now = new Date()
        const weekStart = startOfWeek(now, { weekStartsOn: 0 }) // Sunday
        const weekEnd = endOfWeek(now, { weekStartsOn: 0 }) // Saturday

        console.log('Calculating budget for category:', {
          categoryName: category.name,
          weeklyBudget,
          weekStart: weekStart.toISOString(),
          weekEnd: weekEnd.toISOString()
        })

        // Get all transactions
        const transactions = await getTransactions()
        
        // Find transactions for this category in current week
        const weeklyTransactions = transactions.filter(t => {
          const transactionDate = new Date(t.date)
          return t.category === category.name && 
                 t.type === 'expense' &&
                 transactionDate >= weekStart && 
                 transactionDate <= weekEnd
        })

        console.log('Found transactions:', weeklyTransactions)

        // Calculate total spent - ensure proper rounding
        const spent = weeklyTransactions.reduce((total, t) => {
          return total + Number(Number(t.amount).toFixed(2))
        }, 0).toFixed(2)
        
        console.log('Total spent:', spent)

        // Find adjustments that affect this category
        const adjustments = transactions
          .filter(t => t.isOverpayment && t.adjustments)
          .flatMap(t => t.adjustments)
          .filter(a => {
            const adjustmentCategory = this.categories.find(c => c.id === a.target)
            return adjustmentCategory?.name === category.name
          })
          .reduce((total, a) => {
            return total + Number(Number(a.amount).toFixed(2))
          }, 0).toFixed(2)

        console.log('Total adjustments:', adjustments)

        // Calculate remaining budget with proper rounding
        const remaining = (Number(weeklyBudget) - Number(spent) + Number(adjustments)).toFixed(2)
        console.log('Remaining budget:', remaining)
        
        return Math.max(0, Number(remaining)).toFixed(2) // Don't return negative budget, ensure 2 decimal places
      }
      
      return "0.00"
    },
    addAdjustment() {
      // Add the new adjustment with empty values first
      this.newTransaction.adjustments.push({
        target: '',
        amount: ''
      })

      // Get the total number of adjustments
      const numAdjustments = this.newTransaction.adjustments.length

      // Calculate the overpayment amount
      const overpaymentAmount = Number(this.getOverpaymentAmount)
      
      // Calculate the amount per adjustment (rounded to 2 decimal places)
      const amountPerAdjustment = (overpaymentAmount / numAdjustments).toFixed(2)

      // Distribute the amount evenly among all adjustments
      this.newTransaction.adjustments = this.newTransaction.adjustments.map((adj, index) => {
        // For the last adjustment, use the remaining amount to avoid rounding errors
        if (index === numAdjustments - 1) {
          const totalPreviousAdjustments = this.newTransaction.adjustments
            .slice(0, -1)
            .reduce((sum, a) => sum + Number(a.amount || 0), 0)
          const remainingAmount = (overpaymentAmount - totalPreviousAdjustments).toFixed(2)
          return { ...adj, amount: remainingAmount }
        }
        return { ...adj, amount: amountPerAdjustment }
      })
    },
    removeAdjustment(index) {
      // Remove the adjustment
      this.newTransaction.adjustments.splice(index, 1)

      // If there are remaining adjustments, redistribute the amounts
      if (this.newTransaction.adjustments.length > 0) {
        const overpaymentAmount = Number(this.getOverpaymentAmount)
        const numAdjustments = this.newTransaction.adjustments.length
        const amountPerAdjustment = (overpaymentAmount / numAdjustments).toFixed(2)

        this.newTransaction.adjustments = this.newTransaction.adjustments.map((adj, i) => {
          if (i === numAdjustments - 1) {
            const totalPreviousAdjustments = this.newTransaction.adjustments
              .slice(0, -1)
              .reduce((sum, a) => sum + Number(a.amount || 0), 0)
            const remainingAmount = (overpaymentAmount - totalPreviousAdjustments).toFixed(2)
            return { ...adj, amount: remainingAmount }
          }
          return { ...adj, amount: amountPerAdjustment }
        })
      }
    },
    async handleAddTransaction() {
      try {
        // Get the category info
        const category = this.categories.find(c => c.id === this.newTransaction.categoryId)

        const transactionData = {
          type: this.newTransaction.type,
          description: this.newTransaction.description,
          amount: Number(this.newTransaction.amount),
          category: category?.name,
          categoryId: this.newTransaction.categoryId,
          date: this.newTransaction.date
        }
        
        // If it's an overpayment, add the necessary properties and handle it differently
        if (this.newTransaction.isOverpayment) {
          const overpaymentData = {
            ...transactionData,
            isOverpayment: true,
            originalBudget: Number(this.newTransaction.originalBudget),
            adjustments: this.newTransaction.adjustments,
            category: category?.name,
            categoryId: this.newTransaction.categoryId
          }

          // Validate adjustments sum up to overpayment amount
          const remainingAmount = Number(this.getRemainingAmount)
          if (remainingAmount !== 0) {
            alert(`Please ensure your adjustments sum up to the overpayment amount. Remaining: $${remainingAmount}`)
            return
          }

          await handleOverpayment(overpaymentData)
        } else {
          await addTransaction(transactionData)
        }
        
        // Reset form
        this.newTransaction = {
          type: 'expense',
          description: '',
          amount: '',
          categoryId: '',
          date: new Date().toISOString().split('T')[0],
          isOverpayment: false,
          originalBudget: '',
          adjustments: []
        }
        this.showAddTransaction = false
      } catch (error) {
        console.error('Error adding transaction:', error)
        alert('Failed to add transaction. Please try again.')
      }
    },
    async handleTransactionAdded() {
      // Refresh all data to update budgets and categories
      await this.loadData()
      await this.loadBills()
      await this.loadCategories()
      await this.loadTransactions()
    },
    async loadData() {
      try {
        await Promise.all([
          this.loadBills(),
          this.loadCategories(),
          this.loadTransactions()
        ])
      } catch (error) {
        console.error('Error loading data:', error)
      }
    },
    async loadBills() {
      try {
        this.bills = await getBills()
      } catch (error) {
        console.error('Error loading bills:', error)
      }
    },
    async loadTransactions() {
      try {
        // Implementation of loadTransactions method
      } catch (error) {
        console.error('Error loading transactions:', error)
      }
    },
    async handleBillAdded(bill) {
      // Implementation of handleBillAdded method
    },
    async handleBillUpdated(bill) {
      // Implementation of handleBillUpdated method
    },
    async handleBillDeleted(bill) {
      // Implementation of handleBillDeleted method
    },
    selectCategory(item) {
      this.newTransaction.categoryId = item.id
      this.categorySearch = ''
      this.showCategoryDropdown = false
    },
    handleClickOutside(event) {
      // Close dropdown if clicking outside
      if (!event.target.closest('.relative')) {
        this.showCategoryDropdown = false
      }
    },
    getCategoryEmoji(categoryName) {
      const emojis = {
        // Housing & Living
        'Rent/Mortgage': '🏠',
        'Property Tax': '📋',
        'Home Insurance': '🏡',
        'Home Maintenance': '🔧',
        'Furniture': '🪑',
        'Appliances': '🔌',
        'Home Improvement': '🏗️',
        
        // Utilities
        'Electricity': '⚡',
        'Water': '💧',
        'Gas': '🔥',
        'Internet': '🌐',
        'Phone': '📱',
        'Cable/Satellite': '📺',
        
        // Insurance
        'Health Insurance': '🏥',
        'Dental Insurance': '🦷',
        'Vision Insurance': '👁️',
        'Life Insurance': '🛡️',
        'Auto Insurance': '🚗',
        'Disability Insurance': '♿',
        
        // Transportation
        'Car Payment': '🚙',
        'Car Maintenance': '🔧',
        'Gas/Fuel': '⛽',
        'Public Transit': '🚌',
        'Parking': '🅿️',
        'Tolls': '🎫',
        
        // Healthcare
        'Doctor Visits': '👨‍⚕️',
        'Prescriptions': '💊',
        'Medical Supplies': '🏥',
        'Dental Care': '🦷',
        'Vision Care': '👁️',
        'Mental Health': '🧠',
        
        // Food & Dining
        'Groceries': '🛒',
        'Restaurants': '🍽️',
        'Takeout': '🥡',
        'Coffee Shops': '☕',
        'Food Delivery': '🚚',
        'Snacks': '🍪',
        
        // Shopping & Personal
        'Clothing': '👕',
        'Shoes': '👟',
        'Personal Care': '🧴',
        'Hair Care': '💇',
        'Cosmetics': '💄',
        'Gym Membership': '💪',
        
        // Entertainment
        'Streaming Services': '📺',
        'Gaming': '🎮',
        'Movies': '🎬',
        'Concerts': '🎵',
        'Hobbies': '🎨',
        'Sports': '⚽',
        'Subscriptions': '📱',
        
        // Education
        'Tuition': '🎓',
        'Books': '📚',
        'School Supplies': '✏️',
        'Student Loans': '📝',
        'Online Courses': '💻',
        'Professional Development': '📈',
        
        // Financial
        'Credit Cards': '💳',
        'Bank Fees': '🏦',
        'Investment Fees': '📊',
        'Tax Preparation': '📋',
        'Financial Planning': '💰',
        
        // Pets
        'Pet Food': '🐕',
        'Veterinary': '🐾',
        'Pet Supplies': '🦴',
        'Pet Insurance': '🐱',
        'Pet Grooming': '🛁',
        
        // Gifts & Donations
        'Gifts': '🎁',
        'Charitable Donations': '🤝',
        'Wedding Gifts': '💒',
        'Birthday Gifts': '🎂',
        
        // Travel
        'Flights': '✈️',
        'Hotels': '🏨',
        'Vacation': '🏖️',
        'Travel Insurance': '🛡️',
        'Travel Supplies': '🎒',

        // Technology
        'Software Licenses': '💻',
        'Cloud Services': '☁️',
        'Domain Names': '🌐',
        'Hosting': '🖥️',
        'VPN Services': '🔒',
        'Antivirus': '🛡️',
        'Backup Services': '💾',
        'Development Tools': '⚙️',
        'API Services': '🔌',
        'Analytics Tools': '📊',
        'Project Management': '📋',
        'Communication Tools': '💬',
        'Design Software': '🎨',
        'Testing Services': '🧪',
        'Security Services': '🔐',
        
        // Business
        'Office Rent': '🏢',
        'Office Supplies': '📎',
        'Business Insurance': '🏢',
        'Professional Services': '👔',
        'Legal Services': '⚖️',
        'Accounting Services': '📊',
        'Marketing': '📢',
        'Advertising': '🎯',
        'Business Travel': '✈️',
        'Client Entertainment': '🍽️',
        'Business Equipment': '🖥️',
        'Business Software': '💻',
        'Business Phone': '📱',
        'Business Internet': '🌐',
        'Business Utilities': '⚡',
        'Business Taxes': '📋',
        'Business Licenses': '📜',
        'Business Registration': '📝',
        'Business Banking': '🏦',
        'Business Credit Cards': '💳',
        'Business Loans': '💰',
        'Business Consulting': '💡',
        'Business Training': '📚',
        'Business Memberships': '🤝',
        'Business Subscriptions': '📱',
        'Business Maintenance': '🔧',
        'Business Repairs': '🔨',
        'Business Upgrades': '⬆️',
        'Business Security': '🔒',
        'Business Compliance': '✅',
        
        // Other
        'Legal Fees': '⚖️',
        'Moving Expenses': '📦',
        'Storage': '📦',
        'Memberships': '🤝',
        'Other': '📝',

        // Income Categories
        'Salary': '💰',
        'Hourly Wage': '⏰',
        'Overtime': '🕒',
        'Bonuses': '🎁',
        'Commission': '📈',
        'Tips': '💸',
        
        'Freelance': '💻',
        'Consulting': '💡',
        'Contract Work': '📝',
        'Business Income': '🏢',
        'Side Hustle': '💪',
        
        'Stock Dividends': '📈',
        'Interest Income': '💰',
        'Capital Gains': '📊',
        'Rental Income': '🏠',
        'Royalties': '📚',
        'Cryptocurrency': '₿',
        
        'Social Security': '👴',
        'Pension': '🏦',
        'Disability': '♿',
        'Unemployment': '📋',
        'Child Support': '👶',
        'Alimony': '💑',
        
        'Gifts': '🎁',
        'Inheritance': '📜',
        'Lottery/Winnings': '🎰',
        'Selling Items': '💰',
        'Other Income': '📝'
      }
      return emojis[categoryName] || '📋'
    }
  },
  setup() {
    const router = useRouter()
    const lastCheckIn = ref(new Date().toISOString())

    onMounted(async () => {
      try {
        console.log('App mounting...')
        console.log('Router initialized:', router.currentRoute.value.path)
        
        // Initialize notifications with proper error handling
        try {
          await LocalNotifications.requestPermissions()
          
          // Add notification listener
          LocalNotifications.addListener('localNotificationActionPerformed', 
            (notification) => {
              console.log('Notification received:', notification)
              try {
                switch (notification.actionId) {
                  case 'DAILY_CHECKIN':
                  case 'WEEKLY_REVIEW':
                  case 'MONTHLY_WRAPUP':
                    router.push('/dashboard')
                    break
                  case 'BILL_REMINDER':
                    router.push('/bills')
                    break
                  case 'INCOME_RECEIVED':
                  case 'BALANCE_ALERT':
                  case 'INACTIVITY_REMINDER':
                    router.push('/dashboard')
                    break
                }
              } catch (error) {
                console.error('Error handling notification action:', error)
              }
            }
          )

          // Check for pending notifications
          const pending = await LocalNotifications.getPending()
          console.log('Pending notifications:', pending)

        } catch (error) {
          console.error('Error setting up notifications:', error)
        }

      } catch (error) {
        console.error('Error during app initialization:', error)
      }
    })

    return {
      lastCheckIn
    }
  },
  async created() {
    try {
      const [categoriesData, billsData, incomesData] = await Promise.all([
        getCategories(),
        getBills(),
        getIncomes()
      ])
      this.categories = categoriesData || []
      this.bills = billsData || []
      this.incomes = incomesData || []
    } catch (error) {
      console.error('Error loading data:', error)
    }
  },
  errorCaptured(err, vm, info) {
    console.error('App Error:', err)
    console.error('Component:', vm)
    console.error('Info:', info)
    return false // prevent error from propagating further
  },
  watch: {
    'newTransaction.categoryId': {
      immediate: true,
      async handler(newCategoryId) {
        console.log('Category changed:', newCategoryId)
        console.log('Is overpayment:', this.newTransaction.isOverpayment)
        
        if (newCategoryId) {
          const budget = await this.getCategoryBudget(newCategoryId)
          console.log('Setting original budget from category:', budget)
          this.newTransaction.originalBudget = budget.toString()
        }
      }
    },
    'newTransaction.isOverpayment': {
      async handler(newValue) {
        console.log('Overpayment changed:', newValue)
        if (!newValue) {
          this.newTransaction.originalBudget = ''
          this.newTransaction.adjustments = []
        } else if (this.newTransaction.categoryId) {
          const budget = await this.getCategoryBudget(this.newTransaction.categoryId)
          console.log('Setting original budget from category:', budget)
          this.newTransaction.originalBudget = budget.toString()
        }
      }
    }
  },
  mounted() {
    // Add click outside listener
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    // Remove click outside listener
    document.removeEventListener('click', this.handleClickOutside)
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

/* Navigation styles */
nav {
  padding-bottom: env(safe-area-inset-bottom);
}

nav a {
  font-weight: normal;
  color: inherit;
  min-width: 64px;
}

nav a.router-link-exact-active {
  color: inherit;
}

/* Force icon colors in navigation */
nav a[href="/"] svg {
  color: rgb(129, 140, 248);
}

nav a[href="/calendar"] svg {
  color: rgb(192, 132, 252);
}

nav a[href="/transactions"] svg {
  color: rgb(34, 197, 94);
}

nav a[href="/bills"] svg {
  color: rgb(244, 63, 94);
}

nav a:not(.router-link-active) svg {
  color: rgb(156, 163, 175);
}

@keyframes gradient-x {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-gradient-x {
  background-size: 200% 200%;
  animation: gradient-x 3s ease infinite;
}
</style>
