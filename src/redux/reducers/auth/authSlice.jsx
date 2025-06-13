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
				refreshToken: response.data.refresh_token,
				refreshTokenExpiresAt: response.data.refresh_token_expires_in,
				lastLogin: response.data.last_login,
				lastRefreshed: response.data.last_refreshed,
                user: response.data.user,
			};

		} catch (error) {
			return rejectWithValue({
				message: error.response.data.message,
                status: error.response.status,
			});
		}
	}
);

export const refreshTokenThnk = createAsyncThunk(
    'auth/refreshToken',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { authentication } = getState();
			// console.warn("asyn thnk:", authentication.refreshToken);
            if (!authentication.refreshToken) {
                throw new Error('No refresh token available');
            }
            const response = await authService.refreshTokenAuth(authentication.refreshToken);
			// console.warn("From Refresh Thunk:", response);
            if (!response.success) {
                throw new Error(response.error);
            }
            return {
                token: response.data.token,
                expiresIn: response.data.expires_in,
                refreshToken: response.data.refresh_token,
				refreshTokenExpiresAt: response.data.refresh_token_expires_in,
				lastLogin: response.data.last_login,
				lastRefreshed: response.data.last_refreshed,
                user: response.data.user || authentication.user // Keep existing user if not returned
            };
        } catch (error) {
            return rejectWithValue({
                message: error.response?.data?.message || error.message,
                status: error.response?.status || 500,
            });
        }
    }
);

const initialState = {
    isAuthenticated: false,
    isLoading: false,
    token: null,
    expiresIn: null,
    refreshToken: null,
	refreshTokenExpiresAt: null,
    lastLogin: null,
	lastRefreshed: null,
    user: null,
    error: false,
    errorMessage: "",
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		login: (state, action) => {
			state.isAuthenticated = true;
			state.user = action.payload;
		},
		logout: (state) => {
			Object.assign(state, initialState);
		},
		errorSetup: (state, action) => {
			state.error = true;
			state.errorMessage = action.payload.errorMessage || "Error while setting up the error message.";
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
			state.refreshToken = action.payload.refreshToken;
			state.refreshTokenExpiresAt = action.payload.refreshTokenExpiresAt;
			state.lastLogin = action.payload.lastLogin;
			state.lastRefreshed = action.payload.lastRefreshed;
            state.user = action.payload.user;
		});
		builder.addCase(loginUser.rejected, (state, action) => {
			state.isLoading = false;
			state.error = true;
            state.isAuthenticated = false;
            state.token = null;
            state.expiresIn = null;
			state.lastLogin = null;
			state.lastRefreshed = null;
			state.refreshToken = null;
			state.refreshTokenExpiresAt = null;
            state.user = null;
			state.errorMessage = action.payload.message;
		});

		builder.addCase(refreshTokenThnk.pending, (state) => {
            state.isLoading = true;
            state.error = false;
        });
        builder.addCase(refreshTokenThnk.fulfilled, (state, action) => {
			state.isLoading = false;
			state.error = null;
			state.isAuthenticated = true;
			state.errorMessage = "";
            state.token = action.payload.token;
            state.expiresIn = action.payload.expiresIn;
			state.refreshToken = action.payload.refreshToken;
			state.refreshTokenExpiresAt = action.payload.refreshTokenExpiresAt;
			state.lastLogin = action.payload.lastLogin;
			state.lastRefreshed = action.payload.lastRefreshed;
            state.user = action.payload.user;
        });
        builder.addCase(refreshTokenThnk.rejected, (state, action) => {
            state.isLoading = false;
			state.error = true;
            state.isAuthenticated = false;
            state.token = null;
            state.expiresIn = null;
			state.refreshToken = null;
			state.refreshTokenExpiresAt = null;
			state.lastLogin = null;
			state.lastRefreshed = null;
            state.user = null;
			state.errorMessage = action.payload.message;
			
            // Optionally logout on refresh failure
            // return initialState;
        });
    },
});

export const {
	login,
	logout,
	errorSetup,
	errorClean
} = authSlice.actions;
export default authSlice.reducer;