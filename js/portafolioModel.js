/**
 * Obtiene los datos actuales del formulario de registro.
 * @returns {object} Un objeto con los datos del usuario.
 */
function obtenerProyects() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const technologies = document.getElementById("technologies").value;
  const repository = document.getElementById("repository").value;
  const images = document.getElementById("images").value;
  
  return {
    title: title,
    description: description,
    technologies: technologies,
    repository: repository,
    images: images
  };
}
 
export default obtenerProyects;