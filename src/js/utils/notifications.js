export function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500/90 text-white px-4 py-2 rounded-lg z-50';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

export function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed inset-0 flex items-center justify-center z-50';
    successDiv.innerHTML = `
        <div class="bg-black/90 p-6 rounded-xl border border-[#00ffa3] text-center">
            <div class="text-[#00ffa3] text-xl mb-2">✓</div>
            <div class="text-white">${message}</div>
        </div>
    `;
    document.body.appendChild(successDiv);
    return successDiv;
}