import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const OrganizationLogin = () => {
  const navigate = useNavigate();
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizationName.trim()) {
      setError("Please enter your organization name");
      return;
    }

    setIsLoading(true);
    setError("");

    // Generate slug from organization name
    const slug = organizationName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    // Check if organization exists
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();

    setIsLoading(false);

    if (orgError) {
      setError("An error occurred. Please try again.");
      return;
    }

    if (!org) {
      setError("Organization not found. Please check the name or create a new one.");
      return;
    }

    // Navigate to employee login with the organization slug
    navigate(`/login/${slug}`);
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
                disabled={isLoading}
              />
              {error && (
                <p className="text-destructive text-sm mt-2">{error}</p>
              )}
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
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
