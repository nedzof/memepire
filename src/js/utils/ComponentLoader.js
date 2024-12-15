import { ErrorHandler } from './ErrorHandler.js';

export class ComponentLoader {
    static async loadComponent(id, path) {
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