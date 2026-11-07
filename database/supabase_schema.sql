CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 1. DIŞARIYA KAPALI GÜVENLİK ŞEMASI (API ÜZERİNDEN ERİŞİLEMEZ)
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS private_security;
REVOKE ALL ON SCHEMA private_security FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS private_security.admin_config (
    id TEXT PRIMARY KEY DEFAULT 'master',
    bcrypt_hash TEXT,
    legacy_sha256_hash TEXT NOT NULL DEFAULT 'dee8e71a4b7ea0f08fac721680637e04dcc9bbe4e138d9a30288deb123e35763',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE private_security.admin_config ENABLE ROW LEVEL SECURITY;

INSERT INTO private_security.admin_config (id)
VALUES ('master')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS private_security.admin_auth_guard (
    id TEXT PRIMARY KEY DEFAULT 'global',
    failed_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE private_security.admin_auth_guard ENABLE ROW LEVEL SECURITY;

INSERT INTO private_security.admin_auth_guard (id, failed_attempts, locked_until)
VALUES ('global', 0, NULL)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS private_security.admin_sessions (
    token_hash TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE private_security.admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at
ON private_security.admin_sessions (expires_at);

DROP POLICY IF EXISTS "Private admin_config erişim kapalı" ON private_security.admin_config;
CREATE POLICY "Private admin_config erişim kapalı"
ON private_security.admin_config FOR ALL
TO PUBLIC
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "Private admin_auth_guard erişim kapalı" ON private_security.admin_auth_guard;
CREATE POLICY "Private admin_auth_guard erişim kapalı"
ON private_security.admin_auth_guard FOR ALL
TO PUBLIC
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "Private admin_sessions erişim kapalı" ON private_security.admin_sessions;
CREATE POLICY "Private admin_sessions erişim kapalı"
ON private_security.admin_sessions FOR ALL
TO PUBLIC
USING (false)
WITH CHECK (false);

REVOKE ALL ON ALL TABLES IN SCHEMA private_security FROM PUBLIC, anon, authenticated;

-- ============================================================================
-- 2. GENEL TABLOLAR VE RLS POLİTİKALARI
-- ============================================================================
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
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Duyuru ekleme izni" ON public.duyurular;
CREATE POLICY "Duyuru ekleme izni"
ON public.duyurular FOR INSERT
TO anon, authenticated
WITH CHECK (false);

DROP POLICY IF EXISTS "Duyuru güncelleme izni" ON public.duyurular;
CREATE POLICY "Duyuru güncelleme izni"
ON public.duyurular FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "Duyuru silme izni" ON public.duyurular;
CREATE POLICY "Duyuru silme izni"
ON public.duyurular FOR DELETE
TO anon, authenticated
USING (false);

REVOKE INSERT, UPDATE, DELETE ON public.duyurular FROM anon, authenticated;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.duyurular;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

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
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Fikstür ekleme izni" ON public.turnuva_fikstur;
CREATE POLICY "Fikstür ekleme izni"
ON public.turnuva_fikstur FOR INSERT
TO anon, authenticated
WITH CHECK (false);

DROP POLICY IF EXISTS "Fikstür güncelleme izni" ON public.turnuva_fikstur;
CREATE POLICY "Fikstür güncelleme izni"
ON public.turnuva_fikstur FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "Fikstür silme izni" ON public.turnuva_fikstur;
CREATE POLICY "Fikstür silme izni"
ON public.turnuva_fikstur FOR DELETE
TO anon, authenticated
USING (false);

REVOKE INSERT, UPDATE, DELETE ON public.turnuva_fikstur FROM anon, authenticated;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.turnuva_fikstur;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.turnuva_istatistik (
    id TEXT PRIMARY KEY DEFAULT 'main',
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.turnuva_istatistik ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Herkes istatistikleri okuyabilir" ON public.turnuva_istatistik;
CREATE POLICY "Herkes istatistikleri okuyabilir"
ON public.turnuva_istatistik FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "İstatistik ekleme izni" ON public.turnuva_istatistik;
CREATE POLICY "İstatistik ekleme izni"
ON public.turnuva_istatistik FOR INSERT
TO anon, authenticated
WITH CHECK (false);

DROP POLICY IF EXISTS "İstatistik güncelleme izni" ON public.turnuva_istatistik;
CREATE POLICY "İstatistik güncelleme izni"
ON public.turnuva_istatistik FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "İstatistik silme izni" ON public.turnuva_istatistik;
CREATE POLICY "İstatistik silme izni"
ON public.turnuva_istatistik FOR DELETE
TO anon, authenticated
USING (false);

REVOKE INSERT, UPDATE, DELETE ON public.turnuva_istatistik FROM anon, authenticated;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.turnuva_istatistik;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 3. İÇ DOĞRULAMA YARDIMCI FONKSİYONU (PRIVATE SCHEMA)
-- ============================================================================
CREATE OR REPLACE FUNCTION private_security.assert_admin_secret_or_token(
    p_secret TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private_security, public, extensions
AS $$
DECLARE
    v_clean TEXT;
    v_token_hash TEXT;
    v_guard private_security.admin_auth_guard%ROWTYPE;
    v_cfg private_security.admin_config%ROWTYPE;
    v_legacy_calc TEXT;
    v_is_valid BOOLEAN := FALSE;
BEGIN
    v_clean := trim(COALESCE(p_secret, ''));
    IF v_clean = '' THEN
        RETURN FALSE;
    END IF;

    -- Süresi dolmuş oturumları temizle
    DELETE FROM private_security.admin_sessions WHERE expires_at <= now();

    -- 1) Önce aktif bir oturum token'ı olup olmadığını kontrol et
    v_token_hash := encode(digest(v_clean, 'sha256'), 'hex');
    IF EXISTS (
        SELECT 1 FROM private_security.admin_sessions
        WHERE token_hash = v_token_hash AND expires_at > now()
    ) THEN
        RETURN TRUE;
    END IF;

    -- 2) Token değilse PIN doğrulaması: önce brute-force kilidini kontrol et
    SELECT * INTO v_guard FROM private_security.admin_auth_guard WHERE id = 'global' FOR UPDATE;
    IF v_guard.locked_until IS NOT NULL AND v_guard.locked_until > now() THEN
        RETURN FALSE;
    END IF;

    SELECT * INTO v_cfg FROM private_security.admin_config WHERE id = 'master';

    IF v_cfg.bcrypt_hash IS NOT NULL THEN
        v_is_valid := (crypt(v_clean, v_cfg.bcrypt_hash) = v_cfg.bcrypt_hash);
    ELSE
        v_legacy_calc := encode(digest('Turnuva_Tree_Sec_#2026!' || v_clean || '@Antigravity_Admin_Auth_99', 'sha256'), 'hex');
        IF v_legacy_calc = v_cfg.legacy_sha256_hash THEN
            v_is_valid := TRUE;
            -- İlk başarılı girişte şifreyi otomatik olarak bcrypt'e yükselt
            UPDATE private_security.admin_config
            SET bcrypt_hash = crypt(v_clean, gen_salt('bf', 10)),
                updated_at = now()
            WHERE id = 'master';
        END IF;
    END IF;

    IF v_is_valid THEN
        UPDATE private_security.admin_auth_guard
        SET failed_attempts = 0, locked_until = NULL, updated_at = now()
        WHERE id = 'global';
        RETURN TRUE;
    ELSE
        UPDATE private_security.admin_auth_guard
        SET failed_attempts = CASE
                WHEN locked_until IS NOT NULL AND locked_until <= now() THEN 1
                ELSE failed_attempts + 1
            END,
            locked_until = CASE
                WHEN (CASE WHEN locked_until IS NOT NULL AND locked_until <= now() THEN 1 ELSE failed_attempts + 1 END) >= 5
                THEN now() + interval '5 minutes'
                ELSE NULL
            END,
            updated_at = now()
        WHERE id = 'global';
        RETURN FALSE;
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION private_security.assert_admin_secret_or_token(TEXT) FROM PUBLIC, anon, authenticated;

-- ============================================================================
-- 4. RPC FONKSİYONLARI
-- ============================================================================
CREATE OR REPLACE FUNCTION public.verify_admin_pin(
    p_pin TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private_security, public, extensions
AS $$
DECLARE
    v_guard private_security.admin_auth_guard%ROWTYPE;
    v_raw_token TEXT;
    v_token_hash TEXT;
    v_expires_at TIMESTAMPTZ;
BEGIN
    SELECT * INTO v_guard FROM private_security.admin_auth_guard WHERE id = 'global';
    IF v_guard.locked_until IS NOT NULL AND v_guard.locked_until > now() THEN
        RETURN jsonb_build_object(
            'valid', false,
            'locked', true,
            'error', 'Çok fazla hatalı deneme yapıldı. Lütfen 5 dakika bekleyiniz.'
        );
    END IF;

    IF NOT private_security.assert_admin_secret_or_token(p_pin) THEN
        SELECT * INTO v_guard FROM private_security.admin_auth_guard WHERE id = 'global';
        IF v_guard.locked_until IS NOT NULL AND v_guard.locked_until > now() THEN
            RETURN jsonb_build_object(
                'valid', false,
                'locked', true,
                'error', 'Çok fazla hatalı deneme yapıldı. Giriş 5 dakika kilitlendi.'
            );
        END IF;
        RETURN jsonb_build_object('valid', false, 'error', 'Hatalı yönetici şifresi.');
    END IF;

    v_raw_token := encode(gen_random_bytes(32), 'hex');
    v_token_hash := encode(digest(v_raw_token, 'sha256'), 'hex');
    v_expires_at := now() + interval '2 hours';

    INSERT INTO private_security.admin_sessions (token_hash, created_at, expires_at)
    VALUES (v_token_hash, now(), v_expires_at);

    RETURN jsonb_build_object(
        'valid', true,
        'token', v_raw_token,
        'expiresAt', floor(extract(epoch from v_expires_at) * 1000)
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.logout_admin_session(
    p_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private_security, public, extensions
AS $$
DECLARE
    v_token_hash TEXT;
BEGIN
    IF p_token IS NOT NULL AND trim(p_token) <> '' THEN
        v_token_hash := encode(digest(trim(p_token), 'sha256'), 'hex');
        DELETE FROM private_security.admin_sessions WHERE token_hash = v_token_hash;
    END IF;
    RETURN jsonb_build_object('success', true);
END;
$$;

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
SET search_path = private_security, public, extensions
AS $$
BEGIN
    IF NOT private_security.assert_admin_secret_or_token(p_pin) THEN
        RAISE EXCEPTION 'Yetkisiz erişim: Geçersiz veya süresi dolmuş yönetici oturumu.';
    END IF;

    IF p_id IS NULL OR length(p_id) > 64 THEN
        RAISE EXCEPTION 'Geçersiz duyuru kimliği (id).';
    END IF;

    IF (p_title IS NOT NULL AND length(p_title) > 500) OR
       (p_content IS NOT NULL AND length(p_content) > 50000) OR
       (p_summary IS NOT NULL AND length(p_summary) > 2000) THEN
        RAISE EXCEPTION 'Veri uzunluğu izin verilen sınırları aşıyor.';
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
SET search_path = private_security, public, extensions
AS $$
BEGIN
    IF NOT private_security.assert_admin_secret_or_token(p_pin) THEN
        RAISE EXCEPTION 'Yetkisiz erişim: Geçersiz veya süresi dolmuş yönetici oturumu.';
    END IF;

    IF p_data IS NULL OR jsonb_typeof(p_data) <> 'object' OR pg_column_size(p_data) > 300000 THEN
        RAISE EXCEPTION 'Geçersiz veri formatı veya payload boyutu çok yüksek (maks 300KB).';
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
SET search_path = private_security, public, extensions
AS $$
BEGIN
    IF NOT private_security.assert_admin_secret_or_token(p_pin) THEN
        RAISE EXCEPTION 'Yetkisiz erişim: Geçersiz veya süresi dolmuş yönetici oturumu.';
    END IF;

    IF p_data IS NULL OR jsonb_typeof(p_data) <> 'object' OR pg_column_size(p_data) > 300000 THEN
        RAISE EXCEPTION 'Geçersiz veri formatı veya payload boyutu çok yüksek (maks 300KB).';
    END IF;

    INSERT INTO public.turnuva_istatistik (id, data, updated_at)
    VALUES ('main', p_data, now())
    ON CONFLICT (id) DO UPDATE SET
        data = EXCLUDED.data,
        updated_at = EXCLUDED.updated_at;

    RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION public.verify_admin_pin(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.logout_admin_session(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_manage_announcement(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_save_fikstur(TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_save_istatistik(TEXT, JSONB) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.verify_admin_pin(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.logout_admin_session(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_manage_announcement(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_save_fikstur(TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_save_istatistik(TEXT, JSONB) TO anon, authenticated;
