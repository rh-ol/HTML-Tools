/* MISSION CONTROL - CORE LOGIC
   Version: 1.0 (Git Hosted)
*/

(function() {
    'use strict';
    console.log("🚀 Mission Control: Core Logic loaded from Git.");

    // --- INITIALISIERUNG ---
    function initMissionControl() {
        // 1. Dock bauen
        if (!document.getElementById('mc-dock-container')) {
            const dock = document.createElement('div');
            dock.id = 'mc-dock-container';
            dock.innerHTML = `
                <div class="mc-header">
                    <span class="mc-icon">🛸</span>
                    <span class="mc-label">MISSION CONTROL</span>
                </div>
                <div id="mc-tool-list"></div>
            `;
            document.body.appendChild(dock);
        }

        // 2. Globales API bereitstellen
        window.MissionControl = {
            registerTool: function(name, icon, onClick) {
                const list = document.getElementById('mc-tool-list');
                const item = document.createElement('div');
                item.className = 'mc-tool-item';
                item.innerHTML = `<span class="mc-icon">${icon}</span><span class="mc-label">${name}</span>`;
                item.onclick = onClick;
                list.appendChild(item);
            },
            toggleWindow: function(id, title, html) {
                let win = document.getElementById(id);
                if (win) {
                    win.classList.toggle('active');
                } else {
                    win = document.createElement('div');
                    win.id = id;
                    win.className = 'mc-window active';
                    win.innerHTML = `<h3>${title}</h3>${html}`;
                    document.body.appendChild(win);
                }
            }
        };
        
        console.log("✅ Mission Control: Ready.");
    }

    // Starten
    initMissionControl();
})();
