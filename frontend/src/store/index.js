import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import requeteReducer from './requeteSlice';
import notificationReducer from './notificationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    requetes: requeteReducer,
    notifications: notificationReducer,
  },
});

export default store;
