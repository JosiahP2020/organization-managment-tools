import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Building2, LogIn } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-subtle flex flex-col items-center justify-center p-4">
      {/* Main container */}
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Logo size="lg" />
        </div>

        {/* Login Card */}
        <div className="login-card">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Welcome Back
            </h1>
            <p className="text-muted-foreground">
              Sign in to your organization workspace
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Login to Existing Organization */}
            <button
              onClick={() => navigate("/login")}
              className="btn-primary w-full flex items-center justify-center gap-3"
            >
              <LogIn className="w-5 h-5" />
              Login to Organization
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-3 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Create New Organization */}
            <button
              onClick={() => navigate("/create-organization")}
              className="btn-secondary w-full flex items-center justify-center gap-3"
            >
              <Building2 className="w-5 h-5" />
              Create New Organization
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          © {new Date().getFullYear()} ShellStar Custom Cabinets. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Index;
