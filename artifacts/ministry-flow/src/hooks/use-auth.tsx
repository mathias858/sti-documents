import { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetCurrentUser, getGetCurrentUserQueryKey, UserWithDetails } from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface AuthContextType {
  user: UserWithDetails | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(() => 
    localStorage.getItem("ministry_flow_token")
  );

  const { data: user, isLoading, error } = useGetCurrentUser({
    query: {
      queryKey: getGetCurrentUserQueryKey(),
      enabled: !!token,
      retry: false,
    }
  });

  useEffect(() => {
    if (error) {
      // Token is invalid or expired
      logout();
    }
  }, [error]);

  const login = (newToken: string) => {
    localStorage.setItem("ministry_flow_token", newToken);
    setTokenState(newToken);
    queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
    setLocation("/");
  };

  const logout = () => {
    localStorage.removeItem("ministry_flow_token");
    setTokenState(null);
    queryClient.clear();
    setLocation("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: isLoading && !!token,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
