// routeControl 변수 정의 및 초기화
let routeControl;
let map; // map 객체를 추가

document.addEventListener('DOMContentLoaded', function() {
    // 지도 객체 초기화
    map = L.map('map').setView([57.74, 11.94], 13); // 지도 초기화

    // 지도 타일 레이어 추가
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 모바일 드래그 기능 초기화
    console.log('DOMContentLoaded 이벤트 발생');
    initializeMobileDrawer();

    // routeControl 초기화
    routeControl = L.Routing.control({
        waypoints: [
            L.latLng(57.74, 11.94),
            L.latLng(57.6792, 11.949)
        ],
        routeWhileDragging: true
    }).addTo(map);
});

function initializeMobileDrawer() {
    const directionsWrapper = document.querySelector('.directions-wrapper');
    const handle = document.querySelector('.mobile-handle');
    let startY = 0;
    let startTransform = 0;
    let isDragging = false;

    if (!directionsWrapper || !handle) {
        console.log('directionsWrapper 또는 handle 요소를 찾을 수 없습니다.');
        return;
    }

    // 초기 상태 설정
    directionsWrapper.classList.add('collapsed');

    handle.addEventListener('touchstart', function(e) {
        console.log('touchstart 이벤트 발생');
        isDragging = true;
        startY = e.touches[0].clientY;
        startTransform = getTransformValue();
        directionsWrapper.style.transition = 'none';
    });

    document.addEventListener('touchmove', function(e) {
        if (!isDragging) return;

        const deltaY = e.touches[0].clientY - startY;
        const newTransform = Math.min(Math.max(startTransform + deltaY, 0), window.innerHeight - 50);
        directionsWrapper.style.transform = `translateY(${newTransform}px)`;
    });

    document.addEventListener('touchend', function() {
        if (!isDragging) return;
        
        isDragging = false;
        directionsWrapper.style.transition = 'transform 0.3s ease-out';
        
        const currentTransform = getTransformValue();
        if (currentTransform > window.innerHeight / 2) {
            directionsWrapper.classList.add('collapsed');
        } else {
            directionsWrapper.classList.remove('collapsed');
        }
    });

    // 클릭으로도 토글 가능하게
    handle.addEventListener('click', function() {
        directionsWrapper.classList.toggle('collapsed');
    });

    function getTransformValue() {
        console.log('getTransformValue 함수 호출');
        const transform = window.getComputedStyle(directionsWrapper).transform;
        if (transform === 'none') return 0;
        const matrix = new DOMMatrix(transform);
        return matrix.m42; // Y 변환값 반환
    }
}

// 경로 찾기 후 방향 컨테이너 표시
function showDirections(routes) {
    const directionsWrapper = document.querySelector('.directions-wrapper');
    if (directionsWrapper) {
        directionsWrapper.style.display = 'block';
        if (window.innerWidth <= 768) {
            // 모바일에서는 약간 올라온 상태로 표시
            directionsWrapper.classList.remove('collapsed');
            setTimeout(() => {
                directionsWrapper.classList.add('collapsed');
            }, 1000);
        }
    }
}

// 기존 calculateRoute 함수에서 경로를 찾은 후 호출
routeControl.on('routesfound', function(e) {
    const routes = e.routes[0].instructions;
    const directionsList = document.getElementById('directionsList');
    directionsList.innerHTML = '';
    routes.forEach((step, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${step.text}`;
        directionsList.appendChild(li);
    });
    showDirections(routes);
});

function calculateRoute() {
    if (!routeControl) {
        console.error('routeControl이 초기화되지 않았습니다.');
        return;
    }
    // 경로 계산 로직 추가
}
