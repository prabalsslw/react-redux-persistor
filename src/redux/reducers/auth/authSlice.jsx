import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService } from '../../../services/auth/authService';

export const loginUser = createAsyncThunk(
	'auth/login',
	async (credentials, { rejectWithValue }) => {
		try {
            // console.log('AuthSlice - Attempting login with:', credentials);
			const response = await authService.login(credentials);
			if (!response.success) {
                throw new Error(response.error);
            }
            // console.log('AuthSlice - Login successful:', response.data);
			return {
				token: response.data.token,
                expiresIn: response.data.expires_in,
                user: response.data.user
			};

		} catch (error) {
			return rejectWithValue({
				message: error.response.data.message,
                status: error.response.status,
			});
		}
	}
);

const authSlice = createSlice({
	name: "auth",
	initialState: {
		isAuthenticated: false,
		isLoading: false,
        token: null,
        expiresIn: null,
		user: null,
		error: false,
		errorMessage: "",
	},
	reducers: {
		login: (state, action) => {
			state.isAuthenticated = true;
			state.user = action.payload;
		},
		logout: (state) => {
			state.isAuthenticated = false;
			state.isLoading = false;
			state.user = null;
			state.token = null;
            state.expiresIn = null;
			state.error = false;
			state.errorMessage = "";
		},
		errorClean: (state) => {
			state.error = false;
			state.errorMessage = "";
		},
	},
	extraReducers: (builder) => {
		builder.addCase(loginUser.pending, (state) => {
			state.isLoading = true;
			state.error = false;
		});
		builder.addCase(loginUser.fulfilled, (state, action) => {
			state.isLoading = false;
			state.error = null;
			state.isAuthenticated = true;
			state.errorMessage = "";
            state.token = action.payload.token;
            state.expiresIn = action.payload.expiresIn;
            state.user = action.payload.user;
		});
		builder.addCase(loginUser.rejected, (state, action) => {
			state.isLoading = false;
			state.error = true;
            state.isAuthenticated = false;
            state.token = null;
            state.expiresIn = null;
            state.user = null;
			state.errorMessage = action.payload.message;
		});
	},
});

export const {
	login,
	logout,
	errorClean
} = authSlice.actions;
export default authSlice.reducer;