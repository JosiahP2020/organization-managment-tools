import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ArrowLeft, ArrowRight } from "lucide-react";

const OrganizationLogin = () => {
  const navigate = useNavigate();
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState("");

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizationName.trim()) {
      setError("Please enter your organization name");
      return;
    }

    // Navigate to employee login with the organization name
    navigate(`/login/${encodeURIComponent(organizationName.trim())}`);
  };

  return (
    <div className="min-h-screen bg-surface-subtle flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Logo size="lg" />
        </div>

        {/* Login Card */}
        <div className="login-card">
          {/* Back button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Enter Organization
            </h1>
            <p className="text-muted-foreground">
              Enter your organization name to continue
            </p>
          </div>

          <form onSubmit={handleContinue} className="space-y-6">
            <div>
              <label
                htmlFor="organization"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Organization Name
              </label>
              <input
                id="organization"
                type="text"
                value={organizationName}
                onChange={(e) => {
                  setOrganizationName(e.target.value);
                  setError("");
                }}
                placeholder="e.g., ShellStar Cabinets"
                className="input-field"
                autoFocus
              />
              {error && (
                <p className="text-destructive text-sm mt-2">{error}</p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an organization?{" "}
            <button
              onClick={() => navigate("/create-organization")}
              className="link-primary"
            >
              Create one
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          © {new Date().getFullYear()} ShellStar Custom Cabinets. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default OrganizationLogin;
