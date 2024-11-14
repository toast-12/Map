// 지도 초기화
var map = L.map('map').setView([37.5665, 126.978], 13); // 기본 서울 좌표로 설정

// OpenStreetMap 타일 레이어 추가
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Geocoding (주소를 좌표로 변환) 위한 제어 추가
var geocoder = L.Control.Geocoder.nominatim();

// 경로를 계산할 때 사용할 Routing Control
var control;

// 지도에서 주소를 검색하고, 결과를 받아오기 위한 함수
function geocodeAddress(address, callback) {
    geocoder.geocode(address, function(results) {
        if (results.length > 0) {
            var latLng = results[0].center; // 첫 번째 결과의 중심 좌표
            callback(latLng);
        } else {
            alert("주소를 찾을 수 없습니다.");
        }
    });
}

// 경로 계산 함수
function calculateRoute() {
    var start = document.getElementById('start').value; // 출발지
    var end = document.getElementById('end').value; // 도착지

    if (!start || !end) {
        alert('출발지와 도착지를 모두 입력해주세요!');
        return;
    }

    // 이전에 계산된 경로가 있으면 제거
    if (control) {
        map.removeControl(control);
    }

    // 출발지와 도착지를 좌표로 변환하여 경로를 계산
    geocodeAddress(start, function(startLatLng) {
        geocodeAddress(end, function(endLatLng) {
            // 경로 계산 및 지도에 표시
            control = L.Routing.control({
                waypoints: [startLatLng, endLatLng],
                routeWhileDragging: true, // 드래그 시 경로 업데이트
                geocoder: L.Control.Geocoder.nominatim()
            }).addTo(map);

            // 경로 안내를 방향 리스트에 추가
            control.on('routesfound', function(event) {
                var routes = event.routes;
                var directionsList = document.getElementById('directionsList');
                directionsList.innerHTML = ''; // 기존 방향 리스트 초기화

                // 경로의 각 단계들을 나열
                routes[0].instructions.forEach(function(instruction) {
                    var li = document.createElement('li');
                    li.textContent = instruction.text;
                    directionsList.appendChild(li);
                });

                // 방향 안내 박스 표시
                document.getElementById('directions').style.display = 'block';
            });
        });
    });
}
