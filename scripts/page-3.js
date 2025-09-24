const canvas = document.getElementById('ribbon-canvas');
const tooltip = document.getElementById('ribbonTooltip');
const dataPanels = document.querySelectorAll('.data-panel');

const ribbonRenderer = new RibbonRenderer(canvas);

const colorMap = {
    'pl-futurescape': 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
    'pl-glitch': 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
    'pl-dream': 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
    'pl-sensor': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    'pl-web3d': 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    'pl-ai-gen': 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'
};

const playlists = youtubeData.playlists;
const videos = youtubeData.videos;

const isMobile = window.innerWidth <= 768;

videos.forEach((video, index) => {
    const y = ((index + 1) / (videos.length + 1)) * window.innerHeight;

    ribbonRenderer.addRibbon({
        id: `video-${video.id}`,
        type: 'horizontal',
        position: y,
        color: colorMap[video.playlistId] || 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        width: Math.max(20, Math.min(60, 25 + (video.stats.views / 1000))),
        videoData: {
            title: video.title,
            views: video.stats.views,
            likes: video.stats.likes,
            duration: video.duration
        }
    });
});

playlists.forEach((playlist, index) => {
    const x = ((index + 1) / (playlists.length + 1)) * window.innerWidth;
    const playlistVideos = videos.filter(v => v.playlistId === playlist.id);
    const totalViews = playlistVideos.reduce((sum, v) => sum + v.stats.views, 0);

    ribbonRenderer.addRibbon({
        id: `playlist-${playlist.id}`,
        type: 'vertical',
        position: x,
        color: colorMap[playlist.id] || 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        width: Math.max(25, 30 + (playlistVideos.length * 6)),
        videoData: {
            title: playlist.title,
            videoCount: playlistVideos.length,
            totalViews: totalViews,
            description: playlist.description
        }
    });
});

canvas.addEventListener('ribbonHover', (e) => {
    if (e.detail) {
        const { ribbons, x, y } = e.detail;
        const ribbon1 = ribbons[0]?.videoData;
        const ribbon2 = ribbons[1]?.videoData;

        tooltip.innerHTML = `
            <div class="ribbon-tooltip__title">Intersection</div>
            <div class="ribbon-tooltip__meta">
                📹 ${ribbon1?.title || 'Ribbon 1'}<br>
                📁 ${ribbon2?.title || 'Ribbon 2'}
            </div>
        `;

        tooltip.style.left = `${x + 20}px`;
        tooltip.style.top = `${y - 30}px`;
        tooltip.classList.add('visible');
    } else {
        tooltip.classList.remove('visible');
    }
});

const modal = document.getElementById('videoModal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');

function openModal(playlist) {
    const playlistVideos = videos.filter(v => v.playlistId === playlist.id);

    modalBody.innerHTML = `
        <h2 class="video-modal__title">${playlist.title}</h2>
        <p class="video-modal__description">${playlist.description}</p>
        <div class="video-modal__tags">
            ${playlist.tags.map(tag => `<span class="video-modal__tag">${tag}</span>`).join('')}
        </div>
        <div class="video-modal__videos">
            ${playlistVideos.map(video => `
                <div class="video-item">
                    <div class="video-item__title">${video.title}</div>
                    <div class="video-item__meta">
                        ${video.duration} • ${(video.stats.views / 1000).toFixed(1)}K views •
                        ${video.stats.likes} likes
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    modal.classList.add('active');
    gsap.from('.video-modal__content', {
        scale: 0.8,
        opacity: 0,
        duration: 0.4,
        ease: 'back.out(1.7)'
    });
}

closeModal.addEventListener('click', () => {
    gsap.to('.video-modal__content', {
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
            modal.classList.remove('active');
        }
    });
});

modal.querySelector('.video-modal__overlay').addEventListener('click', () => {
    closeModal.click();
});

dataPanels.forEach(panel => {
    const playlistId = panel.getAttribute('data-playlist');
    const playlist = playlists.find(p => p.id === playlistId);

    panel.addEventListener('click', () => {
        if (playlist) {
            openModal(playlist);
        }
    });
});

const tl = gsap.timeline();

tl.from('.dome-grid', {
        opacity: 0,
        scale: 0.8,
        duration: 1.2,
        ease: 'power2.out'
    })
    .from('.data-panel', {
        x: 100,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: 'back.out(1.7)'
    }, '-=0.6');

gsap.to('.data-panel__icon', {
    scale: 1.1,
    duration: 2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    stagger: {
        each: 0.3,
        repeat: -1
    }
});

ribbonRenderer.start();