import { initializeBlocks, centerBlocks, shiftBlocks } from './blocks.js';
import BSVWallet from './BSVWallet.js';
import { initializeWallet } from './walletUI.js';
import bsv from './bsv.js';
import { Wallet } from './bsv.js';

console.log('Main.js loaded');

function initializeApp() {
    console.log('Initializing app...');
    
    // Check if dependencies are loaded
    if (!window.QRCode) {
        console.error('QR Code library not loaded');
        return;
    }

    // Initialize submissions
    setupSubmissionsRefresh();

    // Wait for components to be loaded before initializing other features
    document.addEventListener('componentsLoaded', () => {
        console.log('Components loaded, initializing blocks...');
        initializeBlocks();
        centerBlocks();

        // Initialize wallet
        console.log('Creating wallet instance...');
        window.wallet = new Wallet();
        console.log('Initializing wallet UI...');
        initializeWallet();

        // Add event listeners
        console.log('Setting up event listeners...');
        setupEventListeners();
    });
}

function setupEventListeners() {
    // Add shift blocks button listener
    document.addEventListener('click', (e) => {
        // Handle Shift Blocks button
        if (e.target.closest('.shift-blocks')) {
            console.log('Shifting blocks...');
            shiftBlocks();
        }

        // Handle submission details modal close button
        if (e.target.closest('#closeSubmissionModal')) {
            closeSubmissionModal();
        }

        // Handle submission item clicks
        if (e.target.closest('.submission-item')) {
            const submissionItem = e.target.closest('.submission-item');
            const submission = {
                block: submissionItem.dataset.block,
                rank: submissionItem.dataset.rank,
                watchTime: submissionItem.dataset.watchTime,
                viewers: submissionItem.dataset.viewers,
                txId: submissionItem.dataset.txId,
                videoUrl: submissionItem.dataset.videoUrl
            };
            openSubmissionModal(submission);
        }

        // Handle video modal close button
        if (e.target.closest('#closeModal')) {
            const videoModal = document.getElementById('videoModal');
            if (videoModal) {
                videoModal.style.opacity = '0';
                videoModal.style.transform = 'scale(0.95)';
                videoModal.style.transition = 'all 0.2s ease-out';
                
                setTimeout(() => {
                    videoModal.style.display = 'none';
                    videoModal.classList.add('hidden');
                    videoModal.style.opacity = '';
                    videoModal.style.transform = '';
                }, 200);
            }
        }

        // Handle "Beat This" button
        if (e.target.closest('.beat-button')) {
            const videoModal = document.getElementById('videoModal');
            if (videoModal) {
                videoModal.style.display = 'flex';
                videoModal.classList.remove('hidden');
            }
        }
    });
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function formatTimeAgo(timestamp) {
    const seconds = Math.floor((new Date() - timestamp) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
        }
    }
    
    return 'Just now';
}

function openSubmissionModal(submission) {
    const modal = document.getElementById('submissionDetailsModal');
    if (!modal) {
        console.error('Submission modal not found');
        return;
    }

    // Get all required elements
    const elements = {
        block: document.getElementById('submissionBlock'),
        rank: document.getElementById('submissionRank'),
        watchTime: document.getElementById('submissionWatchTime'),
        viewers: document.getElementById('submissionViewers'),
        txId: document.getElementById('submissionTxId'),
        video: document.getElementById('submissionVideo')
    };

    // Check if all elements exist
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Element ${key} not found in submission modal`);
            return;
        }
    }

    // Update modal content
    try {
        elements.block.textContent = submission.block || '0';
        elements.rank.textContent = `#${submission.rank || '0'}`;
        elements.watchTime.textContent = submission.watchTime || '0';
        elements.viewers.textContent = submission.viewers || '0';
        elements.txId.textContent = submission.txId || '0x0000...0000';
        
        if (elements.video && submission.videoUrl) {
            elements.video.src = submission.videoUrl;
        }

        // Show the modal
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
    } catch (error) {
        console.error('Error updating submission modal:', error);
    }
}

function closeSubmissionModal() {
    const modal = document.getElementById('submissionDetailsModal');
    modal.classList.add('modal-close');
    setTimeout(() => {
        modal.classList.remove('modal-open', 'modal-close');
        modal.classList.add('hidden');
        // Stop live viewer updates
        if (window.liveViewerInterval) {
            clearInterval(window.liveViewerInterval);
        }
    }, 300);
}

function startLiveViewerUpdates(baseCount) {
    if (window.liveViewerInterval) {
        clearInterval(window.liveViewerInterval);
    }
    
    const liveViewersElement = document.getElementById('liveViewers');
    let currentCount = baseCount;
    
    window.liveViewerInterval = setInterval(() => {
        // Random fluctuation between -2% and +2%
        const fluctuation = Math.floor(currentCount * (Math.random() * 0.04 - 0.02));
        currentCount = Math.max(0, currentCount + fluctuation);
        liveViewersElement.textContent = formatNumber(currentCount);
        
        // Add pulse animation on change
        liveViewersElement.classList.add('number-pulse');
        setTimeout(() => liveViewersElement.classList.remove('number-pulse'), 500);
    }, 3000);
}

function createSubmissionElement(submission) {
    const div = document.createElement('div');
    div.className = 'submission-item relative group cursor-pointer';
    div.dataset.block = submission.block;
    div.dataset.rank = submission.rank;
    div.dataset.watchTime = submission.watchTime;
    div.dataset.viewers = submission.viewers;
    div.dataset.txId = submission.txId;
    div.dataset.videoUrl = submission.videoUrl;

    div.innerHTML = `
        <div class="submission-card">
            <div class="submission-thumbnail">
                <div class="play-icon">
                    <svg class="w-12 h-12 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
            <div class="submission-info">
                <div class="flex items-center gap-2 mb-2">
                    <span class="block-number">Block #${submission.block}</span>
                    <span class="rank-badge">#${submission.rank}</span>
                </div>
                <div class="flex items-center gap-3 text-sm text-white/70">
                    <span class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ${submission.watchTime}s
                    </span>
                    <span class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        ${submission.viewers}
                    </span>
                </div>
            </div>
        </div>
    `;

    return div;
}

function initializeSubmissions() {
    const submissionsGrid = document.getElementById('submissionsGrid');
    if (!submissionsGrid) return;

    // Ensure proper grid class
    submissionsGrid.className = 'submissions-grid';
    
    // Clear existing submissions
    submissionsGrid.innerHTML = '';

    // Mock data for submissions (temporary data for testing)
    const submissions = [
        {
            block: '803525',
            rank: '1',
            watchTime: '120',
            viewers: '1.5k',
            txId: '0x1234...5678',
            videoUrl: 'https://example.com/video1.mp4'
        },
        {
            block: '803524',
            rank: '2',
            watchTime: '90',
            viewers: '1.2k',
            txId: '0x5678...9012',
            videoUrl: 'https://example.com/video2.mp4'
        },
        {
            block: '803523',
            rank: '3',
            watchTime: '60',
            viewers: '900',
            txId: '0x9012...3456',
            videoUrl: 'https://example.com/video3.mp4'
        },
        {
            block: '803522',
            rank: '4',
            watchTime: '45',
            viewers: '800',
            txId: '0x3456...7890',
            videoUrl: 'https://example.com/video4.mp4'
        },
        {
            block: '803521',
            rank: '5',
            watchTime: '30',
            viewers: '700',
            txId: '0x7890...1234',
            videoUrl: 'https://example.com/video5.mp4'
        },
        {
            block: '803520',
            rank: '6',
            watchTime: '25',
            viewers: '600',
            txId: '0x1234...5678',
            videoUrl: 'https://example.com/video6.mp4'
        }
    ];

    // Create and append submission items
    submissions.forEach(submission => {
        const submissionElement = createSubmissionElement(submission);
        submissionsGrid.appendChild(submissionElement);
    });
}

function setupSubmissionsRefresh() {
    // Initial load
    initializeSubmissions();
    
    // Refresh every 5 minutes
    setInterval(initializeSubmissions, 300000);
}

// Add a specific event listener for when the main content is loaded
document.addEventListener('mainContentLoaded', () => {
    initializeSubmissions();
});

// Wait for DOM content to be loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

function initializeWalletFunctionality() {
    console.log('Initializing wallet functionality');
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    if (connectWalletBtn) {
        console.log('Found connect wallet button');
        connectWalletBtn.addEventListener('click', () => {
            console.log('Connect wallet clicked');
            const initialSetupModal = document.getElementById('initialSetupModal');
            if (initialSetupModal) {
                initialSetupModal.style.display = 'flex';
            } else {
                console.error('Initial setup modal not found');
            }
        });
    } else {
        console.error('Connect wallet button not found');
    }
}

// Initialize immediately for the connect button
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    setupEventListeners();
});

// Re-initialize when wallet modals are loaded
document.addEventListener('walletsLoaded', () => {
    console.log('Wallets Loaded Event Received');
    initializeWalletFunctionality();
});

function updateWalletButton(isConnected, address = '', balance = '') {
    const walletButton = document.getElementById('walletButton');
    const walletText = walletButton.querySelector('.wallet-text');
    
    if (isConnected) {
        walletButton.classList.add('connected');
        const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
        walletText.innerHTML = `
            <span class="balance-display">${balance}</span>
            <span class="address-display">${shortAddress}</span>
        `;
    } else {
        walletButton.classList.remove('connected');
        walletText.textContent = 'Connect Wallet';
    }
}

// Call this when wallet state changes
function onWalletStateChange(isConnected, address, balance) {
    updateWalletButton(isConnected, address, balance);
} 