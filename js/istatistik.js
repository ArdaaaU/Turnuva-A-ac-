const DEFAULT_TEAMS_ROSTER = {
    "hit-2": [
        "aykut",
        "mahmut",
        "cakir",
        "gazi",
        "sazak",
        "tamer",
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
        "ali",
        "ahmethan"
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
        "enes",
        "umut",
        "emir",
        "burak kus",
        "yigit"
    ],
    "ic mekan tasarim-2": [
        "enes",
        "samet",
        "emre"
    ]
};
const DEFAULT_PLAYER_GOALS = {
    "hit-2:aykut": 37,
    "wtk-2:mehmet": 24,
    "wtk-2:ahmethan": 18,
    "hit-2:mahmut": 11,
    "maliye isletme -2:burak": 11,
    "wtk-2:serhat": 8,
    "ic mekan tasarim-2:enes": 8,
    "hit-2:cakir": 7,
    "hit-1:davut": 7,
    "ic mekan tasarim-2:samet": 6,
    "maliye isletme -2:toprak": 6,
    "wtk-2:muhammet": 5,
    "hit-2:gazi": 5,
    "wtk-2:oguzhan": 4,
    "hit-1:can": 3,
    "maliye isletme -2:emirhan": 2,
    "hit-2:sazak": 2,
    "maliye isletme -2:mert": 2,
    "wtk-2:goktug": 2,
    "hit-2:tamer": 1,
    "hit-1:arda": 1,
    "maliye isletme -2:enes": 1,
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
const DEFAULT_STANDINGS = [
    { id: "t-hit2", name: "hit-2", o: 4, g: 3, b: 0, m: 1, av: 23, p: 9 },
    { id: "t-icmekan2", name: "ic mekan tasarim-2", o: 4, g: 3, b: 0, m: 1, av: 5, p: 9 },
    { id: "t-wtk2", name: "wtk-2", o: 4, g: 2, b: 0, m: 2, av: 11, p: 6 },
    { id: "t-hit1", name: "hit-1", o: 4, g: 1, b: 0, m: 3, av: -32, p: 3 },
    { id: "t-maliye2", name: "maliye isletme -2", o: 4, g: 1, b: 0, m: 3, av: -6, p: 3 }
];
let inMemoryPlayers = cloneObject(DEFAULT_PLAYERS);
let inMemoryStandings = cloneObject(DEFAULT_STANDINGS);
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
    if (!inMemoryPlayers || !isValidTournamentRoster(inMemoryPlayers)) {
        inMemoryPlayers = cloneObject(DEFAULT_PLAYERS);
    }
    return cloneObject(inMemoryPlayers);
}
async function saveStatsCloudData() {
    const isAuth = typeof window.TurnuvaAuth !== 'undefined' && typeof window.TurnuvaAuth.isAuthenticated === 'function' && window.TurnuvaAuth.isAuthenticated();
    if (!isAuth) {
        console.error('Yetkisiz işlem: Bu işlem için yönetici girişi gereklidir.');
        return { success: false, error: 'Yetkisiz erişim' };
    }
    if (typeof getSupabaseClient !== 'function') return { success: false, error: 'no_client' };
    const client = getSupabaseClient();
    if (!client) return { success: false, error: 'no_client' };
    try {
        const { error } = await client
            .from('turnuva_istatistik')
            .upsert({
                id: 'main',
                data: {
                    players: inMemoryPlayers,
                    standings: inMemoryStandings
                },
                updated_at: new Date().toISOString()
            });
        if (error) {
            console.warn('Supabase istatistik kaydetme hatası:', error);
            return { success: false, error: error.message };
        }
        return { success: true };
    } catch (err) {
        console.warn('Supabase istatistik istisnası:', err);
        return { success: false, error: err.message };
    }
}
async function fetchStatsCloudData() {
    if (typeof getSupabaseClient !== 'function') return null;
    const client = getSupabaseClient();
    if (!client) return null;
    try {
        const { data, error } = await client
            .from('turnuva_istatistik')
            .select('data')
            .eq('id', 'main')
            .maybeSingle();
        if (error) {
            console.warn('Supabase istatistik okuma hatası:', error);
            return null;
        }
        if (data && data.data) {
            return data.data;
        }
    } catch (err) {
        console.warn('Supabase istatistik çekme hatası:', err);
    }
    return null;
}
let _statsRealtimeChannel = null;
function initStatsRealtime() {
    if (_statsRealtimeChannel) return;
    if (typeof getSupabaseClient !== 'function') return;
    const client = getSupabaseClient();
    if (!client) return;
    try {
        _statsRealtimeChannel = client.channel('public:turnuva_istatistik_ch');
        _statsRealtimeChannel
            .on('postgres_changes', { event: '*', schema: 'public', table: 'turnuva_istatistik', filter: 'id=eq.main' }, function (payload) {
                if (payload && payload.new && payload.new.data) {
                    const d = payload.new.data;
                    let hasChanges = false;
                    if (d.players && isValidTournamentRoster(d.players)) {
                        inMemoryPlayers = cloneObject(d.players);
                        window.dispatchEvent(new CustomEvent('turnuva_stats_updated', { detail: { players: inMemoryPlayers } }));
                        hasChanges = true;
                    }
                    if (d.standings && isValidTournamentStandings(d.standings)) {
                        inMemoryStandings = cloneObject(d.standings);
                        window.dispatchEvent(new CustomEvent('turnuva_standings_updated', { detail: { standings: inMemoryStandings } }));
                        hasChanges = true;
                    }
                }
            })
            .subscribe(function (status) {
                if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    _statsRealtimeChannel = null;
                }
            });
    } catch (e) {
        _statsRealtimeChannel = null;
    }
}
async function savePlayersData(playersList, syncToCloud = false) {
    if (syncToCloud) {
        const isAuth = typeof window.TurnuvaAuth !== 'undefined' && typeof window.TurnuvaAuth.isAuthenticated === 'function' && window.TurnuvaAuth.isAuthenticated();
        if (!isAuth) {
            console.error('Yetkisiz işlem: İstatistikleri kaydetmek için yönetici girişi gereklidir.');
            return { success: false, cloudSynced: false, error: 'Yetkisiz erişim' };
        }
    }
    inMemoryPlayers = cloneObject(playersList);
    window.dispatchEvent(new CustomEvent('turnuva_stats_updated', { detail: { players: inMemoryPlayers } }));
    let cloudSynced = false;
    if (syncToCloud) {
        const cloudRes = await saveStatsCloudData();
        cloudSynced = cloudRes.success;
    }
    return { success: true, cloudSynced: cloudSynced };
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
    const isAuth = typeof window.TurnuvaAuth !== 'undefined' && typeof window.TurnuvaAuth.isAuthenticated === 'function' && window.TurnuvaAuth.isAuthenticated();
    if (!isAuth) {
        console.error('Yetkisiz işlem: Bu işlem için yönetici girişi gereklidir.');
        return { success: false, error: 'Yetkisiz erişim' };
    }
    inMemoryPlayers = cloneObject(DEFAULT_PLAYERS);
    await savePlayersData(inMemoryPlayers, true);
    return cloneObject(inMemoryPlayers);
}
function isValidTournamentStandings(standingsList) {
    if (!Array.isArray(standingsList) || standingsList.length < 5) return false;
    const requiredKeys = ['id', 'name', 'o', 'g', 'b', 'm', 'av', 'p'];
    return standingsList.every(team =>
        team && requiredKeys.every(k => k in team)
    );
}
function getStandingsData() {
    if (!inMemoryStandings || !isValidTournamentStandings(inMemoryStandings)) {
        inMemoryStandings = cloneObject(DEFAULT_STANDINGS);
    }
    return cloneObject(inMemoryStandings);
}
async function saveStandingsData(standingsList, syncToCloud = false) {
    if (syncToCloud) {
        const isAuth = typeof window.TurnuvaAuth !== 'undefined' && typeof window.TurnuvaAuth.isAuthenticated === 'function' && window.TurnuvaAuth.isAuthenticated();
        if (!isAuth) {
            console.error('Yetkisiz işlem: İstatistikleri kaydetmek için yönetici girişi gereklidir.');
            return { success: false, cloudSynced: false, error: 'Yetkisiz erişim' };
        }
    }
    inMemoryStandings = cloneObject(standingsList);
    window.dispatchEvent(new CustomEvent('turnuva_standings_updated', { detail: { standings: inMemoryStandings } }));
    let cloudSynced = false;
    if (syncToCloud) {
        const cloudRes = await saveStatsCloudData();
        cloudSynced = cloudRes.success;
    }
    return { success: true, cloudSynced: cloudSynced };
}
async function resetStandingsData() {
    const isAuth = typeof window.TurnuvaAuth !== 'undefined' && typeof window.TurnuvaAuth.isAuthenticated === 'function' && window.TurnuvaAuth.isAuthenticated();
    if (!isAuth) {
        console.error('Yetkisiz işlem: Bu işlem için yönetici girişi gereklidir.');
        return { success: false, error: 'Yetkisiz erişim' };
    }
    inMemoryStandings = cloneObject(DEFAULT_STANDINGS);
    await saveStandingsData(inMemoryStandings, true);
    return cloneObject(inMemoryStandings);
}
async function initStatsDataSync(onDataLoadedCallback) {
    if (typeof onDataLoadedCallback === 'function') {
        onDataLoadedCallback({
            players: getPlayersData(),
            standings: getStandingsData()
        });
    }
    initStatsRealtime();
    const cloud = await fetchStatsCloudData();
    if (cloud) {
        let updated = false;
        if (cloud.players && isValidTournamentRoster(cloud.players)) {
            inMemoryPlayers = cloneObject(cloud.players);
            window.dispatchEvent(new CustomEvent('turnuva_stats_updated', { detail: { players: inMemoryPlayers } }));
            updated = true;
        }
        if (cloud.standings && isValidTournamentStandings(cloud.standings)) {
            inMemoryStandings = cloneObject(cloud.standings);
            window.dispatchEvent(new CustomEvent('turnuva_standings_updated', { detail: { standings: inMemoryStandings } }));
            updated = true;
        }
        if (updated && typeof onDataLoadedCallback === 'function') {
            onDataLoadedCallback({
                players: inMemoryPlayers,
                standings: inMemoryStandings
            });
        }
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
    if (clean === 'wtk2' || clean === 'wtk' || clean.includes('wtk')) return 'wtk-2';
    if (clean === 'hit1') return 'hit-1';
    if (clean.includes('maliye') || clean.includes('isletme') || clean === 'maliyeisletme2') return 'maliye isletme -2';
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
    if (tournamentData.mac1) addCandidateMatch(tournamentData.mac1);
    if (tournamentData.mac2) addCandidateMatch(tournamentData.mac2);
    if (tournamentData.mac3) addCandidateMatch(tournamentData.mac3);
    if (tournamentData.mac4) addCandidateMatch(tournamentData.mac4);
    if (tournamentData.mac5) addCandidateMatch(tournamentData.mac5);
    if (tournamentData.mac6) addCandidateMatch(tournamentData.mac6);
    if (tournamentData.mac7) addCandidateMatch(tournamentData.mac7);
    if (tournamentData.mac7b) addCandidateMatch(tournamentData.mac7b);
    if (tournamentData.mac8) addCandidateMatch(tournamentData.mac8);
    if (tournamentData.mac9) addCandidateMatch(tournamentData.mac9);
    if (tournamentData.mac10) addCandidateMatch(tournamentData.mac10);
    if (tournamentData.mac11) addCandidateMatch(tournamentData.mac11);
    if (tournamentData.mac12) addCandidateMatch(tournamentData.mac12);
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
    if (typeof window !== 'undefined' && window.TurnuvaAuth && typeof window.TurnuvaAuth.isAuthenticated === 'function') {
        return window.TurnuvaAuth.isAuthenticated();
    }
    return false;
}
function authenticateAdmin(pin) {
    if (typeof window !== 'undefined' && window.TurnuvaAuth && typeof window.TurnuvaAuth.authenticate === 'function') {
        return window.TurnuvaAuth.authenticate(pin);
    }
    return false;
}
function logoutAdmin() {
    if (typeof window !== 'undefined' && window.TurnuvaAuth && typeof window.TurnuvaAuth.logout === 'function') {
        window.TurnuvaAuth.logout();
    }
}
