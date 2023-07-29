import { configureStore } from '@reduxjs/toolkit';
import SideBarReducer from '../features/SideBar/SideBarSlice';

export const store = configureStore({
  reducer: {
    SideBar: SideBarReducer,
  },
});
