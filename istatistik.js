/**
 * Turnuva Oyuncu ve İstatistik Yönetim Modülü (istatistik.js)
 * Gol krallığı, sarı ve kırmızı kart istatistiklerini yönetir.
 * Yerel önbellek (LocalStorage) ve çift yönlü bulut (Supabase) senkronizasyonunu destekler.
 */

// Varsayılan Oyuncu Listesi (Turnuvaya kayıtlı başlangıç verileri)
const DEFAULT_PLAYERS = [
    { id: "p-1", name: "Enes Çakır", team: "Halkla İlişkiler 1", goals: 0, yellowCards: 1, redCards: 0 },
    { id: "p-2", name: "Emirhan Sarıçam", team: "İşletme 1/2", goals: 0, yellowCards: 0, redCards: 0 },
    { id: "p-3", name: "Mahmut", team: "Halkla İlişkiler 1", goals: 0, yellowCards: 0, redCards: 0 },
    { id: "p-4", name: "Göktuğ Candan", team: "Web Tasarım ve Kodlama", goals: 0, yellowCards: 1, redCards: 0 },
    { id: "p-5", name: "Yiğit", team: "İşletme 1/2", goals: 0, yellowCards: 0, redCards: 0 },
    { id: "p-6", name: "Arda E.", team: "Halkla İlişkiler 2", goals: 0, yellowCards: 0, redCards: 0 },
    { id: "p-7", name: "Emre Bostancıoğlu", team: "Halkla İlişkiler 2", goals: 0, yellowCards: 0, redCards: 0 },
    { id: "p-8", name: "Aykut Çetinbaş", team: "Maliye 1", goals: 0, yellowCards: 0, redCards: 0 },
    { id: "p-9", name: "Sinan", team: "İşletme 1/2", goals: 0, yellowCards: 0, redCards: 1 },
    { id: "p-10", name: "Alperen Gözüm", team: "Web Tasarım ve Kodlama", goals: 0, yellowCards: 1, redCards: 0 },
    { id: "p-11", name: "Serhat Yazıcı", team: "Web Tasarım ve Kodlama", goals: 0, yellowCards: 1, redCards: 0 }
];

const STATS_STORAGE_KEY = 'turnuva_stats_v1';
const STATS_ADMIN_PIN_KEY = 'turnuva_admin_pin';
const STATS_ADMIN_AUTH_KEY = 'turnuva_admin_authenticated';
const STATS_DEFAULT_PIN = '3519';

let _statsRealtimeSubscribed = false;

/**
 * Derin kopya alma yardımcısı
 */
function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Oyuncu listesini getir (Önbellekten veya varsayılandan)
 */
function getPlayersData() {
    try {
        const stored = localStorage.getItem(STATS_STORAGE_KEY);
        if (stored !== null) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('İstatistik yerel verisi okunamadı:', e);
    }

    const defaultData = cloneObject(DEFAULT_PLAYERS);
    savePlayersData(defaultData, false);
    return defaultData;
}

/**
 * Oyuncu verilerini kaydet (LocalStorage + Supabase Çift Katmanlı Bulut Yedekleme)
 */
async function savePlayersData(playersList, syncToCloud = true) {
    // 1. Yerel önbelleğe her zaman kaydet
    try {
        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(playersList));
        window.dispatchEvent(new CustomEvent('turnuva_stats_updated', { detail: { players: playersList } }));
    } catch (e) {
        console.error('İstatistik verisi yerel önbelleğe kaydedilemedi:', e);
    }

    if (!syncToCloud) {
        return { success: true, cloudSynced: false, method: 'local_only' };
    }

    if (typeof getSupabaseClient !== 'function') {
        return { success: true, cloudSynced: false, method: 'no_client' };
    }

    const client = getSupabaseClient();
    if (!client) {
        return { success: true, cloudSynced: false, method: 'no_client' };
    }

    let cloudSynced = false;
    let cloudTarget = null;
    let lastError = null;

    // 1. Öncelikle turnuva_istatistik tablosuna yazmayı dene
    try {
        const { error: sError } = await client
            .from('turnuva_istatistik')
            .upsert({
                id: 'main',
                data: playersList,
                updated_at: new Date().toISOString()
            });

        if (!sError) {
            cloudSynced = true;
            cloudTarget = 'turnuva_istatistik';
            console.log('İstatistik verisi turnuva_istatistik tablosuna kaydedildi.');
        } else {
            console.warn('turnuva_istatistik tablosu bulunamadı, yedek sistem tablosuna yönlendiriliyor:', sError.message || sError);
            lastError = sError;
        }
    } catch (e) {
        console.warn('turnuva_istatistik istisnası:', e);
        lastError = e;
    }

    // 2. Tablo yoksa, duyurular tablosuna 'system-turnuva-istatistik' özel sistem kaydı olarak yedekle
    if (!cloudSynced) {
        try {
            const systemPayload = {
                id: 'system-turnuva-istatistik',
                title: 'SYSTEM_TOURNAMENT_STATS_v1',
                category: 'system',
                category_label: 'Sistem İstatistik Verisi',
                date: new Date().toISOString(),
                author: 'System',
                pinned: false,
                summary: 'Otomatik Turnuva Oyuncu ve İstatistik Veritabanı Kaydı',
                content: JSON.stringify(playersList)
            };

            const { error: dError } = await client
                .from('duyurular')
                .upsert(systemPayload);

            if (!dError) {
                cloudSynced = true;
                cloudTarget = 'duyurular (yedek sistem depolama)';
                console.log('İstatistik verisi Supabase bulutuna sistem kaydı olarak aktarıldı.');
            } else {
                console.error('Yedek sistem tablosuna da yazılamadı:', dError);
                lastError = dError;
            }
        } catch (dErr) {
            console.error('Yedek bulut kaydetme istisnası:', dErr);
            lastError = dErr;
        }
    }

    return {
        success: true,
        cloudSynced: cloudSynced,
        cloudTarget: cloudTarget,
        error: lastError
    };
}

/**
 * Oyuncu ekle
 */
async function addPlayer(playerObj, syncToCloud = true) {
    const list = getPlayersData();
    const newPlayer = {
        id: 'p-' + Date.now(),
        name: playerObj.name ? playerObj.name.trim() : 'İsimsiz Oyuncu',
        team: playerObj.team ? playerObj.team.trim() : 'Takımsız',
        goals: Math.max(0, parseInt(playerObj.goals, 10) || 0),
        yellowCards: Math.max(0, parseInt(playerObj.yellowCards, 10) || 0),
        redCards: Math.max(0, parseInt(playerObj.redCards, 10) || 0)
    };

    list.push(newPlayer);
    const res = await savePlayersData(list, syncToCloud);
    return { player: newPlayer, ...res };
}

/**
 * Oyuncu sil (çıkar)
 */
async function deletePlayer(playerId, syncToCloud = true) {
    let list = getPlayersData();
    list = list.filter(p => String(p.id) !== String(playerId));
    const res = await savePlayersData(list, syncToCloud);
    return res;
}

/**
 * Varsayılan oyuncu listesine sıfırla
 */
async function resetPlayersData() {
    const defaultData = cloneObject(DEFAULT_PLAYERS);
    await savePlayersData(defaultData, true);
    return defaultData;
}

/**
 * Buluttan istatistik verilerini çek
 */
async function fetchPlayersCloudData() {
    if (typeof getSupabaseClient !== 'function') return null;
    const client = getSupabaseClient();
    if (!client) return null;

    // 1. Önce turnuva_istatistik tablosunu kontrol et
    try {
        const { data, error } = await client
            .from('turnuva_istatistik')
            .select('data')
            .eq('id', 'main')
            .maybeSingle();

        if (!error && data && Array.isArray(data.data)) {
            return data.data;
        }
    } catch (err) {
        console.warn('turnuva_istatistik tablosu sorgulanamadı:', err);
    }

    // 2. Yoksa duyurular tablosundaki sistem kaydını kontrol et
    try {
        const { data: sData, error: sError } = await client
            .from('duyurular')
            .select('content')
            .eq('id', 'system-turnuva-istatistik')
            .maybeSingle();

        if (!sError && sData && sData.content) {
            const parsed = JSON.parse(sData.content);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (dErr) {
        console.warn('Yedek sistem istatistik kaydı sorgulanamadı:', dErr);
    }

    return null;
}

/**
 * Supabase Senkronizasyonu ve Realtime Canlı Dinleme
 */
async function initPlayersDataSync(onDataLoadedCallback) {
    if (typeof getSupabaseClient !== 'function') return;
    const client = getSupabaseClient();
    if (!client) return;

    try {
        const cloudData = await fetchPlayersCloudData();
        if (cloudData && Array.isArray(cloudData)) {
            localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(cloudData));
            window.dispatchEvent(new CustomEvent('turnuva_stats_updated', { detail: { players: cloudData } }));
            if (typeof onDataLoadedCallback === 'function') {
                onDataLoadedCallback(cloudData);
            }
        }
    } catch (err) {
        console.warn('İstatistik bulut verisi çekilemedi:', err);
    }

    // Realtime Dinleme (İki kanalı da dinle)
    if (!_statsRealtimeSubscribed) {
        try {
            // 1. turnuva_istatistik tablosu
            client
                .channel('realtime_turnuva_istatistik')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'turnuva_istatistik', filter: 'id=eq.main' },
                    payload => {
                        if (payload.new && Array.isArray(payload.new.data)) {
                            localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(payload.new.data));
                            window.dispatchEvent(new CustomEvent('turnuva_stats_updated', { detail: { players: payload.new.data } }));
                            if (typeof onDataLoadedCallback === 'function') {
                                onDataLoadedCallback(payload.new.data);
                            }
                        }
                    }
                )
                .subscribe();

            // 2. duyurular tablosundaki sistem kaydı
            client
                .channel('realtime_duyurular_istatistik')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'duyurular', filter: 'id=eq.system-turnuva-istatistik' },
                    payload => {
                        if (payload.new && payload.new.content) {
                            try {
                                const parsed = JSON.parse(payload.new.content);
                                if (Array.isArray(parsed)) {
                                    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(parsed));
                                    window.dispatchEvent(new CustomEvent('turnuva_stats_updated', { detail: { players: parsed } }));
                                    if (typeof onDataLoadedCallback === 'function') {
                                        onDataLoadedCallback(parsed);
                                    }
                                }
                            } catch (pe) {
                                console.warn('Realtime stats JSON hatası:', pe);
                            }
                        }
                    }
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        _statsRealtimeSubscribed = true;
                    }
                });
        } catch (rtErr) {
            console.warn('Realtime istatistik başlatılamadı:', rtErr);
        }
    }
}

/**
 * Gol Krallığı Sıralaması (Gol sayısına göre azalan, isim alfabetik)
 */
function getTopScorers(playersList) {
    const list = playersList || getPlayersData();
    const sorted = [...list].sort((a, b) => {
        const ga = parseInt(a.goals, 10) || 0;
        const gb = parseInt(b.goals, 10) || 0;
        if (gb !== ga) return gb - ga;
        return a.name.localeCompare(b.name, 'tr');
    });
    return sorted;
}

/**
 * Kart Raporu Sıralaması (Kırmızı kart * 2 + Sarı kart sayısına göre azalan)
 */
function getCardReports(playersList) {
    const list = playersList || getPlayersData();
    // En az 1 sarı veya kırmızı kartı olanları filtrele
    const cardHolders = list.filter(p => (parseInt(p.yellowCards, 10) > 0) || (parseInt(p.redCards, 10) > 0));
    
    cardHolders.sort((a, b) => {
        const scoreA = (parseInt(a.redCards, 10) || 0) * 2 + (parseInt(a.yellowCards, 10) || 0);
        const scoreB = (parseInt(b.redCards, 10) || 0) * 2 + (parseInt(b.yellowCards, 10) || 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return a.name.localeCompare(b.name, 'tr');
    });

    return cardHolders;
}

/**
 * Yönetici PIN Doğrulama Yardımcıları (Ortak anahtar turnuva_admin_pin kullanır)
 */
function getAdminPIN() {
    const savedPin = localStorage.getItem(STATS_ADMIN_PIN_KEY);
    if (!savedPin || savedPin === '1234') {
        localStorage.setItem(STATS_ADMIN_PIN_KEY, STATS_DEFAULT_PIN);
        return STATS_DEFAULT_PIN;
    }
    return savedPin;
}

function isAdminAuthenticated() {
    return sessionStorage.getItem(STATS_ADMIN_AUTH_KEY) === 'true';
}

function authenticateAdmin(pin) {
    const currentPin = getAdminPIN();
    if (pin && pin.trim() === currentPin) {
        sessionStorage.setItem(STATS_ADMIN_AUTH_KEY, 'true');
        return true;
    }
    return false;
}

function logoutAdmin() {
    sessionStorage.removeItem(STATS_ADMIN_AUTH_KEY);
}

// Sayfa Açıldığında İstatistik Senkronizasyonunu Otomatik Başlat (Retry mekanizmasıyla)
if (typeof window !== 'undefined') {
    const autoInitStats = (retries = 15) => {
        if (typeof isSupabaseConfigured === 'function' && isSupabaseConfigured()) {
            const client = (typeof getSupabaseClient === 'function') ? getSupabaseClient() : null;
            if (client) {
                initPlayersDataSync((cloudData) => {
                    if (typeof renderAllStatsViews === 'function') {
                        renderAllStatsViews(cloudData);
                    }
                });
            } else if (retries > 0) {
                setTimeout(() => autoInitStats(retries - 1), 150);
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => autoInitStats());
    } else {
        autoInitStats();
    }
}
