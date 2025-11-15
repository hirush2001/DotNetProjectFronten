// In: /src/redux/slices/clientSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getClients } from '../../services/api'; // Import your API function

// 1. Create the "Thunk" (the function that fetches data)
export const fetchClients = createAsyncThunk('clients/fetchClients', async () => {
  const data = await getClients();
  return data;
});

// 2. Create the Slice
const clientSlice = createSlice({
  name: 'clients',
  initialState: {
    data: [], // This will hold your list of clients
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  },
  reducers: {},
  // 3. Handle the states of your API call
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload; // Put the clients from the API into your state
      })
      .addCase(fetchClients.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default clientSlice.reducer;