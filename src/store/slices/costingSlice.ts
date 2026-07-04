import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { postCostingRequest } from '../api';
import type { RootState } from '../store';
import type { ICostingRequest, ICostingResponse } from '../../global/interfaces'

export const generateCostingRequest = createAsyncThunk(
  'costings/fetchcostingsByGroup',
  async (data: ICostingRequest) => {
    const result = await postCostingRequest(data);
    return result;
  }
);

interface IState {
  loading: boolean;
  costings: [];
}

const initialState = {
  loading: false,
  costings: [],
} as IState;

const costingSlice = createSlice({
  name: 'costing',
  initialState,
  reducers: {
    resetCosting(state) {
      state.costings = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(generateCostingRequest.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(generateCostingRequest.fulfilled, (state, action) => {
      state.loading = false;
      state.costings = action.payload.costings;
    });
    builder.addCase(generateCostingRequest.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const { resetCosting } = costingSlice.actions;
export default costingSlice.reducer;
export const selectCostingLoading = (state: RootState) =>
  state.costing.loading;
