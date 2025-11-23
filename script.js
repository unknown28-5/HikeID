const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    const body = document.body;
    const themeIcon = themeToggle.querySelector('.material-symbols-outlined');
    
    const currentTheme = window.localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        body.classList.add('dark');
        themeIcon.textContent = 'light_mode';
    }
    
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark');
        
        if (body.classList.contains('dark')) {
            themeIcon.textContent = 'light_mode';
            window.localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.textContent = 'dark_mode';
            window.localStorage.setItem('theme', 'light');
        }
    });
}

const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('.material-symbols-outlined');
        icon.textContent = navMenu.classList.contains('active') ? 'close' : 'menu';
    });
}

const viewAllBtn = document.getElementById('viewAllBtn');
const hiddenMountains = document.getElementById('hiddenMountains');
let isExpanded = false;

if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
        isExpanded = !isExpanded;
        
        if (isExpanded) {
            hiddenMountains.classList.add('show');
            viewAllBtn.textContent = 'Show Less';
            
            setTimeout(() => {
                hiddenMountains.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        } else {
            hiddenMountains.classList.remove('show');
            viewAllBtn.textContent = 'View All Mountains';
            document.getElementById('mountains').scrollIntoView({ behavior: 'smooth' });
        }
    });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                if(navMenu) navMenu.classList.remove('active');
                if(mobileMenuBtn) mobileMenuBtn.querySelector('.material-symbols-outlined').textContent = 'menu';
            }
        }
    });
});

let lastScroll = 0;
const navbar = document.querySelector('.navbar');

if (navbar) {
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }
        lastScroll = currentScroll;
    });
}

if (document.getElementById('map')) {
    
    var map = L.map('map');
    
   var osmStreet = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps'
    });
    
    osmStreet.addTo(map);
    
    var baseMaps = {
        "Peta": osmStreet
    };
    
    L.control.layers(baseMaps).addTo(map);

    const urlParams = new URLSearchParams(window.location.search);
    const gunungToFind = urlParams.get('gunung'); 
    const gunungLayerStore = {};

    fetch('data_gunung-MDT.geojson') 
        .then(response => response.json())
        .then(data => {
            
            var redIcon = new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            var gunungLayer = L.geoJSON(data, {
                pointToLayer: function (feature, latlng) {
                    return L.marker(latlng, {icon: redIcon});
                },
                onEachFeature: function (feature, layer) {
                    const lat = feature.geometry.coordinates[1];
                    const lng = feature.geometry.coordinates[0];
                    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                    
                    const namaGunung = feature.properties.name || "Nama tidak tersedia";
                    const namaDisplay = namaGunung.replace(/-/g, ' ');
                    const ketinggian = feature.properties.ketinggian;
                    const fotoUrl = feature.properties.foto;
                    const deskripsi = feature.properties.deskripsi;
                    const alamat = feature.properties.alamat;

                    let baseContent = `<b>${namaGunung}</b>`;
                    if (ketinggian) baseContent += `<br>${ketinggian} mdpl`;
                    if (alamat) baseContent += `<br><i>${alamat}</i>`; 

                    const apiKey = 'b4bece91fa005dc4592c5a42100c4bf9';
                    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&lang=id`;

                    layer.bindPopup(baseContent + '<br><br>Memuat data cuaca...');

                    fetch(weatherUrl)
                        .then(res => res.json())
                        .then(weatherData => {
                            const temp = Math.round(weatherData.main.temp);
                            const desc = weatherData.weather[0].description;
                            const iconCode = weatherData.weather[0].icon;
                            const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

                            const weatherHtml = `
                                <div style="margin-top: 10px; padding: 5px; background: #f0f8ff; border-radius: 5px; border: 1px solid #dbefff; display: flex; align-items: center;">
                                    <img src="${iconUrl}" alt="Cuaca" style="width: 40px; height: 40px; margin-right: 5px;">
                                    <div>
                                        <div style="font-weight: bold; font-size: 14px; color: #333;">${temp}°C</div>
                                        <div style="text-transform: capitalize; font-size: 12px; color: #666;">${desc}</div>
                                    </div>
                                </div>
                            `;

                            let finalContent = baseContent + weatherHtml;

                            if (fotoUrl) finalContent += `<br><img src="${fotoUrl}" alt="Foto ${namaGunung}" style="width:100%; margin-top:10px; border-radius:5px;">`;
                            if (deskripsi) finalContent += `<p style="margin-top:5px; font-size:13px;">${deskripsi}</p>`;
                            
                            finalContent += `<a href="${googleMapsUrl}" target="_blank" style="display:block; background-color:#4285F4; color:white; text-align:center; padding:8px; border-radius:5px; text-decoration:none; margin-top:10px;">Dapatkan Rute via Google Maps</a>`;

                            layer.setPopupContent(finalContent);
                        })
                        .catch(err => {
                            console.error("Gagal ambil cuaca:", err);
                            let fallbackContent = baseContent + '<br><small style="color:red;">Gagal memuat cuaca</small>';
                            if (fotoUrl) fallbackContent += `<br><br><img src="${fotoUrl}" style="width:100%;">`;
                            if (deskripsi) fallbackContent += `<p>${deskripsi}</p>`;
                            fallbackContent += `<br><a href="${googleMapsUrl}" target="_blank" style="display:block; background-color:#4285F4; color:white; text-align:center; padding:8px; border-radius:5px; text-decoration:none; margin-top:10px;">Dapatkan Rute</a>`;
                            layer.setPopupContent(fallbackContent);
                        });

                    if (namaGunung) {
                        gunungLayerStore[namaGunung] = layer;
                    }
                }
            }).addTo(map);

            map.fitBounds(gunungLayer.getBounds());

            if (gunungToFind) {
                const targetLayer = gunungLayerStore[gunungToFind];
                
                if (targetLayer) {
                    const latLng = targetLayer.getLatLng();
                    map.flyTo(latLng, 15);
                    targetLayer.openPopup();
                } else {
                    console.error('Nama gunung di URL tidak ditemukan:', gunungToFind);
                }
            }

            attachClickEvents();

        })
        .catch(error => {
            console.error('--- GAGAL TOTAL ---', error);
        });

    function attachClickEvents() {
        const buttons = document.querySelectorAll('.fly-button');
        buttons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                const namaGunung = this.dataset.gunung;
                const targetLayer = gunungLayerStore[namaGunung];

                if (targetLayer) {
                    const latLng = targetLayer.getLatLng();
                    map.flyTo(latLng, 15);
                    targetLayer.openPopup();
                } else {
                    console.error('Nama gunung di tombol tidak ditemukan:', namaGunung);
                }
            });
        });
    }
}