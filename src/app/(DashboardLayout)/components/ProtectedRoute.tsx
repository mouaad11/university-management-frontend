"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      // Redirect to login if not authenticated
      router.push("/authentication/login");
      return;
    }

    try {
      // Decode the JWT token to get the user's role
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const role = decodedToken.role[0]; // Extract the first role from the list

      // Check if the token is expired
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem("token");
        router.push("/authentication/login");
        return;
      }

      setIsAuthenticated(true);

      // Define allowed routes for each role
      const roleRoutes: { [key: string]: string } = {
        ROLE_ADMIN: "/admin",
        ROLE_STUDENT: "/student",
        ROLE_PROFESSOR: "/professor",
      };

      // Redirect if the user is not on their role-specific page
      const allowedRoute = roleRoutes[role];
      if (allowedRoute && !pathname.startsWith(allowedRoute)) {
        router.push(allowedRoute);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("token");
      router.push("/authentication/login");
    }
  }, [router, pathname]);

  // Render the children only if authenticated
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;