import axios from 'axios';
import { store } from '../../redux/store';
import { refreshTokenThnk } from '../../redux/reducers/auth/authSlice';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
	timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
	if (!config.skipAuth) {
		const {
			token
		} = store.getState().auth;
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
	}

	if (!config.skipContentType) {
		config.headers['Content-Type'] = config.contentType || 'application/json';
	}

	return config;
}, (error) => {
	return Promise.reject(error);
});

// Fix the interceptor to use apiClient instead of axios
apiClient.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        const resData = error.response?.data;
		
        const isUnauthorized = error.response?.status === 401;
        const isTokenExpired = resData?.message?.toLowerCase().includes('token expired'); // adjust this if your backend uses a different message

        if (isUnauthorized && isTokenExpired && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { payload } = await store.dispatch(refreshTokenThnk());
                const newToken = payload.token;

                apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                processQueue(null, newToken);
                return apiClient(originalRequest);
            } catch (e) {
                processQueue(e, null);
                return Promise.reject(e);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);


// Reusable HTTP methods
const GET = async (endpoint, config = {}) => {
	const finalConfig = {
		...config,
		skipAuth: config.skipAuth || false,
		skipContentType: config.skipContentType || false,
	};

	const response = await apiClient.get(endpoint, finalConfig);
	return response.data;
};

const POST = async (endpoint, payload, config = {}) => {
	const finalConfig = {
		...config,
		skipAuth: config.skipAuth || false,
		skipContentType: config.skipContentType || false,
	};

	const response = await apiClient.post(endpoint, payload, finalConfig);
	return response.data;
};

const POSTWH = async (endpoint, data, config = {}) => {
	const finalConfig = {
		...config,
		skipAuth: true,
	};

	const response = await apiClient.post(endpoint, data, finalConfig);
	return response.data;
};

const PUT = async (endpoint, payload, config = {}) => {
	const finalConfig = {
		...config,
		skipAuth: config.skipAuth || false,
		skipContentType: config.skipContentType || false,
	};

	const response = await apiClient.put(endpoint, payload, finalConfig);
	return response.data;
};

const PATCH = async (endpoint, payload, config = {}) => {
	const finalConfig = {
		...config,
		skipAuth: config.skipAuth || false,
		skipContentType: config.skipContentType || false,
	};

	const response = await apiClient.patch(endpoint, payload, finalConfig);
	return response.data;
};

const DELETE = async (endpoint, config = {}) => {
	const finalConfig = {
		...config,
		skipAuth: config.skipAuth || false,
		skipContentType: config.skipContentType || false,
	};

	const response = await apiClient.delete(endpoint, finalConfig);
	return response.data;
};

export const API = {
	GET,
	POST,
	POSTWH,
	PUT,
	PATCH,
	DELETE,
};