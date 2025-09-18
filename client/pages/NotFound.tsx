import { useLocation } from "react-router-dom";
import { useEffect } from "react";

import { AppShell } from "@/components/layout/AppShell";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <AppShell>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-4xl font-bold">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
          <a href="/" className="text-primary underline-offset-4 hover:underline">
            Return to Home
          </a>
        </div>
      </div>
    </AppShell>
  );
};

export default NotFound;
