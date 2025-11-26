const API_BASE = 'https://portfolio-api-three-black.vercel.app/api/v1';


function saveToken(token) {
  localStorage.setItem("authToken", token);
  console.log("Token guardado en localStorage. Puedes verificarlo en la pestaña 'Application' > 'Local Storage' de las herramientas de desarrollador.");
  console.log("Token:", localStorage.getItem("authToken"));
}

async function login({ email, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Error al iniciar sesión");
  }
  return data;
}

async function getProfile(token) {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    headers: { 'auth-token': token }
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "No se pudo obtener el perfil del usuario");
  }
  return data;
}
// --- Funciones CRUD para Proyectos ---

async function getProjectById(id, token) {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    headers: { 'auth-token': token }
  });
  if (!res.ok) throw new Error("Proyecto no encontrado");
  return res.json();
}


async function getProjects(token) {
  const res = await fetch(`${API_BASE}/projects`, {
    headers: { 'auth-token': token }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "No se pudieron obtener los proyectos.");
  return data;
}

async function createProject(projectData, token) {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'auth-token': token
    }, 
    body: JSON.stringify(projectData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al crear el proyecto.");
  return data;
}

async function updateProject(projectId, updates, token) {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "auth-token": token
    }, 
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al actualizar el proyecto.");
  return data;
}

async function deleteProject(id, token) {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'DELETE',
    headers: { 'auth-token': token }
  });
  if (!res.ok && res.status !== 204) { // Un DELETE exitoso puede devolver 204 No Content
    const data = await res.json().catch(() => ({})); // Intenta parsear JSON, si no, objeto vacío
    throw new Error(data.message || "Error al eliminar el proyecto.");
  }
  // No se retorna nada en un DELETE exitoso (usualmente)
}

// --- Fin de Funciones CRUD ---

// --- Funciones Públicas ---
async function getPublicProjects(itsonId) {
  const res = await fetch(`${API_BASE}/publicProjects/${itsonId}`);
  if (!res.ok) throw new Error("Error al obtener proyectos públicos");
  return res.json();
}

// --- Fin de Funciones CRUD ---


document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('#login-form');
  const errorMessageElement = document.getElementById('error-message');
  const mensajeBienvenida = document.getElementById('mensaje-bienvenida');
  const projectForm = document.getElementById('project-form');
  const projectsList = document.getElementById('projects-list');
  const showProjectsBtn = document.getElementById('show-projects-btn');
  const cancelBtn = document.getElementById('cancel-edit-btn');
  const deleteBtn = document.getElementById('delete-btn');
  const saveBtn = document.getElementById('save-btn');
  const refreshProjectsBtn = document.getElementById('refresh-projects-btn');
  const deleteAllProjectsBtn = document.getElementById('delete-projects-btn');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      errorMessageElement.textContent = '';
      const email = document.querySelector('#email').value;

      const password = document.querySelector('#password').value;

      (async () => {
        try {
          const loginData = await login({ email, password });
          console.log('Login exitoso, token recibido.');
          saveToken(loginData.token);
          
          const userProfile = await getProfile(loginData.token);
          sessionStorage.setItem('usuarioLogueado', JSON.stringify(userProfile));
          
          window.location.href = './main.html';
        } catch (error) {
          console.error('Error en el login:', error);
          errorMessageElement.textContent = error.message;
        }
      })();
    });
  }

 
  if (mensajeBienvenida) {
    const token = localStorage.getItem('authToken');

    if (!token) {
      window.location.href = 'index.html';
      return;
    }

   
    (async () => {
      try {
        
        let usuarioLogueado = JSON.parse(sessionStorage.getItem('usuarioLogueado') || 'null');

       
        if (!usuarioLogueado) {
          console.log("No hay usuario en sessionStorage, pidiendo perfil a la API...");
          usuarioLogueado = await getProfile(token);
          sessionStorage.setItem('usuarioLogueado', JSON.stringify(usuarioLogueado)); // Guardamos para uso futuro
        }

        
        const resetForm = () => {
          projectForm.reset();
          document.getElementById('projectId').value = '';
          document.getElementById('form-title').textContent = 'Agregar Nuevo Proyecto';
          saveBtn.textContent = 'Guardar Proyecto';          
          cancelBtn.classList.add('hidden');
          deleteBtn.classList.add('hidden');
        };

       
        const populateFormWithProject = (project) => {
          if (project) {
            
            document.getElementById('projectId').value = project._id;
            document.getElementById('title').value = project.title;
            document.getElementById('description').value = project.description;
            document.getElementById('technologies').value = project.technologies.join(', ');
            document.getElementById('repository').value = project.repository;
            
            
            document.getElementById('form-title').textContent = 'Editando Proyecto';
            saveBtn.textContent = 'Guardar Cambios';
            cancelBtn.classList.remove('hidden');
            deleteBtn.classList.remove('hidden');
            window.scrollTo(0, 0); 
          }
        };

        let allProjects = []; 

        mensajeBienvenida.textContent = `¡Bienvenido, ${usuarioLogueado.name}!`;

       
        const loadProjects = async () => {
          try {
            const projects = await getProjects(token);
            allProjects = projects;
            renderProjects(projects);
          } catch (error) {
            console.error(error);
            projectsList.innerHTML = `<p class="error-text">${error.message}</p>`;
          }
        };

        const renderProjects = (projects) => {
          projectsList.innerHTML = ''; 
          if (projects.length === 0) {
            projectsList.innerHTML = '<p>No tienes proyectos todavía. ¡Agrega uno!</p>';
            return;
          }
          projects.forEach(project => {
            const projectElement = document.createElement('div');
            projectElement.className = 'project-item';
            projectElement.innerHTML = `
          <h4>${project.title}</h4>
          <p class="project-description">${project.description}</p>
          <p><strong>Tecnologías:</strong> ${project.technologies.join(', ')}</p>
          <p><strong>Repositorio:</strong> <a href="${project.repository}" target="_blank" rel="noopener noreferrer">Ver código</a></p>
        `;
            projectElement.style.cursor = 'pointer'; // Añade un cursor para indicar que es clickeable
            projectElement.dataset.id = project._id;
            projectsList.appendChild(projectElement);
          });
        };

        
        projectForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const projectId = document.getElementById('projectId').value;
          const projectData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            technologies: document.getElementById('technologies').value.split(',').map(tech => tech.trim()),
            repository: document.getElementById('repository').value,
            images: [] 
          };

          try {
            if (projectId) {
             
              const updatedProject = await updateProject(projectId, projectData, token);
              console.log('Proyecto actualizado correctamente:', updatedProject);
            } else {
             
              const newProject = await createProject(projectData, token);
              console.log('Proyecto creado correctamente:', newProject);
            }
            projectForm.reset();
            document.getElementById('projectId').value = '';
            document.getElementById('form-title').textContent = 'Agregar Nuevo Proyecto';
            saveBtn.textContent = 'Guardar Proyecto';
            cancelBtn.classList.add('hidden');
            deleteBtn.classList.add('hidden');
            loadProjects();
          } catch (error) {
            console.error('Error al guardar el proyecto:', error);
            alert(error.message);
          }
        });

        
        projectsList.addEventListener('click', async (e) => {
          const projectElement = e.target.closest('.project-item');
          if (projectElement) {
            const projectId = projectElement.dataset.id;
            const project = allProjects.find(p => p._id === projectId);
            populateFormWithProject(project);
          }
        });

       
        deleteBtn.addEventListener('click', async () => {
          const projectId = document.getElementById('projectId').value;
          if (projectId && confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
            try {
              await deleteProject(projectId, token);
              resetForm();
              loadProjects();
            } catch (error) {
              alert(error.message);
            }
          }
        });

      
        if (showProjectsBtn) {
          showProjectsBtn.addEventListener('click', () => {
            loadProjects();
          });
        }

       
        if (refreshProjectsBtn) {
          refreshProjectsBtn.addEventListener('click', async () => {
            console.log("Cargando el primer proyecto en el formulario...");
            if (allProjects.length > 0) {
              const firstProject = allProjects[0];
              // Rellenamos el formulario con los datos del primer proyecto
              populateFormWithProject(firstProject);
            } else {
              alert("No hay proyectos en la lista para cargar.");
            }
          });
        }

        
        if (deleteAllProjectsBtn) {
          deleteAllProjectsBtn.addEventListener('click', async () => {
            if (confirm('¿Estás seguro de que quieres eliminar TODOS tus proyectos?')) {
              if (confirm('Esta acción es irreversible. ¿Realmente quieres continuar?')) {
                try {
                 
                  const deletePromises = allProjects.map(project => deleteProject(project._id, token));
                  await Promise.all(deletePromises); 
                  loadProjects();
                } catch (error) {
                  alert('Ocurrió un error al intentar eliminar los proyectos.');
                  console.error(error);
                }
              }
            }
          });
        }

        // Lógica para el botón de cancelar edición
        if (cancelBtn) {
          cancelBtn.addEventListener('click', resetForm);
        }

        loadProjects(); // Carga inicial

      } catch (error) {
        console.error("Error al verificar la sesión:", error);
        localStorage.removeItem('authToken'); // Limpiamos el token si es inválido
        sessionStorage.removeItem('usuarioLogueado');
        window.location.href = 'index.html'; // Redirigimos al login
      }
    })(); // Fin de la función autoejecutable
  }

  const logoutButton = document.getElementById('logout-button');

  // --- Lógica de Cierre de Sesión ---
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('usuarioLogueado');
      alert('Has cerrado la sesión exitosamente.');
      window.location.href = 'index.html';
    });
  }
});

//Probar GET /projects/:projectId 
//getPublicProjects("251940").then(console.log).catch(console.error);