/* eslint-disable */
<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <div class="p-4 space-y-6">
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
        <!-- Calendar Header -->
        <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-white">Calendar</h2>
            <div class="flex items-center space-x-2">
              <button 
                v-for="view in views" 
                :key="view"
                @click="currentView = view"
                class="px-2.5 py-1 text-xs rounded-lg transition-colors duration-200"
                :class="[
                  currentView === view 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' 
                    : 'text-gray-400 hover:text-gray-300'
                ]"
              >
                {{ view }}
              </button>
            </div>
          </div>

          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-2">
              <button 
                @click="previousPeriod"
                class="p-1.5 text-gray-400 hover:text-gray-300 rounded-lg transition-colors duration-200"
              >
                <ChevronLeftIcon class="w-5 h-5" />
              </button>
              <span class="text-sm font-medium text-white">{{ currentPeriodLabel }}</span>
              <button 
                @click="nextPeriod"
                class="p-1.5 text-gray-400 hover:text-gray-300 rounded-lg transition-colors duration-200"
              >
                <ChevronRightIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Calendar Grid (Month View) -->
        <div v-if="currentView === 'Month'" class="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50">
          <!-- Calendar Legend -->
          <div class="p-2 border-b border-gray-700/50 flex items-center justify-center space-x-4 text-xs">
            <div class="flex items-center space-x-1">
              <div class="w-2 h-2 rounded-full bg-green-400"></div>
              <span class="text-gray-400">Income</span>
            </div>
            <div class="flex items-center space-x-1">
              <div class="w-2 h-2 rounded-full bg-red-400"></div>
              <span class="text-gray-400">Expenses</span>
            </div>
            <div class="flex items-center space-x-1">
              <div class="w-2 h-2 rounded-full bg-blue-400"></div>
              <span class="text-gray-400">Selected</span>
            </div>
          </div>

          <div class="grid grid-cols-7 gap-1">
            <div 
              v-for="day in weekDays" 
              :key="day"
              class="text-center text-xs text-gray-400 py-1"
            >
              {{ day }}
            </div>
            <div 
              v-for="day in calendarDays" 
              :key="format(day.date, 'yyyy-MM-dd')"
              class="relative aspect-square p-1"
            >
              <div 
                class="w-full h-full rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-700/50 group"
                :class="[
                  day.isCurrentMonth ? 'text-white' : 'text-gray-500',
                  day.isSelected ? 'bg-blue-500/20 ring-2 ring-blue-500/50' : '',
                  day.isToday ? 'ring-2 ring-blue-500/50' : ''
                ]"
                @click="selectDate(day.date)"
              >
                <div class="text-sm">{{ format(day.date, 'd') }}</div>
                
                <!-- Transaction Indicators -->
                <div class="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex items-center">
                  <div 
                    v-if="getDayTransactionCount(day.date) > 0"
                    class="w-2 h-2 rounded-full transition-transform duration-200 group-hover:scale-125"
                    :class="dayTotals[format(day.date, 'yyyy-MM-dd')] >= 0 ? 'bg-green-400' : 'bg-red-400'"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Selected Date Transactions -->
          <div v-if="selectedDate" class="p-4 border-t border-gray-700/50">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-white">
                {{ format(selectedDate, 'MMMM d, yyyy') }}
              </h3>
              <span 
                class="text-lg font-semibold"
                :class="selectedDateTotal >= 0 ? 'text-green-400' : 'text-red-400'"
              >
                {{ formatAmount(selectedDateTotal) }}
              </span>
            </div>

            <div class="space-y-4">
              <!-- Transactions -->
              <div v-if="selectedDateTransactions.length > 0">
                <h4 class="text-sm font-medium text-gray-300 mb-2">Transactions</h4>
                <div class="space-y-2">
                  <div 
                    v-for="transaction in selectedDateTransactions" 
                    :key="transaction.id"
                    class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600/50"
                  >
                    <div class="flex items-center space-x-3">
                      <div :class="[
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                      ]">
                        <component 
                          :is="transaction.type === 'income' ? ArrowUpIcon : ArrowDownIcon"
                          :class="[
                            'w-4 h-4',
                            transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                          ]"
                        />
                      </div>
                      <div>
                        <p class="font-medium text-white">{{ transaction.description }}</p>
                        <p class="text-sm text-gray-400">{{ transaction.category }}</p>
                      </div>
                    </div>
                    <p :class="transaction.type === 'income' ? 'text-green-400' : 'text-red-400'">
                      {{ transaction.type === 'income' ? '+' : '-' }}{{ formatAmount(transaction.amount) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Bills -->
              <div v-if="selectedDateBills.length > 0">
                <h4 class="text-sm font-medium text-gray-300 mb-2">Bills</h4>
                <div class="space-y-2">
                  <div 
                    v-for="bill in selectedDateBills" 
                    :key="bill.id"
                    class="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20"
                  >
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                        <ArrowDownIcon class="w-4 h-4 text-red-400" />
                      </div>
                      <div>
                        <p class="font-medium text-white">{{ bill.description }}</p>
                        <p class="text-sm text-gray-400">{{ bill.category }}</p>
                      </div>
                    </div>
                    <p class="text-red-400">-{{ formatAmount(bill.amount) }}</p>
                  </div>
                </div>
              </div>

              <!-- Incomes -->
              <div v-if="selectedDateIncomes.length > 0">
                <h4 class="text-sm font-medium text-gray-300 mb-2">Income</h4>
                <div class="space-y-2">
                  <div 
                    v-for="income in selectedDateIncomes" 
                    :key="income.id"
                    class="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                  >
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <ArrowUpIcon class="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p class="font-medium text-white">{{ income.description }}</p>
                        <p class="text-sm text-gray-400">{{ income.category }}</p>
                      </div>
                    </div>
                    <p class="text-green-400">+{{ formatAmount(income.amount) }}</p>
                  </div>
                </div>
              </div>

              <div v-if="selectedDateTransactions.length === 0 && selectedDateBills.length === 0 && selectedDateIncomes.length === 0" class="text-center text-gray-400 py-4">
                No transactions, bills, or income for this day
              </div>
            </div>
          </div>
        </div>

        <!-- Week View -->
        <div v-else-if="currentView === 'Week'" class="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-white">Week Overview</h3>
            <span 
              class="text-lg font-semibold"
              :class="weekTotal >= 0 ? 'text-green-400' : 'text-red-400'"
            >
              {{ formatAmount(weekTotal) }}
            </span>
          </div>

          <div class="space-y-4">
            <!-- Transactions -->
            <div v-if="weekTransactions.length > 0">
              <h4 class="text-sm font-medium text-gray-300 mb-2">Transactions</h4>
              <div class="space-y-2">
                <div 
                  v-for="transaction in weekTransactions" 
                  :key="transaction.id"
                  class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600/50"
                >
                  <div class="flex items-center space-x-3">
                    <div :class="[
                      'w-8 h-8 rounded-full flex items-center justify-center',
                      transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                    ]">
                      <component 
                        :is="transaction.type === 'income' ? ArrowUpIcon : ArrowDownIcon"
                        :class="[
                          'w-4 h-4',
                          transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                        ]"
                      />
                    </div>
                    <div>
                      <p class="font-medium text-white">{{ transaction.description }}</p>
                      <p class="text-sm text-gray-400">{{ transaction.category }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p :class="transaction.type === 'income' ? 'text-green-400' : 'text-red-400'">
                      {{ transaction.type === 'income' ? '+' : '-' }}{{ formatAmount(transaction.amount) }}
                    </p>
                    <p class="text-xs text-gray-500">{{ format(new Date(transaction.date), 'MMM d') }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bills -->
            <div v-if="weekBills.length > 0">
              <h4 class="text-sm font-medium text-gray-300 mb-2">Bills</h4>
              <div class="space-y-2">
                <div 
                  v-for="bill in weekBills" 
                  :key="bill.id"
                  class="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                      <ArrowDownIcon class="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <p class="font-medium text-white">{{ bill.description }}</p>
                      <p class="text-sm text-gray-400">{{ bill.category }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-red-400">-{{ formatAmount(bill.amount) }}</p>
                    <p class="text-xs text-gray-500">{{ format(new Date(bill.dueDate), 'MMM d') }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Incomes -->
            <div v-if="weekIncomes.length > 0">
              <h4 class="text-sm font-medium text-gray-300 mb-2">Income</h4>
              <div class="space-y-2">
                <div 
                  v-for="income in weekIncomes" 
                  :key="income.id"
                  class="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <ArrowUpIcon class="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p class="font-medium text-white">{{ income.description }}</p>
                      <p class="text-sm text-gray-400">{{ income.category }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-green-400">+{{ formatAmount(income.amount) }}</p>
                    <p class="text-xs text-gray-500">{{ format(new Date(income.dueDate), 'MMM d') }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="weekTransactions.length === 0 && weekBills.length === 0 && weekIncomes.length === 0" class="text-center text-gray-400 py-4">
              No transactions, bills, or income for this week
            </div>
          </div>
        </div>

        <!-- Day View -->
        <div v-else-if="currentView === 'Day'" class="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-white">Day Overview</h3>
            <span 
              class="text-lg font-semibold"
              :class="selectedDateTotal >= 0 ? 'text-green-400' : 'text-red-400'"
            >
              {{ formatAmount(selectedDateTotal) }}
            </span>
          </div>

          <div class="space-y-4">
            <!-- Transactions -->
            <div v-if="selectedDateTransactions.length > 0">
              <h4 class="text-sm font-medium text-gray-300 mb-2">Transactions</h4>
              <div class="space-y-2">
                <div 
                  v-for="transaction in selectedDateTransactions" 
                  :key="transaction.id"
                  class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600/50"
                >
                  <div class="flex items-center space-x-3">
                    <div :class="[
                      'w-8 h-8 rounded-full flex items-center justify-center',
                      transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                    ]">
                      <component 
                        :is="transaction.type === 'income' ? ArrowUpIcon : ArrowDownIcon"
                        :class="[
                          'w-4 h-4',
                          transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                        ]"
                      />
                    </div>
                    <div>
                      <p class="font-medium text-white">{{ transaction.description }}</p>
                      <p class="text-sm text-gray-400">{{ transaction.category }}</p>
                    </div>
                  </div>
                  <p :class="transaction.type === 'income' ? 'text-green-400' : 'text-red-400'">
                    {{ transaction.type === 'income' ? '+' : '-' }}{{ formatAmount(transaction.amount) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Bills -->
            <div v-if="selectedDateBills.length > 0">
              <h4 class="text-sm font-medium text-gray-300 mb-2">Bills</h4>
              <div class="space-y-2">
                <div 
                  v-for="bill in selectedDateBills" 
                  :key="bill.id"
                  class="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                      <ArrowDownIcon class="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <p class="font-medium text-white">{{ bill.description }}</p>
                      <p class="text-sm text-gray-400">{{ bill.category }}</p>
                    </div>
                  </div>
                  <p class="text-red-400">-{{ formatAmount(bill.amount) }}</p>
                </div>
              </div>
            </div>

            <!-- Incomes -->
            <div v-if="selectedDateIncomes.length > 0">
              <h4 class="text-sm font-medium text-gray-300 mb-2">Income</h4>
              <div class="space-y-2">
                <div 
                  v-for="income in selectedDateIncomes" 
                  :key="income.id"
                  class="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <ArrowUpIcon class="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p class="font-medium text-white">{{ income.description }}</p>
                      <p class="text-sm text-gray-400">{{ income.category }}</p>
                    </div>
                  </div>
                  <p class="text-green-400">+{{ formatAmount(income.amount) }}</p>
                </div>
              </div>
            </div>

            <div v-if="selectedDateTransactions.length === 0 && selectedDateBills.length === 0 && selectedDateIncomes.length === 0" class="text-center text-gray-400 py-4">
              No transactions, bills, or income for this day
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
 /* eslint-disable */ 
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon
} from '@heroicons/vue/24/outline'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  addYears
} from 'date-fns'
import { 
  getTransactions,
  getBills,
  getIncomes,
  getCategories
} from '../services/database'

export default {
  name: 'CalendarView',
  components: {
    ChevronLeftIcon,
    ChevronRightIcon,
    XMarkIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    CalendarIcon
  },
  data() {
    return {
      views: ['Month', 'Week', 'Day'],
      currentView: 'Month',
      currentDate: new Date(),
      selectedDate: new Date(),
      transactions: [],
      bills: [],
      incomes: [],
      categories: [],
      weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      isLoading: true,
      error: null,
      format
    }
  },
  computed: {
    currentPeriodLabel() {
      switch (this.currentView) {
        case 'Month':
          return this.format(this.currentDate, 'MMMM yyyy')
        case 'Week':
          const weekStart = this.startOfWeek(this.currentDate)
          const weekEnd = this.endOfWeek(this.currentDate)
          return `${this.format(weekStart, 'MMM d')} - ${this.format(weekEnd, 'MMM d, yyyy')}`
        case 'Day':
          return this.format(this.currentDate, 'MMMM d, yyyy')
        default:
          return this.format(this.currentDate, 'MMMM yyyy')
      }
    },
    calendarDays() {
      switch (this.currentView) {
        case 'Month':
          const start = this.startOfWeek(this.startOfMonth(this.currentDate))
          const end = this.endOfWeek(this.endOfMonth(this.currentDate))
          return this.eachDayOfInterval({ start, end }).map(date => ({
            date,
            isCurrentMonth: this.isSameMonth(date, this.currentDate),
            isToday: this.isToday(date),
            isSelected: this.selectedDate && this.format(date, 'yyyy-MM-dd') === this.format(this.selectedDate, 'yyyy-MM-dd')
          }))
        case 'Week':
          const weekStart = this.startOfWeek(this.currentDate)
          const weekEnd = this.endOfWeek(this.currentDate)
          return this.eachDayOfInterval({ start: weekStart, end: weekEnd }).map(date => ({
            date,
            isCurrentMonth: true,
            isToday: this.isToday(date),
            isSelected: this.selectedDate && this.format(date, 'yyyy-MM-dd') === this.format(this.selectedDate, 'yyyy-MM-dd')
          }))
        case 'Day':
          return [{
            date: this.currentDate,
            isCurrentMonth: true,
            isToday: this.isToday(this.currentDate),
            isSelected: true
          }]
        default:
          return []
      }
    },
    selectedDateTransactions() {
      if (!this.selectedDate || !this.transactions?.length) return []
      const dateStr = this.format(this.selectedDate, 'yyyy-MM-dd')
      return this.transactions.filter(t => 
        this.format(new Date(t.date), 'yyyy-MM-dd') === dateStr
      )
    },
    recurringBills() {
      if (!this.bills?.length) return []
      const allBills = []
      
      this.bills.forEach(bill => {
        // Add the original bill
        allBills.push(bill)
        
        // Generate recurring instances based on frequency
        const originalDate = new Date(bill.dueDate)
        let nextDate = new Date(originalDate)
        const endDate = addMonths(new Date(), 12) // Show up to a year in advance
        
        while (nextDate <= endDate) {
          switch (bill.frequency) {
            case 'weekly':
              nextDate = addDays(nextDate, 7)
              break
            case 'bi-weekly':
              nextDate = addDays(nextDate, 14)
              break
            case 'monthly':
              nextDate = addMonths(nextDate, 1)
              break
            case 'quarterly':
              nextDate = addMonths(nextDate, 3)
              break
            case 'yearly':
              nextDate = addYears(nextDate, 1)
              break
            default:
              continue
          }
          
          if (nextDate <= endDate) {
            allBills.push({
              ...bill,
              dueDate: nextDate.toISOString(),
              isRecurring: true
            })
          }
        }
      })
      
      return allBills
    },
    
    recurringIncomes() {
      if (!this.incomes?.length) return []
      const allIncomes = []
      
      this.incomes.forEach(income => {
        // Add the original income
        allIncomes.push(income)
        
        // Generate recurring instances based on frequency
        const originalDate = new Date(income.dueDate)
        let nextDate = new Date(originalDate)
        const endDate = addMonths(new Date(), 12) // Show up to a year in advance
        
        while (nextDate <= endDate) {
          switch (income.frequency) {
            case 'weekly':
              nextDate = addDays(nextDate, 7)
              break
            case 'bi-weekly':
              nextDate = addDays(nextDate, 14)
              break
            case 'monthly':
              nextDate = addMonths(nextDate, 1)
              break
            case 'quarterly':
              nextDate = addMonths(nextDate, 3)
              break
            case 'yearly':
              nextDate = addYears(nextDate, 1)
              break
            default:
              continue
          }
          
          if (nextDate <= endDate) {
            allIncomes.push({
              ...income,
              dueDate: nextDate.toISOString(),
              isRecurring: true
            })
          }
        }
      })
      
      return allIncomes
    },
    selectedDateBills() {
      if (!this.selectedDate) return []
      const dateStr = this.format(this.selectedDate, 'yyyy-MM-dd')
      return this.recurringBills.filter(bill => 
        this.format(new Date(bill.dueDate), 'yyyy-MM-dd') === dateStr
      )
    },
    selectedDateIncomes() {
      if (!this.selectedDate) return []
      const dateStr = this.format(this.selectedDate, 'yyyy-MM-dd')
      return this.recurringIncomes.filter(income => 
        this.format(new Date(income.dueDate), 'yyyy-MM-dd') === dateStr
      )
    },
    selectedDateTotal() {
      const transactions = this.selectedDateTransactions.reduce((sum, t) => 
        sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0
      )
      const bills = this.selectedDateBills.reduce((sum, b) => sum - Number(b.amount), 0)
      const incomes = this.selectedDateIncomes.reduce((sum, i) => sum + Number(i.amount), 0)
      return transactions + bills + incomes
    },
    weekTransactions() {
      if (!this.currentDate || !this.transactions?.length) return []
      const weekStart = this.startOfWeek(this.currentDate)
      const weekEnd = this.endOfWeek(this.currentDate)
      return this.transactions.filter(t => {
        const date = new Date(t.date)
        return date >= weekStart && date <= weekEnd
      })
    },
    weekBills() {
      if (!this.currentDate) return []
      const weekStart = this.startOfWeek(this.currentDate)
      const weekEnd = this.endOfWeek(this.currentDate)
      return this.recurringBills.filter(bill => {
        const date = new Date(bill.dueDate)
        return date >= weekStart && date <= weekEnd
      })
    },
    weekIncomes() {
      if (!this.currentDate) return []
      const weekStart = this.startOfWeek(this.currentDate)
      const weekEnd = this.endOfWeek(this.currentDate)
      return this.recurringIncomes.filter(income => {
        const date = new Date(income.dueDate)
        return date >= weekStart && date <= weekEnd
      })
    },
    weekTotal() {
      const transactions = this.weekTransactions.reduce((sum, t) => 
        sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0
      )
      const bills = this.weekBills.reduce((sum, b) => sum - Number(b.amount), 0)
      const incomes = this.weekIncomes.reduce((sum, i) => sum + Number(i.amount), 0)
      return transactions + bills + incomes
    },
    dayTotals() {
      const totals = {}
      this.calendarDays.forEach(day => {
        const dateStr = this.format(day.date, 'yyyy-MM-dd')
        const dayTransactions = this.transactions.filter(t => 
          this.format(new Date(t.date), 'yyyy-MM-dd') === dateStr
        )
        const dayBills = this.recurringBills.filter(b => 
          this.format(new Date(b.dueDate), 'yyyy-MM-dd') === dateStr
        )
        const dayIncomes = this.recurringIncomes.filter(i => 
          this.format(new Date(i.dueDate), 'yyyy-MM-dd') === dateStr
        )
        
        const transactionTotal = dayTransactions.reduce((sum, t) => 
          sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0
        )
        const billsTotal = dayBills.reduce((sum, b) => sum - Number(b.amount), 0)
        const incomesTotal = dayIncomes.reduce((sum, i) => sum + Number(i.amount), 0)
        
        totals[dateStr] = transactionTotal + billsTotal + incomesTotal
      })
      return totals
    }
  },
  methods: {
    async loadData() {
      try {
        this.isLoading = true
        this.error = null

        console.log('Starting to load calendar data...')
        
        // Load all data concurrently
        const [categoriesData, transactionsData, billsData, incomesData] = await Promise.all([
          getCategories(),
          getTransactions(),
          getBills(),
          getIncomes()
        ])

        console.log('Raw data loaded:', {
          categories: categoriesData,
          transactions: transactionsData,
          bills: billsData,
          incomes: incomesData
        })

        // Update the data with proper type conversion and validation
        this.categories = categoriesData || []
        this.transactions = (transactionsData || []).map(t => ({
          ...t,
          amount: Number(t.amount),
          date: new Date(t.date)
        }))
        this.bills = (billsData || []).map(b => ({
          ...b,
          amount: Number(b.amount),
          dueDate: new Date(b.dueDate)
        }))
        this.incomes = (incomesData || []).map(i => ({
          ...i,
          amount: Number(i.amount),
          dueDate: new Date(i.dueDate)
        }))

        // Log processed data
        console.log('Processed calendar data:', {
          categories: this.categories.length,
          transactions: this.transactions.length,
          bills: this.bills.length,
          incomes: this.incomes.length,
          sampleTransaction: this.transactions[0],
          sampleBill: this.bills[0],
          sampleIncome: this.incomes[0]
        })

        // Log transaction dates to verify format
        if (this.transactions.length > 0) {
          console.log('Transaction dates:', this.transactions.map(t => ({
            id: t.id,
            date: t.date,
            formattedDate: this.format(t.date, 'yyyy-MM-dd')
          })))
        }

        // Log bills dates to verify format
        if (this.bills.length > 0) {
          console.log('Bill dates:', this.bills.map(b => ({
            id: b.id,
            dueDate: b.dueDate,
            formattedDate: this.format(b.dueDate, 'yyyy-MM-dd')
          })))
        }

        // Log income dates to verify format
        if (this.incomes.length > 0) {
          console.log('Income dates:', this.incomes.map(i => ({
            id: i.id,
            dueDate: i.dueDate,
            formattedDate: this.format(i.dueDate, 'yyyy-MM-dd')
          })))
        }

        // Verify data integrity
        if (this.transactions.some(t => isNaN(t.amount))) {
          console.warn('Found transactions with invalid amounts')
        }
        if (this.bills.some(b => isNaN(b.amount))) {
          console.warn('Found bills with invalid amounts')
        }
        if (this.incomes.some(i => isNaN(i.amount))) {
          console.warn('Found incomes with invalid amounts')
        }

      } catch (error) {
        console.error('Error loading calendar data:', error)
        this.error = 'Failed to load calendar data. Please try again.'
      } finally {
        this.isLoading = false
      }
    },
    selectDate(date) {
      console.log('Selecting date:', {
        date,
        formattedDate: this.format(date, 'yyyy-MM-dd'),
        transactions: this.selectedDateTransactions.length,
        bills: this.selectedDateBills.length,
        incomes: this.selectedDateIncomes.length
      })
      this.selectedDate = date
      if (this.currentView === 'Day') {
        this.currentDate = date
      }
    },
    previousPeriod() {
      switch (this.currentView) {
        case 'Month':
          this.currentDate = this.subMonths(this.currentDate, 1)
          break
        case 'Week':
          this.currentDate = this.subWeeks(this.currentDate, 1)
          break
        case 'Day':
          this.currentDate = this.subDays(this.currentDate, 1)
          this.selectedDate = this.currentDate
          break
      }
    },
    nextPeriod() {
      switch (this.currentView) {
        case 'Month':
          this.currentDate = this.addMonths(this.currentDate, 1)
          break
        case 'Week':
          this.currentDate = this.addWeeks(this.currentDate, 1)
          break
        case 'Day':
          this.currentDate = this.addDays(this.currentDate, 1)
          this.selectedDate = this.currentDate
          break
      }
    },
    formatDate(date) {
      return this.format(new Date(date), 'MMM d')
    },
    formatAmount(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount)
    },
    getCategoryColor(category) {
      const categoryObj = this.categories.find(c => c.name === category)
      return categoryObj ? categoryObj.color : '#6B7280'
    },
    getDayTransactionCount(date) {
      const dateStr = this.format(date, 'yyyy-MM-dd')
      const dayTransactions = this.transactions.filter(t => 
        this.format(new Date(t.date), 'yyyy-MM-dd') === dateStr
      )
      const dayBills = this.bills.filter(b => 
        this.format(new Date(b.dueDate), 'yyyy-MM-dd') === dateStr
      )
      const dayIncomes = this.incomes.filter(i => 
        this.format(new Date(i.dueDate), 'yyyy-MM-dd') === dateStr
      )
      return dayTransactions.length + dayBills.length + dayIncomes.length
    },
    getCategoryEmoji(category) {
      const categoryObj = this.categories.find(c => c.name === category)
      return categoryObj ? categoryObj.emoji : '❓'
    }
  },
  created() {
    this.format = format
    this.startOfMonth = startOfMonth
    this.endOfMonth = endOfMonth
    this.eachDayOfInterval = eachDayOfInterval
    this.isSameMonth = isSameMonth
    this.isToday = isToday
    this.addMonths = addMonths
    this.subMonths = subMonths
    this.startOfWeek = startOfWeek
    this.endOfWeek = endOfWeek
    this.addWeeks = addWeeks
    this.subWeeks = subWeeks
    this.addDays = addDays
    this.subDays = subDays
    this.addYears = addYears

    this.loadData()
  }
}
</script> 