/**
 * Supabase Yapılandırması (supabase-config.js)
 * --------------------------------------------
 */

// Supabase Proje URL'si (sonunda /rest/v1 OLMAMALIDIR)
const SUPABASE_URL = 'https://uoifjxyflphlwpdoqaso.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_VYgJS4jbBA6xLTTn83PobQ_dO1B-dgG';

let _supabaseClientInstance = null;

// Supabase Yapılandırılmış mı kontrolü
function isSupabaseConfigured() {
    return Boolean(
        SUPABASE_URL &&
        !SUPABASE_URL.includes('BURAYA') &&
        SUPABASE_ANON_KEY &&
        !SUPABASE_ANON_KEY.includes('BURAYA') &&
        SUPABASE_URL.startsWith('https://')
    );
}

// Supabase İstemcisini Getir
function getSupabaseClient() {
    if (!isSupabaseConfigured()) {
        return null;
    }

    if (_supabaseClientInstance) {
        return _supabaseClientInstance;
    }

    try {
        // URL sonunda /rest/v1 veya fazladan slash kalmışsa otomatik temizle
        const cleanUrl = SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
        
        if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
            _supabaseClientInstance = window.supabase.createClient(cleanUrl, SUPABASE_ANON_KEY);
            return _supabaseClientInstance;
        }
    } catch (err) {
        console.warn('Supabase istemcisi başlatılamadı:', err);
    }
    return null;
}
