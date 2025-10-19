import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type UiState = {
  workload: number;
  categoryId: number | null;
};

const initialState: UiState = {
  workload: 0,
  categoryId: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    startWaiting: (state: UiState) => {
      state.workload = state.workload + 1;
    },
    finishWaiting: (state: UiState) => {
      state.workload = state.workload - 1;
    },
    setCategoryId: (state: UiState, action: PayloadAction<number>) => {
      state.categoryId = action.payload;
    },
  },
});

export const { startWaiting, finishWaiting, setCategoryId } = uiSlice.actions;

export default uiSlice.reducer;
