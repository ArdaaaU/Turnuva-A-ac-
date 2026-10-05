/**
 * Turnuva Duyuruları Modülü (duyurular.js)
 * Hem duyurular.html hem de index.html tarafından ortak kullanılan veri ve yönetim katmanı.
 * Supabase (PostgreSQL) entegrasyonu ve yerel önbellek senkronizasyonunu destekler.
 */

// Varsayılan Turnuva Duyuruları
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

const STORAGE_KEY = 'turnuva_duyurular_v3';
const ADMIN_AUTH_KEY = 'turnuva_admin_authenticated';

let _realtimeSubscribed = false;

// Fikstürdeki güncel maç verilerini oku
function getActiveFixtureMatches() {
    let tData = null;
    try {
        if (typeof getTournamentData === 'function') {
            tData = getTournamentData();
        } else {
            const raw = localStorage.getItem('turnuva_bracket_v5') || localStorage.getItem('turnuva_bracket_v2');
            if (raw) tData = JSON.parse(raw);
        }
    } catch (e) {}

    const matches = (tData && Array.isArray(tData.matches)) ? tData.matches : [];
    const findMatch = (id) => matches.find(m => m && m.id === id);

    const m7 = (tData && tData.mac7) || findMatch('mac-7') || {
        time: '18:00', team1: 'ic mekan tasarim-2', team2: 'maliye isletme -2'
    };
    const m8 = (tData && tData.mac8) || findMatch('mac-8') || {
        time: '18:00', team1: 'maliye isletme -2', team2: 'hit-1'
    };
    const m9 = (tData && tData.mac9) || findMatch('mac-9') || {
        time: '19:00', team1: 'wtk-2', team2: 'hit-2'
    };
    const m10 = (tData && tData.mac10) || findMatch('mac-10') || {
        time: '18:00', team1: 'ic mekan tasarim-2', team2: 'hit-1'
    };

    return { m7, m8, m9, m10 };
}

// 6-8 Ekim tarih kontrolü (şuanlık 6 Ekim, 7 Ekimde 7 Ekim, 8 Ekimde 8 Ekim maçları)
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
    const month = now.getMonth(); // 9 = Ekim (0-indexed)

    if (month === 9) { // Ekim ayı
        if (date === 7) return 7;
        if (date >= 8) return 8;
        return 6; // 6 Ekim veya öncesi
    }

    if (date === 7) return 7;
    if (date === 8) return 8;
    return 6; // Varsayılan şuanlık 6 Ekim
}

// Günün maç duyurusunu fikstürden dinamik olarak oluştur
function getDailyTournamentAnnouncement() {
    const day = getActiveTournamentDay();
    const { m7, m8, m9, m10 } = getActiveFixtureMatches();

    if (day === 7) {
        const t1_8 = m8.team1 || 'maliye isletme -2';
        const t2_8 = m8.team2 || 'hit-1';
        const time8 = m8.time || '18:00';

        const t1_9 = m9.team1 || 'wtk-2';
        const t2_9 = m9.team2 || 'hit-2';
        const time9 = m9.time || '19:00';

        return {
            id: 'gunun-maci-otomatik-7',
            title: `⚽ Günün Maçları (7 Ekim Çarşamba) — ${t1_8} vs ${t2_8} & ${t1_9} vs ${t2_9}`,
            category: 'mac',
            categoryLabel: '⚽ Günün Maçları',
            date: '7 Ekim 2026',
            author: 'Turnuva Komitesi',
            pinned: true,
            isDynamic: true,
            summary: `Bugün 2 maç: ${time8} ${t1_8} 🆚 ${t2_8} ve ${time9} ${t1_9} 🆚 ${t2_9}`,
            content: `🏆 Fikstürde bugün (7 Ekim 2026 Çarşamba) oynanacak karşılaşmalar:\n\n⚡ ${time8} | ${t1_8} 🆚 ${t2_8}\n⚡ ${time9} | ${t1_9} 🆚 ${t2_9}\n\nFikstürde yer alan karşılaşmalarda tüm takımlarımıza ve sporcularımıza centilmence mücadeleler dileriz!`
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
        // Şuanlık 6 Ekim Maçı
        const t1_7 = m7.team1 || 'ic mekan tasarim-2';
        const t2_7 = m7.team2 || 'maliye isletme -2';
        const time7 = m7.time || '18:00';

        return {
            id: 'gunun-maci-otomatik-6',
            title: `⚽ Günün Maçı (6 Ekim Salı) — ${t1_7} vs ${t2_7}`,
            category: 'mac',
            categoryLabel: '⚽ Günün Maçı',
            date: '6 Ekim 2026',
            author: 'Turnuva Komitesi',
            pinned: true,
            isDynamic: true,
            summary: `Bugün (6 Ekim Salı) saat ${time7}'de ${t1_7} ile ${t2_7} karşı karşıya geliyor!`,
            content: `🏆 Turnuvada yeni hafta heyecanı başlıyor!\n\nBugün (6 Ekim 2026 Salı) oynanacak karşılaşma:\n\n⚡ ${time7} | ${t1_7} 🆚 ${t2_7}\n\nHer iki takımımıza ve tüm oyuncularımıza centilmence mücadeleler ve başarılar dileriz!`
        };
    }
}

// Fikstür güncellendiğinde duyuru listesini reaktif yenile
if (typeof window !== 'undefined') {
    window.addEventListener('turnuva_bracket_updated', () => {
        try {
            window.dispatchEvent(new CustomEvent('turnuva_announcements_updated', { detail: { list: getAnnouncements() } }));
        } catch (e) {}
    });
}

// Duyuruları Getir (Hızlı render için önbelleği döndürür + otomatik günün maçı duyurusu)
function getAnnouncements() {
    let list = [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                list = parsed.filter(a => a && (!a.id || (!String(a.id).startsWith('system-') && !String(a.id).startsWith('gunun-maci-otomatik-'))) && a.category !== 'system');
            }
        }
    } catch (e) {
        console.warn('LocalStorage okunamadı, varsayılan veriler kullanılıyor:', e);
    }
    
    if (!list || list.length === 0) {
        list = [...DEFAULT_ANNOUNCEMENTS];
    }

    // Günün maç duyurusunu otomatik oluştur ve en başa sabitle
    const dailyAnn = getDailyTournamentAnnouncement();
    if (dailyAnn) {
        list = [dailyAnn, ...list];
    }

    return list;
}

// Duyuruları Kaydet (Önbelleğe yazar ve olay tetikler - dinamik olanları hariç tutar)
function saveAnnouncements(list) {
    try {
        const cleanList = (list || []).filter(a => a && !String(a.id).startsWith('gunun-maci-otomatik-'));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanList));
        // Sayfa içi ve sekmeler arası anlık senkronizasyon tetikle
        try {
            window.dispatchEvent(new CustomEvent('turnuva_announcements_updated', { detail: { list: getAnnouncements() } }));
        } catch (evErr) {}
    } catch (e) {
        console.error('LocalStorage kaydetme hatası:', e);
    }
}

// En Son Duyuruyu Getir (Önce sabitlenmiş, sonra en güncel)
function getLatestAnnouncement() {
    const list = getAnnouncements();
    if (!list || list.length === 0) return null;
    
    const pinned = list.find(a => a.pinned);
    return pinned || list[0];
}

// Yeni Duyuru Ekle (Yerel + Supabase)
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

    // Supabase Çevrim İçi Kayıt
    if (typeof getSupabaseClient === 'function') {
        const client = getSupabaseClient();
        if (client) {
            client.from('duyurular').insert([{
                id: newItem.id,
                title: newItem.title,
                category: newItem.category,
                category_label: newItem.categoryLabel,
                date: newItem.date,
                author: newItem.author,
                pinned: newItem.pinned,
                summary: newItem.summary,
                content: newItem.content
            }]).then(({ error }) => {
                if (error) console.error('Supabase ekleme hatası:', error);
            }).catch(err => console.error('Supabase ekleme istisnası:', err));
        }
    }

    return newItem;
}

// Duyuru Güncelle (Yerel + Supabase)
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

    // Supabase Çevrim İçi Güncelleme
    if (typeof getSupabaseClient === 'function') {
        const client = getSupabaseClient();
        if (client) {
            const updated = list[index];
            client.from('duyurular').update({
                title: updated.title,
                category: updated.category,
                category_label: updated.categoryLabel,
                date: updated.date,
                author: updated.author,
                pinned: updated.pinned,
                summary: updated.summary,
                content: updated.content
            }).eq('id', String(id)).then(({ error }) => {
                if (error) console.error('Supabase güncelleme hatası:', error);
            }).catch(err => console.error('Supabase güncelleme istisnası:', err));
        }
    }

    return list[index];
}

// Duyuru Sil (Yerel + Supabase)
function deleteAnnouncement(id) {
    let list = getAnnouncements();
    list = list.filter(a => String(a.id) !== String(id));
    saveAnnouncements(list);

    // Supabase Çevrim İçi Silme
    if (typeof getSupabaseClient === 'function') {
        const client = getSupabaseClient();
        if (client) {
            client.from('duyurular').delete().eq('id', String(id)).then(({ error }) => {
                if (error) console.error('Supabase silme hatası:', error);
            }).catch(err => console.error('Supabase silme istisnası:', err));
        }
    }

    return list;
}

// Varsayılanlara Sıfırla
function resetToDefaultAnnouncements() {
    saveAnnouncements(DEFAULT_ANNOUNCEMENTS);
    return DEFAULT_ANNOUNCEMENTS;
}

// ============================================================
// SUPABASE ÇEVRİM İÇİ SENKRONİZASYON VE CANLI (REALTIME) DİNLEME
// ============================================================

// Supabase'den Duyuruları Çek
async function syncAnnouncementsFromSupabase() {
    if (typeof getSupabaseClient !== 'function') return null;
    const client = getSupabaseClient();
    if (!client) return null;

    try {
        const { data, error } = await client
            .from('duyurular')
            .select('*')
            .order('pinned', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.warn('Supabase veri çekme uyarısı:', error.message);
            return null;
        }

        if (Array.isArray(data)) {
            // Sistem veri kayıtlarını (örn: turnuva fikstürü yedeği) duyuru listesinden hariç tut
            const publicData = data.filter(item => item && (!item.id || !String(item.id).startsWith('system-')) && item.category !== 'system');
            const formatted = publicData.map(item => ({
                id: item.id,
                title: item.title,
                category: item.category || 'genel',
                categoryLabel: item.category_label || getCategoryLabel(item.category || 'genel'),
                date: item.date,
                author: item.author || 'Turnuva Komitesi',
                pinned: Boolean(item.pinned),
                summary: item.summary || (item.content ? item.content.slice(0, 110) + '...' : ''),
                content: item.content || ''
            }));

            // Sabitlenmişleri en üste sırala
            formatted.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
            saveAnnouncements(formatted);
            return formatted;
        }
    } catch (e) {
        console.warn('Supabase senkronizasyon istisnası:', e);
    }
    return null;
}

// Canlı (Realtime) Değişiklikleri Dinle
function initSupabaseRealtime() {
    if (_realtimeSubscribed) return;
    if (typeof getSupabaseClient !== 'function') return;
    const client = getSupabaseClient();
    if (!client) return;

    try {
        client.channel('public:duyurular')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'duyurular' }, (payload) => {
                // Sistem kayıtları için duyuruları tetikleme (bu kayıtlar fikstür modülü tarafından yönetilir)
                if (payload && payload.new && (String(payload.new.id).startsWith('system-') || payload.new.category === 'system')) {
                    return;
                }
                // Herhangi bir duyuru ekleme, düzenleme veya silme olduğunda verileri anında yenile
                syncAnnouncementsFromSupabase();
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    _realtimeSubscribed = true;
                }
            });
    } catch (err) {
        console.warn('Supabase realtime abonelik hatası:', err);
    }
}

// Sayfa Açıldığında Supabase'i Başlat
if (typeof window !== 'undefined') {
    const autoInit = (retries = 15) => {
        if (typeof isSupabaseConfigured === 'function' && isSupabaseConfigured()) {
            const client = (typeof getSupabaseClient === 'function') ? getSupabaseClient() : null;
            if (client) {
                syncAnnouncementsFromSupabase();
                initSupabaseRealtime();
            } else if (retries > 0) {
                setTimeout(() => autoInit(retries - 1), 150);
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => autoInit());
    } else {
        autoInit();
    }
}

// ============================================================
// YARDIMCI VE YÖNETİCİ DOĞRULAMA FONKSİYONLARI
// ============================================================

// Kategori Etiketi
function getCategoryLabel(cat) {
    switch (cat) {
        case 'onemli': return '🚨 Önemli Duyuru';
        case 'mac': return '⚽ Maç Bilgisi';
        case 'kural': return '📜 Kural & Disiplin';
        case 'genel': return '📢 Genel Bilgilendirme';
        default: return '📌 Duyuru';
    }
}

// Tarih Formatlayıcı
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

// Yönetici Doğrulama Fonksiyonları (security.js modülüne entegre)
function isAdminAuthenticated() {
    if (typeof window !== 'undefined' && window.TurnuvaAuth && typeof window.TurnuvaAuth.isAuthenticated === 'function') {
        return window.TurnuvaAuth.isAuthenticated();
    }
    try {
        return sessionStorage.getItem('turnuva_admin_authenticated') === 'true' ||
               localStorage.getItem('turnuva_admin_authenticated') === 'true' ||
               sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
    } catch (e) {
        return false;
    }
}

function authenticateAdmin(pin) {
    if (typeof window !== 'undefined' && window.TurnuvaAuth && typeof window.TurnuvaAuth.authenticate === 'function') {
        return window.TurnuvaAuth.authenticate(pin);
    }
    const clean = String(pin || '').trim();
    if (clean === '1931' || clean === '1234') {
        try {
            sessionStorage.setItem('turnuva_admin_authenticated', 'true');
            localStorage.setItem('turnuva_admin_authenticated', 'true');
        } catch (e) { }
        return true;
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

// Veriyi Dışa Aktar (JSON string olarak)
function exportAnnouncementsJSON() {
    const list = getAnnouncements();
    return JSON.stringify(list, null, 4);
}
