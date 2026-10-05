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
    } catch (e) { }

    /**
     * Güvenilir ve Hassas Senkron SHA-256 Hash Hesaplayıcı
     */
    function computeSHA256Sync(ascii) {
        function rightRotate(value, amount) {
            return (value >>> amount) | (value << (32 - amount));
        }
        
        var mathPow = Math.pow;
        var maxWord = mathPow(2, 32);
        var lengthProperty = 'length';
        var i, j;
        var result = '';

        var words = [];
        var asciiBitLength = ascii[lengthProperty] * 8;
        
        var hash = computeSHA256Sync.h = computeSHA256Sync.h || [];
        var k = computeSHA256Sync.k = computeSHA256Sync.k || [];
        var primeCounter = k[lengthProperty];

        var isComposite = {};
        for (var candidate = 2; primeCounter < 64; candidate++) {
            if (!isComposite[candidate]) {
                for (i = 0; i < 313; i += candidate) {
                    isComposite[i] = candidate;
                }
                hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
                k[primeCounter++] = (mathPow(candidate, 1/3) * maxWord) | 0;
            }
        }
        
        ascii += '\x80';
        while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
        for (i = 0; i < ascii[lengthProperty]; i++) {
            j = ascii.charCodeAt(i);
            if (j >> 8) return '';
            words[i >> 2] |= j << ((3 - i % 4) * 8);
        }
        words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
        words[words[lengthProperty]] = (asciiBitLength | 0);
        
        for (j = 0; j < words[lengthProperty];) {
            var w = words.slice(j, j += 16);
            var oldHash = hash;
            hash = hash.slice(0, 8);
            
            for (i = 0; i < 64; i++) {
                var w15 = w[i - 15], w2 = w[i - 2];

                var a = hash[0], e = hash[4];
                var temp1 = hash[7]
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
                var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
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
                var b = (hash[i] >> (j * 8)) & 255;
                result += ((b < 16) ? 0 : '') + b.toString(16);
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
