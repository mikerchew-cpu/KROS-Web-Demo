import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using demo mode with mock data.');
}

export const supabase = createClient(
  supabaseUrl || 'https://hypgryszzgpzirdduxd.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5cGdyeXN6emdwemlyZGR1eHhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3OTkzOTIsImV4cCI6MjA5NTM3NTM5Mn0.fLka2W5LUw12RjaPqFGp8vnWPe8O8MWYtGVs5-b_pXI'
);

export async function getWorkerProfiles() {
  const { data, error } = await supabase.from('worker_profiles').select('*').order('created_at');
  if (error) throw error;
  return data;
}

export async function getWorkerProfile(id) {
  const { data, error } = await supabase.from('worker_profiles').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function getAssets() {
  const { data, error } = await supabase.from('assets').select('*').order('created_at');
  if (error) throw error;
  return data;
}

export async function getAsset(id) {
  const { data, error } = await supabase.from('assets').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function getSkills() {
  const { data, error } = await supabase.from('skills').select('*').order('last_updated', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getProductionDays(mineId, limit = 30) {
  const { data, error } = await supabase.from('production_days').select('*').eq('mine_id', mineId).order('date', { ascending: false }).limit(limit);
  if (error) throw error;
  return data;
}

export async function getProductionShifts(dayId) {
  const { data, error } = await supabase.from('production_shifts').select('*').eq('production_day_id', dayId);
  if (error) throw error;
  return data;
}

export async function getSafetyObservations(limit = 50) {
  const { data, error } = await supabase.from('safety_observations').select('*').order('date', { ascending: false }).limit(limit);
  if (error) throw error;
  return data;
}

export async function getNotifications() {
  const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
  if (error) throw error;
  return data;
}

export async function getStockpiles() {
  const { data, error } = await supabase.from('stockpiles').select('*');
  if (error) throw error;
  return data;
}

export async function getBlastRecords(limit = 20) {
  const { data, error } = await supabase.from('blast_records').select('*').order('date', { ascending: false }).limit(limit);
  if (error) throw error;
  return data;
}

export async function getTrainingRecords() {
  const { data, error } = await supabase.from('training_records').select('*, worker_profiles(*), training_modules(*)');
  if (error) throw error;
  return data;
}

export async function getEnvironmentalReadings(stationId) {
  let query = supabase.from('environmental_readings').select('*').order('read_at', { ascending: false }).limit(20);
  if (stationId) query = query.eq('station_id', stationId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createSafetyObservation(obs) {
  const { data, error } = await supabase.from('safety_observations').insert(obs).select().single();
  if (error) throw error;
  return data;
}

export async function createNotification(notification) {
  const { data, error } = await supabase.from('notifications').insert(notification).select().single();
  if (error) throw error;
  return data;
}

export async function markNotificationRead(id) {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
  if (error) throw error;
}

export const DEMO_USERS = [
  { id: '1', givenName: 'Ahmad', surname: 'Zulkifli', email: 'ahmad@kros.my', role: 'Mine Manager', access: 'admin' },
  { id: '2', givenName: 'Farah', surname: 'Izzati', email: 'farah@kros.my', role: 'HSE Manager', access: 'manager' },
  { id: '3', givenName: 'Tan Mei', surname: 'Ling', email: 'tan@kros.my', role: 'Finance Manager', access: 'manager' },
  { id: '4', givenName: 'Amirul', surname: 'Haziq', email: 'amirul@kros.my', role: 'Maintenance Tech.', access: 'staff' },
];
