document.addEventListener('DOMContentLoaded', () => {
    const wrappers = document.querySelectorAll('.image-wrapper');
    const positions = [];
    let mouseX = 0;
    let mouseY = 0;
    let isHovering = false;
    let lastMouseMove = 0;
    let mouseStopTimeout;
    let currentTimelines = [];

    // Initialize GSAP
    gsap.set(wrappers, {
        xPercent: -50,
        yPercent: -50
    });
    
    // Store original image sources
    const imageSources = Array.from(wrappers).map(wrapper => 
        wrapper.querySelector('img').src
    );

    // Function to shuffle array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Function to shuffle image sources
    function shuffleImages() {
        const currentImages = Array.from(wrappers).map(wrapper => 
            wrapper.querySelector('img').src
        );
        const shuffledIndices = shuffleArray([...Array(wrappers.length).keys()]);
        
        // Apply shuffled sources
        wrappers.forEach((wrapper, i) => {
            wrapper.querySelector('img').src = currentImages[shuffledIndices[i]];
        });
    }

    // Function to trigger falling effect
    function triggerFallingEffect() {
        isHovering = false;
        // Clear any existing timelines
        currentTimelines.forEach(tl => tl.kill());
        currentTimelines = [];
        
        // Get wrappers in reverse order (5,4,3,2,1)
        const reversedWrappers = [...wrappers].reverse();
        
        // Animate each wrapper with a delay
        reversedWrappers.forEach((wrapper, index) => {
            // Create timeline for coordinated animation
            const tl = gsap.timeline();
            currentTimelines.push(tl);
            
            // First pause briefly at current position
            tl.to(wrapper, {
                duration: 0.3,
                opacity: 0.5,
                delay: index * 0.08
            })
            // Then start falling
            .to(wrapper, {
                y: window.innerHeight + 100,
                opacity: 0,
                duration: 1.2,
                ease: "power1.in",
                onComplete: () => {
                    wrapper.classList.remove('active');
                }
            });
        });
    }
    // Initialize all wrappers as active but at random positions
    wrappers.forEach((wrapper, i) => {
        wrapper.classList.add('active');
        positions[i] = {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            targetX: 0,
            targetY: 0
        };
    });

    // Mouse move handler
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isHovering = true;

        // Reset falling timeout
        if (mouseStopTimeout) {
            clearTimeout(mouseStopTimeout);
        }

        // Kill any running falling animations
        currentTimelines.forEach(tl => tl.kill());
        currentTimelines = [];

        // Reset wrapper states
        wrappers.forEach(wrapper => {
            wrapper.classList.add('active');
            gsap.to(wrapper, {
                opacity: 1,
                rotation: 0,
                duration: 0.3
            });
        });

        const currentTime = Date.now();
        if (currentTime - lastMouseMove > 50) {
            shuffleImages();
            lastMouseMove = currentTime;
        }

        // First image sticks directly to cursor
        if (positions[0]) {
            positions[0].x = mouseX;
            positions[0].y = mouseY;
            gsap.set(wrappers[0], {
                x: mouseX,
                y: mouseY
            });
        }

        // Set timeout for mouse stop
        mouseStopTimeout = setTimeout(triggerFallingEffect, 100);
    });

    // Animation loop
    function animate() {
        if (isHovering) {
            // Update positions for following images only (starting from index 1)
            for (let i = 1; i < positions.length; i++) {
                const pos = positions[i];
                const prevPos = positions[i - 1];
                const offsetX = -20;
                const offsetY = 0;
                
                // Target position is based on previous image
                pos.targetX = prevPos.x + offsetX;
                pos.targetY = prevPos.y + offsetY;
                
                // Smooth follow movement
                pos.x += (pos.targetX - pos.x) * 0.3;
                pos.y += (pos.targetY - pos.y) * 0.3;

                gsap.set(wrappers[i], {
                    x: pos.x,
                    y: pos.y
                });
            }
        }

        requestAnimationFrame(animate);
    }

    animate();

    // Handle mouse leave
    document.addEventListener('mouseleave', () => {
        if (mouseStopTimeout) {
            clearTimeout(mouseStopTimeout);
        }
        triggerFallingEffect();
    });
});