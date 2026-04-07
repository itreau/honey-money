import "./styles/globals.css";
import BudgetPage from "@/pages/BudgetPage";
import { AuthProvider } from "@/auth/AuthContext";
import { ProtectedRoute } from "@/auth/ProtectedRoute";

export function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="p-4">
          <BudgetPage />
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
