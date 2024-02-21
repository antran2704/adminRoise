import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";
import { IUserInfor } from "~/interface";

interface IInitData {
  infor: IUserInfor;
  logout: boolean;
}

const initialState: IInitData = {
  infor: {
    // _id: null,
    name: "",
    email: "",
    // avartar: null,
  },
  logout: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginReducer: (state, action) => {
      state.infor = action.payload;
    },
    logoutReducer: (state, action) => {
      state.logout = action.payload;
    },
  },
});

export const getUser = (state: RootState) => state.user;

export const { loginReducer, logoutReducer } = userSlice.actions;
export default userSlice.reducer;
