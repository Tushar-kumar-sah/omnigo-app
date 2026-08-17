import { supabase, isSupabaseConfigured } from '../supabase';

export async function createSOSIncident(data: any): Promise<any> {
  if (!isSupabaseConfigured || !supabase) {
    return { ...data, id: `sos${Math.random()}`, status: 'active', createdAt: new Date().toISOString() };
  }
  try {
    const insertPayload: any = {
      incident_number: data.incidentNumber || `SOS-${Date.now()}`,
      user_id: data.userId && data.userId.includes('-') ? data.userId : null,
      user_name: data.userName || 'Customer',
      user_phone: data.userPhone || '+91 98765 43210',
      location_address: data.locationAddress || 'Expressway Location',
      emergency_type: data.emergencyType || 'Breakdown',
      status: data.status || 'active',
    };

    const { data: created, error } = await supabase
      .from('sos_incidents')
      .insert(insertPayload)
      .select()
      .single();

    if (error || !created) return { ...data, id: `sos${Math.random()}`, status: 'active', createdAt: new Date().toISOString() };
    return created;
  } catch (err) {
    console.warn('createSOSIncident error:', err);
    return { ...data, id: `sos${Math.random()}`, status: 'active', createdAt: new Date().toISOString() };
  }
}

export async function getActiveSOSIncidents(): Promise<any[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('sos_incidents')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return [];
    return data.map((row: any) => ({
      id: row.id,
      incidentNumber: row.incident_number,
      userName: row.user_name,
      userPhone: row.user_phone,
      locationAddress: row.location_address,
      latitude: row.latitude || 18.5204,
      longitude: row.longitude || 73.8567,
      emergencyType: row.emergency_type,
      status: row.status,
      driverName: row.driver_name,
      driverPhone: row.driver_phone,
      createdAt: row.created_at,
    }));
  } catch (err) {
    return [];
  }
}

export async function updateSOSStatus(id: string, status: string, extraData?: any): Promise<any> {
  if (!isSupabaseConfigured || !supabase) return { id, status, ...extraData };
  try {
    const { data, error } = await supabase
      .from('sos_incidents')
      .update({ status, updated_at: new Date().toISOString() })
      .or(`id.eq.${id},incident_number.eq.${id}`)
      .select()
      .single();

    if (error || !data) return { id, status, ...extraData };
    return data;
  } catch (err) {
    return { id, status, ...extraData };
  }
}

export async function assignSOSDriver(incidentId: string, driverId: string, driverName: string, driverPhone: string): Promise<any> {
  if (!isSupabaseConfigured || !supabase) return { id: incidentId, driverId, status: 'assigned' };
  try {
    const { data, error } = await supabase
      .from('sos_incidents')
      .update({
        driver_id: driverId && driverId.includes('-') ? driverId : null,
        driver_name: driverName,
        driver_phone: driverPhone,
        status: 'assigned',
        updated_at: new Date().toISOString(),
      })
      .or(`id.eq.${incidentId},incident_number.eq.${incidentId}`)
      .select()
      .single();

    if (error || !data) return { id: incidentId, driverId, status: 'assigned' };
    return data;
  } catch (err) {
    return { id: incidentId, driverId, status: 'assigned' };
  }
}
