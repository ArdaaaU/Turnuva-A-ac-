/**
 * Turnuva Duyuruları Modülü (duyurular.js)
 * Hem duyurular.html hem de index.html tarafından ortak kullanılan veri ve yönetim katmanı.
 * Supabase (PostgreSQL) entegrasyonu ve yerel önbellek senkronizasyonunu destekler.
 */

// Varsayılan Turnuva Duyuruları
const DEFAULT_ANNOUNCEMENTS = [
    {
        id: "d-1",
        title: "🏆 Turnuva 2026 Resmen Başladı! Grup Maçları Takvimi Açıklandı",
        category: "onemli",
        categoryLabel: "🚨 Önemli Duyuru",
        date: "11 Mart 2026",
        author: "Turnuva Komitesi",
        pinned: true,
        summary: "2026 Futbol Turnuvamız tüm heyecanıyla start aldı! A ve B gruplarındaki tüm takımlara başarılar dileriz.",
        content: "2026 Futbol Turnuvamız tüm coşkusuyla başladı! A ve B grubunda mücadele eden tüm takımlarımıza ve sporcularımıza başarılar diliyoruz. \n\nMaç fikstürü, saatleri ve canlı puan durumu sitemizin 'Ağaç & Fikstür' sekmesinde güncel olarak paylaşılmaktadır. Tüm takımlarımızın fair-play çerçevesinde centilmence mücadele etmesini temenni ederiz."
    },
    {
        id: "d-2",
        title: "⚽ Grup Aşaması Maç Saatleri ve Saha Kuralları",
        category: "mac",
        categoryLabel: "⚽ Maç Bilgisi",
        date: "11 Mart 2026",
        author: "Turnuva Komitesi",
        pinned: false,
        summary: "Grup maçları saat 17:00'da başlayacaktır. Takımların en az 20 dakika önce sahada hazır bulunması gerekmektedir.",
        content: "Grup aşaması maçları belirlenen günlerde saat 17:00'da başlayacaktır. Maçların aksamaması adına takımların maç saatinden en az 20 dakika önce esame listeleriyle birlikte saha kenarında hazır bulunmaları zorunludur.\n\nMaç süreleri 2 x 25 dakika olarak oynanacak olup, devre arası 5 dakikadır."
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
        title: "📊 Canlı İstatistikler ve Gol Krallığı Yayında",
        category: "genel",
        categoryLabel: "📢 Genel Bilgilendirme",
        date: "9 Mart 2026",
        author: "Yönetim",
        pinned: false,
        summary: "Gol krallığı, sarı ve kırmızı kart istatistiklerini artık 'İstatistikler' sayfamızdan takip edebilirsiniz.",
        content: "Turnuva boyunca oyuncuların bireysel performanslarını, en çok gol atan isimleri ve kart raporlarını sitemizin üst menüsünde bulunan 'İstatistikler' sayfasından anlık olarak inceleyebilirsiniz. Her maç sonunda istatistikler güncellenmektedir."
    }
];

const STORAGE_KEY = 'turnuva_duyurular_v1';
const ADMIN_PIN_KEY = 'turnuva_admin_pin';
const ADMIN_AUTH_KEY = 'turnuva_admin_authenticated';
const DEFAULT_PIN = '3519';

let _realtimeSubscribed = false;

// Duyuruları Getir (Hızlı render için önbelleği döndürür)
function getAnnouncements() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('LocalStorage okunamadı, varsayılan veriler kullanılıyor:', e);
    }
    // Sadece localStorage'da hiç kayıt yoksa varsayılanları kaydet
    saveAnnouncements(DEFAULT_ANNOUNCEMENTS);
    return DEFAULT_ANNOUNCEMENTS;
}

// Duyuruları Kaydet (Önbelleğe yazar ve olay tetikler)
function saveAnnouncements(list) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        // Sayfa içi ve sekmeler arası anlık senkronizasyon tetikle
        try {
            window.dispatchEvent(new CustomEvent('turnuva_announcements_updated', { detail: { list } }));
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
    const list = getAnnouncements();
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
            const formatted = data.map(item => ({
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
                // Herhangi bir ekleme, düzenleme veya silme olduğunda verileri anında yenile
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

// Yönetici Doğrulama Fonksiyonları
function getAdminPIN() {
    const savedPin = localStorage.getItem(ADMIN_PIN_KEY);
    if (!savedPin || savedPin === '1234') {
        localStorage.setItem(ADMIN_PIN_KEY, DEFAULT_PIN);
        return DEFAULT_PIN;
    }
    return savedPin;
}

function setAdminPIN(newPin) {
    if (newPin && newPin.trim().length >= 4) {
        localStorage.setItem(ADMIN_PIN_KEY, newPin.trim());
        return true;
    }
    return false;
}

function isAdminAuthenticated() {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
}

function authenticateAdmin(pin) {
    const currentPin = getAdminPIN();
    if (pin === currentPin) {
        sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
        return true;
    }
    return false;
}

function logoutAdmin() {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
}

// Veriyi Dışa Aktar (JSON string olarak)
function exportAnnouncementsJSON() {
    const list = getAnnouncements();
    return JSON.stringify(list, null, 4);
}
