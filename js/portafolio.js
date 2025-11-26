// Asume que la API se está ejecutando localmente en el puerto 3000.
import anime from 'https://cdn.jsdelivr.net/npm/animejs@3.2.1/lib/anime.es.js';
// ¡Asegúrate de cambiar esto a la URL correcta de tu API!
const API_BASE = "https://portfolio-api-three-black.vercel.app/api/v1";

async function getPublicProjects(itsonId) {
  const res = await fetch(`${API_BASE}/publicProjects/${itsonId}`);
  if (!res.ok) throw new Error("Error al obtener proyectos");
  return res.json();
}

function renderProjects(projects) {
  const projectList = document.getElementById('projects-list');
  if (!projectList) {
    console.error("El elemento #projects-list no se encontró en el DOM.");
    return;
    
  }

  projectList.innerHTML = ''; // Limpiar la lista antes de renderizar

  if (projects.length === 0) {
    projectList.innerHTML = '<p>No hay proyectos para mostrar.</p>';
    return;
  }

  projects.forEach(project => {
    const projectItem = document.createElement('div');
    projectItem.className = 'project-item';
    projectItem.innerHTML = `
      <h4>${project.title}</h4>
      <p>${project.description}</p>
      <p><strong>Tecnologías:</strong> ${project.technologies.join(', ')}</p>
      <p><strong>Repositorio:</strong> <a href="${project.repository}" target="_blank" rel="noopener noreferrer">Ver código</a></p>
      ${project.images && project.images.length > 0 ? `<img src="${project.images[0]}" alt="Imagen del proyecto ${project.title}" style="max-width: 100%; border-radius: 5px; margin-top: 10px;">` : ''}
    `;
    projectList.appendChild(projectItem);
  });

  // Animación con anime.js para los elementos del proyecto
  anime({
    targets: '.project-item',
    opacity: [0, 1],
    translateY: [20, 0],
    delay: anime.stagger(100) // Retraso de 100ms entre cada elemento
  });
}

// Llama a la función para obtener y renderizar los proyectos cuando se carga la página.
document.addEventListener('DOMContentLoaded', () => {
  getPublicProjects("253313").then(renderProjects).catch(console.error);
});