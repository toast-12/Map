let map, routeControl, startMarker, endMarker;

function initMap() {
    map = L.map('map').setView([37.5665, 126.9780], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

function createCustomIcon(color, text) {
    return L.divIcon({
        className: 'custom-icon',
        html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${text}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
}

function calculateRoute() {
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;

    if (!start || !end) {
        alert('출발지와 도착지를 입력해주세요.');
        return;
    }

    const geocoder = L.Control.Geocoder.nominatim();

    geocoder.geocode(start, function(startResults) {
        if (!startResults || startResults.length === 0) {
            alert('출발지 주소를 찾을 수 없습니다.');
            return;
        }

        const startLatLng = startResults[0].center;

        if (startMarker) map.removeLayer(startMarker);
        startMarker = L.marker(startLatLng, {icon: createCustomIcon('#4CAF50', '출')}).addTo(map);

        geocoder.geocode(end, function(endResults) {
            if (!endResults || endResults.length === 0) {
                alert('도착지 주소를 찾을 수 없습니다.');
                return;
            }

            const endLatLng = endResults[0].center;

            if (endMarker) map.removeLayer(endMarker);
            endMarker = L.marker(endLatLng, {icon: createCustomIcon('#F44336', '도')}).addTo(map);

            if (routeControl) map.removeControl(routeControl);

            routeControl = L.Routing.control({
                waypoints: [
                    L.latLng(startLatLng),
                    L.latLng(endLatLng)
                ],
                routeWhileDragging: true,
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: true,
                showAlternatives: false
            }).addTo(map);

            routeControl.on('routesfound', function(e) {
                const routes = e.routes[0].instructions;
                const directionsList = document.getElementById('directionsList');
                directionsList.innerHTML = '';
                routes.forEach((step, index) => {
                    const li = document.createElement('li');
                    li.textContent = `${index + 1}. ${step.text}`;
                    directionsList.appendChild(li);
                });
                document.getElementById('directions').style.display = 'block';
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initMap();
    document.getElementById('findRoute').addEventListener('click', calculateRoute);
});

function addDirectionText(text) {
    const li = document.createElement('li');
    
    // 한글과 영문을 구분하여 스타일 적용
    const koreanText = text.match(/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]+/g);
    const englishText = text.match(/[a-zA-Z]+/g);
    
    if (koreanText) {
        text = text.replace(koreanText[0], `<span class="korean-text">${koreanText[0]}</span>`);
    }
    if (englishText) {
        text = text.replace(englishText[0], `<span class="english-text">${englishText[0]}</span>`);
    }
    
    li.innerHTML = text;
    document.getElementById('directionsList').appendChild(li);
}