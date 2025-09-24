class TreasureHunt {
    constructor() {
        this.treasureDays = new Set();
        this.foundTreasures = new Set();
        this.totalTreasures = 5; // Reduced from 8 to 5 for easier gameplay
        this.isActive = false;
        this.hintsEnabled = false;
        // Don't initialize treasures in constructor
    }

    initTreasures() {
        // Clear previous treasures
        this.treasureDays.clear();
        this.foundTreasures.clear();

        const allDays = document.querySelectorAll('.calendar__day:not(.calendar__day--empty)');

        const indices = [];

        while (indices.length < this.totalTreasures && indices.length < allDays.length) {
            const randomIndex = Math.floor(Math.random() * allDays.length);
            if (!indices.includes(randomIndex)) {
                indices.push(randomIndex);
            }
        }

        indices.forEach(index => {
            const dayElement = allDays[index];
            if (dayElement) {
                const id = `day-${index}`;
                dayElement.dataset.treasureId = id;
                this.treasureDays.add(id);
            }
        });
    }

    start() {
        // Initialize treasures when game starts, not in constructor
        this.initTreasures();
        this.isActive = true;
        this.showProgress();
        this.attachClickHandlers();

        const notification = document.createElement('div');
        notification.className = 'game-notification';
        notification.innerHTML = '🎯 Treasure Hunt Started! Click dates to find hidden treasures!';
        document.body.appendChild(notification);

        gsap.fromTo(notification,
            { y: -100, opacity: 0 },
            { y: 20, opacity: 1, duration: 0.5, ease: 'bounce.out' }
        );

        setTimeout(() => {
            gsap.to(notification, {
                y: -100,
                opacity: 0,
                duration: 0.3,
                onComplete: () => notification.remove()
            });
        }, 3000);
    }

    attachClickHandlers() {
        document.querySelectorAll('.calendar__day:not(.calendar__day--empty)').forEach(day => {
            day.style.cursor = 'pointer';
            day.addEventListener('click', (e) => this.checkTreasure(e));
        });
    }

    checkTreasure(event) {
        if (!this.isActive) return;

        const day = event.currentTarget;
        const treasureId = day.dataset.treasureId;

        if (treasureId && !this.foundTreasures.has(treasureId)) {
            this.foundTreasures.add(treasureId);
            this.createCoinExplosion(day);
            this.updateProgress();

            if (this.foundTreasures.size === this.totalTreasures) {
                this.complete();
            }
        } else if (!treasureId) {
            this.showMissAnimation(day);
            // Give hint after 3 misses
            if (this.getMissCount() >= 3 && !this.hintsEnabled) {
                this.enableHints();
            }
        }
    }

    getMissCount() {
        // Simple counter for missed clicks
        this.missCount = (this.missCount || 0) + 1;
        return this.missCount;
    }

    enableHints() {
        this.hintsEnabled = true;
        // Add warm/cold hints to treasure days
        document.querySelectorAll('.calendar__day').forEach(day => {
            if (day.dataset.treasureId && !this.foundTreasures.has(day.dataset.treasureId)) {
                day.classList.add('treasure-hint');
            }
        });

        // Show hint notification
        const hint = document.createElement('div');
        hint.className = 'game-notification';
        hint.innerHTML = '💡 Hint enabled! Look for the glowing dates!';
        document.body.appendChild(hint);

        gsap.fromTo(hint,
            { y: -100, opacity: 0 },
            { y: 20, opacity: 1, duration: 0.5, ease: 'bounce.out' }
        );

        setTimeout(() => {
            gsap.to(hint, {
                y: -100,
                opacity: 0,
                duration: 0.3,
                onComplete: () => hint.remove()
            });
        }, 3000);
    }

    createCoinExplosion(element) {
        const rect = element.getBoundingClientRect();
        const coins = [];

        for (let i = 0; i < 12; i++) {
            const coin = document.createElement('div');
            coin.className = 'treasure-coin';
            coin.innerHTML = '💰';
            coin.style.position = 'fixed';
            coin.style.left = rect.left + rect.width / 2 + 'px';
            coin.style.top = rect.top + rect.height / 2 + 'px';
            coin.style.fontSize = '24px';
            coin.style.zIndex = '10000';
            coin.style.pointerEvents = 'none';
            document.body.appendChild(coin);
            coins.push(coin);
        }

        const scorePopup = document.createElement('div');
        scorePopup.className = 'score-popup';
        scorePopup.innerHTML = '+100 Coins!';
        scorePopup.style.position = 'fixed';
        scorePopup.style.left = rect.left + rect.width / 2 + 'px';
        scorePopup.style.top = rect.top - 20 + 'px';
        scorePopup.style.transform = 'translateX(-50%)';
        scorePopup.style.color = '#FFD700';
        scorePopup.style.fontWeight = 'bold';
        scorePopup.style.fontSize = '20px';
        scorePopup.style.zIndex = '10001';
        scorePopup.style.pointerEvents = 'none';
        document.body.appendChild(scorePopup);

        coins.forEach((coin, i) => {
            const angle = (i / coins.length) * Math.PI * 2;
            const distance = 100 + Math.random() * 50;

            gsap.to(coin, {
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance - 50,
                rotation: 720,
                scale: 0,
                opacity: 0,
                duration: 1 + Math.random() * 0.5,
                ease: 'power2.out',
                onComplete: () => coin.remove()
            });
        });

        gsap.to(scorePopup, {
            y: -50,
            opacity: 0,
            duration: 1.5,
            ease: 'power2.out',
            onComplete: () => scorePopup.remove()
        });

        element.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
        element.classList.add('treasure-found');
    }

    showMissAnimation(element) {
        gsap.to(element, {
            x: [0, -5, 5, -5, 5, 0],
            duration: 0.3,
            ease: 'power2.inOut'
        });
    }

    showProgress() {
        let progressBar = document.getElementById('treasure-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.id = 'treasure-progress';
            progressBar.className = 'treasure-progress';
            document.querySelector('.calendar__header').appendChild(progressBar);
        }
        this.updateProgress();
    }

    updateProgress() {
        const progressBar = document.getElementById('treasure-progress');
        if (progressBar) {
            progressBar.innerHTML = `
                <span class="treasure-progress__label">🏆 Treasures Found</span>
                <span class="treasure-progress__count">${this.foundTreasures.size} / ${this.totalTreasures}</span>
                <div class="treasure-progress__bar">
                    <div class="treasure-progress__fill" style="width: ${(this.foundTreasures.size / this.totalTreasures) * 100}%"></div>
                </div>
            `;
        }
    }

    complete() {
        this.isActive = false;
        this.createRainbowWave();

        const completion = document.createElement('div');
        completion.className = 'game-completion';
        completion.innerHTML = `
            <h2>🎉 Congratulations!</h2>
            <p>You found all the treasures!</p>
            <p>🌈 Rainbow theme unlocked!</p>
        `;
        document.body.appendChild(completion);

        gsap.fromTo(completion,
            { scale: 0, rotation: -10 },
            {
                scale: 1,
                rotation: 0,
                duration: 0.5,
                ease: 'back.out(1.7)',
                onComplete: () => {
                    setTimeout(() => {
                        gsap.to(completion, {
                            scale: 0,
                            opacity: 0,
                            duration: 0.3,
                            onComplete: () => completion.remove()
                        });
                    }, 3000);
                }
            }
        );
    }

    createRainbowWave() {
        document.querySelectorAll('.calendar__month').forEach((month, index) => {
            gsap.to(month, {
                background: `linear-gradient(${index * 30}deg,
                    hsl(${index * 30}, 70%, 50%),
                    hsl(${index * 30 + 60}, 70%, 50%))`,
                duration: 2,
                delay: index * 0.1,
                ease: 'power2.inOut'
            });
        });
    }

    reset() {
        // Clear game state
        this.treasureDays.clear();
        this.foundTreasures.clear();
        this.isActive = false;
        this.hintsEnabled = false;
        this.missCount = 0;

        // Remove progress bar
        const progressBar = document.getElementById('treasure-progress');
        if (progressBar) {
            progressBar.remove();
        }

        // Remove all treasure markers and hints
        document.querySelectorAll('.calendar__day').forEach(day => {
            delete day.dataset.treasureId;
            day.classList.remove('treasure-found', 'treasure-hint');
            day.style.background = '';
        });

        // Reset calendar month backgrounds
        document.querySelectorAll('.calendar__month').forEach(month => {
            month.style.background = '';
        });
    }
}

class PredictionGame {
    constructor() {
        this.hiddenDays = new Set();
        this.predictions = new Map();
        this.score = 0;
        this.isActive = false;
    }

    start() {
        this.isActive = true;
        this.hideRandomDays();
        this.showInstructions();
    }

    hideRandomDays() {
        const allDays = document.querySelectorAll('.calendar__day:not(.calendar__day--empty)');
        const indices = [];

        while (indices.length < 5) {
            const randomIndex = Math.floor(Math.random() * allDays.length);
            if (!indices.includes(randomIndex)) {
                indices.push(randomIndex);
            }
        }

        indices.forEach(index => {
            const day = allDays[index];
            if (day) {
                const originalData = {
                    background: day.style.backgroundColor,
                    opacity: day.style.opacity,
                    spending: Math.random() * 200
                };

                day.dataset.originalBg = originalData.background;
                day.dataset.originalOpacity = originalData.opacity;
                day.dataset.actualSpending = originalData.spending.toFixed(2);

                this.hiddenDays.add(day);
                this.createMysteryCard(day);
            }
        });
    }

    createMysteryCard(day) {
        day.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
        day.style.opacity = '1';

        const questionMark = document.createElement('div');
        questionMark.className = 'mystery-icon';
        questionMark.innerHTML = '❓';
        questionMark.style.position = 'absolute';
        questionMark.style.fontSize = '20px';
        questionMark.style.top = '50%';
        questionMark.style.left = '50%';
        questionMark.style.transform = 'translate(-50%, -50%)';
        day.appendChild(questionMark);

        gsap.to(questionMark, {
            rotation: 360,
            duration: 2,
            repeat: -1,
            ease: 'none'
        });

        day.addEventListener('click', (e) => this.showPredictionInput(e));
    }

    showPredictionInput(event) {
        if (!this.isActive) return;

        const day = event.currentTarget;
        const actualSpending = parseFloat(day.dataset.actualSpending);

        const modal = document.createElement('div');
        modal.className = 'prediction-modal';
        modal.innerHTML = `
            <div class="prediction-modal__content">
                <h3>💭 Guess the spending amount</h3>
                <input type="number" id="prediction-input" placeholder="Enter amount $" step="0.01">
                <button id="prediction-submit">Submit</button>
                <button id="prediction-cancel">Cancel</button>
            </div>
        `;
        document.body.appendChild(modal);

        // Add event listeners after DOM is created
        const submitBtn = document.getElementById('prediction-submit');
        const cancelBtn = document.getElementById('prediction-cancel');
        const inputField = document.getElementById('prediction-input');

        // Store reference to this for use in event handlers
        const self = this;

        submitBtn.addEventListener('click', function() {
            const guess = parseFloat(inputField.value);
            if (!isNaN(guess) && guess >= 0) {
                self.checkPrediction(actualSpending, modal, day, guess);
            } else {
                alert('Please enter a valid amount!');
            }
        });

        cancelBtn.addEventListener('click', function() {
            modal.remove();
        });

        // Allow Enter key to submit
        inputField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                submitBtn.click();
            }
        });

        // Focus on input field
        inputField.focus();

        gsap.fromTo(modal,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
        );
    }

    checkPrediction(actual, modal, day, guess) {
        const difference = Math.abs(actual - guess);
        const accuracy = Math.max(0, 100 - difference);

        let message, emoji;
        if (difference < 5) {
            message = 'Perfect!';
            emoji = '🎯';
            this.score += 100;
            // Show result first, then fireworks
            this.revealDay(day);
            this.showResult(message, emoji, accuracy, actual, guess);
            setTimeout(() => this.createFireworks(), 500);
        } else if (difference < 20) {
            message = 'Very Close!';
            emoji = '👍';
            this.score += 50;
            this.revealDay(day);
            this.showResult(message, emoji, accuracy, actual, guess);
        } else if (difference < 50) {
            message = 'Almost There!';
            emoji = '😊';
            this.score += 20;
            this.revealDay(day);
            this.showResult(message, emoji, accuracy, actual, guess);
        } else {
            message = 'Keep Trying!';
            emoji = '💪';
            this.score += 5;
            this.revealDay(day);
            this.showResult(message, emoji, accuracy, actual, guess);
        }

        modal.remove();
    }

    revealDay(day) {
        const questionMark = day.querySelector('.mystery-icon');
        if (questionMark) {
            gsap.to(questionMark, {
                scale: 0,
                rotation: 720,
                duration: 0.5,
                onComplete: () => questionMark.remove()
            });
        }

        gsap.to(day, {
            backgroundColor: day.dataset.originalBg,
            opacity: day.dataset.originalOpacity,
            duration: 1,
            ease: 'power2.inOut'
        });
    }

    showResult(message, emoji, accuracy, actual, guess) {
        const result = document.createElement('div');
        result.className = 'prediction-result';
        result.innerHTML = `
            <span class="prediction-result__emoji">${emoji}</span>
            <span class="prediction-result__message">${message}</span>
            <span class="prediction-result__values">
                Your guess: $${guess.toFixed(2)} | Actual: $${actual.toFixed(2)}
            </span>
            <span class="prediction-result__accuracy">Accuracy: ${accuracy.toFixed(0)}%</span>
        `;
        document.body.appendChild(result);

        gsap.fromTo(result,
            { scale: 0, opacity: 0, rotation: -10 },
            {
                scale: 1,
                opacity: 1,
                rotation: 0,
                duration: 0.6,
                ease: 'back.out(1.7)',
                onComplete: () => {
                    setTimeout(() => {
                        gsap.to(result, {
                            scale: 0,
                            opacity: 0,
                            rotation: 10,
                            duration: 0.4,
                            ease: 'back.in(1.7)',
                            onComplete: () => result.remove()
                        });
                    }, 3000); // Show result for 3 seconds
                }
            }
        );
    }

    createFireworks() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#6C5CE7'];
        const fireworks = [];

        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight / 2;

                for (let j = 0; j < 20; j++) {
                    const particle = document.createElement('div');
                    particle.className = 'firework-particle';
                    particle.style.position = 'fixed';
                    particle.style.left = x + 'px';
                    particle.style.top = y + 'px';
                    particle.style.width = '6px';
                    particle.style.height = '6px';
                    particle.style.borderRadius = '50%';
                    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
                    particle.style.zIndex = '10000';
                    document.body.appendChild(particle);

                    const angle = (j / 20) * Math.PI * 2;
                    const distance = 100 + Math.random() * 100;

                    gsap.to(particle, {
                        x: Math.cos(angle) * distance,
                        y: Math.sin(angle) * distance + 50,
                        opacity: 0,
                        scale: 0,
                        duration: 1 + Math.random() * 0.5,
                        ease: 'power2.out',
                        onComplete: () => particle.remove()
                    });
                }
            }, i * 200);
        }
    }

    showInstructions() {
        const instructions = document.createElement('div');
        instructions.className = 'game-instructions';
        instructions.innerHTML = `
            <h3>🎲 Prediction Game</h3>
            <p>Click on mystery dates and guess the spending amount!</p>
            <p>The closer to the actual amount, the higher your score!</p>
        `;
        document.body.appendChild(instructions);

        gsap.fromTo(instructions,
            { x: -300, opacity: 0 },
            { x: 20, opacity: 1, duration: 0.5, ease: 'power2.out' }
        );

        setTimeout(() => {
            gsap.to(instructions, {
                x: -300,
                opacity: 0,
                duration: 0.3,
                onComplete: () => instructions.remove()
            });
        }, 4000);
    }

    reset() {
        // Clear game state
        this.hiddenDays.clear();
        this.predictions.clear();
        this.score = 0;
        this.isActive = false;

        // Remove all mystery markers and restore original day appearance
        document.querySelectorAll('.calendar__day').forEach(day => {
            const mysteryIcon = day.querySelector('.mystery-icon');
            if (mysteryIcon) {
                mysteryIcon.remove();
            }

            // Restore original appearance if it was hidden
            if (day.dataset.originalBg) {
                day.style.backgroundColor = day.dataset.originalBg;
                day.style.opacity = day.dataset.originalOpacity;
                delete day.dataset.originalBg;
                delete day.dataset.originalOpacity;
                delete day.dataset.actualSpending;
            }
        });
    }
}

window.CalendarGames = {
    TreasureHunt,
    PredictionGame
};