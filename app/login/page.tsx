"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8080/auth/login', { email, password });
      
      // Tokenni saqlash (masalan, localStorage yoki Cookie-ga)
      localStorage.setItem('token', res.data.token);
      
      alert("Xush kelibsiz!");
      router.push('/dashboard'); // Login muvaffaqiyatli bo'lsa dashboardga o'tish
    } catch (err: any) {
      alert(err.response?.data?.message || "Login yoki parol xato");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Kirish</h2>
            <p className="text-gray-500 mt-2">Profilingizga kiring</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Email manzil"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Parol"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
            {loading ? "Kirilmoqda..." : "Tizimga kirish"}
          </button>

          <div className="text-center text-sm text-gray-600">
            Akkountingiz yo'qmi? <span onClick={() => router.push('/register')} className="text-blue-600 cursor-pointer hover:underline">Ro'yxatdan o'ting</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;