<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <div class="max-w-2xl mx-auto px-4 py-6 space-y-4 sm:space-y-6 sm:py-8 sm:px-6">
      <!-- Monthly Budget -->
      <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-gray-700/50 overflow-hidden">
        <div class="p-4 sm:p-6 border-b border-gray-700/50">
          <h2 class="text-lg sm:text-xl font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Monthly Budget</h2>
        </div>

        <div class="p-4 sm:p-6">
          <div class="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-500/20">
            <div class="flex flex-col items-center text-center">
              <p class="text-sm font-medium text-blue-400">Total Available Budget</p>
              <p class="text-3xl sm:text-4xl font-bold text-white mt-1.5 sm:mt-2">${{ totalMonthlyBudget.toFixed(2) }}</p>
              <p class="text-xs sm:text-sm text-gray-400 mt-1.5 sm:mt-2">
                Based on your incomes this month
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Weekly Budgets -->
      <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-gray-700/50 overflow-hidden">
        <div class="p-4 sm:p-6 border-b border-gray-700/50">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <h2 class="text-lg sm:text-xl font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Weekly Budgets</h2>
            <span class="text-sm text-gray-400">Week of {{ formatDate(startOfWeek(new Date(), { weekStartsOn: 1 })) }}</span>
          </div>
        </div>
        
        <div class="p-4 sm:p-6">
          <div class="space-y-4 sm:space-y-6">
            <div v-if="categories.length === 0" class="text-center py-6 sm:py-8">
              <div class="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-gray-700/30 flex items-center justify-center mb-3 sm:mb-4">
                <TagIcon class="w-7 h-7 sm:w-8 sm:h-8 text-gray-500" />
              </div>
              <p class="text-gray-400">No categories available</p>
              <p class="text-xs sm:text-sm text-gray-500 mt-1">Add categories to start budgeting</p>
            </div>
            <div v-else>
              <div v-for="category in categories" :key="category.id" 
                class="bg-gradient-to-r from-gray-700/30 to-gray-800/30 rounded-lg sm:rounded-xl border border-gray-600/30 p-4 sm:p-6 mb-3 sm:mb-4 group hover:from-gray-700/40 hover:to-gray-800/40 transition-all duration-200"
              >
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4">
                  <div class="flex items-center space-x-3 sm:space-x-4">
                    <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center" :style="{ backgroundColor: category.color + '20' }">
                      <TagIcon class="w-5 h-5 sm:w-6 sm:h-6" :style="{ color: category.color }" />
                    </div>
                    <div>
                      <h3 class="text-base sm:text-lg font-semibold text-white">{{ category.name }}</h3>
                      <p class="text-xs sm:text-sm text-gray-400">{{ category.frequency }}</p>
                    </div>
                  </div>
                  <div class="flex items-center justify-between sm:space-x-6">
                    <div class="text-right">
                      <p class="text-xs sm:text-sm text-gray-400">Monthly</p>
                      <p class="text-base sm:text-lg font-semibold text-white">${{ Number(category.budget).toFixed(2) }}</p>
                    </div>
                    <div class="text-right">
                      <p class="text-xs sm:text-sm text-gray-400">Weekly</p>
                      <p class="text-base sm:text-lg font-semibold text-white">${{ Number(category.weeklyBudget || getWeeklyAllocationValue(category)).toFixed(2) }}</p>
                    </div>
                  </div>
                </div>
                
                <div class="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0">
                  <div class="flex-1 sm:mr-6">
                    <div class="h-2.5 sm:h-3 bg-gray-600/30 rounded-full overflow-hidden">
                      <div 
                        class="h-full rounded-full transition-all duration-300"
                        :style="{ 
                          backgroundColor: category.color,
                          width: `${Math.min((weeklyBudgets.find(b => b.categoryId === category.id)?.spent || 0) / (category.weeklyBudget || getWeeklyAllocationValue(category)) * 100, 100)}%`,
                          boxShadow: `0 0 20px ${category.color}40`
                        }"
                      ></div>
                    </div>
                    <div class="flex justify-between mt-1.5 sm:mt-2">
                      <span class="text-xs sm:text-sm text-gray-400">$0</span>
                      <span class="text-xs sm:text-sm text-gray-400">${{ Number(category.weeklyBudget || getWeeklyAllocationValue(category)).toFixed(2) }}</span>
                    </div>
                  </div>
                  <button
                    @click="editCategory(category)"
                    class="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 rounded-lg sm:rounded-xl border border-blue-500/30 hover:from-blue-500/30 hover:to-indigo-500/30 transition-all duration-200"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories -->
      <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-gray-700/50 overflow-hidden">
        <div class="p-4 sm:p-6 border-b border-gray-700/50">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <h2 class="text-lg sm:text-xl font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Categories</h2>
            <button 
              @click="showAddCategoryModal = true"
              class="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 rounded-lg sm:rounded-xl border border-blue-500/30 hover:from-blue-500/30 hover:to-indigo-500/30 transition-all duration-200"
            >
              Add Category
            </button>
          </div>
        </div>

        <div class="p-4 sm:p-6">
          <div class="space-y-3 sm:space-y-4">
            <div v-if="categories.length === 0" class="text-center py-6 sm:py-8">
              <div class="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-gray-700/30 flex items-center justify-center mb-3 sm:mb-4">
                <TagIcon class="w-7 h-7 sm:w-8 sm:h-8 text-gray-500" />
              </div>
              <p class="text-gray-400">No categories available</p>
              <p class="text-xs sm:text-sm text-gray-500 mt-1">Add your first category to get started</p>
            </div>
            <div v-else>
              <div v-for="category in categories" :key="category.id" class="bg-gray-800/50 rounded-xl p-4 mb-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div 
                      class="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                      :style="{ backgroundColor: category.color }"
                    >
                      <span class="text-xl">{{ category.emoji }}</span>
                    </div>
                    <div>
                      <h3 class="text-white font-medium">{{ category.name }}</h3>
                      <p class="text-sm text-gray-400">
                        {{ formatCurrency(category.budget) }} / {{ category.frequency }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button 
                      @click="editCategory(category)"
                      class="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                    >
                      <PencilIcon class="w-5 h-5" />
                    </button>
                    <button 
                      @click="deleteCategory(category.id)"
                      class="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                    >
                      <TrashIcon class="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Management -->
      <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-gray-700/50 overflow-hidden">
        <div class="p-4 sm:p-6 border-b border-gray-700/50">
          <h2 class="text-lg sm:text-xl font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Data Management</h2>
        </div>
        <div class="p-4 sm:p-6">
          <div class="flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4">
            <button 
              @click="exportData"
              class="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 rounded-lg sm:rounded-xl border border-green-500/30 hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-200"
            >
              <ArrowDownTrayIcon class="w-4 h-4 sm:w-5 sm:h-5" />
              <span class="text-sm font-medium">Export Data</span>
            </button>
            <button 
              @click="importData"
              class="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 rounded-lg sm:rounded-xl border border-blue-500/30 hover:from-blue-500/30 hover:to-indigo-500/30 transition-all duration-200"
            >
              <ArrowUpTrayIcon class="w-4 h-4 sm:w-5 sm:h-5" />
              <span class="text-sm font-medium">Import Data</span>
            </button>
          </div>
          <button 
            @click="clearData"
            class="w-full mt-3 sm:mt-4 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 rounded-lg sm:rounded-xl border border-red-500/30 hover:from-red-500/30 hover:to-rose-500/30 transition-all duration-200 text-sm font-medium"
          >
            Clear All Data
          </button>
        </div>
      </div>

      <!-- Add/Edit Category Modal -->
      <div v-if="showAddCategoryModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-gray-800/90 rounded-2xl border border-gray-700/50 p-6 w-full max-w-md mx-auto shadow-xl">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              {{ editingCategory ? 'Edit Category' : 'Add New Category' }}
            </h3>
            <button 
              @click="showAddCategoryModal = false"
              class="text-gray-400 hover:text-gray-300 p-1 hover:bg-gray-700/50 rounded-lg transition-all duration-200"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="saveCategory" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Category Name</label>
              <input 
                v-model="categoryForm.name"
                type="text"
                class="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                placeholder="Enter category name"
                required
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Emoji</label>
              <div class="relative">
                <div 
                  class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 cursor-pointer flex items-center justify-between"
                  @click="showEmojiPicker = !showEmojiPicker"
                >
                  <span class="text-2xl">{{ categoryForm.emoji }}</span>
                  <ChevronDownIcon 
                    class="w-4 h-4 text-gray-400 transition-transform duration-200"
                    :class="{ 'transform rotate-180': showEmojiPicker }"
                  />
                </div>
                <div 
                  v-if="showEmojiPicker"
                  class="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                >
                  <div class="sticky top-0 bg-gray-800 border-b border-gray-700 p-2">
                    <input 
                      v-model="emojiSearch"
                      type="text"
                      class="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Search emojis..."
                      @click.stop
                    >
                  </div>
                  <div class="p-1">
                    <div 
                      v-for="emoji in filteredEmojis" 
                      :key="emoji"
                      class="px-3 py-2 hover:bg-gray-700 cursor-pointer rounded-lg text-white text-2xl"
                      @click="selectEmoji(emoji)"
                    >
                      {{ emoji }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Monthly Budget</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                <input 
                  v-model="categoryForm.budget"
                  type="number"
                  class="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl pl-8 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                  placeholder="0.00"
                  required
                >
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Weekly Budget (Optional)</label>
              <input
                v-model="categoryForm.weeklyBudget"
                type="number"
                class="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                placeholder="0.00"
              >
              <p class="mt-1 text-sm text-gray-400">
                If not set, will default to monthly budget divided by 4.33
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Frequency</label>
              <select 
                v-model="categoryForm.frequency"
                class="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="monthly">Monthly</option>
                <option value="bi-weekly">Bi-Weekly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Color</label>
              <input
                v-model="categoryForm.color"
                type="color"
                class="w-full h-10 rounded-lg cursor-pointer"
              >
            </div>

            <div class="flex justify-end space-x-3 pt-2">
              <button 
                type="button"
                @click="showAddCategoryModal = false"
                class="px-5 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
              <button 
                type="submit"
                class="px-5 py-3 text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-all duration-200"
              >
                {{ editingCategory ? 'Update' : 'Add' }} Category
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
 /* eslint-disable */ 
import { 
  TagIcon, 
  PencilIcon, 
  TrashIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'
import { 
  getCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory,
  getSetting,
  setSetting,
  getCategoryBudgets,
  addCategoryBudget,
  updateCategoryBudget,
  deleteCategoryBudget,
  exportData,
  importData,
  getBills,
  getIncomes,
  calculateTotalMonthlyBudget,
  getTransactions
} from '../services/database'
import { startOfWeek, format } from 'date-fns'

export default {
  name: 'SettingsView',
  components: {
    TagIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    ChevronDownIcon
  },
  data() {
    return {
      showAddCategoryModal: false,
      showEmojiPicker: false,
      emojiSearch: '',
      editingCategory: null,
      categoryForm: {
        name: '',
        budget: 0,
        weeklyBudget: 0,
        frequency: 'monthly',
        color: '#4F46E5',
        emoji: '📋'
      },
      categories: [],
      budgetPeriod: 'monthly',
      weeklyBudgets: [],
      isLoading: true,
      error: null,
      startOfWeek,
      format,
      bills: [],
      incomes: [],
      transactions: [],
      defaultEmojis: [
        // Housing & Living
        '🏠', '🏡', '🔧', '🪑', '🔌', '🏗️',
        // Utilities
        '⚡', '💧', '🔥', '🌐', '📱', '📺',
        // Insurance
        '🏥', '🦷', '👁️', '🛡️', '🚗', '♿',
        // Transportation
        '🚙', '⛽', '🚌', '🅿️', '🎫',
        // Healthcare
        '👨‍⚕️', '💊', '🧠',
        // Food & Dining
        '🛒', '🍽️', '🥡', '☕', '🚚', '🍪',
        // Shopping & Personal
        '👕', '👟', '🧴', '💇', '💄', '💪',
        // Entertainment
        '🎮', '🎬', '🎵', '🎨', '⚽',
        // Education
        '🎓', '📚', '✏️', '📝', '💻', '📈',
        // Financial
        '💳', '🏦', '📊', '💰',
        // Pets
        '🐕', '🐾', '🦴', '🐱', '🛁',
        // Gifts & Donations
        '🎁', '🤝', '💒', '🎂',
        // Travel
        '✈️', '🏨', '🏖️', '🎒',
        // Technology
        '💻', '☁️', '🔒', '💾', '⚙️', '🔌', '📊', '💬', '🎨', '🧪', '🔐',
        // Business
        '🏢', '📎', '👔', '⚖️', '📢', '🎯', '🖥️', '📱', '⚡', '📋', '📜', '🏦', '💳', '💰', '💡', '📚', '🤝', '🔧', '🔨', '⬆️', '🔒', '✅',
        // Other
        '📦', '📝'
      ]
    }
  },
  computed: {
    totalMonthlyBudget() {
      console.log('=== MONTHLY BUDGET CALCULATION ===');
      
      // Check if we have all required data
      if (!this.incomes || !this.bills || !this.categories) {
        console.log('Missing required data:', {
          hasIncomes: !!this.incomes,
          hasBills: !!this.bills,
          hasCategories: !!this.categories
        });
        return 0;
      }
      
      // Get current month and year
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      console.log(`Calculating budget for ${currentMonth + 1}/${currentYear}`);
      
      // Step 1: Calculate total recurring income
      let recurringIncome = 0;
      console.log('\n--- RECURRING INCOME ---');
      this.incomes.forEach(income => {
        if (income.frequency === 'monthly') {
          console.log(`Adding monthly income: ${income.description} = $${income.amount}`);
          recurringIncome += Number(income.amount);
        }
      });
      console.log(`Total recurring income: $${recurringIncome}`);
      
      // Step 2: Calculate total recurring bills
      let recurringBills = 0;
      console.log('\n--- RECURRING BILLS ---');
      this.bills.forEach(bill => {
        if (bill.frequency === 'monthly') {
          console.log(`Subtracting monthly bill: ${bill.description} = $${bill.amount}`);
          recurringBills += Number(bill.amount);
        }
      });
      console.log(`Total recurring bills: $${recurringBills}`);
      
      // Step 3: Calculate total category budgets
      let categoryBudgets = 0;
      console.log('\n--- CATEGORY BUDGETS ---');
      this.categories.forEach(category => {
        if (category.budget) {
          console.log(`Subtracting category budget: ${category.name} = $${category.budget}`);
          categoryBudgets += Number(category.budget);
        }
      });
      console.log(`Total category budgets: $${categoryBudgets}`);
      
      // Step 4: Calculate base budget (recurring income - recurring bills - category budgets)
      const baseBudget = recurringIncome - recurringBills - categoryBudgets;
      console.log('\n--- BASE BUDGET CALCULATION ---');
      console.log(`Base budget = Recurring Income - Recurring Bills - Category Budgets`);
      console.log(`Base budget = $${recurringIncome} - $${recurringBills} - $${categoryBudgets}`);
      console.log(`Base budget = $${baseBudget}`);
      
      // Step 5: Calculate non-recurring income from transactions
      let nonRecurringIncome = 0;
      console.log('\n--- NON-RECURRING INCOME FROM TRANSACTIONS ---');
      
      // Get all transactions for the current month
      const transactions = this.transactions || [];
      const currentMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear &&
               t.type === 'income';
      });
      
      console.log(`Found ${currentMonthTransactions.length} income transactions for current month`);
      
      // Filter out transactions that match recurring incomes
      const recurringIncomeDescriptions = this.incomes
        .filter(income => income.frequency === 'monthly')
        .map(income => income.description.toLowerCase());
      
      const recurringIncomeCategories = this.incomes
        .filter(income => income.frequency === 'monthly')
        .map(income => income.category?.toLowerCase() || '');
      
      currentMonthTransactions.forEach(transaction => {
        const matchesRecurringIncome = recurringIncomeDescriptions.includes(transaction.description.toLowerCase()) ||
                                      recurringIncomeCategories.includes(transaction.category?.toLowerCase() || '');
        
        if (!matchesRecurringIncome) {
          console.log(`Adding non-recurring income: ${transaction.description} = $${transaction.amount}`);
          nonRecurringIncome += Number(transaction.amount);
        } else {
          console.log(`Skipping recurring income match: ${transaction.description}`);
        }
      });
      
      console.log(`Total non-recurring income: $${nonRecurringIncome}`);
      
      // Step 6: Calculate final budget
      const finalBudget = baseBudget + nonRecurringIncome;
      console.log('\n--- FINAL BUDGET CALCULATION ---');
      console.log(`Final budget = Base budget + Non-recurring income`);
      console.log(`Final budget = $${baseBudget} + $${nonRecurringIncome}`);
      console.log(`Final budget = $${finalBudget}`);
      
      return finalBudget;
    },
    filteredEmojis() {
      if (!this.emojiSearch) return this.defaultEmojis
      return this.defaultEmojis.filter(emoji => 
        emoji.toLowerCase().includes(this.emojiSearch.toLowerCase())
      )
    }
  },
  async created() {
    try {
      await this.loadData()
    } catch (error) {
      console.error('Error loading settings:', error)
      this.error = 'Failed to load settings. Please try again.'
    } finally {
      this.isLoading = false
    }
  },
  methods: {
    formatDate(date) {
      return format(date, 'MMM d, yyyy')
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount)
    },
    async loadData() {
      try {
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)
        
        const [categoriesData, budgetPeriodData, billsData, incomesData, transactionsData] = await Promise.all([
          getCategories(),
          getSetting('budgetPeriod'),
          getBills(),
          getIncomes(),
          getTransactions()
        ])
        
        this.categories = categoriesData || []
        this.budgetPeriod = budgetPeriodData || 'monthly'
        this.bills = billsData || []
        this.incomes = incomesData || []
        this.transactions = transactionsData || []
        
        // Get weekly budgets with all required parameters
        this.weeklyBudgets = await getCategoryBudgets(
          this.bills,
          this.incomes,
          weekStart,
          weekEnd
        )
      } catch (error) {
        console.error('Error loading settings:', error)
        throw error
      }
    },
    async saveBudgetPeriod() {
      try {
        await setSetting('budgetPeriod', this.budgetPeriod)
      } catch (error) {
        console.error('Error saving budget period:', error)
        alert('Failed to save budget period. Please try again.')
      }
    },
    editCategory(category) {
      this.editingCategory = category
      this.categoryForm = {
        name: category.name,
        budget: category.budget,
        weeklyBudget: category.weeklyBudget || (category.budget / 4.33),
        frequency: category.frequency || 'monthly',
        color: category.color,
        emoji: category.emoji
      }
      this.showAddCategoryModal = true
    },
    async deleteCategory(id) {
      if (confirm('Are you sure you want to delete this category?')) {
        try {
          await deleteCategory(id)
          this.categories = this.categories.filter(cat => cat.id !== id)
        } catch (error) {
          console.error('Error deleting category:', error)
          alert('Failed to delete category. Please try again.')
        }
      }
    },
    async saveCategory() {
      console.log('saveCategory called')
      console.log('Form data:', this.categoryForm)
      try {
        if (!this.categoryForm.name || !this.categoryForm.budget || !this.categoryForm.frequency) {
          console.log('Validation failed:', {
            name: this.categoryForm.name,
            budget: this.categoryForm.budget,
            frequency: this.categoryForm.frequency
          })
          alert('Please fill in all required fields')
          return
        }

        const categoryData = {
          name: this.categoryForm.name,
          budget: parseFloat(this.categoryForm.budget),
          weeklyBudget: parseFloat(this.categoryForm.weeklyBudget),
          frequency: this.categoryForm.frequency,
          color: this.categoryForm.color,
          emoji: this.categoryForm.emoji
        }
        console.log('Saving category data:', categoryData)

        if (this.editingCategory) {
          console.log('Updating existing category:', this.editingCategory.id)
          await updateCategory(this.editingCategory.id, categoryData)
          const index = this.categories.findIndex(cat => cat.id === this.editingCategory.id)
          if (index !== -1) {
            this.categories[index] = {
              ...this.editingCategory,
              ...categoryData
            }
          }
        } else {
          console.log('Adding new category')
          const id = await addCategory(categoryData)
          this.categories.push({
            id,
            ...categoryData
          })
        }
        
        console.log('Category saved successfully')
        this.showAddCategoryModal = false
        this.editingCategory = null
        this.categoryForm = {
          name: '',
          budget: 0,
          weeklyBudget: 0,
          frequency: 'monthly',
          color: '#4F46E5',
          emoji: '📋'
        }
      } catch (error) {
        console.error('Error saving category:', error)
        alert('Failed to save category. Please try again.')
      }
    },
    async exportData() {
      try {
        const data = await exportData()
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'enough-backup.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Error exporting data:', error)
        alert('Failed to export data. Please try again.')
      }
    },
    async importData() {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        try {
          const reader = new FileReader()
          reader.onload = async (e) => {
            try {
              await importData(e.target.result)
              await this.loadData()
              alert('Data imported successfully!')
            } catch (error) {
              console.error('Error importing data:', error)
              alert('Failed to import data. Please try again.')
            }
          }
          reader.readAsText(file)
        } catch (error) {
          console.error('Error reading file:', error)
          alert('Failed to read file. Please try again.')
        }
      }
      input.click()
    },
    async clearData() {
      if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        try {
          await importData('{"categories":[],"transactions":[],"bills":[],"incomes":[],"settings":[]}')
          await this.loadData()
          alert('Data cleared successfully!')
        } catch (error) {
          console.error('Error clearing data:', error)
          alert('Failed to clear data. Please try again.')
        }
      }
    },
    async saveWeeklyBudget(category) {
      try {
        const budgetData = {
          categoryId: category.id,
          amount: parseFloat(category.weeklyBudget),
          weekStart: new Date().toISOString()
        }

        // Update or add the weekly budget
        await updateCategoryBudget(budgetData)
        await this.loadData()
      } catch (error) {
        console.error('Error saving weekly budget:', error)
      }
    },
    getWeeklyAllocation(category) {
      const budget = parseFloat(category.budget) || 0
      switch (category.frequency) {
        case 'weekly':
          return `$${budget.toFixed(2)}/week`
        case 'bi-weekly':
          return `$${(budget / 2).toFixed(2)}/week`
        case 'monthly':
          return `$${(budget / 4.33).toFixed(2)}/week`
        default:
          return '$0.00/week'
      }
    },
    getWeeklyAllocationValue(category) {
      const budget = parseFloat(category.budget) || 0
      let weeklyAmount
      switch (category.frequency) {
        case 'weekly':
          weeklyAmount = budget
          break
        case 'bi-weekly':
          weeklyAmount = budget / 2
          break
        case 'monthly':
          weeklyAmount = budget / 4.33
          break
        default:
          weeklyAmount = 0
      }
      return Number(weeklyAmount.toFixed(2))
    },
    selectEmoji(emoji) {
      this.categoryForm.emoji = emoji
      this.showEmojiPicker = false
      this.emojiSearch = ''
    }
  }
}
</script> 