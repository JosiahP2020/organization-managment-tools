import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Building2, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Index = () => {
  const navigate = useNavigate();
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (organizationName.trim() && email.trim() && password.trim()) {
      // Navigate to dashboard with organization context
      const orgSlug = organizationName.toLowerCase().replace(/\s+/g, "-");
      navigate(`/dashboard/${orgSlug}`);
    }
  };

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

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="organization">Organization Name</Label>
              <Input
                id="organization"
                type="text"
                placeholder="Enter your organization name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-3 mt-6"
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </button>
          </form>

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

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          © {new Date().getFullYear()} ShellStar Custom Cabinets. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Index;
