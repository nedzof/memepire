import { ErrorHandler } from './ErrorHandler.js';

export class ComponentLoader {
    static showLoadingState(id) {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = `
                <div class="loading-state animate-pulse space-y-4">
                    <div class="flex items-center justify-between">
                        <div class="h-8 w-32 bg-white/5 rounded-lg"></div>
                        <div class="h-8 w-24 bg-white/5 rounded-lg"></div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${Array(6).fill().map(() => `
                            <div class="rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm">
                                <div class="aspect-video bg-white/5"></div>
                                <div class="p-4 space-y-3">
                                    <div class="h-4 w-3/4 bg-white/5 rounded"></div>
                                    <div class="h-4 w-1/2 bg-white/5 rounded"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    static async loadComponent(id, path) {
        this.showLoadingState(id);
        try {
            console.log(`Loading component: ${id} from ${path}`);
            const response = await fetch(path);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const html = await response.text();
            document.getElementById(id).innerHTML = html;
            
            await this.onComponentLoaded(id);
            console.log(`Successfully loaded component: ${id}`);
            return true;
        } catch (error) {
            ErrorHandler.logError(id, error);
            ErrorHandler.showComponentError(id, error);
            return false;
        }
    }

    static async onComponentLoaded(id) {
        // Handle post-load initialization
        switch(id) {
            case 'walletModalsContainer':
                document.dispatchEvent(new CustomEvent('walletsLoaded'));
                break;
            case 'mainContentContainer':
                console.log('Main content loaded');
                document.dispatchEvent(new CustomEvent('mainContentLoaded'));
                break;
            case 'headerContainer':
                console.log('Header component loaded');
                document.dispatchEvent(new CustomEvent('headerLoaded'));
                break;
            case 'videoModalContainer':
                console.log('Video modal loaded');
                document.dispatchEvent(new CustomEvent('videoModalLoaded'));
                break;
            // Add more cases as needed
        }
    }

    static async loadAllComponents(components) {
        console.log('Starting to load all components...');
        const results = await Promise.all(
            components.map(component => 
                this.loadComponent(component.id, component.path)
            )
        );
        console.log('Finished loading all components');
        
        // Dispatch event when all components are loaded
        if (results.every(result => result === true)) {
            console.log('All components loaded successfully, dispatching event');
            document.dispatchEvent(new CustomEvent('componentsLoaded'));
            return true;
        }
        return false;
    }
} 