"use client";

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FiUser, FiMail, FiBriefcase, FiPhone, FiCheck, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, this would call an API endpoint to send the contact request
      setSubmitted(true);
    } catch (err) {
      setError('Erro ao enviar sua solicitação. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Solicitar nova conta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {submitted
            ? 'Sua solicitação foi enviada com sucesso'
            : 'Preencha o formulário abaixo para solicitar acesso ao sistema'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {submitted ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
                <div className="flex items-center">
                  <FiCheck className="mr-2" />
                  <span>Solicitação enviada com sucesso!</span>
                </div>
                <p className="text-sm mt-2">
                  Nossa equipe entrará em contato o mais breve possível para finalizar a criação da sua conta.
                </p>
              </div>
              <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Link href="/">Voltar para login</Link>
              </Button>
            </div>
          ) : (
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
                <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome completo
                </Label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="pl-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="João Silva"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email profissional
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
                    placeholder="nome@empresa.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  Empresa
                </Label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiBriefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    required
                    className="pl-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Nome da empresa"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Telefone
                </Label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="pl-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Mensagem (Opcional)
                </Label>
                <div className="mt-1">
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Descreva como pretende utilizar o sistema"
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Solicitar acesso'}
                </Button>
              </div>

              <div className="mt-4 text-center">
                <Link
                  href="/"
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Voltar para login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
