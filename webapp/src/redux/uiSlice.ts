import { createSlice } from '@reduxjs/toolkit';

export type UiState = {
  workload: number;
};

const initialState: UiState = {
  workload: 0,
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
  },
});

export const { startWaiting, finishWaiting } = uiSlice.actions;

export default uiSlice.reducer;
