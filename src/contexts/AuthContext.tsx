import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

// Theme-aware color mappings for SVG logos
interface ThemeColorMappings {
  light: Record<string, string>;
  dark: Record<string, string>;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  logo_url: string | null;
  main_logo_url: string | null;
  sub_logo_url: string | null;
  main_logo_dark_url: string | null;
  sub_logo_dark_url: string | null;
  display_name: string | null;
  accent_color: string | null;
  main_logo_colors: ThemeColorMappings | null;
  sub_logo_colors: ThemeColorMappings | null;
}

interface Profile {
  id: string;
  organization_id: string;
  full_name: string;
  avatar_url: string | null;
}

interface UserRole {
  role: AppRole;
  organization_id: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  organization: Organization | null;
  userRole: UserRole | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, organizationId: string, isAdmin?: boolean) => Promise<{ error: Error | null }>;
  createUserAsAdmin: (email: string, password: string, fullName: string, organizationId: string, isAdmin?: boolean) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshOrganization: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = userRole?.role === "admin";

  // Helper to parse theme color mappings from JSON
  const parseThemeColors = (data: unknown): ThemeColorMappings | null => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return null;
    }
    
    const obj = data as Record<string, unknown>;
    
    // Check if it has the new light/dark structure
    if (obj.light || obj.dark) {
      return {
        light: obj.light && typeof obj.light === 'object' && !Array.isArray(obj.light)
          ? obj.light as Record<string, string>
          : {},
        dark: obj.dark && typeof obj.dark === 'object' && !Array.isArray(obj.dark)
          ? obj.dark as Record<string, string>
          : {},
      };
    }
    
    // Legacy format - treat as light mode only
    return {
      light: obj as Record<string, string>,
      dark: {},
    };
  };

  // Fetch organization data
  const fetchOrganization = useCallback(async (organizationId: string) => {
    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", organizationId)
      .maybeSingle();

    if (orgError) throw orgError;
    
    if (orgData) {
      // Cast JSON fields to proper types
      const organization: Organization = {
        ...orgData,
        main_logo_colors: parseThemeColors(orgData.main_logo_colors),
        sub_logo_colors: parseThemeColors(orgData.sub_logo_colors),
      };
      setOrganization(organization);
    } else {
      setOrganization(null);
    }
  }, []);

  // Refresh organization data (useful after updates)
  const refreshOrganization = useCallback(async () => {
    if (profile?.organization_id) {
      await fetchOrganization(profile.organization_id);
    }
  }, [profile?.organization_id, fetchOrganization]);

  // Fetch user profile, organization, and role
  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profileData) {
        setProfile(profileData);

        // Fetch organization
        await fetchOrganization(profileData.organization_id);

        // Fetch user role
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role, organization_id")
          .eq("user_id", userId)
          .eq("organization_id", profileData.organization_id)
          .maybeSingle();

        if (roleError) throw roleError;
        setUserRole(roleData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer Supabase calls with setTimeout to prevent deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setOrganization(null);
          setUserRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    organizationId: string,
    isAdmin: boolean = false
  ) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (authError) return { error: authError as Error };

    if (authData.user) {
      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        organization_id: organizationId,
        full_name: fullName,
      });

      if (profileError) return { error: profileError as Error };

      // Create user role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: authData.user.id,
        organization_id: organizationId,
        role: isAdmin ? "admin" : "employee",
      });

      if (roleError) return { error: roleError as Error };
    }

    return { error: null };
  };

  // Create user as admin - preserves admin session
  const createUserAsAdmin = async (
    email: string,
    password: string,
    fullName: string,
    organizationId: string,
    isAdmin: boolean = false
  ) => {
    // Store current session before creating new user
    const currentSession = session;
    
    const redirectUrl = `${window.location.origin}/`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (authError) return { error: authError as Error };

    if (authData.user) {
      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        organization_id: organizationId,
        full_name: fullName,
      });

      if (profileError) {
        console.error("Error creating profile:", profileError);
      }

      // Create user role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: authData.user.id,
        organization_id: organizationId,
        role: isAdmin ? "admin" : "employee",
      });

      if (roleError) {
        console.error("Error creating user role:", roleError);
      }
    }

    // Restore admin session if it was active
    if (currentSession?.refresh_token) {
      await supabase.auth.setSession({
        access_token: currentSession.access_token,
        refresh_token: currentSession.refresh_token,
      });
    }

    return { error: null };
  };

  const signOut = async () => {
    // Clear state first to prevent UI from trying to use stale data
    setProfile(null);
    setOrganization(null);
    setUserRole(null);
    setUser(null);
    setSession(null);
    
    // Then sign out from Supabase
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        organization,
        userRole,
        isLoading,
        isAdmin,
        signIn,
        signUp,
        createUserAsAdmin,
        signOut,
        refreshOrganization,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
