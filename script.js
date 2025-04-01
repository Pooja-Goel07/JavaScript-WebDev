const progressRange = document.getElementById('project-progress');
const progressValue = document.getElementById('progress-value');

progressRange.addEventListener('input', function () {
    progressValue.textContent = `${this.value}%`;
});


const projectForm = document.getElementById('project-form');
const closeModal = document.getElementById('close-modal');
const projectModal = document.getElementById('project-modal');

addProjectBtn.addEventListener('click', openAddProjectModal);
function openAddProjectModal() {
    projectForm.reset();
    document.getElementById('modal-title').textContent = 'Add New Project';
    document.getElementById('project-id').value = '';
    currentProjectId = null;
    projectModal.style.display = 'block';
}
closeModal.addEventListener('click', closeProjectModal);

function closeProjectModal() {
    projectModal.style.display = 'none';
}

const projectsContainer = document.getElementById('projects-container');
const deleteProjectBtn = document.getElementById('delete-project');

function openAddProjectModal() {
    projectForm.reset();
    document.getElementById('modal-title').textContent = 'Add New Project';
    document.getElementById('project-id').value = '';
    currentProjectId = null;
    updateProgressValue();
    projectModal.style.display = 'block';
}

function closeProjectModal() {
    projectModal.style.display = 'none';
}

function updateProgressValue() {
    progressValue.textContent = `${progressRange.value}%`;
}

function saveProject(e) {
    e.preventDefault();
    
    const projectId = document.getElementById('project-id').value;
    const name = document.getElementById('project-name').value;
    const description = document.getElementById('project-description').value;
    const user = document.getElementById('project-user').value;
    const status = document.getElementById('project-status').value;
    const progress = document.getElementById('project-progress').value;
    const deadline = document.getElementById('project-deadline').value;
    
    const project = {
        id: projectId || Date.now().toString(),
        name,
        description,
        user,
        status,
        progress,
        deadline,
        notes: projectId ? (projects.find(p => p.id === projectId)?.notes || []) : [],
        createdAt: projectId ? (projects.find(p => p.id === projectId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };
    
    if (projectId) {
        // Update existing project
        const index = projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            projects[index] = project;
        }
    } else {
        // Add new project
        projects.push(project);
    }
    
    saveProjects();
    closeProjectModal();
    renderProjects();
}

function renderProjects() {
    projectsContainer.innerHTML = '';
    
    let filteredProjects = projects;
    
    // Apply search filter
    if (searchInput.value) {
        const searchTerm = searchInput.value.toLowerCase();
        filteredProjects = filteredProjects.filter(project => 
            project.name.toLowerCase().includes(searchTerm) || 
            project.description.toLowerCase().includes(searchTerm) ||
            project.user.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply status filter
    if (currentFilter !== 'all') {
        filteredProjects = filteredProjects.filter(project => {
            if (currentFilter === 'in-progress') {
                return project.status === 'in-progress';
            } else if (currentFilter === 'completed') {
                return project.status === 'completed';
            }
            return true;
        });
    }
    
    if (filteredProjects.length === 0) {
        projectsContainer.innerHTML = `
            <div class="no-projects">
                <p>No projects found. Create a new project to get started!</p>
            </div>
        `;
        return;
    }
    
    filteredProjects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.setAttribute('data-id', project.id);
        
        const statusText = {
            'not-started': 'Not Started',
            'in-progress': 'In Progress',
            'completed': 'Completed'
        };
        
        const deadlineFormatted = project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline';
        
        card.innerHTML = `
            <div class="project-card-header">
                <h3 class="project-name">${project.name}</h3>
                <div class="project-user">
                    <div class="user-avatar">${project.user.charAt(0).toUpperCase()}</div>
                    <span>${project.user}</span>
                </div>
            </div>
            <div class="project-card-body">
                <p class="project-description">${project.description}</p>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${project.progress}%"></div>
                </div>
                <div class="project-footer">
                    <span class="project-status status-${project.status}">${statusText[project.status]}</span>
                    <span class="project-deadline">${deadlineFormatted}</span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => openProjectDetails(project.id));
        projectsContainer.appendChild(card);
    });
}
