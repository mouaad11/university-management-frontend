'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function withAuth(Component: React.ComponentType, allowedRole: string) {
  return function ProtectedRoute() {
    const router = useRouter();

    useEffect(() => {
      const role = localStorage.getItem('role');
      if (!role) {
        router.push('/auth/login');
        return;
      }

      if (role !== allowedRole) {
        switch (role) {
          case 'ROLE_ADMIN':
            router.push('/admin');
            break;
          case 'ROLE_STUDENT':
            router.push('/student');
            break;
          case 'ROLE_PROFESSOR':
            router.push('/professor');
            break;
          default:
            router.push('/auth/login');
        }
      }
    }, []);

    return <Component />;
  };
}
export default withAuth;