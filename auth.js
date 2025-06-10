// Importa las funciones de autenticación y la configuración
import { 
  auth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signInWithPopup,
  googleProvider,
  facebookProvider,
  sendPasswordResetEmail
} from './firebase-config.js';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');
    const loader = document.getElementById('loader');
    const submitBtn = loginForm?.querySelector('.btn-submit');
    const googleBtn = document.querySelector('.google-btn');
    const facebookBtn = document.querySelector('.facebook-btn');
    
    // Verificar si el usuario ya está autenticado
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Usuario ya logueado, redirigir
            window.location.href = 'index.html';
        }
    });

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('correo').value;
            const password = document.getElementById('contrasena').value;
            
            // Mostrar loader y deshabilitar botón
            if (submitBtn) {
                submitBtn.disabled = true;
            }
            if (loader) {
                loader.style.display = 'block';
            }
            if (errorMessage) {
                errorMessage.textContent = '';
                errorMessage.style.display = 'none';
            }
            
            try {
                // Iniciar sesión con Firebase
                await signInWithEmailAndPassword(auth, email, password);
                
                // Redirigir al dashboard después de login exitoso
                window.location.href = 'index.html';
                
            } catch (error) {
                // Manejar errores
                let message = "Error al iniciar sesión. ";
                switch(error.code) {
                    case 'auth/invalid-email':
                        message += "El correo electrónico no es válido.";
                        break;
                    case 'auth/user-disabled':
                        message += "Esta cuenta ha sido deshabilitada.";
                        break;
                    case 'auth/user-not-found':
                        message += "No existe una cuenta con este correo.";
                        break;
                    case 'auth/wrong-password':
                        message += "La contraseña es incorrecta.";
                        break;
                    case 'auth/too-many-requests':
                        message += "Demasiados intentos fallidos. Intenta más tarde.";
                        break;
                    default:
                        message += error.message;
                }
                
                if (errorMessage) {
                    errorMessage.textContent = message;
                    errorMessage.style.display = 'block';
                }
                
            } finally {
                // Ocultar loader y habilitar botón
                if (submitBtn) {
                    submitBtn.disabled = false;
                }
                if (loader) {
                    loader.style.display = 'none';
                }
            }
        });
    }

    // Autenticación con Google
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            try {
                const result = await signInWithPopup(auth, googleProvider);
                // El usuario ha iniciado sesión correctamente con Google
                window.location.href = 'index.html';
            } catch (error) {
                console.error("Error en autenticación con Google:", error);
                if (errorMessage) {
                    errorMessage.textContent = "Error al iniciar sesión con Google. Intenta nuevamente.";
                    errorMessage.style.display = 'block';
                }
            }
        });
    }

    // Autenticación con Facebook
    if (facebookBtn) {
        facebookBtn.addEventListener('click', async () => {
            try {
                const result = await signInWithPopup(auth, facebookProvider);
                // El usuario ha iniciado sesión correctamente con Facebook
                window.location.href = './index.html';
            } catch (error) {
                console.error("Error en autenticación con Facebook:", error);
                if (errorMessage) {
                    errorMessage.textContent = "Error al iniciar sesión con Facebook. Intenta nuevamente.";
                    errorMessage.style.display = 'block';
                }
            }
        });
    }
});

// Función para recuperación de contraseña
export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true, message: "Se ha enviado un correo para restablecer tu contraseña." };
    } catch (error) {
        let message = "Error al enviar el correo de recuperación. ";
        switch(error.code) {
            case 'auth/invalid-email':
                message += "El correo electrónico no es válido.";
                break;
            case 'auth/user-not-found':
                message += "No existe una cuenta con este correo.";
                break;
            default:
                message += "Intenta nuevamente más tarde.";
        }
        return { success: false, message };
    }
}