import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ArrowLeft, Eye, EyeOff, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const EmployeeLogin = () => {
  const navigate = useNavigate();
  const { organizationName } = useParams<{ organizationName: string }>();
  const { user, organization } = useAuth();
  
  const [orgData, setOrgData] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingOrg, setIsCheckingOrg] = useState(true);
  const [orgNotFound, setOrgNotFound] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && organization) {
      navigate(`/dashboard/${organization.slug}`);
    }
  }, [user, organization, navigate]);

  // Fetch organization data
  useEffect(() => {
    const fetchOrg = async () => {
      if (!organizationName) {
        navigate("/login");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("organizations")
        .select("id, name, slug")
        .eq("slug", organizationName)
        .maybeSingle();

      setIsCheckingOrg(false);

      if (fetchError || !data) {
        setOrgNotFound(true);
        return;
      }

      setOrgData(data);
    };

    fetchOrg();
  }, [organizationName, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setIsLoading(false);
      setError(authError.message === "Invalid login credentials" 
        ? "Invalid email or password" 
        : authError.message);
      return;
    }

    // Auth state change will handle redirect
  };

  if (isCheckingOrg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-subtle">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Show error if organization not found
  if (orgNotFound) {
    return (
      <div className="min-h-screen bg-surface-subtle flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex justify-center mb-10">
            <Logo size="lg" />
          </div>
          <div className="login-card text-center">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Organization Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              We couldn't find an organization with that name. Please check the name and try again.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="btn-primary w-full"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>

          {/* Organization Badge */}
          <div className="flex items-center justify-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-full mb-6 mx-auto w-fit">
            <Building2 className="w-4 h-4" />
            <span className="text-sm font-medium">{orgData?.name}</span>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Employee Sign In
            </h1>
            <p className="text-muted-foreground">
              Sign in with your employee account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="you@company.com"
                className="input-field"
                autoFocus
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  className="input-field pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="text-center text-sm text-muted-foreground mt-6 space-y-2">
            <button className="link-subtle block w-full">
              Forgot your password?
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

export default EmployeeLogin;
