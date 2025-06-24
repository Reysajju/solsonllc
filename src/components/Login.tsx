import React, { useState } from 'react';
import { Crown, Mail, Lock, ArrowRight, Sparkles, Shield, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuthContext } from './AuthProvider';

export const Login: React.FC = () => {
  const { signIn, signUp } = useAuthContext();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 to-primary-800">
      <div className="w-full max-w-md p-8 bg-white bg-opacity-5 rounded-2xl shadow-xl border border-white border-opacity-10 animate-fade-in">
        {/* Logo and Header */}
        <div className="text-center mb-8">
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

        {/* Login/Signup Form */}
        <div className="glass-effect rounded-3xl shadow-premium border border-white border-opacity-20 p-8 animate-slide-up backdrop-blur-xl">
          <div className="flex items-center justify-center mb-6">
            <button
              onClick={() => setIsSignUp(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                !isSignUp 
                  ? 'bg-white bg-opacity-20 text-white' 
                  : 'text-primary-300 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ml-2 ${
                isSignUp 
                  ? 'bg-white bg-opacity-20 text-white' 
                  : 'text-primary-300 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500 bg-opacity-10 border border-red-400 text-red-300 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Full Name
                </label>
                <div className="relative">
                  <UserPlus className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-300" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-12 block w-full rounded-xl border-0 bg-white bg-opacity-10 backdrop-blur-sm text-white placeholder-primary-300 shadow-sm focus:bg-opacity-20 focus:ring-2 focus:ring-gold-400 focus:ring-opacity-50 transition-all duration-200 py-4"
                    placeholder="Enter your full name"
                    required={isSignUp}
                  />
                </div>
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-6 py-4 border border-transparent text-lg font-semibold rounded-xl text-primary-900 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-900 mr-3"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In to Portal'}
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
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