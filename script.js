let routeControl;
let map;
let geocodeCache = {}; // Geocoding 결과 캐시
let timeout; // 디바운스용 타이머
let userIsInKorea = false; // 사용자가 한국에 있는지 여부

document.addEventListener('DOMContentLoaded', function() {
    // 지도 객체 초기화
    map = L.map('map').setView([57.74, 11.94], 13);

    // 지도 타일 레이어 추가
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // routeControl 초기화
    routeControl = L.Routing.control({
        waypoints: [
            L.latLng(57.74, 11.94),
            L.latLng(57.6792, 11.949)
        ],
        routeWhileDragging: true
    }).addTo(map);

    // 모바일 드래그 기능 초기화
    initializeMobileDrawer();

    // 사용자의 IP가 한국에 있는지 확인 후 경로 계산을 허용할지 결정
    checkUserIP();
});

// 사용자 IP 확인 함수
function checkUserIP() {
    fetch('https://ip-api.com/json/')
        .then(response => response.json())
        .then(data => {
            if (data.country === "South Korea") {
                console.log('사용자가 한국에 있습니다.');
                userIsInKorea = true; // 사용자가 한국에 있는 경우
            } else {
                console.log('사용자가 한국에 있지 않습니다. 북한 경로 허용');
                userIsInKorea = false; // 사용자가 한국이 아닌 경우
            }
        })
        .catch(error => {
            console.error('IP 확인 중 오류 발생:', error);
            alert('IP 확인에 실패했습니다.');
        });
}

// 북한 경계 정의
const northKoreaBounds = {
    latMin: 37.5,  // 최소 위도
    latMax: 42.0,  // 최대 위도
    lonMin: 124.5, // 최소 경도
    lonMax: 131.0  // 최대 경도
};

// 좌표가 북한에 포함되는지 확인하는 함수
function isInNorthKorea(lat, lon) {
    return lat >= northKoreaBounds.latMin && lat <= northKoreaBounds.latMax &&
           lon >= northKoreaBounds.lonMin && lon <= northKoreaBounds.lonMax;
}

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

// Geocoding 요청 최적화 (캐시 및 디바운스)
function calculateRoute() {
    if (!routeControl) {
        console.error('routeControl이 초기화되지 않았습니다.');
        return;
    }

    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;

    if (!start || !end) {
        console.error('출발지와 도착지를 입력하세요.');
        return;
    }

    // 캐시에서 시작지와 도착지 좌표를 확인
    const cachedStart = geocodeCache[start];
    const cachedEnd = geocodeCache[end];

    if (cachedStart && cachedEnd) {
        // 캐시된 좌표가 있으면 바로 경로 설정
        routeControl.setWaypoints([cachedStart, cachedEnd]);
    } else {
        // 출발지 주소를 좌표로 변환
        L.Control.Geocoder.nominatim().geocode(start, function(results) {
            if (results.length > 0) {
                const startLatLng = results[0].center;
                geocodeCache[start] = startLatLng; // 캐시에 저장

                // 도착지 주소를 좌표로 변환
                L.Control.Geocoder.nominatim().geocode(end, function(results) {
                    if (results.length > 0) {
                        const endLatLng = results[0].center;
                        geocodeCache[end] = endLatLng; // 캐시에 저장

                        // 사용자가 한국에 있을 때만 북한 경로를 차단
                        if (userIsInKorea) {
                            if (isInNorthKorea(startLatLng.lat, startLatLng.lng) ||
                                isInNorthKorea(endLatLng.lat, endLatLng.lng)) {
                                alert("북한 경로는 한국에서 사용할 수 없습니다.");
                                return; // 경로 계산을 중지
                            }
                        }

                        routeControl.setWaypoints([startLatLng, endLatLng]);
                    } else {
                        console.error('도착지 주소를 찾을 수 없습니다.');
                    }
                });
            } else {
                console.error('출발지 주소를 찾을 수 없습니다.');
            }
        });
    }
}

// 디바운스 함수: 사용자가 입력을 마친 후 일정 시간이 지나면 경로 계산
function debounceGeocode() {
    clearTimeout(timeout);
    timeout = setTimeout(calculateRoute, 500); // 500ms 후에 calculateRoute 호출
}
