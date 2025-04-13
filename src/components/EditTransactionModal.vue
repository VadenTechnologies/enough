/* eslint-disable */
<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-gray-800/90 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6 w-full max-w-md">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            {{ isEditing ? 'Edit Transaction' : 'Add Transaction' }}
          </h2>
          <p class="text-sm text-gray-400 mt-1">{{ isEditing ? 'Update transaction details' : 'Add a new transaction' }}</p>
        </div>
        <button 
          @click="closeModal" 
          class="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Summary View -->
        <div v-if="form.isOverpayment" class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
            <div>
              <p class="text-sm text-gray-400">Type</p>
              <p class="font-medium text-white">{{ form.type === 'expense' ? 'Expense' : 'Income' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-400">Amount</p>
              <p :class="['font-medium', form.type === 'expense' ? 'text-red-400' : 'text-green-400']">
                ${{ form.amount || '0.00' }}
              </p>
            </div>
          </div>
          <div class="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
            <div>
              <p class="text-sm text-gray-400">Category</p>
              <p class="font-medium text-white">{{ form.category || 'Uncategorized' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-400">Date</p>
              <p class="font-medium text-white">{{ form.date }}</p>
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
                @click="form.type = 'expense'"
                class="flex items-center justify-center space-x-2 p-4 rounded-xl border-2 transition-all duration-200"
                :class="[
                  form.type === 'expense'
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-gray-700/50 border-gray-600/50 text-gray-400 hover:bg-gray-700/70'
                ]"
              >
                <ArrowDownIcon class="w-5 h-5" />
                <span>Expense</span>
              </button>
              <button
                type="button"
                @click="form.type = 'income'"
                class="flex items-center justify-center space-x-2 p-4 rounded-xl border-2 transition-all duration-200"
                :class="[
                  form.type === 'income'
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
              v-model="form.description"
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
                v-model="form.amount"
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
              <input
                type="text"
                v-model="categorySearch"
                @focus="showCategoryDropdown = true"
                placeholder="Search or select category..."
                class="w-full px-4 py-2.5 bg-gray-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors duration-200"
                required
              >
              <!-- Category Dropdown -->
              <div 
                v-if="showCategoryDropdown"
                class="absolute z-10 w-full mt-1 bg-gray-800 rounded-xl shadow-lg border border-gray-700/50 max-h-60 overflow-y-auto"
              >
                <div 
                  v-for="category in filteredCategories" 
                  :key="category"
                  @click="selectCategory(category)"
                  class="px-4 py-2.5 text-sm text-white hover:bg-gray-700/50 cursor-pointer transition-colors duration-200"
                  :class="{ 'bg-gray-700/50': form.category === category }"
                >
                  {{ category }}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Date</label>
            <input 
              v-model="form.date"
              type="date"
              class="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
              required
            >
          </div>
        </template>

        <!-- Overpayment Section -->
        <div v-if="form.type === 'expense'" class="space-y-4">
          <div class="flex items-center space-x-2">
            <input 
              type="checkbox"
              v-model="form.isOverpayment"
              class="w-4 h-4 rounded border-gray-600/50 bg-gray-700/50 text-blue-500 focus:ring-blue-500/50"
            >
            <label class="text-sm font-medium text-gray-300">This is an overpayment</label>
          </div>

          <div v-if="form.isOverpayment" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Original Budget Amount</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                <input 
                  v-model="form.originalBudget"
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
              <div class="space-y-2">
                <div v-for="(adjustment, index) in form.adjustments" :key="index" class="flex items-center space-x-2">
                  <select 
                    v-model="adjustment.type"
                    class="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                  >
                    <option value="category">Category</option>
                    <option value="bill">Bill</option>
                  </select>
                  <select 
                    v-model="adjustment.target"
                    class="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                  >
                    <option value="" disabled>Select target</option>
                    <option v-if="adjustment.type === 'category'" v-for="category in categories" :key="category" :value="category">
                      {{ category }}
                    </option>
                    <option v-if="adjustment.type === 'bill'" v-for="bill in bills" :key="bill.id" :value="bill.id">
                      {{ bill.description }}
                    </option>
                  </select>
                  <div class="relative w-32">
                    <span class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                    <input 
                      v-model="adjustment.amount"
                      type="number"
                      step="0.01"
                      class="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl pl-6 pr-2 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                      placeholder="0.00"
                      required
                    >
                  </div>
                  <button 
                    type="button"
                    @click="removeAdjustment(index)"
                    class="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <XMarkIcon class="w-4 h-4" />
                  </button>
                </div>
                <button 
                  type="button"
                  @click="addAdjustment"
                  class="w-full flex items-center justify-center space-x-2 p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                >
                  <PlusIcon class="w-4 h-4" />
                  <span>Add Adjustment</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3 pt-2">
          <button 
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            class="px-6 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            {{ isEditing ? 'Update' : 'Add' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { 
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'EditTransactionModal',
  components: {
    XMarkIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    PlusIcon
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    transaction: {
      type: Object,
      default: null
    },
    categories: {
      type: Array,
      required: true
    },
    bills: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'save'],
  data() {
    return {
      form: {
        description: '',
        amount: '',
        category: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        isRecurring: false,
        frequency: 'monthly',
        nextDueDate: '',
        isOverpayment: false,
        originalBudget: '',
        adjustments: []
      },
      categorySearch: '',
      showCategoryDropdown: false
    }
  },
  computed: {
    isEditing() {
      return !!this.transaction
    },
    filteredCategories() {
      if (!this.categorySearch) return this.categories
      const search = this.categorySearch.toLowerCase()
      return this.categories.filter(category => 
        category.toLowerCase().includes(search)
      )
    }
  },
  watch: {
    transaction: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.form = { ...newVal }
          this.categorySearch = newVal.category || ''
        } else {
          this.resetForm()
        }
      }
    }
  },
  methods: {
    closeModal() {
      this.$emit('update:modelValue', false)
      this.resetForm()
    },
    handleSubmit() {
      this.$emit('save', {
        ...this.form,
        amount: Number(this.form.amount)
      })
      this.closeModal()
    },
    resetForm() {
      this.form = {
        description: '',
        amount: '',
        category: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        isRecurring: false,
        frequency: 'monthly',
        nextDueDate: '',
        isOverpayment: false,
        originalBudget: '',
        adjustments: []
      }
      this.categorySearch = ''
    },
    selectCategory(category) {
      this.form.category = category
      this.categorySearch = category
      this.showCategoryDropdown = false
    },
    addAdjustment() {
      this.form.adjustments.push({
        type: 'category',
        target: '',
        amount: ''
      })
    },
    removeAdjustment(index) {
      this.form.adjustments.splice(index, 1)
    }
  }
}
</script> 