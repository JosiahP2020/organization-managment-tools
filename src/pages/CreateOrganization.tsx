import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Step = "org-details" | "admin-account";

const CreateOrganization = () => {
  const navigate = useNavigate();
  const { user, organization } = useAuth();
  const [step, setStep] = useState<Step>("org-details");

  // Organization details
  const [orgName, setOrgName] = useState("");

  // Admin account details
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && organization) {
      navigate(`/dashboard/${organization.slug}`);
    }
  }, [user, organization, navigate]);

  const handleOrgDetailsSubmit = async (e: React.FormEvent) => {
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

    // Generate slug and check if it exists
    const slug = orgName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    
    setIsLoading(true);
    
    const { data: existingOrg } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    setIsLoading(false);

    if (existingOrg) {
      setError("An organization with this name already exists");
      return;
    }

    setStep("admin-account");
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!adminName.trim()) {
      setError("Please enter your name");
      return;
    }

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

    // Generate slug from organization name
    const slug = orgName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    // 1. Create organization first (using service role via edge function would be ideal, 
    // but for now we'll create after signup using the user's auth)
    
    // First sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminEmail.trim(),
      password: adminPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (authError) {
      setIsLoading(false);
      if (authError.message.includes("already registered")) {
        setError("This email is already registered. Please sign in instead.");
      } else {
        setError(authError.message);
      }
      return;
    }

    if (!authData.user) {
      setIsLoading(false);
      setError("Failed to create account. Please try again.");
      return;
    }

    // 2. Create organization
    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: orgName.trim(),
        slug: slug,
      })
      .select()
      .single();

    if (orgError) {
      setIsLoading(false);
      setError("Failed to create organization. Please try again.");
      return;
    }

    // 3. Create profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        organization_id: orgData.id,
        full_name: adminName.trim(),
      });

    if (profileError) {
      setIsLoading(false);
      setError("Failed to create profile. Please try again.");
      return;
    }

    // 4. Create admin role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: authData.user.id,
        organization_id: orgData.id,
        role: "admin",
      });

    if (roleError) {
      setIsLoading(false);
      setError("Failed to assign admin role. Please try again.");
      return;
    }

    // 5. Seed default categories
    const defaultCategories = [
      {
        organization_id: orgData.id,
        created_by: authData.user.id,
        name: "Shop & Install",
        icon: "wrench",
        description: "Project management, follow-up lists, and measurement tools.",
        show_on_dashboard: true,
        show_in_sidebar: true,
        sort_order: 0,
      },
      {
        organization_id: orgData.id,
        created_by: authData.user.id,
        name: "SOP",
        icon: "graduation-cap",
        description: "SOP, Machine Operation, and Machine Maintenance.",
        show_on_dashboard: true,
        show_in_sidebar: true,
        sort_order: 1,
      },
    ];

    const { error: categoriesError } = await supabase
      .from("menu_categories")
      .insert(defaultCategories);

    if (categoriesError) {
      console.error("Failed to seed default categories:", categoriesError);
      // Non-blocking - continue even if category seeding fails
    }

    // Success! Auth state change will handle redirect
    setIsLoading(false);
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
                    placeholder="Shellstar Custom Cabinets"
                    className="input-field"
                    autoFocus
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    This name will be used for employees to login to your workspace
                  </p>
                  {error && (
                    <p className="text-destructive text-sm mt-2">{error}</p>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn-primary w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mx-auto" />
                  ) : (
                    "Continue"
                  )}
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
                    htmlFor="adminName"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Your Name
                  </label>
                  <input
                    id="adminName"
                    type="text"
                    value={adminName}
                    onChange={(e) => {
                      setAdminName(e.target.value);
                      setError("");
                    }}
                    placeholder="John Doe"
                    className="input-field"
                    autoFocus
                    disabled={isLoading}
                  />
                </div>

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
                    disabled={isLoading}
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
                      disabled={isLoading}
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
