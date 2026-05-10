"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.message) {
        // Use Next.js router for better handling
        toast.success('Login successful!');
        // Redirect to dashboard - middleware will handle authentication
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        setError(data.error || 'Login failed');
        toast.error(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePasswordLoading(true);

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, oldPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password changed successfully!');
        setShowChangePassword(false);
        setOldPassword('');
        setNewPassword('');
      } else {
        toast.error(data.error || 'Password change failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#eeeee9]">
      {/* Left Side - Shoes Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1c3430] to-[#0f1f1c]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Image
                src="/Ramkrishna.png"
                alt="Premium Shoes"
                width={300}
                height={300}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#1c3430] mb-2">Welcome Back</h1>
            <p className="text-[#4b4c49]">Sign in to your account</p>
          </div>

          {!showChangePassword && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#4b4c49] mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-[#dfc797] rounded-lg focus:ring-2 focus:ring-[#1c3430] focus:border-transparent bg-white text-[#4b4c49] placeholder-[#4b4c49] placeholder-opacity-50"
                  placeholder="Enter your email"
                  required
                  suppressHydrationWarning={true}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#4b4c49] mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-[#dfc797] rounded-lg focus:ring-2 focus:ring-[#1c3430] focus:border-transparent bg-white text-[#4b4c49] placeholder-[#4b4c49] placeholder-opacity-50"
                    placeholder="Enter your password"
                    required
                    suppressHydrationWarning={true}
                  />
                  {mounted && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4b4c49] hover:text-[#1c3430] focus:outline-none"
                    >
                      {showPassword ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="w-4 h-4 text-[#1c3430] border-[#dfc797] rounded focus:ring-[#1c3430]"
                    suppressHydrationWarning={true}
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-[#4b4c49]">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className="text-sm cursor-pointer text-[#1c3430] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {mounted && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1c3430] text-white py-3 px-4 rounded-lg hover:bg-[#0f1f1c] transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              )}
            </form>
          )}

          {showChangePassword && (
            <form onSubmit={handleChangePassword} className="mt-6 space-y-4 p-4 bg-white rounded-lg border border-[#dfc797]">
              <h3 className="text-lg font-semibold text-[#1c3430]">Change Password</h3>
              <div>
                <label htmlFor="oldPassword" className="block text-sm font-medium text-[#4b4c49] mb-2">
                  Old Password
                </label>
                <div className="relative">
                  <input
                    id="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-[#dfc797] rounded-lg focus:ring-2 focus:ring-[#1c3430] focus:border-transparent bg-white text-[#4b4c49] placeholder-[#4b4c49] placeholder-opacity-50"
                    placeholder="Enter old password"
                    required
                    suppressHydrationWarning={true}
                  />
                  {mounted && (
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4b4c49] hover:text-[#1c3430] focus:outline-none"
                    >
                      {showOldPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-[#4b4c49] mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-[#dfc797] rounded-lg focus:ring-2 focus:ring-[#1c3430] focus:border-transparent bg-white text-[#4b4c49] placeholder-[#4b4c49] placeholder-opacity-50"
                    placeholder="Enter new password"
                    required
                    suppressHydrationWarning={true}
                  />
                  {mounted && (
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4b4c49] hover:text-[#1c3430] focus:outline-none"
                    >
                      {showNewPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
              {mounted && (
                <button
                  type="submit"
                  disabled={changePasswordLoading}
                  className="w-full bg-[#1c3430] text-white py-3 px-4 rounded-lg hover:bg-[#0f1f1c] transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changePasswordLoading ? 'Changing...' : 'Change Password'}
                </button>
              )}
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-[#4b4c49]">
              Don't have an account?{" "}
              <a href="#" className="text-[#1c3430] hover:underline font-medium">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
