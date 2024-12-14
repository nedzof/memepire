export function initializeSubmissions() {
    const submissionsGrid = document.getElementById('submissionsGrid');
    if (!submissionsGrid) return;

    submissionsGrid.innerHTML = '';
    
    // Create exactly 6 submissions (2 rows of 3)
    for (let i = 0; i < 6; i++) {
        const watchTime = Math.floor(Math.random() * 1000);
        const currentViewers = Math.floor(Math.random() * 100);
        const block = document.createElement('div');
        block.className = 'submission-block';
        block.style.animationDelay = `${i * 0.1}s`;
        block.innerHTML = `
            <img src="https://placehold.co/300x300" alt="Submission ${i + 1}" class="w-full h-full object-cover">
            <div class="submission-info">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <div class="rank-badge">#${i + 1}</div>
                        <div class="viewer-count">
                            <svg class="w-4 h-4 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
                            </svg>
                            ${currentViewers}
                        </div>
                    </div>
                    <div class="watch-time">${watchTime}s</div>
                </div>
            </div>
        `;

        // Add hover effect to show submission info
        block.addEventListener('mouseenter', () => {
            const info = block.querySelector('.submission-info');
            if (info) {
                info.style.opacity = '1';
                info.style.transform = 'translateY(0)';
            }
        });

        block.addEventListener('mouseleave', () => {
            const info = block.querySelector('.submission-info');
            if (info) {
                info.style.opacity = '0';
                info.style.transform = 'translateY(10px)';
            }
        });

        // Add click handler to open video modal
        block.addEventListener('click', () => {
            const img = block.querySelector('img');
            if (img) {
                openVideoModal(img.src);
            }
        });

        submissionsGrid.appendChild(block);
    }
}

function openVideoModal(imageSrc) {
    const modal = document.getElementById('videoModal');
    const modalImage = document.getElementById('modalImage');
    if (modal && modalImage) {
        modalImage.src = imageSrc;
        modal.classList.remove('hidden');
        modal.classList.add('modal-open');
    }
} 