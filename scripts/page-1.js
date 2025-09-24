const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const YEAR = 2024;

function getSpendingHue(spending) {
    if (spending === 0) return 200;
    if (spending <= 25) return 180;
    if (spending <= 50) return 120;
    if (spending <= 100) return 60;
    return 0;
}

function getListeningOpacity(minutes) {
    return Math.min(0.2 + (minutes / 180) * 0.8, 1.0);
}

function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
}

function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

function generateSampleData() {
    const data = [];

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        const monthData = {
            month: MONTHS[monthIndex],
            days: []
        };

        for (let day = 1; day <= DAYS_IN_MONTH[monthIndex]; day++) {
            const date = new Date(YEAR, monthIndex, day);
            const spending = Math.random() * 200;
            const listeningMinutes = Math.random() * 240;

            monthData.days.push({
                date,
                spending,
                listeningMinutes
            });
        }

        data.push(monthData);
    }

    return data;
}

function createMonthPanel(monthData, monthIndex) {
    const monthDiv = document.createElement('div');
    monthDiv.className = 'calendar__month';

    const header = document.createElement('h3');
    header.className = 'calendar__month-header';
    header.textContent = monthData.month;
    monthDiv.appendChild(header);

    const weekdaysDiv = document.createElement('div');
    weekdaysDiv.className = 'calendar__weekdays';
    WEEKDAYS.forEach(day => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar__weekday';
        dayDiv.textContent = day;
        weekdaysDiv.appendChild(dayDiv);
    });
    monthDiv.appendChild(weekdaysDiv);

    const dayGrid = document.createElement('div');
    dayGrid.className = 'calendar__day-grid';

    const firstDay = getFirstDayOfMonth(YEAR, monthIndex);
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar__day calendar__day--empty';
        dayGrid.appendChild(emptyDay);
    }

    monthData.days.forEach(dayData => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar__day';

        const hue = getSpendingHue(dayData.spending);
        const opacity = getListeningOpacity(dayData.listeningMinutes);

        dayDiv.style.backgroundColor = `hsl(${hue}, 70%, 50%)`;
        dayDiv.style.opacity = opacity;

        const dayNumber = document.createElement('span');
        dayNumber.className = 'calendar__day-number';
        dayNumber.textContent = dayData.date.getDate();
        dayDiv.appendChild(dayNumber);

        dayDiv.addEventListener('mouseenter', (e) => showTooltip(e, dayData));
        dayDiv.addEventListener('mouseleave', hideTooltip);

        dayGrid.appendChild(dayDiv);
    });

    monthDiv.appendChild(dayGrid);
    return monthDiv;
}

function showTooltip(e, dayData) {
    const tooltip = document.getElementById('tooltip');
    const dateStr = dayData.date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    tooltip.innerHTML = `
        <div class="calendar__tooltip-date">${dateStr}</div>
        <div class="calendar__tooltip-row">
            <span>💰 Spent:</span>
            <span>${formatCurrency(dayData.spending)}</span>
        </div>
        <div class="calendar__tooltip-row">
            <span>🎵 Listened:</span>
            <span>${formatDuration(dayData.listeningMinutes)}</span>
        </div>
    `;

    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) + 'px';
    tooltip.style.top = rect.bottom + 8 + 'px';
    tooltip.style.display = 'block';
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    tooltip.style.display = 'none';
}

function initCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    const data = generateSampleData();

    data.forEach((monthData, index) => {
        const monthPanel = createMonthPanel(monthData, index);
        calendarGrid.appendChild(monthPanel);
    });

    animateCalendar();
}

function animateCalendar() {
    const timeline = gsap.timeline();

    timeline
        .to('.calendar__month', {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: 'power3.out'
        })
        .to('.calendar__day:not(.calendar__day--empty)', {
            scale: 1,
            stagger: {
                amount: 1.2,
                from: 'start',
                grid: 'auto'
            },
            duration: 0.4,
            ease: 'back.out(1.7)'
        }, '-=0.4');
}

document.addEventListener('DOMContentLoaded', () => {
    initCalendar();
});