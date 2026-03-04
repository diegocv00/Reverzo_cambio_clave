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

// Pre-fill email if session exists
async function attemptPrefillEmail() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user && user.email) {
        emailInput.value = user.email;
        emailInput.readOnly = true;
    }
}

attemptPrefillEmail();

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
        // Supabase will automatically pick up the access token from the URL hash
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
