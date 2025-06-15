import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import userService from './user.service'

const API_URL = 'http://localhost:8080/doan/auth'

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  phone: string
  address: string
}

export interface User {
  id: number
  name: string
  email: string
  role: string
  token: string
  phoneNumber?: string
  address?: string
}

// Define interfaces for password reset
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string; // Using 'otp' to match backend parameter name for the token
  newPassword: string;
}

class AuthService {
  async login(email: string, password: string) {
    try {
      const response = await axios.post(API_URL + '/login', { email, password }) as any;
      const token = response.data.result.token;
  
      if (!token) throw new Error('NO_TOKEN_RECEIVED');
  
      const decoded: any = jwtDecode(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const profile = await userService.getProfile();
  
      const isProfileVerified = profile.isVerified === true;

      if (
        decoded.roles?.[0] === 'USER' &&
        !isProfileVerified
      ) {
        this.logout();
        localStorage.setItem('pendingVerificationEmail', email);
        const error: any = new Error('UNVERIFIED_ACCOUNT');
        error.code = 1010;
        throw error;
      }
      
  
      const userData: User = {
        id: decoded.id,
        name: profile.fullname,
        email: profile.email,
        role: decoded.roles?.[0] || 'USER',
        token,
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || '',
      };
  
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('token', token);
      window.dispatchEvent(new Event("storage"));
      
      return userData;
    } catch (error: any) {
      if (error.response?.data?.code) {
        error.code = error.response.data.code;
      }
      throw error;
    }
  }
  

  async register(data: RegisterData): Promise<void> {
    try {
      await axios.post(API_URL + '/register', data)
    } catch (error) {
      throw error
    }
  }

  verifyOtp(data: { email: string; otpCode: string }) {
    return axios.post(API_URL + '/verify-otp', data)
  }

  resendOtp(email: string) {
    return axios.post(API_URL + '/resend-otp', { email })
  }

  async requestPasswordReset(email: string): Promise<any> {
    const response = await axios.post(`${API_URL}/forgot-password`, { email } as ForgotPasswordRequest);
    return response.data;
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<any> {
    const response = await axios.post(`${API_URL}/reset-password`, { email, otp: token, newPassword } as ResetPasswordRequest);
    return response.data;
  }

  logout() {
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user: User = JSON.parse(userStr)
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`
      return user
    }
    return null
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser()
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser()
    return user?.role === 'ADMIN'
  }

  setupAxiosInterceptors() {
    axios.interceptors.request.use(
      (config) => {
        const user = this.getCurrentUser()
        if (user?.token && config.headers) {
          config.headers['Authorization'] = `Bearer ${user.token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/user')) {
            this.logout()
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }
}

export default new AuthService()
