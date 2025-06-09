import axios from 'axios';
import {
	store
} from '../../redux/store';

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

// apiClient.interceptors.response.use(
// 	(response) => {
// 		return response;
// 	},
// 	(error) => {
// 		console.error('API Error:', {
// 			url: error.config?.url,
// 			status: error.response?.status,
// 			message: error.message,
// 			response: error.response?.data
// 		});
// 		return Promise.reject(error);
// 	}
// );

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