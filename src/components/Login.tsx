import React, { useState } from 'react';
import { Crown, Mail, Lock, ArrowRight, Sparkles, Shield, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState<string>('sajjadr742@gmail.com');
  const [password, setPassword] = useState<string>('SolSon123456789.@');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate credentials
    if (email === 'sajjadr742@gmail.com' && password === 'SolSon123456789.@') {
      // Simulate login delay
      setTimeout(() => {
        setIsLoading(false);
        onLogin();
      }, 1500);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        setError('Invalid email or password. Please check your credentials.');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-royal-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-bounce-gentle"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gold-400 to-gold-600 rounded-3xl shadow-premium mb-6 relative">
            <Crown className="h-10 w-10 text-white" />
            <div className="absolute -top-2 -right-2 h-6 w-6 bg-emerald-400 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 font-serif">Solson LLC</h1>
          <p className="text-primary-200 text-lg">Royal CRM & Invoice Portal</p>
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
                  className="pl-12 block w-full rounded-xl border-0 bg-white bg-opacity-10 backdrop-blur-sm text-white placeholder-primary-300 shadow-sm focus:bg-opacity-20 focus:ring-2 focus:ring-gold-400 focus:ring-opacity-50 transition-all duration-200 py-4"
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
                  className="pl-12 pr-12 block w-full rounded-xl border-0 bg-white bg-opacity-10 backdrop-blur-sm text-white placeholder-primary-300 shadow-sm focus:bg-opacity-20 focus:ring-2 focus:ring-gold-400 focus:ring-opacity-50 transition-all duration-200 py-4"
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-gold-500 focus:ring-gold-400 border-primary-300 rounded bg-white bg-opacity-10"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-primary-200">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="text-gold-400 hover:text-gold-300 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-6 py-4 border border-transparent text-lg font-semibold rounded-xl text-primary-900 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-900 mr-3"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Portal
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Admin Credentials */}
          <div className="mt-8 p-4 bg-white bg-opacity-5 rounded-xl border border-white border-opacity-10">
            <div className="flex items-center mb-3">
              <div className="h-2 w-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
              <p className="text-xs text-primary-200 font-semibold uppercase tracking-wider">Admin Access</p>
            </div>
            <div className="space-y-1">
            </div>
          </div>

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
            <div className="flex items-center">
              <Sparkles className="h-3 w-3 mr-1" />
              <span>Secure</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 animate-fade-in">
          <p className="text-sm text-primary-300">
            © 2025 Solson LLC. All rights reserved.
          </p>
          <div className="flex items-center justify-center mt-2 space-x-4 text-xs text-primary-400">
            <a href="#" className="hover:text-gold-400 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-gold-400 transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-gold-400 transition-colors">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};