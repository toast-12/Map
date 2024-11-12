let map, routeControl;

function initMap() {
    map = L.map('map').setView([37.5665, 126.9780], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
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
        if (startResults.length === 0) {
            alert('출발지를 찾을 수 없습니다.');
            return;
        }
        const startLatLng = startResults[0].center;

        geocoder.geocode(end, function(endResults) {
            if (endResults.length === 0) {
                alert('도착지를 찾을 수 없습니다.');
                return;
            }
            const endLatLng = endResults[0].center;

            if (routeControl) {
                map.removeControl(routeControl);
            }

            routeControl = L.Routing.control({
                waypoints: [
                    L.latLng(startLatLng.lat, startLatLng.lng),
                    L.latLng(endLatLng.lat, endLatLng.lng)
                ],
                routeWhileDragging: true,
                lineOptions: {
                    styles: [{color: '#007bff', opacity: 0.8, weight: 5}]
                }
            }).addTo(map);

            routeControl.on('routesfound', function(e) {
                const routes = e.routes;
                const summary = routes[0].summary;
                const instructions = routes[0].instructions;

                const directionsList = document.getElementById('directionsList');
                directionsList.innerHTML = '';
                instructions.forEach(function(instruction, index) {
                    const li = document.createElement('li');
                    li.textContent = `${index + 1}. ${instruction.text}`;
                    directionsList.appendChild(li);
                });

                if (window.innerWidth <= 768) {
                    document.querySelector('.content-wrapper').classList.add('expanded');
                }
            });
        });
    });
}

function initMobileHandle() {
    const handle = document.querySelector('.mobile-handle');
    const contentWrapper = document.querySelector('.content-wrapper');

    handle.addEventListener('click', function() {
        contentWrapper.classList.toggle('expanded');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initMap();
    initMobileHandle();
    document.getElementById('findRoute').addEventListener('click', calculateRoute);
});