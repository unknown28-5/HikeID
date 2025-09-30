
var map = L.map('map').setView([1.3, 124.8], 10);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

fetch('data_gunung-MDT.geojson')
    .then(response => response.json())
    .then(data => {
        // Definisikan ikon merah kustom
        var redIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {icon: redIcon});
            },
            onEachFeature: function (feature, layer) {
                // Ambil semua data dari properties
                const namaGunung = feature.properties.name || "Nama tidak tersedia";
                const ketinggian = feature.properties.ketinggian;
                const fotoUrl = feature.properties.foto; // <-- Data baru
                const deskripsi = feature.properties.deskripsi; // <-- Data baru

                // Rakit konten HTML untuk popup
                let popupContent = `<b>${namaGunung}</b>`;

                if (ketinggian) {
                    popupContent += `<br>${ketinggian} mdpl`;
                }

                if (fotoUrl) {
                    popupContent += `<br><br><img src="${fotoUrl}" alt="Foto ${namaGunung}" style="width:100%;">`;
                }

                if (deskripsi) {
                    popupContent += `<p>${deskripsi}</p>`;
                }

                layer.bindPopup(popupContent);
            }
        }).addTo(map);
    });