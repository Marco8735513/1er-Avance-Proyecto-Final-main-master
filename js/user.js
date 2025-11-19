/**
 * Obtiene los datos actuales del formulario de registro.
 * @returns {object} Un objeto con los datos del usuario.
 */
function obtenerDatosUsuario() {
  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("email").value;
  const itsonId = document.getElementById("itsonId").value;
  const password = document.getElementById("password").value;
  
  return {
    name: nombre,
    email: email,
    itsonId: itsonId,
    password: password
  };
}
 
export default obtenerDatosUsuario;
