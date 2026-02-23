import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { type UserRole, type User, currentStudent, currentTeacher, currentAdmin } from "./mock-data";

interface AuthContextType {
  role: UserRole;
  user: User;
  setRole: (role: UserRole) => void;
  showProfileSetup: boolean;
  setShowProfileSetup: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const usersByRole: Record<UserRole, User> = {
  student: currentStudent,
  teacher: currentTeacher,
  admin: currentAdmin,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("student");
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        role,
        user: usersByRole[role],
        setRole,
        showProfileSetup,
        setShowProfileSetup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
