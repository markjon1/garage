import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { myqService } from '../services/myq';
import { geofencingService, HomeLocation } from '../services/geofencing';
import { MyQDevice } from '../types/myq';

export default function SetupScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [devices, setDevices] = useState<MyQDevice[]>([]);
  const [selectedDeviceSerial, setSelectedDeviceSerial] = useState<string>('');
  const [homeLocation, setHomeLocation] = useState<HomeLocation | null>(null);
  const [geofenceRadius, setGeofenceRadius] = useState('200');

  useEffect(() => {
    loadExistingSettings();
  }, []);

  const loadExistingSettings = async () => {
    try {
      const credentials = await myqService.getCredentials();
      if (credentials) {
        setEmail(credentials.email);
        setIsAuthenticated(true);
        await loadDevices();
      }

      const location = await geofencingService.getHomeLocation();
      if (location) {
        setHomeLocation(location);
        setGeofenceRadius(location.radius.toString());
      }

      const savedSerial = await AsyncStorage.getItem('selected_garage_serial');
      if (savedSerial) {
        setSelectedDeviceSerial(savedSerial);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadDevices = async () => {
    try {
      const deviceList = await myqService.getDevices();
      setDevices(deviceList);
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setIsLoading(true);
    try {
      const success = await myqService.login(email, password);

      if (success) {
        await myqService.saveCredentials({ email, password });
        setIsAuthenticated(true);
        await loadDevices();
        Alert.alert('Success', 'Successfully logged in to MyQ');
      } else {
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await myqService.logout();
            setIsAuthenticated(false);
            setDevices([]);
            setPassword('');
            Alert.alert('Success', 'Logged out successfully');
          },
        },
      ]
    );
  };

  const handleSelectDevice = async (serialNumber: string) => {
    setSelectedDeviceSerial(serialNumber);
    await AsyncStorage.setItem('selected_garage_serial', serialNumber);
  };

  const handleSetCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const location = await geofencingService.getCurrentLocation();
      const newHomeLocation: HomeLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        radius: parseInt(geofenceRadius) || 200,
      };

      await geofencingService.saveHomeLocation(newHomeLocation);
      setHomeLocation(newHomeLocation);
      Alert.alert('Success', 'Home location set to current location');
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location. Please check location permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGeofencing = async () => {
    if (!homeLocation) {
      Alert.alert('Error', 'Please set your home location first');
      return;
    }

    if (!selectedDeviceSerial) {
      Alert.alert('Error', 'Please select a garage door first');
      return;
    }

    setIsLoading(true);
    try {
      const success = await geofencingService.startGeofencing();

      if (success) {
        Alert.alert(
          'Success',
          'Geofencing started! Your garage door will open automatically when you approach home.'
        );
        navigation.goBack();
      } else {
        Alert.alert(
          'Error',
          'Failed to start geofencing. Please check location permissions.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start geofencing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopGeofencing = async () => {
    Alert.alert(
      'Stop Geofencing',
      'Are you sure you want to stop automatic garage opening?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: async () => {
            await geofencingService.stopGeofencing();
            Alert.alert('Success', 'Geofencing stopped');
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Setup</Text>
          {navigation.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* MyQ Authentication */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MyQ Account</Text>
          {!isAuthenticated ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Login to MyQ</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.infoText}>Logged in as: {email}</Text>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleLogout}
              >
                <Text style={styles.secondaryButtonText}>Logout</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Device Selection */}
        {isAuthenticated && devices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Garage Door</Text>
            {devices.map((device) => (
              <TouchableOpacity
                key={device.serial_number}
                style={[
                  styles.deviceCard,
                  selectedDeviceSerial === device.serial_number &&
                    styles.selectedDevice,
                ]}
                onPress={() => handleSelectDevice(device.serial_number)}
              >
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.deviceSerial}>
                  {device.serial_number}
                </Text>
                {selectedDeviceSerial === device.serial_number && (
                  <Text style={styles.selectedIndicator}>✓ Selected</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Home Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Home Location</Text>
          {homeLocation ? (
            <View style={styles.locationInfo}>
              <Text style={styles.infoText}>
                Latitude: {homeLocation.latitude.toFixed(6)}
              </Text>
              <Text style={styles.infoText}>
                Longitude: {homeLocation.longitude.toFixed(6)}
              </Text>
              <Text style={styles.infoText}>
                Radius: {homeLocation.radius} meters
              </Text>
            </View>
          ) : (
            <Text style={styles.infoText}>No home location set</Text>
          )}

          <View style={styles.radiusContainer}>
            <Text style={styles.label}>Geofence Radius (meters):</Text>
            <TextInput
              style={styles.radiusInput}
              value={geofenceRadius}
              onChangeText={setGeofenceRadius}
              keyboardType="number-pad"
            />
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSetCurrentLocation}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                📍 Set Current Location as Home
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Geofencing Controls */}
        {isAuthenticated && selectedDeviceSerial && homeLocation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Geofencing</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStartGeofencing}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  🚀 Start Auto-Open Geofencing
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, { marginTop: 10 }]}
              onPress={handleStopGeofencing}
            >
              <Text style={styles.secondaryButtonText}>
                Stop Geofencing
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
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
  doneButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  deviceCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  selectedDevice: {
    borderColor: '#007AFF',
    borderWidth: 2,
    backgroundColor: '#f0f8ff',
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  deviceSerial: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  selectedIndicator: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 8,
  },
  locationInfo: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  radiusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#000',
    marginRight: 10,
  },
  radiusInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    width: 80,
  },
});
