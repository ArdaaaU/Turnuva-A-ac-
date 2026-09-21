-- ============================================================
-- TURNUVA AĞACI DUYURULAR TABLOSU VE İZİNLERİ (SUPABASE SQL)
-- ============================================================
-- Bu kodu Supabase panelinizde sol menüdeki "SQL Editor" kısmına
-- yapıştırıp sağ alttaki "Run" (veya Ctrl+Enter) butonuna basarak çalıştırınız.

-- 1. Duyurular Tablosunu Oluştur
CREATE TABLE IF NOT EXISTS public.duyurular (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'genel',
    category_label TEXT NOT NULL DEFAULT '📢 Genel Bilgilendirme',
    date TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT 'Turnuva Komitesi',
    pinned BOOLEAN NOT NULL DEFAULT FALSE,
    summary TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Güvenlik ve İzinler (Row Level Security - RLS)
ALTER TABLE public.duyurular ENABLE ROW LEVEL SECURITY;

-- Ziyaretçilerin duyuruları okuma izni
DROP POLICY IF EXISTS "Herkes duyuruları okuyabilir" ON public.duyurular;
CREATE POLICY "Herkes duyuruları okuyabilir" 
ON public.duyurular FOR SELECT 
USING (true);

-- Duyuru ekleme izni
DROP POLICY IF EXISTS "Duyuru ekleme izni" ON public.duyurular;
CREATE POLICY "Duyuru ekleme izni" 
ON public.duyurular FOR INSERT 
WITH CHECK (true);

-- Duyuru güncelleme izni
DROP POLICY IF EXISTS "Duyuru güncelleme izni" ON public.duyurular;
CREATE POLICY "Duyuru güncelleme izni" 
ON public.duyurular FOR UPDATE 
USING (true);

-- Duyuru silme izni
DROP POLICY IF EXISTS "Duyuru silme izni" ON public.duyurular;
CREATE POLICY "Duyuru silme izni" 
ON public.duyurular FOR DELETE 
USING (true);

-- 3. Canlı (Realtime) Bildirimleri Aktif Et
-- Supabase veritabanında bir duyuru silindiğinde veya eklendiğinde
-- sitedeki tüm kullanıcıların ekranının anında güncellenmesi için:
ALTER PUBLICATION supabase_realtime ADD TABLE public.duyurular;

-- 4. Başlangıç Varsayılan Duyuruları Ekle (Tablo boşsa)
INSERT INTO public.duyurular (id, title, category, category_label, date, author, pinned, summary, content)
VALUES 
(
    'd-1',
    '🏆 Turnuva 2026 Resmen Başladı! Grup Maçları Takvimi Açıklandı',
    'onemli',
    '🚨 Önemli Duyuru',
    '11 Mart 2026',
    'Turnuva Komitesi',
    TRUE,
    '2026 Futbol Turnuvamız tüm heyecanıyla start aldı! A ve B gruplarındaki tüm takımlara başarılar dileriz.',
    '2026 Futbol Turnuvamız tüm coşkusuyla başladı! A ve B grubunda mücadele eden tüm takımlarımıza ve sporcularımıza başarılar diliyoruz. \n\nMaç fikstürü, saatleri ve canlı puan durumu sitemizin ''Ağaç & Fikstür'' sekmesinde güncel olarak paylaşılmaktadır. Tüm takımlarımızın fair-play çerçevesinde centilmence mücadele etmesini temenni ederiz.'
),
(
    'd-2',
    '⚽ Grup Aşaması Maç Saatleri ve Saha Kuralları',
    'mac',
    '⚽ Maç Bilgisi',
    '11 Mart 2026',
    'Turnuva Komitesi',
    FALSE,
    'Grup maçları saat 17:00''da başlayacaktır. Takımların en az 20 dakika önce sahada hazır bulunması gerekmektedir.',
    'Grup aşaması maçları belirlenen günlerde saat 17:00''da başlayacaktır. Maçların aksamaması adına takımların maç saatinden en az 20 dakika önce esame listeleriyle birlikte saha kenarında hazır bulunmaları zorunludur.\n\nMaç süreleri 2 x 25 dakika olarak oynanacak olup, devre arası 5 dakikadır.'
),
(
    'd-3',
    '📜 Kart Cezaları ve Disiplin Talimatı',
    'kural',
    '📜 Kural & Disiplin',
    '10 Mart 2026',
    'Hakem Kurulu',
    FALSE,
    'Sarı kart ve kırmızı kart uygulamaları ile disiplin kuralları belirlenmiştir.',
    'Turnuvamızda disiplin ve centilmenlik ön plandadır.\n• Aynı maçta 2 sarı karttan kırmızı kart gören oyuncu takip eden ilk resmi maçta forma giyemez.\n• Doğrudan kırmızı kart durumunda hakem raporuna göre en az 2 maç men cezası uygulanır.\n• Turnuva genelinde 3 sarı karta ulaşan oyuncu bir sonraki maçta cezalı duruma düşer.'
),
(
    'd-4',
    '📊 Canlı İstatistikler ve Gol Krallığı Yayında',
    'genel',
    '📢 Genel Bilgilendirme',
    '9 Mart 2026',
    'Yönetim',
    FALSE,
    'Gol krallığı, sarı ve kırmızı kart istatistiklerini artık ''İstatistikler'' sayfamızdan takip edebilirsiniz.',
    'Turnuva boyunca oyuncuların bireysel performanslarını, en çok gol atan isimleri ve kart raporlarını sitemizin üst menüsünde bulunan ''İstatistikler'' sayfasından anlık olarak inceleyebilirsiniz. Her maç sonunda istatistikler güncellenmektedir.'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. TURNUVA AĞACI VE FİKSTÜR TABLOSU (AĞAÇ & FİKSTÜR İÇİN)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.turnuva_fikstur (
    id TEXT PRIMARY KEY DEFAULT 'main',
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Güvenlik Politikaları
ALTER TABLE public.turnuva_fikstur ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Herkes fikstürü okuyabilir" ON public.turnuva_fikstur;
CREATE POLICY "Herkes fikstürü okuyabilir" 
ON public.turnuva_fikstur FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Fikstür ekleme izni" ON public.turnuva_fikstur;
CREATE POLICY "Fikstür ekleme izni" 
ON public.turnuva_fikstur FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Fikstür güncelleme izni" ON public.turnuva_fikstur;
CREATE POLICY "Fikstür güncelleme izni" 
ON public.turnuva_fikstur FOR UPDATE 
USING (true);

-- Realtime Dinleme
ALTER PUBLICATION supabase_realtime ADD TABLE public.turnuva_fikstur;

