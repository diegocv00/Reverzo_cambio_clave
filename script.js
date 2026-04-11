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
    // Escuchar el evento PASSWORD_RECOVERY (Supabase v2)
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
            sessionInitialized = true;
            if (session?.user?.email) {
                emailInput.value = session.user.email;
                emailInput.readOnly = true;
            }
        }
    });

    // Fallback: verificar si ya hay una sesión activa
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (!error && user?.email) {
            emailInput.value = user.email;
            emailInput.readOnly = true;
            sessionInitialized = true;
        }
    } catch (error) {
        console.warn('No hay sesión activa todavía:', error.message);
    }
}

initializeAuthSession();

// Mostrar/ocultar contraseña
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

    // Limpiar mensajes previos
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
        const { error } = await supabaseClient.auth.updateUser({
            password: password
        });

        if (error) throw error;

        document.getElementById('reset-form').style.display = 'none';
        document.querySelector('.header').style.display = 'none';
        document.getElementById('success-state').style.display = 'block';

    } catch (error) {
        console.error('Error al actualizar la contraseña:', error);
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

window.addEventListener('load', () => {
    if (!window.location.hash && !window.location.search.includes('access_token')) {
        console.warn('No se detectó token de recuperación en la URL.');
    }
});