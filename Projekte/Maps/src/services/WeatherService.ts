import { LocationPoint } from '../types/navigation';

export interface WeatherCondition {
  temperatureC: number;
  weatherCode: number;
  weatherDescription: string;
  weatherIcon: string;
  windSpeedKmH: number;
  precipitationProbability: number;
  isRainy: boolean;
}

export class WeatherService {
  /**
   * Translates WMO weather code to readable description & icon
   */
  public static getWeatherDescription(code: number): { text: string; icon: string } {
    if (code === 0) return { text: 'Sonnig / Klar', icon: 'sun' };
    if (code >= 1 && code <= 3) return { text: 'Leicht bewölkt', icon: 'cloud-sun' };
    if (code === 45 || code === 48) return { text: 'Nebel', icon: 'cloud-fog' };
    if (code >= 51 && code <= 57) return { text: 'Nieselregen', icon: 'cloud-drizzle' };
    if (code >= 61 && code <= 67) return { text: 'Regen', icon: 'cloud-rain' };
    if (code >= 71 && code <= 77) return { text: 'Schneefall', icon: 'snowflake' };
    if (code >= 80 && code <= 82) return { text: 'Regenschauer', icon: 'cloud-rain' };
    if (code >= 95) return { text: 'Gewitter', icon: 'cloud-lightning' };
    return { text: 'Bewölkt', icon: 'cloud' };
  }

  /**
   * Fetches current weather data for a given location point using Open-Meteo API (free & no key needed)
   */
  public static async getWeatherForLocation(location: LocationPoint): Promise<WeatherCondition | null> {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m`;
      const response = await fetch(url);
      if (!response.ok) return null;

      const data = await response.json();
      const current = data.current;
      if (!current) return null;

      const { text, icon } = this.getWeatherDescription(current.weather_code ?? 0);

      return {
        temperatureC: Math.round(current.temperature_2m ?? 0),
        weatherCode: current.weather_code ?? 0,
        weatherDescription: text,
        weatherIcon: icon,
        windSpeedKmH: Math.round(current.wind_speed_10m ?? 0),
        precipitationProbability: current.precipitation ? Math.min(100, Math.round(current.precipitation * 20)) : 0,
        isRainy: (current.weather_code >= 51 && current.weather_code <= 82) || (current.precipitation > 0),
      };
    } catch (error) {
      console.warn('[WeatherService] Weather fetch failed:', error);
      return null;
    }
  }
}
