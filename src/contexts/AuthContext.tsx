import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, schoolName: string, idFile: File | null) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resendVerification: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          toast.success("Welcome back!");
        } else if (event === 'SIGNED_OUT') {
          toast.info("Signed out successfully");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string, schoolName: string, idFile: File | null) => {
    // First, sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, schoolName },
        emailRedirectTo: `${window.location.origin}/auth/sign-in`,
      }
    });

    if (authError || !authData.user) {
      return { error: authError };
    }

    // Update profile with school name (always)
    const { error: schoolUpdateError } = await supabase
      .from('profiles')
      .update({ school_name: schoolName })
      .eq('id', authData.user.id);

    if (schoolUpdateError) {
      console.error("Failed to update profile with school name:", schoolUpdateError);
    }

    // If ID file is provided, upload it and update profile
    if (idFile && authData.user) {
      try {
        // Upload ID image to Supabase Storage
        const fileExt = idFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${authData.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('id-verifications')
          .upload(filePath, idFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error("Failed to upload ID:", uploadError);
          // Continue anyway - user can upload later
        } else {
          // Store the file path (bucket is private, admins access via Supabase dashboard)
          // For signed URL access, use: supabase.storage.from('id-verifications').createSignedUrl(filePath, 3600)
          const fileUrl = `id-verifications/${filePath}`;

          // Update profile with ID verification info
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              id_image_url: fileUrl,
              id_verification_status: 'pending',
              id_submitted_at: new Date().toISOString(),
            })
            .eq('id', authData.user.id);

          if (profileError) {
            console.error("Failed to update profile with ID:", profileError);
          }
        }
      } catch (err) {
        console.error("Error handling ID upload:", err);
        // Don't fail signup if ID upload fails
      }
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    }
  };

  const resendVerification = async () => {
    if (!user?.email) {
      return { error: { message: "No email found" } };
    }
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/sign-in`,
        }
      });
      
      if (error) {
        console.error("Resend verification error:", error);
        return { error };
      }
      
      return { error: null };
    } catch (err) {
      console.error("Resend verification exception:", err);
      return { error: err as Error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, resendVerification }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
