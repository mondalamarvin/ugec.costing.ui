import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMaterialsByCategoryRequest, getMaterialCategories } from '../api';
import type { RootState } from '../store';

export const fetchMaterialsByCategory = createAsyncThunk(
  'materials/getMaterialsByCategoryRequest',
  async (category: number) => {
    const result = await getMaterialsByCategoryRequest(category);
    return result;
  },
);

export const fetchMaterialCategories = createAsyncThunk(
  'materials/getMaterialCategories',
  async () => {
    const result = await getMaterialCategories();
    return result;
  },
);

interface IState {
  loading: boolean;
  materials: [];
  categories: [];
}

const initialState = {
  loading: false,
  materials: [],
  categories: [],
} as IState;

const materialSlice = createSlice({
  name: 'material',
  initialState,
  reducers: {
    resetMaterials(state) {
      state.materials = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMaterialCategories.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchMaterialCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = action.payload;
    });
    builder.addCase(fetchMaterialCategories.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(fetchMaterialsByCategory.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchMaterialsByCategory.fulfilled, (state, action) => {
      state.loading = false;
      state.materials = action.payload;
    });
    builder.addCase(fetchMaterialsByCategory.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const { resetMaterials } = materialSlice.actions;
export default materialSlice.reducer;
export const selectCategories = (state: RootState) => state.material.categories;
export const selectMaterials = (state: RootState) => state.material.materials;
export const selectMaterialLoading = (state: RootState) =>
  state.material.loading;
