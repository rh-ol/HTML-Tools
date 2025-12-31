// ==UserScript==
// @name         Gemini Chat Archiver (V13) - The Hybrid
// @namespace    http://tampermonkey.net/
// @version      13.0.0
// @description  Kombiniert V12 Stabilität mit erweitertem Export (HTML + Markdown)
// @author       Tobias Brugger
// @match        https://gemini.google.com/*
// @grant        none
// ==/UserScript==

/*
################################################################################
# SCRIPT-NAME: chat_archiver_v13_hybrid.js
# AUTHOR:      Tobias Brugger
# VERSION:     13.0.0 (Hybrid Edition)
# TAG:         SE$Y by Tobias Brugger
# LICENSE:
# DESCRIPTION: 1. Basiert auf V12 Core (Iframe-Protection & Smart Scroll).
#              2. NEU: Exportiert zusätzlich als Markdown (.md) für Doku-Zwecke.
#              3. NEU: Verbesserte Timestamp-Erkennung für die Dateinamen.
################################################################################
*/

(function() {
    'use strict';

    // --- SYSTEM ENGINEER CORE (V12 Logic) ---
    if (window.self !== window.top) return; // Iframe Blocker

    const SCROLL_DELAY = 800;
    const BUTTON_ID = "se4y-v13-btn";

    // --- HELPER FUNCTIONS ---
    function show_header() {
        console.clear();
        console.log("========================================================================");
        console.log("  CHAT ARCHIVER - V13 (HYBRID EDITION)");
        console.log("  Author: Tobias Brugger | TAG: SE$Y by Tobias Brugger");
        console.log("========================================================================");
    }

    function getSafeFilename(text) {
        if (!text || text.trim() === "") return "Chat_Export";
        // Datum hinzufügen für Eindeutigkeit
        const dateStr = new Date().toISOString().slice(0,10);
        const safeName = text.replace(/[^a-zA-Z0-9äöüÄÖÜß \-_]/g, "_").trim().substring(0, 60);
        return `${dateStr}_${safeName}`;
    }

    async function imageToBase64(url) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(blob);
            });
        } catch (e) { return null; }
    }

    // --- MARKDOWN CONVERTER (Das Feature aus dem "guten" Beispiel) ---
    function convertToMarkdown(htmlContent, role) {
        // Sehr rudimentärer HTML-to-MD Konverter für den Chat
        let text = htmlContent
            .replace(/<br>/g, "\n")
            .replace(/<p>/g, "\n\n")
            .replace(/<\/p>/g, "")
            .replace(/<b>(.*?)<\/b>/g, "**$1**")
            .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
            .replace(/<i>(.*?)<\/i>/g, "*$1*")
            .replace(/<code>(.*?)<\/code>/g, "`$1`")
            .replace(/<pre.*?>(.*?)<\/pre>/gs, "\n```\n$1\n```\n") // Code Blocks
            .replace(/<[^>]*>/g, ""); // Alle anderen Tags entfernen

        // HTML Entities decodieren
        const txt = document.createElement("textarea");
        txt.innerHTML = text;
        return `\n### ${role}\n${txt.value}\n___`;
    }


    // --- SCROLL ENGINE (V12) ---
    async function smartScroll() {
        const scroller = document.querySelector('main') || document.body;
        scroller.scrollTo(0, 0);
        await new Promise(r => setTimeout(r, 1000));

        let previousHeight = 0;
        let noChangeCount = 0;

        return new Promise(resolve => {
            const timer = setInterval(() => {
                scroller.scrollBy(0, 500);
                const currentHeight = scroller.scrollHeight;
                const currentScroll = scroller.scrollTop + scroller.clientHeight;

                if (currentScroll >= currentHeight - 50) {
                    if (currentHeight === previousHeight) noChangeCount++;
                    else { noChangeCount = 0; previousHeight = currentHeight; }

                    if (noChangeCount >= 3) { clearInterval(timer); resolve(); }
                } else {
                    previousHeight = currentHeight;
                }
            }, SCROLL_DELAY);
        });
    }

    // --- MAIN PROCESS ---
    async function startArchiving() {
        show_header();
        const btn = document.getElementById(BUTTON_ID);
        if(btn) { btn.innerText = "⚙️ Arbeite..."; btn.style.backgroundColor = "#ff9800"; }

        // Titel extrahieren
        let rawTitle = document.title.replace("Gemini - ", "");
        const h1 = document.querySelector('h1');
        if (h1 && h1.innerText.length > 2) rawTitle = h1.innerText;
        const filename = getSafeFilename(rawTitle);

        // 1. Scrollen
        await smartScroll();

        // 2. Extrahieren
        if(btn) btn.innerText = "📄 Generiere...";
        const allBlocks = document.querySelectorAll('.query-content, message-content');
        
        let htmlBody = "";
        let markdownBody = `# Chat-Protokoll: ${rawTitle}\nDatum: ${new Date().toLocaleString()}\n\n`;

        for (let i = 0; i < allBlocks.length; i++) {
            const block = allBlocks[i];
            const isUser = block.classList.contains('query-content');
            const roleName = isUser ? "USER" : "GEMINI";
            const roleClass = isUser ? "user-msg" : "model-msg";
            
            let contentClone = block.cloneNode(true);
            
            // Cleanup UI Elements
            ['.message-actions', 'mat-icon', '.button-container', 'share-button'].forEach(sel => {
                contentClone.querySelectorAll(sel).forEach(el => el.remove());
            });

            // Images to Base64 (HTML only)
            const images = contentClone.querySelectorAll('img');
            for (let img of images) {
                if (img.src && img.src.startsWith('http') && img.width > 50) {
                    const base64 = await imageToBase64(img.src);
                    if (base64) { img.src = base64; img.style.maxWidth = "100%"; }
                }
            }

            // HTML Build
            htmlBody += `
            <div class="message-block ${roleClass}">
                <div class="role-header">${roleName} #${i+1}</div>
                <div class="content">${contentClone.innerHTML}</div>
            </div><hr>`;

            // Markdown Build (Text only)
            markdownBody += convertToMarkdown(contentClone.innerHTML, roleName);
        }

        // 3. Downloads
        // HTML
        const htmlTemplate = `
<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>${rawTitle}</title>
<style>
body{font-family:'Segoe UI',sans-serif;background:#f5f5f5;padding:20px;max-width:900px;margin:0 auto;}
.message-block{background:#fff;padding:20px;border-radius:8px;margin-bottom:15px;box-shadow:0 1px 3px rgba(0,0,0,0.1);}
.user-msg{border-left:5px solid #007bff;background:#e3f2fd;}
.model-msg{border-left:5px solid #ff9800;}
.role-header{font-weight:bold;margin-bottom:10px;color:#555;}
img{max-width:100%;height:auto;border-radius:5px;}
pre{background:#333;color:#fff;padding:10px;overflow-x:auto;border-radius:4px;}
</style></head><body><h1>${rawTitle}</h1>${htmlBody}</body></html>`;

        downloadFile(htmlTemplate, `${filename}.html`, "text/html");
        
        // Markdown (Optional, falls du es willst)
        downloadFile(markdownBody, `${filename}.md`, "text/markdown");

        // 4. Attachments Check
        const files = document.querySelectorAll('a.file-item, a[href*="drive.google.com"]');
        if (files.length > 0) {
            console.log("Anhänge gefunden - bitte manuell prüfen.");
        }

        if(btn) {
            btn.innerText = "✅ Fertig";
            btn.style.backgroundColor = "#4caf50";
            setTimeout(() => { btn.innerText = "💾 V13 Start"; btn.style.backgroundColor = "#d32f2f"; }, 3000);
        }
    }

    function downloadFile(content, name, mime) {
        const blob = new Blob([content], { type: `${mime};charset=utf-8` });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // --- UI MANAGER ---
    function ensureButton() {
        if (document.getElementById(BUTTON_ID)) return;
        const btn = document.createElement("button");
        btn.id = BUTTON_ID;
        btn.innerHTML = "💾 V13 Start";
        btn.setAttribute("style", "position:fixed!important;bottom:20px!important;right:20px!important;z-index:999999!important;padding:12px 20px!important;background:#d32f2f!important;color:#fff!important;border:2px solid #fff!important;border-radius:8px!important;font-weight:bold!important;cursor:pointer!important;box-shadow:0 4px 10px rgba(0,0,0,0.3)!important;");
        btn.onclick = startArchiving;
        document.body.appendChild(btn);
    }
    
    setInterval(ensureButton, 2000);

})();
