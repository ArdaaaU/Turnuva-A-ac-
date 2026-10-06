

const DEFAULT_TOURNAMENT_DATA = {
    matches: [
        
        {
            id: "mac-1",
            date: "28 Eylül 2026",
            time: "18:00",
            status: "bitti", 
            team1: "maliye isletme -2",
            score1: 6,
            team2: "wtk-2",
            score2: 12,
            winner: "team2" 
        },
        {
            id: "mac-2",
            date: "28 Eylül 2026",
            time: "19:00",
            status: "bitti",
            team1: "hit-1",
            score1: 0,
            team2: "hit-2",
            score2: 16,
            winner: "team2"
        },

        
        {
            id: "mac-3",
            date: "30 Eylül 2026",
            time: "18:00",
            status: "bitti",
            team1: "ic mekan tasarim-2",
            score1: 8,
            team2: "hit-2",
            score2: 7,
            winner: "team1"
        },
        {
            id: "mac-4",
            date: "30 Eylül 2026",
            time: "19:00",
            status: "bitti",
            team1: "wtk-2",
            score1: 12,
            team2: "hit-1",
            score2: 1,
            winner: "team1"
        },
        
        {
            id: "mac-5",
            date: "1 Ekim 2026",
            time: "18:00",
            status: "bitti",
            team1: "maliye isletme -2",
            score1: 2,
            team2: "hit-2",
            score2: 5,
            winner: "team2"
        },
        {
            id: "mac-6",
            date: "1 Ekim 2026",
            time: "19:00",
            status: "bitti",
            team1: "wtk-2",
            score1: 7,
            team2: "ic mekan tasarim-2",
            score2: 9,
            winner: "team2"
        },

        {
            id: "mac-7",
            date: "6 Ekim 2026",
            day: "Salı",
            time: "18:00",
            status: "bekleniyor",
            team1: "hit-2",
            score1: null,
            team2: "wtk-2",
            score2: null,
            winner: null
        },
        
        {
            id: "mac-7b",
            date: "6 Ekim 2026",
            day: "Salı",
            time: "19:00",
            status: "bekleniyor",
            team1: "ic mekan tasarim-2",
            score1: null,
            team2: "maliye isletme -2",
            score2: null,
            winner: null
        },
        
        {
            id: "mac-8",
            date: "7 Ekim 2026",
            day: "Çarşamba",
            time: "18:00",
            status: "bekleniyor",
            team1: "maliye isletme -2",
            score1: null,
            team2: "hit-1",
            score2: null,
            winner: null
        },
        
        {
            id: "mac-9",
            date: "7 Ekim 2026",
            day: "Çarşamba",
            time: "19:00",
            status: "bekleniyor",
            team1: "wtk-2",
            score1: null,
            team2: "hit-2",
            score2: null,
            winner: null
        },
        
        {
            id: "mac-10",
            date: "8 Ekim 2026",
            day: "Perşembe",
            time: "18:00",
            status: "bekleniyor",
            team1: "ic mekan tasarim-2",
            score1: null,
            team2: "hit-1",
            score2: null,
            winner: null
        }
    ],
    
    quarters: [
        {
            id: "qf-1",
            date: "28 Eylül 2026",
            time: "18:00",
            status: "bitti",
            team1: "maliye isletme -2",
            score1: 6,
            team2: "wtk-2",
            score2: 12,
            winner: "team2"
        },
        {
            id: "qf-2",
            date: "28 Eylül 2026",
            time: "19:00",
            status: "bitti",
            team1: "hit-1",
            score1: 0,
            team2: "hit-2",
            score2: 16,
            winner: "team2"
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
            status: "bitti",
            team1: "ic mekan tasarim-2",
            score1: 8,
            team2: "hit-2",
            score2: 7,
            winner: "team1"
        },
        {
            id: "semi-2",
            title: "2. Yarı Final Maçı",
            date: "30 Eylül 2026",
            time: "19:00",
            status: "bitti",
            team1: "wtk-2",
            score1: 12,
            team2: "hit-1",
            score2: 1,
            winner: "team1"
        }
    ],
    byeTeam: "ic mekan tasarim-2",
    thirdPlace: {
        id: "third-place-match",
        date: "1 Ekim 2026",
        time: "18:00",
        status: "bitti",
        team1: "maliye isletme -2",
        score1: 2,
        team2: "hit-2",
        score2: 5,
        winner: "team2"
    },
    final: {
        id: "final-match",
        title: "Büyük Final",
        date: "1 Ekim 2026",
        time: "19:00",
        status: "bitti",
        team1: "wtk-2",
        score1: 7,
        team2: "ic mekan tasarim-2",
        score2: 9,
        winner: "team2",
        champion: "ic mekan tasarim-2"
    },
    
    mac3: {
        id: "mac-3",
        date: "30 Eylül 2026",
        time: "18:00",
        status: "bitti",
        team1: "ic mekan tasarim-2",
        score1: 8,
        team2: "hit-2",
        score2: 7,
        winner: "team1"
    },
    mac4: {
        id: "mac-4",
        date: "30 Eylül 2026",
        time: "19:00",
        status: "bitti",
        team1: "wtk-2",
        score1: 12,
        team2: "hit-1",
        score2: 1,
        winner: "team1"
    },
    mac5: {
        id: "mac-5",
        date: "1 Ekim 2026",
        time: "18:00",
        status: "bitti",
        team1: "maliye isletme -2",
        score1: 2,
        team2: "hit-2",
        score2: 5,
        winner: "team2"
    },
    mac6: {
        id: "mac-6",
        date: "1 Ekim 2026",
        time: "19:00",
        status: "bitti",
        team1: "wtk-2",
        score1: 7,
        team2: "ic mekan tasarim-2",
        score2: 9,
        winner: "team2"
    },
    
    mac7: {
        id: "mac-7",
        date: "6 Ekim 2026",
        day: "Salı",
        time: "18:00",
        status: "bekleniyor",
        team1: "hit-2",
        score1: null,
        team2: "wtk-2",
        score2: null,
        winner: null
    },
    mac7b: {
        id: "mac-7b",
        date: "6 Ekim 2026",
        day: "Salı",
        time: "19:00",
        status: "bekleniyor",
        team1: "ic mekan tasarim-2",
        score1: null,
        team2: "maliye isletme -2",
        score2: null,
        winner: null
    },
    mac8: {
        id: "mac-8",
        date: "7 Ekim 2026",
        day: "Çarşamba",
        time: "18:00",
        status: "bekleniyor",
        team1: "maliye isletme -2",
        score1: null,
        team2: "hit-1",
        score2: null,
        winner: null
    },
    mac9: {
        id: "mac-9",
        date: "7 Ekim 2026",
        day: "Çarşamba",
        time: "19:00",
        status: "bekleniyor",
        team1: "wtk-2",
        score1: null,
        team2: "hit-2",
        score2: null,
        winner: null
    },
    mac10: {
        id: "mac-10",
        date: "8 Ekim 2026",
        day: "Perşembe",
        time: "18:00",
        status: "bekleniyor",
        team1: "ic mekan tasarim-2",
        score1: null,
        team2: "hit-1",
        score2: null,
        winner: null
    }
};

const BRACKET_STORAGE_KEY = 'turnuva_bracket_v8';
let _bracketRealtimeSubscribed = false;

function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function isValidTournamentTree(data) {
    if (!data) return false;
    
    if (Array.isArray(data.matches) && data.matches.length >= 1) return true;
    
    if (data.final && data.semis && Array.isArray(data.quarters) && data.quarters.length >= 2) return true;
    return false;
}

function ensureMatchesIncludeNewFixture(data) {
    if (!data) return data;
    if (!Array.isArray(data.matches)) {
        data.matches = [];
    }

    const existingMap = new Map();
    data.matches.forEach(m => {
        if (m && m.id) existingMap.set(m.id, m);
    });

    DEFAULT_TOURNAMENT_DATA.matches.forEach(defMatch => {
        if (!existingMap.has(defMatch.id)) {
            const newMatchObj = cloneObject(defMatch);
            data.matches.push(newMatchObj);
            existingMap.set(defMatch.id, newMatchObj);
        } else {
            const existing = existingMap.get(defMatch.id);
            if (!existing.day && defMatch.day) existing.day = defMatch.day;
            if (!existing.note && defMatch.note) existing.note = defMatch.note;
            
            // Eski maçlar (1-6): Eğer skor boşsa varsayılan oynanmış skoru geri getir
            if ((defMatch.id === 'mac-1' || defMatch.id === 'mac-2' || defMatch.id === 'mac-3' || defMatch.id === 'mac-4' || defMatch.id === 'mac-5' || defMatch.id === 'mac-6')) {
                if (existing.score1 === null || existing.score1 === undefined || existing.score1 === '') {
                    existing.score1 = defMatch.score1;
                    existing.score2 = defMatch.score2;
                    existing.winner = defMatch.winner;
                    existing.status = defMatch.status || 'bitti';
                    existing.team1 = defMatch.team1;
                    existing.team2 = defMatch.team2;
                    existing.time = defMatch.time;
                }
            }

            // Fikstür güncellemesi: Maç henüz bitmediyse takımları, tarihi ve saati doğrula
            if ((defMatch.id === 'mac-7' || defMatch.id === 'mac-7b' || defMatch.id === 'mac-8' || defMatch.id === 'mac-9' || defMatch.id === 'mac-10') && existing.status !== 'bitti') {
                existing.date = defMatch.date;
                existing.day = defMatch.day;
                existing.time = defMatch.time;
                existing.team1 = defMatch.team1;
                existing.team2 = defMatch.team2;
            }
        }
    });

    existingMap.forEach((m, id) => {
        if (id === 'mac-3' && (!data.mac3 || data.mac3.score1 === null)) data.mac3 = m;
        if (id === 'mac-4' && (!data.mac4 || data.mac4.score1 === null)) data.mac4 = m;
        if (id === 'mac-5' && (!data.mac5 || data.mac5.score1 === null)) data.mac5 = m;
        if (id === 'mac-6' && (!data.mac6 || data.mac6.score1 === null)) data.mac6 = m;
        if (id === 'mac-7') data.mac7 = m;
        if (id === 'mac-7b') data.mac7b = m;
        if (id === 'mac-8') data.mac8 = m;
        if (id === 'mac-9') data.mac9 = m;
        if (id === 'mac-10') data.mac10 = m;
    });

    // Eski ağaç verilerini (quarters, semis, thirdPlace, final) de skorları boşsa varsayılanla onar
    if (Array.isArray(data.quarters)) {
        if (data.quarters[0] && (data.quarters[0].score1 === null || data.quarters[0].score1 === undefined)) {
            data.quarters[0].score1 = 6; data.quarters[0].score2 = 12; data.quarters[0].winner = 'team2'; data.quarters[0].status = 'bitti';
            data.quarters[0].team1 = 'maliye isletme -2'; data.quarters[0].team2 = 'wtk-2';
        }
        if (data.quarters[1] && (data.quarters[1].score1 === null || data.quarters[1].score1 === undefined)) {
            data.quarters[1].score1 = 0; data.quarters[1].score2 = 16; data.quarters[1].winner = 'team2'; data.quarters[1].status = 'bitti';
            data.quarters[1].team1 = 'hit-1'; data.quarters[1].team2 = 'hit-2';
        }
    }
    if (Array.isArray(data.semis)) {
        if (data.semis[0] && (data.semis[0].score1 === null || data.semis[0].score1 === undefined)) {
            data.semis[0].score1 = 8; data.semis[0].score2 = 7; data.semis[0].winner = 'team1'; data.semis[0].status = 'bitti';
            data.semis[0].team1 = 'ic mekan tasarim-2'; data.semis[0].team2 = 'hit-2';
        }
        if (data.semis[1] && (data.semis[1].score1 === null || data.semis[1].score1 === undefined)) {
            data.semis[1].score1 = 12; data.semis[1].score2 = 1; data.semis[1].winner = 'team1'; data.semis[1].status = 'bitti';
            data.semis[1].team1 = 'wtk-2'; data.semis[1].team2 = 'hit-1';
        }
    }
    if (data.thirdPlace && (data.thirdPlace.score1 === null || data.thirdPlace.score1 === undefined)) {
        data.thirdPlace.score1 = 2; data.thirdPlace.score2 = 5; data.thirdPlace.winner = 'team2'; data.thirdPlace.status = 'bitti';
        data.thirdPlace.team1 = 'maliye isletme -2'; data.thirdPlace.team2 = 'hit-2';
    }
    if (data.final && (data.final.score1 === null || data.final.score1 === undefined)) {
        data.final.score1 = 7; data.final.score2 = 9; data.final.winner = 'team2'; data.final.status = 'bitti';
        data.final.team1 = 'wtk-2'; data.final.team2 = 'ic mekan tasarim-2';
        data.final.champion = 'ic mekan tasarim-2';
    }

    // Doğrudan maç nesnelerini de güncelle
    if (data.mac7 && data.mac7.status !== 'bitti') {
        data.mac7.date = DEFAULT_TOURNAMENT_DATA.mac7.date;
        data.mac7.day = DEFAULT_TOURNAMENT_DATA.mac7.day;
        data.mac7.time = DEFAULT_TOURNAMENT_DATA.mac7.time;
        data.mac7.team1 = DEFAULT_TOURNAMENT_DATA.mac7.team1;
        data.mac7.team2 = DEFAULT_TOURNAMENT_DATA.mac7.team2;
    }
    if (data.mac7b && data.mac7b.status !== 'bitti') {
        data.mac7b.date = DEFAULT_TOURNAMENT_DATA.mac7b.date;
        data.mac7b.day = DEFAULT_TOURNAMENT_DATA.mac7b.day;
        data.mac7b.time = DEFAULT_TOURNAMENT_DATA.mac7b.time;
        data.mac7b.team1 = DEFAULT_TOURNAMENT_DATA.mac7b.team1;
        data.mac7b.team2 = DEFAULT_TOURNAMENT_DATA.mac7b.team2;
    }
    if (data.mac8 && data.mac8.status !== 'bitti') {
        data.mac8.date = DEFAULT_TOURNAMENT_DATA.mac8.date;
        data.mac8.day = DEFAULT_TOURNAMENT_DATA.mac8.day;
        data.mac8.time = DEFAULT_TOURNAMENT_DATA.mac8.time;
        data.mac8.team1 = DEFAULT_TOURNAMENT_DATA.mac8.team1;
        data.mac8.team2 = DEFAULT_TOURNAMENT_DATA.mac8.team2;
    }
    if (data.mac9 && data.mac9.status !== 'bitti') {
        data.mac9.date = DEFAULT_TOURNAMENT_DATA.mac9.date;
        data.mac9.day = DEFAULT_TOURNAMENT_DATA.mac9.day;
        data.mac9.time = DEFAULT_TOURNAMENT_DATA.mac9.time;
        data.mac9.team1 = DEFAULT_TOURNAMENT_DATA.mac9.team1;
        data.mac9.team2 = DEFAULT_TOURNAMENT_DATA.mac9.team2;
    }

    return data;
}

function getTournamentData() {
    try {
        let stored = localStorage.getItem(BRACKET_STORAGE_KEY);
        if (stored === null) {
            const oldStored = localStorage.getItem('turnuva_bracket_v7') || localStorage.getItem('turnuva_bracket_v6') || localStorage.getItem('turnuva_bracket_v5') || localStorage.getItem('turnuva_bracket_v2');
            if (oldStored !== null) {
                stored = oldStored;
            }
        }
        if (stored !== null) {
            const parsed = JSON.parse(stored);
            if (isValidTournamentTree(parsed)) {
                const migrated = ensureMatchesIncludeNewFixture(parsed);
                
                try {
                    localStorage.setItem(BRACKET_STORAGE_KEY, JSON.stringify(migrated));
                } catch (saveErr) { }
                return migrated;
            }
        }
    } catch (e) {
        console.warn('Turnuva verisi okunamadı:', e);
    }

    const defaultData = cloneObject(DEFAULT_TOURNAMENT_DATA);
    saveTournamentData(defaultData, false);
    return defaultData;
}

async function saveTournamentData(data, syncToCloud = true) {
    
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

async function resetTournamentData() {
    const defaultData = cloneObject(DEFAULT_TOURNAMENT_DATA);
    await saveTournamentData(defaultData, true);
    return defaultData;
}

async function fetchTournamentCloudData() {
    if (typeof getSupabaseClient !== 'function') return null;
    const client = getSupabaseClient();
    if (!client) return null;

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
