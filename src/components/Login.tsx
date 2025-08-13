import React, { useState } from 'react';
import { Building2, Mail, Lock, ArrowRight, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuthContext } from './AuthProvider';

export const Login: React.FC = () => {
  const { signIn, signUp } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: '' });
  const [isSignup, setIsSignup] = useState(false);

  // Generate simple math captcha
  React.useEffect(() => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ num1, num2, answer: '' });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate captcha
    const correctAnswer = captcha.num1 + captcha.num2;
    if (parseInt(captcha.answer) !== correctAnswer) {
      setError('Please solve the math problem correctly');
      // Generate new captcha
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      setCaptcha({ num1, num2, answer: '' });
      return;
    }

    setIsLoading(true);
    try {
      if (isSignup) {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during authentication');
      // Generate new captcha on error
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      setCaptcha({ num1, num2, answer: '' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 to-primary-800">
      <div className="w-full max-w-md p-8 bg-white bg-opacity-5 rounded-2xl shadow-xl border border-white border-opacity-10 animate-fade-in">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl shadow-premium mb-6 relative">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 font-serif">Invoice Portal</h1>
          <p className="text-primary-200 text-lg">Professional Invoice Management</p>
          <div className="flex items-center justify-center mt-4 space-x-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span className="text-primary-300 text-sm">Secure Enterprise Access</span>
          </div>
        </div>

        {/* Login Form */}
        <div className="glass-effect rounded-3xl shadow-premium border border-white border-opacity-20 p-8 animate-slide-up backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500 bg-opacity-10 border border-red-400 text-red-300 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            {isSignup && (
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full rounded-xl border-0 bg-white bg-opacity-10 backdrop-blur-sm text-white placeholder-primary-300 shadow-sm focus:bg-opacity-20 focus:ring-2 focus:ring-primary-400 focus:ring-opacity-50 transition-all duration-200 py-4 mb-2"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 block w-full rounded-xl border-0 bg-white bg-opacity-10 backdrop-blur-sm text-white placeholder-primary-300 shadow-sm focus:bg-opacity-20 focus:ring-2 focus:ring-primary-400 focus:ring-opacity-50 transition-all duration-200 py-4"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 block w-full rounded-xl border-0 bg-white bg-opacity-10 backdrop-blur-sm text-white placeholder-primary-300 shadow-sm focus:bg-opacity-20 focus:ring-2 focus:ring-primary-400 focus:ring-opacity-50 transition-all duration-200 py-4"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary-300 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            {/* Simple Math Captcha */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Security Check: What is {captcha.num1} + {captcha.num2}?
              </label>
              <input
                type="number"
                value={captcha.answer}
                onChange={(e) => setCaptcha({ ...captcha, answer: e.target.value })}
                className="block w-full rounded-xl border-0 bg-white bg-opacity-10 backdrop-blur-sm text-white placeholder-primary-300 shadow-sm focus:bg-opacity-20 focus:ring-2 focus:ring-primary-400 focus:ring-opacity-50 transition-all duration-200 py-4"
                placeholder="Enter the answer"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-6 py-4 border border-transparent text-lg font-semibold rounded-xl text-primary-900 bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-900 mr-3"></div>
                  {isSignup ? 'Signing Up...' : 'Signing In...'}
                </>
              ) : (
                <>
                  {isSignup ? 'Sign Up' : 'Sign In to Portal'}
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <button
              type="button"
              className="w-full mt-2 flex items-center justify-center px-6 py-3 border border-primary-400 text-lg font-semibold rounded-xl text-primary-400 bg-transparent hover:bg-primary-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={() => { setIsSignup(!isSignup); setError(''); }}
            >
              {isSignup ? 'Already have an account? Sign In' : 'New user? Sign Up'}
            </button>
          </form>
          {/* Security Features */}
          <div className="mt-6 flex items-center justify-center space-x-6 text-xs text-primary-300">
            <div className="flex items-center">
              <Shield className="h-3 w-3 mr-1" />
              <span>256-bit SSL</span>
            </div>
            <div className="flex items-center">
              <Lock className="h-3 w-3 mr-1" />
              <span>Encrypted</span>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="text-center mt-8 animate-fade-in">
          <p className="text-sm text-primary-300">
            © 2025 Invoice Portal. All rights reserved.
          </p>
          <div className="flex items-center justify-center mt-2 space-x-4 text-xs text-primary-400">
            <a href="#" className="hover:text-primary-200 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-primary-200 transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-primary-200 transition-colors">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};