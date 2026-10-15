
import { supabase } from './supabaseClient';

export const authService = {
  signInWithPassword: async ({ email, password }) => {
    if (!supabase) {
      return {
        data: null,
        error: { message: 'Supabase is not configured. Check your .env file.' },
      };
    }

    return supabase.auth.signInWithPassword({ email, password });
  },

  signUp: async ({ name, email, password }) => {
    if (!supabase) {
      return {
        data: null,
        error: { message: 'Supabase is not configured. Check your .env file.' },
      };
    }

    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: window.location.origin,
      },
    });
  },

  signInWithGoogle: async () => {
    if (!supabase) {
      return {
        data: null,
        error: { message: 'Supabase is not configured. Check your .env file.' },
      };
    }

   
return supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/dashboard`,
  },
});

  },

  resetPassword: async ({ email }) => {
    if (!supabase) {
      return {
        data: null,
        error: { message: 'Supabase is not configured. Check your .env file.' },
      };
    }

    return supabase.auth.resetPasswordForEmail(email, {
      
redirectTo: `${window.location.origin}/dashboard`,

    });
  },
};
