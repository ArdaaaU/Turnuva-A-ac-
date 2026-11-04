CREATE EXTENSION IF NOT EXISTS pgcrypto;

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

ALTER TABLE public.duyurular ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Herkes duyuruları okuyabilir" ON public.duyurular;
CREATE POLICY "Herkes duyuruları okuyabilir" 
ON public.duyurular FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Duyuru ekleme izni" ON public.duyurular;
CREATE POLICY "Duyuru ekleme izni" 
ON public.duyurular FOR INSERT 
WITH CHECK (false);

DROP POLICY IF EXISTS "Duyuru güncelleme izni" ON public.duyurular;
CREATE POLICY "Duyuru güncelleme izni" 
ON public.duyurular FOR UPDATE 
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "Duyuru silme izni" ON public.duyurular;
CREATE POLICY "Duyuru silme izni" 
ON public.duyurular FOR DELETE 
USING (false);

REVOKE INSERT, UPDATE, DELETE ON public.duyurular FROM anon, authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.duyurular;

INSERT INTO public.duyurular (id, title, category, category_label, date, author, pinned, summary, content)
VALUES 
(
    'd-6',
    '👑 2026 Turnuva Şampiyonu HİT-2! Kupa Sahibini Buldu 🏆',
    'mac',
    '🏆 Şampiyonluk & Ödüller',
    '15 Ekim 2026',
    'Turnuva Komitesi',
    TRUE,
    'Büyük Finali kazanan HİT-2 turnuva şampiyonu oldu! Gol Kralı Aykut, En İyi Kaleci ise Gazi oldu.',
    '🏆 2026 Futbol Turnuvamız nefes kesen Büyük Final mücadelesiyle tamamlandı!\n\n👑 BÜYÜK FİNAL SKORU:\n⚡ HİT-2: 6 - 3 WTK-2\n\n🌟 TURNUVA BİREYSEL ÖDÜLLERİ:\n🥇 2026 Turnuva Şampiyonu: HİT-2\n👑 Turnuvanın Gol Kralı: Aykut\n🧤 Turnuvanın En İyi Kalecisi: Gazi\n\nŞampiyon HİT-2 takımını, turnuva boyunca harika bir mücadele sergileyen finalist WTK-2''yi ve turnuvaya emek veren tüm takımlarımızı gönülden tebrik ederiz!'
),
(
    'd-5',
    '🔥 Yarı Final Maçları Tamamlandı! Büyük Final: WTK vs HİT-2',
    'mac',
    '🏆 Yarı Final Sonuçları',
    '13 Ekim 2026',
    'Turnuva Komitesi',
    FALSE,
    '13 Ekim Yarı Finaller: WTK-2 11 - 5 Maliye İşletme, HİT-2 20 - 4 HİT-1. Büyük Finalde WTK-2 ile HİT-2 karşılaşıyor!',
    '🏆 Turnuvamızda yarı final heyecanı nefes kesen maçlarla tamamlandı!\n\n13 Ekim 2026 Salı Yarı Final Karşılaşma Sonuçları:\n\n⚡ WTK-2: 11 - 5 Maliye İşletme -2\n(Goller: Mehmet 6, Ahmethan 3, Serhat 2 | Toprak 3, Burak 1, Emirhan 1)\n\n⚡ HİT-2: 20 - 4 HİT-1\n(Goller: Aykut 11, Mahmut 5, Çakır 2, Gazi 1, Tamer 1 | Davut 3, Can 1)\n\n👑 BÜYÜK FİNAL (15 Ekim Perşembe):\n🔥 WTK-2 🆚 HİT-2\n\nFinale yükselen her iki takımımıza başarılar dileriz!'
),
(
    'd-1',
    '🏆 Turnuva 28 Eylül''de Başlıyor! Ön Eleme Maçları Açıklandı',
    'onemli',
    '🚨 Önemli Duyuru',
    '28 Eylül 2026',
    'Turnuva Komitesi',
    FALSE,
    '28 Eylül Ön Eleme Maçları: 18:00 maliye isletme -2 vs wtk-2, 19:00 hit-1 vs hit-2. ic mekan tasarim-2 kura ile doğrudan yarı finale yükseldi.',
    '2026 Futbol Turnuvamız tüm coşkusuyla başlıyor! Ön Eleme maçları 28 Eylül 2026 tarihinde oynanacaktır:\n\n⚡ 18:00 | maliye isletme -2 vs wtk-2\n⚡ 19:00 | hit-1 vs hit-2\n\n⭐ ic mekan tasarim-2 kura sonucunda 1. Turu bay geçerek doğrudan 29 Eylül''deki Yarı Final''e yükselmiştir.\n\nTüm takımlarımıza ve sporcularımıza centilmence mücadeleler ve başarılar dileriz!'
),
(
    'd-2',
    '⚽ Grup & Eleme Aşaması Maç Saatleri ve Saha Kuralları',
    'mac',
    '⚽ Maç Bilgisi',
    '28 Eylül 2026',
    'Turnuva Komitesi',
    FALSE,
    'Ön eleme maçları saat 18:00 ve 19:00''da oynanacaktır. Takımların en az 20 dakika önce sahada hazır bulunması gerekmektedir.',
    'Turnuvamızın Ön Eleme maçları 28 Eylül''de saat 18:00 ve 19:00''da oynanacaktır. Maçların aksamaması adına takımların maç saatinden en az 20 dakika önce esame listeleriyle birlikte saha kenarında hazır bulunmaları zorunludur.\n\nMaç süreleri 2 x 25 dakika olarak oynanacak olup, devre arası 5 dakikadır.'
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
    '📊 Canlı İstatistikler ve Takım Kadroları Yayında',
    'genel',
    '📢 Genel Bilgilendirme',
    '28 Eylül 2026',
    'Yönetim',
    FALSE,
    'Tüm takımların oyuncu kadrolarını ve detaylı istatistiklerini ''İstatistikler'' sayfamızdan inceleyebilirsiniz.',
    'Turnuvada yer alan tüm 5 takımın oyuncu kadrolarını (hit-2, wtk-2, hit-1, maliye isletme -2, ic mekan tasarim-2), puan durumunu ve gol krallığı tablosunu sitemizin ''İstatistikler'' sayfasından anlık olarak takip edebilirsiniz.'
)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.turnuva_fikstur (
    id TEXT PRIMARY KEY DEFAULT 'main',
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.turnuva_fikstur ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Herkes fikstürü okuyabilir" ON public.turnuva_fikstur;
CREATE POLICY "Herkes fikstürü okuyabilir" 
ON public.turnuva_fikstur FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Fikstür ekleme izni" ON public.turnuva_fikstur;
CREATE POLICY "Fikstür ekleme izni" 
ON public.turnuva_fikstur FOR INSERT 
WITH CHECK (false);

DROP POLICY IF EXISTS "Fikstür güncelleme izni" ON public.turnuva_fikstur;
CREATE POLICY "Fikstür güncelleme izni" 
ON public.turnuva_fikstur FOR UPDATE 
USING (false)
WITH CHECK (false);

REVOKE INSERT, UPDATE, DELETE ON public.turnuva_fikstur FROM anon, authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.turnuva_fikstur;

CREATE TABLE IF NOT EXISTS public.turnuva_istatistik (
    id TEXT PRIMARY KEY DEFAULT 'main',
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.turnuva_istatistik ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Herkes istatistikleri okuyabilir" ON public.turnuva_istatistik;
CREATE POLICY "Herkes istatistikleri okuyabilir" 
ON public.turnuva_istatistik FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "İstatistik ekleme izni" ON public.turnuva_istatistik;
CREATE POLICY "İstatistik ekleme izni" 
ON public.turnuva_istatistik FOR INSERT 
WITH CHECK (false);

DROP POLICY IF EXISTS "İstatistik güncelleme izni" ON public.turnuva_istatistik;
CREATE POLICY "İstatistik güncelleme izni" 
ON public.turnuva_istatistik FOR UPDATE 
USING (false)
WITH CHECK (false);

REVOKE INSERT, UPDATE, DELETE ON public.turnuva_istatistik FROM anon, authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.turnuva_istatistik;

CREATE OR REPLACE FUNCTION public.admin_manage_announcement(
    p_pin TEXT,
    p_action TEXT,
    p_id TEXT,
    p_title TEXT DEFAULT NULL,
    p_category TEXT DEFAULT 'genel',
    p_category_label TEXT DEFAULT '📢 Genel Bilgilendirme',
    p_date TEXT DEFAULT '',
    p_author TEXT DEFAULT 'Turnuva Komitesi',
    p_pinned BOOLEAN DEFAULT FALSE,
    p_summary TEXT DEFAULT '',
    p_content TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_expected_hash TEXT := 'dee8e71a4b7ea0f08fac721680637e04dcc9bbe4e138d9a30288deb123e35763';
    v_computed_hash TEXT;
BEGIN
    IF p_pin IS NULL OR trim(p_pin) = '' THEN
        RAISE EXCEPTION 'Yetkisiz erişim: Şifre girilmedi.';
    END IF;

    v_computed_hash := encode(digest('Turnuva_Tree_Sec_#2026!' || trim(p_pin) || '@Antigravity_Admin_Auth_99', 'sha256'), 'hex');
    
    IF v_computed_hash IS DISTINCT FROM v_expected_hash THEN
        RAISE EXCEPTION 'Yetkisiz erişim: Geçersiz yönetici şifresi.';
    END IF;

    IF p_action = 'insert' THEN
        INSERT INTO public.duyurular (
            id, title, category, category_label, date, author, pinned, summary, content, created_at
        ) VALUES (
            p_id, p_title, p_category, p_category_label, p_date, p_author, p_pinned, p_summary, p_content, now()
        )
        ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            category = EXCLUDED.category,
            category_label = EXCLUDED.category_label,
            date = EXCLUDED.date,
            author = EXCLUDED.author,
            pinned = EXCLUDED.pinned,
            summary = EXCLUDED.summary,
            content = EXCLUDED.content;
            
        RETURN jsonb_build_object('success', true, 'action', 'insert', 'id', p_id);

    ELSIF p_action = 'update' THEN
        UPDATE public.duyurular SET
            title = COALESCE(p_title, title),
            category = COALESCE(p_category, category),
            category_label = COALESCE(p_category_label, category_label),
            date = COALESCE(p_date, date),
            author = COALESCE(p_author, author),
            pinned = COALESCE(p_pinned, pinned),
            summary = COALESCE(p_summary, summary),
            content = COALESCE(p_content, content)
        WHERE id = p_id;
        
        RETURN jsonb_build_object('success', true, 'action', 'update', 'id', p_id);

    ELSIF p_action = 'delete' THEN
        DELETE FROM public.duyurular WHERE id = p_id;
        RETURN jsonb_build_object('success', true, 'action', 'delete', 'id', p_id);

    ELSIF p_action = 'reset_defaults' THEN
        DELETE FROM public.duyurular;
        INSERT INTO public.duyurular (id, title, category, category_label, date, author, pinned, summary, content)
        VALUES 
        (
            'd-6',
            '👑 2026 Turnuva Şampiyonu HİT-2! Kupa Sahibini Buldu 🏆',
            'mac',
            '🏆 Şampiyonluk & Ödüller',
            '15 Ekim 2026',
            'Turnuva Komitesi',
            TRUE,
            'Büyük Finali kazanan HİT-2 turnuva şampiyonu oldu! Gol Kralı Aykut, En İyi Kaleci ise Gazi oldu.',
            '🏆 2026 Futbol Turnuvamız nefes kesen Büyük Final mücadelesiyle tamamlandı!\n\n👑 BÜYÜK FİNAL SKORU:\n⚡ HİT-2: 6 - 3 WTK-2\n\n🌟 TURNUVA BİREYSEL ÖDÜLLERİ:\n🥇 2026 Turnuva Şampiyonu: HİT-2\n👑 Turnuvanın Gol Kralı: Aykut\n🧤 Turnuvanın En İyi Kalecisi: Gazi\n\nŞampiyon HİT-2 takımını, turnuva boyunca harika bir mücadele sergileyen finalist WTK-2''yi ve turnuvaya emek veren tüm takımlarımızı gönülden tebrik ederiz!'
        ),
        (
            'd-5',
            '🔥 Yarı Final Maçları Tamamlandı! Büyük Final: WTK vs HİT-2',
            'mac',
            '🏆 Yarı Final Sonuçları',
            '13 Ekim 2026',
            'Turnuva Komitesi',
            FALSE,
            '13 Ekim Yarı Finaller: WTK-2 11 - 5 Maliye İşletme, HİT-2 20 - 4 HİT-1. Büyük Finalde WTK-2 ile HİT-2 karşılaşıyor!',
            '🏆 Turnuvamızda yarı final heyecanı nefes kesen maçlarla tamamlandı!\n\n13 Ekim 2026 Salı Yarı Final Karşılaşma Sonuçları:\n\n⚡ WTK-2: 11 - 5 Maliye İşletme -2\n(Goller: Mehmet 6, Ahmethan 3, Serhat 2 | Toprak 3, Burak 1, Emirhan 1)\n\n⚡ HİT-2: 20 - 4 HİT-1\n(Goller: Aykut 11, Mahmut 5, Çakır 2, Gazi 1, Tamer 1 | Davut 3, Can 1)\n\n👑 BÜYÜK FİNAL (15 Ekim Perşembe):\n🔥 WTK-2 🆚 HİT-2\n\nFinale yükselen her iki takımımıza başarılar dileriz!'
        ),
        (
            'd-1',
            '🏆 Turnuva 28 Eylül''de Başlıyor! Ön Eleme Maçları Açıklandı',
            'onemli',
            '🚨 Önemli Duyuru',
            '28 Eylül 2026',
            'Turnuva Komitesi',
            FALSE,
            '28 Eylül Ön Eleme Maçları: 18:00 maliye isletme -2 vs wtk-2, 19:00 hit-1 vs hit-2. ic mekan tasarim-2 kura ile doğrudan yarı finale yükseldi.',
            '2026 Futbol Turnuvamız tüm coşkusuyla başlıyor! Ön Eleme maçları 28 Eylül 2026 tarihinde oynanacaktır:\n\n⚡ 18:00 | maliye isletme -2 vs wtk-2\n⚡ 19:00 | hit-1 vs hit-2\n\n⭐ ic mekan tasarim-2 kura sonucunda 1. Turu bay geçerek doğrudan 29 Eylül''deki Yarı Final''e yükselmiştir.\n\nTüm takımlarımıza ve sporcularımıza centilmence mücadeleler ve başarılar dileriz!'
        ),
        (
            'd-2',
            '⚽ Grup & Eleme Aşaması Maç Saatleri ve Saha Kuralları',
            'mac',
            '⚽ Maç Bilgisi',
            '28 Eylül 2026',
            'Turnuva Komitesi',
            FALSE,
            'Ön eleme maçları saat 18:00 ve 19:00''da oynanacaktır. Takımların en az 20 dakika önce sahada hazır bulunması gerekmektedir.',
            'Turnuvamızın Ön Eleme maçları 28 Eylül''de saat 18:00 ve 19:00''da oynanacaktır. Maçların aksamaması adına takımların maç saatinden en az 20 dakika önce esame listeleriyle birlikte saha kenarında hazır bulunmaları zorunludur.\n\nMaç süreleri 2 x 25 dakika olarak oynanacak olup, devre arası 5 dakikadır.'
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
            '📊 Canlı İstatistikler ve Takım Kadroları Yayında',
            'genel',
            '📢 Genel Bilgilendirme',
            '28 Eylül 2026',
            'Yönetim',
            FALSE,
            'Tüm takımların oyuncu kadrolarını ve detaylı istatistiklerini ''İstatistikler'' sayfamızdan inceleyebilirsiniz.',
            'Turnuvada yer alan tüm 5 takımın oyuncu kadrolarını (hit-2, wtk-2, hit-1, maliye isletme -2, ic mekan tasarim-2), puan durumunu ve gol krallığı tablosunu sitemizin ''İstatistikler'' sayfasından anlık olarak takip edebilirsiniz.'
        );
        RETURN jsonb_build_object('success', true, 'action', 'reset_defaults');

    ELSE
        RAISE EXCEPTION 'Geçersiz işlem: %', p_action;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_save_fikstur(
    p_pin TEXT,
    p_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_expected_hash TEXT := 'dee8e71a4b7ea0f08fac721680637e04dcc9bbe4e138d9a30288deb123e35763';
    v_computed_hash TEXT;
BEGIN
    IF p_pin IS NULL OR trim(p_pin) = '' THEN
        RAISE EXCEPTION 'Yetkisiz erişim: Şifre girilmedi.';
    END IF;

    v_computed_hash := encode(digest('Turnuva_Tree_Sec_#2026!' || trim(p_pin) || '@Antigravity_Admin_Auth_99', 'sha256'), 'hex');
    
    IF v_computed_hash IS DISTINCT FROM v_expected_hash THEN
        RAISE EXCEPTION 'Yetkisiz erişim: Geçersiz yönetici şifresi.';
    END IF;

    INSERT INTO public.turnuva_fikstur (id, data, updated_at)
    VALUES ('main', p_data, now())
    ON CONFLICT (id) DO UPDATE SET
        data = EXCLUDED.data,
        updated_at = EXCLUDED.updated_at;

    RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_save_istatistik(
    p_pin TEXT,
    p_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_expected_hash TEXT := 'dee8e71a4b7ea0f08fac721680637e04dcc9bbe4e138d9a30288deb123e35763';
    v_computed_hash TEXT;
BEGIN
    IF p_pin IS NULL OR trim(p_pin) = '' THEN
        RAISE EXCEPTION 'Yetkisiz erişim: Şifre girilmedi.';
    END IF;

    v_computed_hash := encode(digest('Turnuva_Tree_Sec_#2026!' || trim(p_pin) || '@Antigravity_Admin_Auth_99', 'sha256'), 'hex');
    
    IF v_computed_hash IS DISTINCT FROM v_expected_hash THEN
        RAISE EXCEPTION 'Yetkisiz erişim: Geçersiz yönetici şifresi.';
    END IF;

    INSERT INTO public.turnuva_istatistik (id, data, updated_at)
    VALUES ('main', p_data, now())
    ON CONFLICT (id) DO UPDATE SET
        data = EXCLUDED.data,
        updated_at = EXCLUDED.updated_at;

    RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_manage_announcement TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_save_fikstur TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_save_istatistik TO anon, authenticated;
