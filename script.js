document.addEventListener('DOMContentLoaded', function () {
    initMap();
    initializeDrawer();
    document.getElementById('findRoute').addEventListener('click', calculateRoute);
});

let map;
let routeControl;

function initMap() {
    // 지도 초기화
    map = L.map('map').setView([37.5665, 126.978], 13); // 서울 위치로 설정 (예시)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    routeControl = L.Routing.control({
        waypoints: [],
        routeWhileDragging: true
    }).addTo(map);
}

function calculateRoute() {
    // 출발지와 도착지 입력값을 받아서 경로 계산
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;

    // 경로 계산 로직 (여기서는 예시 데이터 사용)
    const routes = [
        { text: `출발지: ${start}` },
        { text: `도착지: ${end}` },
        { text: "이 경로는 예시입니다." }, // 예시 경로
    ];

    showDirections(routes);

    // 경로가 계산되면 실제 지도에서 경로를 그리는 부분
    L.Geocoder.nominatim().geocode(start, function (results) {
        const startLatLng = results[0].center;
        L.Geocoder.nominatim().geocode(end, function (results) {
            const endLatLng = results[0].center;
            routeControl.setWaypoints([startLatLng, endLatLng]); // 실제 경로 설정
        });
    });
}

function showDirections(routes) {
    const directionsList = document.getElementById('directionsList');
    directionsList.innerHTML = ''; // 기존 경로 목록 초기화

    routes.forEach((step) => {
        const div = document.createElement('div');
        div.classList.add('direction-step');
        div.innerText = step.text;
        directionsList.appendChild(div);
    });

    // 드로어 열기
    const drawer = document.querySelector('.directions-container');
    drawer.style.display = 'block';
    drawer.classList.add('expanded');
}

function initializeDrawer() {
    const drawer = document.querySelector('.directions-container');
    let isDragging = false;
    let startY = 0;
    let startTransform = 0;

    // 드로어 터치 시작
    drawer.addEventListener('touchstart', function (e) {
        isDragging = true;
        startY = e.touches[0].clientY;
        startTransform = getCurrentTranslateY();
        drawer.style.transition = 'none';
    });

    // 드로어 터치 이동
    document.addEventListener('touchmove', function (e) {
        if (!isDragging) return;

        const deltaY = e.touches[0].clientY - startY;
        const newTransform = Math.min(
            Math.max(startTransform + deltaY, window.innerHeight * 0.1),
            window.innerHeight - 50
        );

        drawer.style.transform = `translateY(${newTransform}px)`;
    });

    // 드로어 터치 종료
    document.addEventListener('touchend', function () {
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
    });

    // 드로어 클릭시 토글
    drawer.addEventListener('click', function () {
        if (drawer.classList.contains('expanded')) {
            drawer.style.transform = `translateY(${window.innerHeight - 50}px)`;
            drawer.classList.remove('expanded');
        } else {
            drawer.style.transform = `translateY(${window.innerHeight * 0.1}px)`;
            drawer.classList.add('expanded');
        }
    });
}

// 드로어의 현재 Y 위치를 반환하는 함수
function getCurrentTranslateY() {
    const transform = window.getComputedStyle(drawer).transform;
    if (transform === 'none') return 0;
    const matrix = new DOMMatrix(transform);
    return matrix.m42; // Y 변환값 반환
}
