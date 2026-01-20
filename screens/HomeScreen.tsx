import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { myqService } from '../services/myq';
import { geofencingService } from '../services/geofencing';
import { MyQDevice } from '../types/myq';

export default function HomeScreen({ navigation }: any) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [autoOpenEnabled, setAutoOpenEnabled] = useState(false);
  const [geofencingActive, setGeofencingActive] = useState(false);
  const [devices, setDevices] = useState<MyQDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<MyQDevice | null>(null);
  const [doorState, setDoorState] = useState<string>('unknown');
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      // Check if authenticated
      const credentials = await myqService.getCredentials();
      setIsAuthenticated(!!credentials);

      if (credentials) {
        await loadDevices();
        await loadSettings();
      }
    } catch (error) {
      console.error('Initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDevices = async () => {
    try {
      const deviceList = await myqService.getDevices();
      setDevices(deviceList);

      // Load selected device
      const savedSerial = await AsyncStorage.getItem('selected_garage_serial');
      if (savedSerial) {
        const device = deviceList.find(d => d.serial_number === savedSerial);
        if (device) {
          setSelectedDevice(device);
          await updateDoorState(savedSerial);
        }
      } else if (deviceList.length > 0) {
        // Auto-select first device
        setSelectedDevice(deviceList[0]);
        await AsyncStorage.setItem('selected_garage_serial', deviceList[0].serial_number);
        await updateDoorState(deviceList[0].serial_number);
      }
    } catch (error) {
      console.error('Failed to load devices:', error);
      Alert.alert('Error', 'Failed to load garage doors. Please check your MyQ credentials.');
    }
  };

  const loadSettings = async () => {
    const autoOpen = await AsyncStorage.getItem('auto_open_enabled');
    setAutoOpenEnabled(autoOpen === 'true');

    const active = await geofencingService.isGeofencingActive();
    setGeofencingActive(active);
  };

  const updateDoorState = async (serialNumber: string) => {
    try {
      const state = await myqService.getDeviceState(serialNumber);
      setDoorState(state.door_state);
    } catch (error) {
      console.error('Failed to get door state:', error);
    }
  };

  const toggleAutoOpen = async (value: boolean) => {
    setAutoOpenEnabled(value);
    await AsyncStorage.setItem('auto_open_enabled', value.toString());

    if (value && !geofencingActive) {
      // Prompt to set up geofencing
      Alert.alert(
        'Setup Required',
        'To enable auto-open, you need to configure your home location for geofencing.',
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'Setup Now',
            onPress: () => navigation.navigate('Setup'),
          },
        ]
      );
    }
  };

  const handleOpenDoor = async () => {
    if (!selectedDevice) return;

    setIsActionInProgress(true);
    try {
      const success = await myqService.openDoor(selectedDevice.serial_number);
      if (success) {
        Alert.alert('Success', 'Garage door is opening');
        setTimeout(() => updateDoorState(selectedDevice.serial_number), 2000);
      } else {
        Alert.alert('Error', 'Failed to open garage door');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while opening the door');
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleCloseDoor = async () => {
    if (!selectedDevice) return;

    setIsActionInProgress(true);
    try {
      const success = await myqService.closeDoor(selectedDevice.serial_number);
      if (success) {
        Alert.alert('Success', 'Garage door is closing');
        setTimeout(() => updateDoorState(selectedDevice.serial_number), 2000);
      } else {
        Alert.alert('Error', 'Failed to close garage door');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while closing the door');
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleRefresh = async () => {
    if (selectedDevice) {
      await updateDoorState(selectedDevice.serial_number);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.title}>Welcome to Garage Automation</Text>
        <Text style={styles.subtitle}>
          Automatically open your garage door as you arrive home
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Setup')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Garage Control</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Setup')}
        >
          <Text style={styles.settingsButtonText}>⚙️ Settings</Text>
        </TouchableOpacity>
      </View>

      {selectedDevice && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{selectedDevice.name}</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={[styles.statusValue, getStatusColor(doorState)]}>
              {doorState.toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.switchContainer}>
          <View>
            <Text style={styles.switchLabel}>Auto-Open When Near Home</Text>
            <Text style={styles.switchSubtitle}>
              {geofencingActive
                ? 'Geofencing is active'
                : 'Geofencing not configured'}
            </Text>
          </View>
          <Switch
            value={autoOpenEnabled}
            onValueChange={toggleAutoOpen}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={autoOpenEnabled ? '#007AFF' : '#f4f3f4'}
          />
        </View>
      </View>

      {selectedDevice && (
        <View style={styles.controlsCard}>
          <Text style={styles.cardTitle}>Manual Controls</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.controlButton, styles.openButton]}
              onPress={handleOpenDoor}
              disabled={isActionInProgress || doorState === 'open'}
            >
              {isActionInProgress ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.controlButtonText}>⬆️ Open Door</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, styles.closeButton]}
              onPress={handleCloseDoor}
              disabled={isActionInProgress || doorState === 'closed'}
            >
              {isActionInProgress ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.controlButtonText}>⬇️ Close Door</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {devices.length === 0 && (
        <View style={styles.card}>
          <Text style={styles.emptyText}>
            No garage doors found. Please check your MyQ account.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return { color: '#FF3B30' };
    case 'closed':
      return { color: '#34C759' };
    case 'opening':
    case 'closing':
      return { color: '#FF9500' };
    default:
      return { color: '#8E8E93' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  settingsButton: {
    padding: 8,
  },
  settingsButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  card: {
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 10,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlsCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#000',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshButton: {
    alignSelf: 'flex-start',
    padding: 8,
  },
  refreshButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  switchSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  controlButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  openButton: {
    backgroundColor: '#34C759',
  },
  closeButton: {
    backgroundColor: '#FF3B30',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
