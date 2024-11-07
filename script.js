// 지도 초기화
let map = L.map('map').setView([37.5665, 126.9780], 13); // 서울을 기본으로 설정

// OpenStreetMap 타일 레이어 추가
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let routeControl;
let startMarker, endMarker;

function calculateRoute() {
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;

    if (!start || !end) {
        alert('출발지와 도착지를 입력해주세요.');
        return;
    }

    // Leaflet의 Geocoder 사용하여 주소를 좌표로 변환
    const geocoder = L.Control.Geocoder.nominatim();

    // 출발지 위치 검색
    geocoder.geocode(start, function(results) {
        if (!results || results.length === 0) {
            alert('출발지 주소를 찾을 수 없습니다.');
            return;
        }

        const startLatLng = results[0].center;

        if (startMarker) startMarker.remove();
        startMarker = L.marker(startLatLng, {
            icon: L.divIcon({
                className: 'start-marker',
                html: '출발지'
            })
        }).addTo(map).bindPopup('출발지').openPopup();

        // 도착지 위치 검색
        geocoder.geocode(end, function(results) {
            if (!results || results.length === 0) {
                alert('도착지 주소를 찾을 수 없습니다.');
                return;
            }

            const endLatLng = results[0].center;

            if (endMarker) endMarker.remove();
            endMarker = L.marker(endLatLng, {
                icon: L.divIcon({
                    className: 'end-marker',
                    html: '도착지'
                })
            }).addTo(map).bindPopup('도착지').openPopup();

            // 경로 계산
            if (routeControl) {
                map.removeControl(routeControl);
            }

            routeControl = L.Routing.control({
                waypoints: [
                    L.latLng(startLatLng),
                    L.latLng(endLatLng)
                ],
                createMarker: function() { return null; },
                routeWhileDragging: true
            }).addTo(map);
        });
    });
}
