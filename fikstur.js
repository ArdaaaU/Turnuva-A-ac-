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
            status: "bekliyor",
            team1: "wtk-2",
            score1: null,
            team2: "maliye isletme -2",
            score2: null,
            winner: null
        },
        {
            id: "mac-12",
            date: "13 Ekim 2026",
            day: "Salı",
            time: "19:00",
            status: "bekliyor",
            team1: "ic mekan tasarim-2",
            score1: null,
            team2: "hit-2",
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
            date: "13 Ekim Salı",
            time: "18:00",
            status: "bekliyor",
            team1: "wtk-2",
            score1: null,
            team2: "maliye isletme -2",
            score2: null,
            winner: null
        },
        {
            id: "semi-2",
            title: "2. Yarı Final Maçı",
            date: "13 Ekim Salı",
            time: "19:00",
            status: "bekliyor",
            team1: "ic mekan tasarim-2",
            score1: null,
            team2: "hit-2",
            score2: null,
            winner: null
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
        time: "18:45",
        status: "bekliyor",
        team1: "Yarı Final 1 Galibi",
        score1: null,
        team2: "Yarı Final 2 Galibi",
        score2: null,
        winner: null,
        champion: null
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
        status: "bekliyor",
        team1: "wtk-2",
        score1: null,
        team2: "maliye isletme -2",
        score2: null,
        winner: null
    },
    mac12: {
        id: "mac-12",
        date: "13 Ekim Salı",
        day: "Salı",
        time: "19:00",
        status: "bekliyor",
        team1: "ic mekan tasarim-2",
        score1: null,
        team2: "hit-2",
        score2: null,
        winner: null
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
    inMemoryTournamentData = cloneObject(data);
    window.dispatchEvent(new CustomEvent('turnuva_bracket_updated', { detail: { data: inMemoryTournamentData } }));

    return {
        success: true,
        cloudSynced: false,
        cloudTarget: null,
        error: null
    };
}

async function resetTournamentData() {
    inMemoryTournamentData = cloneObject(DEFAULT_TOURNAMENT_DATA);
    await saveTournamentData(inMemoryTournamentData, false);
    return cloneObject(inMemoryTournamentData);
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

