import type { Location } from '../types/prayer';

export async function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
}

export function getDefaultLocation(): Location {
  return {
    latitude: 5.1870,
    longitude: 97.1413,
    city: 'Lhokseumawe',
  };
}
