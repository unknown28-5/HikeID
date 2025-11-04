
var map = L.map('map').setView([1.3, 124.8], 10);

var esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'});

var osmStreet = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
});

esriSatellite.addTo(map);

var baseMaps = {
    "Satelit": esriSatellite,
    "Peta Jalan": osmStreet
};
L.control.layers(baseMaps).addTo(map);

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

        var gunungLayer =L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {icon: redIcon});
            },
            onEachFeature: function (feature, layer) {
                const lat = feature.geometry.coordinates[1];
                const lng = feature.geometry.coordinates[0];

                const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

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
                popupContent += `<br><a href="${googleMapsUrl}" target="_blank" style="display:block; background-color:#4285F4; color:white; text-align:center; padding:8px; border-radius:5px; text-decoration:none; margin-top:10px;">Dapatkan Rute via Google Maps</a>`;

                layer.bindPopup(popupContent);
            }
        }).addTo(map);

        map.fitBounds(gunungLayer.getBounds());
    });