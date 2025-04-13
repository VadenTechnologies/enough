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
        <!-- Integrated Balance & Monthly Overview Card -->
        <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50">
          <!-- Header with Month Navigation -->
          <div class="flex items-center justify-between p-4 border-b border-gray-700/50">
            <button 
              @click="navigateMonth(-1)"
              class="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
            >
              <ChevronLeftIcon class="w-5 h-5" />
            </button>
            <div class="text-center">
              <h3 class="text-lg font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {{ currentMonth }}
              </h3>
            </div>
            <button 
              @click="navigateMonth(1)"
              class="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
            >
              <ChevronRightIcon class="w-5 h-5" />
            </button>
          </div>

          <!-- Balance Section -->
          <div class="p-4">
            <div class="flex flex-col items-start mb-6">
              <h2 class="text-sm font-medium text-gray-400 mb-1">Current Balance</h2>
              <div class="relative">
                <div class="flex items-baseline space-x-1">
                  <span class="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">$</span>
                  <span class="text-6xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                    {{ (currentBalance || 0).toFixed(2) }}
                  </span>
                </div>
                <div class="absolute -bottom-3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-500/50 to-transparent"></div>
              </div>
            </div>

            <!-- Monthly Stats -->
            <div class="space-y-3 mb-6">
              <!-- Income Stats -->
              <button 
                @click="showIncomeDetails = true"
                class="w-full bg-gradient-to-br from-green-950/30 to-emerald-950/30 border border-green-900/30 rounded-xl p-3 transition-all duration-200 hover:bg-green-900/30"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                      <ArrowUpIcon class="w-4 h-4 text-green-400" />
                    </div>
                    <span class="text-sm font-medium text-gray-400">Income</span>
                  </div>
                  <p class="text-lg font-bold text-green-400">{{ formatAmount(monthlyIncome) }}</p>
                </div>
              </button>

              <!-- Expenses Stats -->
              <button 
                @click="showExpenseDetails = true"
                class="w-full bg-gradient-to-br from-red-950/30 to-rose-950/30 border border-red-900/30 rounded-xl p-3 transition-all duration-200 hover:bg-red-900/30"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center">
                      <ArrowDownIcon class="w-4 h-4 text-red-400" />
                    </div>
                    <span class="text-sm font-medium text-gray-400">Expenses</span>
                  </div>
                  <p class="text-lg font-bold text-red-400">{{ formatAmount(monthlyExpenses) }}</p>
                </div>
              </button>
            </div>

            <!-- Income Details Modal -->
            <div v-if="showIncomeDetails" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div class="bg-gray-800/90 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6 w-full max-w-sm">
                <div class="flex justify-between items-center mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                      <ArrowUpIcon class="w-5 h-5 text-green-400" />
                    </div>
                    <h3 class="text-lg font-semibold text-white">Income Details</h3>
                  </div>
                  <button 
                    @click="showIncomeDetails = false"
                    class="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <XMarkIcon class="w-5 h-5" />
                  </button>
                </div>

                <div class="space-y-4">
                  <div>
                    <div class="flex justify-between items-baseline mb-1">
                      <span class="text-sm text-gray-400">Current</span>
                      <p class="text-2xl font-bold text-green-400">{{ formatAmount(monthlyIncome) }}</p>
                    </div>
                    <div class="flex justify-between items-baseline mb-1">
                      <span class="text-sm text-gray-400">Expected</span>
                      <p class="text-lg font-medium text-green-400">{{ formatAmount(expectedMonthlyIncome) }}</p>
                    </div>
                    <div class="h-1.5 bg-green-900/30 rounded-full overflow-hidden mt-2">
                      <div 
                        class="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                        :style="{ width: `${Math.min((monthlyIncome / expectedMonthlyIncome) * 100, 100)}%` }"
                      ></div>
                    </div>
                    <div class="flex justify-between items-center mt-1">
                      <span class="text-xs text-gray-400">Progress</span>
                      <span class="text-xs text-gray-400">{{ Math.round((monthlyIncome / expectedMonthlyIncome) * 100) }}%</span>
                    </div>
                  </div>

                  <div class="pt-2 border-t border-gray-700/50">
                    <p class="text-sm text-gray-400">
                      <span class="text-green-400 font-medium">{{ formatAmount(expectedMonthlyIncome - monthlyIncome) }}</span> left to earn this month
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Expenses Details Modal -->
            <div v-if="showExpenseDetails" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div class="bg-gray-800/90 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6 w-full max-w-sm">
                <div class="flex justify-between items-center mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center">
                      <ArrowDownIcon class="w-5 h-5 text-red-400" />
                    </div>
                    <h3 class="text-lg font-semibold text-white">Expenses Details</h3>
                  </div>
                  <button 
                    @click="showExpenseDetails = false"
                    class="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <XMarkIcon class="w-5 h-5" />
                  </button>
                </div>

                <div class="space-y-4">
                  <div>
                    <div class="flex justify-between items-baseline mb-1">
                      <span class="text-sm text-gray-400">Current</span>
                      <p class="text-2xl font-bold text-red-400">{{ formatAmount(monthlyExpenses) }}</p>
                    </div>
                    <div class="flex justify-between items-baseline mb-1">
                      <span class="text-sm text-gray-400">Budget</span>
                      <p class="text-lg font-medium text-red-400">{{ formatAmount(monthlyBudget) }}</p>
                    </div>
                    <div class="h-1.5 bg-red-900/30 rounded-full overflow-hidden mt-2">
                      <div 
                        class="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full transition-all duration-500"
                        :style="{ width: `${Math.min((monthlyExpenses / monthlyBudget) * 100, 100)}%` }"
                      ></div>
                    </div>
                    <div class="flex justify-between items-center mt-1">
                      <span class="text-xs text-gray-400">Progress</span>
                      <span class="text-xs text-gray-400">{{ Math.round((monthlyExpenses / monthlyBudget) * 100) }}%</span>
                    </div>
                  </div>

                  <div class="pt-2 border-t border-gray-700/50">
                    <p class="text-sm text-gray-400">
                      <span class="text-red-400 font-medium">{{ formatAmount(monthlyBudget - monthlyExpenses) }}</span> left to spend this month
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="action in quickActions"
                :key="action.name"
                @click="handleQuickAction(action)"
                class="flex flex-col items-center justify-center p-3 rounded-lg backdrop-blur-sm border transition-all duration-200"
                :class="[
                  action.type === 'expense' 
                    ? 'bg-gradient-to-br from-red-500/10 via-red-900/20 to-rose-900/20 border-red-900/30 hover:from-red-500/20 hover:via-red-900/30 hover:to-rose-900/30 hover:border-red-800/40' 
                    : 'bg-gradient-to-br from-green-500/10 via-green-900/20 to-emerald-900/20 border-green-900/30 hover:from-green-500/20 hover:via-green-900/30 hover:to-emerald-900/30 hover:border-green-800/40'
                ]"
              >
                <span class="text-xl mb-1">{{ action.icon }}</span>
                <span class="text-xs font-medium text-white">{{ action.name }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Monthly Budgets -->
        <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50">
          <div class="p-4 border-b border-gray-700/50">
            <div class="flex flex-col">
              <h3 class="text-lg font-semibold text-white">Monthly Budgets</h3>
              <p class="text-sm text-gray-400 mt-1">Month of {{ currentMonth }}</p>
            </div>
          </div>
          <div class="p-4">
            <div v-if="!weeklyBudgets || weeklyBudgets.length === 0" class="text-left text-gray-400">
              No monthly budgets set. Add categories in Settings to see your progress.
            </div>
            <div v-else class="space-y-4">
              <div v-for="budget in weeklyBudgets" :key="budget.categoryId" class="space-y-2">
                <div class="flex justify-between items-center">
                  <div class="flex items-center">
                    <div class="w-3 h-3 rounded-full mr-3" :style="{ backgroundColor: getCategoryColor(budget.category) }"></div>
                    <span class="text-sm text-gray-400 truncate">{{ getCategoryWithEmoji(budget.category) }}</span>
                  </div>
                  <!-- Right side text - Stacked on mobile, side-by-side on sm+ -->
                  <div class="flex flex-col items-end sm:block sm:text-right">
                    <!-- Monthly Remaining -->
                    <p 
                      class="text-sm font-medium"
                      :class="getCategoryMonthlyData(budget.categoryId).monthlyRemaining >= 0 ? 'text-green-400' : 'text-red-400'"
                    >
                      {{ formatAmount(getCategoryMonthlyData(budget.categoryId).monthlyRemaining) }} of {{ formatAmount(getCategoryMonthlyData(budget.categoryId).monthlyBudget) }} left
                    </p>
                    <!-- Weekly Spent -->
                    <p class="text-xs text-gray-500 mt-0.5 sm:mt-0">
                      {{ formatAmount(budget.spent) }} spent this week
                      <span v-if="budget.carryoverBalance > 0" class="text-red-400">
                        (+{{ formatAmount(budget.carryoverBalance) }})
                      </span>
                    </p>
                  </div>
                </div>
                <!-- Monthly Progress Bar -->
                <div class="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full transition-all duration-500"
                    :style="{ 
                      backgroundColor: getCategoryColor(budget.category),
                      width: `${getMonthlyProgress(budget.categoryId)}%` 
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Section -->
        <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50">
          <div class="p-4 border-b border-gray-700/50">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <ClockIcon class="w-5 h-5 text-blue-400" />
                <h3 class="text-lg font-semibold text-white">Upcoming</h3>
              </div>
              <div class="flex items-center bg-gray-700/30 backdrop-blur-sm rounded-lg p-0.5">
                <button 
                  @click="timeRange = 'today'"
                  class="px-3 py-1 text-xs font-medium rounded-md transition-all duration-200"
                  :class="timeRange === 'today' 
                    ? 'bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 text-gray-400 hover:text-white hover:from-gray-700/50 hover:to-gray-800/50'"
                >
                  Today
                </button>
                <button 
                  @click="timeRange = 'week'"
                  class="px-3 py-1 text-xs font-medium rounded-md transition-all duration-200"
                  :class="timeRange === 'week' 
                    ? 'bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 text-gray-400 hover:text-white hover:from-gray-700/50 hover:to-gray-800/50'"
                >
                  Week
                </button>
                <button 
                  @click="timeRange = 'month'"
                  class="px-3 py-1 text-xs font-medium rounded-md transition-all duration-200"
                  :class="timeRange === 'month' 
                    ? 'bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 text-gray-400 hover:text-white hover:from-gray-700/50 hover:to-gray-800/50'"
                >
                  Month
                </button>
              </div>
            </div>
          </div>
          <div class="p-4">
            <div v-if="!allUpcomingItems || allUpcomingItems.length === 0" class="flex flex-col items-center justify-center py-6">
              <div class="w-12 h-12 rounded-full bg-gray-700/30 flex items-center justify-center mb-2">
                <ClockIcon class="w-6 h-6 text-gray-500" />
              </div>
              <p class="text-gray-400 text-center">No upcoming transactions</p>
              <p class="text-xs text-gray-500 text-center mt-1">All clear for the next {{ timeRange === 'week' ? '7 days' : '30 days' }}</p>
            </div>
            <div v-else-if="allUpcomingItems" class="space-y-2">
              <!-- Sort and combine bills, incomes, and transactions -->
              <template v-for="item in paginatedUpcomingItems" 
                :key="item.id"
              >
                <div 
                  class="group flex items-center p-3 rounded-lg transition-all duration-200 backdrop-blur-sm border"
                  :class="[
                    item.type === 'bill' || item.type === 'expense' 
                      ? 'bg-gradient-to-br from-red-500/10 via-red-900/20 to-rose-900/20 border-red-900/30 hover:from-red-500/20 hover:via-red-900/30 hover:to-rose-900/30 hover:border-red-800/40' 
                      : 'bg-gradient-to-br from-green-500/10 via-green-900/20 to-emerald-900/20 border-green-900/30 hover:from-green-500/20 hover:via-green-900/30 hover:to-emerald-900/30 hover:border-green-800/40'
                  ]"
                >
                  <!-- Left side: Icon and description -->
                  <div class="flex-1 min-w-0 flex items-center">
                    <div class="flex-shrink-0 mr-3">
                      <div 
                        class="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                        :class="[
                          item.type === 'bill' || item.type === 'expense' ? 'bg-red-500/10' : 'bg-green-500/10'
                        ]"
                      >
                        {{ item.type === 'bill' || item.type === 'expense' ? '💸' : '💰' }}
                      </div>
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-medium text-white truncate" style="text-align: left;">{{ item.description }}</p>
                      <div class="flex items-center space-x-2 text-xs mt-0.5">
                        <span class="text-gray-400">{{ item.category?.name || item.category }}</span>
                        <span v-if="item.type !== 'bill' && item.type !== 'income'" class="text-gray-600">•</span>
                      </div>
                    </div>
                  </div>
                  <!-- Right side: Amount and date -->
                  <div class="flex flex-col items-end ml-4">
                    <p 
                      class="text-sm font-medium"
                      :class="[
                        item.type === 'bill' || item.type === 'expense' ? 'text-red-400' : 'text-green-400'
                      ]"
                    >
                      {{ item.type === 'bill' || item.type === 'expense' ? '-' : '+' }}{{ formatAmount(item.amount) }}
                    </p>
                    <div class="flex items-center text-xs text-gray-400 mt-0.5">
                      <ClockIcon class="w-3 h-3 mr-1" />
                      <span>{{ formatDate(item.dueDate) }}</span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Pagination Controls -->
              <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2 mt-4 pt-2 border-t border-gray-700/50">
                <button 
                  @click="currentPage = Math.max(1, currentPage - 1)"
                  :disabled="currentPage === 1"
                  class="p-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
                  :class="currentPage === 1 
                    ? 'text-gray-600 cursor-not-allowed bg-gray-800/50' 
                    : 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 text-gray-400 hover:text-white hover:from-gray-700/50 hover:to-gray-800/50'"
                >
                  <ChevronLeftIcon class="w-5 h-5" />
                </button>
                <div class="flex items-center space-x-1">
                  <template v-for="page in totalPages" :key="page">
                    <button 
                      @click="currentPage = page"
                      class="w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm"
                      :class="currentPage === page 
                        ? 'bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20' 
                        : 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 text-gray-400 hover:text-white hover:from-gray-700/50 hover:to-gray-800/50'"
                    >
                      {{ page }}
                    </button>
                  </template>
                </div>
                <button 
                  @click="currentPage = Math.min(totalPages, currentPage + 1)"
                  :disabled="currentPage === totalPages"
                  class="p-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
                  :class="currentPage === totalPages 
                    ? 'text-gray-600 cursor-not-allowed bg-gray-800/50' 
                    : 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 text-gray-400 hover:text-white hover:from-gray-700/50 hover:to-gray-800/50'"
                >
                  <ChevronRightIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Add Transaction Modal -->
      <div v-if="showAddTransaction" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-gray-800/90 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6 w-full max-w-md">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {{ newTransaction.type === 'income' ? 'Log Income' : 'Log Bill Payment' }}
              </h2>
              <p class="text-sm text-gray-400 mt-1">Record your {{ newTransaction.type === 'income' ? 'income' : 'bill payment' }}</p>
            </div>
            <button 
              @click="showAddTransaction = false" 
              class="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="handleAddTransaction" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Select {{ newTransaction.type === 'income' ? 'Income Source' : 'Bill' }}
              </label>
              <div class="relative">
                <div 
                  class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 cursor-pointer flex items-center justify-between"
                  @click="showItemDropdown = !showItemDropdown"
                >
                  <span class="text-white">{{ selectedItem || 'Select an option' }}</span>
                  <ChevronDownIcon 
                    class="w-4 h-4 text-gray-400 transition-transform duration-200"
                    :class="{ 'transform rotate-180': showItemDropdown }"
                  />
                </div>
                <div 
                  v-if="showItemDropdown"
                  class="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                >
                  <div class="sticky top-0 bg-gray-800 border-b border-gray-700 p-2">
                    <input 
                      v-model="itemSearch"
                      type="text"
                      class="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Search items..."
                      @click.stop
                    >
                  </div>
                  <div class="p-1">
                    <div 
                      class="px-3 py-2 hover:bg-gray-700 cursor-pointer rounded-lg text-white"
                      @click="selectNewItem"
                    >
                      + Add New {{ newTransaction.type === 'income' ? 'Income Source' : 'Bill' }}
                    </div>
                    <div 
                      v-for="item in filteredItems" 
                      :key="item.id"
                      class="px-3 py-2 hover:bg-gray-700 cursor-pointer rounded-lg text-white"
                      @click="selectItem(item)"
                    >
                      {{ item.description }}
                    </div>
                  </div>
                </div>
              </div>
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
              <label class="block text-sm font-medium text-gray-300 mb-2">Date</label>
              <input 
                v-model="newTransaction.date"
                type="date"
                class="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                required
              >
            </div>

            <div class="flex justify-end space-x-3 pt-2">
              <button 
                type="button"
                @click="showAddTransaction = false"
                class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                class="px-6 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Add New Source Modal -->
      <div v-if="showAddSourceModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-gray-800/90 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6 w-full max-w-md">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Add New {{ newTransaction.type === 'income' ? 'Income Source' : 'Bill' }}
              </h2>
              <p class="text-sm text-gray-400 mt-1">Create a new {{ newTransaction.type === 'income' ? 'income source' : 'bill' }}</p>
            </div>
            <button 
              @click="showAddSourceModal = false" 
              class="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="handleAddSource" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <input 
                v-model="newSource.description"
                type="text"
                class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                placeholder="Enter description"
                required
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select 
                v-model="newSource.category"
                class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="" disabled class="text-white">Select a category</option>
                <option v-for="category in newTransaction.type === 'income' ? incomeCategories : billCategories" :key="category" :value="category" class="text-white">
                  {{ category }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Amount</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                <input 
                  v-model="newSource.amount"
                  type="number"
                  step="0.01"
                  class="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl pl-8 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                  placeholder="0.00"
                  required
                >
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
              <input 
                v-model="newSource.dueDate"
                type="date"
                class="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                required
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Frequency</label>
              <select 
                v-model="newSource.frequency"
                class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-Weekly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div class="flex justify-end space-x-3 pt-2">
              <button 
                type="button"
                @click="showAddSourceModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                class="px-6 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                Add & Select
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { 
  ChartBarIcon, 
  CalendarIcon, 
  CreditCardIcon, 
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PlusIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'
import { 
  getTransactions, 
  getBills, 
  getIncomes, 
  getCategories,
  getCategoryBudgets,
  addTransaction,
  addBill,
  addIncome
} from '../services/database'
import { 
  startOfWeek, 
  endOfWeek, 
  format, 
  startOfMonth, 
  endOfMonth,
  isWithinInterval
} from 'date-fns'
import { notificationService } from '../services/notificationService'

export default {
  name: 'DashboardView',
  components: {
    ArrowUpIcon,
    ArrowDownIcon,
    CalendarIcon,
    CreditCardIcon,
    ChartBarIcon,
    PlusIcon,
    XMarkIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon
  },
  setup() {
    const currentDate = ref(new Date())
    const weekStart = computed(() => startOfWeek(currentDate.value, { weekStartsOn: 1 }))
    const weekEnd = computed(() => endOfWeek(currentDate.value, { weekStartsOn: 1 }))
    const monthStart = computed(() => startOfMonth(currentDate.value))
    const monthEnd = computed(() => endOfMonth(currentDate.value))
    const showMonthly = ref(true)

    const categories = ref([])
    const transactions = ref([])
    const bills = ref([])
    const incomes = ref([])
    const isLoading = ref(true)
    const error = ref(null)

    const currentMonth = computed(() => format(currentDate.value, 'MMMM yyyy'))
    const currentWeek = computed(() => `Week of ${format(weekStart.value, 'MMM d')}`)

    const monthlyIncome = computed(() => {
      if (!transactions.value?.length) return 0
      
      const filteredTransactions = transactions.value.filter(t => {
        const transactionDate = new Date(t.date + 'T12:00:00Z')
        const isIncome = t.type === 'income'
        const isInCurrentMonth = isWithinInterval(transactionDate, { start: monthStart.value, end: monthEnd.value })
        
        return isIncome && isInCurrentMonth
      })
      
      const total = filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0)

      return total
    })

    const monthlyExpenses = computed(() => {
      if (!transactions.value?.length) return 0
      
      const filteredTransactions = transactions.value.filter(t => {
        const transactionDate = new Date(t.date + 'T12:00:00Z')
        const isExpense = t.type === 'expense'
        const isInCurrentMonth = isWithinInterval(transactionDate, { start: monthStart.value, end: monthEnd.value })
        
        
        return isExpense && isInCurrentMonth
      })
      
      const total = filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0)
   
      return total
    })

    const weeklyIncome = computed(() => {
      if (!transactions.value?.length) return 0
      return transactions.value
        .filter(t => t.type === 'income' && new Date(t.date) >= weekStart.value && new Date(t.date) <= weekEnd.value)
        .reduce((sum, t) => sum + Number(t.amount), 0)
    })

    const weeklyExpenses = computed(() => {
      if (!transactions.value?.length) return 0
      return transactions.value
        .filter(t => t.type === 'expense' && new Date(t.date) >= weekStart.value && new Date(t.date) <= weekEnd.value)
        .reduce((sum, t) => sum + Number(t.amount), 0)
    })

    const monthlyBalance = computed(() => monthlyIncome.value - monthlyExpenses.value)
    const weeklyBalance = computed(() => weeklyIncome.value - weeklyExpenses.value)
    const currentBalance = computed(() => {
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Set to start of day for accurate comparison
      
      // Only include transactions that have already occurred
      const pastTransactions = transactions.value.filter(t => {
        const transactionDate = new Date(t.date)
        transactionDate.setHours(0, 0, 0, 0)
        return transactionDate <= today
      })

      // Calculate total from past transactions
      const transactionTotal = pastTransactions.reduce((sum, t) => {
        return sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount))
      }, 0)
      
      // Return the balance, defaulting to 0 if undefined
      return transactionTotal || 0
    })
    const balancePeriod = computed(() => showMonthly.value ? currentMonth.value : currentWeek.value)

    const upcomingBills = computed(() => {
      if (!bills.value?.length) return []
      const today = new Date()
      let endDate = new Date(today)
      
      // Set the end date based on selected time range
      if (timeRange.value === 'today') {
        // Set today to start of day (12:00 AM)
        today.setHours(0, 0, 0, 0)
        // Set endDate to end of day (11:59:59 PM)
        endDate.setHours(23, 59, 59, 999)
      } else if (timeRange.value === 'week') {
        endDate.setDate(today.getDate() + 7)
      } else {
        endDate.setDate(today.getDate() + 30)
      }
      
      const filteredBills = bills.value
        .filter(bill => {
          // Ensure dueDate is properly formatted (YYYY-MM-DD)
          const dueDateParts = bill.dueDate.split('T')[0].split('-')
          const dueDate = new Date(
            parseInt(dueDateParts[0]), // year
            parseInt(dueDateParts[1]) - 1, // month (0-based)
            parseInt(dueDateParts[2]) // day
          )
          
          // For recurring bills, calculate next occurrence
          if (bill.isRecurring) {
            let nextDueDate = new Date(dueDate)
            
            // Move the date forward until we find the next occurrence
            while (nextDueDate < today) {
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
            
            
            return nextDueDate <= endDate
          }
          
          
          return dueDate >= today && dueDate <= endDate
        })
        .sort((a, b) => {
          const aDate = new Date(a.dueDate.split('T')[0])
          const bDate = new Date(b.dueDate.split('T')[0])
          return aDate - bDate
        })
        .slice(0, 5)
        .map(bill => ({
          ...bill,
          type: 'bill'  // Explicitly set the type for bills
        }))

      return filteredBills
    })

    const upcomingIncomes = computed(() => {
      if (!incomes.value?.length) return []
      const today = new Date()
      let endDate = new Date(today)
      
      // Set the end date based on selected time range
      if (timeRange.value === 'today') {
        // Set today to start of day (12:00 AM)
        today.setHours(0, 0, 0, 0)
        // Set endDate to end of day (11:59:59 PM)
        endDate.setHours(23, 59, 59, 999)
      } else if (timeRange.value === 'week') {
        endDate.setDate(today.getDate() + 7)
      } else {
        endDate.setDate(today.getDate() + 30)
      }
      
      return incomes.value
        .filter(income => {
          // Ensure dueDate is properly formatted (YYYY-MM-DD)
          const dueDateParts = income.dueDate.split('T')[0].split('-')
          const dueDate = new Date(
            parseInt(dueDateParts[0]), // year
            parseInt(dueDateParts[1]) - 1, // month (0-based)
            parseInt(dueDateParts[2]) // day
          )
          
          // For recurring incomes, calculate next occurrence
          if (income.isRecurring) {
            let nextDueDate = new Date(dueDate)
            
            // Move the date forward until we find the next occurrence
            while (nextDueDate < today) {
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
            
            
            
            return nextDueDate <= endDate
          }
          
          
          
          return dueDate >= today && dueDate <= endDate
        })
        .sort((a, b) => {
          const aDate = new Date(a.dueDate.split('T')[0])
          const bDate = new Date(b.dueDate.split('T')[0])
          return aDate - bDate
        })
        .slice(0, 5)
    })

    // New computed property for upcoming transactions
    const upcomingTransactions = computed(() => {
      
      
      if (!transactions.value?.length) {
        return []
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      let endDate = new Date(today)
      
      if (timeRange.value === 'today') {
        endDate.setHours(23, 59, 59, 999)
      } else if (timeRange.value === 'week') {
        endDate.setDate(today.getDate() + 7)
      } else {
        endDate.setDate(today.getDate() + 30)
      }
      
      
      const filteredTransactions = transactions.value
        .filter(transaction => {
          // Parse the transaction date and set to start of day for consistent comparison
          const transactionDate = new Date(transaction.date)
          transactionDate.setHours(0, 0, 0, 0)
          
          // A transaction is upcoming if its date is in the future and within our selected time range
          const isUpcoming = transactionDate >= today && transactionDate <= endDate
          
          
          
          return isUpcoming
        })
        .sort((a, b) => {
          const aDate = new Date(a.date)
          const bDate = new Date(b.date)
          return aDate - bDate
        })
        .map(transaction => ({
          ...transaction,
          type: transaction.type,
          dueDate: transaction.date, // Use date as dueDate for consistency
          frequency: 'One-time',
          id: transaction.id || `transaction-${Date.now()}-${Math.random()}` // Ensure each transaction has a unique ID
        }))

      return filteredTransactions
    })

    const spendingByCategory = computed(() => {
      if (!transactions.value?.length) return {}
      
      const expenses = transactions.value.filter(t => 
        t.type === 'expense' && 
        new Date(t.date) >= monthStart.value && 
        new Date(t.date) <= monthEnd.value
      )
      
      return expenses.reduce((acc, t) => {
        const categoryId = t.category?.id || 'uncategorized'; // Use category ID as key
        acc[categoryId] = (acc[categoryId] || 0) + Number(t.amount)
        return acc
      }, {})
    })

    const weeklyBudgets = ref([])

    // Watch for changes in weeklyBudgets
    watch(weeklyBudgets, (newBudgets) => {
      console.log('📊 WEEKLY BUDGETS UPDATED', {
        totalBudgets: newBudgets.length,
        budgets: newBudgets.map(b => ({
          category: b.category,
          amount: b.amount,
          spent: b.spent,
          remaining: b.remaining,
          weekStart: b.weekStart
        }))
      })
    }, { deep: true })

    const showAddTransaction = ref(false)
    const newTransaction = ref({
      type: 'expense',
      itemId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    })

    const selectedItems = computed(() => {
      return newTransaction.value.type === 'income' ? incomes.value : bills.value
    })

    const quickActions = ref([
      {
        name: 'Log Paid Bill',
        icon: '📄',
        type: 'expense',
        description: 'Bill Payment'
      },
      {
        name: 'Log Income',
        icon: '💰',
        type: 'income',
        description: 'Income'
      }
    ])

    const showAddSourceModal = ref(false)
    const newSource = ref({
      description: '',
      category: '',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0],
      frequency: 'monthly'
    })

    const incomeCategories = computed(() => [
      { name: 'Salary', emoji: '💼' },
      { name: 'Freelance', emoji: '💻' },
      { name: 'Investments', emoji: '📈' },
      { name: 'Rental', emoji: '🏠' },
      { name: 'Other', emoji: '💰' }
    ].map(c => c.name))

    const billCategories = computed(() => [
      { name: 'Housing', emoji: '🏡' },
      { name: 'Utilities', emoji: '⚡' },
      { name: 'Insurance', emoji: '🛡️' },
      { name: 'Transportation', emoji: '🚗' },
      { name: 'Healthcare', emoji: '🏥' },
      { name: 'Entertainment', emoji: '🎮' },
      { name: 'Other', emoji: '📝' }
    ].map(c => c.name))

    const categoryEmojis = {
      // Income categories
      'Salary': '💼',
      'Freelance': '💻',
      'Investments': '📈',
      'Rental': '🏠',
      'Other Income': '💰',
      // Bill categories
      'Housing': '🏡',
      'Utilities': '⚡',
      'Insurance': '🛡️',
      'Transportation': '🚗',
      'Healthcare': '🏥',
      'Entertainment': '🎮',
      'Other': '📝',
      // Default
      'Uncategorized': '📋'
    }

    const getCategoryWithEmoji = (category) => {
      return `${categoryEmojis[category] || '📝'} ${category}`
    }

    const getTransactionCategory = (transaction) => {
      // For regular transactions that already have a category
      if (transaction.category) {
        return getCategoryWithEmoji(transaction.category)
      }

      // For bill payments
      if (transaction.type === 'expense') {
        const matchingBill = bills.value.find(b => b.description === transaction.description)
        if (matchingBill) {
          return getCategoryWithEmoji(matchingBill.category)
        }
      }

      // For income
      if (transaction.type === 'income') {
        const matchingIncome = incomes.value.find(i => i.description === transaction.description)
        if (matchingIncome) {
          return getCategoryWithEmoji(matchingIncome.category)
        }
      }

      // Fallback
      return getCategoryWithEmoji('Uncategorized')
    }

    const loadData = async () => {
      try {
        isLoading.value = true
        error.value = null

        const [categoriesData, billsData, incomesData, transactionsData] = await Promise.all([
          getCategories(),
          getBills(),
          getIncomes(),
          getTransactions()
        ])

        categories.value = categoriesData || []
        bills.value = billsData || []
        incomes.value = incomesData || []

        // Process transactions
        transactions.value = (transactionsData || []).map(transaction => {
          // Ensure date is in YYYY-MM-DD format
          const date = new Date(transaction.date)
          const formattedDate = date.toISOString().split('T')[0]

          let category;
          if (transaction.type === 'income') {
            // For income transactions
            const matchingIncome = incomesData?.find(i => i.description === transaction.description);
            if (matchingIncome?.category) {
              category = categoriesData?.find(c => c.name === matchingIncome.category);
            }
            if (!category) {
              category = {
                name: 'Income',
                color: '#22c55e',
                emoji: '↑'
              };
            }
          } else {
            // For expense transactions
            // First check if it's a bill payment
            const matchingBill = billsData?.find(b => b.description === transaction.description);
            if (matchingBill?.category) {
              category = categoriesData?.find(c => c.name === matchingBill.category);
            }
            // Then check if transaction has its own category
            if (!category && transaction.category) {
              category = categoriesData?.find(c => c.name === transaction.category);
            }
            // Use default if no category found
            if (!category) {
              category = {
                name: 'Uncategorized',
                color: '#6b7280',
                emoji: '📋'
              };
            }
          }

          return {
            ...transaction,
            date: formattedDate,
            category
          };
        });

        console.log('💾 PROCESSED TRANSACTIONS:', transactions.value.map(t => ({
          description: t.description,
          date: t.date,
          type: t.type,
          amount: t.amount,
          category: t.category?.name
        })))

        console.log('📅 CALCULATING WEEKLY BUDGETS', {
          weekStart: weekStart.value.toISOString(),
          weekEnd: weekEnd.value.toISOString(),
          categories: categories.value.length,
          transactions: transactions.value.length
        })

        // Calculate weekly budgets based on the current week
        weeklyBudgets.value = await getCategoryBudgets(
          bills.value,
          incomes.value,
          weekStart.value,
          weekEnd.value
        )

        console.log('✅ WEEKLY BUDGETS CALCULATED', {
          totalBudgets: weeklyBudgets.value.length,
          budgets: weeklyBudgets.value.map(b => ({
            category: b.category,
            amount: b.amount,
            spent: b.spent,
            remaining: b.remaining
          }))
        })

      } catch (error) {
        console.error('❌ ERROR LOADING WEEKLY BUDGETS:', error)
        error.value = 'Failed to load weekly budgets. Please try again.'
      } finally {
        isLoading.value = false
      }
    }

    const formatDate = (date) => {
      return format(new Date(date), 'MMM d')
    }

    const formatAmount = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount)
    }

    const getCategoryColor = (category) => {
      const categoryObj = categories.value.find(c => c.name === category)
      return categoryObj ? categoryObj.color : '#6B7280'
    }

    const handleQuickAction = (action) => {
      showAddTransaction.value = true
      newTransaction.value = {
        type: action.type,
        itemId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      }
    }

    const handleItemSelect = () => {
      if (newTransaction.value.itemId === 'new') {
        showAddSourceModal.value = true
        newTransaction.value.itemId = ''
        return
      }

      const selectedItem = selectedItems.value.find(item => item.id === newTransaction.value.itemId)
      if (selectedItem) {
        newTransaction.value.amount = selectedItem.amount
      }
    }

    const handleAddTransaction = async () => {
      try {
        if (!newTransaction.value.itemId || !newTransaction.value.amount) {
          alert('Please select an item and enter an amount')
          return
        }

        const selectedItem = selectedItems.value.find(item => item.id === newTransaction.value.itemId)
        if (!selectedItem) {
          alert('Selected item not found')
          return
        }

        // Log the selected item for debugging
        console.log('Selected item:', selectedItem)

        const transaction = {
          id: Date.now(), // Add a unique ID for the transaction
          type: newTransaction.value.type,
          description: selectedItem.description,
          amount: Number(newTransaction.value.amount),
          category: selectedItem.category || 'Uncategorized',
          date: newTransaction.value.date
        }

        // Log the transaction being added
        console.log('Adding transaction:', transaction)

        await addTransaction(transaction)
        
        // Check balance after transaction
        const newBalance = currentBalance.value
        await notificationService.scheduleBalanceAlert(newBalance)
        
        // Refresh data to update transactions and weekly budgets
        await loadData()
        
        // Reset form
        newTransaction.value = {
          type: 'expense',
          itemId: '',
          amount: '',
          date: new Date().toISOString().split('T')[0]
        }
        showAddTransaction.value = false
      } catch (error) {
        console.error('Error adding transaction:', error)
        alert('Failed to add transaction. Please try again.')
      }
    }

    const handleAddSource = async () => {
      try {
        let newItem
        if (newTransaction.value.type === 'income') {
          newItem = await addIncome(newSource.value)
          incomes.value.push(newItem)
        } else {
          newItem = await addBill(newSource.value)
          bills.value.push(newItem)
        }
        
        newTransaction.value.itemId = newItem.id
        newTransaction.value.amount = newItem.amount
        showAddSourceModal.value = false
        
        // Reset the new source form
        newSource.value = {
          description: '',
          category: '',
          amount: '',
          dueDate: new Date().toISOString().split('T')[0],
          frequency: 'monthly'
        }
      } catch (error) {
        console.error('Error adding new source:', error)
        error.value = 'Failed to add new source'
      }
    }

    const loadCategories = async () => {
      try {
        categories.value = await getCategories()
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }

    const timeRange = ref('week')

    const showItemDropdown = ref(false)
    const itemSearch = ref('')
    const selectedItem = ref(null)
    const filteredItems = computed(() => {
      if (!itemSearch.value) return selectedItems.value
      const search = itemSearch.value.toLowerCase()
      return selectedItems.value.filter(item => 
        item.description.toLowerCase().includes(search)
      )
    })

    const selectNewItem = () => {
      showItemDropdown.value = false
      itemSearch.value = ''
      showAddSourceModal.value = true
    }

    const selectItem = (item) => {
      newTransaction.value.itemId = item.id
      selectedItem.value = item.description
      showItemDropdown.value = false
      itemSearch.value = ''
      handleItemSelect()
    }

    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        showItemDropdown.value = false
      }
    }

    const currentPage = ref(1)
    const itemsPerPage = 5

    const allUpcomingItems = computed(() => {
      // Ensure all required arrays are initialized
      const bills = upcomingBills.value || []
      const incomes = upcomingIncomes.value || []
      const transactions = upcomingTransactions.value || []
      
      console.log('🔄 COMBINING UPCOMING ITEMS:', {
        billsCount: bills.length,
        incomesCount: incomes.length,
        transactionsCount: transactions.length,
        bills: bills,
        incomes: incomes,
        transactions: transactions
      })
      
      const combinedItems = [
        ...bills,
        ...incomes,
        ...transactions
      ].sort((a, b) => {
        const aDate = new Date(a.dueDate)
        const bDate = new Date(b.dueDate)
        return aDate - bDate
      })

      console.log('📋 FINAL COMBINED ITEMS:', combinedItems.map(item => ({
        description: item.description,
        type: item.type,
        date: item.dueDate,
        amount: item.amount
      })))
      
      return combinedItems
    })

    const totalPages = computed(() => Math.ceil(allUpcomingItems.value.length / itemsPerPage))

    const paginatedUpcomingItems = computed(() => {
      const startIndex = (currentPage.value - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      return allUpcomingItems.value.slice(startIndex, endIndex)
    })

    // Reset pagination when time range changes
    watch(timeRange, () => {
      currentPage.value = 1
    })

    const navigateMonth = (months) => {
      const newDate = new Date(currentDate.value)
      newDate.setMonth(newDate.getMonth() + months)
      currentDate.value = newDate
    }

    // Add computed property for expected monthly income
    const expectedMonthlyIncome = computed(() => {
      return incomes.value
        .filter(income => income.frequency === 'monthly')
        .reduce((total, income) => total + Number(income.amount), 0)
    })

    // Add computed property for monthlyBudget
    const monthlyBudget = computed(() => {
      // Sum up all monthly bills
      const monthlyBillsTotal = bills.value
        .filter(bill => bill.frequency === 'monthly')
        .reduce((total, bill) => total + Number(bill.amount), 0)

      // Get monthly budgets
      const monthlyBudgetsTotal = categories.value
        .filter(category => category.budget)
        .reduce((total, category) => total + Number(category.budget), 0)

      return monthlyBillsTotal + monthlyBudgetsTotal
    })

    const showIncomeDetails = ref(false)
    const showExpenseDetails = ref(false)

    const getMonthlyProgress = (categoryId) => {
      const category = categories.value.find(c => c.id === categoryId)
      const monthlyBudget = Number(category?.budget) || 0
      const monthlySpending = spendingByCategory.value[categoryId] || 0
      
      if (monthlyBudget === 0) return 0
      
      const progress = (monthlySpending / monthlyBudget) * 100
      return Math.min(progress, 100) // Cap at 100%
    }

    const getCategoryMonthlyData = (categoryId) => {
      const category = categories.value.find(c => c.id === categoryId)
      const monthlyBudget = Number(category?.budget) || 0
      const monthlySpending = spendingByCategory.value[categoryId] || 0
      const monthlyRemaining = monthlyBudget - monthlySpending
      
      return { monthlyBudget, monthlySpending, monthlyRemaining }
    }

    onMounted(async () => {
      try {
        await Promise.all([
          loadData(),
          loadCategories()
        ])
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        error.value = 'Failed to load dashboard data. Please try again.'
      }
    })

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      currentDate,
      weekStart,
      weekEnd,
      monthStart,
      monthEnd,
      showMonthly,
      monthlyBudget,
      categories,
      transactions,
      bills,
      incomes,
      isLoading,
      error,
      currentMonth,
      currentWeek,
      monthlyIncome,
      monthlyExpenses,
      monthlyBalance,
      weeklyIncome,
      weeklyExpenses,
      currentBalance,
      balancePeriod,
      upcomingBills,
      upcomingIncomes,
      upcomingTransactions,
      allUpcomingItems,
      spendingByCategory,
      weeklyBudgets,
      formatDate,
      formatAmount,
      getCategoryColor,
      showAddTransaction,
      newTransaction,
      selectedItems,
      quickActions,
      handleQuickAction,
      handleItemSelect,
      handleAddTransaction,
      showAddSourceModal,
      newSource,
      incomeCategories,
      billCategories,
      handleAddSource,
      loadCategories,
      isWithinInterval,
      getCategoryWithEmoji,
      categoryEmojis,
      getTransactionCategory,
      timeRange,
      showItemDropdown,
      itemSearch,
      selectedItem,
      filteredItems,
      selectNewItem,
      selectItem,
      currentPage,
      totalPages,
      paginatedUpcomingItems,
      navigateMonth,
      expectedMonthlyIncome,
      showIncomeDetails,
      showExpenseDetails,
      getMonthlyProgress,
      getCategoryMonthlyData,
    }
  }
}
</script> 