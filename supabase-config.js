/**
 * Supabase Yapılandırması (supabase-config.js)
 * --------------------------------------------
 * 1. https://supabase.com adresine gidip ücretsiz projenizi oluşturun.
 * 2. Sol menüdeki "Project Settings" -> "API" kısmına gidin.
 * 3. Aşağıdaki iki bilgiyi ilgili alanlara yapıştırınız:
 */

const SUPABASE_URL = 'https://uoifjxyflphlwpdoqaso.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'sb_publishable_VYgJS4jbBA6xLTTn83PobQ_dO1B-dgG';

let _supabaseClientInstance = null;

// Supabase Yapılandırılmış mı kontrolü
function isSupabaseConfigured() {
    return Boolean(
        SUPABASE_URL &&
        SUPABASE_URL !== 'https://uoifjxyflphlwpdoqaso.supabase.co/rest/v1/' &&
        SUPABASE_ANON_KEY &&
        SUPABASE_ANON_KEY !== 'sb_publishable_VYgJS4jbBA6xLTTn83PobQ_dO1B-dgG' &&
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
        if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
            _supabaseClientInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            return _supabaseClientInstance;
        }
    } catch (err) {
        console.warn('Supabase istemcisi başlatılamadı:', err);
    }
    return null;
}
