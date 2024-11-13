import { create } from 'zustand';
import type { Product, Category, Order, User, OrderItem } from '../types';
import { api } from '../api';

// Simple ID generator since crypto.randomUUID is not available
const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

interface Store {
  users: User[];
  products: Product[];
  categories: Category[];
  cart: OrderItem[];
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateUserCredits: (userId: string, amount: number) => Promise<void>;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  placeOrder: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateOrderStatus: (userId: string, orderId: string, status: Order['status']) => Promise<void>;
  fetchInitialData: () => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
  users: [],
  products: [],
  categories: [],
  cart: [],
  user: null,

  fetchInitialData: async () => {
    try {
      const [users, products, categories] = await Promise.all([
        api.getUsers(),
        api.getProducts(),
        api.getCategories()
      ]);
      set({ users, products, categories });
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  },

  login: async (username: string, password: string) => {
    try {
      const response = await api.login(username, password);
      if (response.success) {
        set({ user: response.user });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },

  logout: () => {
    set({ user: null, cart: [] });
  },

  addUser: async (userData) => {
    try {
      const response = await api.addUser(userData);
      if (response.success) {
        const newUser = { ...userData, id: response.id };
        set(state => ({ users: [...state.users, newUser] }));
      }
    } catch (error) {
      console.error('Add user error:', error);
    }
  },

  updateUser: async (user) => {
    try {
      await api.updateUser(user);
      set(state => ({
        users: state.users.map(u => u.id === user.id ? user : u)
      }));
    } catch (error) {
      console.error('Update user error:', error);
    }
  },

  deleteUser: async (id) => {
    try {
      await api.deleteUser(id);
      set(state => ({
        users: state.users.filter(u => u.id !== id)
      }));
    } catch (error) {
      console.error('Delete user error:', error);
    }
  },

  updateUserCredits: async (userId: string, amount: number) => {
    try {
      await api.updateUserCredits(userId, amount);
      set(state => ({
        users: state.users.map(u =>
          u.id === userId ? { ...u, credits: u.credits + amount } : u
        ),
        user: state.user?.id === userId
          ? { ...state.user, credits: state.user.credits + amount }
          : state.user
      }));
    } catch (error) {
      console.error('Update credits error:', error);
    }
  },

  addToCart: (product: Product) => {
    set(state => {
      const existingItem = state.cart.find(item => item.productId === product.id);
      
      if (existingItem) {
        return {
          cart: state.cart.map(item =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      return {
        cart: [
          ...state.cart,
          {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            price: product.price,
          },
        ],
      };
    });
  },

  removeFromCart: (productId: string) => {
    set(state => ({
      cart: state.cart.filter(item => item.productId !== productId)
    }));
  },

  clearCart: () => {
    set({ cart: [] });
  },

  placeOrder: async () => {
    const state = get();
    if (!state.user || state.cart.length === 0) return;

    const totalCredits = state.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (state.user.credits < totalCredits) return;

    try {
      const orderData = {
        userId: state.user.id,
        items: state.cart,
        totalCredits
      };

      const response = await api.placeOrder(orderData);
      if (response.success) {
        set(state => ({
          user: state.user ? {
            ...state.user,
            credits: state.user.credits - totalCredits
          } : null,
          cart: []
        }));
      }
    } catch (error) {
      console.error('Place order error:', error);
    }
  },

  addCategory: async (categoryData) => {
    try {
      const response = await api.addCategory(categoryData);
      if (response.success) {
        const newCategory = { ...categoryData, id: response.id };
        set(state => ({
          categories: [...state.categories, newCategory]
        }));
      }
    } catch (error) {
      console.error('Add category error:', error);
    }
  },

  updateCategory: async (category) => {
    try {
      await api.updateCategory(category);
      set(state => ({
        categories: state.categories.map(c =>
          c.id === category.id ? category : c
        )
      }));
    } catch (error) {
      console.error('Update category error:', error);
    }
  },

  deleteCategory: async (id) => {
    try {
      await api.deleteCategory(id);
      set(state => ({
        categories: state.categories.filter(c => c.id !== id)
      }));
    } catch (error) {
      console.error('Delete category error:', error);
    }
  },

  addProduct: async (productData) => {
    try {
      const response = await api.addProduct(productData);
      if (response.success) {
        const newProduct = { ...productData, id: response.id };
        set(state => ({
          products: [...state.products, newProduct]
        }));
      }
    } catch (error) {
      console.error('Add product error:', error);
    }
  },

  updateProduct: async (product) => {
    try {
      await api.updateProduct(product);
      set(state => ({
        products: state.products.map(p =>
          p.id === product.id ? product : p
        )
      }));
    } catch (error) {
      console.error('Update product error:', error);
    }
  },

  deleteProduct: async (id) => {
    try {
      await api.deleteProduct(id);
      set(state => ({
        products: state.products.filter(p => p.id !== id)
      }));
    } catch (error) {
      console.error('Delete product error:', error);
    }
  },

  updateOrderStatus: async (userId: string, orderId: string, status: Order['status']) => {
    try {
      await api.updateOrderStatus(orderId, status);
      set(state => ({
        users: state.users.map(u =>
          u.id === userId
            ? {
                ...u,
                orders: u.orders.map(order =>
                  order.id === orderId
                    ? { ...order, status }
                    : order
                ),
              }
            : u
        ),
        user: state.user?.id === userId
          ? {
              ...state.user,
              orders: state.user.orders.map(order =>
                order.id === orderId
                  ? { ...order, status }
                  : order
              ),
            }
          : state.user,
      }));
    } catch (error) {
      console.error('Update order status error:', error);
    }
  },
}));