import { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
};

function authReducer(state, action) {
    switch (action.type) {
        case 'AUTH_LOADING':
            return { ...state, isLoading: true };
        case 'AUTH_SUCCESS':
            return { user: action.payload, isAuthenticated: true, isLoading: false };
        case 'AUTH_FAILURE':
        case 'LOGOUT':
            return { user: null, isAuthenticated: false, isLoading: false };
        case 'UPDATE_USER':
            return { ...state, user: { ...state.user, ...action.payload } };
        default:
            return state;
    }
}

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Check for existing token on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = api.getToken();
            if (!token) {
                dispatch({ type: 'AUTH_FAILURE' });
                return;
            }

            try {
                const { data } = await api.getMe();
                dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
            } catch {
                api.setToken(null);
                dispatch({ type: 'AUTH_FAILURE' });
            }
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        dispatch({ type: 'AUTH_LOADING' });
        const { data } = await api.login({ email, password });
        api.setToken(data.token);
        dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
        return data;
    };

    const register = async (name, email, password) => {
        dispatch({ type: 'AUTH_LOADING' });
        const { data } = await api.register({ name, email, password });
        api.setToken(data.token);
        dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
        return data;
    };

    const logout = () => {
        api.setToken(null);
        dispatch({ type: 'LOGOUT' });
    };

    const updateUser = (userData) => {
        dispatch({ type: 'UPDATE_USER', payload: userData });
    };

    return (
        <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
