import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: 'https://ataa-laravel-api-b5hjgcc2e8bae8fb.polandcentral-01.azurewebsites.net/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})

// قبل كل request — بيحط الـ token تلقائياً
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// لو الـ token انتهى — بيعمل logout تلقائياً
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')   // ✅ هاد يلي كان ناقص
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default axiosInstance