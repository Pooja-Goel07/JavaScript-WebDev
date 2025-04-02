document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const addProjectBtn = document.getElementById('add-project-btn');
    const projectModal = document.getElementById('project-modal');
    const closeModal = document.getElementById('close-modal');
    const projectForm = document.getElementById('project-form');
    const projectsContainer = document.getElementById('projects-container');
    const detailsModal = document.getElementById('details-modal');
    const closeDetails = document.getElementById('close-details');
    const editProjectBtn = document.getElementById('edit-project');
    const deleteProjectBtn = document.getElementById('delete-project');
    const confirmModal = document.getElementById('confirm-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const searchInput = document.getElementById('search-input');
    const navLinks = document.querySelectorAll('.nav-links a');
    const progressRange = document.getElementById('project-progress');
    const progressValue = document.getElementById('progress-value');
    const addNoteBtn = document.getElementById('add-note-btn');
    const newNoteInput = document.getElementById('new-note');
    const notesContainer = document.getElementById('notes-container');

    // Variables
    let projects = JSON.parse(localStorage.getItem('projects')) || [];
    let currentProjectId = null;
    let currentFilter = 'all';

    // Initialize
    renderProjects();

    // Event Listeners
    addProjectBtn.addEventListener('click', openAddProjectModal);
    closeModal.addEventListener('click', closeProjectModal);
    projectForm.addEventListener('submit', saveProject);
    closeDetails.addEventListener('click', closeDetailsModal);
    editProjectBtn.addEventListener('click', editCurrentProject);
    deleteProjectBtn.addEventListener('click', openConfirmModal);
    cancelDeleteBtn.addEventListener('click', closeConfirmModal);
    confirmDeleteBtn.addEventListener('click', deleteCurrentProject);
    searchInput.addEventListener('input', filterProjects);
    progressRange.addEventListener('input', updateProgressValue);
    addNoteBtn.addEventListener('click', addNote);

    // Add event listeners to nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            renderProjects();
        });
    });

    // Functions
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

    function openProjectDetails(projectId) {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        currentProjectId = projectId;
        
        // Update details modal with project info
        document.getElementById('detail-project-name').textContent = project.name;
        document.getElementById('detail-project-description').textContent = project.description;
        document.getElementById('detail-project-user').textContent = project.user;
        
        const statusText = {
            'not-started': 'Not Started',
            'in-progress': 'In Progress',
            'completed': 'Completed'
        };
        
        const statusElement = document.getElementById('detail-project-status');
        statusElement.textContent = statusText[project.status];
        statusElement.className = `status-badge status-${project.status}`;
        
        document.getElementById('detail-project-deadline').textContent = project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline';
        document.getElementById('detail-progress-value').textContent = `${project.progress}%`;
        document.getElementById('detail-progress-bar').style.width = `${project.progress}%`;
        
        // Render notes
        renderNotes(project.notes);
        
        detailsModal.style.display = 'block';
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

    function editCurrentProject() {
        const project = projects.find(p => p.id === currentProjectId);
        if (!project) return;
        
        // Fill form with project data
        document.getElementById('modal-title').textContent = 'Edit Project';
        document.getElementById('project-id').value = project.id;
        document.getElementById('project-name').value = project.name;
        document.getElementById('project-description').value = project.description;
        document.getElementById('project-user').value = project.user;
        document.getElementById('project-status').value = project.status;
        document.getElementById('project-progress').value = project.progress;
        progressValue.textContent = `${project.progress}%`;
        document.getElementById('project-deadline').value = project.deadline || '';
        
        // Close details modal and open project modal
        detailsModal.style.display = 'none';
        projectModal.style.display = 'block';
    }

    function openConfirmModal() {
        confirmModal.style.display = 'block';
    }

    function closeConfirmModal() {
        confirmModal.style.display = 'none';
    }

    function deleteCurrentProject() {
        projects = projects.filter(p => p.id !== currentProjectId);
        saveProjects();
        closeConfirmModal();
        closeDetailsModal();
        renderProjects();
    }

    function filterProjects() {
        renderProjects();
    }

    function saveProjects() {
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
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