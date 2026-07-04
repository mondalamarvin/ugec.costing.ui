import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getFormulas, getFormulaById } from "../api";
import type { RootState } from "../store";
import { type IFormula } from "../../global/interfaces";

export const fetchFormulas = createAsyncThunk(
  "formulas/getFormulas",
  async () => {
    const result = await getFormulas();
    return result;
  },
);

export const fetchFormulaById = createAsyncThunk(
  "formulas/getFormulaById",
  async (id: number) => {
    const result = await getFormulaById(id);
    return result;
  },
);

interface IState {
  loading: boolean;
  formulas: IFormula[];
  formula: IFormula | null;
}

const initialState = {
  loading: false,
  formulas: [],
  formula: null,
} as IState;

const formulaSlice = createSlice({
  name: "formula",
  initialState,
  reducers: {
    resetFormulas(state) {
      state.formulas = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchFormulas.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchFormulas.fulfilled, (state, action) => {
      state.loading = false;
      state.formulas = action.payload;
    });
    builder.addCase(fetchFormulas.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(fetchFormulaById.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchFormulaById.fulfilled, (state, action) => {
      state.loading = false;
      state.formula = action.payload;
    });
    builder.addCase(fetchFormulaById.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const { resetFormulas } = formulaSlice.actions;
export default formulaSlice.reducer;
export const selectFormulas = (state: RootState) => state.formula.formulas;
export const selectFormula = (state: RootState) => state.formula.formula;
export const selectFormulaLoading = (state: RootState) => state.formula.loading;
