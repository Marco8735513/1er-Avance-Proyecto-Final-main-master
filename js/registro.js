import obtenerDatosUsuario from './user.js';

document.addEventListener('DOMContentLoaded', () => {
    const registroForm = document.getElementById('registro-form');

    if (registroForm) {
        registroForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            registro();
        });
    }
});



async function registro() {
    const user = obtenerDatosUsuario(); 
    const errorMessageElement = document.getElementById('error-message');

    try {
        const respuesta = await fetch('https://portfolio-api-three-black.vercel.app/api/v1/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });

        
        if (!respuesta.ok) {
            const errorData = await respuesta.json().catch(() => ({ message: `Error HTTP: ${respuesta.status}` }));
            throw new Error(errorData.message || 'Ocurrió un error desconocido.');
        }

        const data = await respuesta.json();
        console.log('Registro exitoso:', data);
        errorMessageElement.textContent = ''; 
        alert('¡Registro exitoso!');
        window.location.href = '../html/index.html';

    } catch (error) {
        console.error('Ocurrió un error en el registro:', error);
        errorMessageElement.textContent = error.message;
    }
}