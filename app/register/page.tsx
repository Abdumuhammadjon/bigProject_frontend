"use client";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Mail, Lock, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const AuthPage = () => {
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // OTP uchun 6 ta bo'sh katak holati
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Input o'zgarganda ishlaydigan funksiya
  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value.substring(element.value.length - 1);
    setOtp(newOtp);

    // Keyingi katakka fokus o'tkazish
    if (element.value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Backspace bosilganda oldingi katakka qaytish
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

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
    const otpCode = otp.join(""); // Massivni stringga aylantiramiz
    const storedEmail = sessionStorage.getItem('pending_email');
    if (!storedEmail) return alert("Email topilmadi");

    setLoading(true);
    try {
      await axios.post('http://localhost:8080/auth/verify', {
        email: storedEmail,
        code: otpCode
      });

      alert("Profilingiz muvaffaqiyatli tasdiqlandi!");
      sessionStorage.removeItem('pending_email');
      router.push('/login');
    } catch (err: any) {
      alert(err.response?.data?.message || "Kod noto'g'ri");
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
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {step === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Xush kelibsiz</h2>
              <p className="text-gray-500 mt-2">Ma'lumotlaringizni kiriting</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Ro'yxatdan o'tish"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">Tasdiqlash kodi</h2>
              <p className="text-sm text-gray-500 mt-2">
                <span className="font-medium text-blue-600 italic">{sessionStorage.getItem('pending_email')}</span> manziliga 6 xonali kod yubordik.
              </p>
            </div>

            {/* ALOHIDA-ALOHIDA INPUTLAR */}
            <div className="flex justify-between gap-2">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-14 border-2 rounded-xl text-center text-2xl font-bold text-blue-600 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
              ))}
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading || otp.join("").length < 6}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Tasdiqlash"}
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={timer > 0}
                className={`w-full flex items-center justify-center gap-2 text-sm font-semibold transition ${timer > 0 ? 'text-gray-400' : 'text-blue-600 hover:underline'
                  }`}
              >
                <RefreshCw size={16} className={timer > 0 ? "animate-spin" : ""} />
                {timer > 0 ? `Qayta yuborish (${timer}s)` : "Kodni qayta yuborish"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;