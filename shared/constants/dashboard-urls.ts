const isDevelopment = process.env.NODE_ENV === 'development';

export const DASHBOARD_URLS: Record<string, string> = isDevelopment
  ? {
      BEAUTICIAN: 'http://localhost:3001/dashboard',
      HAIRDRESSER: 'http://localhost:3002/dashboard',
      BARBER: 'http://localhost:3003/dashboard',
      NAIL_TECH: 'http://localhost:3001/dashboard',
      MASSAGE: 'http://localhost:3001/dashboard',
      SPA: 'http://localhost:3001/dashboard',
      OTHER: 'http://localhost:3001/dashboard',
    }
  : {
      BEAUTICIAN: 'https://beauticians.glambooking.co.uk/dashboard',
      HAIRDRESSER: 'https://hairdressers.glambooking.co.uk/dashboard',
      BARBER: 'https://barbers.glambooking.co.uk/dashboard',
      NAIL_TECH: 'https://beauticians.glambooking.co.uk/dashboard',
      MASSAGE: 'https://beauticians.glambooking.co.uk/dashboard',
      SPA: 'https://beauticians.glambooking.co.uk/dashboard',
      OTHER: 'https://glambooking.co.uk/dashboard',
    };

export function getDashboardUrl(category: string): string {
  return DASHBOARD_URLS[category] || DASHBOARD_URLS.OTHER;
}
