"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      // Redirect to login if not authenticated
      router.push("/authentication/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Render the children only if authenticated
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;