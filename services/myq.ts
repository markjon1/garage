import * as SecureStore from 'expo-secure-store';
import { MyQCredentials, MyQDevice, MyQAccount, MyQDeviceState } from '../types/myq';

const MYQ_API_BASE = 'https://api.myqdevice.com/api/v5.2';
const MYQ_APP_ID = 'JVM/G9Nwih5BwKgNCjLxiFUQxQijAebyyg8QUHr7JOrP+tuPb8iHfRHKwTmDzHOu';

export class MyQService {
  private securityToken: string | null = null;
  private accountId: string | null = null;

  async saveCredentials(credentials: MyQCredentials): Promise<void> {
    await SecureStore.setItemAsync('myq_email', credentials.email);
    await SecureStore.setItemAsync('myq_password', credentials.password);
  }

  async getCredentials(): Promise<MyQCredentials | null> {
    const email = await SecureStore.getItemAsync('myq_email');
    const password = await SecureStore.getItemAsync('myq_password');

    if (!email || !password) {
      return null;
    }

    return { email, password };
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${MYQ_API_BASE}/Login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'MyQApplicationId': MYQ_APP_ID,
        },
        body: JSON.stringify({
          Username: email,
          Password: password,
        }),
      });

      if (!response.ok) {
        console.error('Login failed:', response.status);
        return false;
      }

      const data = await response.json();
      this.securityToken = data.SecurityToken;

      // Save token for future use
      if (this.securityToken) {
        await SecureStore.setItemAsync('myq_token', this.securityToken);
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  async ensureAuthenticated(): Promise<boolean> {
    // Try to load existing token
    if (!this.securityToken) {
      this.securityToken = await SecureStore.getItemAsync('myq_token');
    }

    // If still no token, try to login with stored credentials
    if (!this.securityToken) {
      const credentials = await this.getCredentials();
      if (credentials) {
        return await this.login(credentials.email, credentials.password);
      }
      return false;
    }

    return true;
  }

  async getDevices(): Promise<MyQDevice[]> {
    if (!await this.ensureAuthenticated()) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${MYQ_API_BASE}/Accounts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'MyQApplicationId': MYQ_APP_ID,
          'SecurityToken': this.securityToken!,
        },
      });

      if (!response.ok) {
        // Token might be expired, try to re-login
        const credentials = await this.getCredentials();
        if (credentials && await this.login(credentials.email, credentials.password)) {
          return this.getDevices(); // Retry with new token
        }
        throw new Error('Failed to get devices');
      }

      const data = await response.json();
      const account: MyQAccount = data.accounts[0];
      this.accountId = account.account_id;

      // Filter for garage door openers
      return account.devices.filter(
        device => device.device_family === 'garagedoor'
      );
    } catch (error) {
      console.error('Get devices error:', error);
      throw error;
    }
  }

  async getDeviceState(serialNumber: string): Promise<MyQDeviceState> {
    if (!await this.ensureAuthenticated()) {
      throw new Error('Not authenticated');
    }

    if (!this.accountId) {
      await this.getDevices(); // This will set accountId
    }

    try {
      const response = await fetch(
        `${MYQ_API_BASE}/Accounts/${this.accountId}/Devices/${serialNumber}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'MyQApplicationId': MYQ_APP_ID,
            'SecurityToken': this.securityToken!,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get device state');
      }

      const device: MyQDevice = await response.json();

      return {
        door_state: (device.state.door_state as any) || 'unknown',
        online: device.state.online || false,
      };
    } catch (error) {
      console.error('Get device state error:', error);
      throw error;
    }
  }

  async setDoorState(serialNumber: string, action: 'open' | 'close'): Promise<boolean> {
    if (!await this.ensureAuthenticated()) {
      throw new Error('Not authenticated');
    }

    if (!this.accountId) {
      await this.getDevices(); // This will set accountId
    }

    try {
      const response = await fetch(
        `${MYQ_API_BASE}/Accounts/${this.accountId}/Devices/${serialNumber}/actions`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'MyQApplicationId': MYQ_APP_ID,
            'SecurityToken': this.securityToken!,
          },
          body: JSON.stringify({
            action_type: action,
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Set door state error:', error);
      return false;
    }
  }

  async openDoor(serialNumber: string): Promise<boolean> {
    console.log('Opening garage door...');
    return await this.setDoorState(serialNumber, 'open');
  }

  async closeDoor(serialNumber: string): Promise<boolean> {
    console.log('Closing garage door...');
    return await this.setDoorState(serialNumber, 'close');
  }

  async logout(): Promise<void> {
    this.securityToken = null;
    this.accountId = null;
    await SecureStore.deleteItemAsync('myq_token');
  }
}

export const myqService = new MyQService();
