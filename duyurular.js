

const DEFAULT_ANNOUNCEMENTS = [
    {
        id: "d-1",
        title: "🏆 Turnuva 28 Eylül'de Başlıyor! Ön Eleme Maçları Açıklandı",
        category: "onemli",
        categoryLabel: "🚨 Önemli Duyuru",
        date: "28 Eylül 2026",
        author: "Turnuva Komitesi",
        pinned: true,
        summary: "28 Eylül Ön Eleme Maçları: 18:00 maliye isletme -2 vs wtk-2, 19:00 hit-1 vs hit-2. ic mekan tasarim-2 kura ile doğrudan yarı finale yükseldi.",
        content: "2026 Futbol Turnuvamız tüm coşkusuyla başlıyor! Ön Eleme maçları 28 Eylül 2026 tarihinde oynanacaktır:\n\n⚡ 18:00 | maliye isletme -2 vs wtk-2\n⚡ 19:00 | hit-1 vs hit-2\n\n⭐ ic mekan tasarim-2 kura sonucunda 1. Turu bay geçerek doğrudan 29 Eylül'deki Yarı Final'e yükselmiştir.\n\nTüm takımlarımıza ve sporcularımıza centilmence mücadeleler ve başarılar dileriz!"
    },
    {
        id: "d-2",
        title: "⚽ Grup & Eleme Aşaması Maç Saatleri ve Saha Kuralları",
        category: "mac",
        categoryLabel: "⚽ Maç Bilgisi",
        date: "28 Eylül 2026",
        author: "Turnuva Komitesi",
        pinned: false,
        summary: "Ön eleme maçları saat 18:00 ve 19:00'da oynanacaktır. Takımların en az 20 dakika önce sahada hazır bulunması gerekmektedir.",
        content: "Turnuvamızın Ön Eleme maçları 28 Eylül'de saat 18:00 ve 19:00'da oynanacaktır. Maçların aksamaması adına takımların maç saatinden en az 20 dakika önce esame listeleriyle birlikte saha kenarında hazır bulunmaları zorunludur.\n\nMaç süreleri 2 x 25 dakika olarak oynanacak olup, devre arası 5 dakikadır."
    },
    {
        id: "d-3",
        title: "📜 Kart Cezaları ve Disiplin Talimatı",
        category: "kural",
        categoryLabel: "📜 Kural & Disiplin",
        date: "10 Mart 2026",
        author: "Hakem Kurulu",
        pinned: false,
        summary: "Sarı kart ve kırmızı kart uygulamaları ile disiplin kuralları belirlenmiştir.",
        content: "Turnuvamızda disiplin ve centilmenlik ön plandadır.\n• Aynı maçta 2 sarı karttan kırmızı kart gören oyuncu takip eden ilk resmi maçta forma giyemez.\n• Doğrudan kırmızı kart durumunda hakem raporuna göre en az 2 maç men cezası uygulanır.\n• Turnuva genelinde 3 sarı karta ulaşan oyuncu bir sonraki maçta cezalı duruma düşer."
    },
    {
        id: "d-4",
        title: "📊 Canlı İstatistikler ve Takım Kadroları Yayında",
        category: "genel",
        categoryLabel: "📢 Genel Bilgilendirme",
        date: "28 Eylül 2026",
        author: "Yönetim",
        pinned: false,
        summary: "Tüm takımların oyuncu kadrolarını ve detaylı istatistiklerini 'İstatistikler' sayfamızdan inceleyebilirsiniz.",
        content: "Turnuvada yer alan tüm 5 takımın oyuncu kadrolarını (hit-2, wtk-2, hit-1, maliye isletme -2, ic mekan tasarim-2), puan durumunu ve gol krallığı tablosunu sitemizin 'İstatistikler' sayfasından anlık olarak takip edebilirsiniz."
    }
];

const STORAGE_KEY = 'turnuva_duyurular_v5';
const ADMIN_AUTH_KEY = 'turnuva_admin_authenticated';

let _realtimeSubscribed = false;

function getActiveFixtureMatches() {
    let tData = null;
    try {
        if (typeof getTournamentData === 'function') {
            tData = getTournamentData();
        } else {
            const raw = localStorage.getItem('turnuva_bracket_v9') || localStorage.getItem('turnuva_bracket_v8');
            if (raw) tData = JSON.parse(raw);
        }
    } catch (e) {}

    const matches = (tData && Array.isArray(tData.matches)) ? tData.matches : [];
    const findMatch = (id) => matches.find(m => m && m.id === id);

    const m7 = (tData && tData.mac7) || findMatch('mac-7') || {
        time: '18:00', team1: 'hit-2', team2: 'wtk-2'
    };
    const m7b = (tData && tData.mac7b) || findMatch('mac-7b') || {
        time: '19:00', team1: 'ic mekan tasarim-2', team2: 'maliye isletme -2'
    };
    const m8 = (tData && tData.mac8) || findMatch('mac-8') || {
        time: '18:00', team1: 'maliye isletme -2', team2: 'hit-1'
    };
    const m10 = (tData && tData.mac10) || findMatch('mac-10') || {
        time: '18:00', team1: 'ic mekan tasarim-2', team2: 'hit-1'
    };

    return { m7, m7b, m8, m10 };
}

function getActiveTournamentDay() {
    try {
        if (typeof window !== 'undefined' && window.location && window.location.search) {
            const urlParams = new URLSearchParams(window.location.search);
            const dParam = parseInt(urlParams.get('day') || urlParams.get('gun'), 10);
            if (dParam === 6 || dParam === 7 || dParam === 8) return dParam;
        }
        const sessionDay = sessionStorage.getItem('turnuva_active_fixture_day');
        if (sessionDay) {
            const sd = parseInt(sessionDay, 10);
            if (sd === 6 || sd === 7 || sd === 8) return sd;
        }
    } catch (e) {}

    const now = new Date();
    const date = now.getDate();
    const month = now.getMonth(); 

    if (month === 9) { 
        if (date === 7) return 7;
        if (date >= 8) return 8;
        return 6; 
    }

    if (date === 7) return 7;
    if (date === 8) return 8;
    return 6; 
}

function getDailyTournamentAnnouncement() {
    const day = getActiveTournamentDay();
    const { m7, m7b, m8, m10 } = getActiveFixtureMatches();

    if (day === 7) {
        const t1_8 = m8.team1 || 'maliye isletme -2';
        const t2_8 = m8.team2 || 'hit-1';
        const time8 = m8.time || '18:00';

        return {
            id: 'gunun-maci-otomatik-7',
            title: `⚽ Günün Maçı (7 Ekim Çarşamba) — ${t1_8} vs ${t2_8}`,
            category: 'mac',
            categoryLabel: '⚽ Günün Maçı',
            date: '7 Ekim 2026',
            author: 'Turnuva Komitesi',
            pinned: true,
            isDynamic: true,
            summary: `Bugün: ${time8} ${t1_8} 🆚 ${t2_8}`,
            content: `🏆 Turnuvada 7 Ekim Çarşamba günü programı:\n\n⚡ ${time8} | ${t1_8} 🆚 ${t2_8}\n\nTüm futbolseverleri maçı izlemeye davet ediyor, takımlarımıza başarılar diliyoruz!`
        };
    } else if (day === 8) {
        const t1_10 = m10.team1 || 'ic mekan tasarim-2';
        const t2_10 = m10.team2 || 'hit-1';
        const time10 = m10.time || '18:00';

        return {
            id: 'gunun-maci-otomatik-8',
            title: `⚽ Günün Maçı (8 Ekim Perşembe) — ${t1_10} vs ${t2_10}`,
            category: 'mac',
            categoryLabel: '⚽ Günün Maçı',
            date: '8 Ekim 2026',
            author: 'Turnuva Komitesi',
            pinned: true,
            isDynamic: true,
            summary: `Bugün (8 Ekim Perşembe) saat ${time10}'de ${t1_10} ile ${t2_10} karşı karşıya geliyor.`,
            content: `🏆 Turnuvada 8 Ekim Perşembe günü programı:\n\n⚡ ${time10} | ${t1_10} 🆚 ${t2_10}\n\nTüm futbolseverleri maçı izlemeye davet ediyor, takımlarımıza başarılar diliyoruz!`
        };
    } else {
        const t1_7 = m7.team1 || 'hit-2';
        const t2_7 = m7.team2 || 'wtk-2';
        const time7 = m7.time || '18:00';

        const t1_7b = m7b.team1 || 'ic mekan tasarim-2';
        const t2_7b = m7b.team2 || 'maliye isletme -2';
        const time7b = m7b.time || '19:00';

        return {
            id: 'gunun-maci-otomatik-6',
            title: `⚽ Günün Maçları (6 Ekim Salı) — ${t1_7} vs ${t2_7} & ${t1_7b} vs ${t2_7b}`,
            category: 'mac',
            categoryLabel: '⚽ Günün Maçları',
            date: '6 Ekim 2026',
            author: 'Turnuva Komitesi',
            pinned: true,
            isDynamic: true,
            summary: `Bugün 2 maç: ${time7} ${t1_7} 🆚 ${t2_7} ve ${time7b} ${t1_7b} 🆚 ${t2_7b}`,
            content: `🏆 Turnuvada yeni hafta heyecanı başlıyor!\n\nBugün (6 Ekim 2026 Salı) oynanacak karşılaşmalar:\n\n⚡ ${time7} | ${t1_7} 🆚 ${t2_7}\n⚡ ${time7b} | ${t1_7b} 🆚 ${t2_7b}\n\nFikstürde yer alan karşılaşmalarda tüm takımlarımıza ve sporcularımıza centilmence mücadeleler dileriz!`
        };
    }
}

if (typeof window !== 'undefined') {
    window.addEventListener('turnuva_bracket_updated', () => {
        try {
            window.dispatchEvent(new CustomEvent('turnuva_announcements_updated', { detail: { list: getAnnouncements() } }));
        } catch (e) {}
    });
}

function getAnnouncements() {
    let list = null;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                list = parsed.filter(a => a && (!a.id || (!String(a.id).startsWith('system-') && !String(a.id).startsWith('gunun-maci-otomatik-'))) && a.category !== 'system');
            }
        }
    } catch (e) {
        console.warn('LocalStorage okunamadı:', e);
    }
    
    // Yalnızca localStorage'da veri hiç başlatılmamışsa (null) varsayılan verileri yükle.
    // Kullanıcı duyuruların tamamını sildiyse (boş dizi []), boş liste olarak kalmalıdır.
    if (list === null) {
        list = [...DEFAULT_ANNOUNCEMENTS];
    }

    const dailyAnn = getDailyTournamentAnnouncement();
    if (dailyAnn) {
        list = [dailyAnn, ...list];
    }

    return list;
}

function saveAnnouncements(list) {
    try {
        const cleanList = (list || []).filter(a => a && !String(a.id).startsWith('gunun-maci-otomatik-'));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanList));
        localStorage.setItem('turnuva_duyurular_initialized', 'true');
        
        try {
            window.dispatchEvent(new CustomEvent('turnuva_announcements_updated', { detail: { list: getAnnouncements() } }));
        } catch (evErr) {}
    } catch (e) {
        console.error('LocalStorage kaydetme hatası:', e);
    }
}

function getLatestAnnouncement() {
    const list = getAnnouncements();
    if (!list || list.length === 0) return null;
    
    const pinned = list.find(a => a.pinned);
    return pinned || list[0];
}

function addAnnouncement(item) {
    const list = getAnnouncements().filter(a => a && !String(a.id).startsWith('gunun-maci-otomatik-'));
    const newItem = {
        id: 'd-' + Date.now(),
        title: item.title,
        category: item.category || 'genel',
        categoryLabel: getCategoryLabel(item.category || 'genel'),
        date: item.date || formatDate(new Date()),
        author: item.author || 'Turnuva Komitesi',
        pinned: Boolean(item.pinned),
        summary: item.summary || (item.content ? item.content.slice(0, 110) + '...' : ''),
        content: item.content || ''
    };

    if (newItem.pinned) {
        list.unshift(newItem);
    } else {
        const firstNonPinned = list.findIndex(a => !a.pinned);
        if (firstNonPinned === -1) {
            list.push(newItem);
        } else {
            list.splice(firstNonPinned, 0, newItem);
        }
    }

    saveAnnouncements(list);

    return newItem;
}

function updateAnnouncement(id, updatedFields) {
    const list = getAnnouncements();
    const index = list.findIndex(a => String(a.id) === String(id));
    if (index === -1) return null;

    const current = list[index];
    const category = updatedFields.category || current.category;
    list[index] = {
        ...current,
        ...updatedFields,
        category: category,
        categoryLabel: getCategoryLabel(category),
        summary: updatedFields.summary || (updatedFields.content ? updatedFields.content.slice(0, 110) + '...' : current.summary)
    };

    list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    saveAnnouncements(list);

    return list[index];
}

async function deleteAnnouncement(id) {
    if (!id) return getAnnouncements();
    const strId = String(id).trim();

    let list = [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) list = parsed;
        } else {
            list = [...DEFAULT_ANNOUNCEMENTS];
        }
    } catch (e) {
        list = [...DEFAULT_ANNOUNCEMENTS];
    }

    list = list.filter(a => a && String(a.id) !== strId && !String(a.id).startsWith('gunun-maci-otomatik-'));
    saveAnnouncements(list);

    return getAnnouncements();
}

function resetToDefaultAnnouncements() {
    saveAnnouncements(DEFAULT_ANNOUNCEMENTS);
    return DEFAULT_ANNOUNCEMENTS;
}

async function syncAnnouncementsFromSupabase() {
    return null;
}

function initSupabaseRealtime() {
}


function getCategoryLabel(cat) {
    switch (cat) {
        case 'onemli': return '🚨 Önemli Duyuru';
        case 'mac': return '⚽ Maç Bilgisi';
        case 'kural': return '📜 Kural & Disiplin';
        case 'genel': return '📢 Genel Bilgilendirme';
        default: return '📌 Duyuru';
    }
}

function formatDate(d) {
    try {
        const months = [
            'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
        ];
        const dateObj = (typeof d === 'string') ? new Date(d) : d;
        if (isNaN(dateObj.getTime())) return d;
        return `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    } catch (e) {
        return 'Bugün';
    }
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
        sessionStorage.removeItem(ADMIN_AUTH_KEY);
    } catch (e) { }
}

function exportAnnouncementsJSON() {
    const list = getAnnouncements();
    return JSON.stringify(list, null, 4);
}
