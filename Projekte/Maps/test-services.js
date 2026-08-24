import { RoutingService } from './src/services/RoutingService';
import { GeocodingService } from './src/services/GeocodingService';
import { WeatherService } from './src/services/WeatherService';
import { OfflineService } from './src/services/OfflineService';

async function runTests() {
  console.log('--- STARTING MAPS APPLICATION TESTS ---');

  // Test 1: WeatherService
  console.log('\n[Test 1] WeatherService: get weather for Munich...');
  const weather = await WeatherService.getWeatherForLocation({ latitude: 48.1371, longitude: 11.5754 });
  console.log('Result:', weather ? `Temp: ${weather.temperatureC}°C, Condition: ${weather.weatherDescription}` : 'FAILED');

  // Test 2: GeocodingService
  console.log('\n[Test 2] GeocodingService: search for Berlin...');
  const searchResults = await GeocodingService.searchPlaces('Berlin');
  console.log(`Result: Found ${searchResults.length} places.`);
  if (searchResults.length > 0) {
    console.log(`Top result: ${searchResults[0].shortName} (${searchResults[0].coordinate.latitude}, ${searchResults[0].coordinate.longitude})`);
  }

  // Test 3: RoutingService
  console.log('\n[Test 3] RoutingService: calculate driving route Munich -> Stuttgart...');
  const origin = { latitude: 48.1371, longitude: 11.5754, name: 'München' };
  const destination = { latitude: 48.7758, longitude: 9.1829, name: 'Stuttgart' };
  const routes = await RoutingService.calculateRoutes(origin, destination, 'driving');
  console.log(`Result: ${routes.length} routes calculated.`);
  if (routes.length > 0) {
    console.log(`Primary route: "${routes[0].title}", Distance: ${routes[0].distanceKm} km, Duration: ${routes[0].durationMinutes} min, Steps: ${routes[0].steps.length}`);
  }

  // Test 4: OfflineService
  console.log('\n[Test 4] OfflineService: tile estimation...');
  const tileCount = OfflineService.estimateRegionTiles(48.0, 48.5, 11.0, 11.5);
  console.log(`Result: Estimated tiles = ${tileCount}`);

  console.log('\n--- ALL TESTS COMPLETED SUCCESSFULLY ---');
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
