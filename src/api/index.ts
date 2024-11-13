import axios from 'axios';

const API_URL = '/db.php';

axios.interceptors.request.use(
  config => {
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    } else {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const api = {
  login: async (username: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth`, {
        username,
        password
      });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    }
  },

  uploadImage: async (file: File, type: string) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    const response = await axios.post(`${API_URL}/upload`, formData);
    return response.data;
  },

  getUsers: async () => {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  },

  getProducts: async () => {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  },

  getCategories: async () => {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
  },

  addUser: async (userData: any) => {
    const response = await axios.post(`${API_URL}/users`, userData);
    return response.data;
  },

  updateUser: async (user: any) => {
    const response = await axios.put(`${API_URL}/users/${user.id}`, user);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await axios.delete(`${API_URL}/users/${id}`);
    return response.data;
  },

  updateUserCredits: async (userId: string, amount: number) => {
    const response = await axios.post(`${API_URL}/users/${userId}/credits`, { amount });
    return response.data;
  },

  addCategory: async (categoryData: any) => {
    const response = await axios.post(`${API_URL}/categories`, categoryData);
    return response.data;
  },

  updateCategory: async (category: any) => {
    const response = await axios.put(`${API_URL}/categories/${category.id}`, category);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await axios.delete(`${API_URL}/categories/${id}`);
    return response.data;
  },

  addProduct: async (productData: any) => {
    const response = await axios.post(`${API_URL}/products`, productData);
    return response.data;
  },

  updateProduct: async (product: any) => {
    const response = await axios.put(`${API_URL}/products/${product.id}`, product);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await axios.delete(`${API_URL}/products/${id}`);
    return response.data;
  },

  placeOrder: async (orderData: any) => {
    const response = await axios.post(`${API_URL}/orders`, orderData);
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    const response = await axios.put(`${API_URL}/orders/${orderId}/status`, { status });
    return response.data;
  }
};