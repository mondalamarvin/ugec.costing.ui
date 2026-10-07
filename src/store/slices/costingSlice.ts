import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { postCostingRequest } from '../api';
import type { RootState } from '../store';
import type {
  ICostingRequest,
  ICostingResponse,
} from '../../global/interfaces';

export const generateCostingRequest = createAsyncThunk(
  'costings/fetchcostingsByGroup',
  async (data: ICostingRequest) => {
    const result = await postCostingRequest(data);
    return result;
  },
);

export interface IMachineStep {
  machineName: string;
  machineOverheadCost: number;
  totalMachineRun: number;
  estimatedTimeHours: number;
}

export interface IDelivery {
  vehicleName: string;
  costPerTrip: number;
  maxCapacity: number;
  totalTrips: number;
  totalCost: number;
}

export interface ICostingData {
  packaging: any;
  machines: IMachineStep[];
  totalMachineCost: number;
  totalMaterialCost: number;
  totalDeliveryCost: number;
  totalCylinderCost: number;
  delivery: IDelivery;
}

interface IState {
  loading: boolean;
  costing: ICostingData | null;
}

const initialState = {
  loading: false,
  costing: null,
} as IState;

const costingSlice = createSlice({
  name: 'costing',
  initialState,
  reducers: {
    resetCosting(state) {
      state.costing = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(generateCostingRequest.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(generateCostingRequest.fulfilled, (state, action) => {
      state.loading = false;
      state.costing = action.payload;
    });
    builder.addCase(generateCostingRequest.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const { resetCosting } = costingSlice.actions;
export default costingSlice.reducer;
export const selectCostingData = (state: RootState) => state.costing.costing;
export const selectCostingLoading = (state: RootState) => state.costing.loading;
