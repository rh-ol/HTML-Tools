/* MISSION CONTROL - CORE LOADER
   Lädt das Dock und alle registrierten Module.
*/
(function() {
    'use strict';
    console.log("🚀 Mission Control: Loader started.");

    // DOCK BAUEN
    function createDock() {
        if (document.getElementById('mc-dock-container')) return;
        const dock = document.createElement('div');
        dock.id = 'mc-dock-container';
        dock.innerHTML = `
            <div class="mc-header">
                <span class="mc-icon">🛸</span><span class="mc-label">MISSION CONTROL</span>
            </div>
            <div id="mc-tool-list"></div>
        `;
        document.body.appendChild(dock);
    }

    // API FÜR MODULE
    window.MissionControl = {
        registerTool: function(name, icon, action) {
            const list = document.getElementById('mc-tool-list');
            if(!list) return;
            const item = document.createElement('div');
            item.className = 'mc-tool-item';
            item.innerHTML = `<span class="mc-icon">${icon}</span><span class="mc-label">${name}</span>`;
            item.onclick = action;
            list.appendChild(item);
            console.log(`[MC] Modul geladen: ${name}`);
        }
    };

    createDock();
})();
