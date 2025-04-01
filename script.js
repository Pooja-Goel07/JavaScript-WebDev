document.addEventListener('DOMContentLoaded', function () {
    //DOM Elements
    const addProjectBtn = document.getElementById('add-project-btn');
    const projectModal = document.getElementById('project-modal');
    const closeModal = document.getElementById('close-modal');
    const projectForm = document.getElementById('project-form');
    const projectsContainer = document.getElementById('projects-container');
    const detailsModal = document.getElementById('details-modal');
    const confirmModal = document.getElementById('confirm-modal');
    const searchInput = document.getElementById('search-input');
    const progressRange = document.getElementById('project-progress');
    const progressValue = document.getElementById('progress-value');
    const newNoteInput = document.getElementById('new-note');
    const notesContainer = document.getElementById('notes-container');

    // Variables
    let projects = JSON.parse(localStorage.getItem('projects')) || [];
    let currentProjectId = null;
    let currentFilter = 'all';

    // Initialize
    renderProjects();
    initTheme();

    //Event Listners
    addProjectBtn.addEventListener('click', openAddProjectModal);
    closeModal.addEventListener('click', closeProjectModal);

    progressRange.addEventListener('input', function () {
        progressValue.textContent = `${this.value}%`;
    });


    

    
    function openAddProjectModal() {
        projectForm.reset();
        document.getElementById('modal-title').textContent = 'Add New Project';
        document.getElementById('project-id').value = '';
        currentProjectId = null;
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
        

        function renderNotes(notes) {
            notesContainer.innerHTML = '';
            
            if (!notes || notes.length === 0) {
                notesContainer.innerHTML = '<p>No notes yet. Add a note to get started.</p>';
                return;
            }
            
            notes.forEach(note => {
                const noteElement = document.createElement('div');
                noteElement.className = 'note';
                
                const date = new Date(note.date).toLocaleString();
                
                noteElement.innerHTML = `
                    <div class="note-date">${date}</div>
                    <p>${note.text}</p>
                `;
                
                notesContainer.appendChild(noteElement);
            });
        }
        function addNote() {
            const noteText = newNoteInput.value.trim();
            if (!noteText) return;
            
            const project = projects.find(p => p.id === currentProjectId);
            if (!project) return;
            
            if (!project.notes) {
                project.notes = [];
            }
            
            project.notes.push({
                id: Date.now().toString(),
                text: noteText,
                date: new Date().toISOString()
            });
            
            saveProjects();
            renderNotes(project.notes);
            newNoteInput.value = '';
        }
    

        function closeDetailsModal() {
            detailsModal.style.display = 'none';
            currentProjectId = null;
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

    function saveProjects() {
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    // Close modals when clicking outside
    window.addEventListener('click', function (event) {
        if (event.target === projectModal) {
            closeProjectModal();
        }
        if (event.target === detailsModal) {
            closeDetailsModal();
        }
        if (event.target === confirmModal) {
            closeConfirmModal();
        }
    });
});
