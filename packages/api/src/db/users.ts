import { supabase, isSupabaseConfigured } from '../supabase';
import type { User, WalletTransaction } from '../types';

export function mapDbUserToUser(dbUser: any): any {
  if (!dbUser) return null;
  const tier = dbUser.membership_tier || 'standard';
  const formattedTier = tier.charAt(0).toUpperCase() + tier.slice(1);
  return {
    id: dbUser.id || '—',
    uuid: dbUser.id,
    name: dbUser.name || '—',
    phone: dbUser.phone || '—',
    email: dbUser.email || '—',
    avatar: dbUser.avatar,
    isVerified: Boolean(dbUser.is_verified),
    membershipTier: formattedTier,
    walletBalance: Number(dbUser.wallet_balance || 0),
    totalTrips: 0,
    status: dbUser.is_verified !== false ? 'Active' : 'Suspended',
    joined: dbUser.created_at ? new Date(dbUser.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—',
    vehicles: [],
    createdAt: dbUser.created_at || new Date().toISOString(),
  };
}

export async function getUsers(): Promise<any[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(mapDbUserToUser);
  } catch (err) {
    console.warn('getUsers error:', err);
    return [];
  }
}

export async function getUserById(id: string): Promise<any | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return mapDbUserToUser(data);
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser(): Promise<any | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return mapDbUserToUser(data);
  } catch (err) {
    return null;
  }
}

export async function createUser(data: Partial<User>): Promise<any | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const insertPayload: any = {
      name: data.name || 'New User',
      phone: data.phone || '',
      email: data.email || null,
      avatar: data.avatar || null,
      is_verified: data.isVerified ?? false,
      membership_tier: data.membershipTier?.toLowerCase() || 'standard',
      wallet_balance: data.walletBalance || 0,
    };
    const { data: created, error } = await supabase
      .from('users')
      .insert(insertPayload)
      .select()
      .single();

    if (error || !created) return null;
    return mapDbUserToUser(created);
  } catch (err) {
    return null;
  }
}

export async function updateUser(id: string, data: any): Promise<any | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const updatePayload: any = { updated_at: new Date().toISOString() };
    if (data.membershipTier !== undefined) updatePayload.membership_tier = data.membershipTier.toLowerCase();
    if (data.walletBalance !== undefined) updatePayload.wallet_balance = data.walletBalance;
    if (data.isVerified !== undefined) updatePayload.is_verified = data.isVerified;
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.email !== undefined) updatePayload.email = data.email;

    const { data: updated, error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) return null;
    return mapDbUserToUser(updated);
  } catch (err) {
    console.warn('updateUser error:', err);
    return null;
  }
}

export async function getUserWalletTransactions(userId: string): Promise<WalletTransaction[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((t: any) => ({
      id: t.id,
      type: t.type,
      amount: Number(t.amount || 0),
      description: t.description || 'Transaction',
      date: t.created_at ? new Date(t.created_at).toISOString().split('T')[0] : '—',
      bookingId: t.booking_id,
      paymentId: t.payment_id,
      settlementId: t.settlement_id,
      utrNumber: t.utr_number
    }));
  } catch (err) {
    return [];
  }
}

export async function updateWalletBalance(userId: string, amount: number): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const { data: user } = await supabase.from('users').select('wallet_balance').eq('id', userId).maybeSingle();
    const current = Number(user?.wallet_balance || 0);
    await supabase.from('users').update({ wallet_balance: current + amount, updated_at: new Date().toISOString() }).eq('id', userId);
  } catch (err) {
    console.warn(err);
  }
}
