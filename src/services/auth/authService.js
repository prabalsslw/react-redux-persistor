import {
	API
} from '../api/apiClient';

export const authService = {
	login: async (credentials) => {
		try {
			const response = await API.POSTWH('auth/token', credentials);
			// console.log('Auth Service - Login response', response);

			if (!response?.success) {
				throw new Error(response?.message || 'Login failed');
			}
			return {
				success: true,
				data: response.data
			};
		} 
		catch (error) {
			// Normalize Axios or custom-thrown errors
			throw {
				response: {
					success: false,
					status: error?.response?.status || 500,
					data: {
						message: error?.response?.data?.message || error?.message || 'Login failed',
					},
				},
			};
		}
	},

	getProfile: async () => {
		try {
			const response = await API.GET('/auth/profile');
			return {
				success: true,
				data: response,
			};
		} catch (error) {
			return {
				success: false,
				error: error.response?.data?.message || 'Failed to fetch profile',
			};
		}
	},

	register: async (userData) => {
		try {
			const response = await API.POST('/auth/register', userData);
			return {
				success: true,
				data: response,
			};
		} catch (error) {
			return {
				success: false,
				error: error.response?.data?.message || 'Registration failed',
			};
		}
	},

	updateProfile: async (data) => {
		try {
			const response = await API.PUT('/auth/profile', data);
			return {
				success: true,
				data: response,
			};
		} catch (error) {
			return {
				success: false,
				error: error.response?.data?.message || 'Failed to update profile',
			};
		}
	},

	uploadAvatar: async (formData) => {
		try {
			const response = await API.POST('/auth/avatar', formData, {
				contentType: 'multipart/form-data',
			});
			return {
				success: true,
				data: response,
			};
		} catch (error) {
			return {
				success: false,
				error: error.response?.data?.message || 'Failed to upload avatar',
			};
		}
	},
};