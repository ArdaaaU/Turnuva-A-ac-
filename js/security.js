(function (window) {
    'use strict';

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    const SESSION_DURATION_MS = 2 * 60 * 60 * 1000;
    const STORAGE_KEY = '_turnuva_auth_session_#2026';
    const LEGACY_TOKEN_KEY = '_turnuva_auth_token_#2026';
    const LEGACY_ATTEMPTS_KEY = '_turnuva_auth_attempts_#2026';

    let _inMemorySessionToken = null;
    let _pendingLoginCallback = null;
    let _inFlightAuthPromise = null;

    function cleanupLegacyStorage() {
        try {
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.removeItem(LEGACY_TOKEN_KEY);
            }
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(LEGACY_ATTEMPTS_KEY);
            }
        } catch (e) {}
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

    function isAdminAuthenticated() {
        const session = getStoredSession();
        if (session && typeof session.token === 'string' && session.token.length >= 32 && session.expiresAt) {
            if (Date.now() <= session.expiresAt) {
                if (!_inMemorySessionToken) {
                    _inMemorySessionToken = session.token;
                }
                return true;
            }
            setStoredSession(null);
            _inMemorySessionToken = null;
        }
        return false;
    }

    // RPC fonksiyonlarına p_pin parametresiyle sunucu oturum token'ını iletir (açık şifre tutulmaz)
    function getAdminPin() {
        if (!isAdminAuthenticated()) return null;
        if (_inMemorySessionToken) return _inMemorySessionToken;
        const session = getStoredSession();
        return (session && session.token) ? session.token : null;
    }

    async function authenticateAdmin(pin) {
        if (pin === null || pin === undefined) return false;
        const cleanPin = String(pin).trim();
        if (!cleanPin) return false;

        if (_inFlightAuthPromise) {
            return _inFlightAuthPromise;
        }

        _inFlightAuthPromise = (async function () {
            const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
            if (!client) {
                if (typeof window.showToast === 'function') {
                    window.showToast('Sunucu bağlantısı kurulamadı. Lütfen internetinizi kontrol edin.', '❌');
                }
                return false;
            }

            try {
                const { data, error } = await client.rpc('verify_admin_pin', { p_pin: cleanPin });
                if (error || !data) {
                    return false;
                }

                if (data.locked && typeof window.showToast === 'function') {
                    window.showToast(data.error || 'Çok fazla hatalı deneme! Lütfen 5 dakika bekleyiniz.', '🔒');
                    return false;
                }

                if (data.valid === true && typeof data.token === 'string') {
                    const expiresAt = Number(data.expiresAt) || (Date.now() + SESSION_DURATION_MS);
                    _inMemorySessionToken = data.token;
                    setStoredSession({
                        authenticated: true,
                        token: data.token,
                        expiresAt: expiresAt
                    });

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
                }
            } catch (err) {
                console.warn('Yönetici doğrulama hatası:', err);
            }

            return false;
        })();

        try {
            return await _inFlightAuthPromise;
        } finally {
            _inFlightAuthPromise = null;
        }
    }

    function logoutAdmin() {
        const stored = getStoredSession();
        const tokenToRevoke = _inMemorySessionToken || (stored && stored.token);
        _inMemorySessionToken = null;
        setStoredSession(null);

        if (tokenToRevoke && typeof getSupabaseClient === 'function') {
            const client = getSupabaseClient();
            if (client) {
                client.rpc('logout_admin_session', { p_token: tokenToRevoke }).catch(function () {});
            }
        }

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
        cleanupLegacyStorage();
        installDomSecurityWatcher();

        try {
            console.log(
                '%c⚠️ GÜVENLİK BİLGİLENDİRMESİ\n%cBu konsol ekranı yalnızca teknik geliştirme amaçlıdır. Yönetici paneline şifresiz giriş yapılamaz; her türlü işlem sunucu düzeyinde (Supabase RPC) oturum jetonu ile doğrulanır.',
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
            submitBtn.addEventListener('click', function (e) {
                e.preventDefault();
                handlePinVerification();
            });
        }
        if (pinInput) {
            pinInput.addEventListener('keydown', function (e) {
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
