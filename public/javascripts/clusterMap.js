const mapElement = document.getElementById('cluster-map');
const campgrounds = JSON.parse(mapElement.dataset.campgrounds);
const mapboxToken = mapElement.dataset.token;

mapboxgl.accessToken = mapboxToken;
const map = new mapboxgl.Map({
    container: 'cluster-map',
    style: 'mapbox://styles/mapbox/light-v11', // 明るいスタイルの地図
    center: [139.6922, 35.6897], // 初期中心地（東京）
    zoom: 4 // 初期ズームレベル
});

// ナビゲーションコントロール（ズームイン・アウトボタン）を追加
map.addControl(new mapboxgl.NavigationControl());
// フルスクリーンコントロールを追加
map.addControl(new mapboxgl.FullscreenControl());
// スケールコントロールを追加
map.addControl(new mapboxgl.ScaleControl({
    maxWidth: 100,
    unit: 'metric'
}));


map.on('load', () => {
    // 地図のラベルを日本語に設定
    map.setLanguage('ja');

    // Mapboxに渡すためのGeoJSON形式のソースを追加
    map.addSource('campgrounds', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: campgrounds.map(camp => ({
                type: 'Feature',
                geometry: camp.geometry,
                properties: {
                    popUpMarkup: `<strong><a href="/campgrounds/${camp._id}">${camp.name}</a></strong><p>${camp.description.substring(0, 20)}...</p>`
                }
            }))
        },
        cluster: true,
        clusterMaxZoom: 14, // このズームレベル以上ではクラスター化しない
        clusterRadius: 50 // 各クラスターの半径（ピクセル単位）
    });

    // クラスター（円）を描画するレイヤーを追加
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        paint: {
            // クラスター内のポイント数に応じて円のサイズと色を動的に変更
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6', // 10未満
                10, '#f1f075', // 10以上30未満
                30, '#f28cb1'  // 30以上
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                20, // 10未満の半径
                10, 30, // 10以上30未満の半径
                30, 40  // 30以上の半径
            ]
        }
    });

    // クラスター内の件数を表示するレイヤーを追加
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    // クラスター化されていない個々のマーカーを描画するレイヤーを追加
    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#11b4da',
            'circle-radius': 6,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });

    // クラスターをクリックしたときの処理
    map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('campgrounds').getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            map.easeTo({ center: features[0].geometry.coordinates, zoom: zoom });
        });
    });

    // 個々のマーカーをクリックしたときの処理
    map.on('click', 'unclustered-point', (e) => {
        const { popUpMarkup } = e.features[0].properties;
        const coordinates = e.features[0].geometry.coordinates.slice();

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(popUpMarkup)
            .addTo(map);
    });

    // マウスカーソルがクラスターやマーカー上にあるときにポインターに変更
    map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
    map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });
});
