export class ErrorHandler {
    static showComponentError(id, error) {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = `
                <div class="error-container p-4 bg-black/30 border border-red-500/50 rounded-lg backdrop-blur-sm">
                    <div class="flex items-center gap-3 mb-3">
                        <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 class="text-lg font-bold text-red-500">Failed to load component</h3>
                    </div>
                    <p class="text-white/70 mb-4">
                        ${this.getUserFriendlyError(error)}
                    </p>
                    <button onclick="location.reload()" 
                            class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 
                                   rounded-lg text-white transition-colors duration-300">
                        Retry
                    </button>
                </div>
            `;
        }
    }

    static getUserFriendlyError(error) {
        if (error.message.includes('404')) {
            return 'The component could not be found. Please try refreshing the page.';
        }
        if (error.message.includes('network')) {
            return 'There seems to be a network issue. Please check your connection and try again.';
        }
        return 'An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.';
    }

    static logError(componentId, error) {
        console.error(`Component Error (${componentId}):`, {
            timestamp: new Date().toISOString(),
            componentId,
            error: error.message,
            stack: error.stack
        });
    }
} 