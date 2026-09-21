/**
 * Turnuva Ağacı & Fikstür Yönetim Modülü (fikstur.js)
 * Turnuva grupları, maç fikstürleri, yarı finaller, final ve şampiyon verilerini yönetir.
 * Yerel önbellek (LocalStorage) ve çevrim içi bulut (Supabase) senkronizasyonunu destekler.
 */

// Varsayılan Turnuva Verileri
const DEFAULT_TOURNAMENT_DATA = {
    groups: {
        A: {
            name: "A Grubu",
            teams: [
                { id: "a1", name: "Halkla İlişkiler 2", o: 0, g: 0, b: 0, m: 0, av: 0, p: 0 },
                { id: "a2", name: "İç Mekan Tas. 1", o: 0, g: 0, b: 0, m: 0, av: 0, p: 0 },
                { id: "a3", name: "Maliye 1", o: 0, g: 0, b: 0, m: 0, av: 0, p: 0 }
            ],
            fixtures: [
                {
                    id: "fa-1",
                    day: "9 Mart 2026 • Pazartesi",
                    time: "16:30",
                    home: "Halkla İlişkiler 2",
                    away: "Maliye 1",
                    scoreHome: null,
                    scoreAway: null,
                    status: "bekleniyor", // "bekleniyor" | "canli" | "bitti"
                    winner: null // null | "home" | "away" | "draw"
                },
                {
                    id: "fa-2",
                    day: "9 Mart 2026 • Pazartesi",
                    time: "BAY",
                    home: "BAY",
                    away: "İç Mekan Tas. 1",
                    isBay: true
                },
                {
                    id: "fa-3",
                    day: "10 Mart 2026 • Salı",
                    time: "BAY",
                    home: "BAY",
                    away: "Maliye 1",
                    isBay: true
                },
                {
                    id: "fa-4",
                    day: "10 Mart 2026 • Salı",
                    time: "16:30",
                    home: "İç Mekan Tas. 1",
                    away: "Halkla İlişkiler 2",
                    scoreHome: null,
                    scoreAway: null,
                    status: "bekleniyor",
                    winner: null
                },
                {
                    id: "fa-5",
                    day: "11 Mart 2026 • Çarşamba",
                    time: "15:00",
                    home: "Maliye 1",
                    away: "İç Mekan Tas. 1",
                    scoreHome: null,
                    scoreAway: null,
                    status: "bekleniyor",
                    winner: null
                },
                {
                    id: "fa-6",
                    day: "11 Mart 2026 • Çarşamba",
                    time: "BAY",
                    home: "BAY",
                    away: "Halkla İlişkiler 2",
                    isBay: true
                }
            ]
        },
        B: {
            name: "B Grubu",
            teams: [
                { id: "b1", name: "Halkla İlişkiler 1", o: 0, g: 0, b: 0, m: 0, av: 0, p: 0 },
                { id: "b2", name: "İşletme 1/2", o: 0, g: 0, b: 0, m: 0, av: 0, p: 0 },
                { id: "b3", name: "Web Tasarım & Kod.", o: 0, g: 0, b: 0, m: 0, av: 0, p: 0 }
            ],
            fixtures: [
                {
                    id: "fb-1",
                    day: "9 Mart 2026 • Pazartesi",
                    time: "14:00",
                    home: "İşletme 1/2",
                    away: "Halkla İlişkiler 1",
                    scoreHome: null,
                    scoreAway: null,
                    status: "bekleniyor",
                    winner: null
                },
                {
                    id: "fb-2",
                    day: "9 Mart 2026 • Pazartesi",
                    time: "BAY",
                    home: "BAY",
                    away: "Web Tasarım & Kod.",
                    isBay: true
                },
                {
                    id: "fb-3",
                    day: "10 Mart 2026 • Salı",
                    time: "17:30",
                    home: "Web Tasarım & Kod.",
                    away: "Halkla İlişkiler 1",
                    scoreHome: null,
                    scoreAway: null,
                    status: "bekleniyor",
                    winner: null
                },
                {
                    id: "fb-4",
                    day: "10 Mart 2026 • Salı",
                    time: "BAY",
                    home: "BAY",
                    away: "İşletme 1/2",
                    isBay: true
                },
                {
                    id: "fb-5",
                    day: "11 Mart 2026 • Çarşamba",
                    time: "17:00",
                    home: "Web Tasarım & Kod.",
                    away: "İşletme 1/2",
                    scoreHome: null,
                    scoreAway: null,
                    status: "bekleniyor",
                    winner: null
                },
                {
                    id: "fb-6",
                    day: "11 Mart 2026 • Çarşamba",
                    time: "BAY",
                    home: "BAY",
                    away: "Halkla İlişkiler 1",
                    isBay: true
                }
            ]
        }
    },
    semis: [
        {
            id: "semi-1",
            title: "1. Yarı Final Maçı",
            date: "12 Mart 2026",
            time: "16:30",
            status: "bekleniyor", // "bekleniyor" | "canli" | "bitti"
            team1: "A Grubu 1.si",
            score1: null,
            team2: "B Grubu 2.si",
            score2: null,
            winner: null // "team1" | "team2"
        },
        {
            id: "semi-2",
            title: "2. Yarı Final Maçı",
            date: "12 Mart 2026",
            time: "17:30",
            status: "bekleniyor",
            team1: "B Grubu 1.si",
            score1: null,
            team2: "A Grubu 2.si",
            score2: null,
            winner: null
        }
    ],
    final: {
        id: "final-match",
        title: "⭐ Şampiyonluk Maçı",
        date: "13 Mart 2026",
        time: "Final",
        status: "bekleniyor",
        team1: "Yarı Final 1 Galibi",
        score1: null,
        team2: "Yarı Final 2 Galibi",
        score2: null,
        winner: null,
        champion: "" // e.g. "Halkla İlişkiler 2"
    }
};

const BRACKET_STORAGE_KEY = 'turnuva_bracket_v1';
let _bracketRealtimeSubscribed = false;

/**
 * Derin kopya alma fonksiyonu
 */
function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Turnuva verisini getir (Önbellekten veya varsayılandan)
 */
function getTournamentData() {
    try {
        const stored = localStorage.getItem(BRACKET_STORAGE_KEY);
        if (stored !== null) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.groups && parsed.semis && parsed.final) {
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
 * 1. Öncelikle özel 'turnuva_fikstur' tablosuna yazmayı dener.
 * 2. Eğer o tablo henüz Supabase'de oluşturulmamışsa, anında 'duyurular' tablosuna
 *    özel sistem kaydı ('system-turnuva-fikstur') olarak kaydeder.
 * Bu sayede kullanıcı Supabase SQL çalıştırmamış olsa dahi tüm cihazlar anında eşitlenir!
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
            console.log('Turnuva verisi turnuva_fikstur tablosuna başarıyla kaydedildi.');
        } else {
            console.warn('turnuva_fikstur tablosuna yazılamadı, yedek bulut tablosuna (duyurular) geçiliyor:', tError.message || tError);
            lastError = tError;
        }
    } catch (e) {
        console.warn('turnuva_fikstur tablosu istisnası:', e);
        lastError = e;
    }

    // 2. Eğer turnuva_fikstur tablosu yoksa (404 / PGRST205 vb.), duyurular tablosuna sistem verisi olarak yedekle
    if (!cloudSynced) {
        try {
            const systemPayload = {
                id: 'system-turnuva-fikstur',
                title: 'SYSTEM_TOURNAMENT_DATA_v1',
                category: 'system',
                category_label: 'Sistem Verisi',
                date: new Date().toISOString(),
                author: 'System',
                pinned: false,
                summary: 'Otomatik Turnuva Ağacı ve Fikstür Veritabanı Kaydı',
                content: JSON.stringify(data)
            };

            const { error: dError } = await client
                .from('duyurular')
                .upsert(systemPayload);

            if (!dError) {
                cloudSynced = true;
                cloudTarget = 'duyurular (yedek sistem depolama)';
                console.log('Turnuva verisi Supabase bulutuna başarıyla aktarıldı (Sistem tablosu üzerinden).');
            } else {
                console.error('Yedek bulut tablosuna da yazılamadı:', dError);
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
 * Turnuva verilerini varsayılana sıfırla
 */
async function resetTournamentData() {
    const defaultData = cloneObject(DEFAULT_TOURNAMENT_DATA);
    await saveTournamentData(defaultData, true);
    return defaultData;
}

/**
 * Fikstür maç sonuçlarına göre grup puan tablosunu otomatik hesapla
 */
function recalculateStandingsFromFixtures(tournamentData) {
    const data = tournamentData || getTournamentData();
    const groups = ['A', 'B'];

    groups.forEach(grpKey => {
        const group = data.groups[grpKey];
        if (!group) return;

        // Her takım için istatistik sayacını sıfırla
        const statsMap = {};
        group.teams.forEach(t => {
            statsMap[t.name.trim()] = {
                id: t.id,
                name: t.name,
                o: 0,
                g: 0,
                b: 0,
                m: 0,
                ag: 0, // atılan gol
                yg: 0, // yenilen gol
                av: 0,
                p: 0
            };
        });

        // Oynanmış maçları tara
        group.fixtures.forEach(match => {
            if (match.isBay) return;
            if (match.scoreHome === null || match.scoreAway === null || match.scoreHome === '' || match.scoreAway === '') {
                return;
            }

            const sh = parseInt(match.scoreHome, 10);
            const sa = parseInt(match.scoreAway, 10);
            if (isNaN(sh) || isNaN(sa)) return;

            const homeTeam = match.home ? match.home.trim() : '';
            const awayTeam = match.away ? match.away.trim() : '';

            if (statsMap[homeTeam] && statsMap[awayTeam]) {
                const ht = statsMap[homeTeam];
                const at = statsMap[awayTeam];

                ht.o += 1;
                at.o += 1;
                ht.ag += sh;
                ht.yg += sa;
                at.ag += sa;
                at.yg += sh;
                ht.av = ht.ag - ht.yg;
                at.av = at.ag - at.yg;

                if (sh > sa) {
                    ht.g += 1;
                    ht.p += 3;
                    at.m += 1;
                } else if (sh < sa) {
                    at.g += 1;
                    at.p += 3;
                    ht.m += 1;
                } else {
                    ht.b += 1;
                    at.b += 1;
                    ht.p += 1;
                    at.p += 1;
                }
            }
        });

        // Takımları puan tablosunda güncelle ve puan > averaj > galibiyet sırasına göre diz
        const updatedTeams = Object.values(statsMap).map(s => ({
            id: s.id,
            name: s.name,
            o: s.o,
            g: s.g,
            b: s.b,
            m: s.m,
            av: s.av,
            p: s.p
        }));

        updatedTeams.sort((a, b) => {
            if (b.p !== a.p) return b.p - a.p;
            if (b.av !== a.av) return b.av - a.av;
            if (b.g !== a.g) return b.g - a.g;
            return a.name.localeCompare(b.name, 'tr');
        });

        group.teams = updatedTeams;
    });

    return data;
}

/**
 * Buluttan turnuva verisini çek (Önce turnuva_fikstur, yoksa duyurular'daki sistem kaydı)
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
            return data.data;
        }
    } catch (err) {
        console.warn('turnuva_fikstur tablosu sorgulanamadı:', err);
    }

    // 2. Eğer turnuva_fikstur tablosunda yoksa, duyurular tablosundaki sistem kaydına bak
    try {
        const { data: sData, error: sError } = await client
            .from('duyurular')
            .select('content')
            .eq('id', 'system-turnuva-fikstur')
            .maybeSingle();

        if (!sError && sData && sData.content) {
            const parsed = JSON.parse(sData.content);
            if (parsed && parsed.groups && parsed.semis && parsed.final) {
                return parsed;
            }
        }
    } catch (dErr) {
        console.warn('Yedek bulut verisi sorgulanamadı:', dErr);
    }

    return null;
}

/**
 * Supabase'den Turnuva Verilerini Çek ve Canlı Dinlemeyi Başlat
 */
async function initTournamentDataSync(onDataLoadedCallback) {
    if (typeof getSupabaseClient !== 'function') return;
    const client = getSupabaseClient();
    if (!client) return;

    try {
        // 1. İlk Çekim
        const cloudData = await fetchTournamentCloudData();
        if (cloudData) {
            localStorage.setItem(BRACKET_STORAGE_KEY, JSON.stringify(cloudData));
            window.dispatchEvent(new CustomEvent('turnuva_bracket_updated', { detail: { data: cloudData } }));
            if (typeof onDataLoadedCallback === 'function') {
                onDataLoadedCallback(cloudData);
            }
        }
    } catch (err) {
        console.warn('Supabase fikstür yükleme hatası:', err);
    }

    // 2. Canlı Realtime Dinleme (Her iki tabloyu da dinler)
    if (!_bracketRealtimeSubscribed) {
        try {
            // turnuva_fikstur tablosunu dinle
            client
                .channel('realtime_turnuva_fikstur')
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

            // duyurular tablosundaki sistem kaydını dinle
            client
                .channel('realtime_duyurular_fikstur')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'duyurular', filter: 'id=eq.system-turnuva-fikstur' },
                    payload => {
                        if (payload.new && payload.new.content) {
                            try {
                                const parsed = JSON.parse(payload.new.content);
                                if (parsed && parsed.groups && parsed.semis && parsed.final) {
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

// Sayfa Açıldığında Fikstür Bulut Senkronizasyonunu Otomatik Başlat (Retry mekanizmasıyla)
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
