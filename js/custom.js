document.addEventListener("DOMContentLoaded", () => {
    // Select the hero title element (we will add the ID to it)
    const titleContainer = document.getElementById("animated-hero-title");
    if (!titleContainer) return;

    // Define the sequence texts
    const codeText = `print("I'm Inzamam-Ul-Haque")`;
    const finalWord1 = "I'm ";
    const finalWord2 = "Inzamam-Ul-Haque";

    // 1. Initial State
    titleContainer.innerHTML = "";
    
    const typingSpan = document.createElement("span");
    typingSpan.className = "typing-text";
    typingSpan.style.color = "#ffffff"; // make code white
    titleContainer.appendChild(typingSpan);

    const cursorSpan = document.createElement("span");
    cursorSpan.className = "cursor";
    cursorSpan.innerText = "|";
    titleContainer.appendChild(cursorSpan);

    let charIndex = 0;
    
    // 2. Typing Animation
    function typeChar() {
        if (charIndex < codeText.length) {
            typingSpan.innerText += codeText.charAt(charIndex);
            charIndex++;
            // Random typing speed
            setTimeout(typeChar, 40 + Math.random() * 60);
        } else {
            // Typing done, show enter button
            setTimeout(showEnterButton, 200);
        }
    }

    // start typing after a short delay
    setTimeout(typeChar, 800);

    let enterBtn;

    // 3. Enter Button Press
    function showEnterButton() {
        enterBtn = document.createElement("kbd");
        enterBtn.className = "enter-btn";
        enterBtn.innerText = "Enter ↵";
        titleContainer.appendChild(enterBtn);

        // Press animation after a short pause
        setTimeout(() => {
            enterBtn.classList.add("pressed");
            setTimeout(() => {
                enterBtn.classList.remove("pressed");
                // Start crumble animation
                setTimeout(startCrumble, 300);
            }, 150);
        }, 800);
    }

    // 4. Earthquake / Crumble Animation
    function startCrumble() {
        cursorSpan.remove(); // remove cursor
        
        const textToCrumble = typingSpan.innerText;
        typingSpan.innerText = "";
        
        const pieces = [];

        // Wrap each char in an absolute span so it can fall
        for (let i = 0; i < textToCrumble.length; i++) {
            const charSpan = document.createElement("span");
            charSpan.innerText = textToCrumble[i] === " " ? "\u00A0" : textToCrumble[i];
            charSpan.style.display = "inline-block";
            charSpan.style.color = "#ffffff";
            typingSpan.appendChild(charSpan);
            pieces.push(charSpan);
        }

        // Add the enter button as a piece
        pieces.push(enterBtn);

        // Calculate layout positions before taking them out of flow
        pieces.forEach(piece => {
            const rect = piece.getBoundingClientRect();
            // Store fixed properties
            piece.dataset.left = rect.left;
            piece.dataset.top = rect.top;
            
            // Random physics properties for each piece
            piece.physics = {
                vx: (Math.random() - 0.5) * 15, // horizontal spread
                vy: (Math.random() * -10) - 2,  // initial jump up
                vz: (Math.random() - 0.5) * 20, // rotation speed
                rot: 0,
                gravity: 0.8
            };
        });

        // Take pieces out of normal flow and append to body so they fall globally
        pieces.forEach(piece => {
            piece.style.position = "fixed";
            piece.style.left = piece.dataset.left + "px";
            piece.style.top = piece.dataset.top + "px";
            // Ensure they sit above everything else
            piece.style.zIndex = "9999"; 
            document.body.appendChild(piece);
        });

        // The original container is now empty, let's remove the typing span
        typingSpan.remove();

        // Physics animation loop
        function fall() {
            let active = false;
            pieces.forEach(piece => {
                // If it's already far below the screen, ignore
                if (parseFloat(piece.style.top) > window.innerHeight + 100) return;

                active = true;
                piece.physics.vy += piece.physics.gravity;
                let top = parseFloat(piece.style.top) + piece.physics.vy;
                let left = parseFloat(piece.style.left) + piece.physics.vx;
                piece.physics.rot += piece.physics.vz;
                
                piece.style.top = top + "px";
                piece.style.left = left + "px";
                piece.style.transform = `rotate(${piece.physics.rot}deg)`;
            });

            if (active) {
                requestAnimationFrame(fall);
            } else {
                // Cleanup pieces after they fall off
                pieces.forEach(p => p.remove());
            }
        }

        requestAnimationFrame(fall);

        // Start dropping the final text while the old ones fall
        setTimeout(dropFinalText, 800);
    }

    // 5. Final Text Drop with Bounce
    function dropFinalText() {
        titleContainer.innerHTML = "";

        function createDropSpans(text, isHighlight) {
            const container = document.createElement("span");
            if (isHighlight) container.style.color = "#ffbd39";

            for(let i=0; i<text.length; i++) {
                const charSpan = document.createElement("span");
                charSpan.innerText = text[i];
                charSpan.className = "drop-char";
                
                // Randomize animation properties
                const delay = Math.random() * 0.4; // 0 to 0.4s delay
                const duration = 0.6 + Math.random() * 0.4; // 0.6 to 1.0s duration
                charSpan.style.animationDelay = `${delay}s`;
                charSpan.style.animationDuration = `${duration}s`;
                
                container.appendChild(charSpan);
            }
            return container;
        }

        titleContainer.appendChild(createDropSpans(finalWord1, false));
        titleContainer.appendChild(createDropSpans(finalWord2, true));
    }
});
