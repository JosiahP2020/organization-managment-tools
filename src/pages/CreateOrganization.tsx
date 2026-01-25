import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";

type Step = "org-details" | "admin-account";

const CreateOrganization = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("org-details");

  // Organization details
  const [orgName, setOrgName] = useState("");

  // Admin account details
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleOrgDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!orgName.trim()) {
      setError("Please enter an organization name");
      return;
    }

    if (orgName.trim().length < 2) {
      setError("Organization name must be at least 2 characters");
      return;
    }

    setStep("admin-account");
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!adminEmail.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!adminPassword) {
      setError("Please enter a password");
      return;
    }

    if (adminPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (adminPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    // Simulate account creation - this will be connected to backend later
    setTimeout(() => {
      setIsLoading(false);
      setError("Backend not connected yet. Enable Lovable Cloud to add authentication.");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-surface-subtle flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Logo size="lg" />
        </div>

        {/* Card */}
        <div className="login-card">
          {/* Back button */}
          <button
            onClick={() => {
              if (step === "admin-account") {
                setStep("org-details");
              } else {
                navigate("/");
              }
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === "org-details"
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {step === "admin-account" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  "1"
                )}
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:inline">
                Organization
              </span>
            </div>
            <div className="w-8 h-px bg-border" />
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === "admin-account"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:inline">
                Admin Account
              </span>
            </div>
          </div>

          {step === "org-details" && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Create Organization
                </h1>
                <p className="text-muted-foreground">
                  Set up your organization workspace
                </p>
              </div>

              <form onSubmit={handleOrgDetailsSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="orgName"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Organization Name
                  </label>
                  <input
                    id="orgName"
                    type="text"
                    value={orgName}
                    onChange={(e) => {
                      setOrgName(e.target.value);
                      setError("");
                    }}
                    placeholder="e.g., ShellStar Cabinets"
                    className="input-field"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    This name will be used for employees to login to your workspace
                  </p>
                  {error && (
                    <p className="text-destructive text-sm mt-2">{error}</p>
                  )}
                </div>

                <button type="submit" className="btn-primary w-full">
                  Continue
                </button>
              </form>
            </>
          )}

          {step === "admin-account" && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Create Admin Account
                </h1>
                <p className="text-muted-foreground">
                  Set up your administrator account for{" "}
                  <span className="font-medium text-foreground">{orgName}</span>
                </p>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-5">
                <div>
                  <label
                    htmlFor="adminEmail"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Admin Email
                  </label>
                  <input
                    id="adminEmail"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => {
                      setAdminEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="admin@company.com"
                    className="input-field"
                    autoFocus
                  />
                </div>

                <div>
                  <label
                    htmlFor="adminPassword"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="adminPassword"
                      type={showPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="••••••••"
                      className="input-field pr-12"
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be at least 8 characters
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="••••••••"
                      className="input-field pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
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
                    "Create Organization"
                  )}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an organization?{" "}
            <button onClick={() => navigate("/login")} className="link-primary">
              Sign in
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

export default CreateOrganization;
