import {configureStore} from "@reduxjs/toolkit";
import {persistReducer, persistStore} from "redux-persist";
import storage from "redux-persist/lib/storage";
import logger from 'redux-logger';
import authSlice from "./reducers/auth/authSlice";
// import userSlice from "./reducers/user/userSlice";

// Persist config for authSlice
const authPersistConfig = {
	key: "authPersist", // persisted under "auth"
	storage,
    whitelist: ['isAuthenticated', 'token', 'expiresIn', 'user'] // Only persist these fields
};

// Wrap only authSlice with persist logic
const persistedAuthReducer = persistReducer(authPersistConfig, authSlice);

// Combine all reducers
const rootReducer = {
	authhentication: persistedAuthReducer, // persisted reducer
	//   user: userSlice,            // non-persisted reducer
};

// Middleware setup
const middlewares = [];
if (import.meta.env.MODE === "development") {
	middlewares.push(logger);
}

// Configure Redux store
export const store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			immutableCheck: false,
			serializableCheck: false,
		}).concat(middlewares),
	devTools: true,
});

// Create persistor for rehydration
export const persistor = persistStore(store);