// 기존 맵 초기화 코드는 유지...

function initializeDrawer() {
    const drawer = document.querySelector('.bottom-drawer');
    const handle = document.querySelector('.drawer-handle');
    let startY = 0;
    let startTransform = 0;
    let isDragging = false;

    handle.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    handle.addEventListener('click', toggleDrawer);

    function handleTouchStart(e) {
        isDragging = true;
        startY = e.touches[0].clientY;
        startTransform = getCurrentTranslateY();
        drawer.classList.add('dragging');
    }

    function handleTouchMove(e) {
        if (!isDragging) return;
        
        const deltaY = e.touches[0].clientY - startY;
        const newTranslateY = Math.min(
            Math.max(startTransform + deltaY, window.innerHeight * 0.1),
            window.innerHeight - 50
        );
        
        drawer.style.transform = `translateY(${newTranslateY}px)`;
    }

    function handleTouchEnd() {
        if (!isDragging) return;
        
        isDragging = false;
        drawer.classList.remove('dragging');
        
        const currentTranslateY = getCurrentTranslateY();
        const threshold = window.innerHeight * 0.5;

        if (currentTranslateY > threshold) {
            // 드로어 닫기
            drawer.style.transform = `translateY(${window.innerHeight - 50}px)`;
            drawer.classList.remove('expanded');
        } else {
            // 드로어 열기
            drawer.style.transform = `translateY(${window.innerHeight * 0.1}px)`;
            drawer.classList.add('expanded');
        }
    }

    function toggleDrawer() {
        drawer.classList.toggle('expanded');
        if (drawer.classList.contains('expanded')) {
            drawer.style.transform = `translateY(${window.innerHeight * 0.1}px)`;
        } else {
            drawer.style.transform = `translateY(${window.innerHeight - 50}px)`;
        }
    }

    function getCurrentTranslateY() {
        const transform = window.getComputedStyle(drawer).transform;
        if (transform === 'none') return 0;
        const matrix = new DOMMatrix(transform);
        return matrix.m42;
    }
}

// 경로 찾기 결과를 표시할 때 드로어 열기
function showDirections(routes) {
    const drawer = document.querySelector('.bottom-drawer');
    drawer.classList.add('expanded');
    drawer.style.transform = `translateY(${window.innerHeight * 0.1}px)`;
}

document.addEventListener('DOMContentLoaded', function() {
    initMap();
    initializeDrawer();
    document.getElementById('findRoute').addEventListener('click', calculateRoute);
});