maptilersdk.config.apiKey = mapApi;

// fallback if no data
if (!coordinates) {
  console.error("No coordinates found");
}

const map = new maptilersdk.Map({
  container: 'map',
  style: maptilersdk.MapStyle.STREETS,
  center: coordinates, //  dynamic
  zoom: 9,
});

//  marker
new maptilersdk.Marker()
  .setLngLat(coordinates)
  .addTo(map);