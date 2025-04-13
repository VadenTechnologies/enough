import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/main.css";
import { initializeDatabase } from "./services/database";

// Initialize database before mounting the app
console.log('Starting application initialization...');

// Create a promise that resolves when the database is initialized
const initPromise = initializeDatabase()
  .then(() => {
    console.log('Database initialized successfully');
    return true;
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    // Continue with app initialization even if database fails
    return false;
  });

// Create the app instance
const app = createApp(App);

// Use plugins
app.use(store);
app.use(router);

// Mount the app after database initialization
initPromise.then(() => {
  console.log('Mounting application...');
  app.mount("#app");
});
