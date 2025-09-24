let spotifyData = [];
let glitchSketch;

class DataStream {
    constructor(text, y, speed, layer) {
        this.originalText = text;
        this.text = text;
        this.x = layer % 2 === 0 ? window.innerWidth : -text.length * 10;
        this.y = y;
        this.speed = speed;
        this.layer = layer;
        this.glitchAmount = 0;
        this.opacity = 0.7 + Math.random() * 0.3;
        this.direction = layer % 2 === 0 ? -1 : 1;
    }

    scrambleText() {
        const chars = '█▓▒░⣿⣾⣽⣻⣺⣹⣸⣷⣶⣵⣴⣳⣲⣱⣰';
        const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?~/';
        let result = '';

        for (let i = 0; i < this.originalText.length; i++) {
            if (Math.random() < this.glitchAmount) {
                result += Math.random() > 0.5 ?
                    chars.charAt(Math.floor(Math.random() * chars.length)) :
                    glitchChars.charAt(Math.floor(Math.random() * glitchChars.length));
            } else if (Math.random() < 0.1) {
                result += this.originalText.charAt(i).toUpperCase();
            } else {
                result += this.originalText.charAt(i);
            }
        }

        this.text = result;
    }

    update() {
        this.x += this.speed * this.direction;

        if (this.direction > 0 && this.x > window.innerWidth + 100) {
            this.x = -this.originalText.length * 10;
        } else if (this.direction < 0 && this.x < -this.originalText.length * 10) {
            this.x = window.innerWidth + 100;
        }

        if (Math.random() < 0.05) {
            this.glitchAmount = Math.random() * 0.6;
            this.scrambleText();
        } else if (this.glitchAmount > 0) {
            this.glitchAmount *= 0.85;
            if (this.glitchAmount < 0.01) {
                this.glitchAmount = 0;
                this.text = this.originalText;
            } else {
                this.scrambleText();
            }
        }
    }

    display(p) {
        p.push();
        p.fill(255, this.opacity * 255);
        p.noStroke();

        if (this.glitchAmount > 0) {
            p.fill(
                200 + Math.random() * 55,
                100 + Math.random() * 155,
                255,
                this.opacity * 255
            );

            if (Math.random() < 0.3) {
                p.push();
                p.translate(Math.random() * 4 - 2, 0);
                p.fill(255, 0, 100, this.opacity * 128);
                p.text(this.text, this.x + 2, this.y);
                p.pop();

                p.push();
                p.translate(Math.random() * 4 - 2, 0);
                p.fill(0, 255, 255, this.opacity * 128);
                p.text(this.text, this.x - 2, this.y);
                p.pop();
            }
        }

        p.text(this.text, this.x, this.y);
        p.pop();
    }
}

function preprocessSpotifyData(data) {
    return data.filter(item => item.master_metadata_track_name).map(item => {
        const duration = Math.floor(item.ms_played / 1000);
        const artist = item.master_metadata_album_artist_name || 'Unknown';
        const track = item.master_metadata_track_name || 'Unknown';
        const platform = item.platform?.toUpperCase() || 'N/A';
        const skipped = item.skipped ? '[SKIP]' : '[PLAY]';

        return {
            display: `${skipped} ${track} — ${artist} | ${duration}s | ${platform}`,
            duration: item.ms_played,
            skipped: item.skipped
        };
    });
}

function createDataStreams(processedData, numLayers = 8) {
    const streams = [];
    const layerHeight = window.innerHeight / numLayers;

    for (let i = 0; i < numLayers; i++) {
        const item = processedData[Math.floor(Math.random() * processedData.length)];

        const speedVariation = Math.random();
        let speed;
        if (speedVariation < 0.2) {
            speed = 0.3 + Math.random() * 0.7;
        } else if (speedVariation < 0.5) {
            speed = 1.5 + Math.random() * 2;
        } else {
            speed = 4 + Math.random() * 4;
        }

        const stream = new DataStream(
            item.display,
            layerHeight * i + layerHeight / 2,
            speed,
            i
        );
        streams.push(stream);
    }

    return streams;
}

fetch('assets/data/Streaming_History_Audio_2023-2025_0.json')
    .then(response => {
        console.log('Fetch response:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Loaded data items:', data.length);
        spotifyData = preprocessSpotifyData(data);
        console.log('Processed data items:', spotifyData.length);
        console.log('Sample data:', spotifyData.slice(0, 3));
        initGlitchSketch();
    })
    .catch(error => {
        console.error('Error loading Spotify data:', error);
        console.log('Attempting to use fallback data...');
        spotifyData = [
            { display: '[PLAY] Sample Track 1 — Artist Name | 180s | IOS', duration: 180000, skipped: false },
            { display: '[SKIP] Sample Track 2 — Another Artist | 45s | ANDROID', duration: 45000, skipped: true },
            { display: '[PLAY] Sample Track 3 — Cool Band | 240s | WEB', duration: 240000, skipped: false },
            { display: '[PLAY] Beautiful Song — Great Artist | 200s | IOS', duration: 200000, skipped: false },
            { display: '[SKIP] Quick Track — Speed Band | 30s | WEB', duration: 30000, skipped: true }
        ];
        initGlitchSketch();
    });

function initGlitchSketch() {
    console.log('Initializing glitch sketch with', spotifyData.length, 'items');

    glitchSketch = function(p) {
        let streams = [];
        let glitchLines = [];
        let noiseOffset = 0;

        p.setup = function() {
            const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
            canvas.parent('glitch-canvas-container');

            const canvasElement = document.querySelector('#glitch-canvas-container canvas');
            if (canvasElement) {
                const ctx = canvasElement.getContext('2d', { willReadFrequently: true });
            }

            p.textFont('Courier New, monospace');
            p.textSize(16);
            p.textAlign(p.LEFT, p.CENTER);

            streams = createDataStreams(spotifyData, 40);
            console.log('Created', streams.length, 'streams');
        };

        p.draw = function() {
            p.background(10, 12, 16);

            if (Math.random() < 0.1) {
                applyGlitchEffect(p);
            }

            streams.forEach(stream => {
                stream.update();
                stream.display(p);
            });

            if (Math.random() < 0.02) {
                const randomIndex = Math.floor(Math.random() * streams.length);
                const newData = spotifyData[Math.floor(Math.random() * spotifyData.length)];

                const speedVariation = Math.random();
                let newSpeed;
                if (speedVariation < 0.2) {
                    newSpeed = 0.3 + Math.random() * 0.7;
                } else if (speedVariation < 0.5) {
                    newSpeed = 1.5 + Math.random() * 2;
                } else {
                    newSpeed = 4 + Math.random() * 4;
                }

                streams[randomIndex] = new DataStream(
                    newData.display,
                    streams[randomIndex].y,
                    newSpeed,
                    streams[randomIndex].layer
                );
            }

            drawGlitchLines(p);
        };

        function applyGlitchEffect(p) {
            const sliceHeight = 20 + Math.floor(Math.random() * 50);
            const yPos = Math.floor(Math.random() * (window.innerHeight - sliceHeight));
            const displacement = Math.random() * 40 - 20;

            p.push();
            p.copy(
                0, yPos, window.innerWidth, sliceHeight,
                displacement, yPos, window.innerWidth, sliceHeight
            );
            p.pop();

            if (Math.random() < 0.5) {
                glitchLines.push({
                    y: yPos,
                    height: sliceHeight,
                    offset: displacement,
                    life: 1.0
                });
            }
        }

        function drawGlitchLines(p) {
            glitchLines.forEach((line, index) => {
                p.push();
                p.noFill();
                p.stroke(255, 0, 100, line.life * 100);
                p.strokeWeight(2);
                p.line(0, line.y, window.innerWidth, line.y);
                p.line(0, line.y + line.height, window.innerWidth, line.y + line.height);
                p.pop();

                line.life -= 0.05;
            });

            glitchLines = glitchLines.filter(line => line.life > 0);
        }

        p.windowResized = function() {
            p.resizeCanvas(window.innerWidth, window.innerHeight);
            streams = createDataStreams(spotifyData, 40);
        };
    };

    new p5(glitchSketch);
    console.log('p5 sketch initialized');
}