import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Lock, CheckCircle, RefreshCw } from 'lucide-react'; // Siz so'ragan lucide ikonkalari



const AuthPage = () => {
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0); // Resend uchun 3 minutlik taymer

  // Taymer logikasi (Resend tugmasini bloklash uchun)
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // 1. REGISTER FUNKSIYASI
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8080/auth/register', { email, password });
      
      // Backenddan qaytgan emailni saqlaymiz
      sessionStorage.setItem('pending_email', res.data.email);
      setStep('verify');
      alert(res.data.message);
    } catch (err: any) {
      alert(err.response?.data?.message || "Ro'yxatdan o'tishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  // 2. VERIFY (OTP TASDIQLASH) FUNKSIYASI
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const storedEmail = sessionStorage.getItem('pending_email');
    
    if (!storedEmail) return alert("Email topilmadi, qaytadan ro'yxatdan o'ting");

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8080/auth/verify', { 
        email: storedEmail, 
        code: otp 
      });
      
      alert(res.data.message);
      sessionStorage.removeItem('pending_email');
      // Bu yerda login qilingan sahifaga o'tkazish mumkin
    } catch (err: any) {
      alert(err.response?.data?.message || "Kod noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  // 3. RESEND OTP (QAYTA YUBORISH) FUNKSIYASI
  const handleResend = async () => {
    const storedEmail = sessionStorage.getItem('pending_email');
    if (!storedEmail) return;

    try {
      const res = await axios.post('http://localhost:8080/auth/resend-otp', { email: storedEmail });
      alert(res.data.message);
      setTimer(180); // 3 minutga bloklash (180 soniya)
    } catch (err: any) {
      alert(err.response?.data?.message || "Kutib turing!");
    }
  };

  return (
    <div className="auth-container">
      {step === 'register' ? (
        /* REGISTER FORM */
        <form onSubmit={handleRegister}>
          <h2>Ro'yxatdan o'tish</h2>
          <div className="input-group">
            <Mail size={18} />
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="input-group">
            <Lock size={18} />
            <input 
              type="password" 
              placeholder="Parol" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Yuborilmoqda..." : "Ro'yxatdan o'tish"}
          </button>
        </form>
      ) : (
        /* VERIFY FORM */
        <form onSubmit={handleVerify}>
          <h2>Kodni kiriting</h2>
          <p>{sessionStorage.getItem('pending_email')} manziliga kod yuborildi</p>
          <div className="input-group">
            <CheckCircle size={18} />
            <input 
              type="text" 
              maxLength={6} 
              placeholder="6 xonali kod" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Tekshirilmoqda..." : "Tasdiqlash"}
          </button>
          
          <button 
            type="button" 
            onClick={handleResend} 
            disabled={timer > 0}
            className="resend-btn"
          >
            <RefreshCw size={16} className={timer > 0 ? "spinning" : ""} />
            {timer > 0 ? `Qayta yuborish (${timer}s)` : "Kodni qayta yuborish"}
          </button>
        </form>
      )}
    </div>
  );
};

export default AuthPage;