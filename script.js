const SUPABASE_URL = 'https://prsqsdxuqbeylplanqdf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_zjzGNTwR_t2IHmJKDfnzWg_OB0BqQMD';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const resetForm = document.getElementById('reset-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const submitBtn = document.getElementById('submit-btn');
const messageEl = document.getElementById('message');
const toggleP1 = document.getElementById('toggle-p1');
const toggleP2 = document.getElementById('toggle-p2');

let sessionInitialized = false;

async function initializeAuthSession() {
    let sessionFromUrl = false;

    try {
        if (window.location.hash.includes('access_token') || window.location.search.includes('access_token')) {
            const { data, error } = await supabaseClient.auth.getSessionFromUrl({ storeSession: true });
            if (error) {
                console.warn('Error al procesar el token de recuperación en la URL:', error.message);
            } else if (data?.session) {
                sessionFromUrl = true;
                window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
            }
        }

        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error) {
            console.warn('No hay sesión de autenticación activa:', error.message);
        }
        if (user?.email) {
            emailInput.value = user.email;
            emailInput.readOnly = true;
        } else if (!sessionFromUrl && !window.location.hash && !window.location.search.includes('access_token')) {
            console.warn('No se detectó token de recuperación en la URL.');
        }
    } catch (error) {
        console.error('Error inicializando la sesión de autenticación:', error);
    } finally {
        sessionInitialized = true;
    }
}

initializeAuthSession();

// Show password functionality
toggleP1.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
});

toggleP2.addEventListener('click', () => {
    const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPasswordInput.setAttribute('type', type);
});

resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Reset messages
    messageEl.className = 'message';
    messageEl.textContent = '';

    if (!email) {
        showMessage('Por favor, ingresa tu correo electrónico.', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('La contraseña debe tener al menos 6 caracteres.', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showMessage('Las contraseñas no coinciden.', 'error');
        return;
    }

    setLoading(true);

    try {
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) {
            throw new Error('No hay sesión de autenticación activa. Vuelve a usar el enlace de restablecimiento que recibiste por correo.');
        }

        const { error } = await supabaseClient.auth.updateUser({
            password: password
        });

        if (error) {
            throw error;
        }

        document.getElementById('reset-form').style.display = 'none';
        document.querySelector('.header').style.display = 'none';
        document.getElementById('success-state').style.display = 'block';

    } catch (error) {
        console.error('Error updating password:', error);
        showMessage('Hubo un error al actualizar la contraseña: ' + (error.message || 'Error desconocido'), 'error');
    } finally {
        setLoading(false);
    }
});

function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
}

function setLoading(isLoading) {
    if (isLoading) {
        document.body.classList.add('loading');
        submitBtn.disabled = true;
    } else {
        document.body.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Optional: Dynamic greeting or check for token
window.addEventListener('load', () => {
    // If no token in URL, we could show a warning, but Supabase handles it mostly
    if (!window.location.hash) {
        console.warn('No se detectó token de recuperación en la URL.');
    }
});
