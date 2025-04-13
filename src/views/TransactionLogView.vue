/* eslint-disable */
<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <div class="p-4 space-y-4">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
        {{ error }}
      </div>

      <!-- Content -->
      <template v-else>
        <!-- Search and Filters -->
        <div class="space-y-3">
          <!-- Search -->
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              v-model="filters.search"
              placeholder="Search transactions..."
              class="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
          </div>

          <!-- Filter Toggle -->
          <button
            @click="isFiltersExpanded = !isFiltersExpanded"
            class="w-full flex items-center justify-between px-4 py-3 bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors duration-200"
          >
            <div class="flex items-center gap-2">
              <FunnelIcon class="w-5 h-5" />
              <span class="text-sm font-medium">Filters</span>
            </div>
            <ChevronDownIcon 
              class="w-5 h-5 transition-transform duration-200"
              :class="{ 'rotate-180': isFiltersExpanded }"
            />
          </button>

          <!-- Filters (Collapsible) -->
          <div 
            v-show="isFiltersExpanded"
            class="space-y-4 bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
          >
            <!-- Date Range -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
              <div class="flex gap-2">
                <div class="flex-1 relative">
                  <input 
                    type="date" 
                    v-model="filters.startDate"
                    placeholder="mm/dd/yyyy"
                    class="w-full px-4 py-2.5 bg-gray-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors duration-200 appearance-none"
                  >
                </div>
                <div class="flex-1 relative">
                  <input 
                    type="date" 
                    v-model="filters.endDate"
                    placeholder="mm/dd/yyyy"
                    class="w-full px-4 py-2.5 bg-gray-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors duration-200 appearance-none"
                  >
                </div>
              </div>
            </div>

            <!-- Price Range -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Price Range</label>
              <div class="flex gap-2">
                <div class="flex-1 relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input 
                    type="number" 
                    v-model="filters.minAmount"
                    placeholder="Min"
                    class="w-full pl-8 pr-4 py-2.5 bg-gray-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors duration-200"
                  >
                </div>
                <div class="flex-1 relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input 
                    type="number" 
                    v-model="filters.maxAmount"
                    placeholder="Max"
                    class="w-full pl-8 pr-4 py-2.5 bg-gray-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors duration-200"
                  >
                </div>
              </div>
            </div>

            <!-- Type -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <select 
                v-model="filters.type"
                class="w-full px-4 py-2.5 bg-gray-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors duration-200 appearance-none"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <!-- Category -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select 
                v-model="filters.category"
                class="w-full px-4 py-2.5 bg-gray-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors duration-200 appearance-none"
              >
                <option value="">All Categories</option>
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Transactions Header -->
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold text-white">Transactions</h3>
          <button 
            @click="exportTransactions"
            class="px-3 py-1.5 text-sm bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg border border-green-500/20 transition-all duration-200"
          >
            Export
          </button>
        </div>

        <!-- Transactions List -->
        <div class="space-y-3">
          <div v-if="filteredTransactions.length === 0" class="text-center text-gray-400 py-8">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
              <DocumentTextIcon class="w-8 h-8 text-gray-600" />
            </div>
            <p class="text-sm font-medium">No transactions found</p>
            <p class="text-xs text-gray-500 mt-1">Try adjusting your filters</p>
          </div>
          <div 
            v-for="transaction in filteredTransactions" 
            :key="transaction.id"
            class="group flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/30 hover:bg-gray-800/70 hover:border-gray-700/50 transition-all duration-200 cursor-pointer"
            @click="showTransactionDetails(transaction)"
          >
            <div class="flex items-center gap-4 min-w-0 flex-1">
              <div 
                :class="[
                  'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer',
                  transaction.type === 'income' 
                    ? 'bg-green-500/10 group-hover:bg-green-500/20' 
                    : 'bg-red-500/10 group-hover:bg-red-500/20'
                ]"
                @click.stop="selectCategory(transaction.category)"
              >
                <template v-if="transaction.type === 'income'">
                  <ArrowUpIcon class="w-6 h-6 text-green-400" />
                </template>
                <template v-else>
                  <span class="text-xl">{{ getCategoryEmoji(transaction.category) }}</span>
                </template>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between">
                  <p class="font-medium text-white truncate">{{ transaction.description }}</p>
                  <p :class="[
                    'text-lg font-semibold pl-4',
                    transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                  ]">
                    {{ transaction.type === 'income' ? '+' : '-' }}${{ transaction.amount }}
                  </p>
                </div>
                <div class="flex items-center gap-2 mt-1">
                  <span 
                    class="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-300 cursor-pointer hover:bg-gray-700/70"
                    @click.stop="selectCategory(transaction.category)"
                  >
                    {{ transaction.category }}
                  </span>
                  <span class="text-xs text-gray-500">{{ formatDate(transaction.date) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Transaction Details Modal -->
        <div v-if="selectedTransaction" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div class="bg-gray-800/90 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6 w-full max-w-md">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Transaction Details
                </h2>
                <p class="text-sm text-gray-400 mt-1">View and manage transaction</p>
              </div>
              <button 
                @click="selectedTransaction = null" 
                class="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>

            <div class="space-y-6">
              <!-- Transaction Info -->
              <div class="space-y-4">
                <div class="flex items-center gap-4">
                  <div :class="[
                    'w-14 h-14 rounded-xl flex items-center justify-center',
                    selectedTransaction.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'
                  ]">
                    <component 
                      :is="selectedTransaction.type === 'income' ? 'ArrowUpIcon' : 'ArrowDownIcon'"
                      :class="[
                        'w-7 h-7',
                        selectedTransaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                      ]"
                    />
                  </div>
                  <div>
                    <h3 class="text-xl font-medium text-white">{{ selectedTransaction.description }}</h3>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-sm font-medium px-2.5 py-0.5 rounded-full bg-gray-700/50 text-gray-300">
                        {{ selectedTransaction.category }}
                      </span>
                      <span class="text-sm text-gray-500">{{ formatDate(selectedTransaction.date) }}</span>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="p-3 bg-gray-700/30 rounded-lg">
                    <p class="text-sm text-gray-400">Amount</p>
                    <p :class="[
                      'text-xl font-semibold mt-1',
                      selectedTransaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                    ]">
                      {{ selectedTransaction.type === 'income' ? '+' : '-' }}${{ selectedTransaction.amount }}
                    </p>
                  </div>
                  <div class="p-3 bg-gray-700/30 rounded-lg">
                    <p class="text-sm text-gray-400">Date</p>
                    <p class="text-xl font-semibold text-white mt-1">{{ formatDate(selectedTransaction.date) }}</p>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-3">
                <button 
                  @click="editTransaction(selectedTransaction)"
                  class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/20 transition-colors duration-200"
                >
                  <PencilIcon class="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button 
                  @click="duplicateTransaction(selectedTransaction)"
                  class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl border border-green-500/20 transition-colors duration-200"
                >
                  <PlusIcon class="w-4 h-4" />
                  <span>Duplicate</span>
                </button>
                <button 
                  @click="deleteTransaction(selectedTransaction.id)"
                  class="w-12 flex items-center justify-center px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-colors duration-200"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Transaction Modal -->
        <EditTransactionModal
          v-model="showEditModal"
          :transaction="editingTransaction"
          :categories="categories"
          :bills="bills"
          @save="handleSaveTransaction"
        />
      </template>
    </div>
  </div>
</template>

<script>
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  FunnelSlashIcon,
  ChevronDownIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'
import { format } from 'date-fns'
import { 
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
  getBills,
  handleOverpayment
} from '../services/database'
import EditTransactionModal from '../components/EditTransactionModal.vue'

export default {
  name: 'TransactionLogView',
  components: {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    FunnelSlashIcon,
    ChevronDownIcon,
    EditTransactionModal,
    DocumentTextIcon
  },
  data() {
    return {
      isFiltersExpanded: false,
      showEditModal: false,
      editingTransaction: null,
      categories: [],
      bills: [],
      transactions: [],
      selectedDate: new Date().toISOString().split('T')[0],
      filters: {
        search: '',
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: '',
        category: '',
        type: ''
      },
      isLoading: true,
      error: null,
      selectedTransaction: null,
      categoriesData: {},
      billsData: {},
    }
  },
  async created() {
    // Initialize data in created hook
    this.isLoading = true
    try {
      await this.loadData()
    } catch (error) {
      console.error('Error loading data:', error)
      this.error = 'Failed to load data. Please try again.'
    } finally {
      this.isLoading = false
    }
  },
  computed: {
    filteredTransactions() {
      if (!this.transactions) return []
      return this.transactions.filter(transaction => {
        const matchesSearch = !this.filters.search || 
          transaction.description.toLowerCase().includes(this.filters.search.toLowerCase()) ||
          transaction.category.toLowerCase().includes(this.filters.search.toLowerCase())
        const matchesCategory = !this.filters.category || transaction.category === this.filters.category
        const matchesType = !this.filters.type || transaction.type === this.filters.type
        const matchesDateRange = (!this.filters.startDate || new Date(transaction.date) >= new Date(this.filters.startDate)) &&
                               (!this.filters.endDate || new Date(transaction.date) <= new Date(this.filters.endDate))
        const matchesAmount = (!this.filters.minAmount || transaction.amount >= Number(this.filters.minAmount)) &&
                            (!this.filters.maxAmount || transaction.amount <= Number(this.filters.maxAmount))
        return matchesSearch && matchesCategory && matchesType && matchesDateRange && matchesAmount
      })
    }
  },
  methods: {
    async loadData() {
      try {
        console.log('Starting to load data...')
        const [categoriesData, transactionsData, billsData] = await Promise.all([
          getCategories(),
          getTransactions(),
          getBills()
        ])
        console.log('Loaded transactions:', transactionsData)
        console.log('Loaded categories:', categoriesData)
        console.log('Loaded bills:', billsData)
        
        // Store the full category and bill objects for reference
        this.categoriesData = categoriesData || {}
        this.billsData = billsData || {}
        
        // Format categories for the dropdown
        const dbCategories = categoriesData ? Object.values(categoriesData).map(cat => cat.name) : []
        const billCategories = [
          'Rent/Mortgage',
          'Utilities',
          'Insurance',
          'Phone',
          'Internet',
          'Car Payment',
          'Credit Card',
          'Student Loan',
          'Medical',
          'Other Bill'
        ]
        this.categories = ['Income', ...billCategories, ...dbCategories]

        // Store transactions with their category names
        this.transactions = (transactionsData || []).map(transaction => ({
          ...transaction,
          category: transaction.category || 'Uncategorized'
        }))
      } catch (error) {
        console.error('Error loading data:', error)
        throw error
      }
    },
    async loadTransactions() {
      try {
        this.transactions = await getTransactions() || []
      } catch (error) {
        console.error('Error loading transactions:', error)
        throw error
      }
    },
    editTransaction(transaction) {
      this.editingTransaction = {
        id: transaction.id,
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
        type: transaction.type,
        date: transaction.date,
        isRecurring: transaction.isRecurring || false,
        frequency: transaction.frequency || 'monthly',
        nextDueDate: transaction.nextDueDate || ''
      }
      this.showEditModal = true
      this.selectedTransaction = null // Close details modal when opening edit modal
    },
    async deleteTransaction(id) {
      if (confirm('Are you sure you want to delete this transaction?')) {
        try {
          await deleteTransaction(id)
          this.transactions = this.transactions.filter(t => t.id !== id)
          this.selectedTransaction = null // Close the modal after successful deletion
        } catch (error) {
          console.error('Error deleting transaction:', error)
          alert('Failed to delete transaction. Please try again.')
        }
      }
    },
    async handleSaveTransaction(formData) {
      try {
        if (this.editingTransaction) {
          await updateTransaction(this.editingTransaction.id, formData)
          const index = this.transactions.findIndex(t => t.id === this.editingTransaction.id)
          if (index !== -1) {
            this.transactions[index] = {
              ...this.editingTransaction,
              ...formData
            }
          }
        } else {
          let id
          if (formData.isOverpayment) {
            // Create adjustment transactions first
            const originalItem = this.billsData[formData.categoryId] || this.categoriesData[formData.categoryId]
            const originalName = originalItem?.description || originalItem?.name || 'Unknown'

            // Create adjustment transactions
            for (const adjustment of formData.adjustments) {
              const adjustmentTransaction = {
                type: 'expense',
                description: `Overpay Adjustment - ${originalName}`,
                amount: Number(adjustment.amount),
                categoryId: adjustment.target, // Use the target category ID directly
                date: formData.date,
                isOverpayment: false
              }
              await addTransaction(adjustmentTransaction)
            }

            // Then handle the main overpayment
            id = await handleOverpayment(formData)
          } else {
            id = await addTransaction(formData)
          }
          
          // Add the new transaction to the list
          this.transactions.push({
            id,
            ...formData
          })

          // Emit an event to notify parent components to refresh their data
          this.$emit('transaction-added')
        }
        
        this.editingTransaction = null
        await this.loadData() // Refresh transaction data
        
        // Close any open modals
        this.showEditModal = false
        this.selectedTransaction = null
      } catch (error) {
        console.error('Error saving transaction:', error)
        alert('Failed to save transaction. Please try again.')
      }
    },
    async handleDateChange() {
      try {
        await this.loadTransactions()
      } catch (error) {
        console.error('Error handling date change:', error)
        throw error
      }
    },
    formatDate(date) {
      return format(new Date(date), 'MMM d, yyyy')
    },
    applyFilters() {
      // No need to reassign filteredTransactions as it's a computed property
    },
    exportTransactions() {
      if (!this.filteredTransactions.length) return
      
      // Convert transactions to CSV format
      const headers = ['Date', 'Type', 'Description', 'Category', 'Amount']
      const csvContent = [
        headers.join(','),
        ...this.filteredTransactions.map(transaction => [
          format(new Date(transaction.date), 'yyyy-MM-dd'),
          transaction.type,
          `"${transaction.description}"`,
          transaction.category,
          transaction.amount
        ].join(','))
      ].join('\n')
      
      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    showTransactionDetails(transaction) {
      this.selectedTransaction = transaction
    },
    async duplicateTransaction(transaction) {
      try {
        const duplicatedTransaction = {
          description: transaction.description,
          amount: transaction.amount,
          category: transaction.category,
          type: transaction.type,
          date: new Date().toISOString().split('T')[0]
        }
        const id = await addTransaction(duplicatedTransaction)
        this.transactions.push({
          id,
          ...duplicatedTransaction
        })
        this.selectedTransaction = null // Close the modal after successful duplication
        await this.loadData() // Refresh data to ensure everything is up to date
      } catch (error) {
        console.error('Error duplicating transaction:', error)
        alert('Failed to duplicate transaction. Please try again.')
      }
    },
    getCategoryEmoji(category) {
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
        'Other': '📝'
      }
      return emojis[category] || '📋'
    },
    selectCategory(category) {
      // If clicking the same category, clear the filter
      if (this.filters.category === category) {
        this.filters.category = ''
        return
      }
      // Otherwise, set the new category filter
      this.filters.category = category
      this.isFiltersExpanded = true
    }
  }
}
</script> 