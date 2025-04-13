import { LocalNotifications } from '@capacitor/local-notifications';
import { format, addDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { Capacitor } from '@capacitor/core';
import { initializeDatabase, onDatabaseEvent } from './database';

class NotificationService {
  constructor() {
    // Don't initialize immediately to avoid circular dependency
    setTimeout(() => this.initialize(), 0);
  }

  setupEventListeners() {
    try {
      // Check if onDatabaseEvent is available
      if (typeof onDatabaseEvent === 'function') {
        onDatabaseEvent('billAdded', (bill) => this.scheduleBillReminder(bill));
        onDatabaseEvent('billUpdated', (bill) => this.scheduleBillReminder(bill));
        onDatabaseEvent('incomeAdded', (income) => this.scheduleIncomeAlert(income));
        onDatabaseEvent('incomeUpdated', (income) => this.scheduleIncomeAlert(income));
      } else {
        console.warn('Database event system not available. Notifications may not update automatically.');
      }
    } catch (error) {
      console.error('Error setting up event listeners:', error);
    }
  }

  async initialize() {
    try {
      console.log('Initializing notification service...');
      
      // Set up event listeners first
      this.setupEventListeners();
      
      // Check if we're on Android
      if (Capacitor.getPlatform() === 'android') {
        // Request Android 13+ notification permission
        const permissionStatus = await LocalNotifications.checkPermissions();
        console.log('Notification permission status:', permissionStatus);
        
        if (permissionStatus.display !== 'granted') {
          const request = await LocalNotifications.requestPermissions();
          console.log('Permission request result:', request);
          
          if (request.display !== 'granted') {
            console.warn('Notification permissions not granted. Some features may be limited.');
            return;
          }
        }
      }

      // Get all existing bills and schedule their notifications
      try {
        // Initialize database first
        await initializeDatabase();
        
        // Now we can safely access the database
        const db = await initializeDatabase();
        const store = db.transaction('bills', 'readonly').objectStore('bills');
        const request = store.getAll();
        
        request.onsuccess = async () => {
          const bills = request.result;
          console.log('Found existing bills:', bills.length);
          
          // Get all pending notifications
          const pendingNotifications = await LocalNotifications.getPending();
          const pendingIds = pendingNotifications.notifications.map(n => n.id);
          
          // Schedule notifications for bills that don't have one
          for (const bill of bills) {
            const expectedNotificationId = 1000 + parseInt(bill.id);
            if (!pendingIds.includes(expectedNotificationId)) {
              console.log('Scheduling missing notification for bill:', bill.description);
              await this.scheduleBillReminder(bill);
            }
          }
        };
        
        request.onerror = (error) => {
          console.error('Error getting existing bills:', error);
        };
      } catch (error) {
        console.error('Error checking existing bills:', error);
      }

      // Schedule initial notifications
      await this.scheduleRoutineNotifications();
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  async scheduleRoutineNotifications() {
    try {
      // Clear any existing scheduled notifications
      await this.cancel();

      // Schedule daily check-in (default: 9 AM)
      await this.scheduleDailyCheckIn();

      // Schedule weekly budget review (Sunday at 6 PM)
      await this.scheduleWeeklyReview();

      // Schedule end of month wrap-up
      await this.scheduleMonthlyWrapUp();
    } catch (error) {
      console.error('Error scheduling routine notifications:', error);
    }
  }

  async scheduleDailyCheckIn(hour = 9, minute = 0) {
    const now = new Date();
    const scheduleTime = new Date(now);
    scheduleTime.setHours(hour, minute, 0);

    if (scheduleTime <= now) {
      scheduleTime.setDate(scheduleTime.getDate() + 1);
    }

    await LocalNotifications.schedule({
      notifications: [{
        id: 1,
        title: 'Daily Check-in',
        body: "Let's close the loop on today. Your budget deserves the truth.",
        schedule: { at: scheduleTime, repeating: true },
        sound: null,
        actionTypeId: 'DAILY_CHECKIN'
      }]
    });
  }

  async scheduleWeeklyReview() {
    const now = new Date();
    const nextSunday = startOfWeek(addDays(now, 7), { weekStartsOn: 0 });
    nextSunday.setHours(18, 0, 0); // 6 PM

    await LocalNotifications.schedule({
      notifications: [{
        id: 2,
        title: 'Weekly Budget Review',
        body: 'Want to plan for the week ahead? Let\'s take 5 minutes.',
        schedule: { at: nextSunday, repeating: true },
        sound: null,
        actionTypeId: 'WEEKLY_REVIEW'
      }]
    });
  }

  async scheduleMonthlyWrapUp() {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 20, 0, 0); // 8 PM

    await LocalNotifications.schedule({
      notifications: [{
        id: 3,
        title: 'Monthly Wrap-Up',
        body: 'Here\'s where your money went. Ready to reset?',
        schedule: { at: lastDay, repeating: true },
        sound: null,
        actionTypeId: 'MONTHLY_WRAPUP'
      }]
    });
  }

  async scheduleBillReminder(bill) {
    const dueDate = new Date(bill.dueDate);
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - 2); // 2 days before
    reminderDate.setHours(10, 0, 0); // 10 AM

    if (reminderDate <= new Date()) return;

    await LocalNotifications.schedule({
      notifications: [{
        id: 1000 + parseInt(bill.id), // Unique ID for each bill
        title: 'Upcoming Bill Reminder',
        body: `Heads up: ${bill.description} is due in 2 days. You've got this.`,
        schedule: { at: reminderDate },
        sound: null,
        actionTypeId: 'BILL_REMINDER'
      }]
    });
  }

  async scheduleIncomeAlert(income) {
    await LocalNotifications.schedule({
      notifications: [{
        id: 2000 + parseInt(income.id),
        title: 'Income Received',
        body: 'Payday! Want to allocate this money to your budgets?',
        schedule: { at: new Date() },
        sound: null,
        actionTypeId: 'INCOME_RECEIVED'
      }]
    });
  }

  async scheduleBalanceAlert(balance) {
    if (balance < 0) {
      await LocalNotifications.schedule({
        notifications: [{
          id: 3000,
          title: 'Balance Alert',
          body: "You're in the red. Want to review or adjust your budget?",
          schedule: { at: new Date() },
          sound: null,
          actionTypeId: 'BALANCE_ALERT'
        }]
    });
    }
  }

  async scheduleInactivityReminder(lastCheckIn) {
    const daysSinceCheckIn = Math.floor((new Date() - new Date(lastCheckIn)) / (1000 * 60 * 60 * 24));
    
    if (daysSinceCheckIn >= 3) {
      await LocalNotifications.schedule({
        notifications: [{
          id: 4000,
          title: 'Missing You',
          body: "Haven't heard from you in a bit. You doing okay?",
          schedule: { at: new Date() },
          sound: null,
          actionTypeId: 'INACTIVITY_REMINDER'
        }]
      });
    }
  }

  // Helper method to update all notifications
  async updateAllNotifications(settings) {
    await this.scheduleRoutineNotifications();
    // You can add more specific notification updates based on settings
  }

  async cancel(notifications = []) {
    try {
      if (!Array.isArray(notifications)) {
        notifications = [];
      }
      await LocalNotifications.cancel({ notifications });
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }
}

export const notificationService = new NotificationService(); 