(function (window) {
    'use strict';
    const _k = [0x54, 0x75, 0x72, 0x6e, 0x75, 0x76, 0x61, 0x32, 0x30, 0x32, 0x36];
    const _b1 = [60,1,6,30,6,76,78,29,82,93,91,34,16,5,10,20,17,19,94,92,93,94,61,1,24,15,0,30,79,65,69,66,87,54,20,1,11,91,21,14];
    const _b2 = [39,23,45,30,0,20,13,91,67,90,87,54,25,23,49,15,61,32,124,7,75,123,60,39,75,59,20,49,13,67,9,107,96,34,33,74,9,42,51,45,93,124,4,71,34,54];
    function _decrypt(bytes) {
        let out = '';
        for (let i = 0; i < bytes.length; i++) {
            out += String.fromCharCode(bytes[i] ^ _k[i % _k.length]);
        }
        return out;
    }
    let _supabaseClientInstance = null;
    function isSupabaseConfigured() {
        return true;
    }
    function createProtectedClientProxy(rawClient) {
        if (!rawClient) return null;
        return new Proxy(rawClient, {
            get(target, prop, receiver) {
                if (prop === 'from') {
                    return function(table) {
                        const queryBuilder = target.from(table);
                        return new Proxy(queryBuilder, {
                            get(qTarget, qProp, qReceiver) {
                                if (['insert', 'update', 'upsert', 'delete'].includes(qProp)) {
                                    const isAuth = typeof window.TurnuvaAuth !== 'undefined' && 
                                                   typeof window.TurnuvaAuth.isAuthenticated === 'function' && 
                                                   window.TurnuvaAuth.isAuthenticated();
                                    if (!isAuth) {
                                        console.warn('[Güvenlik Engeli] Veritabanı yazma/silme/güncelleme yetkiniz yok.');
                                        return function() {
                                            return Promise.resolve({
                                                data: null,
                                                error: { message: 'Güvenlik Koruması: Yönetici doğrulaması olmadan veritabanına doğrudan yazılamaz.' }
                                            });
                                        };
                                    }
                                }
                                const origVal = Reflect.get(qTarget, qProp, qReceiver);
                                return typeof origVal === 'function' ? origVal.bind(qTarget) : origVal;
                            }
                        });
                    };
                }
                const orig = Reflect.get(target, prop, receiver);
                return typeof orig === 'function' ? orig.bind(target) : orig;
            }
        });
    }
    const _noOpStorage = {
        getItem: function() { return null; },
        setItem: function() {},
        removeItem: function() {}
    };
    function getSupabaseClient() {
        if (_supabaseClientInstance) return _supabaseClientInstance;
        if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
            try {
                const u = _decrypt(_b1);
                const a = _decrypt(_b2);
                const rawInstance = window.supabase.createClient(u, a, {
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false,
                        detectSessionInUrl: false,
                        storage: _noOpStorage
                    }
                });
                _supabaseClientInstance = createProtectedClientProxy(rawInstance);
                return _supabaseClientInstance;
            } catch (e) {
                return null;
            }
        }
        return null;
    }
    Object.defineProperty(window, 'getSupabaseClient', {
        value: getSupabaseClient,
        writable: false,
        configurable: false,
        enumerable: false
    });
    Object.defineProperty(window, 'isSupabaseConfigured', {
        value: isSupabaseConfigured,
        writable: false,
        configurable: false,
        enumerable: false
    });
})(typeof window !== 'undefined' ? window : this);
