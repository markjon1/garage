import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const GEOFENCE_TASK_NAME = 'GARAGE_GEOFENCE_TASK';
const HOME_LOCATION_KEY = 'home_location';
const GEOFENCE_RADIUS = 200; // meters

export interface HomeLocation {
  latitude: number;
  longitude: number;
  radius: number;
}

export class GeofencingService {
  async requestPermissions(): Promise<boolean> {
    // Request location permissions
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      console.error('Foreground location permission not granted');
      return false;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      console.error('Background location permission not granted');
      return false;
    }

    // Request notification permissions
    const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
    if (notificationStatus !== 'granted') {
      console.warn('Notification permission not granted');
    }

    return true;
  }

  async saveHomeLocation(location: HomeLocation): Promise<void> {
    await AsyncStorage.setItem(HOME_LOCATION_KEY, JSON.stringify(location));
  }

  async getHomeLocation(): Promise<HomeLocation | null> {
    const locationStr = await AsyncStorage.getItem(HOME_LOCATION_KEY);
    if (!locationStr) {
      return null;
    }
    return JSON.parse(locationStr);
  }

  async getCurrentLocation(): Promise<Location.LocationObject> {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return location;
  }

  async startGeofencing(): Promise<boolean> {
    const homeLocation = await this.getHomeLocation();
    if (!homeLocation) {
      console.error('No home location set');
      return false;
    }

    const hasPermissions = await this.requestPermissions();
    if (!hasPermissions) {
      return false;
    }

    try {
      await Location.startGeofencingAsync(GEOFENCE_TASK_NAME, [
        {
          identifier: 'home',
          latitude: homeLocation.latitude,
          longitude: homeLocation.longitude,
          radius: homeLocation.radius || GEOFENCE_RADIUS,
          notifyOnEnter: true,
          notifyOnExit: false,
        },
      ]);

      console.log('Geofencing started successfully');
      return true;
    } catch (error) {
      console.error('Failed to start geofencing:', error);
      return false;
    }
  }

  async stopGeofencing(): Promise<void> {
    const hasTask = await TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK_NAME);
    if (hasTask) {
      await Location.stopGeofencingAsync(GEOFENCE_TASK_NAME);
      console.log('Geofencing stopped');
    }
  }

  async isGeofencingActive(): Promise<boolean> {
    return await TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK_NAME);
  }

  async sendNotification(title: string, body: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: null, // Show immediately
    });
  }
}

export const geofencingService = new GeofencingService();

// Define the geofencing background task
TaskManager.defineTask(GEOFENCE_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Geofence task error:', error);
    return;
  }

  if (data) {
    const { eventType, region } = data as any;

    if (eventType === Location.GeofencingEventType.Enter) {
      console.log('Entered home geofence!');

      // Import dynamically to avoid circular dependencies
      const { myqService } = await import('./myq');
      const { geofencingService } = await import('./geofencing');

      try {
        // Get the configured garage door
        const garageSerial = await AsyncStorage.getItem('selected_garage_serial');

        if (!garageSerial) {
          console.warn('No garage door configured');
          await geofencingService.sendNotification(
            'Garage Automation',
            'No garage door configured. Please set up your device in the app.'
          );
          return;
        }

        // Check if auto-open is enabled
        const autoOpenEnabled = await AsyncStorage.getItem('auto_open_enabled');
        if (autoOpenEnabled !== 'true') {
          console.log('Auto-open is disabled');
          return;
        }

        // Open the garage door
        const success = await myqService.openDoor(garageSerial);

        if (success) {
          console.log('Garage door opened successfully');
          await geofencingService.sendNotification(
            'Garage Door Opening',
            'Your garage door is opening as you approach home.'
          );
        } else {
          console.error('Failed to open garage door');
          await geofencingService.sendNotification(
            'Garage Door Error',
            'Failed to open garage door. Please check your MyQ connection.'
          );
        }
      } catch (error) {
        console.error('Error opening garage door:', error);
        await geofencingService.sendNotification(
          'Garage Door Error',
          'An error occurred while opening the garage door.'
        );
      }
    }
  }
});
