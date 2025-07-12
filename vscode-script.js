document.addEventListener('DOMContentLoaded', function() {
    // ====================================================================================
    // Enhanced Command Palette Blur Effect
    //
    // This script adds a blur effect to the background when the VS Code command
    // palette is opened. It's designed to be more performant and resilient
    // to VS Code updates.
    // ====================================================================================

    const body = document.body;
    let commandBlurElement = null;

    /**
     * Applies the blur effect and hides sticky elements.
     */
    function showBlurEffect() {
        if (!commandBlurElement) {
            commandBlurElement = document.createElement("div");
            commandBlurElement.id = 'command-blur';
            commandBlurElement.addEventListener('click', hideBlurEffect);
            document.querySelector(".monaco-workbench").appendChild(commandBlurElement);
        }
        commandBlurElement.style.display = 'block';

        // Hide sticky widgets for a cleaner look
        document.querySelectorAll(".sticky-widget, .monaco-tree-sticky-container").forEach(widget => {
            widget.style.opacity = 0;
        });
    }

    /**
     * Removes the blur effect and restores sticky elements.
     */
    function hideBlurEffect() {
        if (commandBlurElement) {
            commandBlurElement.style.display = 'none';
        }

        // Restore sticky widgets
        document.querySelectorAll(".sticky-widget, .monaco-tree-sticky-container").forEach(widget => {
            widget.style.opacity = 1;
        });
    }

    /**
     * Handles all keydown events for the command palette.
     * @param {KeyboardEvent} event
     */
    function handleKeyDown(event) {
        const isCommandPaletteKey = (event.metaKey || event.ctrlKey) && event.key === 'p';
        const isEscapeKey = event.key === 'Escape' || event.key === 'Esc';

        if (isCommandPaletteKey) {
            event.preventDefault();
            // The observer will handle showing the blur effect.
        } else if (isEscapeKey) {
            // The observer will handle hiding the blur effect.
        }
    }

    // Use a MutationObserver to efficiently detect when the command palette is shown or hidden.
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                for (const node of mutation.addedNodes) {
                    if (node.classList && node.classList.contains('quick-input-widget')) {
                        // Command palette was added to the DOM, start observing its style for changes.
                        observeStyleChanges(node);
                        // If it's already visible, apply the effect.
                        if (node.style.display !== 'none') {
                            showBlurEffect();
                        }
                    }
                }
            }
        }
    });

    /**
     * Observes the style attribute of the command palette to detect visibility changes.
     * @param {HTMLElement} commandPalette
     */
    function observeStyleChanges(commandPalette) {
        const styleObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style') {
                    if (commandPalette.style.display === 'none') {
                        hideBlurEffect();
                    } else {
                        showBlurEffect();
                    }
                }
            });
        });
        styleObserver.observe(commandPalette, { attributes: true, attributeFilter: ['style'] });
    }

    // Start observing the body for the command palette to be added.
    observer.observe(body, { childList: true, subtree: true });

    // Add a single, more efficient event listener for keyboard shortcuts.
    document.addEventListener('keydown', handleKeyDown, true);
});
