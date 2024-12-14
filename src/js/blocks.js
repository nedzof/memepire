// Initialize state variables
let isAnimating = false;
let currentBlockNumber = 874969;
let upcomingStartNumber = currentBlockNumber + 5;
let pastStartNumber = currentBlockNumber - 1;

// Track images for each block
const blockImages = new Map();

// Initialize images for blocks
function getImageForBlock(blockNumber) {
    if (!blockImages.has(blockNumber)) {
        const imageIndex = (blockNumber % 10) + 1;
        blockImages.set(blockNumber, `images/meme${imageIndex}.jpg`);
    }
    return blockImages.get(blockNumber);
}

export function initializeBlocks() {
    const upcomingBlocks = document.getElementById('upcomingBlocks');
    const pastBlocks = document.getElementById('pastBlocks');
    const optimalCount = getOptimalBlockCount();

    // Clear existing blocks
    upcomingBlocks.innerHTML = '';
    pastBlocks.innerHTML = '';

    // Initialize upcoming blocks
    for (let i = 0; i < optimalCount; i++) {
        const blockNumber = upcomingStartNumber - i;
        const block = document.createElement('div');
        block.className = 'meme-block rounded';
        block.innerHTML = `
            <img src="${getImageForBlock(blockNumber)}" alt="Block" class="w-full h-full object-cover">
            <div class="absolute bottom-0 left-0 right-0 text-xs text-center p-1 bg-black/70">#${blockNumber}</div>
        `;
        upcomingBlocks.appendChild(block);
    }

    // Initialize past blocks
    for (let i = 0; i < optimalCount; i++) {
        const blockNumber = pastStartNumber - i;
        const block = document.createElement('div');
        block.className = 'meme-block rounded';
        block.innerHTML = `
            <img src="${getImageForBlock(blockNumber)}" alt="Block" class="w-full h-full object-cover">
            <div class="absolute bottom-0 left-0 right-0 text-xs text-center p-1 bg-black/70">#${blockNumber}</div>
        `;
        pastBlocks.appendChild(block);
    }

    // Update current meme block number and image
    const currentMeme = document.getElementById('currentMeme');
    const currentMemeNumber = currentMeme.querySelector('.text-xs');
    const currentMemeImage = currentMeme.querySelector('img');
    if (currentMemeNumber) {
        currentMemeNumber.textContent = `#${currentBlockNumber}`;
    }
    if (currentMemeImage && !currentMemeImage.getAttribute('data-initialized')) {
        currentMemeImage.src = getImageForBlock(currentBlockNumber);
        currentMemeImage.setAttribute('data-initialized', 'true');
    }
}

export function getOptimalBlockCount() {
    const viewportWidth = window.innerWidth;
    const blockWidth = 120; // Block width
    const gap = 40; // Gap between blocks
    const containerPadding = 40; // Container padding
    const availableWidth = Math.min(viewportWidth * 0.8, 1200) - (containerPadding * 2); // 80% of viewport width, max 1200px
    return Math.max(3, Math.min(5, Math.floor(availableWidth / (blockWidth + gap))));
}

export function centerBlocks() {
    const containers = [
        document.getElementById('upcomingBlocks'),
        document.getElementById('pastBlocks')
    ];

    containers.forEach(container => {
        container.style.justifyContent = 'center';
        container.style.width = '100%';
        container.style.margin = '0 auto';
    });
}

export function shiftBlocks() {
    if (isAnimating) return;
    isAnimating = true;

    const animationContainer = addAnimationContainer();
    const upcomingBlocks = document.getElementById('upcomingBlocks');
    const currentMeme = document.getElementById('currentMeme');
    const pastBlocks = document.getElementById('pastBlocks');

    // Hide the BEAT THIS button
    const beatButton = currentMeme.querySelector('button');
    beatButton.style.transition = 'opacity 0.3s ease';
    beatButton.style.opacity = '0';
    beatButton.style.pointerEvents = 'none';

    // Get all measurements at once
    const emptySpaceRect = pastBlocks.firstElementChild.getBoundingClientRect();
    const currentRect = currentMeme.getBoundingClientRect();
    const lastUpcoming = upcomingBlocks.lastElementChild;
    const lastUpcomingRect = lastUpcoming.getBoundingClientRect();

    // Create all animated elements at once
    const animations = [];

    // 1. Animate all past blocks
    Array.from(pastBlocks.children).forEach((block, index) => {
        const animated = createAnimatedElement(block);
        animated.style.setProperty('--target-x', '120px');
        animated.classList.add(index === pastBlocks.children.length - 1 ? 'slide-right-fade' : 'slide-right');
        animationContainer.appendChild(animated);
        animations.push(animated);
    });

    // Animate all upcoming blocks except the last one
    Array.from(upcomingBlocks.children).slice(0, -1).forEach(block => {
        const animated = createAnimatedElement(block);
        animated.classList.add('slide-upcoming-right');
        animationContainer.appendChild(animated);
        animations.push(animated);
    });

    // 2. Animate current meme to past
    const animatedCurrent = createAnimatedElement(currentMeme);
    animatedCurrent.style.setProperty('--start-x', `${currentRect.left}px`);
    animatedCurrent.style.setProperty('--start-y', `${currentRect.top}px`);
    animatedCurrent.style.setProperty('--end-x', `${emptySpaceRect.left}px`);
    animatedCurrent.style.setProperty('--end-y', `${emptySpaceRect.top}px`);
    animatedCurrent.classList.add('move-to-past');
    animationContainer.appendChild(animatedCurrent);
    animations.push(animatedCurrent);

    // 3. Animate upcoming to current
    const animatedUpcoming = createAnimatedElement(lastUpcoming);
    animatedUpcoming.style.setProperty('--target-x', `${currentRect.left - lastUpcomingRect.left}px`);
    animatedUpcoming.style.setProperty('--target-y', `${currentRect.top - lastUpcomingRect.top}px`);
    animatedUpcoming.classList.add('move-to-current');
    animationContainer.appendChild(animatedUpcoming);
    animations.push(animatedUpcoming);

    // Hide original blocks during animation
    Array.from(pastBlocks.children).forEach(block => {
        block.style.opacity = '0';
    });

    Array.from(upcomingBlocks.children).forEach(block => {
        block.style.opacity = '0';
    });
    currentMeme.style.opacity = '0';

    // Wait for animations
    setTimeout(() => {
        // Clean up animations
        animations.forEach(el => {
            el.style.opacity = '0';
            setTimeout(() => el.remove(), 300);
        });

        // Remove container after animations complete
        setTimeout(() => {
            if (animationContainer.children.length === 0) {
                animationContainer.remove();
            }
        }, 1600);

        // Update block numbers
        currentBlockNumber++;
        upcomingStartNumber++;
        pastStartNumber++;

        // Update final states
        currentMeme.querySelector('img').src = animatedUpcoming.querySelector('img').src;
        currentMeme.querySelector('.text-xs').textContent = `#${currentBlockNumber}`;
        currentMeme.style.opacity = '1';

        // Re-enable BEAT THIS button
        setTimeout(() => {
            beatButton.style.opacity = '1';
            beatButton.style.pointerEvents = 'auto';
        }, 1600);

        // Reinitialize blocks
        initializeBlocks();
        centerBlocks();
        
        isAnimating = false;
    }, 1300);
}

function createAnimatedElement(sourceElement) {
    const rect = sourceElement.getBoundingClientRect();
    const clone = sourceElement.cloneNode(true);
    clone.className = 'animated-element';
    clone.style.top = `${rect.top}px`;
    clone.style.left = `${rect.left}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    return clone;
}

function addAnimationContainer() {
    let container = document.getElementById('animationContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'animationContainer';
        document.body.appendChild(container);
    }
    return container;
}

// Add resize listener to update blocks when viewport changes
window.addEventListener('resize', () => {
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(() => {
        initializeBlocks();
        centerBlocks();
    }, 250);
}); 