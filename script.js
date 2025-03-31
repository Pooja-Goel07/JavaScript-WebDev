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
