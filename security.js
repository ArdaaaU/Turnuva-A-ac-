/**
 * Turnuva Güvenlik & Yetkilendirme Modülü (security.js)
 * ----------------------------------------------------
 * 1. Şifre kod tabanında ASLA açık metin (plaintext) olarak TUTULMAZ.
 * 2. Kriptografik Tuzlanmış (Salted) SHA-256 Hash doğrulaması kullanılır.
 * 3. LocalStorage'da şifre saklanması engellenir, eski güvensiz PIN kayıtları otomatik imha edilir.
 * 4. Kaba Kuvvet (Brute-Force) Koruması: 5 hatalı denemeden sonra sistem 5 dakika kilitlenir.
 * 5. Oturum sadece tarayıcı sekmesi boyunca (sessionStorage) geçerlidir.
 */

(function (window) {
    'use strict';

    // Güvenlik Parametreleri (Şifre ASLA burada yazmaz, sadece kriptografik tuz ve hash bulunur)
    const AUTH_SALT = 'TurnuvaTree_SecKey_2026_@Utancak!';
    const AUTH_EXPECTED_HASH = '5863a1773554474f2d3a767e34b7166ade621d443235b7cb6af57821da66a41c';
    
    const AUTH_SESSION_KEY = 'turnuva_admin_authenticated';
    const ATTEMPTS_KEY = 'turnuva_auth_attempts';
    const LOCKOUT_KEY = 'turnuva_auth_lockout_until';
    const MAX_FAILED_ATTEMPTS = 5;
    const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 dakika

    // Eski güvensiz açık metin şifre kalıntılarını LocalStorage'dan tamamen temizle
    try {
        localStorage.removeItem('turnuva_admin_pin');
        localStorage.removeItem('turnuva_stats_admin_pin');
    } catch (e) {
        // LocalStorage erişim engeli varsa yoksay
    }

    /**
     * Hızlı Senkron SHA-256 Hash Fonksiyonu (Standart FIPS 180-4)
     */
    function computeSHA256Sync(ascii) {
        function rightRotate(value, amount) {
            return (value >>> amount) | (value << (32 - amount));
        }

        const mathPow = Math.pow;
        const maxWord = mathPow(2, 32);
        let lengthProperty = 'length';
        let i, j;
        let result = '';
        const words = [];
        const asciiBitLength = ascii[lengthProperty] * 8;
        let hash = [
            0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
            0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
        ];
        const k = [
            0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
            0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
            0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
            0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
            0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
            0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
            0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
            0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
        ];

        let composite = unescape(encodeURIComponent(ascii));
        for (i = 0; i < composite[lengthProperty]; i++) {
            const charCode = composite.charCodeAt(i);
            words[i >> 2] |= charCode << ((3 - i % 4) * 8);
        }
        words[composite[lengthProperty] >> 2] |= 0x80 << ((3 - composite[lengthProperty] % 4) * 8);
        words[(((composite[lengthProperty] + 8) >> 6) + 1) * 16 - 1] = composite[lengthProperty] * 8;

        for (j = 0; j < words[lengthProperty];) {
            const w = words.slice(j, j += 16);
            const oldHash = hash;
            hash = hash.slice(0, 8);
            for (i = 0; i < 64; i++) {
                const i2 = i + j;
                const w15 = w[i - 15], w2 = w[i - 2];
                const a = hash[0], e = hash[4];
                const temp1 = hash[7]
                    + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
                    + ((e & hash[5]) ^ ((~e) & hash[6]))
                    + k[i]
                    + (w[i] = (i < 16) ? w[i] : (
                        w[i - 16]
                        + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
                        + w[i - 7]
                        + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
                    ) | 0
                    );
                const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
                    + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
                hash = [(temp1 + temp2) | 0].concat(hash);
                hash[4] = (hash[4] + temp1) | 0;
            }
            for (i = 0; i < 8; i++) {
                hash[i] = (hash[i] + oldHash[i]) | 0;
            }
        }
        for (i = 0; i < 8; i++) {
            for (j = 3; j >= 0; j--) {
                const b = (hash[i] >> (j * 8)) & 255;
                result += ((b < 16) ? '0' : '') + b.toString(16);
            }
        }
        return result;
    }

    /**
     * Kaba Kuvvet (Brute-Force) Kilit Kontrolü
     */
    function isLockedOut() {
        try {
            const lockoutUntil = parseInt(localStorage.getItem(LOCKOUT_KEY), 10);
            if (lockoutUntil && Date.now() < lockoutUntil) {
                const remainingSeconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
                return { locked: true, remainingSeconds };
            }
            if (lockoutUntil && Date.now() >= lockoutUntil) {
                localStorage.removeItem(LOCKOUT_KEY);
                localStorage.removeItem(ATTEMPTS_KEY);
            }
        } catch (e) { }
        return { locked: false, remainingSeconds: 0 };
    }

    /**
     * Başarısız Deneme Kaydı
     */
    function recordFailedAttempt() {
        try {
            let attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY), 10) || 0;
            attempts += 1;
            localStorage.setItem(ATTEMPTS_KEY, attempts.toString());

            if (attempts >= MAX_FAILED_ATTEMPTS) {
                const lockoutTime = Date.now() + LOCKOUT_DURATION_MS;
                localStorage.setItem(LOCKOUT_KEY, lockoutTime.toString());
                return { locked: true, remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000) };
            }
            return { locked: false, attemptsLeft: MAX_FAILED_ATTEMPTS - attempts };
        } catch (e) {
            return { locked: false, attemptsLeft: 3 };
        }
    }

    /**
     * Başarılı Girişte Kilit Sayaçlarını Sıfırla
     */
    function clearAuthLockouts() {
        try {
            localStorage.removeItem(ATTEMPTS_KEY);
            localStorage.removeItem(LOCKOUT_KEY);
        } catch (e) { }
    }

    /**
     * Yönetici Giriş Kontrolü (Senkron - Geriye dönük %100 uyumlu)
     * @param {string} pin - Kullanıcının girdiği şifre
     * @returns {boolean} - Doğrulama başarılı mı?
     */
    function authenticateAdmin(pin) {
        if (!pin || typeof pin !== 'string') return false;

        const lock = isLockedOut();
        if (lock.locked) {
            if (typeof window.showToast === 'function') {
                window.showToast(`Çok fazla hatalı deneme! Lütfen ${lock.remainingSeconds} sn bekleyin.`, '⏳');
            } else {
                alert(`Çok fazla hatalı deneme! Lütfen ${lock.remainingSeconds} saniye sonra tekrar deneyin.`);
            }
            return false;
        }

        const cleanPin = pin.trim();
        const computedHash = computeSHA256Sync(AUTH_SALT + cleanPin);

        if (computedHash === AUTH_EXPECTED_HASH) {
            clearAuthLockouts();
            try {
                sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
            } catch (e) { }
            return true;
        } else {
            const fail = recordFailedAttempt();
            if (fail.locked) {
                if (typeof window.showToast === 'function') {
                    window.showToast(`Şifre 5 kez hatalı girildi! Sistem 5 dakika kilitlendi.`, '🔒');
                }
            } else {
                if (typeof window.showToast === 'function') {
                    window.showToast(`Hatalı şifre! Kalan deneme hakkı: ${fail.attemptsLeft}`, '❌');
                }
            }
            return false;
        }
    }

    /**
     * Yönetici Aktif Oturumu Var mı?
     */
    function isAdminAuthenticated() {
        try {
            return sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
        } catch (e) {
            return false;
        }
    }

    /**
     * Yönetici Çıkışı Yap
     */
    function logoutAdmin() {
        try {
            sessionStorage.removeItem(AUTH_SESSION_KEY);
        } catch (e) { }
    }

    // Global nesneye aktar
    window.authenticateAdmin = authenticateAdmin;
    window.isAdminAuthenticated = isAdminAuthenticated;
    window.logoutAdmin = logoutAdmin;
    window.isAuthLockedOut = isLockedOut;

})(typeof window !== 'undefined' ? window : this);
