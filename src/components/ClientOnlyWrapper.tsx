"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface ClientOnlyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ClientOnlyWrapper({
  children,
  fallback,
}: ClientOnlyWrapperProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <>
        {fallback || (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-xl text-gray-600">
                {i18n.isInitialized ? t("loading.initializing") : "載入中..."}
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}
