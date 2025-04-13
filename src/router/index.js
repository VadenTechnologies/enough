import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import CalendarView from '../views/CalendarView.vue'
import TransactionLogView from '../views/TransactionLogView.vue'
import SettingsView from '../views/SettingsView.vue'
import BillsView from '../views/BillsView.vue'

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: CalendarView
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: TransactionLogView,
      props: true
    },
    {
      path: '/bills',
      name: 'bills',
      component: BillsView
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    }
  ]
})

export default router
