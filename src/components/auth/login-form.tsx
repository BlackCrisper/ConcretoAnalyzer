"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FiUser, FiLock, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '@/contexts/auth-context';

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(email, password);

      if (success) {
        router.push('/dashboard');
      } else {
        setError('Credenciais inválidas. Por favor, tente novamente.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Erro ao fazer login. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center">
            <FiAlertCircle className="mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </Label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiUser className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="pl-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="admin@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Senha
        </Label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiLock className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="pl-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="remember-me"
          name="remember-me"
          type="checkbox"
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
          Lembrar-me
        </label>
      </div>

      <div>
        <Button
          type="submit"
          className="w-full flex justify-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </div>

      <div className="text-sm text-center text-gray-600 border-t border-gray-200 pt-4 mt-4">
        <p className="text-sm font-medium mb-1">Credenciais de demonstração:</p>
        <p className="text-xs">Admin: admin@exemplo.com / admin123</p>
        <p className="text-xs">Super Admin: superadmin@exemplo.com / super123</p>
        <p className="text-xs">Usuário: user@exemplo.com / user123</p>
      </div>
    </form>
  );
}
