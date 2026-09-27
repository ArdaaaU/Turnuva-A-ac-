/**
 * Turnuva Oyuncu, Takım ve İstatistik Yönetim Modülü (istatistik.js)
 * Tekli Genel Puan Durumu, Gol Krallığı ve Takım Kadrolarını yönetir.
 * Yerel önbellek (LocalStorage) ve çift yönlü bulut (Supabase) senkronizasyonunu destekler.
 */

// Varsayılan Takım Kadroları (Kullanıcı tarafından belirlenen kesin liste)
const DEFAULT_TEAMS_ROSTER = {
    "hit-2": [
        "aykut",
        "gazi",
        "mahmut",
        "cakir",
        "ibo",
        "mertcan"
    ],
    "wtk-2": [
        "alpi",
        "serhat",
        "mehmet acar",
        "oguzhan",
        "sihir",
        "kurtmehmet",
        "ali",
        "goktug"
    ],
    "hit-1": [
        "can",
        "semih",
        "tunc",
        "baris",
        "enes",
        "davut",
        "bilal",
        "arda"
    ],
    "maliye isletme -2": [
        "burak",
        "emirhan",
        "umut",
        "toprak",
        "emir",
        "burak kus",
        "yigit",
        "mert"
    ],
    "ic mekan tasarim-2": [
        "enes",
        "ahmethan",
        "sadik",
        "samet"
    ]
};

// Takım Kadrolarından Başlangıç Oyuncu Listesini Oluştur
const DEFAULT_PLAYERS = [];
let _pCounter = 1;
for (const [teamName, playerNames] of Object.entries(DEFAULT_TEAMS_ROSTER)) {
    playerNames.forEach(pName => {
        DEFAULT_PLAYERS.push({
            id: `p-${_pCounter++}`,
            name: pName,
            team: teamName,
            goals: 0
        });
    });
}

// Varsayılan Tekli Genel Puan Durumu (Grup ayrımı yok, tüm takımlar tek tabloda)
const DEFAULT_STANDINGS = [
    { id: "t-hit2", name: "hit-2", o: 0, g: 0, b: 0, m: 0, av: 0, p: 0 },
    { id: "t-wtk2", name: "wtk-2", o: 0, g: 0, b: 0, m: 0, av: 0, p: 0 },
    { id: "t-hit1", name: "hit-1", o: 0, g: 0, b: 0, m: 0, av: 0, p: 0 },
    { id: "t-maliye2", name: "maliye isletme -2", o: 0, g: 0, b: 0, m: 0, av: 0, p: 0 },
    { id: "t-icmekan2", name: "ic mekan tasarim-2", o: 0, g: 0, b: 0, m: 0, av: 0, p: 0 }
];

const STATS_STORAGE_KEY = 'turnuva_stats_v4';
const STANDINGS_STORAGE_KEY = 'turnuva_standings_v4';
const STATS_ADMIN_PIN_KEY = 'turnuva_admin_pin';
const STATS_ADMIN_AUTH_KEY = 'turnuva_admin_authenticated';
const STATS_DEFAULT_PIN = '3519';

let _statsRealtimeSubscribed = false;
let _standingsRealtimeSubscribed = false;

/**
 * Derin kopya alma yardımcısı
 */
function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// ============================================================
// 1. OYUNCU VE GOL VERİLERİ (LOCALSTORAGE & SUPABASE)
// ============================================================

/**
 * Verilen oyuncu listesinin geçerli 5 takımı içerip içermediğini denetler
 */
function isValidTournamentRoster(playersList) {
    if (!Array.isArray(playersList) || playersList.length < 20) return false;
    const currentTeams = Object.keys(DEFAULT_TEAMS_ROSTER);
    return currentTeams.every(teamName => 
        playersList.some(p => p.team && p.team.toLowerCase().trim() === teamName.toLowerCase().trim())
    );
}

/**
 * Oyuncu listesini getir (Önbellekten veya varsayılandan)
 */
function getPlayersData() {
    try {
        const stored = localStorage.getItem(STATS_STORAGE_KEY);
        if (stored !== null) {
            const parsed = JSON.parse(stored);
            if (isValidTournamentRoster(parsed)) {
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
    // 1. Yerel önbelleğe kaydet
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
        } else {
            lastError = sError;
        }
    } catch (e) {
        lastError = e;
    }

    // 2. Tablo yoksa, duyurular tablosuna 'system-turnuva-istatistik' özel sistem kaydı olarak yedekle
    if (!cloudSynced) {
        try {
            const systemPayload = {
                id: 'system-turnuva-istatistik',
                title: 'SYSTEM_TOURNAMENT_STATS_v2',
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
            } else {
                lastError = dError;
            }
        } catch (dErr) {
            lastError = dErr;
        }
    }

    return { success: true, cloudSynced, cloudTarget, error: lastError };
}

/**
 * Oyuncu ekle
 */
async function addPlayer(playerObj, syncToCloud = true) {
    const list = getPlayersData();
    const newPlayer = {
        id: 'p-' + Date.now(),
        name: playerObj.name ? playerObj.name.trim() : 'İsimsiz Oyuncu',
        team: playerObj.team ? playerObj.team.trim() : 'hit-2',
        goals: Math.max(0, parseInt(playerObj.goals, 10) || 0)
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

        if (!error && data && isValidTournamentRoster(data.data)) {
            return data.data;
        }
    } catch (err) {
        console.warn('turnuva_istatistik sorgulanamadı:', err);
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
            if (isValidTournamentRoster(parsed)) {
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
        if (cloudData && isValidTournamentRoster(cloudData)) {
            localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(cloudData));
            window.dispatchEvent(new CustomEvent('turnuva_stats_updated', { detail: { players: cloudData } }));
            if (typeof onDataLoadedCallback === 'function') {
                onDataLoadedCallback(cloudData);
            }
        } else {
            // Eğer bulutta veri yoksa veya eski/geçersiz ise güncel varsayılan 34 oyuncuyu buluta kaydet
            savePlayersData(getPlayersData(), true);
        }
    } catch (err) {
        console.warn('İstatistik bulut verisi çekilemedi:', err);
    }

    if (!_statsRealtimeSubscribed) {
        try {
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
                .subscribe(status => {
                    if (status === 'SUBSCRIBED') {
                        _statsRealtimeSubscribed = true;
                    }
                });
        } catch (rtErr) {
            console.warn('Realtime istatistik başlatılamadı:', rtErr);
        }
    }
}

// ============================================================
// 2. PUAN DURUMU YÖNETİMİ (TEK TABLO, GRUP AYRIMI YOK)
// ============================================================

/**
 * Verilen puan tablosunun geçerli 5 takımı içerip içermediğini denetler
 */
function isValidTournamentStandings(standingsList) {
    if (!Array.isArray(standingsList) || standingsList.length === 0) return false;
    const currentTeams = Object.keys(DEFAULT_TEAMS_ROSTER);
    return currentTeams.every(teamName =>
        standingsList.some(t => t.name && t.name.toLowerCase().trim() === teamName.toLowerCase().trim())
    );
}

/**
 * Puan durumu verilerini getir (LocalStorage veya varsayılan)
 */
function getStandingsData() {
    try {
        const stored = localStorage.getItem(STANDINGS_STORAGE_KEY);
        if (stored !== null) {
            const parsed = JSON.parse(stored);
            if (isValidTournamentStandings(parsed)) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('Puan durumu okunamadı:', e);
    }

    const defaultData = cloneObject(DEFAULT_STANDINGS);
    saveStandingsData(defaultData, false);
    return defaultData;
}

/**
 * Puan durumu verilerini kaydet (LocalStorage + Supabase)
 */
async function saveStandingsData(standingsList, syncToCloud = true) {
    try {
        localStorage.setItem(STANDINGS_STORAGE_KEY, JSON.stringify(standingsList));
        window.dispatchEvent(new CustomEvent('turnuva_standings_updated', { detail: { standings: standingsList } }));
    } catch (e) {
        console.error('Puan durumu yerel kaydedilemedi:', e);
    }

    if (!syncToCloud) {
        return { success: true, cloudSynced: false };
    }

    if (typeof getSupabaseClient !== 'function') return { success: true, cloudSynced: false };
    const client = getSupabaseClient();
    if (!client) return { success: true, cloudSynced: false };

    let cloudSynced = false;
    try {
        const systemPayload = {
            id: 'system-turnuva-standings',
            title: 'SYSTEM_TOURNAMENT_STANDINGS_v3',
            category: 'system',
            category_label: 'Sistem Puan Durumu',
            date: new Date().toISOString(),
            author: 'System',
            pinned: false,
            summary: 'Tek Tablolu Puan Durumu Veritabanı Kaydı v3',
            content: JSON.stringify(standingsList)
        };

        const { error } = await client.from('duyurular').upsert(systemPayload);
        if (!error) cloudSynced = true;
    } catch (err) {
        console.warn('Puan durumu bulut kayıt istisnası:', err);
    }

    return { success: true, cloudSynced };
}

/**
 * Puan durumunu varsayılana sıfırla
 */
async function resetStandingsData() {
    const defaultData = cloneObject(DEFAULT_STANDINGS);
    await saveStandingsData(defaultData, true);
    return defaultData;
}

/**
 * Buluttan puan durumunu çek
 */
async function fetchStandingsCloudData() {
    if (typeof getSupabaseClient !== 'function') return null;
    const client = getSupabaseClient();
    if (!client) return null;

    try {
        const { data, error } = await client
            .from('duyurular')
            .select('content')
            .eq('id', 'system-turnuva-standings')
            .maybeSingle();

        if (!error && data && data.content) {
            const parsed = JSON.parse(data.content);
            if (isValidTournamentStandings(parsed)) return parsed;
        }
    } catch (e) {
        console.warn('Puan durumu buluttan alınamadı:', e);
    }
    return null;
}

/**
 * Puan Durumu Realtime Dinleme
 */
async function initStandingsDataSync(onDataLoadedCallback) {
    if (typeof getSupabaseClient !== 'function') return;
    const client = getSupabaseClient();
    if (!client) return;

    try {
        const cloudData = await fetchStandingsCloudData();
        if (cloudData && isValidTournamentStandings(cloudData)) {
            localStorage.setItem(STANDINGS_STORAGE_KEY, JSON.stringify(cloudData));
            window.dispatchEvent(new CustomEvent('turnuva_standings_updated', { detail: { standings: cloudData } }));
            if (typeof onDataLoadedCallback === 'function') {
                onDataLoadedCallback(cloudData);
            }
        } else {
            saveStandingsData(getStandingsData(), true);
        }
    } catch (err) {
        console.warn('Puan durumu ilk yükleme hatası:', err);
    }

    if (!_standingsRealtimeSubscribed) {
        try {
            client
                .channel('realtime_duyurular_standings')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'duyurular', filter: 'id=eq.system-turnuva-standings' },
                    payload => {
                        if (payload.new && payload.new.content) {
                            try {
                                const parsed = JSON.parse(payload.new.content);
                                if (Array.isArray(parsed)) {
                                    localStorage.setItem(STANDINGS_STORAGE_KEY, JSON.stringify(parsed));
                                    window.dispatchEvent(new CustomEvent('turnuva_standings_updated', { detail: { standings: parsed } }));
                                    if (typeof onDataLoadedCallback === 'function') {
                                        onDataLoadedCallback(parsed);
                                    }
                                }
                            } catch (e) {
                                console.warn('Realtime standings parse hatası:', e);
                            }
                        }
                    }
                )
                .subscribe(status => {
                    if (status === 'SUBSCRIBED') {
                        _standingsRealtimeSubscribed = true;
                    }
                });
        } catch (rtErr) {
            console.warn('Realtime standings başlatılamadı:', rtErr);
        }
    }
}

/**
 * Puan Durumunu Sırala:
 * 1. Puan (p) - Azalan
 * 2. Averaj (av) - Azalan
 * 3. Galibiyet (g) - Azalan
 * 4. Takım Adı - Alfabetik
 */
function getSortedStandings(standingsList) {
    const list = standingsList || getStandingsData();
    const sorted = [...list].sort((a, b) => {
        const pa = parseInt(a.p, 10) || 0;
        const pb = parseInt(b.p, 10) || 0;
        if (pb !== pa) return pb - pa;

        const ava = parseInt(a.av, 10) || 0;
        const avb = parseInt(b.av, 10) || 0;
        if (avb !== ava) return avb - ava;

        const ga = parseInt(a.g, 10) || 0;
        const gb = parseInt(b.g, 10) || 0;
        if (gb !== ga) return gb - ga;

        return a.name.localeCompare(b.name, 'tr');
    });
    return sorted;
}

// ============================================================
// 3. GOL KRALLIĞI VE TAKIM KADROLARI YARDIMCILARI
// ============================================================

/**
 * Gol Krallığı Sıralaması
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
 * Takım isimlerini dizi olarak getir
 */
function getTournamentTeams() {
    return Object.keys(DEFAULT_TEAMS_ROSTER);
}

/**
 * Belirli bir takımın oyuncularını güncel gol sayılarıyla getir
 */
function getTeamSquad(teamName, playersList) {
    const list = playersList || getPlayersData();
    const roster = list.filter(p => p.team && p.team.toLowerCase().trim() === teamName.toLowerCase().trim());
    return roster;
}

/**
 * Geriye dönük uyumluluk için (kart kaldırıldığı için boş dizi döner)
 */
function getCardReports() {
    return [];
}

// ============================================================
// 4. YÖNETİCİ PIN DOĞRULAMA YARDIMCILARI
// ============================================================

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

// ============================================================
// 5. SAYFA BAŞLATICISI
// ============================================================
if (typeof window !== 'undefined') {
    const autoInitAll = (retries = 15) => {
        if (typeof isSupabaseConfigured === 'function' && isSupabaseConfigured()) {
            const client = (typeof getSupabaseClient === 'function') ? getSupabaseClient() : null;
            if (client) {
                initPlayersDataSync((cloudData) => {
                    if (typeof renderAllStatsViews === 'function') {
                        renderAllStatsViews(cloudData);
                    }
                });
                initStandingsDataSync((cloudStandings) => {
                    if (typeof renderStandingsTable === 'function') {
                        renderStandingsTable(cloudStandings);
                    }
                });
            } else if (retries > 0) {
                setTimeout(() => autoInitAll(retries - 1), 150);
            }
        }
    };

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => autoInitAll());
        } else {
            autoInitAll();
        }
    }
}
