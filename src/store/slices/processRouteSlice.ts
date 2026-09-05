import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProcessRoutes } from '../api';
import type { RootState } from '../store';

export const fetchprocessRoutes = createAsyncThunk(
  'processRoutes/getProcessRoutes',
  async (orderTypeId: number) => {
    const result = await getProcessRoutes(orderTypeId);
    return result;
  },
);

interface IState {
  loading: boolean;
  processRoutes: [];
}

const initialState = {
  loading: false,
  processRoutes: [],
} as IState;

const processRouteslice = createSlice({
  name: 'processRoutes',
  initialState,
  reducers: {
    resetProcessRoutes(state) {
      state.processRoutes = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchprocessRoutes.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchprocessRoutes.fulfilled, (state, action) => {
      state.loading = false;
      state.processRoutes = action.payload;
    });
    builder.addCase(fetchprocessRoutes.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const { resetProcessRoutes } = processRouteslice.actions;
export default processRouteslice.reducer;
export const selectprocessRoutes = (state: RootState) =>
  state.processRoutes.processRoutes;
export const selectProcessRoutesLoading = (state: RootState) =>
  state.processRoutes.loading;
