import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProcessPackaging } from '../api';
import type { RootState } from '../store';

export const fetchPackagings = createAsyncThunk(
  'packagings/getProcessPackaging',
  async (oerderTypeId: number) => {
    const result = await getProcessPackaging(oerderTypeId);
    return result;
  },
);

interface IState {
  loading: boolean;
  packagings: [];
}

const initialState = {
  loading: false,
  packagings: [],
} as IState;

const packagingSlice = createSlice({
  name: 'packagings',
  initialState,
  reducers: {
    resetPackagings(state) {
      state.packagings = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPackagings.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchPackagings.fulfilled, (state, action) => {
      state.loading = false;
      state.packagings = action.payload;
    });
    builder.addCase(fetchPackagings.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const { resetPackagings } = packagingSlice.actions;
export default packagingSlice.reducer;
export const selectPackagings = (state: RootState) =>
  state.packaging.packagings;
export const selectPackagingsLoading = (state: RootState) =>
  state.packaging.loading;
