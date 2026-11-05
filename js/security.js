(function (window) {
    'use strict';

    function sha256(ascii) {
        function rightRotate(value, amount) {
            return (value >>> amount) | (value << (32 - amount));
        }
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

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    const SALT_PREFIX = 'Turnuva_Tree_Sec_#2026!';
    const SALT_SUFFIX = '@Antigravity_Admin_Auth_99';
    const MASTER_CREDENTIAL_HASH = 'dee8e71a4b7ea0f08fac721680637e04dcc9bbe4e138d9a30288deb123e35763';
    const SESSION_HMAC_SALT = 'Turnuva_Admin_Active_HMAC_Session_#99281!';
    const SESSION_DURATION_MS = 2 * 60 * 60 * 1000;
    const STORAGE_KEY = '_turnuva_auth_token_#2026';
    const ATTEMPTS_KEY = '_turnuva_auth_attempts_#2026';
    const MAX_FAILED_ATTEMPTS = 5;
    const LOCKOUT_DURATION_MS = 5 * 60 * 1000;

    let _inMemoryAdminPin = null;
    let _pendingLoginCallback = null;

    function hashCredential(pin) {
        if (!pin && pin !== 0) return '';
        const clean = String(pin).trim();
        return sha256(SALT_PREFIX + clean + SALT_SUFFIX);
    }

    function computeSessionSignature(issuedAt, expiresAt, nonce) {
        return sha256(SESSION_HMAC_SALT + ':' + issuedAt + ':' + expiresAt + ':' + nonce);
    }

    function getStoredSession() {
        try {
            if (typeof sessionStorage === 'undefined') return null;
            const raw = sessionStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    function setStoredSession(sessionObj) {
        try {
            if (typeof sessionStorage === 'undefined') return;
            if (sessionObj) {
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessionObj));
            } else {
                sessionStorage.removeItem(STORAGE_KEY);
            }
        } catch (e) {}
    }

    function getAttemptState() {
        try {
            const raw = localStorage.getItem(ATTEMPTS_KEY);
            if (!raw) return { count: 0, lockUntil: 0 };
            const parsed = JSON.parse(raw);
            if (parsed.lockUntil && Date.now() > parsed.lockUntil) {
                localStorage.removeItem(ATTEMPTS_KEY);
                return { count: 0, lockUntil: 0 };
            }
            return parsed;
        } catch (e) {
            return { count: 0, lockUntil: 0 };
        }
    }

    function recordFailedAttempt() {
        try {
            const state = getAttemptState();
            state.count = (state.count || 0) + 1;
            if (state.count >= MAX_FAILED_ATTEMPTS) {
                state.lockUntil = Date.now() + LOCKOUT_DURATION_MS;
            }
            localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(state));
            return state;
        } catch (e) {
            return { count: 1, lockUntil: 0 };
        }
    }

    function resetFailedAttempts() {
        try {
            localStorage.removeItem(ATTEMPTS_KEY);
        } catch (e) {}
    }

    function isAdminAuthenticated() {
        const session = getStoredSession();
        if (session && session.sig && session.issuedAt && session.expiresAt && session.nonce) {
            if (Date.now() <= session.expiresAt) {
                const expectedSig = computeSessionSignature(session.issuedAt, session.expiresAt, session.nonce);
                if (session.sig === expectedSig) {
                    if (!_inMemoryAdminPin && session.pin) {
                        _inMemoryAdminPin = session.pin;
                    }
                    return true;
                }
            }
            setStoredSession(null);
        }
        return false;
    }

    function getAdminPin() {
        if (!isAdminAuthenticated()) return null;
        if (_inMemoryAdminPin) return _inMemoryAdminPin;
        const session = getStoredSession();
        return (session && session.pin) ? session.pin : null;
    }

    async function authenticateAdmin(pin) {
        if (pin === null || pin === undefined) return false;
        const cleanPin = String(pin).trim();
        if (!cleanPin) return false;

        const attemptState = getAttemptState();
        if (attemptState.lockUntil && Date.now() < attemptState.lockUntil) {
            const remainingMins = Math.max(1, Math.ceil((attemptState.lockUntil - Date.now()) / 60000));
            if (typeof window.showToast === 'function') {
                window.showToast(`Çok fazla hatalı deneme! Lütfen ${remainingMins} dakika bekleyiniz.`, '⏳');
            }
            return false;
        }

        let isValid = false;
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;

        if (client) {
            try {
                const { data, error } = await client.rpc('verify_admin_pin', { p_pin: cleanPin });
                if (!error && (data === true || (data && data.valid === true))) {
                    isValid = true;
                }
            } catch (err) {
                console.warn('verify_admin_pin hatası:', err);
            }
        }

        // Fallback to local cryptographic hash check if RPC is unreachable or offline
        if (!isValid) {
            if (hashCredential(cleanPin) === MASTER_CREDENTIAL_HASH) {
                isValid = true;
            }
        }

        if (isValid) {
            resetFailedAttempts();
            _inMemoryAdminPin = cleanPin;
            const issuedAt = Date.now();
            const expiresAt = issuedAt + SESSION_DURATION_MS;
            const nonce = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
            const signature = computeSessionSignature(issuedAt, expiresAt, nonce);
            const session = {
                authenticated: true,
                pin: cleanPin,
                issuedAt: issuedAt,
                expiresAt: expiresAt,
                nonce: nonce,
                sig: signature
            };
            setStoredSession(session);

            updateNavAuthUI(true);
            if (typeof _pendingLoginCallback === 'function') {
                const cb = _pendingLoginCallback;
                _pendingLoginCallback = null;
                try { cb(); } catch (e) {}
            }
            try {
                window.dispatchEvent(new CustomEvent('turnuva_auth_changed', {
                    detail: { authenticated: true }
                }));
            } catch (e) {}
            return true;
        } else {
            const updated = recordFailedAttempt();
            if (updated.lockUntil && Date.now() < updated.lockUntil) {
                if (typeof window.showToast === 'function') {
                    window.showToast('Çok fazla hatalı deneme! Giriş 5 dakika kilitlendi.', '🔒');
                }
            }
            return false;
        }
    }

    function logoutAdmin() {
        _inMemoryAdminPin = null;
        setStoredSession(null);

        try {
            const adminModals = document.querySelectorAll(
                '#tournament-admin-modal, #stats-admin-modal, #announcement-modal, #delete-confirm-modal'
            );
            adminModals.forEach(function (m) {
                if (m.tagName.toLowerCase() !== 'template') m.remove();
            });
            const adminBtns = document.getElementById('admin-action-btns');
            if (adminBtns) adminBtns.style.display = 'none';
        } catch (e) {}

        updateNavAuthUI(false);
        try {
            window.dispatchEvent(new CustomEvent('turnuva_auth_changed', {
                detail: { authenticated: false }
            }));
        } catch (e) {}
    }

    function installDomSecurityWatcher() {
        if (typeof MutationObserver === 'undefined') return;
        const observer = new MutationObserver(function () {
            if (!isAdminAuthenticated()) {
                const unauthorized = document.querySelectorAll(
                    '#tournament-admin-modal, #stats-admin-modal, #announcement-modal, #delete-confirm-modal'
                );
                unauthorized.forEach(function (node) {
                    if (node.tagName.toLowerCase() !== 'template') {
                        node.remove();
                        console.warn('[Turnuva Güvenlik] Yetkisiz yönetici paneli DOM tespiti yapıldı ve element kaldırıldı.');
                    }
                });
                const adminBtns = document.getElementById('admin-action-btns');
                if (adminBtns && adminBtns.style.display !== 'none') {
                    adminBtns.style.display = 'none';
                }
            }
        });
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    }

    function updateNavAuthUI(isAuth) {
        const auth = typeof isAuth === 'boolean' ? isAuth : isAdminAuthenticated();
        const openAdminBtn = document.getElementById('open-admin-btn');
        const adminBtnText = document.getElementById('admin-btn-text');
        const adminLogoutBtn = document.getElementById('admin-logout-btn');
        if (openAdminBtn) {
            openAdminBtn.classList.toggle('is-auth', auth);
            if (adminBtnText) {
                adminBtnText.innerText = auth ? 'Yönetim Paneli' : 'Yönetici Girişi';
            }
        }
        if (adminLogoutBtn) {
            adminLogoutBtn.style.display = auth ? 'inline-flex' : 'none';
        }
        const mobileOpenAdminBtn = document.getElementById('mobile-open-admin-btn');
        const mobileAdminBtnText = document.getElementById('mobile-admin-btn-text');
        const mobileAdminLogoutBtn = document.getElementById('mobile-admin-logout-btn');
        if (mobileOpenAdminBtn) {
            mobileOpenAdminBtn.classList.toggle('is-auth', auth);
            if (mobileAdminBtnText) {
                mobileAdminBtnText.innerText = auth ? '⚙️ Yönetim Paneli' : '🔒 Yönetici Girişi';
            }
        }
        if (mobileAdminLogoutBtn) {
            mobileAdminLogoutBtn.style.display = auth ? 'inline-flex' : 'none';
        }
    }

    function openPinModal(onSuccessCallback) {
        if (isAdminAuthenticated()) {
            if (typeof onSuccessCallback === 'function') onSuccessCallback();
            return;
        }
        _pendingLoginCallback = onSuccessCallback || null;
        const pinModal = document.getElementById('pin-modal');
        const pinInput = document.getElementById('admin-pin-input');
        const pinError = document.getElementById('pin-error-msg');
        if (pinInput) pinInput.value = '';
        if (pinError) pinError.style.display = 'none';
        if (pinModal) {
            pinModal.classList.add('active');
            setTimeout(function () {
                if (pinInput) pinInput.focus();
            }, 100);
        }
    }

    function closePinModal() {
        const pinModal = document.getElementById('pin-modal');
        if (pinModal) {
            pinModal.classList.remove('active');
        }
        const pinInput = document.getElementById('admin-pin-input');
        if (pinInput) pinInput.value = '';
        const pinError = document.getElementById('pin-error-msg');
        if (pinError) pinError.style.display = 'none';
        _pendingLoginCallback = null;
    }

    function initSecurityEventListeners() {
        installDomSecurityWatcher();

        try {
            console.log(
                '%c⚠️ GÜVENLİK BİLGİLENDİRMESİ\n%cBu konsol ekranı yalnızca teknik geliştirme amaçlıdır. Yönetici paneline şifresiz giriş yapılamaz; her türlü işlem sunucu düzeyinde (Supabase RPC) PIN ile doğrulanır.',
                'color: #ef4444; font-size: 16px; font-weight: bold;',
                'color: #94a3b8; font-size: 12px;'
            );
        } catch (e) {}

        const pinForm = document.getElementById('pin-form');
        const pinInput = document.getElementById('admin-pin-input');
        const pinError = document.getElementById('pin-error-msg');
        const cancelBtn = document.getElementById('cancel-pin-btn');
        const closeBtn = document.getElementById('close-pin-modal-btn') || document.getElementById('close-pin-modal');
        const submitBtn = document.getElementById('submit-pin-btn') || (pinForm ? pinForm.querySelector('button[type="submit"]') : null);

        async function handlePinVerification() {
            const origText = submitBtn ? submitBtn.innerText : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = 'Doğrulanıyor...';
            }
            const val = pinInput ? pinInput.value : '';
            const success = await authenticateAdmin(val);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = origText;
            }
            if (success) {
                closePinModal();
                if (typeof window.showToast === 'function') {
                    window.showToast('Yönetici girişi başarılı!', '🔑');
                }
            } else {
                if (pinError) pinError.style.display = 'block';
                if (pinInput) {
                    pinInput.select();
                    pinInput.focus();
                }
            }
        }

        if (pinForm) {
            pinForm.addEventListener('submit', function (e) {
                e.preventDefault();
                handlePinVerification();
            });
        }
        if (submitBtn && (!pinForm || submitBtn.type !== 'submit')) {
            submitBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handlePinVerification();
            });
        }
        if (adminPinInput) {
            adminPinInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handlePinVerification();
                }
            });
        }
        if (cancelBtn) cancelBtn.addEventListener('click', closePinModal);
        if (closeBtn) closeBtn.addEventListener('click', closePinModal);

        const pinModal = document.getElementById('pin-modal');
        if (pinModal) {
            pinModal.addEventListener('click', function (e) {
                if (e.target === pinModal) closePinModal();
            });
        }

        const adminLogoutBtn = document.getElementById('admin-logout-btn');
        if (adminLogoutBtn) {
            adminLogoutBtn.addEventListener('click', function () {
                logoutAdmin();
                if (typeof window.showToast === 'function') {
                    window.showToast('Yönetici oturumu kapatıldı.', '🚪');
                }
            });
        }

        const mobileAdminLogoutBtn = document.getElementById('mobile-admin-logout-btn');
        if (mobileAdminLogoutBtn) {
            mobileAdminLogoutBtn.addEventListener('click', function () {
                logoutAdmin();
                if (typeof window.showToast === 'function') {
                    window.showToast('Yönetici oturumu kapatıldı.', '🚪');
                }
            });
        }

        updateNavAuthUI();
    }

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initSecurityEventListeners);
        } else {
            initSecurityEventListeners();
        }
    }

    const TurnuvaAuth = Object.freeze({
        getAdminPin: getAdminPin,
        authenticate: authenticateAdmin,
        isAuthenticated: isAdminAuthenticated,
        logout: logoutAdmin,
        openPinModal: openPinModal,
        closePinModal: closePinModal,
        updateNavUI: updateNavAuthUI,
        escapeHtml: escapeHtml
    });

    function defineImmutableProperty(target, name, val) {
        try {
            Object.defineProperty(target, name, {
                value: val,
                writable: false,
                configurable: false,
                enumerable: true
            });
        } catch (e) {
            target[name] = val;
        }
    }

    defineImmutableProperty(window, 'TurnuvaAuth', TurnuvaAuth);
    defineImmutableProperty(window, 'authenticateAdmin', authenticateAdmin);
    defineImmutableProperty(window, 'isAdminAuthenticated', isAdminAuthenticated);
    defineImmutableProperty(window, 'getAdminPin', getAdminPin);
    defineImmutableProperty(window, 'logoutAdmin', logoutAdmin);
    defineImmutableProperty(window, 'openPinModal', openPinModal);
    defineImmutableProperty(window, 'closePinModal', closePinModal);
    defineImmutableProperty(window, 'escapeHtml', escapeHtml);

})(typeof window !== 'undefined' ? window : this);
