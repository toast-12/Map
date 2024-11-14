document.addEventListener('DOMContentLoaded', function () {
    initMap();
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
        routeWhileDragging: true,
        createMarker: function() { return null; } // 마커를 생성하지 않음
    }).addTo(map);
}

function calculateRoute() {
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;

    // 주소를 좌표로 변환 후 경로 계산
    L.Geocoder.nominatim().geocode(start, function (startResults) {
        const startLatLng = startResults[0].center;
        
        L.Geocoder.nominatim().geocode(end, function (endResults) {
            const endLatLng = endResults[0].center;

            // 경로 계산 및 표시
            routeControl.setWaypoints([startLatLng, endLatLng]);

            // 경로 안내 받기 (예시로 간단히 경로 안내 표시)
            routeControl.on('routesfound', function(event) {
                const route = event.routes[0];
                const steps = route.instructions;

                showDirections(steps);
            });
        });
    });
}

function showDirections(steps) {
    const directionsList = document.getElementById('directionsList');
    directionsList.innerHTML = ''; // 기존 경로 목록 초기화

    steps.forEach((step, index) => {
        const div = document.createElement('div');
        div.classList.add('direction-step');
        div.innerText = `${index + 1}. ${step.text}`;
        directionsList.appendChild(div);
    });

    // 드로어 열기
    const drawer = document.querySelector('.directions-container');
    drawer.style.display = 'block';
    drawer.classList.add('expanded');
}
