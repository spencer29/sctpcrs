'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  AppRole,
  ResourceType,
  PermissionAction,
  hasPermission,
  canAccessResource,
  getAllowedActions,
  canAccessRoute,
  ROLE_DEFINITIONS,
} from '@/lib/rbac/permissions';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: AppRole;
  department: string;
  job_title: string;
  is_active: boolean;
}

interface TeamMembership {
  team_id: string;
  team_name: string;
  team_type: string;
  role_override: AppRole | null;
  effective_role: AppRole;
}

interface AuthContextValue {
  user: any;
  session: any;
  loading: boolean;
  profile: UserProfile | null;
  role: AppRole | null;
  teams: TeamMembership[];
  // Auth actions
  signUp: (email: string, password: string, metadata?: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<any>;
  isEmailVerified: () => boolean;
  getUserProfile: () => Promise<UserProfile | null>;
  // RBAC helpers
  can: (resource: ResourceType, action: PermissionAction) => boolean;
  canAccess: (resource: ResourceType) => boolean;
  allowedActions: (resource: ResourceType) => PermissionAction[];
  canVisit: (path: string) => boolean;
  isAdmin: () => boolean;
  isRiskOfficer: () => boolean;
  isAnalyst: () => boolean;
  isViewer: () => boolean;
  roleDefinition: typeof ROLE_DEFINITIONS[AppRole] | null;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [teams, setTeams] = useState<TeamMembership[]>([]);
  const supabase = createClient();

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileData) {
        setProfile(profileData as UserProfile);
      }

      // Fetch team memberships
      const { data: memberData } = await supabase
        .from('team_members')
        .select(`
          team_id,
          role_override,
          teams (
            name,
            team_type
          )
        `)
        .eq('user_id', userId);

      if (memberData) {
        const memberships: TeamMembership[] = memberData.map((m: any) => ({
          team_id: m.team_id,
          team_name: m.teams?.name ?? '',
          team_type: m.teams?.team_type ?? '',
          role_override: m.role_override ?? null,
          effective_role: m.role_override ?? profileData?.role ?? 'viewer',
        }));
        setTeams(memberships);
      }
    } catch {
      // Profile may not exist yet (new user)
    }
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'MFA_CHALLENGE_VERIFIED' ||
        event === 'USER_UPDATED'
      ) {
        if (session?.user) {
          fetchProfile(session.user.id).finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setTeams([]);
        setLoading(false);
      } else {
        if (session?.user) {
          fetchProfile(session.user.id).finally(() => setLoading(false));
        } else {
          setProfile(null);
          setTeams([]);
          setLoading(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, supabase.auth]);

  const refreshProfile = useCallback(async () => {
    if (user?.id) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  const signUp = async (email: string, password: string, metadata: any = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata?.fullName || '',
          avatar_url: metadata?.avatarUrl || '',
          role: metadata?.role || 'viewer',
          department: metadata?.department || '',
          job_title: metadata?.jobTitle || '',
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? (typeof window !== 'undefined' ? window.location.origin : '')}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  };

  const isEmailVerified = () => user?.email_confirmed_at !== null;

  const getUserProfile = async (): Promise<UserProfile | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) throw error;
    return data as UserProfile;
  };

  // RBAC helpers
  const role = profile?.role ?? null;

  const can = (resource: ResourceType, action: PermissionAction) =>
    hasPermission(role, resource, action);

  const canAccess = (resource: ResourceType) =>
    canAccessResource(role, resource);

  const allowedActions = (resource: ResourceType) =>
    getAllowedActions(role, resource);

  const canVisit = (path: string) => canAccessRoute(role, path);

  const isAdmin = () => role === 'admin';
  const isRiskOfficer = () => role === 'risk_officer';
  const isAnalyst = () => role === 'analyst';
  const isViewer = () => role === 'viewer';

  const roleDefinition = role ? ROLE_DEFINITIONS[role] : null;

  const value: AuthContextValue = {
    user,
    session,
    loading,
    profile,
    role,
    teams,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    isEmailVerified,
    getUserProfile,
    can,
    canAccess,
    allowedActions,
    canVisit,
    isAdmin,
    isRiskOfficer,
    isAnalyst,
    isViewer,
    roleDefinition,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
