import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Users, Handshake, TrendingUp, ShoppingBag } from 'lucide-react';

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { user, login, isLoading } = useAuth() as any;
  const typedUser = user as { role: 'admin' | 'partner' } | null;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !isLoading) {
      console.log('🔄 Redirecting user:', user);
      if (typedUser?.role === 'admin') {
        navigate('/admin-panel');
      } else if (typedUser?.role === 'partner') {
        navigate('/partner-dashboard');
      }
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        // Navigation happens via useEffect above
      } else {
        setError(result.error || 'Login xatosi');
      }
    } catch (err) {
      setError('Tarmoq xatosi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <Handshake className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Partner Login</h2>
            <p className="mt-2 text-sm text-gray-600">
              MarketPlace Pro hamkor tizimiga kirish
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Partner Login</CardTitle>
              <CardDescription>
                Hamkor hisobingiz bilan tizimga kiring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Partner username"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kirish...
                    </>
                  ) : (
                    'Partner sifatida kirish'
                  )}
                </Button>
              </form>

              <div className="mt-6 border-t pt-4">
                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>Test Account:</strong></p>
                  <p>• Partner: "testhamkor" / "test123"</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Hali ro'yxatdan o'tmaganmisiz?{' '}
              <button
                onClick={() => navigate('/partner-registration')}
                className="font-medium text-green-600 hover:text-green-500"
              >
                Ro'yxatdan o'tish
              </button>
            </p>
            <p className="text-sm text-gray-600">
              Bosh sahifaga qaytish{' '}
              <button
                onClick={() => navigate('/')}
                className="font-medium text-green-600 hover:text-green-500"
              >
                Landing Page
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Hero Section */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-green-600 via-green-700 to-emerald-800">
        <div className="flex flex-col justify-center px-12 text-white">
          <div className="max-w-lg">
            <h1 className="text-4xl font-bold leading-tight mb-6">
              Partner<br />
              <span className="text-green-200">Dashboard</span><br />
              System
            </h1>
            
            <p className="text-xl text-green-100 mb-8">
              Mahsulotlar, buyurtmalar va daromadingizni boshqaring
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-500 rounded-full p-2">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <span className="text-green-100">Mahsulotlar katalogi</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-green-500 rounded-full p-2">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-green-100">Daromad tahlili</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-green-500 rounded-full p-2">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-green-100">Buyurtma boshqaruvi</span>
              </div>
            </div>

            <div className="mt-12 text-center">
              <div className="w-32 h-32 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                <Handshake className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}