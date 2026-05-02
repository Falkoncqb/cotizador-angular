import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit, PLATFORM_ID, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SupabaseService } from './supabase.service';

// Definimos la estructura de un elemento en la cotización (puede ser título o sub-item)
interface QuoteRow {
  id: string;
  isTitle: boolean;
  name: string;
  quantity: number;
  price: number;
}

// Estructura para una cotización guardada en el historial
interface SavedQuote {
  id: string;
  quoteNumber: string;
  date: Date;
  customerName: string;
  total: number;
  items: QuoteRow[];
}

// Estructura para un cliente guardado
interface Client {
  id: string;
  name: string;
  rut: string;
  phone: string;
  email: string;
  address: string;
  observations: string;
}

// Estructura para un producto guardado
interface Product {
  id: string;
  name: string;
  description: string;
  netPrice: number;
}

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- ======================= PANTALLA DE LOGIN ======================= -->
    @if (!isLoggedIn()) {
      <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 relative overflow-hidden">
        
        <!-- Fondo decorativo con círculos animados -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl animate-pulse"></div>
          <div class="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl animate-pulse" style="animation-delay: 1.5s"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-slate-700/20 blur-3xl"></div>
        </div>

        <!-- Tarjeta de Login -->
        <div class="relative w-full max-w-md mx-4">
          <!-- Efecto glassmorphism -->
          <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-10">
            
            <!-- Logo -->
            <div class="flex justify-center mb-8">
              @if (hasCustomLogo()) {
                <div class="bg-white px-8 py-5 rounded-2xl shadow-xl">
                  <img src="/logomb.jpg" alt="MB Soluciones" class="h-16 w-auto object-contain" (error)="hasCustomLogo.set(false)">
                </div>
              } @else {
                <div class="text-center">
                  <div class="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-400/30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-400"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  </div>
                  <h1 class="text-white font-bold text-xl">MB Soluciones</h1>
                </div>
              }
            </div>

            <!-- Títulos -->
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold text-white mb-1">Bienvenido</h2>
              <p class="text-slate-400 text-sm">Ingresa tus credenciales para continuar</p>
            </div>

            <!-- Formulario -->
            <div class="flex flex-col gap-5">
              
              <!-- Campo Usuario -->
              <div class="flex flex-col gap-2">
                <label class="text-xs font-bold text-slate-400 uppercase tracking-widest">Usuario</label>
                <div class="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <input
                    type="text"
                    [value]="loginUsername()"
                    (input)="loginUsername.set($any($event.target).value)"
                    (keydown.enter)="doLogin()"
                    placeholder="Nombre de usuario"
                    autocomplete="username"
                    class="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-emerald-500/70 focus:bg-white/15 transition-all duration-200"
                  >
                </div>
              </div>

              <!-- Campo Contraseña -->
              <div class="flex flex-col gap-2">
                <label class="text-xs font-bold text-slate-400 uppercase tracking-widest">Contraseña</label>
                <div class="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <input
                    [type]="showPassword() ? 'text' : 'password'"
                    [value]="loginPassword()"
                    (input)="loginPassword.set($any($event.target).value)"
                    (keydown.enter)="doLogin()"
                    placeholder="Contraseña"
                    autocomplete="current-password"
                    class="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl pl-11 pr-12 py-3.5 outline-none focus:border-emerald-500/70 focus:bg-white/15 transition-all duration-200"
                  >
                  <button type="button" (click)="showPassword.update(v => !v)" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    @if (showPassword()) {
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    }
                  </button>
                </div>
              </div>

              <!-- Botón Ingresar -->
              <button
                (click)="doLogin()"
                class="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-900/40 hover:shadow-emerald-800/60 hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                Ingresar al Sistema
              </button>
            </div>

            <!-- Footer -->
            <p class="text-center text-slate-600 text-xs mt-8">&copy; 2026 MB Soluciones SpA &mdash; Acceso Restringido</p>
          </div>
        </div>
      </div>

      <!-- Modal: Credenciales Incorrectas -->
      @if (showLoginErrorModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <!-- Fondo oscuro -->
          <div class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" (click)="showLoginErrorModal.set(false)"></div>
          <!-- Tarjeta del modal -->
          <div class="relative bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center border-t-4 border-red-500 animate-bounce-once">
            <!-- Ícono -->
            <div class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">Acceso Denegado</h3>
            <p class="text-slate-500 text-sm mb-6">Las credenciales ingresadas son incorrectas.<br>Por favor verifica tu <strong class="text-slate-700">usuario</strong> y <strong class="text-slate-700">contraseña</strong>.</p>
            <button
              (click)="showLoginErrorModal.set(false)"
              class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition-colors">
              Reintentar
            </button>
          </div>
        </div>
      }

    } @else {
    <!-- ======================= APP PRINCIPAL ======================= -->
    <div class="flex h-screen bg-gray-50 font-sans text-slate-800">
      
      <!-- Menú Lateral (Sidebar) -->
      <aside class="w-72 bg-slate-900 text-white flex flex-col shadow-xl z-10">
        <!-- Título -->
        <div class="p-6 border-b border-slate-700/50 flex justify-center">
          @if (hasCustomLogo()) {
            <div class="bg-white p-3 rounded-xl shadow-md w-full flex items-center justify-center transition-transform hover:scale-105">
              <img src="/logomb.jpg" alt="Logo MB Soluciones" class="w-full max-w-[160px] h-auto object-contain" (error)="hasCustomLogo.set(false)">
            </div>
          } @else {
            <h1 class="text-2xl font-bold tracking-tight text-emerald-400 text-center w-full">
              Cotizador <br/>
              <span class="text-white text-lg font-medium tracking-normal">MB Soluciones</span>
            </h1>
          }
        </div>

        <!-- Navegación Principal -->
        <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
          <!-- Botón Dashboard -->
          <button 
            (click)="currentView.set('dashboard')"
            [class]="currentView() === 'dashboard' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'"
            class="w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3 group-hover:scale-110 transition-transform">
              <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span class="font-medium">Dashboard</span>
          </button>

          <!-- Botón Clientes -->
          <button 
            (click)="currentView.set('clientes')"
            [class]="currentView() === 'clientes' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'"
            class="w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3 group-hover:scale-110 transition-transform">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span class="font-medium">Clientes</span>
          </button>

          <!-- Botón Cotizaciones -->
          <button 
            (click)="currentView.set('cotizaciones')"
            [class]="currentView() === 'cotizaciones' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'"
            class="w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3 group-hover:scale-110 transition-transform">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span class="font-medium">Cotizaciones</span>
          </button>

          <!-- Botón Historial -->
          <button 
            (click)="currentView.set('historial')"
            [class]="currentView() === 'historial' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'"
            class="w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3 group-hover:scale-110 transition-transform">
              <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span class="font-medium">Historial</span>
          </button>

          <!-- Botón Productos -->
          <button 
            (click)="currentView.set('productos')"
            [class]="currentView() === 'productos' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'"
            class="w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3 group-hover:scale-110 transition-transform">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span class="font-medium">Productos</span>
          </button>

          <!-- Botón Enlace al Sitio Web -->
          <div class="pt-2 mt-2 border-t border-slate-700/50">
            <a 
              href="https://solucionesmb.cl/"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-slate-300 hover:bg-slate-800 hover:text-emerald-400 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-3 group-hover:scale-110 transition-transform">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <span class="font-medium flex-1 text-left">Ir al sitio web MB</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-50 group-hover:opacity-100 transition-opacity">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </nav>

        <!-- Pie del Sidebar: Cerrar Sesión + Copyright -->
        <div class="p-4 border-t border-slate-700/50 flex flex-col gap-2">
          <button (click)="doLogout()" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-all duration-200 group">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:scale-110 transition-transform"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span class="text-sm font-medium">Cerrar Sesión</span>
          </button>
          <p class="text-xs text-slate-600 text-center">&copy; 2026 MB Soluciones</p>
        </div>
      </aside>

      <!-- Área de Contenido Principal -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <!-- Encabezado superior del contenido -->
        <header class="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <h2 class="text-xl font-semibold text-slate-800 capitalize">
            {{ currentView() }}
          </h2>
          <!-- Logo de la empresa -->
          @if (hasCustomLogo()) {
            <img src="/logomb.jpg" alt="Logo MB" class="h-10 object-contain ml-auto" (error)="hasCustomLogo.set(false)" title="Logo de la Empresa">
          } @else {
            <div class="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 ml-auto" title="Sube logomb.jpg a tu carpeta public">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
          }
        </header>

        <!-- Contenido dinámico -->
        <div class="flex-1 p-8 overflow-y-auto">
          @if (currentView() === 'dashboard') {
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Botón Clientes -->
              <button (click)="currentView.set('clientes')" class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all duration-300 group flex flex-col items-center justify-center gap-4 text-slate-700 hover:text-emerald-600">
                <div class="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors group-hover:scale-110 duration-300 text-emerald-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <span class="font-bold text-xl">Clientes</span>
              </button>

              <!-- Botón Cotizaciones -->
              <button (click)="currentView.set('cotizaciones')" class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all duration-300 group flex flex-col items-center justify-center gap-4 text-slate-700 hover:text-emerald-600">
                <div class="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors group-hover:scale-110 duration-300 text-emerald-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <span class="font-bold text-xl">Cotizaciones</span>
              </button>

              <!-- Botón Productos -->
              <button (click)="currentView.set('productos')" class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all duration-300 group flex flex-col items-center justify-center gap-4 text-slate-700 hover:text-emerald-600">
                <div class="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors group-hover:scale-110 duration-300 text-emerald-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                </div>
                <span class="font-bold text-xl">Productos</span>
              </button>
            </div>

            <!-- Dashboard Stats & Filter -->
            <div class="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <!-- Tarjeta de Estadísticas Rápidas -->
              <div class="lg:col-span-1 flex flex-col gap-4">
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Histórico</p>
                    <h3 class="text-3xl font-bold text-slate-800">{{ totalQuotesCount() }}</h3>
                  </div>
                  <div class="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                </div>

                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Hoy</p>
                    <h3 class="text-3xl font-bold text-emerald-600">{{ todayQuotesCount() }}</h3>
                  </div>
                  <div class="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                </div>
              </div>

              <!-- Tarjeta de Búsqueda y Lista por Fecha -->
              <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 class="text-lg font-bold text-slate-800">Cotizaciones por Fecha</h3>
                  <div class="relative">
                    <input type="date" [value]="dashboardFilterDate()" (input)="updateDashboardFilterDate($event)" class="rounded-lg border-slate-300 shadow-sm px-4 py-2 border focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm font-medium text-slate-700 bg-slate-50 cursor-pointer">
                  </div>
                </div>

                <div class="overflow-x-auto border rounded-xl border-slate-100 max-h-60 overflow-y-auto">
                  <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-50 sticky top-0 z-10">
                      <tr class="text-xs text-slate-500 uppercase tracking-wider">
                        <th class="py-3 px-4 font-medium border-b border-slate-200">N° Cotización</th>
                        <th class="py-3 px-4 font-medium border-b border-slate-200">Fecha</th>
                        <th class="py-3 px-4 font-medium border-b border-slate-200 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody class="text-sm">
                      @for (quote of dashboardQuotesByDate(); track quote.id) {
                        <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-0">
                          <td class="py-3 px-4 font-bold text-slate-700">{{ quote.quoteNumber }}</td>
                          <td class="py-3 px-4 text-slate-500">{{ formatDate(quote.date) }}</td>
                          <td class="py-3 px-4 text-right">
                            <button (click)="viewQuote(quote)" class="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors inline-flex items-center gap-1.5">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                              Ver
                            </button>
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="3" class="py-8 text-center text-slate-400 italic">No hay cotizaciones para la fecha seleccionada.</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          } @else if (currentView() === 'clientes') {
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col xl:flex-row gap-8">
              
              <!-- Formulario de Ingreso de Cliente -->
              <div class="xl:w-1/3 flex flex-col gap-5">
                <div class="flex justify-between items-center bg-emerald-50 px-4 py-3 rounded-lg border border-emerald-100">
                  <h3 class="text-lg font-bold text-emerald-800">{{ editingClientId() ? 'Editar Cliente' : 'Nuevo Cliente' }}</h3>
                  <button (click)="clearClientForm()" class="text-xs font-medium text-emerald-600 hover:text-emerald-700 underline">Limpiar</button>
                </div>
                
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre <span class="text-red-500">*</span></label>
                  <input type="text" [value]="clientName()" (input)="updateClientForm('name', $event)" placeholder="Nombre Completo o Empresa" class="w-full rounded-lg border-slate-300 shadow-sm px-4 py-2 border focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">RUT <span class="text-red-500">*</span></label>
                  <input type="text" [value]="clientRut()" (input)="updateClientForm('rut', $event)" placeholder="Ej. 12.345.678-9" class="w-full rounded-lg border-slate-300 shadow-sm px-4 py-2 border focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Teléfono</label>
                  <input type="text" [value]="clientPhone()" (input)="updateClientForm('phone', $event)" placeholder="+56 9 1234 5678" class="w-full rounded-lg border-slate-300 shadow-sm px-4 py-2 border focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Correo Electrónico</label>
                  <input type="email" [value]="clientEmail()" (input)="updateClientForm('email', $event)" placeholder="contacto@empresa.cl" class="w-full rounded-lg border-slate-300 shadow-sm px-4 py-2 border focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Dirección</label>
                  <input type="text" [value]="clientAddress()" (input)="updateClientForm('address', $event)" placeholder="Av. Providencia 1234, Santiago" class="w-full rounded-lg border-slate-300 shadow-sm px-4 py-2 border focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Observaciones (Opcional)</label>
                  <textarea [value]="clientObservations()" (input)="updateClientForm('observations', $event)" rows="3" placeholder="Información adicional del cliente..." class="w-full rounded-lg border-slate-300 shadow-sm px-4 py-2 border focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"></textarea>
                </div>

                <button (click)="saveClient()" class="mt-2 w-full bg-slate-800 hover:bg-slate-900 text-white px-4 py-3 rounded-xl font-medium transition-colors shadow-md flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
                  {{ editingClientId() ? 'Actualizar Cliente' : 'Guardar Cliente' }}
                </button>
              </div>

              <!-- Lista de Clientes -->
              <div class="xl:w-2/3 flex flex-col">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 border-b border-slate-200 pb-3">
                  <div class="flex items-center gap-2">
                    <h3 class="text-lg font-bold text-slate-800">Directorio de Clientes</h3>
                    <span class="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      {{ filteredClients().length }}/{{ clients().length > 12 && !clientSearchQuery() ? '12+' : clients().length }}
                    </span>
                  </div>
                  <!-- Buscador de Clientes -->
                  <div class="relative w-full sm:w-64">
                    <input
                      type="text"
                      [value]="clientSearchQuery()"
                      (input)="updateClientSearchQuery($event)"
                      placeholder="Buscar por nombre o RUT..."
                      class="w-full rounded-lg border-slate-300 shadow-sm pl-9 pr-8 py-2 border focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    @if (clientSearchQuery()) {
                      <button (click)="clientSearchQuery.set('')" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" title="Limpiar búsqueda">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    }
                  </div>
                </div>

                @if (!clientSearchQuery() && clients().length > 12) {
                  <p class="text-xs text-slate-400 italic mb-2">Mostrando los 12 clientes más recientes. Usa el buscador para encontrar clientes anteriores.</p>
                }
                
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="border-b-2 border-slate-200 text-sm text-slate-500">
                        <th class="pb-3 font-medium">Nombre / RUT</th>
                        <th class="pb-3 font-medium">Contacto</th>
                        <th class="pb-3 font-medium">Dirección</th>
                        <th class="pb-3 font-medium text-center w-36">Acciones</th>
                      </tr>
                    </thead>
                    <tbody class="text-sm">
                      @for (client of filteredClients(); track client.id) {
                        <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td class="py-4">
                            <div class="font-medium text-slate-800">{{ client.name }}</div>
                            <div class="text-slate-500 text-xs">{{ client.rut }}</div>
                          </td>
                          <td class="py-4">
                            <div class="text-slate-700 flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> {{ client.phone || '-' }}</div>
                            <div class="text-slate-500 text-xs flex items-center gap-1.5 mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> {{ client.email || '-' }}</div>
                          </td>
                          <td class="py-4 text-slate-600 max-w-[200px] truncate" [title]="client.address + ' ' + (client.observations ? ' | Obs: ' + client.observations : '')">
                            {{ client.address || '-' }}
                            @if (client.observations) {
                              <span class="block text-xs text-amber-600 mt-1 truncate">Obs: {{ client.observations }}</span>
                            }
                          </td>
                          <td class="py-4 text-center">
                            <div class="flex items-center justify-center gap-1">
                              <button (click)="createQuoteForClient(client)" class="text-indigo-400 hover:text-indigo-600 transition-colors p-1.5 rounded-md hover:bg-indigo-50" title="Crear Cotización">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                              </button>
                              <button (click)="editClient(client)" class="text-amber-400 hover:text-amber-600 transition-colors p-1.5 rounded-md hover:bg-amber-50" title="Editar Cliente">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                              </button>
                              <button (click)="deleteClient(client.id)" class="text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-md hover:bg-red-50" title="Eliminar Cliente">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="4" class="py-12 text-center text-slate-400 italic bg-slate-50/50 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 text-slate-300"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            @if (clientSearchQuery()) {
                              No se encontraron clientes con "{{ clientSearchQuery() }}".
                            } @else {
                              No hay clientes registrados.
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          } @else if (currentView() === 'productos') {
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col xl:flex-row gap-8">
              
              <!-- Formulario de Ingreso de Producto -->
              <div class="xl:w-1/3 flex flex-col gap-5">
                <div class="flex justify-between items-center bg-emerald-50 px-4 py-3 rounded-lg border border-emerald-100">
                  <h3 class="text-lg font-bold text-emerald-800">{{ editingProductId() ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
                  <button (click)="clearProductForm()" class="text-xs font-medium text-emerald-600 hover:text-emerald-700 underline">Limpiar</button>
                </div>
                
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre del Producto <span class="text-red-500">*</span></label>
                  <input type="text" [value]="productName()" (input)="updateProductForm('name', $event)" placeholder="Ej. Computador Portátil" class="w-full rounded-lg border-slate-300 shadow-sm px-4 py-2 border focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción</label>
                  <textarea [value]="productDescription()" (input)="updateProductForm('description', $event)" rows="3" placeholder="Detalles del producto..." class="w-full rounded-lg border-slate-300 shadow-sm px-4 py-2 border focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"></textarea>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Valor Neto (Sin IVA) <span class="text-red-500">*</span></label>
                  <input type="text" [value]="productNetPrice()" (input)="formatProductPriceInput($event)" placeholder="Ej. 100.000" class="w-full rounded-lg border-slate-300 shadow-sm px-4 py-2 border focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-right">
                </div>

                <!-- Calculadora automática de IVA -->
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
                  <div class="flex justify-between items-center mb-2 text-sm">
                    <span class="text-slate-500">Valor Neto:</span>
                    <span class="font-medium text-slate-700">{{ formatCLP(getProductNumericNetPrice()) }}</span>
                  </div>
                  <div class="flex justify-between items-center mb-2 text-sm">
                    <span class="text-slate-500">IVA (19%):</span>
                    <span class="font-medium text-slate-700">{{ formatCLP(productIvaAmount()) }}</span>
                  </div>
                  <div class="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span class="font-bold text-slate-800 text-sm">Total con IVA:</span>
                    <span class="font-bold text-emerald-600">{{ formatCLP(productGrossPrice()) }}</span>
                  </div>
                </div>

                <button (click)="saveProduct()" class="mt-2 w-full bg-slate-800 hover:bg-slate-900 text-white px-4 py-3 rounded-xl font-medium transition-colors shadow-md flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                  {{ editingProductId() ? 'Actualizar Producto' : 'Guardar Producto' }}
                </button>
              </div>

              <!-- Lista de Productos -->
              <div class="xl:w-2/3 flex flex-col">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 border-b border-slate-200 pb-3">
                  <div class="flex items-center gap-2">
                    <h3 class="text-lg font-bold text-slate-800">Catálogo de Productos</h3>
                    <span class="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      {{ filteredProducts().length }}/{{ products().length > 10 && !productSearchQuery() ? '10+' : products().length }}
                    </span>
                  </div>
                  <!-- Buscador de Productos -->
                  <div class="relative w-full sm:w-64">
                    <input
                      type="text"
                      [value]="productSearchQuery()"
                      (input)="updateProductSearchQuery($event)"
                      placeholder="Buscar producto..."
                      class="w-full rounded-lg border-slate-300 shadow-sm pl-9 pr-8 py-2 border focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    @if (productSearchQuery()) {
                      <button (click)="productSearchQuery.set('')" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" title="Limpiar búsqueda">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    }
                  </div>
                </div>

                @if (!productSearchQuery() && products().length > 10) {
                  <p class="text-xs text-slate-400 italic mb-2">Mostrando los 10 productos más recientes.</p>
                }
                
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="border-b-2 border-slate-200 text-sm text-slate-500">
                        <th class="pb-3 px-4 font-medium">Producto / Descripción</th>
                        <th class="pb-3 px-4 font-medium text-right w-32">Valor Neto</th>
                        <th class="pb-3 px-4 font-medium text-right w-28">IVA</th>
                        <th class="pb-3 px-4 font-medium text-right w-32">Total</th>
                        <th class="pb-3 px-4 font-medium text-center w-32">Acciones</th>
                      </tr>
                    </thead>
                    <tbody class="text-sm">
                      @for (product of filteredProducts(); track product.id) {
                        <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td class="py-4 px-4">
                            <div class="font-bold text-slate-800">{{ product.name }}</div>
                            @if (product.description) {
                              <div class="text-slate-500 text-xs mt-1 line-clamp-2" [title]="product.description">{{ product.description }}</div>
                            }
                          </td>
                          <td class="py-4 px-4 text-right text-slate-600 font-medium whitespace-nowrap">{{ formatCLP(product.netPrice) }}</td>
                          <td class="py-4 px-4 text-right text-slate-500 text-xs whitespace-nowrap">{{ formatCLP(Math.round(product.netPrice * 0.19)) }}</td>
                          <td class="py-4 px-4 text-right font-bold text-emerald-600 whitespace-nowrap">{{ formatCLP(Math.round(product.netPrice * 1.19)) }}</td>
                          <td class="py-4 px-4 text-center">
                            <div class="flex items-center justify-center gap-1">
                              <button (click)="addFromCatalog(product)" class="text-indigo-400 hover:text-indigo-600 transition-colors p-1.5 rounded-md hover:bg-indigo-50" title="Agregar a Cotización">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                              </button>
                              <button (click)="editProduct(product)" class="text-amber-400 hover:text-amber-600 transition-colors p-1.5 rounded-md hover:bg-amber-50" title="Editar Producto">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                              </button>
                              <button (click)="deleteProduct(product.id)" class="text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-md hover:bg-red-50" title="Eliminar Producto">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="5" class="py-12 text-center text-slate-400 italic bg-slate-50/50 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 text-slate-300"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                            @if (productSearchQuery()) {
                              No se encontraron productos con "{{ productSearchQuery() }}".
                            } @else {
                              No hay productos registrados en el catálogo.
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          } @else if (currentView() === 'cotizaciones') {
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-medium text-slate-800">Nueva Cotización</h3>
                <div class="flex gap-3">
                  <button (click)="clearQuote()" class="bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2" title="Limpiar toda la cotización">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    Limpiar
                  </button>

                  <button (click)="exportPDF()" [disabled]="isExporting()" class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    @if (isExporting()) {
                      <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Generando...
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      Exportar PDF
                    }
                  </button>
                </div>
              </div>

              <!-- Datos Generales de la Cotización -->
              <div class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <!-- Columna Izquierda (N° Cotización y Fecha) -->
                <div class="flex flex-col gap-4">
                  <div class="flex items-center gap-4">
                    <label class="font-semibold text-slate-600 text-sm uppercase tracking-wider min-w-[110px]">N° Cotización:</label>
                    <input type="text" [value]="quoteNumber()" (input)="updateQuoteNumber($event)" placeholder="Ej. COT-001" class="flex-1 rounded-lg border-slate-300 shadow-sm px-4 py-2.5 border focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all uppercase font-medium">
                  </div>
                  <div class="flex items-center gap-4">
                    <label class="font-semibold text-slate-600 text-sm uppercase tracking-wider min-w-[110px]">Fecha:</label>
                    <input type="date" [value]="quoteDate()" (input)="updateQuoteDate($event)" class="flex-1 rounded-lg border-slate-300 shadow-sm px-4 py-2.5 border focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700">
                  </div>
                </div>
                <!-- Columna Derecha (Cliente) -->
                <div class="flex flex-col gap-4">
                  <div class="flex items-center gap-4">
                    <label class="font-semibold text-slate-600 text-sm uppercase tracking-wider min-w-[100px]">Cliente:</label>
                    <input type="text" [value]="customerName()" (input)="updateCustomerName($event)" placeholder="Nombre del cliente o empresa..." class="flex-1 rounded-lg border-slate-300 shadow-sm px-4 py-2.5 border focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
                  </div>
                </div>
              </div>
              
              <!-- Panel de control para agregar elementos -->
              <div class="bg-slate-50 p-5 rounded-xl border border-slate-100 mb-8 flex flex-col gap-6 shadow-sm">
                
                <!-- 1. Agregar Item Principal -->
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">1. Agregar Item Principal</label>
                  <div class="flex gap-3">
                    <input #titleName type="text" placeholder="Ej. Desarrollo Frontend, Servidores, Licencias..." class="flex-1 rounded-lg border-slate-300 shadow-sm px-4 py-2.5 border focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
                    <button (click)="addTitle(titleName)" class="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                      Agregar Item Principal
                    </button>
                  </div>
                </div>

                <div class="h-px w-full bg-slate-200"></div>

                <!-- 2. Agregar Sub-ítem -->
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">2. Agregar Sub-ítem (Producto / Servicio)</label>
                  <div class="flex flex-wrap gap-3 items-start">
                    <div class="flex-1 min-w-[200px]">
                      <input #productName type="text" placeholder="Ej. Diseño de sitio web" class="w-full rounded-lg border-slate-300 shadow-sm px-4 py-2.5 border focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
                    </div>
                    <div class="w-24">
                      <input #productQty type="number" min="1" value="1" placeholder="Cant." class="w-full rounded-lg border-slate-300 shadow-sm px-4 py-2.5 border focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
                    </div>
                    <div class="w-40">
                      <input #productPrice type="text" (input)="formatPriceInput($event)" placeholder="Precio (CLP)" class="w-full rounded-lg border-slate-300 shadow-sm px-4 py-2.5 border focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-right">
                    </div>
                    <button (click)="addItem(productName, productQty, productPrice)" class="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm h-[46px] flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      Agregar Sub-ítem
                    </button>
                  </div>
                </div>
              </div>

              <!-- Tabla de items -->
              <div class="overflow-x-auto mb-6">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="border-b-2 border-slate-200 text-sm text-slate-500">
                      <th class="pb-3 font-medium">Descripción</th>
                      <th class="pb-3 font-medium text-center w-24">Cantidad</th>
                      <th class="pb-3 font-medium text-right w-32">Precio Unit.</th>
                      <th class="pb-3 font-medium text-right w-32">Total</th>
                      <th class="pb-3 font-medium text-center w-16"></th>
                    </tr>
                  </thead>
                  <tbody class="text-sm">
                    @for (item of sortedItems(); track item.id) {
                      @if (item.isTitle) {
                        <!-- Fila de Título Principal -->
                        <tr class="bg-slate-200/60 border-b border-slate-300">
                          <td colspan="4" class="py-3 px-4 text-slate-800 font-bold text-base uppercase tracking-wide">{{ item.name }}</td>
                          <td class="py-3 text-center">
                            <button (click)="removeItem(item.id)" class="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50" title="Eliminar Sección">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                          </td>
                        </tr>
                      } @else {
                        <!-- Fila de Sub-ítem -->
                        <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td class="py-3 pl-8 text-slate-700 relative">
                            <!-- Viñeta indicadora de sub-ítem -->
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            {{ item.name }}
                          </td>
                          <td class="py-3 text-center text-slate-600">{{ item.quantity }}</td>
                          <td class="py-3 text-right text-slate-600">{{ formatCLP(item.price) }}</td>
                          <td class="py-3 text-right font-medium text-slate-800">{{ formatCLP(item.quantity * item.price) }}</td>
                          <td class="py-3 text-center">
                            <button (click)="removeItem(item.id)" class="text-red-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50" title="Eliminar">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                          </td>
                        </tr>
                      }
                    } @empty {
                      <tr>
                        <td colspan="5" class="py-8 text-center text-slate-400 italic bg-slate-50/50 rounded-lg">No hay elementos. Agrega un Item Principal y luego sus Sub-ítemes.</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Resumen de Totales -->
              <div class="flex flex-col items-end gap-4">
                <div class="w-72 bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <div class="flex justify-between items-center mb-3 text-slate-600 text-sm">
                    <span>Subtotal</span>
                    <span class="font-medium">{{ formatCLP(subtotal()) }}</span>
                  </div>
                  <div class="flex justify-between items-center mb-3 text-slate-600 text-sm">
                    <span>IVA (19%)</span>
                    <span class="font-medium">{{ formatCLP(iva()) }}</span>
                  </div>
                  <div class="pt-3 border-t border-slate-200 flex justify-between items-center">
                    <span class="font-bold text-slate-800">Total Final</span>
                    <span class="font-bold text-emerald-600 text-xl">{{ formatCLP(total()) }}</span>
                  </div>
                </div>

                <!-- Botón Guardar Cotización -->
                <button (click)="saveQuote()" class="w-72 bg-slate-800 hover:bg-slate-900 text-white px-4 py-3 rounded-xl font-medium transition-colors shadow-md flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                  Guardar Cotización
                </button>
              </div>

            </div>
          } @else if (currentView() === 'historial') {
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 class="text-lg font-medium text-slate-800">Historial de Cotizaciones</h3>
                
                <!-- Buscador -->
                <div class="relative w-full sm:w-72">
                  <input type="text" [value]="searchQuery()" (input)="updateSearchQuery($event)" placeholder="Buscar por N° o Cliente..." class="w-full rounded-lg border-slate-300 shadow-sm pl-10 pr-4 py-2 border focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="border-b-2 border-slate-200 text-sm text-slate-500">
                      <th class="pb-3 font-medium">N° Cotización</th>
                      <th class="pb-3 font-medium">Fecha</th>
                      <th class="pb-3 font-medium">Cliente</th>
                      <th class="pb-3 font-medium text-right">Total</th>
                      <th class="pb-3 font-medium text-center w-40">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="text-sm">
                    @for (quote of filteredQuotes(); track quote.id) {
                      <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td class="py-4 font-medium text-slate-700">{{ quote.quoteNumber }}</td>
                        <td class="py-4 text-slate-600">{{ formatDate(quote.date) }}</td>
                        <td class="py-4 text-slate-800">{{ quote.customerName }}</td>
                        <td class="py-4 text-right font-medium text-emerald-600">{{ formatCLP(quote.total) }}</td>
                        <td class="py-4 text-center">
                          <div class="flex items-center justify-center gap-1">
                            <!-- Ver Info -->
                            <button (click)="viewQuote(quote)" class="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors" title="Ver detalle de cotización">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                            <!-- Editar -->
                            <button (click)="editQuote(quote)" class="text-amber-500 hover:text-amber-700 p-2 rounded-lg hover:bg-amber-50 transition-colors" title="Editar y recargar">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <!-- Borrar -->
                            <button (click)="deleteSavedQuote(quote.id)" class="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors" title="Eliminar del historial">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>

                          </div>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="5" class="py-12 text-center text-slate-400 italic bg-slate-50/50 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 text-slate-300"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                          No se encontraron cotizaciones.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      </main>

      <!-- Modal Popup de Éxito al Guardar -->
      @if (showSaveModal()) {
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity">
          <div class="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center">
            <div class="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">¡Cotización guardada!</h3>
            <p class="text-slate-500 mb-6">Cotización guardada con éxito en el sistema.</p>
            <button (click)="closeSaveModal()" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-lg transition-colors">
              Aceptar
            </button>
          </div>
        </div>
      }

      <!-- Modal Popup de Error por Número Duplicado -->
      @if (showDuplicateModal()) {
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity">
          <div class="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center border-t-4 border-amber-500">
            <div class="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">Número Duplicado</h3>
            <p class="text-slate-500 mb-6">El número de cotización <strong class="text-slate-700">{{ quoteNumber() }}</strong> ya existe en el historial. Por favor, cámbialo para poder guardar.</p>
            <button (click)="showDuplicateModal.set(false)" class="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-lg transition-colors">
              Aceptar
            </button>
          </div>
        </div>
      }


      <!-- Modal Popup de Éxito al Guardar Cliente -->
      @if (showSaveClientModal()) {
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity">
          <div class="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center">
            <div class="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="12 11 14 13 18 9"></polyline></svg>
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">¡Cliente guardado!</h3>
            <p class="text-slate-500 mb-6">El registro del cliente se guardó con éxito en el directorio.</p>
            <button (click)="showSaveClientModal.set(false)" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-lg transition-colors">
              Aceptar
            </button>
          </div>
        </div>
      }

      <!-- Modal Popup de Error Validación Cliente -->
      @if (showClientValidationErrorModal()) {
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity">
          <div class="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center border-t-4 border-red-500">
            <div class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">Información Incompleta</h3>
            <p class="text-slate-500 mb-6">Debe llenar la información del cliente obligatoria (Nombre y RUT).</p>
            <button (click)="showClientValidationErrorModal.set(false)" class="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-lg transition-colors">
              Aceptar
            </button>
          </div>
        </div>
      }

      <!-- Modal Popup de Error Exportación Vacía -->
      @if (showExportEmptyModal()) {
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity">
          <div class="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center border-t-4 border-amber-500">
            <div class="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">Cotización Vacía</h3>
            <p class="text-slate-500 mb-6">Agrega al menos un ítem a la cotización para exportarla.</p>
            <button (click)="showExportEmptyModal.set(false)" class="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-lg transition-colors">
              Aceptar
            </button>
          </div>
        </div>
      }

      <!-- Modal Popup de Éxito al Guardar Producto -->
      @if (showSaveProductModal()) {
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity">
          <div class="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center">
            <div class="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="12 11 14 13 18 9"></polyline></svg>
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">¡Producto guardado!</h3>
            <p class="text-slate-500 mb-6">El producto se guardó con éxito en el catálogo.</p>
            <button (click)="showSaveProductModal.set(false)" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-lg transition-colors">
              Aceptar
            </button>
          </div>
        </div>
      }

      <!-- Modal Popup de Error Validación Producto -->
      @if (showProductValidationErrorModal()) {
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity">
          <div class="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center border-t-4 border-red-500">
            <div class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">Información Incompleta</h3>
            <p class="text-slate-500 mb-6">Debe completar el nombre y el valor neto del producto.</p>
            <button (click)="showProductValidationErrorModal.set(false)" class="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-lg transition-colors">
              Aceptar
            </button>
          </div>
        </div>
      }

    </div>
    } <!-- fin @else isLoggedIn -->
  `
})
export class App implements OnInit {
  Math = Math;
  private readonly supa = inject(SupabaseService);
  private readonly platformId = inject(PLATFORM_ID);
  isLoading = signal<boolean>(false);
  dbError = signal<string>('');

  constructor() {
    // afterNextRender garantiza que las llamadas a Supabase solo ocurren en el browser
    afterNextRender(() => {
      this.loadAllData();
    });
  }

  // --- AUTENTICACIÓN ---
  isLoggedIn = signal<boolean>(false);
  loginUsername = signal<string>('');
  loginPassword = signal<string>('');
  showLoginErrorModal = signal<boolean>(false);
  showPassword = signal<boolean>(false);

  private readonly VALID_USER = 'SolucionesMB';
  private readonly VALID_PASS = 'Solucionesmb2027';

  doLogin() {
    const user = this.loginUsername().trim();
    const pass = this.loginPassword();
    if (user === this.VALID_USER && pass === this.VALID_PASS) {
      this.showLoginErrorModal.set(false);
      this.isLoggedIn.set(true);
    } else {
      this.showLoginErrorModal.set(true);
    }
  }

  doLogout() {
    this.isLoggedIn.set(false);
    this.loginUsername.set('');
    this.loginPassword.set('');
    this.showLoginErrorModal.set(false);
    this.showPassword.set(false);
    // Limpiar datos en memoria al salir
    this.clients.set([]);
    this.products.set([]);
    this.savedQuotes.set([]);
  }
  // --- FIN AUTENTICACIÓN ---

  async ngOnInit() {
    // ngOnInit corre en el servidor (SSR) y en el cliente.
    // La carga real se hace en afterNextRender (solo browser).
  }

  async loadAllData() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.isLoading.set(true);
    this.dbError.set('');
    try {
      // Cargar clientes
      const clientes = await this.supa.getClientes();
      this.clients.set(clientes.map((c: any) => ({
        id: c.id,
        name: c.nombre,
        rut: c.rut,
        phone: c.telefono ?? '',
        email: c.email ?? '',
        address: c.direccion ?? '',
        observations: c.observaciones ?? ''
      })));

      // Cargar productos
      const productos = await this.supa.getProductos();
      this.products.set(productos.map((p: any) => ({
        id: p.id,
        name: p.nombre,
        description: p.descripcion ?? '',
        netPrice: p.precio_neto
      })));

      // Cargar cotizaciones
      const cotizaciones = await this.supa.getCotizaciones();
      this.savedQuotes.set(cotizaciones.map((q: any) => ({
        id: q.id,
        quoteNumber: q.numero_cotizacion,
        date: new Date(q.fecha + 'T12:00:00'), // mediodía para evitar desfase de zona horaria
        customerName: q.nombre_cliente,
        total: q.total,
        items: q.items ?? []
      })));
    } catch (e) {
      console.error('Error cargando datos:', e);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Manejador de estado básico para navegar entre pantallas
  currentView = signal<'dashboard' | 'clientes' | 'cotizaciones' | 'historial' | 'productos'>('dashboard');

  // Control de interfaz: Mostrar logo si existe
  hasCustomLogo = signal<boolean>(true);

  // Datos del cliente de la cotización actual
  customerName = signal<string>('');

  // Estado para la gestión de clientes
  clients = signal<Client[]>([]);
  editingClientId = signal<string | null>(null);

  // Estado para la gestión de productos
  products = signal<Product[]>([]);
  editingProductId = signal<string | null>(null);
  productSearchQuery = signal<string>('');
  productName = signal<string>('');
  productDescription = signal<string>('');
  productNetPrice = signal<string>('');

  showSaveProductModal = signal<boolean>(false);
  showProductValidationErrorModal = signal<boolean>(false);

  // Campos del formulario de clientes
  clientName = signal<string>('');
  clientRut = signal<string>('');
  clientPhone = signal<string>('');
  clientEmail = signal<string>('');
  clientAddress = signal<string>('');
  clientObservations = signal<string>('');

  // Número de la cotización actual
  quoteNumber = signal<string>('');
  editingQuoteId = signal<string | null>(null);

  // Fecha de la cotización actual
  quoteDate = signal<string>(this.getTodayDateString());

  // Controla la visibilidad del popup de guardar
  showSaveModal = signal<boolean>(false);

  // Controla la visibilidad del popup al guardar un cliente
  showSaveClientModal = signal<boolean>(false);
  showClientValidationErrorModal = signal<boolean>(false);

  // Controla la visibilidad del popup de número duplicado
  showDuplicateModal = signal<boolean>(false);

  // Controla la visibilidad del popup de cotización vacía al exportar
  showExportEmptyModal = signal<boolean>(false);



  // Estado para la exportación de PDF
  isExporting = signal<boolean>(false);

  // Texto de búsqueda para el historial
  searchQuery = signal<string>('');

  // Texto de búsqueda para el directorio de clientes
  clientSearchQuery = signal<string>('');

  // Estado de la cotización actualizado para usar QuoteRow
  items = signal<QuoteRow[]>([]);

  // Array que guarda el Historial de cotizaciones
  savedQuotes = signal<SavedQuote[]>([]);

  // --- ESTADO DEL DASHBOARD ---
  dashboardFilterDate = signal<string>(this.getTodayDateString());

  totalQuotesCount = computed(() => this.savedQuotes().length);

  todayQuotesCount = computed(() => {
    const todayStr = this.getTodayDateString();
    const [year, month, day] = todayStr.split('-');
    return this.savedQuotes().filter(quote => {
      const qDate = quote.date;
      return qDate.getFullYear() === parseInt(year) &&
             qDate.getMonth() === parseInt(month) - 1 &&
             qDate.getDate() === parseInt(day);
    }).length;
  });

  dashboardQuotesByDate = computed(() => {
    const filterDateStr = this.dashboardFilterDate();
    if (!filterDateStr) return [];
    const [year, month, day] = filterDateStr.split('-');
    return this.savedQuotes().filter(quote => {
      const qDate = quote.date;
      return qDate.getFullYear() === parseInt(year) &&
             qDate.getMonth() === parseInt(month) - 1 &&
             qDate.getDate() === parseInt(day);
    }).slice(0, 5);
  });

  updateDashboardFilterDate(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dashboardFilterDate.set(input.value);
  }
  // -----------------------------

  // Lista de cotizaciones filtradas basada en la búsqueda
  filteredQuotes = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const quotes = this.savedQuotes();

    if (!query) {
      return quotes;
    }

    return quotes.filter(quote => 
      quote.customerName.toLowerCase().includes(query) || 
      quote.quoteNumber.toLowerCase().includes(query)
    );
  });

  // Lista de clientes filtrada por nombre/RUT, ordenada de más reciente a más antiguo, máx 12
  filteredClients = computed(() => {
    const query = this.clientSearchQuery().toLowerCase().trim();
    // Invertimos el array para mostrar el más reciente primero
    const allClients = [...this.clients()].reverse();

    const filtered = query
      ? allClients.filter(c =>
          c.name.toLowerCase().includes(query) ||
          c.rut.toLowerCase().includes(query)
        )
      : allClients;

    return filtered.slice(0, 12);
  });

  // Lista de productos filtrada
  filteredProducts = computed(() => {
    const query = this.productSearchQuery().toLowerCase().trim();
    const allProducts = [...this.products()].reverse();
    const filtered = query
      ? allProducts.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
        )
      : allProducts;
    return filtered.slice(0, 10);
  });

  productIvaAmount = computed(() => Math.round(this.getProductNumericNetPrice() * 0.19));
  productGrossPrice = computed(() => Math.round(this.getProductNumericNetPrice() * 1.19));

  getProductNumericNetPrice(): number {
    const val = this.productNetPrice().replace(/\D/g, '');
    return val ? parseInt(val, 10) : 0;
  }

  // Cálculos automáticos usando computed signals de Angular
  subtotal = computed(() => {
    return this.items().reduce((sum, item) => sum + (item.quantity * item.price), 0);
  });

  iva = computed(() => {
    return Math.round(this.subtotal() * 0.19); // 19% de IVA en Chile
  });

  total = computed(() => {
    return this.subtotal() + this.iva();
  });

  /**
   * Reordena los items para que cada Item Principal (título) siempre quede
   * encima de sus sub-ítems, sin importar el orden en que fueron ingresados.
   * Algoritmo: agrupa items por título usando el último título visto;
   * los sub-ítems sin título previo se colocan al final como grupo huérfano.
   */
  sortedItems = computed(() => {
    const raw = this.items();
    const groups: { title: QuoteRow | null; children: QuoteRow[] }[] = [];
    let orphans: QuoteRow[] = [];

    // Separar títulos y sub-ítems
    const titles = raw.filter(i => i.isTitle);
    const subs   = raw.filter(i => !i.isTitle);

    if (titles.length === 0) {
      // Sin títulos, mostrar sub-ítems tal cual
      return subs;
    }

    // Construir grupos: cada título lleva los sub-ítems que le siguen en el array original
    // Para esto usamos el índice original de cada item como referencia de orden.
    const indexMap = new Map<string, number>(raw.map((item, idx) => [item.id, idx]));

    // Ordenar títulos por su posición original
    const sortedTitles = [...titles].sort((a, b) => (indexMap.get(a.id) ?? 0) - (indexMap.get(b.id) ?? 0));

    // Asignar cada sub-ítem al título más cercano ANTERIOR o POSTERIOR
    for (const title of sortedTitles) {
      groups.push({ title, children: [] });
    }

    for (const sub of subs) {
      const subIdx = indexMap.get(sub.id) ?? 0;
      // Buscar el grupo cuyo título tenga el índice original más cercano (menor o igual) al sub-ítem
      let bestGroup = groups[0];
      let bestDiff = Infinity;

      for (const group of groups) {
        const titleIdx = indexMap.get(group.title!.id) ?? 0;
        const diff = subIdx - titleIdx; // positivo: sub-ítem fue ingresado después del título
        if (diff >= 0 && diff < bestDiff) {
          bestDiff = diff;
          bestGroup = group;
        }
      }

      // Si no encontró un título anterior (sub-ítem ingresado antes de todos los títulos),
      // asignarlo al primer grupo (el título más cercano hacia adelante)
      if (bestDiff === Infinity) {
        let minFwdDiff = Infinity;
        for (const group of groups) {
          const titleIdx = indexMap.get(group.title!.id) ?? 0;
          const fwdDiff = titleIdx - subIdx;
          if (fwdDiff >= 0 && fwdDiff < minFwdDiff) {
            minFwdDiff = fwdDiff;
            bestGroup = group;
          }
        }
      }

      bestGroup.children.push(sub);
    }

    // Aplanar: título → sus sub-ítems
    const result: QuoteRow[] = [];
    for (const group of groups) {
      if (group.title) result.push(group.title);
      result.push(...group.children);
    }
    result.push(...orphans);
    return result;
  });

  // Métodos para interactuar con la vista

  // --- GESTIÓN DE CLIENTES ---
  
  updateClientForm(field: 'name'|'rut'|'phone'|'email'|'address'|'observations', event: Event) {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    switch(field) {
      case 'name': this.clientName.set(value); break;
      case 'rut': this.clientRut.set(value); break;
      case 'phone': this.clientPhone.set(value); break;
      case 'email': this.clientEmail.set(value); break;
      case 'address': this.clientAddress.set(value); break;
      case 'observations': this.clientObservations.set(value); break;
    }
  }

  async saveClient() {
    if (!this.clientName().trim() || !this.clientRut().trim()) {
      this.showClientValidationErrorModal.set(true);
      return;
    }

    const editId = this.editingClientId();
    try {
      if (editId) {
        const updated = await this.supa.updateCliente(editId, {
          nombre: this.clientName(),
          rut: this.clientRut(),
          telefono: this.clientPhone(),
          email: this.clientEmail(),
          direccion: this.clientAddress(),
          observaciones: this.clientObservations()
        });
        this.clients.update(c => c.map(cl => cl.id === editId ? {
          id: updated.id, name: updated.nombre, rut: updated.rut,
          phone: updated.telefono ?? '', email: updated.email ?? '',
          address: updated.direccion ?? '', observations: updated.observaciones ?? ''
        } : cl));
      } else {
        const inserted = await this.supa.insertCliente({
          nombre: this.clientName(), rut: this.clientRut(),
          telefono: this.clientPhone(), email: this.clientEmail(),
          direccion: this.clientAddress(), observaciones: this.clientObservations()
        });
        this.clients.update(c => [{
          id: inserted.id, name: inserted.nombre, rut: inserted.rut,
          phone: inserted.telefono ?? '', email: inserted.email ?? '',
          address: inserted.direccion ?? '', observations: inserted.observaciones ?? ''
        }, ...c]);
      }
      this.clearClientForm();
      this.showSaveClientModal.set(true);
    } catch (e) {
      console.error('Error guardando cliente:', e);
    }
  }

  clearClientForm() {
    this.clientName.set('');
    this.clientRut.set('');
    this.clientPhone.set('');
    this.clientEmail.set('');
    this.clientAddress.set('');
    this.clientObservations.set('');
    this.editingClientId.set(null); // Reseteamos modo edición
  }

  editClient(client: Client) {
    this.clientName.set(client.name);
    this.clientRut.set(client.rut);
    this.clientPhone.set(client.phone || '');
    this.clientEmail.set(client.email || '');
    this.clientAddress.set(client.address || '');
    this.clientObservations.set(client.observations || '');
    this.editingClientId.set(client.id); // Guardamos su ID para que 'saveClient' lo actualice
  }

  createQuoteForClient(client: Client) {
    this.clearQuote(); // Limpiar el de la cotización actual, si existe
    this.customerName.set(client.name); // Prellenamos el input del cliente con el nombre
    this.currentView.set('cotizaciones'); // Nos movemos a la vista
  }

  async deleteClient(id: string) {
    try {
      await this.supa.deleteCliente(id);
      this.clients.update(c => c.filter(client => client.id !== id));
    } catch (e) {
      console.error('Error eliminando cliente:', e);
    }
  }

  // --- GESTIÓN DE PRODUCTOS ---
  
  updateProductSearchQuery(event: Event) {
    const input = event.target as HTMLInputElement;
    this.productSearchQuery.set(input.value);
  }

  updateProductForm(field: 'name'|'description', event: Event) {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    switch(field) {
      case 'name': this.productName.set(value); break;
      case 'description': this.productDescription.set(value); break;
    }
  }

  formatProductPriceInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value) {
      input.value = new Intl.NumberFormat('es-CL').format(parseInt(value, 10));
      this.productNetPrice.set(input.value);
    } else {
      input.value = '';
      this.productNetPrice.set('');
    }
  }

  async saveProduct() {
    const netPriceNum = this.getProductNumericNetPrice();
    if (!this.productName().trim() || netPriceNum <= 0) {
      this.showProductValidationErrorModal.set(true);
      return;
    }

    const editId = this.editingProductId();
    try {
      if (editId) {
        const updated = await this.supa.updateProducto(editId, {
          nombre: this.productName(),
          descripcion: this.productDescription(),
          precio_neto: netPriceNum
        });
        this.products.update(p => p.map(prod => prod.id === editId ? {
          id: updated.id, name: updated.nombre,
          description: updated.descripcion ?? '', netPrice: updated.precio_neto
        } : prod));
      } else {
        const inserted = await this.supa.insertProducto({
          nombre: this.productName(),
          descripcion: this.productDescription(),
          precio_neto: netPriceNum
        });
        this.products.update(p => [{
          id: inserted.id, name: inserted.nombre,
          description: inserted.descripcion ?? '', netPrice: inserted.precio_neto
        }, ...p]);
      }
      this.clearProductForm();
      this.showSaveProductModal.set(true);
    } catch (e) {
      console.error('Error guardando producto:', e);
    }
  }

  clearProductForm() {
    this.productName.set('');
    this.productDescription.set('');
    this.productNetPrice.set('');
    this.editingProductId.set(null);
  }

  editProduct(product: Product) {
    this.productName.set(product.name);
    this.productDescription.set(product.description || '');
    this.productNetPrice.set(new Intl.NumberFormat('es-CL').format(product.netPrice));
    this.editingProductId.set(product.id);
  }

  async deleteProduct(id: string) {
    try {
      await this.supa.deleteProducto(id);
      this.products.update(p => p.filter(prod => prod.id !== id));
    } catch (e) {
      console.error('Error eliminando producto:', e);
    }
  }

  addFromCatalog(product: Product) {
    // Agregamos el producto directo a la cotización actual
    const newItem: QuoteRow = {
      id: Date.now().toString(),
      isTitle: false,
      name: product.name,
      quantity: 1,
      price: Math.round(product.netPrice * 1.19) // OJO: La cotización normalmente funciona con precios netos o brutos dependiendo de tu lógica, voy a agregar el NETO para que sume y luego saque el 19% final
    };
    // Espera, según el template, el Total tiene un Subtotal y luego le saca 19%. Por ende los items van NETOS.
    newItem.price = product.netPrice;

    this.items.update(items => [...items, newItem]);
    this.currentView.set('cotizaciones');
  }

  // --- FIN GESTIÓN DE PRODUCTOS ---

  addTitle(titleInput: HTMLInputElement) {
    const name = titleInput.value.trim();
    if (name) {
      const newTitle: QuoteRow = {
        id: Date.now().toString(),
        isTitle: true,
        name,
        quantity: 0, // Los títulos no suman al total
        price: 0
      };
      this.items.update(items => [...items, newTitle]);
      titleInput.value = '';
      titleInput.focus();
    }
  }

  // Da formato al campo de precio con puntos separadores de miles mientras el usuario escribe
  formatPriceInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // Elimina cualquier caracter que no sea un número (letras, puntos, comas, etc)
    let value = input.value.replace(/\D/g, '');
    
    if (value) {
      // Vuelve a formatear con el estándar chileno (agrega los puntos automáticamente)
      input.value = new Intl.NumberFormat('es-CL').format(parseInt(value, 10));
    } else {
      input.value = '';
    }
  }

  addItem(nameInput: HTMLInputElement, qtyInput: HTMLInputElement, priceInput: HTMLInputElement) {
    const name = nameInput.value.trim();
    const qty = parseInt(qtyInput.value, 10);
    // Limpiamos los puntos del formato chileno antes de convertir a número real para la base de datos
    const priceText = priceInput.value.replace(/\./g, '');
    const price = parseFloat(priceText);

    // Validamos que los datos sean correctos antes de agregar
    if (name && qty > 0 && price >= 0) {
      const newItem: QuoteRow = {
        id: Date.now().toString(),
        isTitle: false,
        name,
        quantity: qty,
        price
      };
      
      // Agregamos el nuevo item a la lista
      this.items.update(items => [...items, newItem]);
      
      // Limpiamos los campos visuales
      nameInput.value = '';
      qtyInput.value = '1';
      priceInput.value = '';
      nameInput.focus();
    }
  }

  removeItem(id: string) {
    this.items.update(items => items.filter(item => item.id !== id));
  }

  clearQuote() {
    this.items.set([]);
    this.customerName.set(''); // Limpiamos también el input del cliente
    this.quoteNumber.set(''); // Limpiamos el número de cotización
    this.editingQuoteId.set(null); // Reseteamos modo edición
    this.quoteDate.set(this.getTodayDateString()); // Restauramos la fecha a hoy
  }

  // Obtiene la fecha actual en formato YYYY-MM-DD para el input nativo
  getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Actualiza la señal del nombre del cliente desde el input
  updateCustomerName(event: Event) {
    const input = event.target as HTMLInputElement;
    this.customerName.set(input.value);
  }

  // Actualiza la señal del número de cotización desde el input
  updateQuoteNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    this.quoteNumber.set(input.value.toUpperCase()); 
  }

  // Actualiza la señal de la fecha
  updateQuoteDate(event: Event) {
    const input = event.target as HTMLInputElement;
    this.quoteDate.set(input.value);
  }

  // Actualiza la señal de búsqueda
  updateSearchQuery(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  // Actualiza la señal de búsqueda de clientes
  updateClientSearchQuery(event: Event) {
    const input = event.target as HTMLInputElement;
    this.clientSearchQuery.set(input.value);
  }

  // Formatear Fecha visualmente
  formatDate(date: Date): string {
    return date.toLocaleDateString('es-CL', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  async saveQuote() {
    if (this.items().length === 0) return;

    const currentQuoteNumber = this.quoteNumber().trim();
    const finalQuoteNumber = currentQuoteNumber || 'COT-' + Math.floor(10000 + Math.random() * 90000);
    const editId = this.editingQuoteId();

    // Solo verificar duplicado si es una nueva cotización o si cambiamos el número de una existente
    const isDuplicate = this.savedQuotes().some(
      q => q.id !== editId && q.quoteNumber.toLowerCase() === finalQuoteNumber.toLowerCase()
    );
    if (isDuplicate) {
      this.showDuplicateModal.set(true);
      return;
    }

    const [year, month, day] = this.quoteDate().split('-');
    const finalDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    try {
      if (editId) {
        const updated = await this.supa.updateCotizacion(editId, {
          numero_cotizacion: finalQuoteNumber,
          fecha: this.quoteDate(),
          nombre_cliente: this.customerName().trim() || 'Cliente sin registrar',
          total: this.total(),
          items: this.sortedItems()
        });

        const updatedQuote: SavedQuote = {
          id: updated.id,
          quoteNumber: updated.numero_cotizacion,
          date: finalDate,
          customerName: updated.nombre_cliente,
          total: updated.total,
          items: updated.items
        };
        this.savedQuotes.update(quotes => quotes.map(q => q.id === editId ? updatedQuote : q));
      } else {
        const inserted = await this.supa.insertCotizacion({
          numero_cotizacion: finalQuoteNumber,
          fecha: this.quoteDate(), // YYYY-MM-DD
          nombre_cliente: this.customerName().trim() || 'Cliente sin registrar',
          total: this.total(),
          items: this.sortedItems()
        });

        const newQuote: SavedQuote = {
          id: inserted.id,
          quoteNumber: inserted.numero_cotizacion,
          date: finalDate,
          customerName: inserted.nombre_cliente,
          total: inserted.total,
          items: inserted.items
        };
        this.savedQuotes.update(quotes => [newQuote, ...quotes]);
      }
      this.showSaveModal.set(true);
    } catch (e) {
      console.error('Error guardando cotización:', e);
    }
  }

  closeSaveModal() {
    this.showSaveModal.set(false);
    this.clearQuote(); // Limpia el formulario actual
    this.currentView.set('historial'); // Redirige a la pestaña de historial
  }

  // --- GENERACIÓN DE ARCHIVO PDF ---

  async exportPDF() {
    // Evita exportar una cotización vacía
    if (this.items().length === 0) {
      this.showExportEmptyModal.set(true);
      return;
    }

    this.isExporting.set(true);

    try {
      // 1. Cargamos las librerías jsPDF y AutoTable dinámicamente. 
      if (!(window as any).jspdf) {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js');
      }

      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // 2. Intentar cargar el logo de la empresa desde la carpeta public
      try {
        const logoUrl = '/logomb.jpg'; // <-- Buscará el logo en la raíz (carpeta public)
        const imgData = await this.loadImageToBase64(logoUrl);
        // Ajusta las coordenadas y tamaño (x, y, ancho, alto) según las proporciones de tu logo
        doc.addImage(imgData, 'JPEG', 14, 15, 35, 15); 
      } catch (e) {
        console.warn('Logo logomb.jpg no encontrado en la ruta assets/. Solo se mostrará el texto.');
        doc.setFontSize(12);
        doc.setTextColor(150);
        doc.text('[ Logo MB ]', 14, 25);
      }

      // 3. Texto bajo el logo
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80); // Gris oscuro
      doc.text('M&B Soluciones SpA', 14, 35);
      doc.setFontSize(8);
      doc.text('RUT: 77.858.422-0', 14, 39);
      doc.text('ventas@solucionesmb.cl', 14, 43);

      // 4. Título Principal
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(30, 41, 59); // Color oscuro
      doc.text('OFERTA ECONÓMICA', pageWidth / 2, 35, { align: 'center' });
      doc.setFont(undefined, 'normal');

      // 5. Datos del Cliente y la Cotización
      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);

      const [year, month, day] = this.quoteDate().split('-');
      const formattedDate = `${day}/${month}/${year}`;

      const currentClientName = this.customerName() || 'Sin registrar';
      const foundClient = this.clients().find(c => c.name.toLowerCase().trim() === currentClientName.toLowerCase().trim());

      let currentY = 55;
      doc.text(`Cliente: ${currentClientName}`, 14, currentY);
      
      if (foundClient) {
        if (foundClient.rut) {
          currentY += 6;
          doc.text(`RUT: ${foundClient.rut}`, 14, currentY);
        }
        if (foundClient.email) {
          currentY += 6;
          doc.text(`Correo: ${foundClient.email}`, 14, currentY);
        }
        if (foundClient.phone) {
          currentY += 6;
          doc.text(`Teléfono: ${foundClient.phone}`, 14, currentY);
        }
        if (foundClient.address) {
          currentY += 6;
          doc.text(`Dirección: ${foundClient.address}`, 14, currentY);
        }
      }

      // Datos de la cotización a la derecha
      doc.text(`N° Cotización: ${this.quoteNumber() || 'S/N'}`, pageWidth - 14, 55, { align: 'right' });
      doc.text(`Fecha: ${formattedDate}`, pageWidth - 14, 61, { align: 'right' });
      
      // Calculamos dinámicamente el inicio de la tabla
      const startTableY = Math.max(currentY + 8, 75);

      // 6. Tabla de Productos/Servicios usando AutoTable
      const tableBody = this.sortedItems().map(item => {
        if (item.isTitle) {
          // Fila destacada de título/sección
          return [
            { 
              content: item.name.toUpperCase(), 
              colSpan: 4, 
              styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [30, 41, 59] } 
            }
          ];
        } else {
          // Fila de sub-ítem
          return [
            '  • ' + item.name,
            item.quantity.toString(),
            this.formatCLP(item.price),
            this.formatCLP(item.quantity * item.price)
          ];
        }
      });

      (doc as any).autoTable({
        startY: startTableY,
        head: [['Descripción', 'Cantidad', 'Precio Unit.', 'Total']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [0, 82, 155], textColor: 255 }, // Azul alineado con el logo
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 35, halign: 'right' },
        },
        styles: { fontSize: 9, cellPadding: 5 }
      });

      // 7. Resumen de Totales
      const finalY = (doc as any).lastAutoTable.finalY + 15;

      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text(`Subtotal:`, pageWidth - 55, finalY);
      doc.text(this.formatCLP(this.subtotal()), pageWidth - 14, finalY, { align: 'right' });

      doc.text(`IVA (19%):`, pageWidth - 55, finalY + 7);
      doc.text(this.formatCLP(this.iva()), pageWidth - 14, finalY + 7, { align: 'right' });

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 82, 155); // Azul corporativo
      doc.text(`Total Final:`, pageWidth - 55, finalY + 16);
      doc.text(this.formatCLP(this.total()), pageWidth - 14, finalY + 16, { align: 'right' });

      // 8. Información Adicional / Antecedentes
      let infoY = finalY + 25;
      
      // Verificamos si cabe en la página, de lo contrario agregamos una nueva
      if (infoY + 100 > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        infoY = 20;
      }

      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      
      // Colores y Fuentes
      doc.setFont(undefined, 'bold');
      doc.text('Aceptación de Cotización:', 14, infoY);
      doc.setFont(undefined, 'normal');
      doc.text('Contra Orden de Compra', 14, infoY + 5);
      
      doc.setFont(undefined, 'bold');
      doc.text('Garantía:', 14, infoY + 12);
      doc.setFont(undefined, 'normal');
      doc.text('Producto nuevo.', 14, infoY + 17);
      
      doc.setFont(undefined, 'bold');
      doc.text('Forma de Pago:', 14, infoY + 24);
      doc.setFont(undefined, 'normal');
      doc.text('Le emitimos y enviamos la factura para realizar el prepago por transferencia bancaria.', 14, infoY + 29);
      
      doc.setFont(undefined, 'bold');
      doc.text('Lugar de Entrega:', 14, infoY + 36);
      doc.setFont(undefined, 'normal');
      doc.text('Por el medio que le acomode al cliente.', 14, infoY + 41);

      // Antecedentes bancarios
      doc.setFont(undefined, 'bold');
      doc.text('Antecedentes para transferencia bancaria:', 14, infoY + 51);
      doc.setFont(undefined, 'normal');
      
      doc.text('1_ Empresa: M&B Soluciones SpA', 14, infoY + 56);
      
      doc.text('2_ RUT: 77.858.422-03', 14, infoY + 61);
      // Aplicamos negrita temporalmente para Tipo de cuenta y Número de cuenta
      doc.setFont(undefined, 'bold');
      doc.text('Tipo de cuenta: Chequera electrónica', 60, infoY + 61);
      doc.text('Número de cuenta: 902-7-228005-2', 130, infoY + 61);
      doc.setFont(undefined, 'normal');

      doc.text('3_ Dirección: Roberto Lorca Olguín 180, El Bosque, Santiago de Chile', 14, infoY + 66);
      doc.text('4_ Contacto: Ramón Méndez Román, C.I. 9.023466-8', 14, infoY + 71);
      doc.text('5_ Nro. Celular: Móvil (569) 3241 4560 ó (569) 6589 5787', 14, infoY + 76);
      doc.text('6_ Giro: Rep. de otro tipo de Maq. y Eq. Ind. N.C.P.', 14, infoY + 81);
      doc.text('7_ Correo: rmendez@solucionesmb.cl ó claudia.mendez@solucionesmb.cl', 14, infoY + 86);
      
      // Eslogan
      doc.setFontSize(10);
      doc.setFont(undefined, 'italic');
      doc.setTextColor(0, 82, 155); // Azul alineado al logo
      doc.text('Somos una Fuente de Soluciones', 14, infoY + 94);

      // 9. Pie de página
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.setFont(undefined, 'normal');
      doc.text('Este documento es una estimación de precios y puede estar sujeta a cambios.', pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });

      // 10. Guardar
      doc.save(`Cotizacion_${this.quoteNumber() || 'Generada'}.pdf`);

    } catch (error) {
      console.error('Error al generar el PDF:', error);
      alert('Ocurrió un error al intentar generar el PDF.');
    } finally {
      this.isExporting.set(false);
    }
  }

  // Utilidad para cargar librerías externas
  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve(); return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Error: ${src}`));
      document.head.appendChild(script);
    });
  }

  // Utilidad para convertir imagen a Base64 para jsPDF
  private loadImageToBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg'));
        } else {
          reject(new Error('Canvas no soportado'));
        }
      };
      img.onerror = () => reject(new Error('Imagen no encontrada'));
      img.src = url;
    });
  }

  // --- ACCIONES DE LA TABLA HISTORIAL ---

  viewQuote(quote: SavedQuote) {
    this.loadQuoteIntoEditor(quote);
  }

  editQuote(quote: SavedQuote) {
    this.loadQuoteIntoEditor(quote);
  }

  async deleteSavedQuote(id: string) {
    if (confirm('¿Estás seguro de eliminar esta cotización?')) {
      try {
        await this.supa.deleteCotizacion(id);
        this.savedQuotes.update(quotes => quotes.filter(q => q.id !== id));
      } catch (e) {
        console.error('Error eliminando cotización:', e);
      }
    }
  }

  private loadQuoteIntoEditor(quote: SavedQuote) {
    // Recarga los datos guardados de vuelta al cotizador
    this.items.set([...quote.items]);
    this.customerName.set(quote.customerName);
    this.quoteNumber.set(quote.quoteNumber); // Cargamos también el número al editar
    this.editingQuoteId.set(quote.id); // Guardamos el ID para poder actualizar
    
    // Convertimos la fecha guardada de vuelta a YYYY-MM-DD para el input
    const d = quote.date;
    const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    this.quoteDate.set(dateString);

    this.currentView.set('cotizaciones');
  }

  // Utilidad nativa de Javascript para formatear la moneda a Peso Chileno sin cargar librerías extra
  formatCLP(value: number): string {
    return new Intl.NumberFormat('es-CL', { 
      style: 'currency', 
      currency: 'CLP',
      maximumFractionDigits: 0 // CLP no usa decimales en el día a día
    }).format(value);
  }

}
