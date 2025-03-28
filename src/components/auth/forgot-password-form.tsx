"use client";

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FiMail, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage('Erro ao processar solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center">
            <FiAlertCircle className="mr-2" />
            <span>{message}</span>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </Label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiMail className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="pl-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full flex justify-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
        disabled={isLoading}
      >
        {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
      </Button>

      <div className="text-center">
        <a href="/" className="text-sm text-indigo-600 hover:text-indigo-500">
          Voltar para o login
        </a>
      </div>
    </form>
  );
} 