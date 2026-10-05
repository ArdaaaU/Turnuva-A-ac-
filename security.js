

(function (window) {
    'use strict';

    const AUTH_SESSION_KEY = 'turnuva_admin_authenticated';
    const PIN_KEY = 'turnuva_admin_pin';
    const ATTEMPTS_KEY = 'turnuva_auth_attempts';
    const LOCKOUT_KEY = 'turnuva_auth_lockout_until';
    const MAX_FAILED_ATTEMPTS = 10;
    const LOCKOUT_DURATION_MS = 2 * 60 * 1000; 

    const VALID_PINS = ['1931', '1234'];

    function isLockedOut() {
        try {
            const lockoutUntil = parseInt(localStorage.getItem(LOCKOUT_KEY), 10);
            if (lockoutUntil && Date.now() < lockoutUntil) {
                const remainingSeconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
                return { locked: true, remainingSeconds: remainingSeconds };
            }
            if (lockoutUntil && Date.now() >= lockoutUntil) {
                localStorage.removeItem(LOCKOUT_KEY);
                localStorage.removeItem(ATTEMPTS_KEY);
            }
        } catch (e) { }
        return { locked: false, remainingSeconds: 0 };
    }

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

    function clearAuthLockouts() {
        try {
            localStorage.removeItem(ATTEMPTS_KEY);
            localStorage.removeItem(LOCKOUT_KEY);
        } catch (e) { }
    }

    function isAdminAuthenticated() {
        try {
            const sAuth = sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
            const lAuth = localStorage.getItem(AUTH_SESSION_KEY) === 'true';
            return sAuth || lAuth;
        } catch (e) {
            return false;
        }
    }

    function authenticateAdmin(pin) {
        if (pin === null || pin === undefined) return false;

        const lock = isLockedOut();
        if (lock.locked) {
            const msg = `Çok fazla hatalı deneme! Lütfen ${lock.remainingSeconds} sn bekleyin.`;
            if (typeof window.showToast === 'function') {
                window.showToast(msg, '⏳');
            } else {
                alert(msg);
            }
            return false;
        }

        const cleanPin = String(pin).trim();
        if (!cleanPin) return false;

        let customPin = null;
        try {
            customPin = localStorage.getItem(PIN_KEY);
        } catch (e) { }

        const isValid = VALID_PINS.includes(cleanPin) || (customPin && cleanPin === customPin.trim());

        if (isValid) {
            clearAuthLockouts();
            try {
                sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
                localStorage.setItem(AUTH_SESSION_KEY, 'true');
            } catch (e) { }

            try {
                window.dispatchEvent(new CustomEvent('turnuva_auth_changed', {
                    detail: { authenticated: true }
                }));
            } catch (e) { }

            return true;
        } else {
            const fail = recordFailedAttempt();
            if (fail.locked) {
                const msg = `Şifre ${MAX_FAILED_ATTEMPTS} kez hatalı girildi! Sistem kilitlendi.`;
                if (typeof window.showToast === 'function') {
                    window.showToast(msg, '🔒');
                } else {
                    alert(msg);
                }
            } else {
                const msg = `Hatalı şifre! Kalan deneme hakkı: ${fail.attemptsLeft}`;
                if (typeof window.showToast === 'function') {
                    window.showToast(msg, '❌');
                }
            }
            return false;
        }
    }

    function logoutAdmin() {
        try {
            sessionStorage.removeItem(AUTH_SESSION_KEY);
            localStorage.removeItem(AUTH_SESSION_KEY);
        } catch (e) { }

        try {
            window.dispatchEvent(new CustomEvent('turnuva_auth_changed', {
                detail: { authenticated: false }
            }));
        } catch (e) { }
    }

    function setAdminPin(newPin) {
        if (!newPin || typeof newPin !== 'string') return false;
        const clean = newPin.trim();
        if (clean.length < 3) return false;
        try {
            localStorage.setItem(PIN_KEY, clean);
            return true;
        } catch (e) {
            return false;
        }
    }

    const TurnuvaAuth = {
        authenticate: authenticateAdmin,
        isAuthenticated: isAdminAuthenticated,
        logout: logoutAdmin,
        setPin: setAdminPin,
        isLockedOut: isLockedOut
    };

    window.TurnuvaAuth = TurnuvaAuth;

    window.authenticateAdmin = authenticateAdmin;
    window.isAdminAuthenticated = isAdminAuthenticated;
    window.logoutAdmin = logoutAdmin;
    window.isAuthLockedOut = isLockedOut;

})(typeof window !== 'undefined' ? window : this);
