'use client';import { useEffect, useState } from 'react';interface ClientOnlyWrapperProps {  children: React.ReactNode;  fallback?: React.ReactNode;}export default function ClientOnlyWrapper({   children,   fallback = (    <div className="min-h-screen bg-gray-50 flex items-center justify-center">      <div className="text-center">        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>        <p className="text-xl text-gray-600">載入中...</p>      </div>    </div>  )}: ClientOnlyWrapperProps) {  const [hasMounted, setHasMounted] = useState(false);  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
