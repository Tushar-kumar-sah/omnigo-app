import { supabase, isSupabaseConfigured } from '../supabase';

export async function createSOSIncident(data: any): Promise<any> {
  if (!isSupabaseConfigured || !supabase) {
    return { ...data, id: `sos${Math.random()}`, status: 'active', createdAt: new Date().toISOString() };
  }
  try {
    const insertPayload: any = {
      incident_number: data.incidentNumber || data.incident_number || `SOS-${Date.now()}`,
      user_id: (data.userId || data.user_id) && (data.userId || data.user_id).includes('-') ? (data.userId || data.user_id) : null,
      customer_name: data.customerName || data.customer_name || data.userName || data.user_name || 'Customer',
      customer_phone: data.customerPhone || data.customer_phone || data.userPhone || data.user_phone || '+91 98765 43210',
      location_address: data.locationAddress || data.location_address || 'Expressway Location',
      hazard_type: data.hazardType || data.hazard_type || data.emergencyType || data.emergency_type || 'Breakdown',
      status: data.status || 'active',
    };
    if (data.gps_display || data.gpsDisplay) insertPayload.gps_display = data.gps_display || data.gpsDisplay;
    if (data.location_coords || data.locationCoords) insertPayload.location_coords = data.location_coords || data.locationCoords;
    if (data.vehicle_model || data.vehicleModel) insertPayload.vehicle_model = data.vehicle_model || data.vehicleModel;
    if (data.assignedDriverId || data.assigned_driver_id || data.driverId || data.driver_id) {
      const dId = data.assignedDriverId || data.assigned_driver_id || data.driverId || data.driver_id;
      insertPayload.assigned_driver_id = dId && dId.includes('-') ? dId : null;
    }
    if (data.assignedDriverName || data.assigned_driver_name || data.driverName || data.driver_name) {
      insertPayload.assigned_driver_name = data.assignedDriverName || data.assigned_driver_name || data.driverName || data.driver_name;
    }
    if (data.assignedDriverPhone || data.assigned_driver_phone || data.driverPhone || data.driver_phone) {
      insertPayload.assigned_driver_phone = data.assignedDriverPhone || data.assigned_driver_phone || data.driverPhone || data.driver_phone;
    }

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
      customerName: row.customer_name || row.user_name,
      userName: row.customer_name || row.user_name,
      customerPhone: row.customer_phone || row.user_phone,
      userPhone: row.customer_phone || row.user_phone,
      locationAddress: row.location_address,
      latitude: Number(row.latitude) || 22.5726,
      longitude: Number(row.longitude) || 88.3639,
      hazardType: row.hazard_type || row.emergency_type,
      emergencyType: row.hazard_type || row.emergency_type,
      status: row.status,
      assignedDriverId: row.assigned_driver_id || row.driver_id,
      driverId: row.assigned_driver_id || row.driver_id,
      assignedDriverName: row.assigned_driver_name || row.driver_name,
      driverName: row.assigned_driver_name || row.driver_name,
      assignedDriverPhone: row.assigned_driver_phone || row.driver_phone,
      driverPhone: row.assigned_driver_phone || row.driver_phone,
      createdAt: row.created_at,
    }));
  } catch (err) {
    return [];
  }
}

export async function updateSOSStatus(id: string, status: string, extraData?: any): Promise<any> {
  if (!isSupabaseConfigured || !supabase) return { id, status, ...extraData };
  try {
    const updatePayload: any = { status, updated_at: new Date().toISOString() };
    if (extraData) {
      if (extraData.customerName || extraData.customer_name || extraData.userName || extraData.user_name) {
        updatePayload.customer_name = extraData.customerName || extraData.customer_name || extraData.userName || extraData.user_name;
      }
      if (extraData.customerPhone || extraData.customer_phone || extraData.userPhone || extraData.user_phone) {
        updatePayload.customer_phone = extraData.customerPhone || extraData.customer_phone || extraData.userPhone || extraData.user_phone;
      }
      if (extraData.hazardType || extraData.hazard_type || extraData.emergencyType || extraData.emergency_type) {
        updatePayload.hazard_type = extraData.hazardType || extraData.hazard_type || extraData.emergencyType || extraData.emergency_type;
      }
      if (extraData.assignedDriverId || extraData.assigned_driver_id || extraData.driverId || extraData.driver_id) {
        updatePayload.assigned_driver_id = extraData.assignedDriverId || extraData.assigned_driver_id || extraData.driverId || extraData.driver_id;
      }
      if (extraData.assignedDriverName || extraData.assigned_driver_name || extraData.driverName || extraData.driver_name) {
        updatePayload.assigned_driver_name = extraData.assignedDriverName || extraData.assigned_driver_name || extraData.driverName || extraData.driver_name;
      }
      if (extraData.assignedDriverPhone || extraData.assigned_driver_phone || extraData.driverPhone || extraData.driver_phone) {
        updatePayload.assigned_driver_phone = extraData.assignedDriverPhone || extraData.assigned_driver_phone || extraData.driverPhone || extraData.driver_phone;
      }
    }
    const { data, error } = await supabase
      .from('sos_incidents')
      .update(updatePayload)
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
        assigned_driver_id: driverId && driverId.includes('-') ? driverId : null,
        assigned_driver_name: driverName,
        assigned_driver_phone: driverPhone,
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
