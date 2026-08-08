import axios from 'axios';

async function testGeo(query) {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 1
      },
      headers: {
        'User-Agent': 'WohnungssucheKI/1.0 (sche-)'
      }
    });
    if (response.data && response.data.length > 0) {
      console.log(`Query: "${query}" => Found:`, {
        display_name: response.data[0].display_name,
        city: response.data[0].address?.city || response.data[0].address?.town || response.data[0].address?.village || response.data[0].address?.county || '',
        state: response.data[0].address?.state || ''
      });
      return true;
    } else {
      console.log(`Query: "${query}" => Not found`);
      return false;
    }
  } catch (err) {
    console.error(`Error for "${query}":`, err.message);
    return false;
  }
}

async function run() {
  await testGeo('Bonn Stadtteil Bad Godesberg');
  await testGeo('Bonn Bad Godesberg');
  await testGeo('Bad Godesberg, Bonn');
  await testGeo('Bonn');
}
run();
