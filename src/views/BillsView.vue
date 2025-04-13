/* eslint-disable */
<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <div class="p-3 space-y-4 sm:p-4 sm:space-y-6">
      <!-- Header -->
      <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4 sm:p-6">
        <div class="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Bills & Income</h2>
            <p class="text-sm text-gray-400 mt-1">Manage your recurring bills and income sources</p>
          </div>
          <div class="flex space-x-2 sm:space-x-3">
            <button 
              @click="showAddIncomeModal = true"
              class="flex-1 sm:flex-none px-3 py-2.5 text-sm font-medium bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <PlusIcon class="w-4 h-4" />
              <span>Add Income</span>
            </button>
            <button 
              @click="showAddBillModal = true"
              class="flex-1 sm:flex-none px-3 py-2.5 text-sm font-medium bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <PlusIcon class="w-4 h-4" />
              <span>Add Bill</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Income Section -->
      <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50 overflow-hidden">
        <div class="p-4 border-b border-gray-700/50">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2 cursor-pointer" @click="showIncome = !showIncome">
              <ArrowUpIcon class="w-5 h-5 text-green-400" />
              <h3 class="text-lg font-semibold text-white">Recurring Income</h3>
              <ChevronDownIcon 
                class="w-5 h-5 text-gray-400 transition-transform duration-200"
                :class="{ 'transform rotate-180': showIncome }"
              />
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-400">Total</p>
              <p class="text-lg font-semibold text-green-400">{{ formatAmount(filteredMonthlyIncome) }}</p>
            </div>
          </div>
          <!-- Income Filters -->
          <div class="mt-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-400">Filters</span>
              <button 
                @click="showIncomeFilters = !showIncomeFilters"
                class="p-1.5 text-sm rounded-lg transition-colors"
                :class="showIncomeFilters ? 'text-green-400' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'"
                title="Toggle filters"
              >
                <ChevronDownIcon 
                  class="w-4 h-4 transition-transform duration-200"
                  :class="{ 'transform rotate-180': !showIncomeFilters }"
                />
              </button>
            </div>
            <div 
              v-show="showIncomeFilters"
              class="flex flex-wrap gap-3 transition-all duration-200"
            >
              <div class="flex items-center space-x-2">
                <div class="relative">
                  <div 
                    class="px-3 py-1.5 text-sm bg-gray-700/30 text-gray-300 rounded-lg border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-green-500/50 cursor-pointer flex items-center justify-between min-w-[200px]"
                    @click="showIncomeCategoryFilter = !showIncomeCategoryFilter"
                  >
                    <span class="flex items-center space-x-2">
                      <span class="text-lg">{{ incomeFilters.category ? getCategoryEmoji(incomeFilters.category) : '📋' }}</span>
                      <span>{{ incomeFilters.category || 'All Categories' }}</span>
                    </span>
                    <ChevronDownIcon 
                      class="w-4 h-4 text-gray-400 transition-transform duration-200"
                      :class="{ 'transform rotate-180': showIncomeCategoryFilter }"
                    />
                  </div>
                  <div 
                    v-if="showIncomeCategoryFilter"
                    class="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    <div class="sticky top-0 bg-gray-800 border-b border-gray-700 p-2">
                      <input 
                        v-model="incomeCategoryFilterSearch"
                        type="text"
                        class="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                        placeholder="Search categories..."
                        @click.stop
                      >
                    </div>
                    <div 
                      v-if="incomeCategoryFilterSearch"
                      class="p-1"
                    >
                      <div 
                        v-for="category in filteredIncomeCategories" 
                        :key="category"
                        class="px-3 py-2 hover:bg-gray-700 cursor-pointer flex items-center space-x-2 rounded-lg"
                        @click="selectIncomeFilterCategory(category)"
                      >
                        <span class="text-lg">{{ getCategoryEmoji(category) }}</span>
                        <span>{{ category }}</span>
                      </div>
                    </div>
                    <div 
                      v-else
                      class="p-1"
                    >
                      <div 
                        v-for="(group, title) in groupedIncomeCategories" 
                        :key="title"
                        class="mb-2"
                      >
                        <div 
                          class="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 flex items-center justify-between"
                          @click="selectIncomeFilterGroup(title)"
                        >
                          <span>{{ title }}</span>
                          <ChevronDownIcon 
                            class="w-4 h-4 transition-transform duration-200"
                            :class="{ 'transform rotate-180': incomeFilters.selectedGroup === title }"
                          />
                        </div>
                        <div 
                          v-show="incomeFilters.selectedGroup === title"
                          class="pl-2"
                        >
                          <div 
                            v-for="category in group" 
                            :key="category"
                            class="px-3 py-2 hover:bg-gray-700 cursor-pointer flex items-center space-x-2 rounded-lg"
                            @click="selectIncomeFilterCategory(category)"
                          >
                            <span class="text-lg">{{ getCategoryEmoji(category) }}</span>
                            <span>{{ category }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  @click="incomeFilters.inverseCategory = !incomeFilters.inverseCategory"
                  class="p-1.5 text-sm rounded-lg transition-colors"
                  :class="incomeFilters.inverseCategory ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'"
                  title="Inverse category filter"
                >
                  <ArrowPathIcon class="w-4 h-4" />
                </button>
              </div>
              <div class="flex items-center space-x-2">
                <select 
                  v-model="incomeFilters.frequency"
                  class="px-3 py-1.5 text-sm bg-gray-700/30 text-gray-300 rounded-lg border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                >
                  <option value="">All Frequencies</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <button 
                  @click="incomeFilters.inverseFrequency = !incomeFilters.inverseFrequency"
                  class="p-1.5 text-sm rounded-lg transition-colors"
                  :class="incomeFilters.inverseFrequency ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'"
                  title="Inverse frequency filter"
                >
                  <ArrowPathIcon class="w-4 h-4" />
                </button>
              </div>
              <select 
                v-model="incomeFilters.sort"
                class="px-3 py-1.5 text-sm bg-gray-700/30 text-gray-300 rounded-lg border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="description">Sort by Name</option>
              </select>
            </div>
          </div>
        </div>
        <div v-show="showIncome" class="p-3 sm:p-4">
          <div class="space-y-3 sm:space-y-4">
            <div 
              v-for="income in filteredIncomes" 
              :key="income.id"
              class="group bg-gray-700/20 hover:bg-gray-700/30 rounded-xl border border-gray-600/30 p-3 sm:p-4 transition-all duration-200"
            >
              <div class="flex items-start sm:items-center justify-between">
                <div class="flex items-start space-x-3 sm:space-x-4">
                  <div 
                    class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-lg sm:text-xl shrink-0 cursor-pointer hover:bg-green-500/20 transition-colors"
                    @click="selectIncomeFilterGroup(getCategoryGroup(income.category))"
                    :title="'Filter by ' + getCategoryGroup(income.category)"
                  >
                    {{ getCategoryEmoji(income.category) }}
                  </div>
                  <div>
                    <h3 class="font-medium text-white text-base sm:text-lg">{{ income.description }}</h3>
                    <div class="flex flex-wrap items-center gap-2 mt-1">
                      <span class="px-2 py-0.5 text-xs font-medium bg-gray-600/30 text-gray-300 rounded-full">
                        {{ income.category }}
                      </span>
                      <span class="text-gray-500 hidden sm:inline">•</span>
                      <span class="text-sm text-gray-400 capitalize">{{ income.frequency }}</span>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-lg sm:text-xl font-medium text-green-400">{{ formatAmount(income.amount) }}</p>
                  <div class="flex items-center justify-end space-x-1 mt-2">
                    <button 
                      @click="editIncome(income)"
                      class="p-2 text-gray-400 hover:text-white hover:bg-gray-600/30 rounded-lg transition-colors"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button 
                      @click="deleteIncome(income.id)"
                      class="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="mt-3 sm:mt-4 flex flex-wrap items-center gap-3 text-sm">
                <div class="flex items-center space-x-2">
                  <CalendarIcon class="w-4 h-4 text-gray-400" />
                  <span class="text-gray-400">Due: {{ formatDate(income.dueDate) }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <ClockIcon class="w-4 h-4 text-gray-400" />
                  <span class="text-gray-400 capitalize">{{ income.frequency }}</span>
                </div>
              </div>
            </div>
            
            <!-- Empty State -->
            <div v-if="!incomes.length" class="flex flex-col items-center justify-center py-8">
              <div class="w-16 h-16 rounded-full bg-gray-700/30 flex items-center justify-center mb-3">
                <CurrencyDollarIcon class="w-8 h-8 text-gray-500" />
              </div>
              <p class="text-gray-400">No recurring income sources</p>
              <p class="text-sm text-gray-500 mt-1">Add your first income source to get started</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bills Section -->
      <div class="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50 overflow-hidden">
        <div class="p-4 border-b border-gray-700/50">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2 cursor-pointer" @click="showBills = !showBills">
              <ArrowDownIcon class="w-5 h-5 text-red-400" />
              <h3 class="text-lg font-semibold text-white">Recurring Bills</h3>
              <ChevronDownIcon 
                class="w-5 h-5 text-gray-400 transition-transform duration-200"
                :class="{ 'transform rotate-180': showBills }"
              />
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-400">Total</p>
              <p class="text-lg font-semibold text-red-400">{{ formatAmount(filteredMonthlyBills) }}</p>
            </div>
          </div>
          <!-- Bill Filters -->
          <div class="mt-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-400">Filters</span>
              <button 
                @click="showBillFilters = !showBillFilters"
                class="p-1.5 text-sm rounded-lg transition-colors"
                :class="showBillFilters ? 'text-red-400' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'"
                title="Toggle filters"
              >
                <ChevronDownIcon 
                  class="w-4 h-4 transition-transform duration-200"
                  :class="{ 'transform rotate-180': !showBillFilters }"
                />
              </button>
            </div>
            <div 
              v-show="showBillFilters"
              class="flex flex-wrap gap-3 transition-all duration-200"
            >
              <div class="flex items-center space-x-2">
                <div class="relative">
                  <div 
                    class="px-3 py-1.5 text-sm bg-gray-700/30 text-gray-300 rounded-lg border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer flex items-center justify-between min-w-[200px]"
                    @click="showBillCategoryFilter = !showBillCategoryFilter"
                  >
                    <span class="flex items-center space-x-2">
                      <span class="text-lg">{{ billFilters.category ? getCategoryEmoji(billFilters.category) : '📋' }}</span>
                      <span>{{ billFilters.category || 'All Categories' }}</span>
                    </span>
                    <ChevronDownIcon 
                      class="w-4 h-4 text-gray-400 transition-transform duration-200"
                      :class="{ 'transform rotate-180': showBillCategoryFilter }"
                    />
                  </div>
                  <div 
                    v-if="showBillCategoryFilter"
                    class="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    <div class="sticky top-0 bg-gray-800 border-b border-gray-700 p-2">
                      <input 
                        v-model="billCategoryFilterSearch"
                        type="text"
                        class="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        placeholder="Search categories..."
                        @click.stop
                      >
                    </div>
                    <div 
                      v-if="billCategoryFilterSearch"
                      class="p-1"
                    >
                      <div 
                        v-for="category in filteredBillCategories" 
                        :key="category"
                        class="px-3 py-2 hover:bg-gray-700 cursor-pointer flex items-center space-x-2 rounded-lg"
                        @click="selectBillFilterCategory(category)"
                      >
                        <span class="text-lg">{{ getCategoryEmoji(category) }}</span>
                        <span>{{ category }}</span>
                      </div>
                    </div>
                    <div 
                      v-else
                      class="p-1"
                    >
                      <div 
                        v-for="(group, title) in groupedBillCategories" 
                        :key="title"
                        class="mb-2"
                      >
                        <div 
                          class="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 flex items-center justify-between"
                          @click="selectBillFilterGroup(title)"
                        >
                          <span>{{ title }}</span>
                          <ChevronDownIcon 
                            class="w-4 h-4 transition-transform duration-200"
                            :class="{ 'transform rotate-180': billFilters.selectedGroup === title }"
                          />
                        </div>
                        <div 
                          v-show="billFilters.selectedGroup === title"
                          class="pl-2"
                        >
                          <div 
                            v-for="category in group" 
                            :key="category"
                            class="px-3 py-2 hover:bg-gray-700 cursor-pointer flex items-center space-x-2 rounded-lg"
                            @click="selectBillFilterCategory(category)"
                          >
                            <span class="text-lg">{{ getCategoryEmoji(category) }}</span>
                            <span>{{ category }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  @click="billFilters.inverseCategory = !billFilters.inverseCategory"
                  class="p-1.5 text-sm rounded-lg transition-colors"
                  :class="billFilters.inverseCategory ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'"
                  title="Inverse category filter"
                >
                  <ArrowPathIcon class="w-4 h-4" />
                </button>
              </div>
              <div class="flex items-center space-x-2">
                <select 
                  v-model="billFilters.frequency"
                  class="px-3 py-1.5 text-sm bg-gray-700/30 text-gray-300 rounded-lg border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  <option value="">All Frequencies</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <button 
                  @click="billFilters.inverseFrequency = !billFilters.inverseFrequency"
                  class="p-1.5 text-sm rounded-lg transition-colors"
                  :class="billFilters.inverseFrequency ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'"
                  title="Inverse frequency filter"
                >
                  <ArrowPathIcon class="w-4 h-4" />
                </button>
              </div>
              <select 
                v-model="billFilters.sort"
                class="px-3 py-1.5 text-sm bg-gray-700/30 text-gray-300 rounded-lg border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="description">Sort by Name</option>
              </select>
            </div>
          </div>
        </div>
        <div v-show="showBills" class="p-3 sm:p-4">
          <div class="space-y-3 sm:space-y-4">
            <div 
              v-for="bill in filteredBills" 
              :key="bill.id"
              class="group bg-gray-700/20 hover:bg-gray-700/30 rounded-xl border border-gray-600/30 p-3 sm:p-4 transition-all duration-200"
              :class="{ 'bg-green-900/20 border-green-700/30': isBillPaid(bill) }"
            >
              <div class="flex items-start sm:items-center justify-between">
                <div class="flex items-start space-x-3 sm:space-x-4">
                  <div 
                    class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-lg sm:text-xl shrink-0 cursor-pointer hover:bg-red-500/20 transition-colors"
                    :class="{ 'bg-green-500/10': isBillPaid(bill) }"
                    @click="selectBillFilterGroup(getCategoryGroup(bill.category))"
                    :title="'Filter by ' + getCategoryGroup(bill.category)"
                  >
                    {{ getCategoryEmoji(bill.category) }}
                  </div>
                  <div>
                    <h3 class="font-medium text-white text-base sm:text-lg flex items-center">
                      {{ bill.description }}
                      <span v-if="isBillPaid(bill)" class="ml-2 text-green-400" title="Paid">
                        ✓
                      </span>
                    </h3>
                    <div class="flex flex-wrap items-center gap-2 mt-1">
                      <span class="px-2 py-0.5 text-xs font-medium bg-gray-600/30 text-gray-300 rounded-full">
                        {{ bill.category }}
                      </span>
                      <span class="text-gray-500 hidden sm:inline">•</span>
                      <span class="text-sm text-gray-400 capitalize">{{ bill.frequency }}</span>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <p :class="['text-lg sm:text-xl font-medium', isBillPaid(bill) ? 'text-green-400' : 'text-red-400']">
                    {{ formatAmount(bill.amount) }}
                  </p>
                  <div class="flex items-center justify-end space-x-1 mt-2">
                    <button 
                      @click="editBill(bill)"
                      class="p-2 text-gray-400 hover:text-white hover:bg-gray-600/30 rounded-lg transition-colors"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button 
                      @click="deleteBill(bill.id)"
                      class="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="mt-3 sm:mt-4 flex flex-wrap items-center gap-3 text-sm">
                <div class="flex items-center space-x-2">
                  <CalendarIcon class="w-4 h-4 text-gray-400" />
                  <span class="text-gray-400">Due: {{ formatDate(bill.dueDate) }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <ClockIcon class="w-4 h-4 text-gray-400" />
                  <span class="text-gray-400 capitalize">{{ bill.frequency }}</span>
                </div>
                <div v-if="isBillPaid(bill)" class="flex items-center space-x-2">
                  <span class="text-green-400 text-xs font-medium">Paid</span>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="!bills.length" class="flex flex-col items-center justify-center py-8">
              <div class="w-16 h-16 rounded-full bg-gray-700/30 flex items-center justify-center mb-3">
                <DocumentTextIcon class="w-8 h-8 text-gray-500" />
              </div>
              <p class="text-gray-400">No recurring bills</p>
              <p class="text-sm text-gray-500 mt-1">Add your first bill to get started</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Bill Modal -->
      <div v-if="showAddBillModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
        <div class="bg-gray-800/90 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-start mb-4 sm:mb-6">
            <div>
              <h3 class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {{ editingBill ? 'Edit Bill' : 'Add New Bill' }}
              </h3>
              <p class="text-sm text-gray-400 mt-1">{{ editingBill ? 'Update your bill details' : 'Add a new recurring bill' }}</p>
            </div>
            <button 
              @click="showAddBillModal = false"
              class="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="saveBill" class="space-y-4 sm:space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Description</label>
              <input 
                v-model="billForm.description"
                type="text"
                class="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                placeholder="Enter bill description"
                required
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Category</label>
              <div class="relative">
                <div 
                  class="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 cursor-pointer flex items-center justify-between"
                  @click="showBillCategories = !showBillCategories"
                >
                  <span class="flex items-center space-x-2">
                    <span class="text-lg">{{ billForm.category ? getCategoryEmoji(billForm.category) : '📋' }}</span>
                    <span>{{ billForm.category || 'Select a category' }}</span>
                  </span>
                  <ChevronDownIcon 
                    class="w-4 h-4 text-gray-400 transition-transform duration-200"
                    :class="{ 'transform rotate-180': showBillCategories }"
                  />
                </div>
                <div 
                  v-if="showBillCategories"
                  class="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                >
                  <div class="sticky top-0 bg-gray-800 border-b border-gray-700 p-2">
                    <input 
                      v-model="billCategorySearch"
                      type="text"
                      class="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Search categories..."
                      @click.stop
                    >
                  </div>
                  <div 
                    v-if="billCategorySearch"
                    class="p-1"
                  >
                    <div 
                      v-for="category in filteredBillCategories" 
                      :key="category"
                      class="px-3 py-2 hover:bg-gray-700 cursor-pointer flex items-center space-x-2 rounded-lg"
                      @click="selectBillCategory(category)"
                    >
                      <span class="text-lg">{{ getCategoryEmoji(category) }}</span>
                      <span>{{ category }}</span>
                    </div>
                  </div>
                  <div 
                    v-else
                    class="p-1"
                  >
                    <div 
                      v-for="(group, title) in groupedBillCategories" 
                      :key="title"
                      class="mb-2"
                    >
                      <div class="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-700/50 rounded-lg">
                        {{ title }}
                      </div>
                      <div 
                        v-for="category in group" 
                        :key="category"
                        class="px-3 py-2 hover:bg-gray-700 cursor-pointer flex items-center space-x-2 rounded-lg"
                        @click="selectBillCategory(category)"
                      >
                        <span class="text-lg">{{ getCategoryEmoji(category) }}</span>
                        <span>{{ category }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Amount</label>
              <div class="relative">
                <span class="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                <input 
                  v-model="billForm.amount"
                  type="number"
                  inputmode="decimal"
                  step="0.01"
                  class="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                  placeholder="0.00"
                  required
                >
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Due Date</label>
              <input 
                v-model="billForm.dueDate"
                type="date"
                class="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                required
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Frequency</label>
              <select 
                v-model="billForm.frequency"
                class="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
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
                @click="showAddBillModal = false"
                class="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                class="flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                {{ editingBill ? 'Save Changes' : 'Add Bill' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Add/Edit Income Modal -->
      <div v-if="showAddIncomeModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <div class="bg-gray-800 rounded-xl border border-gray-700/50 p-6 w-full max-w-md">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-white">
              {{ editingIncome ? 'Edit Income' : 'Add New Income' }}
            </h3>
            <button 
              @click="showAddIncomeModal = false"
              class="text-gray-400 hover:text-gray-300"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="saveIncome" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <input 
                v-model="incomeForm.description"
                type="text"
                class="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                required
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <div class="relative">
                <div 
                  class="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 cursor-pointer flex items-center justify-between"
                  @click="showIncomeCategories = !showIncomeCategories"
                >
                  <span class="flex items-center space-x-2">
                    <span class="text-lg">{{ incomeForm.category ? getCategoryEmoji(incomeForm.category) : '📋' }}</span>
                    <span>{{ incomeForm.category || 'Select a category' }}</span>
                  </span>
                  <ChevronDownIcon 
                    class="w-4 h-4 text-gray-400 transition-transform duration-200"
                    :class="{ 'transform rotate-180': showIncomeCategories }"
                  />
                </div>
                <div 
                  v-if="showIncomeCategories"
                  class="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  <div class="sticky top-0 bg-gray-800 border-b border-gray-700 p-2">
                    <input 
                      v-model="incomeCategorySearch"
                      type="text"
                      class="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      placeholder="Search categories..."
                      @click.stop
                    >
                  </div>
                  <div 
                    v-if="incomeCategorySearch"
                    class="p-1"
                  >
                    <div 
                      v-for="category in filteredIncomeCategories" 
                      :key="category"
                      class="px-3 py-2 hover:bg-gray-700 cursor-pointer flex items-center space-x-2 rounded-lg"
                      @click="selectIncomeCategory(category)"
                    >
                      <span class="text-lg">{{ getCategoryEmoji(category) }}</span>
                      <span>{{ category }}</span>
                    </div>
                  </div>
                  <div 
                    v-else
                    class="p-1"
                  >
                    <div 
                      v-for="(group, title) in groupedIncomeCategories" 
                      :key="title"
                      class="mb-2"
                    >
                      <div class="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-700/50 rounded-lg">
                        {{ title }}
                      </div>
                      <div 
                        v-for="category in group" 
                        :key="category"
                        class="px-3 py-2 hover:bg-gray-700 cursor-pointer flex items-center space-x-2 rounded-lg"
                        @click="selectIncomeCategory(category)"
                      >
                        <span class="text-lg">{{ getCategoryEmoji(category) }}</span>
                        <span>{{ category }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Amount</label>
              <input 
                v-model="incomeForm.amount"
                type="number"
                step="0.01"
                class="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                required
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
              <input 
                v-model="incomeForm.dueDate"
                type="date"
                class="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                required
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Frequency</label>
              <select 
                v-model="incomeForm.frequency"
                class="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                required
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-Weekly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div class="flex justify-end space-x-3 mt-6">
              <button 
                type="button"
                @click="showAddIncomeModal = false"
                class="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                class="px-4 py-2 text-sm bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
              >
                {{ editingIncome ? 'Update' : 'Add' }} Income
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  ArrowDownIcon, 
  ArrowUpIcon,
  CalendarIcon, 
  ClockIcon, 
  PencilIcon, 
  TrashIcon,
  XMarkIcon,
  PlusIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'
import { 
  getBills, 
  getIncomes, 
  addBill, 
  addIncome, 
  updateBill, 
  updateIncome, 
  deleteBill, 
  deleteIncome,
  getTransactions
} from '../services/database'
import { notificationService } from '../services/notificationService'

export default {
  name: 'BillsView',
  components: {
    ArrowDownIcon,
    ArrowUpIcon,
    CalendarIcon,
    ClockIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    PlusIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    ChevronDownIcon,
    ArrowPathIcon
  },
  data() {
    return {
      showAddBillModal: false,
      showAddIncomeModal: false,
      showIncome: true,
      showBills: true,
      editingBill: null,
      editingIncome: null,
      billForm: {
        description: '',
        category: '',
        amount: '',
        dueDate: '',
        frequency: 'monthly'
      },
      incomeForm: {
        description: '',
        category: '',
        amount: '',
        dueDate: '',
        frequency: 'monthly'
      },
      transactions: [],
      categories: [
        // Housing & Living
        'Rent/Mortgage',
        'Property Tax',
        'Home Insurance',
        'Home Maintenance',
        'Furniture',
        'Appliances',
        'Home Improvement',
        
        // Utilities
        'Electricity',
        'Water',
        'Gas',
        'Internet',
        'Phone',
        'Cable/Satellite',
        
        // Insurance
        'Health Insurance',
        'Dental Insurance',
        'Vision Insurance',
        'Life Insurance',
        'Auto Insurance',
        'Disability Insurance',
        
        // Transportation
        'Car Payment',
        'Car Maintenance',
        'Gas/Fuel',
        'Public Transit',
        'Parking',
        'Tolls',
        
        // Healthcare
        'Doctor Visits',
        'Prescriptions',
        'Medical Supplies',
        'Dental Care',
        'Vision Care',
        'Mental Health',
        
        // Food & Dining
        'Groceries',
        'Restaurants',
        'Takeout',
        'Coffee Shops',
        'Food Delivery',
        'Snacks',
        
        // Shopping & Personal
        'Clothing',
        'Shoes',
        'Personal Care',
        'Hair Care',
        'Cosmetics',
        'Gym Membership',
        
        // Entertainment
        'Streaming Services',
        'Gaming',
        'Movies',
        'Concerts',
        'Hobbies',
        'Sports',
        'Subscriptions',
        
        // Education
        'Tuition',
        'Books',
        'School Supplies',
        'Student Loans',
        'Online Courses',
        'Professional Development',
        
        // Financial
        'Credit Cards',
        'Bank Fees',
        'Investment Fees',
        'Tax Preparation',
        'Financial Planning',
        
        // Pets
        'Pet Food',
        'Veterinary',
        'Pet Supplies',
        'Pet Insurance',
        'Pet Grooming',
        
        // Gifts & Donations
        'Gifts',
        'Charitable Donations',
        'Wedding Gifts',
        'Birthday Gifts',
        
        // Travel
        'Flights',
        'Hotels',
        'Vacation',
        'Travel Insurance',
        'Travel Supplies',

        // Technology
        'Software Licenses',
        'Cloud Services',
        'Domain Names',
        'Hosting',
        'VPN Services',
        'Antivirus',
        'Backup Services',
        'Development Tools',
        'API Services',
        'Analytics Tools',
        'Project Management',
        'Communication Tools',
        'Design Software',
        'Testing Services',
        'Security Services',
        
        // Business
        'Office Rent',
        'Office Supplies',
        'Business Insurance',
        'Professional Services',
        'Legal Services',
        'Accounting Services',
        'Marketing',
        'Advertising',
        'Business Travel',
        'Client Entertainment',
        'Business Equipment',
        'Business Software',
        'Business Phone',
        'Business Internet',
        'Business Utilities',
        'Business Taxes',
        'Business Licenses',
        'Business Registration',
        'Business Banking',
        'Business Credit Cards',
        'Business Loans',
        'Business Consulting',
        'Business Training',
        'Business Memberships',
        'Business Subscriptions',
        'Business Maintenance',
        'Business Repairs',
        'Business Upgrades',
        'Business Security',
        'Business Compliance',
        
        // Other
        'Legal Fees',
        'Moving Expenses',
        'Storage',
        'Memberships',
        'Other'
      ],
      incomeCategories: [
        // Employment
        'Salary',
        'Hourly Wage',
        'Overtime',
        'Bonuses',
        'Commission',
        'Tips',
        
        // Self-Employment
        'Freelance',
        'Consulting',
        'Contract Work',
        'Business Income',
        'Side Hustle',
        
        // Investments
        'Stock Dividends',
        'Interest Income',
        'Capital Gains',
        'Rental Income',
        'Royalties',
        'Cryptocurrency',
        
        // Benefits
        'Social Security',
        'Pension',
        'Disability',
        'Unemployment',
        'Child Support',
        'Alimony',
        
        // Other
        'Gifts',
        'Inheritance',
        'Lottery/Winnings',
        'Selling Items',
        'Other'
      ],
      bills: [],
      incomes: [],
      billFilters: {
        category: '',
        frequency: '',
        sort: 'date',
        inverseCategory: false,
        inverseFrequency: false,
        selectedGroup: null
      },
      incomeFilters: {
        category: '',
        frequency: '',
        sort: 'date',
        inverseCategory: false,
        inverseFrequency: false,
        selectedGroup: null
      },
      showIncomeFilters: true,
      showBillFilters: true,
      billCategorySearch: '',
      incomeCategorySearch: '',
      groupedBillCategories: {
        'Housing & Living': [
          'Rent/Mortgage',
          'Property Tax',
          'Home Insurance',
          'Home Maintenance',
          'Furniture',
          'Appliances',
          'Home Improvement'
        ],
        'Utilities': [
          'Electricity',
          'Water',
          'Gas',
          'Internet',
          'Phone',
          'Cable/Satellite'
        ],
        'Insurance': [
          'Health Insurance',
          'Dental Insurance',
          'Vision Insurance',
          'Life Insurance',
          'Auto Insurance',
          'Disability Insurance'
        ],
        'Transportation': [
          'Car Payment',
          'Car Maintenance',
          'Gas/Fuel',
          'Public Transit',
          'Parking',
          'Tolls'
        ],
        'Healthcare': [
          'Doctor Visits',
          'Prescriptions',
          'Medical Supplies',
          'Dental Care',
          'Vision Care',
          'Mental Health'
        ],
        'Food & Dining': [
          'Groceries',
          'Restaurants',
          'Takeout',
          'Coffee Shops',
          'Food Delivery',
          'Snacks'
        ],
        'Shopping & Personal': [
          'Clothing',
          'Shoes',
          'Personal Care',
          'Hair Care',
          'Cosmetics',
          'Gym Membership'
        ],
        'Entertainment': [
          'Streaming Services',
          'Gaming',
          'Movies',
          'Concerts',
          'Hobbies',
          'Sports',
          'Subscriptions'
        ],
        'Education': [
          'Tuition',
          'Books',
          'School Supplies',
          'Student Loans',
          'Online Courses',
          'Professional Development'
        ],
        'Financial': [
          'Credit Cards',
          'Bank Fees',
          'Investment Fees',
          'Tax Preparation',
          'Financial Planning'
        ],
        'Pets': [
          'Pet Food',
          'Veterinary',
          'Pet Supplies',
          'Pet Insurance',
          'Pet Grooming'
        ],
        'Gifts & Donations': [
          'Gifts',
          'Charitable Donations',
          'Wedding Gifts',
          'Birthday Gifts'
        ],
        'Travel': [
          'Flights',
          'Hotels',
          'Vacation',
          'Travel Insurance',
          'Travel Supplies'
        ],
        'Technology': [
          'Software Licenses',
          'Cloud Services',
          'Domain Names',
          'Hosting',
          'VPN Services',
          'Antivirus',
          'Backup Services',
          'Development Tools',
          'API Services',
          'Analytics Tools',
          'Project Management',
          'Communication Tools',
          'Design Software',
          'Testing Services',
          'Security Services'
        ],
        'Business': [
          'Office Rent',
          'Office Supplies',
          'Business Insurance',
          'Professional Services',
          'Legal Services',
          'Accounting Services',
          'Marketing',
          'Advertising',
          'Business Travel',
          'Client Entertainment',
          'Business Equipment',
          'Business Software',
          'Business Phone',
          'Business Internet',
          'Business Utilities',
          'Business Taxes',
          'Business Licenses',
          'Business Registration',
          'Business Banking',
          'Business Credit Cards',
          'Business Loans',
          'Business Consulting',
          'Business Training',
          'Business Memberships',
          'Business Subscriptions',
          'Business Maintenance',
          'Business Repairs',
          'Business Upgrades',
          'Business Security',
          'Business Compliance'
        ],
        'Other': [
          'Legal Fees',
          'Moving Expenses',
          'Storage',
          'Memberships',
          'Other'
        ]
      },
      groupedIncomeCategories: {
        'Employment': [
          'Salary',
          'Hourly Wage',
          'Overtime',
          'Bonuses',
          'Commission',
          'Tips'
        ],
        'Self-Employment': [
          'Freelance',
          'Consulting',
          'Contract Work',
          'Business Income',
          'Side Hustle'
        ],
        'Investments': [
          'Stock Dividends',
          'Interest Income',
          'Capital Gains',
          'Rental Income',
          'Royalties',
          'Cryptocurrency'
        ],
        'Benefits': [
          'Social Security',
          'Pension',
          'Disability',
          'Unemployment',
          'Child Support',
          'Alimony'
        ],
        'Other': [
          'Gifts',
          'Inheritance',
          'Lottery/Winnings',
          'Selling Items',
          'Other'
        ]
      },
      showBillCategories: false,
      showIncomeCategories: false,
      showBillCategoryFilter: false,
      showIncomeCategoryFilter: false,
      billCategoryFilterSearch: '',
      incomeCategoryFilterSearch: ''
    }
  },
  computed: {
    totalMonthlyIncome() {
      return this.incomes.reduce((total, income) => {
        const amount = Number(income.amount) || 0
        // For recurring incomes, add their amounts
        if (income.frequency === 'monthly') {
          return total + amount
        } else if (income.frequency === 'weekly') {
          return total + (amount * 4.33) // Average weeks in a month
        } else if (income.frequency === 'bi-weekly') {
          return total + (amount * 2.165) // Average bi-weekly in a month
        } else if (income.frequency === 'quarterly') {
          return total + (amount / 3) // Monthly portion of quarterly
        } else if (income.frequency === 'yearly') {
          return total + (amount / 12) // Monthly portion of yearly
        }
        return total
      }, 0)
    },
    totalMonthlyBills() {
      return this.bills.reduce((total, bill) => {
        const amount = Number(bill.amount) || 0
        // For recurring bills, add their amounts
        if (bill.frequency === 'monthly') {
          return total + amount
        } else if (bill.frequency === 'weekly') {
          return total + (amount * 4.33) // Average weeks in a month
        } else if (bill.frequency === 'bi-weekly') {
          return total + (amount * 2.165) // Average bi-weekly in a month
        } else if (bill.frequency === 'quarterly') {
          return total + (amount / 3) // Monthly portion of quarterly
        } else if (bill.frequency === 'yearly') {
          return total + (amount / 12) // Monthly portion of yearly
        }
        return total
      }, 0)
    },
    filteredIncomes() {
      let filtered = [...this.incomes]
      
      // Apply category filter
      if (this.incomeFilters.category) {
        filtered = filtered.filter(income => 
          this.incomeFilters.inverseCategory 
            ? income.category !== this.incomeFilters.category
            : income.category === this.incomeFilters.category
        )
      } else if (this.incomeFilters.selectedGroup) {
        const groupCategories = this.groupedIncomeCategories[this.incomeFilters.selectedGroup]
        filtered = filtered.filter(income => 
          this.incomeFilters.inverseCategory
            ? !groupCategories.includes(income.category)
            : groupCategories.includes(income.category)
        )
      }
      
      // Apply frequency filter
      if (this.incomeFilters.frequency) {
        filtered = filtered.filter(income => 
          this.incomeFilters.inverseFrequency
            ? income.frequency !== this.incomeFilters.frequency
            : income.frequency === this.incomeFilters.frequency
        )
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        switch (this.incomeFilters.sort) {
          case 'amount':
            return Number(b.amount) - Number(a.amount)
          case 'description':
            return a.description.localeCompare(b.description)
          case 'date':
          default:
            return new Date(a.dueDate) - new Date(b.dueDate)
        }
      })
      
      return filtered
    },
    
    filteredBills() {
      let filtered = [...this.bills]
      
      // Apply category filter
      if (this.billFilters.category) {
        filtered = filtered.filter(bill => 
          this.billFilters.inverseCategory
            ? bill.category !== this.billFilters.category
            : bill.category === this.billFilters.category
        )
      } else if (this.billFilters.selectedGroup) {
        const groupCategories = this.groupedBillCategories[this.billFilters.selectedGroup]
        filtered = filtered.filter(bill => 
          this.billFilters.inverseCategory
            ? !groupCategories.includes(bill.category)
            : groupCategories.includes(bill.category)
        )
      }
      
      // Apply frequency filter
      if (this.billFilters.frequency) {
        filtered = filtered.filter(bill => 
          this.billFilters.inverseFrequency
            ? bill.frequency !== this.billFilters.frequency
            : bill.frequency === this.billFilters.frequency
        )
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        switch (this.billFilters.sort) {
          case 'amount':
            return Number(b.amount) - Number(a.amount)
          case 'description':
            return a.description.localeCompare(b.description)
          case 'date':
          default:
            return new Date(a.dueDate) - new Date(b.dueDate)
        }
      })
      
      return filtered
    },
    filteredMonthlyIncome() {
      return this.filteredIncomes.reduce((total, income) => {
        const amount = Number(income.amount) || 0
        // For recurring incomes, add their amounts
        if (income.frequency === 'monthly') {
          return total + amount
        } else if (income.frequency === 'weekly') {
          return total + (amount * 4.33) // Average weeks in a month
        } else if (income.frequency === 'bi-weekly') {
          return total + (amount * 2.165) // Average bi-weekly in a month
        } else if (income.frequency === 'quarterly') {
          return total + (amount / 3) // Monthly portion of quarterly
        } else if (income.frequency === 'yearly') {
          return total + (amount / 12) // Monthly portion of yearly
        }
        return total
      }, 0)
    },
    filteredMonthlyBills() {
      return this.filteredBills.reduce((total, bill) => {
        const amount = Number(bill.amount) || 0
        // For recurring bills, add their amounts
        if (bill.frequency === 'monthly') {
          return total + amount
        } else if (bill.frequency === 'weekly') {
          return total + (amount * 4.33) // Average weeks in a month
        } else if (bill.frequency === 'bi-weekly') {
          return total + (amount * 2.165) // Average bi-weekly in a month
        } else if (bill.frequency === 'quarterly') {
          return total + (amount / 3) // Monthly portion of quarterly
        } else if (bill.frequency === 'yearly') {
          return total + (amount / 12) // Monthly portion of yearly
        }
        return total
      }, 0)
    },
    filteredBillCategories() {
      if (!this.billCategorySearch) return []
      const search = this.billCategorySearch.toLowerCase()
      return this.categories.filter(category => 
        category.toLowerCase().includes(search)
      )
    },
    filteredIncomeCategories() {
      if (!this.incomeCategorySearch) return []
      const search = this.incomeCategorySearch.toLowerCase()
      return this.incomeCategories.filter(category => 
        category.toLowerCase().includes(search)
      )
    }
  },
  async created() {
    await this.loadData()
  },
  mounted() {
    // Add click outside listener
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    // Remove click outside listener
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    async loadData() {
      try {
        const [billsData, incomesData, transactionsData] = await Promise.all([
          getBills(),
          getIncomes(),
          getTransactions()
        ])
        this.bills = billsData
        this.incomes = incomesData
        this.transactions = transactionsData
      } catch (error) {
        console.error('Error loading data:', error)
        alert('Failed to load data. Please try again.')
      }
    },
    editBill(bill) {
      this.editingBill = bill
      this.billForm = { 
        ...bill,
        dueDate: bill.dueDate.split('T')[0] // Format date to YYYY-MM-DD
      }
      this.showAddBillModal = true
    },
    editIncome(income) {
      this.editingIncome = income
      this.incomeForm = { 
        ...income,
        dueDate: income.dueDate.split('T')[0] // Format date to YYYY-MM-DD
      }
      this.showAddIncomeModal = true
    },
    async deleteBill(id) {
      if (confirm('Are you sure you want to delete this bill?')) {
        try {
          await deleteBill(id)
          this.bills = this.bills.filter(bill => bill.id !== id)
        } catch (error) {
          console.error('Error deleting bill:', error)
          alert('Failed to delete bill. Please try again.')
        }
      }
    },
    async deleteIncome(id) {
      if (confirm('Are you sure you want to delete this income?')) {
        try {
          await deleteIncome(id)
          this.incomes = this.incomes.filter(income => income.id !== id)
        } catch (error) {
          console.error('Error deleting income:', error)
          alert('Failed to delete income. Please try again.')
        }
      }
    },
    async saveBill() {
      try {
        let bill;
        if (this.editingBill) {
          await updateBill(this.editingBill.id, this.billForm)
          bill = { ...this.editingBill, ...this.billForm }
        } else {
          bill = await addBill(this.billForm)
        }
        // Schedule a reminder for new or updated bill
        await notificationService.scheduleBillReminder(bill)
        
        this.showAddBillModal = false
        this.resetBillForm()
        await this.loadData()
      } catch (error) {
        console.error('Error saving bill:', error)
        alert('Failed to save bill. Please try again.')
      }
    },
    async saveIncome() {
      try {
        let income;
        if (this.editingIncome) {
          // Update existing income
          await updateIncome(this.editingIncome.id, this.incomeForm)
          income = { ...this.editingIncome, ...this.incomeForm }
          const index = this.incomes.findIndex(inc => inc.id === this.editingIncome.id)
          if (index !== -1) {
            this.incomes[index] = income
          }
        } else {
          // Add new income
          const id = await addIncome(this.incomeForm)
          income = { id, ...this.incomeForm }
          this.incomes.push(income)
        }

        // Schedule income notification
        await notificationService.scheduleIncomeAlert(income)
        
        this.showAddIncomeModal = false
        this.resetIncomeForm()
      } catch (error) {
        console.error('Error saving income:', error)
        alert('Failed to save income. Please try again.')
      }
    },
    resetBillForm() {
      this.editingBill = null
      this.billForm = {
        description: '',
        category: '',
        amount: '',
        dueDate: '',
        frequency: 'monthly'
      }
    },
    resetIncomeForm() {
      this.editingIncome = null
      this.incomeForm = {
        description: '',
        category: '',
        amount: '',
        dueDate: '',
        frequency: 'monthly'
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
        'Birthday Gifts': '🎉',
        
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
      return emojis[category] || '📋'
    },
    formatAmount(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount)
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    },
    selectBillCategory(category) {
      this.billForm.category = category
      this.billCategorySearch = ''
      this.showBillCategories = false
    },
    selectIncomeCategory(category) {
      this.incomeForm.category = category
      this.incomeCategorySearch = ''
      this.showIncomeCategories = false
    },
    selectBillFilterGroup(group) {
      if (this.billFilters.selectedGroup === group) {
        this.billFilters.selectedGroup = null
      } else {
        this.billFilters.selectedGroup = group
      }
    },
    selectIncomeFilterGroup(group) {
      if (this.incomeFilters.selectedGroup === group) {
        this.incomeFilters.selectedGroup = null
      } else {
        this.incomeFilters.selectedGroup = group
      }
    },
    selectBillFilterCategory(category) {
      // If clicking the same category, clear the filter
      if (this.billFilters.category === category) {
        this.billFilters.category = ''
        this.billFilters.selectedGroup = null
        this.billCategoryFilterSearch = ''
        this.showBillCategoryFilter = false
        return
      }
      
      // Otherwise, set the new category filter
      this.billFilters.category = category
      this.billFilters.selectedGroup = null
      this.billCategoryFilterSearch = ''
      this.showBillCategoryFilter = false
    },
    selectIncomeFilterCategory(category) {
      // If clicking the same category, clear the filter
      if (this.incomeFilters.category === category) {
        this.incomeFilters.category = ''
        this.incomeFilters.selectedGroup = null
        this.incomeCategoryFilterSearch = ''
        this.showIncomeCategoryFilter = false
        return
      }
      
      // Otherwise, set the new category filter
      this.incomeFilters.category = category
      this.incomeFilters.selectedGroup = null
      this.incomeCategoryFilterSearch = ''
      this.showIncomeCategoryFilter = false
    },
    handleClickOutside(event) {
      // Close all dropdowns if clicking outside
      if (!event.target.closest('.relative')) {
        this.showBillCategories = false
        this.showIncomeCategories = false
        this.showBillCategoryFilter = false
        this.showIncomeCategoryFilter = false
      }
    },
    getCategoryGroup(category) {
      // Find which group contains this category
      for (const [group, categories] of Object.entries(this.groupedBillCategories)) {
        if (categories.includes(category)) {
          return group
        }
      }
      for (const [group, categories] of Object.entries(this.groupedIncomeCategories)) {
        if (categories.includes(category)) {
          return group
        }
      }
      return null
    },
    isBillPaid(bill) {
      // Get current month and year
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      
      // Find all transactions for this bill in the current month
      const matchingTransactions = this.transactions.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear &&
               t.type === 'expense' &&
               t.description.toLowerCase().includes(bill.description.toLowerCase()) &&
               t.category === bill.category
      })
      
      // Calculate total amount paid for this bill
      const totalPaid = matchingTransactions.reduce((sum, t) => sum + Number(t.amount), 0)
      
      // Bill is considered paid if the total paid amount is at least the bill amount
      return totalPaid >= Number(bill.amount)
    }
  }
}
</script> 