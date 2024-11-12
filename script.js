document.addEventListener('DOMContentLoaded', function () {
    initMap();
    initializeDrawer();
    document.getElementById('findRoute').addEventListener('click', calculateRoute);
});

function initializeDrawer() {
    const drawer = document.querySelector('.bottom-drawer');
    const handle = document.querySelector('.drawer-handle');
    let startY = 0;
    let startTransform = 0;
    let isDragging = false;

    if (!drawer || !handle) return;

    handle.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    handle.addEventListener('click', toggleDrawer);

    // 초기 상태 설정
    drawer.style.transform = `translateY(${window.innerHeight - 50}px)`;

    function handleTouchStart(e) {
        isDragging = true;
        startY = e.touches[0].clientY;
        startTransform = getCurrentTranslateY();
        drawer.style.transition = 'none';
    }

    function handleTouchMove(e) {
        if (!isDragging) return;

        const deltaY = e.touches[0].clientY - startY;
        const newTransform = Math.min(
            Math.max(startTransform + deltaY, window.innerHeight * 0.1),
            window.innerHeight - 50
        );

        drawer.style.transform = `translateY(${newTransform}px)`;
    }

    function handleTouchEnd() {
        if (!isDragging) return;

        isDragging = false;
        drawer.style.transition = 'transform 0.3s ease-out';

        const currentTranslateY = getCurrentTranslateY();
        const threshold = window.innerHeight * 0.5;

        if (currentTranslateY > threshold) {
            drawer.style.transform = `translateY(${window.innerHeight - 50}px)`;
            drawer.classList.remove('expanded');
        } else {
            drawer.style.transform = `translateY(${window.innerHeight * 0.1}px)`;
            drawer.classList.add('expanded');
        }
    }

    function toggleDrawer() {
        if (drawer.classList.contains('expanded')) {
            drawer.style.transform = `translateY(${window.innerHeight - 50}px)`;
            drawer.classList.remove('expanded');
        } else {
            drawer.style.transform = `translateY(${window.innerHeight * 0.1}px)`;
            drawer.classList.add('expanded');
        }
    }

    function getCurrentTranslateY() {
        const transform = window.getComputedStyle(drawer).transform;
        if (transform === 'none') return 0;
        const matrix = new DOMMatrix(transform);
        return matrix.m42; // Y 변환값 반환
    }
}

function showDirections(routes) {
    const drawer = document.querySelector('.bottom-drawer');
    const directionsList = document.getElementById('directionsList');

    if (!drawer || !directionsList) return;

    directionsList.innerHTML = '';
    routes.forEach((step, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${step.text}`;
        directionsList.appendChild(li);
    });

    // 드로어 열기
    drawer.style.transform = `translateY(${window.innerHeight * 0.1}px)`;
    drawer.classList.add('expanded');
}

// 지도 초기화 후 경로 찾기 이벤트 등록
function calculateRoute() {
    // 지도 경로 계산 로직
    const routes = [
        { text: "Head north on Main St." },
        { text: "Turn right onto 2nd Ave." },
    ]; // 예제 데이터
    showDirections(routes);
}

function initMap() {
    // 지도 초기화 로직
    console.log("Map initialized");
}
