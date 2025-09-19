import { getSupabase, tryGetSupabase } from "./supabaseClient";

export const authService = {
  async signUp(email: string, password: string, userData: Record<string, any> = {}) {
    const { data, error } = await getSupabase().auth.signUp({
      email,
      password,
      options: { data: userData },
    });
    if (error) throw error;
    return { user: data.user, session: data.session };
  },
  async signIn(email: string, password: string) {
    const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { user: data.user, session: data.session };
  },
  async signOut() {
    const { error } = await getSupabase().auth.signOut();
    if (error) throw error;
  },
  async signInWithGithub() {
    const { data, error } = await getSupabase().auth.signInWithOAuth({ provider: "github" });
    if (error) throw error;
    return data;
  },
  async signInAnonymously() {
    const { data, error } = await getSupabase().auth.signInAnonymously();
    if (error) throw error;
    return data;
  },
  async resetPassword(email: string) {
    const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },
  async updatePassword(newPassword: string) {
    const { error } = await getSupabase().auth.updateUser({ password: newPassword });
    if (error) throw error;
  },
  async getSession() {
    const { data: { session }, error } = await getSupabase().auth.getSession();
    if (error) throw error;
    return session;
  },
  async getUser() {
    const { data: { user }, error } = await getSupabase().auth.getUser();
    if (error) throw error;
    return user;
  },
  onAuthStateChange(callback: Parameters<ReturnType<typeof getSupabase>["auth"]["onAuthStateChange"]>[0]) {
    const c = tryGetSupabase();
    if (!c) {
      return { data: { subscription: { unsubscribe() {} } } } as any;
    }
    return c.auth.onAuthStateChange(callback);
  },
};
