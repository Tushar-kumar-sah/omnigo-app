import { supabase, isSupabaseConfigured } from '../supabase';
import type { User, WalletTransaction } from '../types';

const META_DELIMITER = '#omnigo_meta=';

function unpackAvatarAndMeta(rawAvatar: string | null | undefined): {
  avatar: string | null;
  dob: string;
  gender: string;
} {
  if (!rawAvatar || typeof rawAvatar !== 'string') {
    return { avatar: null, dob: '', gender: '' };
  }
  const idx = rawAvatar.indexOf(META_DELIMITER);
  if (idx === -1) {
    return { avatar: rawAvatar, dob: '', gender: '' };
  }
  const cleanAvatar = rawAvatar.slice(0, idx) || null;
  const encoded = rawAvatar.slice(idx + META_DELIMITER.length);
  try {
    const parsed = JSON.parse(decodeURIComponent(encoded));
    return {
      avatar: cleanAvatar,
      dob: typeof parsed?.dob === 'string' ? parsed.dob : '',
      gender: typeof parsed?.gender === 'string' ? parsed.gender : '',
    };
  } catch {
    return { avatar: cleanAvatar, dob: '', gender: '' };
  }
}

function packAvatarWithMeta(
  cleanAvatar: string | null | undefined,
  meta: { dob?: string; gender?: string }
): string | null {
  const base = cleanAvatar ? cleanAvatar.split(META_DELIMITER)[0] : '';
  const dob = meta.dob ?? '';
  const gender = meta.gender ?? '';
  if (!dob && !gender) {
    return base || null;
  }
  const encoded = encodeURIComponent(JSON.stringify({ dob, gender }));
  return `${base}${META_DELIMITER}${encoded}`;
}

export function mapDbUserToUser(dbUser: any): any {
  if (!dbUser) return null;
  const tier = dbUser.membership_tier || 'standard';
  const formattedTier = tier.charAt(0).toUpperCase() + tier.slice(1);
  const { avatar, dob, gender } = unpackAvatarAndMeta(dbUser.avatar);
  return {
    id: dbUser.id || '—',
    uuid: dbUser.id,
    name: dbUser.name || '—',
    phone: dbUser.phone || '—',
    email: dbUser.email || '—',
    avatar,
    dob: dbUser.dob || dob || '',
    gender: dbUser.gender || gender || '',
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
      .order('updated_at', { ascending: false });

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
    let authMeta: any = null;
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        authMeta = authData.user.user_metadata;
      }
    } catch {
      // Ignore if no active Supabase auth session
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    const mapped = mapDbUserToUser(data);
    if (authMeta?.avatar_url || authMeta?.picture) {
      mapped.avatar = authMeta.avatar_url || authMeta.picture;
    }
    if (authMeta?.full_name || authMeta?.name) {
      mapped.name = authMeta.full_name || authMeta.name;
    }
    return mapped;
  } catch (err) {
    return null;
  }
}

export async function createUser(data: Partial<User>): Promise<any | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const fallbackPhone = '+919' + String(Math.floor(100000000 + Math.random() * 900000000));
    const packedAvatar = packAvatarWithMeta(data.avatar || null, {
      dob: (data as any).dob,
      gender: (data as any).gender,
    });
    const insertPayload: any = {
      name: data.name || 'New User',
      phone: data.phone && data.phone.trim() ? data.phone.trim() : fallbackPhone,
      email: data.email || null,
      avatar: packedAvatar,
      is_verified: data.isVerified ?? true,
      membership_tier: data.membershipTier?.toLowerCase() || 'pro',
      wallet_balance: data.walletBalance ?? 500,
    };
    const { data: created, error } = await supabase
      .from('users')
      .insert(insertPayload)
      .select()
      .single();

    if (error || !created) {
      console.warn('createUser error:', error);
      return null;
    }
    return mapDbUserToUser(created);
  } catch (err) {
    console.warn('createUser exception:', err);
    return null;
  }
}

export async function updateUser(id: string, data: any): Promise<any | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    let existingAvatar: string | null = null;
    let existingDob = '';
    let existingGender = '';
    try {
      const { data: existingRow } = await supabase
        .from('users')
        .select('avatar')
        .eq('id', id)
        .maybeSingle();
      if (existingRow) {
        const unpacked = unpackAvatarAndMeta(existingRow.avatar);
        existingAvatar = unpacked.avatar;
        existingDob = unpacked.dob;
        existingGender = unpacked.gender;
      }
    } catch {
      // Ignore pre-read error
    }

    const updatePayload: any = { updated_at: new Date().toISOString() };
    if (data.membershipTier !== undefined) updatePayload.membership_tier = data.membershipTier.toLowerCase();
    if (data.walletBalance !== undefined) updatePayload.wallet_balance = data.walletBalance;
    if (data.isVerified !== undefined) updatePayload.is_verified = data.isVerified;
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.email !== undefined) updatePayload.email = data.email;

    if (data.avatar !== undefined || data.dob !== undefined || data.gender !== undefined) {
      const cleanAvatar =
        data.avatar !== undefined
          ? data.avatar
            ? String(data.avatar).split(META_DELIMITER)[0]
            : null
          : existingAvatar;
      const finalDob = data.dob !== undefined ? data.dob : existingDob;
      const finalGender = data.gender !== undefined ? data.gender : existingGender;
      updatePayload.avatar = packAvatarWithMeta(cleanAvatar, {
        dob: finalDob,
        gender: finalGender,
      });
    }

    let { data: updated, error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error && updatePayload.phone !== undefined) {
      const { phone: _omitPhone, ...retryPayload } = updatePayload;
      const retry = await supabase
        .from('users')
        .update(retryPayload)
        .eq('id', id)
        .select()
        .single();
      updated = retry.data;
      error = retry.error;
    }

    if (error || !updated) return null;
    const mapped = mapDbUserToUser(updated);
    if (data.phone !== undefined) mapped.phone = data.phone;
    return mapped;
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
