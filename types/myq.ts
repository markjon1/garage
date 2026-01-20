export interface MyQCredentials {
  email: string;
  password: string;
}

export interface MyQAuthResponse {
  securityToken: string;
}

export interface MyQDevice {
  serial_number: string;
  device_family: string;
  device_platform: string;
  device_type: string;
  name: string;
  parent_device_id: string | null;
  created_date: string;
  state: {
    door_state?: string;
    online?: boolean;
    last_update?: string;
  };
}

export interface MyQAccount {
  account_id: string;
  devices: MyQDevice[];
}

export interface MyQDeviceState {
  door_state: 'open' | 'closed' | 'opening' | 'closing' | 'stopped' | 'unknown';
  online: boolean;
}
