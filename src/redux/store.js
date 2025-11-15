// In: /src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import clientReducer from './slices/clientSlice'; // 1. Import your new reducer

export const store = configureStore({
  reducer: {
    clients: clientReducer, // 2. Add it to the reducer list
    // We will add 'items' here later
  },
});