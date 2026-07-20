import authReducer from "./slices/authSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import { configureStore, combineReducers } from "@reduxjs/toolkit";

/**
 * v0 persisted an auth slice with no `permissions` / `is_super_admin`. Rehydrating
 * it would yield `undefined` for those keys rather than falling back to the
 * initialState default, so v0 payloads are dropped and the session is rebuilt
 * from /api/auth/me on the next request.
 */
const migrate = async (state: unknown, currentVersion: number) => {
    const persisted = state as { _persist?: { version?: number } } | undefined;
    if (!persisted || persisted._persist?.version !== currentVersion) return undefined;
    return persisted as never;
};

const persistConfig = {
    key: "root",
    storage,
    version: 1,
    migrate,
    whitelist: ["auth"],
};

const rootReducer = combineReducers({
    auth: authReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;