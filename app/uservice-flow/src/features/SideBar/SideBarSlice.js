import { createSlice } from '@reduxjs/toolkit';

const InitialState = {
    allServices: [],
    usedNodeTypes: [],
    usedNodeConnections: [],
}

const SideBarSlice = createSlice({
    name: 'SideBar',
    initialState: InitialState,
    reducers: {
        UPDATE_ALL_SERVICES: (state, action) => {
            state.allServices = action.payload;
        },
        UPDATE_USED_NODE_TYPES: (state, action) => {
            state.usedNodeTypes = action.payload;
        },
        UPDATE_USED_NODE_CONNECTIONS: (state, action) => {
            state.usedNodeConnections = action.payload;
        },
    }
});

export const { UPDATE_ALL_SERVICES, UPDATE_USED_NODE_TYPES, UPDATE_USED_NODE_CONNECTIONS } = SideBarSlice.actions;
export default SideBarSlice.reducer;