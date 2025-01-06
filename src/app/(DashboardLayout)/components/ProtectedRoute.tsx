"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Redirect to login if not authenticated
      router.push("/authentication/login");
    } else {
      // Decode the JWT token to get the user's role
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const role = decodedToken.role[0]; // Extract the first role from the list
      setIsAuthenticated(true);

      // Redirect based on role
      switch (role) {
        case "ROLE_ADMIN":
          router.push("/admin");
          break;
        case "ROLE_STUDENT":
          router.push("/student");
          break;
        case "ROLE_PROFESSOR":
          router.push("/professor");
          break;
        default:
          router.push("/authentication/login");
      }
    }
  }, [router]);

  // Render the children only if authenticated
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;