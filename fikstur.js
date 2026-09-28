/**
 * Turnuva Fikstür Yönetim Modülü (fikstur.js)
 * Turnuva maç programını ve sonuçlarını yönetir.
 * Yerel önbellek (LocalStorage) ve çevrim içi bulut (Supabase) senkronizasyonunu destekler.
 */

// Varsayılan Turnuva Verileri
// Pazartesi: 2 maç, Salı: BAY (maç yok), Çarşamba: 2 çapraz maç, Perşembe: 2 çapraz maç
const DEFAULT_TOURNAMENT_DATA = {
    matches: [
        // --- 28 Eylül 2026 - PAZARTESİ ---
        {
            id: "mac-1",
            date: "28 Eylül 2026",
            time: "18:00",
            status: "bekleniyor", // "bekleniyor" | "canli" | "bitti"
            team1: "maliye isletme -2",
            score1: null,
            team2: "wtk-2",
            score2: null,
            winner: null // "team1" | "team2"
        },
        {
            id: "mac-2",
            date: "28 Eylül 2026",
            time: "19:00",
            status: "bekleniyor",
            team1: "hit-1",
            score1: null,
            team2: "hit-2",
            score2: null,
            winner: null
        },
        // --- 29 Eylül 2026 - SALI (BAY) ---
        // Salı günü maç yoktur.
        // --- 30 Eylül 2026 - ÇARŞAMBA (Çapraz Eşleşme) ---
        {
            id: "mac-3",
            date: "30 Eylül 2026",
            time: "18:00",
            status: "bekleniyor",
            team1: "maliye isletme -2",
            score1: null,
            team2: "hit-1",
            score2: null,
            winner: null
        },
        {
            id: "mac-4",
            date: "30 Eylül 2026",
            time: "19:00",
            status: "bekleniyor",
            team1: "wtk-2",
            score1: null,
            team2: "hit-2",
            score2: null,
            winner: null
        },
        // --- 1 Ekim 2026 - PERŞEMBE (Çapraz Eşleşme) ---
        {
            id: "mac-5",
            date: "1 Ekim 2026",
            time: "18:00",
            status: "bekleniyor",
            team1: "maliye isletme -2",
            score1: null,
            team2: "hit-2",
            score2: null,
            winner: null
        },
        {
            id: "mac-6",
            date: "1 Ekim 2026",
            time: "18:45",
            status: "bekleniyor",
            team1: "wtk-2",
            score1: null,
            team2: "hit-1",
            score2: null,
            winner: null
        }
    ],
    // Geriye dönük uyumluluk için korunan alanlar
    quarters: [
        {
            id: "qf-1",
            date: "28 Eylül 2026",
            time: "18:00",
            status: "bekleniyor",
            team1: "maliye isletme -2",
            score1: null,
            team2: "wtk-2",
            score2: null,
            winner: null
        },
        {
            id: "qf-2",
            date: "28 Eylül 2026",
            time: "19:00",
            status: "bekleniyor",
            team1: "hit-1",
            score1: null,
            team2: "hit-2",
            score2: null,
            winner: null
        }
    ],
    tuesdayBay: {
        date: "29 Eylül 2026",
        title: "BAY Günü",
        status: "Maç Yok"
    },
    semis: [
        {
            id: "semi-1",
            title: "1. Yarı Final Maçı",
            date: "30 Eylül 2026",
            time: "18:00",
            status: "bekleniyor",
            team1: "Ön Eleme 1 Galibi",
            score1: null,
            team2: "ic mekan tasarim-2",
            score2: null,
            winner: null
        },
        {
            id: "semi-2",
            title: "2. Yarı Final Maçı",
            date: "30 Eylül 2026",
            time: "19:00",
            status: "bekleniyor",
            team1: "Ön Eleme 2 Galibi",
            score1: null,
            team2: "Final Yolu",
            score2: null,
            winner: null
        }
    ],
    byeTeam: "ic mekan tasarim-2",
    thirdPlace: {
        id: "third-place-match",
        date: "1 Ekim 2026",
        time: "18:00",
        status: "bekleniyor",
        team1: "maliye isletme -2",
        score1: null,
        team2: "hit-2",
        score2: null,
        winner: null
    },
    final: {
        id: "final-match",
        title: "Büyük Final",
        date: "1 Ekim 2026",
        time: "18:45",
        status: "bekleniyor",
        team1: "Yarı Final 1 Galibi",
        score1: null,
        team2: "Yarı Final 2 Galibi",
        score2: null,
        winner: null,
        champion: ""
    },
    // Haftalık fikstür maçları (eleme ağacından bağımsız program)
    mac3: {
        id: "mac-3",
        date: "30 Eylül 2026",
        time: "18:00",
        status: "bekleniyor",
        team1: "maliye isletme -2",
        score1: null,
        team2: "hit-1",
        score2: null,
        winner: null
    },
    mac4: {
        id: "mac-4",
        date: "30 Eylül 2026",
        time: "19:00",
        status: "bekleniyor",
        team1: "wtk-2",
        score1: null,
        team2: "hit-2",
        score2: null,
        winner: null
    },
    mac5: {
        id: "mac-5",
        date: "1 Ekim 2026",
        time: "18:00",
        status: "bekleniyor",
        team1: "maliye isletme -2",
        score1: null,
        team2: "hit-2",
        score2: null,
        winner: null
    },
    mac6: {
        id: "mac-6",
        date: "1 Ekim 2026",
        time: "18:45",
        status: "bekleniyor",
        team1: "wtk-2",
        score1: null,
        team2: "hit-1",
        score2: null,
        winner: null
    }
};


const BRACKET_STORAGE_KEY = 'turnuva_bracket_v5';
let _bracketRealtimeSubscribed = false;

/**
 * Derin kopya alma fonksiyonu
 */
function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Turnuva verisinin geçerli formatta olduğunu denetler
 * Yeni format (matches dizisi) ve eski format (quarters/semis/final) desteklenir.
 */
function isValidTournamentTree(data) {
    if (!data) return false;
    // Yeni format: matches dizisi
    if (Array.isArray(data.matches) && data.matches.length >= 1) return true;
    // Eski format: quarters + semis + final
    if (data.final && data.semis && Array.isArray(data.quarters) && data.quarters.length >= 2) return true;
    return false;
}

/**
 * Turnuva verisini getir (Önbellekten veya varsayılandan)
 */
function getTournamentData() {
    try {
        const stored = localStorage.getItem(BRACKET_STORAGE_KEY);
        if (stored !== null) {
            const parsed = JSON.parse(stored);
            if (isValidTournamentTree(parsed)) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('Turnuva verisi okunamadı:', e);
    }

    const defaultData = cloneObject(DEFAULT_TOURNAMENT_DATA);
    saveTournamentData(defaultData, false);
    return defaultData;
}

/**
 * Turnuva verisini kaydet (LocalStorage + Supabase Çift Yönlü Yedekleme)
 */
async function saveTournamentData(data, syncToCloud = true) {
    // 1. Yerel önbelleğe her zaman kaydet
    try {
        localStorage.setItem(BRACKET_STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent('turnuva_bracket_updated', { detail: { data } }));
    } catch (e) {
        console.error('Turnuva verisi yerel önbelleğe kaydedilemedi:', e);
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

    // 1. Önce özel turnuva_fikstur tablosuna yazmayı dene
    try {
        const { error: tError } = await client
            .from('turnuva_fikstur')
            .upsert({
                id: 'main',
                data: data,
                updated_at: new Date().toISOString()
            });

        if (!tError) {
            cloudSynced = true;
            cloudTarget = 'turnuva_fikstur';
        } else {
            lastError = tError;
        }
    } catch (e) {
        lastError = e;
    }

    // 2. Tablo yoksa, duyurular tablosuna 'system-turnuva-tree' özel sistem kaydı olarak yedekle
    if (!cloudSynced) {
        try {
            const systemPayload = {
                id: 'system-turnuva-tree',
                title: 'SYSTEM_TOURNAMENT_TREE_v2',
                category: 'system',
                category_label: 'Sistem Verisi',
                date: new Date().toISOString(),
                author: 'System',
                pinned: false,
                summary: 'Otomatik 5 Takımlı Turnuva Ağacı Veritabanı Kaydı',
                content: JSON.stringify(data)
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

    return {
        success: true,
        cloudSynced: cloudSynced,
        cloudTarget: cloudTarget,
        error: lastError
    };
}

/**
 * Turnuva verilerini varsayılana sıfırla
 */
async function resetTournamentData() {
    const defaultData = cloneObject(DEFAULT_TOURNAMENT_DATA);
    await saveTournamentData(defaultData, true);
    return defaultData;
}

/**
 * Buluttan turnuva ağacı verisini çek
 */
async function fetchTournamentCloudData() {
    if (typeof getSupabaseClient !== 'function') return null;
    const client = getSupabaseClient();
    if (!client) return null;

    // 1. Önce turnuva_fikstur tablosunu kontrol et
    try {
        const { data, error } = await client
            .from('turnuva_fikstur')
            .select('data')
            .eq('id', 'main')
            .maybeSingle();

        if (!error && data && data.data) {
            if (isValidTournamentTree(data.data)) {
                return data.data;
            }
        }
    } catch (err) {
        console.warn('turnuva_fikstur tablosu sorgulanamadı:', err);
    }

    // 2. Yoksa duyurular tablosundaki sistem kaydına bak
    try {
        const { data: sData, error: sError } = await client
            .from('duyurular')
            .select('content')
            .eq('id', 'system-turnuva-tree')
            .maybeSingle();

        if (!sError && sData && sData.content) {
            const parsed = JSON.parse(sData.content);
            if (isValidTournamentTree(parsed)) {
                return parsed;
            }
        }
    } catch (dErr) {
        console.warn('Yedek bulut verisi sorgulanamadı:', dErr);
    }

    return null;
}

/**
 * Supabase'den Turnuva Ağacı Verilerini Çek ve Canlı Dinlemeyi Başlat
 */
async function initTournamentDataSync(onDataLoadedCallback) {
    if (typeof getSupabaseClient !== 'function') return;
    const client = getSupabaseClient();
    if (!client) return;

    try {
        const cloudData = await fetchTournamentCloudData();
        if (cloudData && isValidTournamentTree(cloudData)) {
            localStorage.setItem(BRACKET_STORAGE_KEY, JSON.stringify(cloudData));
            window.dispatchEvent(new CustomEvent('turnuva_bracket_updated', { detail: { data: cloudData } }));
            if (typeof onDataLoadedCallback === 'function') {
                onDataLoadedCallback(cloudData);
            }
        } else {
            // Bulutta geçerli 2 maçlı ön eleme verisi yoksa güncel varsayılanı buluta kaydet
            saveTournamentData(getTournamentData(), true);
        }
    } catch (err) {
        console.warn('Supabase fikstür yükleme hatası:', err);
    }

    if (!_bracketRealtimeSubscribed) {
        try {
            client
                .channel('realtime_turnuva_tree')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'turnuva_fikstur', filter: 'id=eq.main' },
                    payload => {
                        if (payload.new && payload.new.data) {
                            localStorage.setItem(BRACKET_STORAGE_KEY, JSON.stringify(payload.new.data));
                            window.dispatchEvent(new CustomEvent('turnuva_bracket_updated', { detail: { data: payload.new.data } }));
                            if (typeof onDataLoadedCallback === 'function') {
                                onDataLoadedCallback(payload.new.data);
                            }
                        }
                    }
                )
                .subscribe();

            client
                .channel('realtime_duyurular_tree')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'duyurular', filter: 'id=eq.system-turnuva-tree' },
                    payload => {
                        if (payload.new && payload.new.content) {
                            try {
                                const parsed = JSON.parse(payload.new.content);
                                if (parsed && (parsed.quarter || parsed.semis) && parsed.final) {
                                    localStorage.setItem(BRACKET_STORAGE_KEY, JSON.stringify(parsed));
                                    window.dispatchEvent(new CustomEvent('turnuva_bracket_updated', { detail: { data: parsed } }));
                                    if (typeof onDataLoadedCallback === 'function') {
                                        onDataLoadedCallback(parsed);
                                    }
                                }
                            } catch (pe) {
                                console.warn('Realtime JSON parse hatası:', pe);
                            }
                        }
                    }
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        _bracketRealtimeSubscribed = true;
                    }
                });
        } catch (rtErr) {
            console.warn('Supabase fikstür realtime başlatılamadı:', rtErr);
        }
    }
}

// Otomatik Başlatma
if (typeof window !== 'undefined') {
    const autoInitSync = (retries = 15) => {
        if (typeof isSupabaseConfigured === 'function' && isSupabaseConfigured()) {
            const client = (typeof getSupabaseClient === 'function') ? getSupabaseClient() : null;
            if (client) {
                initTournamentDataSync((cloudData) => {
                    if (typeof renderAllTournamentViews === 'function') {
                        renderAllTournamentViews(cloudData);
                    }
                });
            } else if (retries > 0) {
                setTimeout(() => autoInitSync(retries - 1), 150);
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => autoInitSync());
    } else {
        autoInitSync();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DEFAULT_TOURNAMENT_DATA,
        cloneObject,
        isValidTournamentTree,
        getTournamentData,
        saveTournamentData,
        resetTournamentData
    };
}
