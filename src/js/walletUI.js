import bsv from './bsv.js';
import { showError, showSuccess } from './utils/notifications.js';

export function initializeWallet() {
    console.log('Starting wallet initialization...');
    
    const wallet = window.wallet;
    if (!wallet) {
        console.error('Wallet instance not found in window object');
        return;
    }

    const walletButton = document.getElementById('walletButton');
    if (!walletButton) {
        console.error('Wallet button not found');
        return;
    }

    const initialSetupModal = document.getElementById('initialSetupModal');
    const mainWalletModal = document.getElementById('mainWalletModal');
    const seedPhraseModal = document.getElementById('seedPhraseModal');
    const passwordSetupModal = document.getElementById('passwordSetupModal');
    const sendModal = document.getElementById('sendModal');
    const receiveModal = document.getElementById('receiveModal');

    // Check if all required modals are found
    if (!initialSetupModal || !mainWalletModal || !seedPhraseModal || 
        !passwordSetupModal || !sendModal || !receiveModal) {
        console.error('One or more required modals not found');
        return;
    }

    let tempMnemonic = ''; // Store mnemonic temporarily during setup

    // Initialize modal states
    console.log('Initializing modal states...');
    [initialSetupModal, mainWalletModal, seedPhraseModal, passwordSetupModal, sendModal, receiveModal].forEach(modal => {
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    });

    // Wallet button click handler
    walletButton.addEventListener('click', () => {
        console.log('Wallet button clicked');
        if (!wallet.isInitialized) {
            initialSetupModal.classList.remove('hidden');
            initialSetupModal.style.display = 'flex';
        } else {
            mainWalletModal.classList.remove('hidden');
            mainWalletModal.style.display = 'flex';
        }
    });

    // Update close buttons behavior
    document.querySelectorAll('[id$="Modal"]').forEach(modal => {
        const closeBtn = modal.querySelector('button[id^="close"]');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.add('hidden');
                modal.style.display = 'none';
                
                // If closing receive or send modal, show main wallet modal
                if (modal.id === 'receiveModal' || modal.id === 'sendModal') {
                    mainWalletModal.classList.remove('hidden');
                    mainWalletModal.style.display = 'flex';
                }
            });
        }
    });

    // Create new wallet flow
    document.getElementById('createNewWalletBtn').addEventListener('click', async () => {
        initialSetupModal.classList.add('hidden');
        initialSetupModal.style.display = 'none';
        seedPhraseModal.classList.remove('hidden');
        seedPhraseModal.style.display = 'flex';

        try {
            // Generate mnemonic but don't initialize wallet yet
            const entropy = new Uint8Array(16);
            window.crypto.getRandomValues(entropy);
            const mnemonic = bsv.Mnemonic.fromEntropy(entropy).toString();
            tempMnemonic = mnemonic; // Store mnemonic
            console.log('Generated mnemonic:', tempMnemonic);
            document.getElementById('seedPhrase').textContent = tempMnemonic;
        } catch (error) {
            console.error('Error generating mnemonic:', error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-red-500 text-sm mt-2';
            errorDiv.textContent = `Error: ${error.message}`;
            document.getElementById('createNewWalletBtn').parentNode.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
        }
    });

    // Seed phrase confirmation
    document.getElementById('seedConfirm').addEventListener('change', (e) => {
        document.getElementById('continueToPassword').disabled = !e.target.checked;
    });

    // Continue to password setup
    document.getElementById('continueToPassword').addEventListener('click', () => {
        if (!tempMnemonic) {
            console.error('No mnemonic available for password setup');
            return;
        }
        seedPhraseModal.classList.add('hidden');
        seedPhraseModal.style.display = 'none';
        passwordSetupModal.classList.remove('hidden');
        passwordSetupModal.style.display = 'flex';
    });

    // Password validation and wallet creation
    const passwordForm = document.getElementById('passwordSetupForm');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const createWalletBtn = document.getElementById('createWallet');
    const passwordStrength = document.getElementById('passwordStrength');
    const passwordMatch = document.getElementById('passwordMatch');

    // Reset form when it becomes visible
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target === passwordSetupModal && 
                mutation.type === 'attributes' && 
                mutation.attributeName === 'style') {
                if (passwordSetupModal.style.display === 'flex') {
                    passwordForm.reset();
                    createWalletBtn.disabled = true;
                    passwordStrength.textContent = '';
                    passwordMatch.textContent = '';
                }
            }
        });
    });

    observer.observe(passwordSetupModal, { attributes: true });

    function validatePasswords() {
        const isStrong = password.value.length >= 8;
        const doMatch = password.value === confirmPassword.value;

        passwordStrength.textContent = isStrong ? 'Strong password' : 'Password must be at least 8 characters';
        passwordStrength.style.color = isStrong ? '#00ffa3' : '#ff3333';

        passwordMatch.textContent = doMatch ? 'Passwords match' : 'Passwords do not match';
        passwordMatch.style.color = doMatch ? '#00ffa3' : '#ff3333';

        createWalletBtn.disabled = !(isStrong && doMatch);
    }

    password.addEventListener('input', validatePasswords);
    confirmPassword.addEventListener('input', validatePasswords);

    // Handle form submission
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (createWalletBtn.disabled) return;
        
        console.log('Password form submitted');
        try {
            if (!tempMnemonic) {
                console.error('No mnemonic available');
                throw new Error('No mnemonic available');
            }
            
            console.log('Using mnemonic:', tempMnemonic);
            createWalletBtn.disabled = true;
            createWalletBtn.textContent = 'Creating...';
            
            const result = await wallet.generateNewWallet(password.value, tempMnemonic);
            console.log('Wallet created successfully:', result);
            
            // Only clear mnemonic after successful wallet creation
            const savedMnemonic = tempMnemonic;
            tempMnemonic = '';
            passwordForm.reset();
            
            // Hide all modals
            [initialSetupModal, seedPhraseModal, passwordSetupModal].forEach(modal => {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            });
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'fixed inset-0 flex items-center justify-center z-50';
            successMessage.innerHTML = `
                <div class="bg-black/90 p-6 rounded-xl border border-[#00ffa3] text-center">
                    <div class="text-[#00ffa3] text-xl mb-2">✓</div>
                    <div class="text-white">Wallet created successfully!</div>
                </div>
            `;
            document.body.appendChild(successMessage);
            
            setTimeout(() => {
                document.body.removeChild(successMessage);
                showMainWallet();
            }, 1500);
            
        } catch (error) {
            console.error('Error creating wallet:', error);
            createWalletBtn.disabled = false;
            createWalletBtn.textContent = 'Create Wallet';
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-red-500 text-sm mt-2';
            errorDiv.textContent = `Error: ${error.message}`;
            createWalletBtn.parentNode.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
            
            // If wallet creation failed, restore the mnemonic
            if (savedMnemonic) {
                tempMnemonic = savedMnemonic;
            }
        }
    });

    // Main wallet modal functionality
    document.getElementById('sendBtn').addEventListener('click', () => {
        mainWalletModal.classList.add('hidden');
        sendModal.classList.remove('hidden');
        sendModal.style.display = 'flex';
        // Update available balance
        availableBalance.textContent = `${wallet.getBalance().toFixed(8)} BSV`;
    });

    document.getElementById('receiveBtn').addEventListener('click', () => {
        const wallet = window.wallet;
        if (!wallet) {
            console.error('Wallet not found');
            showError('Wallet not initialized');
            return;
        }

        try {
            mainWalletModal.classList.add('hidden');
            mainWalletModal.style.display = 'none';
            receiveModal.classList.remove('hidden');
            receiveModal.style.display = 'flex';
            
            const address = wallet.getAddress();
            
            // Update QR Code
            const qrCode = document.getElementById('qrCode');
            if (qrCode) {
                qrCode.innerHTML = ''; // Clear existing QR code
                new QRCode(qrCode, {
                    text: address,
                    width: 180,
                    height: 180,
                    colorDark: '#ffffff',
                    colorLight: '#000000',
                    correctLevel: QRCode.CorrectLevel.H
                });
            }
            
            // Update address display
            const walletAddressElement = document.getElementById('walletAddress');
            if (walletAddressElement) {
                walletAddressElement.textContent = address;
            }
        } catch (error) {
            console.error('Error showing receive modal:', error);
            showError('Failed to display wallet address');
        }
    });

    // Send functionality
    const sendAmount = document.getElementById('sendAmount');
    const recipientAddress = document.getElementById('recipientAddress');
    const confirmSendBtn = document.getElementById('confirmSend');
    const availableBalance = document.getElementById('availableBalance');

    function validateSend() {
        const amount = parseFloat(sendAmount.value);
        const address = recipientAddress.value.trim();
        const isValid = amount > 0 && amount <= wallet.getBalance() && address.length > 0;
        confirmSendBtn.disabled = !isValid;
    }

    sendAmount.addEventListener('input', validateSend);
    recipientAddress.addEventListener('input', validateSend);

    document.getElementById('maxAmount').addEventListener('click', () => {
        sendAmount.value = wallet.getBalance();
        validateSend();
    });

    // Add paste functionality
    document.getElementById('pasteAddress').addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            recipientAddress.value = text;
            validateSend();
        } catch (err) {
            console.error('Failed to read clipboard:', err);
        }
    });

    confirmSendBtn.addEventListener('click', async () => {
        try {
            confirmSendBtn.disabled = true;
            confirmSendBtn.innerHTML = `
                <div class="flex items-center justify-center gap-2">
                    <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Sending...</span>
                </div>
            `;
            
            await wallet.send(recipientAddress.value, parseFloat(sendAmount.value));
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'fixed inset-0 flex items-center justify-center z-50';
            successMessage.innerHTML = `
                <div class="bg-black/90 p-6 rounded-xl border border-[#00ffa3] text-center">
                    <div class="text-[#00ffa3] text-xl mb-2">✓</div>
                    <div class="text-white">Transaction sent successfully!</div>
                </div>
            `;
            document.body.appendChild(successMessage);
            
            setTimeout(() => {
                document.body.removeChild(successMessage);
                sendModal.classList.add('hidden');
                showMainWallet();
            }, 1500);
            
        } catch (error) {
            console.error('Error sending transaction:', error);
            confirmSendBtn.disabled = false;
            confirmSendBtn.innerHTML = '<div class="relative z-10">Send BSV</div>';
            
            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-red-500 text-sm mt-2 text-center';
            errorDiv.textContent = `Error: ${error.message}`;
            confirmSendBtn.parentNode.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
        }
    });

    // Copy address functionality
    document.getElementById('copyAddress').addEventListener('click', () => {
        const walletAddressElement = document.getElementById('walletAddress');
        if (!walletAddressElement) {
            console.error('Wallet address element not found');
            return;
        }

        try {
            navigator.clipboard.writeText(walletAddressElement.textContent).then(() => {
                const copyBtn = document.getElementById('copyAddress');
                const originalContent = copyBtn.innerHTML;
                
                copyBtn.innerHTML = `
                    <svg class="w-5 h-5 text-[#00ffa3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                `;
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalContent;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy address:', err);
                showError('Failed to copy address');
            });
        } catch (error) {
            console.error('Error copying address:', error);
            showError('Failed to copy address');
        }
    });

    // Disconnect wallet
    document.getElementById('disconnectBtn').addEventListener('click', () => {
        wallet.disconnect();
        mainWalletModal.classList.add('hidden');
        connectBtn.textContent = 'Connect Wallet';
    });

    function updateWalletUI() {
        const wallet = window.wallet;
        if (!wallet) {
            console.error('Wallet not found');
            return;
        }

        const walletButton = document.getElementById('walletButton');
        if (!walletButton) {
            console.error('Wallet button not found');
            return;
        }

        const walletText = walletButton.querySelector('.wallet-text');
        if (!walletText) {
            console.error('Wallet text element not found');
            return;
        }

        try {
            if (wallet.isInitialized) {
                walletButton.classList.add('connected');
                const address = wallet.getAddress();
                const balance = wallet.getBalance();
                const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
                walletText.innerHTML = `
                    <span class="balance-display">${balance.toFixed(8)}</span>
                    <span class="address-display">${shortAddress}</span>
                `;
            } else {
                walletButton.classList.remove('connected');
                walletText.textContent = 'Connect Wallet';
            }
        } catch (error) {
            console.error('Error updating wallet UI:', error);
            showError('Failed to update wallet display');
        }
    }

    function showMainWallet() {
        console.log('Showing main wallet UI');
        const wallet = window.wallet;
        
        if (!wallet) {
            console.error('Wallet not found');
            showError('Wallet not initialized');
            return;
        }

        try {
            console.log('Wallet state:', {
                initialized: wallet.isInitialized,
                balance: wallet.getBalance(),
                address: wallet.getAddress()
            });
            
            // Make sure all other modals are hidden
            const modalsToHide = [
                'initialSetupModal',
                'seedPhraseModal',
                'passwordSetupModal',
                'sendModal',
                'receiveModal'
            ];
            
            modalsToHide.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.classList.add('hidden');
                    modal.style.display = 'none';
                }
            });
            
            // Update UI elements
            updateWalletUI();
            
            // Show main wallet modal
            const mainWalletModal = document.getElementById('mainWalletModal');
            if (mainWalletModal) {
                mainWalletModal.classList.remove('hidden');
                mainWalletModal.style.display = 'flex';
            }
            
        } catch (error) {
            console.error('Error showing main wallet:', error);
            showError('Failed to show wallet interface');
        }
    }

    // Import wallet functionality
    const importWalletModal = document.getElementById('importWalletModal');
    const importKey = document.getElementById('importKey');
    const importPassword = document.getElementById('importPassword');
    const confirmImportBtn = document.getElementById('confirmImport');
    const importKeyValidation = document.getElementById('importKeyValidation');

    document.getElementById('importWalletBtn').addEventListener('click', () => {
        initialSetupModal.classList.add('hidden');
        initialSetupModal.style.display = 'none';
        importWalletModal.classList.remove('hidden');
        importWalletModal.style.display = 'flex';
    });

    // Paste functionality for import key
    document.getElementById('pasteImportKey').addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            importKey.value = text;
            validateImportKey();
        } catch (err) {
            console.error('Failed to read clipboard:', err);
        }
    });

    function validateImportKey() {
        const key = importKey.value.trim();
        
        // Check if it's a valid seed phrase (12 words)
        const words = key.split(/\s+/);
        if (words.length === 12) {
            try {
                // Validate mnemonic
                bsv.Mnemonic.fromString(key);
                importKeyValidation.textContent = 'Valid seed phrase detected';
                importKeyValidation.style.color = '#00ffa3';
                confirmImportBtn.disabled = false;
                return;
            } catch (e) {
                console.error('Invalid mnemonic:', e);
            }
        }

        // Check if it's a valid private key (hex format)
        const privateKeyRegex = /^[0-9a-fA-F]{64}$/;
        if (privateKeyRegex.test(key)) {
            importKeyValidation.textContent = 'Valid private key detected';
            importKeyValidation.style.color = '#00ffa3';
            confirmImportBtn.disabled = false;
            return;
        }

        importKeyValidation.textContent = 'Invalid seed phrase or private key';
        importKeyValidation.style.color = '#ff3333';
        confirmImportBtn.disabled = true;
    }

    importKey.addEventListener('input', validateImportKey);

    // Handle import form submission
    document.getElementById('importWalletForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (confirmImportBtn.disabled) return;

        try {
            confirmImportBtn.disabled = true;
            confirmImportBtn.innerHTML = `
                <div class="flex items-center justify-center gap-2">
                    <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Importing...</span>
                </div>
            `;

            const key = importKey.value.trim();
            const password = importPassword.value;

            // Determine if it's a seed phrase or private key
            const words = key.split(/\s+/);
            let result;

            if (words.length === 12) {
                // It's a seed phrase
                result = await wallet.importFromMnemonic(key, password);
            } else {
                // It's a private key
                result = await wallet.importFromPrivateKey(key, password);
            }

            console.log('Wallet imported successfully:', result);

            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'fixed inset-0 flex items-center justify-center z-50';
            successMessage.innerHTML = `
                <div class="bg-black/90 p-6 rounded-xl border border-[#00ffa3] text-center">
                    <div class="text-[#00ffa3] text-xl mb-2">✓</div>
                    <div class="text-white">Wallet imported successfully!</div>
                </div>
            `;
            document.body.appendChild(successMessage);

            // Clear form
            importKey.value = '';
            importPassword.value = '';
            importKeyValidation.textContent = '';
            confirmImportBtn.disabled = true;

            // Hide import modal and show main wallet
            setTimeout(() => {
                document.body.removeChild(successMessage);
                importWalletModal.classList.add('hidden');
                importWalletModal.style.display = 'none';
                showMainWallet();
            }, 1500);

        } catch (error) {
            console.error('Error importing wallet:', error);
            confirmImportBtn.disabled = false;
            confirmImportBtn.innerHTML = '<div class="relative z-10">Import Wallet</div>';

            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-red-500 text-sm mt-2 text-center';
            errorDiv.textContent = `Error: ${error.message}`;
            confirmImportBtn.parentNode.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
        }
    });

    function initializeWalletUI() {
        const walletButton = document.getElementById('walletButton');
        if (!walletButton) {
            console.error('Wallet button not found');
            return;
        }

        walletButton.addEventListener('click', () => {
            if (!window.wallet?.isInitialized) {
                showInitialSetupModal();
            } else {
                // Handle connected wallet click
                // Add your wallet menu logic here
            }
        });
    }

    // Make sure wallet is properly initialized before showing UI
    if (window.wallet && window.wallet.isInitialized) {
        updateWalletUI();
    }
} 