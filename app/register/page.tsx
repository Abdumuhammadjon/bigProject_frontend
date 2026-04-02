"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Lock, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';

const AuthPage = () => {
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8080/auth/register', { email, password });
      sessionStorage.setItem('pending_email', res.data.email);
      setStep('verify');
      alert(res.data.message);
    } catch (err: any) {
      alert(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

 const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const storedEmail = sessionStorage.getItem('pending_email');
    if (!storedEmail) return alert("Email topilmadi");

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8080/auth/verify', { 
        email: storedEmail, 
        code: otp 
      });
      
      alert(res.data.message);
      sessionStorage.removeItem('pending_email');
      
      // Muvaffaqiyatli bo'lsa inputni tozalaymiz
      setOtp(''); 
      
      // Masalan, bu yerda foydalanuvchini login sahifasiga yo'naltirishingiz mumkin
    } catch (err: any) {
      alert(err.response?.data?.message || "Kod noto'g'ri");
      
      // Xato bo'lganda ham inputni tozalash foydalanuvchiga qayta kiritish imkonini beradi
      setOtp(''); 
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const storedEmail = sessionStorage.getItem('pending_email');
    if (!storedEmail) return;
    try {
      const res = await axios.post('http://localhost:8080/auth/resend-otp', { email: storedEmail });
      alert(res.data.message);
      setTimer(180);
    } catch (err: any) {
      alert(err.response?.data?.message || "Kutib turing!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {step === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">Ro'yxatdan o'tish</h2>
              <p className="text-gray-500 mt-2">Ma'lumotlaringizni kiriting</p>
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
              {loading && <Loader2 className="animate-spin" size={20} />}
              {loading ? "Yuborilmoqda..." : "Ro'yxatdan o'tish"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">Kodni kiriting</h2>
              <p className="text-sm text-gray-500 mt-2">
                <span className="font-medium text-blue-600">{sessionStorage.getItem('pending_email')}</span> manziliga kod yuborildi
              </p>
            </div>

            <div className="relative">
              <CheckCircle className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                maxLength={6}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition text-center tracking-[10px] font-bold text-xl"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={20} />}
              {loading ? "Tekshirilmoqda..." : "Tasdiqlash"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={timer > 0}
              className={`w-full flex items-center justify-center gap-2 text-sm font-medium transition ${
                timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              <RefreshCw size={16} className={timer > 0 ? "animate-spin" : ""} />
              {timer > 0 ? `Qayta yuborish (${timer}s)` : "Kodni qayta yuborish"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;