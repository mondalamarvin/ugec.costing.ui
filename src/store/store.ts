import { configureStore } from '@reduxjs/toolkit';

import costingSlice from './slices/costingSlice';
import formulaSlice from './slices/formulaSlice';
import machineSlice from './slices/machineSlice';
import materialSlice from './slices/materialSlice';
import packagingSlice from './slices/packagingSlice';
import processRoutes from './slices/processRouteSlice';

const store = configureStore({
  reducer: {
    costing: costingSlice,
    formula: formulaSlice,
    machine: machineSlice,
    material: materialSlice,
    packaging: packagingSlice,
    processRoutes: processRoutes,
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
