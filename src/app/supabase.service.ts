import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient | null = null;
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    }
  }

  private get client(): SupabaseClient {
    if (!this.supabase) throw new Error('Supabase solo disponible en el browser');
    return this.supabase;
  }

  // ── CLIENTES ──────────────────────────────────────────────────────

  async getClientes(): Promise<any[]> {
    const { data, error } = await this.client
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error('getClientes:', error); return []; }
    return data ?? [];
  }

  async insertCliente(cliente: {
    nombre: string; rut: string; telefono?: string;
    email?: string; direccion?: string; observaciones?: string;
  }): Promise<any> {
    const { data, error } = await this.client
      .from('clientes').insert(cliente).select().single();
    if (error) throw error;
    return data;
  }

  async updateCliente(id: string, changes: Partial<{
    nombre: string; rut: string; telefono: string;
    email: string; direccion: string; observaciones: string;
  }>): Promise<any> {
    const { data, error } = await this.client
      .from('clientes').update(changes).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteCliente(id: string): Promise<void> {
    const { error } = await this.client
      .from('clientes').delete().eq('id', id);
    if (error) throw error;
  }

  // ── PRODUCTOS ─────────────────────────────────────────────────────

  async getProductos(): Promise<any[]> {
    const { data, error } = await this.client
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error('getProductos:', error); return []; }
    return data ?? [];
  }

  async insertProducto(producto: {
    nombre: string; descripcion?: string; precio_neto: number;
  }): Promise<any> {
    const { data, error } = await this.client
      .from('productos').insert(producto).select().single();
    if (error) throw error;
    return data;
  }

  async updateProducto(id: string, changes: Partial<{
    nombre: string; descripcion: string; precio_neto: number;
  }>): Promise<any> {
    const { data, error } = await this.client
      .from('productos').update(changes).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteProducto(id: string): Promise<void> {
    const { error } = await this.client
      .from('productos').delete().eq('id', id);
    if (error) throw error;
  }

  // ── COTIZACIONES ──────────────────────────────────────────────────

  async getCotizaciones(): Promise<any[]> {
    const { data, error } = await this.client
      .from('cotizaciones')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error('getCotizaciones:', error); return []; }
    return data ?? [];
  }

  async insertCotizacion(cotizacion: {
    numero_cotizacion: string; fecha: string;
    nombre_cliente: string; total: number; items: any[];
  }): Promise<any> {
    const { data, error } = await this.client
      .from('cotizaciones').insert(cotizacion).select().single();
    if (error) throw error;
    return data;
  }

  async updateCotizacion(id: string, changes: Partial<{
    numero_cotizacion: string; fecha: string;
    nombre_cliente: string; total: number; items: any[];
  }>): Promise<any> {
    const { data, error } = await this.client
      .from('cotizaciones').update(changes).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteCotizacion(id: string): Promise<void> {
    const { error } = await this.client
      .from('cotizaciones').delete().eq('id', id);
    if (error) throw error;
  }
}
