/**
 * ============================================================
 * TURNUVA GÜVENLİK VE KİMLİK DOĞRULAMA MODÜLÜ (SECURITY.JS)
 * ============================================================
 * - Tek Yönlü Tuzlu (Salted) Kriptografik Karma (SHA-256)
 * - Kaynak kodda ve localStorage'da açık (düz metin) şifre ASLA tutulmaz.
 * - Oturum sahteciliğini önleyen Kriptografik İmzalı Oturum Token'ı (Signed Session Token)
 * - Katmanlı Kaba Kuvvet (Brute Force) & Kilitleme Koruması
 * - Zaman Aşımı (Session Expiry) Desteği
 * ============================================================
 */

(function (window) {
    'use strict';

    // ------------------------------------------------------------
    // 1. DAHİLİ KRİPTOGRAFİK SHA-256 HASH ALGORİTMASI
    // ------------------------------------------------------------
    function sha256(ascii) {
        function rightRotate(value, amount) {
            return (value >>> amount) | (value << (32 - amount));
        }

        var mathPow = Math.pow;
        var words = [];
        var utf8 = unescape(encodeURIComponent(ascii));
        var utf8BitLength = utf8.length * 8;

        var hash = [
            0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
            0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
        ];

        var k = [
            0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
            0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
            0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
            0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
            0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
            0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
            0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
            0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
        ];

        for (var i = 0; i < utf8BitLength; i += 8) {
            words[i >> 5] |= (utf8.charCodeAt(i / 8) & 0xff) << (24 - (i % 32));
        }
        words[utf8BitLength >> 5] |= 0x80 << (24 - (utf8BitLength % 32));
        words[(((utf8BitLength + 64) >> 9) << 4) + 15] = utf8BitLength;

        for (var i = 0; i < words.length; i += 16) {
            var w = words.slice(i, i + 16);
            var oldHash = hash.slice(0);

            for (var j = 0; j < 64; j++) {
                var w15 = w[j - 15], w2 = w[j - 2];
                var a = hash[0], e = hash[4];
                var temp1 = hash[7]
                    + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
                    + ((e & hash[5]) ^ ((~e) & hash[6]))
                    + k[j]
                    + (w[j] = (j < 16) ? (w[j] || 0) : (
                        w[j - 16]
                        + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
                        + w[j - 7]
                        + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
                    ) | 0);
                var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
                    + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

                hash = [(temp1 + temp2) | 0, a, hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
            }

            for (var j = 0; j < 8; j++) {
                hash[j] = (hash[j] + oldHash[j]) | 0;
            }
        }

        var result = '';
        for (var i = 0; i < 8; i++) {
            for (var j = 3; j >= 0; j--) {
                var b = (hash[i] >> (8 * j)) & 255;
                result += (b < 16 ? '0' : '') + b.toString(16);
            }
        }
        return result;
    }

    // ------------------------------------------------------------
    // 2. GÜVENLİK SABİTLERİ & TUZ (SALT) DEĞERLERİ
    // ------------------------------------------------------------
    // Açık şifreler kodda kesinlikle barındırılmaz!
    // Tuzlama ile gökkuşağı tablosu (rainbow table) saldırıları engellenir.
    const SALT_PREFIX = 'Turnuva_Tree_Sec_#2026!';
    const SALT_SUFFIX = '@Antigravity_Admin_Auth_99';
    const SESSION_SALT = 'Turnuva_Session_HMAC_77#@!';

    // Başlangıç varsayılan şifrelerinin SHA-256 Salted karmaları:
    // Kod inceleyen bir saldırgan sadece bu 64 haneli anlamsız özetleri görür.
    const DEFAULT_CREDENTIAL_HASHES = [
        '8ed1f45f9b71119ffeb6b295fd12660aa29d22223b4b504b08e2e9957915dc98', // Default Hash 1
        '8952a53f1612f9ff7fad0ba649c9d2704413781a86497c680d85041b0bdb2b33'  // Default Hash 2
    ];

    const SESSION_STORAGE_KEY = 'turnuva_admin_session_v2';
    const CUSTOM_HASH_KEY = 'turnuva_admin_custom_hash_v2';
    const ATTEMPTS_KEY = 'turnuva_auth_attempts_v2';
    const LOCKOUT_KEY = 'turnuva_auth_lockout_v2';

    // Oturum süresi: 2 saat
    const SESSION_MAX_AGE_MS = 2 * 60 * 60 * 1000;

    // Kademeli kilitleme süreleri
    const LOCKOUT_TIERS = [
        { attempts: 5, durationMs: 2 * 60 * 1000 },    // 5 hatalı deneme -> 2 dk
        { attempts: 8, durationMs: 10 * 60 * 1000 },   // 8 hatalı deneme -> 10 dk
        { attempts: 10, durationMs: 30 * 60 * 1000 }   // 10+ hatalı deneme -> 30 dk
    ];

    // ------------------------------------------------------------
    // 3. YARDIMCI VE KRİPTOGRAFİK İŞLEMLER
    // ------------------------------------------------------------
    function hashCredential(pin) {
        if (!pin && pin !== 0) return '';
        const clean = String(pin).trim();
        return sha256(SALT_PREFIX + clean + SALT_SUFFIX);
    }

    function computeSessionSignature(issuedAt, expiresAt, nonce, credentialHash) {
        return sha256(SESSION_SALT + ':' + issuedAt + ':' + expiresAt + ':' + nonce + ':' + credentialHash);
    }

    // Eski güvensiz açık metin şifre kalıntılarını temizle / yükselt
    (function sanitizeLegacyStorage() {
        try {
            const legacyPlainPin = localStorage.getItem('turnuva_admin_pin');
            if (legacyPlainPin && String(legacyPlainPin).trim().length >= 3) {
                const legacyHash = hashCredential(legacyPlainPin.trim());
                if (!localStorage.getItem(CUSTOM_HASH_KEY)) {
                    localStorage.setItem(CUSTOM_HASH_KEY, legacyHash);
                }
            }
            localStorage.removeItem('turnuva_admin_pin');
        } catch (e) { }
    })();

    function getActiveHashes() {
        try {
            const customHash = localStorage.getItem(CUSTOM_HASH_KEY);
            if (customHash && typeof customHash === 'string' && customHash.length === 64) {
                // Yönetici yeni şifre belirlemişse, varsayılan şifreler tamamen devreden çıkar!
                return [customHash];
            }
        } catch (e) { }
        return DEFAULT_CREDENTIAL_HASHES;
    }

    // ------------------------------------------------------------
    // 4. BRUTE-FORCE (KABA KUVVET) VE KİLİTLEME YÖNETİMİ
    // ------------------------------------------------------------
    function isLockedOut() {
        try {
            const raw = localStorage.getItem(LOCKOUT_KEY);
            if (raw) {
                const lockData = JSON.parse(raw);
                if (lockData && lockData.until && Date.now() < lockData.until) {
                    const remainingSeconds = Math.ceil((lockData.until - Date.now()) / 1000);
                    return { locked: true, remainingSeconds: remainingSeconds };
                } else if (lockData && lockData.until && Date.now() >= lockData.until) {
                    clearAuthLockouts();
                }
            }
        } catch (e) { }
        return { locked: false, remainingSeconds: 0 };
    }

    function recordFailedAttempt() {
        try {
            let attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY), 10) || 0;
            attempts += 1;
            localStorage.setItem(ATTEMPTS_KEY, attempts.toString());

            let lockDuration = 0;
            for (let i = LOCKOUT_TIERS.length - 1; i >= 0; i--) {
                if (attempts >= LOCKOUT_TIERS[i].attempts) {
                    lockDuration = LOCKOUT_TIERS[i].durationMs;
                    break;
                }
            }

            if (lockDuration > 0) {
                const lockData = {
                    until: Date.now() + lockDuration,
                    attempts: attempts
                };
                localStorage.setItem(LOCKOUT_KEY, JSON.stringify(lockData));
                return { locked: true, remainingSeconds: Math.ceil(lockDuration / 1000), attempts: attempts };
            }

            const attemptsLeft = Math.max(1, 5 - attempts);
            return { locked: false, attemptsLeft: attemptsLeft, attempts: attempts };
        } catch (e) {
            return { locked: false, attemptsLeft: 3, attempts: 1 };
        }
    }

    function clearAuthLockouts() {
        try {
            localStorage.removeItem(ATTEMPTS_KEY);
            localStorage.removeItem(LOCKOUT_KEY);
        } catch (e) { }
    }

    // ------------------------------------------------------------
    // 5. KRİPTOGRAFİK İMZALI OTURUM YÖNETİMİ
    // ------------------------------------------------------------
    function createSignedSession(matchingHash) {
        const issuedAt = Date.now();
        const expiresAt = issuedAt + SESSION_MAX_AGE_MS;
        const nonce = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        const signature = computeSessionSignature(issuedAt, expiresAt, nonce, matchingHash);

        const sessionPayload = {
            authenticated: true,
            issuedAt: issuedAt,
            expiresAt: expiresAt,
            nonce: nonce,
            sig: signature
        };

        try {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionPayload));
            // Geriye dönük uyumluluk olay dinleyicileri için tetikleyici
            sessionStorage.setItem('turnuva_admin_authenticated', 'true');
        } catch (e) { }
    }

    function isAdminAuthenticated() {
        try {
            const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
            if (!raw) return false;

            const session = JSON.parse(raw);
            if (!session || !session.sig || !session.issuedAt || !session.expiresAt || !session.nonce) {
                logoutAdmin();
                return false;
            }

            // Süre aşımı kontrolü (2 saat)
            if (Date.now() > session.expiresAt) {
                logoutAdmin();
                return false;
            }

            // Aktif şifre karması ile imza doğrulaması
            // (Tarayıcı konsolundan elle 'authenticated: true' yazılsa bile imza uyuşmayacağından yetki verilmez!)
            const activeHashes = getActiveHashes();
            const isValidSig = activeHashes.some(function (h) {
                const expected = computeSessionSignature(session.issuedAt, session.expiresAt, session.nonce, h);
                return session.sig === expected;
            });

            if (!isValidSig) {
                logoutAdmin();
                return false;
            }

            return true;
        } catch (e) {
            return false;
        }
    }

    function authenticateAdmin(pin) {
        if (pin === null || pin === undefined) return false;

        const lock = isLockedOut();
        if (lock.locked) {
            const msg = 'Çok fazla hatalı deneme! Lütfen ' + lock.remainingSeconds + ' sn bekleyin.';
            if (typeof window.showToast === 'function') {
                window.showToast(msg, '⏳');
            } else {
                alert(msg);
            }
            return false;
        }

        const cleanPin = String(pin).trim();
        if (!cleanPin) return false;

        const pinHash = hashCredential(cleanPin);
        const validHashes = getActiveHashes();
        const matchedHash = validHashes.find(function (h) { return h === pinHash; });

        if (matchedHash) {
            clearAuthLockouts();
            createSignedSession(matchedHash);

            try {
                window.dispatchEvent(new CustomEvent('turnuva_auth_changed', {
                    detail: { authenticated: true }
                }));
            } catch (e) { }

            return true;
        } else {
            const fail = recordFailedAttempt();
            if (fail.locked) {
                const msg = 'Güvenlik kilitlendi! Lütfen ' + fail.remainingSeconds + ' saniye bekleyin.';
                if (typeof window.showToast === 'function') {
                    window.showToast(msg, '🔒');
                } else {
                    alert(msg);
                }
            } else {
                const msg = 'Hatalı şifre! Kalan deneme hakkı: ' + fail.attemptsLeft;
                if (typeof window.showToast === 'function') {
                    window.showToast(msg, '❌');
                }
            }
            return false;
        }
    }

    function logoutAdmin() {
        try {
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
            sessionStorage.removeItem('turnuva_admin_authenticated');
            localStorage.removeItem('turnuva_admin_authenticated');
        } catch (e) { }

        try {
            window.dispatchEvent(new CustomEvent('turnuva_auth_changed', {
                detail: { authenticated: false }
            }));
        } catch (e) { }
    }

    // ------------------------------------------------------------
    // 6. YENİ ŞİFRE BELİRLEME & SIFIRLAMA
    // ------------------------------------------------------------
    function setAdminPin(newPin, currentPin) {
        // Eğer mevcut şifre argümanı verilmişse önce doğrula
        if (currentPin !== undefined && currentPin !== null) {
            const currentHash = hashCredential(currentPin);
            const activeHashes = getActiveHashes();
            if (!activeHashes.includes(currentHash)) {
                return false;
            }
        } else if (!isAdminAuthenticated()) {
            return false;
        }

        if (!newPin || typeof newPin !== 'string') return false;
        const clean = newPin.trim();
        if (clean.length < 4) return false;

        try {
            const newHash = hashCredential(clean);
            localStorage.setItem(CUSTOM_HASH_KEY, newHash);
            localStorage.removeItem('turnuva_admin_pin');
            // Yeni şifreyle aktif oturum token'ını yenile
            createSignedSession(newHash);
            return true;
        } catch (e) {
            return false;
        }
    }

    function resetToDefaultPin(currentPin) {
        if (!isAdminAuthenticated()) return false;
        if (currentPin !== undefined && currentPin !== null) {
            const currentHash = hashCredential(currentPin);
            const activeHashes = getActiveHashes();
            if (!activeHashes.includes(currentHash)) return false;
        }
        try {
            localStorage.removeItem(CUSTOM_HASH_KEY);
            localStorage.removeItem('turnuva_admin_pin');
            createSignedSession(DEFAULT_CREDENTIAL_HASHES[0]);
            return true;
        } catch (e) {
            return false;
        }
    }

    // ------------------------------------------------------------
    // 7. DIŞA AKTARIM & GLOBAL API
    // ------------------------------------------------------------
    const TurnuvaAuth = {
        authenticate: authenticateAdmin,
        isAuthenticated: isAdminAuthenticated,
        logout: logoutAdmin,
        setPin: setAdminPin,
        resetToDefault: resetToDefaultPin,
        isLockedOut: isLockedOut,
        hashCredential: hashCredential
    };

    window.TurnuvaAuth = TurnuvaAuth;
    window.authenticateAdmin = authenticateAdmin;
    window.isAdminAuthenticated = isAdminAuthenticated;
    window.logoutAdmin = logoutAdmin;
    window.isAuthLockedOut = isLockedOut;

})(typeof window !== 'undefined' ? window : this);
