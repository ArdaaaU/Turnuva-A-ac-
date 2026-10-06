// ============================================================
// TURNUVA FİKSTÜR VE EŞLEŞME AĞACI MODÜLÜ (STATİK / YEREL DEPOLAMA)
// ============================================================

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
            score1: 7,
            team2: "ic mekan tasarim-2",
            score2: 9,
            winner: "team2"
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
    }
};

const BRACKET_STORAGE_KEY = 'turnuva_bracket_v10';

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
    try {
        let stored = localStorage.getItem(BRACKET_STORAGE_KEY);
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

async function saveTournamentData(data, syncToCloud = false) {
    try {
        localStorage.setItem(BRACKET_STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent('turnuva_bracket_updated', { detail: { data } }));
    } catch (e) {
        console.error('Turnuva verisi yerel önbelleğe kaydedilemedi:', e);
    }

    return {
        success: true,
        cloudSynced: false,
        cloudTarget: null,
        error: null
    };
}

async function resetTournamentData() {
    const defaultData = cloneObject(DEFAULT_TOURNAMENT_DATA);
    await saveTournamentData(defaultData, false);
    return defaultData;
}

async function fetchTournamentCloudData() {
    return null;
}

async function initTournamentDataSync(onDataLoadedCallback) {
    const localData = getTournamentData();
    if (typeof onDataLoadedCallback === 'function') {
        onDataLoadedCallback(localData);
    }
}
