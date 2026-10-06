

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

const DEFAULT_STANDINGS = [
    { id: "t-hit2", name: "hit-2", o: 0, g: 0, b: 0, m: 0, av: 0, p: 0 },
    { id: "t-wtk2", name: "wtk-2", o: 0, g: 0, b: 0, m: 0, av: 0, p: 0 },
    { id: "t-hit1", name: "hit-1", o: 0, g: 0, b: 0, m: 0, av: 0, p: 0 },
    { id: "t-maliye2", name: "maliye isletme -2", o: 0, g: 0, b: 0, m: 0, av: 0, p: 0 },
    { id: "t-icmekan2", name: "ic mekan tasarim-2", o: 0, g: 0, b: 0, m: 0, av: 0, p: 0 }
];

const STATS_STORAGE_KEY = 'turnuva_stats_v4';
const STANDINGS_STORAGE_KEY = 'turnuva_standings_v4';
const STATS_ADMIN_AUTH_KEY = 'turnuva_admin_authenticated';

let _statsRealtimeSubscribed = false;
let _standingsRealtimeSubscribed = false;

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

async function savePlayersData(playersList, syncToCloud = true) {
    
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

async function deletePlayer(playerId, syncToCloud = true) {
    let list = getPlayersData();
    list = list.filter(p => String(p.id) !== String(playerId));
    const res = await savePlayersData(list, syncToCloud);
    return res;
}

async function resetPlayersData() {
    const defaultData = cloneObject(DEFAULT_PLAYERS);
    await savePlayersData(defaultData, true);
    return defaultData;
}

async function fetchPlayersCloudData() {
    if (typeof getSupabaseClient !== 'function') return null;
    const client = getSupabaseClient();
    if (!client) return null;

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

function isValidTournamentStandings(standingsList) {
    if (!Array.isArray(standingsList) || standingsList.length === 0) return false;
    const currentTeams = Object.keys(DEFAULT_TEAMS_ROSTER);
    return currentTeams.every(teamName =>
        standingsList.some(t => t.name && t.name.toLowerCase().trim() === teamName.toLowerCase().trim())
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
        console.warn('Puan durumu okunamadı:', e);
    }

    const defaultData = cloneObject(DEFAULT_STANDINGS);
    saveStandingsData(defaultData, false);
    return defaultData;
}

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

async function resetStandingsData() {
    const defaultData = cloneObject(DEFAULT_STANDINGS);
    await saveStandingsData(defaultData, true);
    return defaultData;
}

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
    if (tournamentData.mac7) addCandidateMatch(tournamentData.mac7);
    if (tournamentData.mac8) addCandidateMatch(tournamentData.mac8);
    if (tournamentData.mac9) addCandidateMatch(tournamentData.mac9);
    if (tournamentData.mac10) addCandidateMatch(tournamentData.mac10);

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

async function syncStandingsFromTournamentMatches(tournamentData, syncToCloud = true) {
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

function getTopScorers(playersList, sortBy = 'team') {
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
    try {
        sessionStorage.removeItem('turnuva_admin_authenticated');
        localStorage.removeItem('turnuva_admin_authenticated');
        sessionStorage.removeItem(STATS_ADMIN_AUTH_KEY);
    } catch (e) { }
}

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
