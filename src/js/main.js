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

    // Initialize blocks
    console.log('Initializing blocks...');
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
}

function setupEventListeners() {
    // Add shift blocks button listener
    const shiftButton = document.querySelector('.shift-blocks');
    if (shiftButton) {
        shiftButton.addEventListener('click', shiftBlocks);
    }

    // Initialize video modal functionality
    const videoModal = document.getElementById('videoModal');
    const beatButton = document.querySelector('.beat-button');
    const closeModal = document.getElementById('closeModal');
    const generateVideo = document.getElementById('generateVideo');
    const startOver = document.getElementById('startOver');
    const signBroadcast = document.getElementById('signBroadcast');

    if (beatButton) {
        beatButton.addEventListener('click', () => {
            videoModal.classList.remove('hidden');
            videoModal.classList.add('modal-open');
            document.getElementById('promptStep').style.display = 'block';
            document.getElementById('generatingStep').style.display = 'none';
            document.getElementById('previewStep').style.display = 'none';
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            videoModal.classList.add('modal-close');
            setTimeout(() => {
                videoModal.classList.remove('modal-open', 'modal-close');
                videoModal.classList.add('hidden');
            }, 300);
        });
    }

    if (generateVideo) {
        generateVideo.addEventListener('click', () => {
            document.getElementById('promptStep').style.display = 'none';
            document.getElementById('generatingStep').style.display = 'block';
            
            // Simulate video generation
            setTimeout(() => {
                document.getElementById('generatingStep').style.display = 'none';
                document.getElementById('previewStep').style.display = 'block';
            }, 3000);
        });
    }

    if (startOver) {
        startOver.addEventListener('click', () => {
            document.getElementById('previewStep').style.display = 'none';
            document.getElementById('promptStep').style.display = 'block';
            document.getElementById('promptText').value = '';
        });
    }

    if (signBroadcast) {
        signBroadcast.addEventListener('click', () => {
            if (!window.wallet?.isInitialized) {
                videoModal.classList.add('hidden');
                document.getElementById('initialSetupModal').classList.remove('hidden');
                document.getElementById('initialSetupModal').style.display = 'flex';
                return;
            }
            // Handle signing and broadcasting
            videoModal.classList.add('modal-close');
            setTimeout(() => {
                videoModal.classList.remove('modal-open', 'modal-close');
                videoModal.classList.add('hidden');
            }, 300);
        });
    }

    // Add resize listener
    window.addEventListener('resize', () => {
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(() => {
            initializeBlocks();
            centerBlocks();
        }, 250);
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

function openSubmissionModal(submissionData) {
    const modal = document.getElementById('submissionDetailsModal');
    
    // Update modal content with submission data
    document.getElementById('submissionBlockNumber').textContent = `#${submissionData.blockNumber}`;
    document.getElementById('submissionVideo').src = submissionData.videoUrl;
    document.getElementById('submissionVideo').poster = submissionData.thumbnail;
    
    document.getElementById('submissionTimestamp').textContent = formatTimeAgo(submissionData.timestamp);
    document.getElementById('creatorAddress').textContent = submissionData.creator;
    document.getElementById('creatorRank').textContent = `Top Creator #${submissionData.creatorRank}`;
    
    document.getElementById('totalWatchTime').textContent = (submissionData.totalWatchTimeSeconds / 3600).toFixed(1);
    document.getElementById('totalViews').textContent = formatNumber(submissionData.totalViews);
    document.getElementById('submissionRank').textContent = `#${submissionData.rank}`;
    document.getElementById('liveViewers').textContent = formatNumber(submissionData.liveViewers);
    
    document.getElementById('avgWatchTime').textContent = `${Math.round(submissionData.avgWatchTimeSeconds)}s`;
    document.getElementById('peakViewers').textContent = formatNumber(submissionData.peakViewers);
    document.getElementById('retentionRate').textContent = `${Math.round(submissionData.retentionRate * 100)}%`;

    // Show modal with animation
    modal.classList.remove('hidden');
    modal.classList.add('modal-open');

    // Start live viewer count updates
    startLiveViewerUpdates(submissionData.liveViewers);
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

function initializeSubmissions() {
    const submissionsGrid = document.getElementById('submissionsGrid');
    if (!submissionsGrid) return;

    submissionsGrid.innerHTML = '';
    
    // Create 12 submissions (2 rows of 6)
    for (let i = 0; i < 12; i++) {
        const watchTime = (Math.random() * 10).toFixed(1);
        const currentViewers = Math.floor(Math.random() * 100);
        const block = document.createElement('div');
        block.className = 'submission-block';
        block.style.animationDelay = `${i * 0.1}s`;

        // Generate a random hue for the thumbnail gradient
        const hue = Math.floor(Math.random() * 360);
        
        // Create mock submission data
        const mockData = {
            blockNumber: 803525 - i,
            videoUrl: 'https://placehold.co/400x400',
            thumbnail: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23000' fill-opacity='0.2'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='rgba(0, 255, 163, 0.5)' text-anchor='middle' dominant-baseline='middle'%3EVideo %23${i + 1}%3C/text%3E%3C/svg%3E`,
            timestamp: new Date(Date.now() - Math.random() * 86400000 * 7), // Random time in the last week
            creator: `Creator${i + 1}.sol`,
            creatorRank: Math.floor(Math.random() * 100) + 1,
            totalWatchTimeSeconds: Math.floor(Math.random() * 36000), // Up to 10 hours
            totalViews: Math.floor(Math.random() * 10000),
            rank: i + 1,
            liveViewers: currentViewers,
            avgWatchTimeSeconds: Math.floor(Math.random() * 300), // Up to 5 minutes
            peakViewers: Math.floor(Math.random() * 2000),
            retentionRate: Math.random() * 0.3 + 0.7 // 70-100%
        };
        
        block.innerHTML = `
            <div class="thumbnail" style="background: linear-gradient(135deg, 
                hsla(${hue}, 100%, 50%, 0.1), 
                hsla(${hue + 30}, 100%, 50%, 0.05)
            )">
                <video src="${mockData.videoUrl}" class="w-full h-full object-cover" preload="none" poster="${mockData.thumbnail}"></video>
                <div class="watch-banner">
                    <div class="watch-count">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
                        </svg>
                        <span class="watching-now">${currentViewers}</span> watching
                    </div>
                </div>
                <div class="play-indicator">
                    <svg class="w-8 h-8" fill="none" stroke="rgba(0, 255, 163, 0.8)" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div class="submission-info">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-2">
                            <div class="rank-badge">#${i + 1}</div>
                            <div class="text-sm text-gray-400">Block #${mockData.blockNumber}</div>
                        </div>
                        <div class="watch-time">${watchTime}s</div>
                    </div>
                </div>
            </div>
        `;

        // Add click handler to open modal
        block.addEventListener('click', () => openSubmissionModal(mockData));

        // Add hover effects
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

        // Simulate real-time viewer count updates
        setInterval(() => {
            const watchingNow = block.querySelector('.watching-now');
            if (watchingNow) {
                const currentCount = parseInt(watchingNow.textContent);
                const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
                watchingNow.textContent = Math.max(0, currentCount + delta);
                mockData.liveViewers = Math.max(0, currentCount + delta);
            }
        }, 2000 + Math.random() * 2000);

        submissionsGrid.appendChild(block);
    }

    // Add modal close handler
    document.getElementById('closeSubmissionModal')?.addEventListener('click', closeSubmissionModal);
}

// Initialize submissions on page load and refresh every minute
window.addEventListener('DOMContentLoaded', () => {
    initializeSubmissions();
    setInterval(initializeSubmissions, 60000);
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
    initializeWalletFunctionality();
});

// Re-initialize when wallet modals are loaded
document.addEventListener('walletsLoaded', () => {
    console.log('Wallets Loaded Event Received');
    initializeWalletFunctionality();
}); 