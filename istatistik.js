// ============================================================
// TURNUVA İSTATİSTİK VE PUAN DURUMU MODÜLÜ (STATİK / YEREL DEPOLAMA)
// ============================================================

const DEFAULT_TEAMS_ROSTER = {
    "hit-2": [
        "aykut",
        "mahmut",
        "cakir",
        "gazi",
        "ibo",
        "mertcan"
    ],
    "wtk-2": [
        "mehmet",
        "serhat",
        "muhammet",
        "oguzhan",
        "goktug",
        "mehmet acar",
        "alpi",
        "sihir",
        "kurtmehmet",
        "ali"
    ],
    "hit-1": [
        "davut",
        "can",
        "semih",
        "tunc",
        "baris",
        "enes",
        "bilal",
        "arda"
    ],
    "maliye isletme -2": [
        "burak",
        "emirhan",
        "mert",
        "toprak",
        "umut",
        "emir",
        "burak kus",
        "yigit"
    ],
    "ic mekan tasarim-2": [
        "enes",
        "ahmethan",
        "samet",
        "sadik"
    ]
};

// Görseldeki Gol Krallığı verileri
const DEFAULT_PLAYER_GOALS = {
    "hit-2:aykut": 18,
    "wtk-2:mehmet": 15,
    "ic mekan tasarim-2:enes": 8,
    "ic mekan tasarim-2:ahmethan": 6,
    "hit-2:mahmut": 5,
    "wtk-2:serhat": 5,
    "maliye isletme -2:burak": 4,
    "wtk-2:muhammet": 4,
    "wtk-2:oguzhan": 4,
    "hit-2:cakir": 3,
    "hit-2:gazi": 2,
    "ic mekan tasarim-2:samet": 2,
    "wtk-2:goktug": 2,
    "hit-1:davut": 1,
    "maliye isletme -2:emirhan": 1,
    "maliye isletme -2:mert": 1,
    "maliye isletme -2:toprak": 1,
    "wtk-2:mehmet acar": 1
};

const DEFAULT_PLAYERS = [];
let _pCounter = 1;
for (const [teamName, playerNames] of Object.entries(DEFAULT_TEAMS_ROSTER)) {
    playerNames.forEach(pName => {
        const goalKey = `${teamName}:${pName}`;
        const goals = DEFAULT_PLAYER_GOALS[goalKey] || 0;
        DEFAULT_PLAYERS.push({
            id: `p-${_pCounter++}`,
            name: pName,
            team: teamName,
            goals: goals
        });
    });
}

// Görseldeki Turnuva Puan Durumu (5 Takım Genel Sıralama)
const DEFAULT_STANDINGS = [
    { id: "t-hit2", name: "hit-2", o: 3, g: 2, b: 0, m: 1, av: 18, p: 6 },
    { id: "t-wtk2", name: "wtk-2", o: 3, g: 2, b: 0, m: 1, av: 15, p: 6 },
    { id: "t-icmekan2", name: "ic mekan tasarim-2", o: 2, g: 2, b: 0, m: 0, av: 3, p: 6 },
    { id: "t-maliye2", name: "maliye isletme -2", o: 2, g: 0, b: 0, m: 2, av: -9, p: 0 },
    { id: "t-hit1", name: "hit-1", o: 2, g: 0, b: 0, m: 2, av: -27, p: 0 }
];

const STATS_STORAGE_KEY = 'turnuva_stats_v6';
const STANDINGS_STORAGE_KEY = 'turnuva_standings_v6';
const STATS_ADMIN_AUTH_KEY = 'turnuva_admin_authenticated';

function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function isValidTournamentRoster(playersList) {
    if (!Array.isArray(playersList) || playersList.length < 20) return false;
    const currentTeams = Object.keys(DEFAULT_TEAMS_ROSTER);
    return currentTeams.every(teamName => 
        playersList.some(p => p.team && p.team.toLowerCase().trim() === teamName.toLowerCase().trim())
    );
}

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

async function savePlayersData(playersList, syncToCloud = false) {
    try {
        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(playersList));
        window.dispatchEvent(new CustomEvent('turnuva_stats_updated', { detail: { players: playersList } }));
    } catch (e) {
        console.error('İstatistik verisi yerel önbelleğe kaydedilemedi:', e);
    }
    return { success: true, cloudSynced: false, method: 'local_only' };
}

async function addPlayer(playerObj, syncToCloud = false) {
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

async function deletePlayer(playerId, syncToCloud = false) {
    let list = getPlayersData();
    list = list.filter(p => String(p.id) !== String(playerId));
    const res = await savePlayersData(list, syncToCloud);
    return res;
}

async function resetPlayersData() {
    const defaultData = cloneObject(DEFAULT_PLAYERS);
    await savePlayersData(defaultData, false);
    return defaultData;
}

async function fetchPlayersCloudData() {
    return null;
}

async function initPlayersDataSync(onDataLoadedCallback) {
    const localData = getPlayersData();
    if (typeof onDataLoadedCallback === 'function') {
        onDataLoadedCallback(localData);
    }
}

function isValidTournamentStandings(standingsList) {
    if (!Array.isArray(standingsList) || standingsList.length < 5) return false;
    const requiredKeys = ['id', 'name', 'o', 'g', 'b', 'm', 'av', 'p'];
    return standingsList.every(team => 
        team && requiredKeys.every(k => k in team)
    );
}

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
        console.warn('Puan durumu yerel verisi okunamadı:', e);
    }

    const defaultData = cloneObject(DEFAULT_STANDINGS);
    saveStandingsData(defaultData, false);
    return defaultData;
}

async function saveStandingsData(standingsList, syncToCloud = false) {
    try {
        localStorage.setItem(STANDINGS_STORAGE_KEY, JSON.stringify(standingsList));
        window.dispatchEvent(new CustomEvent('turnuva_standings_updated', { detail: { standings: standingsList } }));
    } catch (e) {
        console.error('Puan durumu yerel kaydedilemedi:', e);
    }
    return { success: true, cloudSynced: false };
}

async function resetStandingsData() {
    const defaultData = cloneObject(DEFAULT_STANDINGS);
    await saveStandingsData(defaultData, false);
    return defaultData;
}

async function fetchStandingsCloudData() {
    return null;
}

async function initStandingsDataSync(onDataLoadedCallback) {
    const localData = getStandingsData();
    if (typeof onDataLoadedCallback === 'function') {
        onDataLoadedCallback(localData);
    }
}

function findCanonicalTournamentTeam(inputName) {
    if (!inputName || typeof inputName !== 'string') return null;
    const clean = inputName
        .toLowerCase()
        .replace(/[-_\s]/g, '')
        .replace(/i̇/g, 'i')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ç/g, 'c')
        .replace(/ğ/g, 'g')
        .trim();

    if (clean === 'hit2') return 'hit-2';
    if (clean === 'wtk2') return 'wtk-2';
    if (clean === 'hit1') return 'hit-1';
    if (clean.includes('maliye') || clean === 'maliyeisletme2') return 'maliye isletme -2';
    if (clean.includes('mekan') || clean === 'icmekantasarim2') return 'ic mekan tasarim-2';

    return null;
}

function calculateStandingsFromTournamentMatches(tournamentData) {
    if (!tournamentData) return { standings: cloneObject(DEFAULT_STANDINGS), matchesProcessed: 0, details: [] };

    const tableMap = {
        "hit-2": { id: "t-hit2", name: "hit-2", o: 0, g: 0, b: 0, m: 0, av: 0, p: 0, ag: 0, yg: 0 },
        "wtk-2": { id: "t-wtk2", name: "wtk-2", o: 0, g: 0, b: 0, m: 0, av: 0, p: 0, ag: 0, yg: 0 },
        "hit-1": { id: "t-hit1", name: "hit-1", o: 0, g: 0, b: 0, m: 0, av: 0, p: 0, ag: 0, yg: 0 },
        "maliye isletme -2": { id: "t-maliye2", name: "maliye isletme -2", o: 0, g: 0, b: 0, m: 0, av: 0, p: 0, ag: 0, yg: 0 },
        "ic mekan tasarim-2": { id: "t-icmekan2", name: "ic mekan tasarim-2", o: 0, g: 0, b: 0, m: 0, av: 0, p: 0, ag: 0, yg: 0 }
    };

    const allMatches = [];
    const seenMatchKeys = new Set();

    function addCandidateMatch(m) {
        if (!m || !m.team1 || !m.team2) return;
        const c1 = findCanonicalTournamentTeam(m.team1);
        const c2 = findCanonicalTournamentTeam(m.team2);
        if (!c1 || !c2 || c1 === c2) return;
        const key = m.id || [c1, c2].sort().join('_vs_');
        if (!seenMatchKeys.has(key)) {
            seenMatchKeys.add(key);
            allMatches.push(m);
        }
    }

    if (Array.isArray(tournamentData.matches)) {
        tournamentData.matches.forEach(addCandidateMatch);
    }

    if (tournamentData.mac3) addCandidateMatch(tournamentData.mac3);
    if (tournamentData.mac4) addCandidateMatch(tournamentData.mac4);
    if (tournamentData.mac5) addCandidateMatch(tournamentData.mac5);
    if (tournamentData.mac6) addCandidateMatch(tournamentData.mac6);

    if (Array.isArray(tournamentData.quarters)) {
        tournamentData.quarters.forEach(addCandidateMatch);
    } else if (tournamentData.quarter) {
        addCandidateMatch(tournamentData.quarter);
    }

    if (Array.isArray(tournamentData.semis)) {
        tournamentData.semis.forEach(addCandidateMatch);
    }

    if (tournamentData.thirdPlace) addCandidateMatch(tournamentData.thirdPlace);
    if (tournamentData.final) addCandidateMatch(tournamentData.final);

    let matchesProcessed = 0;
    const details = [];

    allMatches.forEach(m => {
        if (!m) return;
        const team1 = findCanonicalTournamentTeam(m.team1);
        const team2 = findCanonicalTournamentTeam(m.team2);

        if (!team1 || !team2 || team1 === team2) return;

        const s1Raw = m.score1;
        const s2Raw = m.score2;

        if (s1Raw === null || s1Raw === undefined || s1Raw === '' ||
            s2Raw === null || s2Raw === undefined || s2Raw === '') {
            return;
        }

        const s1 = parseInt(s1Raw, 10);
        const s2 = parseInt(s2Raw, 10);

        if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) {
            return;
        }

        const t1 = tableMap[team1];
        const t2 = tableMap[team2];

        t1.o += 1;
        t2.o += 1;
        t1.ag += s1;
        t1.yg += s2;
        t2.ag += s2;
        t2.yg += s1;
        t1.av = t1.ag - t1.yg;
        t2.av = t2.ag - t2.yg;

        if (s1 > s2) {
            t1.g += 1;
            t1.p += 3;
            t2.m += 1;
            details.push(`${team1} ${s1}-${s2} ${team2} (${team1} galip)`);
        } else if (s2 > s1) {
            t2.g += 1;
            t2.p += 3;
            t1.m += 1;
            details.push(`${team1} ${s1}-${s2} ${team2} (${team2} galip)`);
        } else {
            t1.b += 1;
            t1.p += 1;
            t2.b += 1;
            t2.p += 1;
            details.push(`${team1} ${s1}-${s2} ${team2} (Beraberlik)`);
        }

        matchesProcessed += 1;
    });

    const standings = Object.values(tableMap).map(team => ({
        id: team.id,
        name: team.name,
        o: team.o,
        g: team.g,
        b: team.b,
        m: team.m,
        av: team.av,
        p: team.p
    }));

    return { standings, matchesProcessed, details };
}

async function syncStandingsFromTournamentMatches(tournamentData, syncToCloud = false) {
    const calc = calculateStandingsFromTournamentMatches(tournamentData);
    const saveRes = await saveStandingsData(calc.standings, syncToCloud);
    return {
        ...calc,
        ...saveRes
    };
}

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

function getTopScorers(playersList, sortBy = 'goals') {
    const list = playersList || getPlayersData();
    if (sortBy === 'goals') {
        return [...list].sort((a, b) => {
            const ga = parseInt(a.goals, 10) || 0;
            const gb = parseInt(b.goals, 10) || 0;
            if (gb !== ga) return gb - ga;
            const tc = (a.team || '').localeCompare(b.team || '', 'tr', { sensitivity: 'base' });
            if (tc !== 0) return tc;
            return (a.name || '').localeCompare(b.name || '', 'tr', { sensitivity: 'base' });
        });
    }

    return [...list].sort((a, b) => {
        const tc = (a.team || '').localeCompare(b.team || '', 'tr', { sensitivity: 'base' });
        if (tc !== 0) return tc;
        return (a.name || '').localeCompare(b.name || '', 'tr', { sensitivity: 'base' });
    });
}

function getTournamentTeams() {
    return Object.keys(DEFAULT_TEAMS_ROSTER);
}

function getTeamSquad(teamName, playersList) {
    const list = playersList || getPlayersData();
    const roster = list.filter(p => p.team && p.team.toLowerCase().trim() === teamName.toLowerCase().trim());
    return roster;
}

function getCardReports() {
    return [];
}

function isAdminAuthenticated() {
    return false;
}

function authenticateAdmin(pin) {
    return false;
}

function logoutAdmin() {
}
