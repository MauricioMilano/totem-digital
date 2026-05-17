'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { findClientByCpf, createClient } from '@/lib/mock-data';
import { Client } from '@/types';
import { UserCheck, UserPlus, ArrowRight } from 'lucide-react';

interface CheckinFormProps {
  onClientFound: (client: Client) => void;
}

export function CheckinForm({ onClientFound }: CheckinFormProps) {
  const [cpf, setCpf] = useState('');
  const [step, setStep] = useState<'cpf' | 'new-client'>('cpf');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCpf = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const handleCpfSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      setError('CPF deve ter 11 dígitos');
      setLoading(false);
      return;
    }

    // Simulate a brief loading state for UX
    setTimeout(() => {
      const client = findClientByCpf(cleanCpf);
      if (client) {
        onClientFound(client);
      } else {
        setStep('new-client');
      }
      setLoading(false);
    }, 600);
  };

  const handleNewClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !phone.trim() || !birthDate) {
      setError('Preencha todos os campos');
      return;
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    const newClient = createClient(
      name.trim(),
      cleanCpf,
      phone.trim(),
      birthDate
    );
    onClientFound(newClient);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <Card className="w-full max-w-md border-gray-700 bg-gray-800/80 text-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center">
              {step === 'cpf' ? (
                <UserCheck className="h-8 w-8" />
              ) : (
                <UserPlus className="h-8 w-8" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl text-white">
            {step === 'cpf' ? 'Bem-vindo!' : 'Novo Cliente'}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {step === 'cpf'
              ? 'Digite seu CPF para fazer check-in'
              : 'Preencha seus dados para continuar'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'cpf' ? (
            <form onSubmit={handleCpfSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-gray-300">
                  CPF
                </Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(formatCpf(e.target.value))}
                  maxLength={14}
                  className="text-lg text-center bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                  autoFocus
                  autoComplete="off"
                />
              </div>
              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  'Consultando...'
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleNewClientSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300">
                  Telefone
                </Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-8888"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-gray-300">
                  Data de Nascimento
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white [color-scheme:dark]"
                />
              </div>
              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}
              <Button type="submit" className="w-full" size="lg">
                Confirmar
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
