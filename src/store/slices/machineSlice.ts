import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMachines } from '../api';
import type { RootState } from '../store';

export const fetchMachines = createAsyncThunk(
  'machines/getMachines',
  async () => {
    const result = await getMachines();
    return result;
  },
);

interface IState {
  loading: boolean;
  machines: [];
}

const initialState = {
  loading: false,
  machines: [],
} as IState;

const machineSlice = createSlice({
  name: 'machines',
  initialState,
  reducers: {
    resetMachines(state) {
      state.machines = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMachines.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchMachines.fulfilled, (state, action) => {
      state.loading = false;
      state.machines = action.payload;
    });
    builder.addCase(fetchMachines.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const { resetMachines } = machineSlice.actions;
export default machineSlice.reducer;
export const selectMachines = (state: RootState) => state.machine.machines;
export const selectMachinesLoading = (state: RootState) =>
  state.machine.loading;
