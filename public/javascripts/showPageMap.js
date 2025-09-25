const mapElement = document.getElementById('map');
const campground = JSON.parse(mapElement.dataset.campground);
const mapboxToken = mapElement.dataset.token;

mapboxgl.accessToken = mapboxToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/satellite-streets-v12', // 衛星写真スタイルに変更
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
});

// ナビゲーションコントロール（ズームイン・アウトボタン）を追加
map.addControl(new mapboxgl.NavigationControl());

// 地図のラベルを日本語に設定
map.on('load', () => {
    map.setLanguage('ja');
});

// マップにマーカーを追加
new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h5><a href="/campgrounds/${campground._id}">${campground.name}</a></h5><p>${campground.location}</p>`
            )
    )
    .addTo(map);
