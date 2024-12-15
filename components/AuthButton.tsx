'use client'

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';

export default function AuthButton() {
  const { user, isLoading, login, logout } = useAuth();
  const router = useRouter();

  const handleAuth = async () => {
    if (user) {
      try {
        await logout();
        router.push('/login');
      } catch (error) {
        toast.error("Logout failed. Please try again.");
      }
    } else {
      try {
        await login();
      } catch (error) {
        toast.error("Login failed. Please try again.");
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Button onClick={handleAuth} variant="default">
      {user ? 'Logout' : 'Login with Lichess'}
    </Button>
  );
}

