const DEFAULT_TOURNAMENT_DATA = {
    matches: [
        {
            id: "mac-1",
            date: "28 Eylül 2026",
            day: "Pazartesi",
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
            day: "Pazartesi",
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
            day: "Çarşamba",
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
            day: "Çarşamba",
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
            day: "Perşembe",
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
            day: "Perşembe",
            time: "19:00",
            status: "bitti",
            team1: "wtk-2",
            score1: 8,
            team2: "ic mekan tasarim-2",
            score2: 9,
            winner: "team2"
        },
        {
            id: "mac-7",
            date: "6 Ekim 2026",
            day: "Salı",
            time: "18:00",
            status: "bitti",
            team1: "hit-2",
            score1: 8,
            team2: "wtk-2",
            score2: 3,
            winner: "team1"
        },
        {
            id: "mac-7b",
            date: "6 Ekim 2026",
            day: "Salı",
            time: "19:00",
            status: "bitti",
            team1: "ic mekan tasarim-2",
            score1: "penaltılar",
            team2: "maliye isletme -2",
            score2: "ile bitti",
            winner: "team2",
            note: "Penaltılar ile bitti"
        },
        {
            id: "mac-8",
            date: "7 Ekim 2026",
            day: "Çarşamba",
            time: "18:00",
            status: "bitti",
            team1: "maliye isletme -2",
            score1: "penaltılar",
            team2: "hit-1",
            score2: "ile bitti",
            winner: "team2",
            note: "Penaltılarla"
        },
        {
            id: "mac-10",
            date: "8 Ekim 2026",
            day: "Perşembe",
            time: "18:00",
            status: "bitti",
            team1: "ic mekan tasarim-2",
            score1: 7,
            team2: "hit-1",
            score2: 3,
            winner: "team1"
        },
        {
            id: "mac-11",
            date: "13 Ekim Salı",
            day: "Salı",
            time: "18:00",
            status: "bitti",
            team1: "wtk-2",
            score1: 11,
            team2: "maliye isletme -2",
            score2: 5,
            winner: "team1"
        },
        {
            id: "mac-12",
            date: "13 Ekim 2026",
            day: "Salı",
            time: "19:00",
            status: "bitti",
            team1: "hit-1",
            score1: 4,
            team2: "hit-2",
            score2: 20,
            winner: "team2"
        },
        {
            id: "final-match",
            date: "15 Ekim 2026",
            day: "Perşembe",
            time: "12:30",
            status: "bitti",
            team1: "wtk-2",
            score1: 3,
            team2: "hit-2",
            score2: 6,
            winner: "team2",
            champion: "hit-2"
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
            date: "13 Ekim Salı",
            time: "18:00",
            status: "bitti",
            team1: "wtk-2",
            score1: 11,
            team2: "maliye isletme -2",
            score2: 5,
            winner: "team1"
        },
        {
            id: "semi-2",
            title: "2. Yarı Final Maçı",
            date: "13 Ekim Salı",
            time: "19:00",
            status: "bitti",
            team1: "hit-1",
            score1: 4,
            team2: "hit-2",
            score2: 20,
            winner: "team2"
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
        title: "Şampiyonluk Maçı",
        date: "15 Ekim Perşembe",
        day: "Perşembe",
        time: "12:30",
        status: "bitti",
        team1: "wtk-2",
        score1: 3,
        team2: "hit-2",
        score2: 6,
        winner: "team2",
        champion: "hit-2"
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
        score1: 8,
        team2: "ic mekan tasarim-2",
        score2: 9,
        winner: "team2"
    },
    mac7: {
        id: "mac-7",
        date: "6 Ekim 2026",
        day: "Salı",
        time: "18:00",
        status: "bitti",
        team1: "hit-2",
        score1: 8,
        team2: "wtk-2",
        score2: 3,
        winner: "team1"
    },
    mac7b: {
        id: "mac-7b",
        date: "6 Ekim 2026",
        day: "Salı",
        time: "19:00",
        status: "bitti",
        team1: "ic mekan tasarim-2",
        score1: "penaltılar",
        team2: "maliye isletme -2",
        score2: "ile bitti",
        winner: "team2",
        note: "Penaltılar ile bitti"
    },
    mac8: {
        id: "mac-8",
        date: "7 Ekim 2026",
        day: "Çarşamba",
        time: "18:00",
        status: "bitti",
        team1: "maliye isletme -2",
        score1: "penaltılar",
        team2: "hit-1",
        score2: "ile bitti",
        winner: "team2",
        note: "Penaltılarla"
    },
    mac10: {
        id: "mac-10",
        date: "8 Ekim 2026",
        day: "Perşembe",
        time: "18:00",
        status: "bitti",
        team1: "ic mekan tasarim-2",
        score1: 7,
        team2: "hit-1",
        score2: 3,
        winner: "team1"
    },
    mac11: {
        id: "mac-11",
        date: "13 Ekim Salı",
        day: "Salı",
        time: "18:00",
        status: "bitti",
        team1: "wtk-2",
        score1: 11,
        team2: "maliye isletme -2",
        score2: 5,
        winner: "team1"
    },
    mac12: {
        id: "mac-12",
        date: "13 Ekim Salı",
        day: "Salı",
        time: "19:00",
        status: "bitti",
        team1: "hit-1",
        score1: 4,
        team2: "hit-2",
        score2: 20,
        winner: "team2"
    }
};

let inMemoryTournamentData = cloneObject(DEFAULT_TOURNAMENT_DATA);

function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function isValidTournamentTree(data) {
    if (!data) return false;
    if (Array.isArray(data.matches) && data.matches.length >= 1) return true;
    if (data.final && data.semis && Array.isArray(data.quarters) && data.quarters.length >= 2) return true;
    return false;
}

function getTournamentData() {
    if (!inMemoryTournamentData || !isValidTournamentTree(inMemoryTournamentData)) {
        inMemoryTournamentData = cloneObject(DEFAULT_TOURNAMENT_DATA);
    }
    return cloneObject(inMemoryTournamentData);
}

async function saveTournamentData(data, syncToCloud = false) {
    if (syncToCloud) {
        const isAuth = typeof window.TurnuvaAuth !== 'undefined' && typeof window.TurnuvaAuth.isAuthenticated === 'function' && window.TurnuvaAuth.isAuthenticated();
        if (!isAuth) {
            console.error('Yetkisiz işlem: Fikstür verisi kaydetmek için yönetici girişi gereklidir.');
            return { success: false, cloudSynced: false, error: 'Yetkisiz erişim: Yönetici oturumu bulunamadı.' };
        }
    }
    inMemoryTournamentData = cloneObject(data);
    window.dispatchEvent(new CustomEvent('turnuva_bracket_updated', { detail: { data: inMemoryTournamentData } }));

    let cloudSynced = false;
    let cloudError = null;

    if (syncToCloud && typeof getSupabaseClient === 'function') {
        const client = getSupabaseClient();
        if (client) {
            try {
                const { error } = await client
                    .from('turnuva_fikstur')
                    .upsert({
                        id: 'main',
                        data: inMemoryTournamentData,
                        updated_at: new Date().toISOString()
                    });
                if (error) {
                    cloudError = error.message;
                    console.warn('Supabase fikstur kaydetme hatası:', error);
                } else {
                    cloudSynced = true;
                }
            } catch (err) {
                cloudError = err.message;
                console.warn('Supabase fikstur istisnası:', err);
            }
        }
    }

    return {
        success: true,
        cloudSynced: cloudSynced,
        cloudTarget: 'turnuva_fikstur',
        error: cloudError
    };
}

async function resetTournamentData() {
    const isAuth = typeof window.TurnuvaAuth !== 'undefined' && typeof window.TurnuvaAuth.isAuthenticated === 'function' && window.TurnuvaAuth.isAuthenticated();
    if (!isAuth) {
        console.error('Yetkisiz işlem: Fikstürü sıfırlamak için yönetici girişi gereklidir.');
        return null;
    }
    inMemoryTournamentData = cloneObject(DEFAULT_TOURNAMENT_DATA);
    await saveTournamentData(inMemoryTournamentData, true);
    return cloneObject(inMemoryTournamentData);
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

        if (error) {
            console.warn('Supabase fikstur okuma hatası:', error);
            return null;
        }

        if (data && data.data && isValidTournamentTree(data.data)) {
            return data.data;
        }
    } catch (err) {
        console.warn('Supabase fikstur çekme hatası:', err);
    }

    return null;
}

let _fiksturRealtimeChannel = null;
function initFiksturRealtime() {
    if (_fiksturRealtimeChannel) return;
    if (typeof getSupabaseClient !== 'function') return;
    const client = getSupabaseClient();
    if (!client) return;

    try {
        _fiksturRealtimeChannel = client.channel('public:turnuva_fikstur_ch');
        _fiksturRealtimeChannel
            .on('postgres_changes', { event: '*', schema: 'public', table: 'turnuva_fikstur', filter: 'id=eq.main' }, function (payload) {
                if (payload && payload.new && payload.new.data && isValidTournamentTree(payload.new.data)) {
                    inMemoryTournamentData = cloneObject(payload.new.data);
                    window.dispatchEvent(new CustomEvent('turnuva_bracket_updated', { detail: { data: inMemoryTournamentData } }));
                }
            })
            .subscribe(function (status) {
                if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    _fiksturRealtimeChannel = null;
                }
            });
    } catch (e) {
        _fiksturRealtimeChannel = null;
    }
}

async function initTournamentDataSync(onDataLoadedCallback) {
    const localData = getTournamentData();
    if (typeof onDataLoadedCallback === 'function') {
        onDataLoadedCallback(localData);
    }

    initFiksturRealtime();

    const cloudData = await fetchTournamentCloudData();
    if (cloudData) {
        inMemoryTournamentData = cloneObject(cloudData);
        window.dispatchEvent(new CustomEvent('turnuva_bracket_updated', { detail: { data: inMemoryTournamentData } }));
        if (typeof onDataLoadedCallback === 'function') {
            onDataLoadedCallback(inMemoryTournamentData);
        }
    }
}

