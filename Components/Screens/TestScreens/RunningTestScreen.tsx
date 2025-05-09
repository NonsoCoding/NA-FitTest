import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator, Modal, Image, Animated } from 'react-native';
import * as Location from 'expo-location';
import { Accelerometer, Gyroscope, Pedometer } from 'expo-sensors';
import { MaterialIcons, FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import MapView, { Polyline, Region } from 'react-native-maps';
import * as geolib from 'geolib';
import { Theme } from '../../Branding/Theme';
import { auth, db } from '../../../Firebase/Settings';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import LottieView from 'lottie-react-native';

interface RunningTrackIprops {
    navigation: any;
}

interface Coordinate {
    latitude: number;
    longitude: number;
}

interface RunMetrics {
    distance: number;           // in meters
    currentSpeed: number;       // in m/s
    averageSpeed: number;       // in m/s
    elapsedTime: number;        // in seconds
    estimatedCompletion: number; // in seconds
    stepsPerMinute: number;     // cadence
    isRunning: boolean;         // detected activity type
    coordinates: Coordinate[];  // GPS coordinates array
}

interface MotionData {
    accelerometer: {
        x: number;
        y: number;
        z: number;
    };
    gyroscope: {
        x: number;
        y: number;
        z: number;
    };
    verticalOscillation: number;
    accelerometerMagnitude: number;
    recentAccelerometerReadings: number[];
}

const RunningTestScreen = ({
    navigation
}: RunningTrackIprops) => {
    // State management
    const [isTracking, setIsTracking] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [runMetrics, setRunMetrics] = useState<RunMetrics>({
        distance: 0,
        currentSpeed: 0,
        averageSpeed: 0,
        elapsedTime: 0,
        estimatedCompletion: 0,
        stepsPerMinute: 0,
        isRunning: false,
        coordinates: [],
    });

    // Refs
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);
    const accelerometerSubscription = useRef<ReturnType<typeof Accelerometer.addListener> | null>(null);
    const gyroscopeSubscription = useRef<ReturnType<typeof Gyroscope.addListener> | null>(null);
    const pedometerSubscription = useRef<ReturnType<typeof Pedometer.watchStepCount> | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const mapRef = useRef<MapView | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isPrepModalVisible, setIsPrepModalVisible] = useState(false);
    const [isResultModalVisible, setIsResultModalVisible] = useState(false)
    const [prepTime, setPrepTime] = useState(5);
    const animatedProgress = useRef(new Animated.Value(0)).current;
    // Constants
    const TARGET_DISTANCE_MILES: number = 1.5;
    const TARGET_DISTANCE_METERS: number = TARGET_DISTANCE_MILES * 1609.34; // Miles to meters
    const MIN_RUNNING_SPEED: number = 2.0; // m/s (about 4.5 mph)
    const MIN_STEPS_PER_MINUTE: number = 150; // Minimum running cadence
    const runTimerRef = useRef<NodeJS.Timeout | null>(null);


    useEffect(() => {
        if (isTracking) {
            const progress = Math.min(runMetrics.distance / TARGET_DISTANCE_METERS, 1); // Clamp to max 1
            Animated.timing(animatedProgress, {
                toValue: progress,
                duration: 500,
                useNativeDriver: false,
            }).start();
        }
    }, [runMetrics.distance]);

    const saveRunResultToFirestore = async () => {
        const user = auth.currentUser;

        if (!user) {
            console.warn("No user signed in");
            return;
        }

        const userDetailsRef = doc(db, "UserDetails", user.uid);
        const pushUpDocRef = doc(db, `UserDetails/${user.uid}/Runs/${Date.now()}`);
        console.log("Attempting to save run to path:", pushUpDocRef);

        const TacticalPoints = runMetrics.elapsedTime <= 600 ? 5 : 0;

        const runData = {
            uid: user.uid,
            distance: runMetrics.distance,
            elapsedTime: runMetrics.elapsedTime,
            averageSpeed: runMetrics.averageSpeed,
            stepsPerMinute: runMetrics.stepsPerMinute,
            isRunning: runMetrics.isRunning,
            timestamp: new Date().toISOString(),
            TacticalPoints: TacticalPoints
        };

        try {
            await setDoc(pushUpDocRef, runData);

            // 2. Fetch current personal best
            const userDoc = await getDoc(userDetailsRef);
            const existingData = userDoc.exists() ? userDoc.data().personalBests || {} : {};
            const currentPushUpBest = existingData.elapsedTime || 0;
            const userData = userDoc.exists() ? userDoc.data() : {};
            const currentTotal = userData.TacticalPoints || 0;

            await setDoc(userDetailsRef, {
                TacticalPoints: currentTotal + TacticalPoints
            }, { merge: true });

            // Update personal bests if new value is higher
            if (runMetrics.elapsedTime > currentPushUpBest) {
                await setDoc(userDetailsRef, {
                    personalBests: {
                        ...existingData,
                        runTime: runMetrics.elapsedTime // Only update pullUps, keep others unchanged
                    }
                }, { merge: true });
            }

            console.log("Run data saved to Firestore:", runData);
        } catch (error) {
            console.error("Error saving run data to Firestore:", error);
        }
    };


    // Motion data processing
    const [motionData, setMotionData] = useState<MotionData>({
        accelerometer: { x: 0, y: 0, z: 0 },
        gyroscope: { x: 0, y: 0, z: 0 },
        verticalOscillation: 0,
        accelerometerMagnitude: 0,
        recentAccelerometerReadings: []
    });

    const startPrepCountdown = () => {
        if (prepTime > 0 && !isRunning) {
            setIsRunning(true);
            setIsPrepModalVisible(true);
            setPrepTime(5);
            const countdownInterval = setInterval(() => {
                setPrepTime(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(countdownInterval);
                        setIsPrepModalVisible(false); // Hide modal
                        setIsTracking(true);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
    };

    useEffect(() => {
        // Request permissions on component mount
        const requestPermissions = async (): Promise<void> => {
            const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

            if (locationStatus !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Location permission is needed to track your run.'
                );
            }
        };

        requestPermissions();

        return () => stopAllTracking();
    }, []);

    // Update timer every second when tracking
    useEffect(() => {
        if (isTracking) {
            timerRef.current = setInterval(() => {
                setRunMetrics(prev => ({
                    ...prev,
                    elapsedTime: prev.elapsedTime + 1,
                    estimatedCompletion: calculateEstimatedCompletion(prev)
                }));
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isTracking]);

    const startTracking = async (): Promise<void> => {
        try {
            setLoading(true);

            // Reset metrics
            setRunMetrics({
                distance: 0,
                currentSpeed: 0,
                averageSpeed: 0,
                elapsedTime: 0,
                estimatedCompletion: 0,
                stepsPerMinute: 0,
                isRunning: false,
                coordinates: [],
            });

            // Start location tracking
            await startLocationTracking();

            // Start motion detection
            await startMotionDetection();

            // Start cadence monitoring
            await startCadenceMonitoring();

            // setIsTracking(true);
            setLoading(false);
            startPrepCountdown();
            setPrepTime(5);
        } catch (error) {
            console.error('Error starting tracking:', error);
            Alert.alert('Error', 'Failed to start tracking. Please try again.');
            setLoading(false);
        }
    };

    const stopTracking = async (): Promise<void> => {
        stopAllTracking();
        await saveRunResultToFirestore();
        setIsResultModalVisible(true);
    };

    const stopAllTracking = (): void => {
        // Stop all subscriptions
        if (locationSubscription.current) {
            locationSubscription.current.remove();
        }

        if (accelerometerSubscription.current) {
            accelerometerSubscription.current.remove();
        }

        if (gyroscopeSubscription.current) {
            gyroscopeSubscription.current.remove();
        }

        if (pedometerSubscription.current) {
            pedometerSubscription.current.remove();
        }

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        setIsTracking(false);
    };

    // Location tracking functions
    const startLocationTracking = async (): Promise<void> => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            throw new Error('Location permission denied');
        }

        // Get initial location
        const initialLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.BestForNavigation
        });

        if (initialLocation) {
            updateRunCoordinates(initialLocation);
        }

        // Watch position updates
        locationSubscription.current = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.BestForNavigation,
                distanceInterval: 5, // Update every 5 meters
                timeInterval: 1000, // Or every second
            },
            (location) => updateRunCoordinates(location)
        );
    };

    const updateRunCoordinates = (location: Location.LocationObject): void => {
        const { latitude, longitude, speed } = location.coords;
        const newCoord: Coordinate = { latitude, longitude };

        setRunMetrics(prev => {
            const coordinates = [...prev.coordinates, newCoord];

            // Calculate distance if we have at least two points
            let newDistance = prev.distance;
            let newAvgSpeed = prev.averageSpeed;

            if (prev.coordinates.length > 0) {
                const lastCoord = prev.coordinates[prev.coordinates.length - 1];
                const segmentDistance = geolib.getDistance(
                    lastCoord,
                    newCoord
                );

                // Validate segment (eliminate GPS jumps)
                if (isValidSegment(segmentDistance, speed || 0)) {
                    newDistance = prev.distance + segmentDistance;

                    // Update average speed if time has elapsed
                    if (prev.elapsedTime > 0) {
                        newAvgSpeed = newDistance / prev.elapsedTime;
                    }
                }
            }

            // Auto-center map on user's current position
            if (mapRef.current) {
                const region: Region = {
                    latitude,
                    longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                };
                mapRef.current.animateToRegion(region, 500);
            }

            return {
                ...prev,
                coordinates,
                distance: newDistance,
                currentSpeed: speed || 0,
                averageSpeed: newAvgSpeed,
            };
        });
    };

    const isValidSegment = (distance: number, speed: number): boolean => {
        // Filter out unrealistic GPS jumps
        // Typically a person can't move more than ~25 meters in a second
        const MAX_REALISTIC_DISTANCE: number = 25; // meters per second

        if (distance > MAX_REALISTIC_DISTANCE) {
            console.log('Filtered unrealistic GPS jump:', distance);
            return false;
        }

        return true;
    };

    // Motion detection functions
    const startMotionDetection = async (): Promise<void> => {
        // Set update intervals
        Accelerometer.setUpdateInterval(500);
        Gyroscope.setUpdateInterval(500);

        // Subscribe to accelerometer
        accelerometerSubscription.current = Accelerometer.addListener(accelerometerData => {
            const { x, y, z } = accelerometerData;

            // Calculate magnitude of movement
            const magnitude = Math.sqrt(x * x + y * y + z * z);

            // Store for pattern analysis
            setMotionData(prev => {
                const readings = [...prev.recentAccelerometerReadings, magnitude];
                if (readings.length > 10) {
                    readings.shift(); // Keep only the last 10 readings
                }

                // Extract vertical oscillation from z-axis
                // This is simplified - a more sophisticated algorithm would be better
                const verticalOscillation = Math.abs(z - 1); // 1g is baseline when still

                return {
                    ...prev,
                    accelerometer: { x, y, z },
                    accelerometerMagnitude: magnitude,
                    recentAccelerometerReadings: readings,
                    verticalOscillation
                };
            });

            // Analyze and update activity detection
            detectActivityType();
        });

        // Subscribe to gyroscope
        gyroscopeSubscription.current = Gyroscope.addListener(gyroscopeData => {
            setMotionData(prev => ({
                ...prev,
                gyroscope: gyroscopeData
            }));
        });
    };

    const detectActivityType = (): void => {

        const isRunningByOscillation = motionData.verticalOscillation > 0.25;
        const isRunningBySpeed = runMetrics.currentSpeed >= MIN_RUNNING_SPEED;
        const isRunningByCadence = runMetrics.stepsPerMinute >= MIN_STEPS_PER_MINUTE;

        let trueCount = 0;
        if (isRunningByOscillation) trueCount++;
        if (isRunningBySpeed) trueCount++;
        if (isRunningByCadence) trueCount++;

        const isRunning = trueCount >= 2;

        setRunMetrics(prev => ({
            ...prev,
            isRunning
        }));
    };

    // Cadence monitoring
    const startCadenceMonitoring = async (): Promise<void> => {
        const isAvailable = await Pedometer.isAvailableAsync();

        if (!isAvailable) {
            console.log('Pedometer not available');
            return;
        }

        // Watch steps in real time
        pedometerSubscription.current = Pedometer.watchStepCount(result => {
            const { steps } = result;

            // We'll use a simple approach - assuming each callback gives steps 
            // since the last callback, typically every ~1 second
            setRunMetrics(prev => ({
                ...prev,
                stepsPerMinute: steps * 60 // Convert steps per second to steps per minute
            }));
        });
    };

    // Helper functions
    const calculateEstimatedCompletion = (metrics: RunMetrics): number => {
        if (metrics.averageSpeed <= 0) return 0;

        const remainingDistance = TARGET_DISTANCE_METERS - metrics.distance;
        if (remainingDistance <= 0) return 0;

        return Math.round(remainingDistance / metrics.averageSpeed);
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const formatPace = (speedMps: number): string => {
        if (!speedMps) return '--:--';

        // Convert m/s to min/mile
        const paceSecPerMile = (1609.34 / speedMps);
        const paceMin = Math.floor(paceSecPerMile / 60);
        const paceSec = Math.floor(paceSecPerMile % 60);

        return `${paceMin}:${paceSec < 10 ? '0' : ''}${paceSec}`;
    };

    const getProgressPercentage = (): number => {
        return Math.min(100, (runMetrics.distance / TARGET_DISTANCE_METERS) * 100);
    };

    const renderActivityIcon = (): JSX.Element => {
        if (runMetrics.isRunning) {
            return <FontAwesome5 name="running" size={24} color="#4CAF50" />;
        } else {
            return <FontAwesome5 name="walking" size={24} color="#FF9800" />;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Map View */}
            <View style={styles.mapContainer}>
                <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 20
                }}>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.goBack();
                        }}
                        style={{
                            zIndex: 999,
                        }}
                    >
                        <FontAwesome6 name="arrow-left-long" size={30} />
                    </TouchableOpacity>
                    <TouchableOpacity style={{

                    }}
                        onPress={() => {
                            navigation.navigate("RunningHistory")
                        }}
                    >
                        <Image source={require("../../../assets/downloadedIcons/notification.png")}
                            style={{
                                height: 30,
                                width: 30,
                                resizeMode: "contain"
                            }}
                        />
                    </TouchableOpacity>
                </View>
                <View style={{ alignSelf: "center", width: 10, height: "70%", backgroundColor: '#ccc', marginTop: 20 }}>
                    <Animated.View
                        style={{
                            position: 'absolute',
                            left: -15, // centers the knob
                            bottom: animatedProgress.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '100%'],
                            }),
                            width: 20,
                            height: 20,
                        }}
                    >
                        <LottieView
                            source={require("../../../assets/downloadedIcons/Animation - 1746723631367.json")}
                            style={{
                                height: 40,
                                width: 40
                            }}
                        />
                    </Animated.View>
                </View>
            </View>

            {/* Metrics Display */}
            <View style={styles.metricsContainer}>
                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                    <View
                        style={[
                            styles.progressBar,
                            { width: `${getProgressPercentage()}%` }
                        ]}
                    />
                    <Text style={styles.progressText}>
                        {(runMetrics.distance / 1609.34).toFixed(2)} / {TARGET_DISTANCE_MILES} miles
                    </Text>
                </View>

                {/* Main Metrics */}
                <View style={styles.metricsRow}>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>TIME</Text>
                        <Text style={styles.metricValue}>{formatTime(runMetrics.elapsedTime)}</Text>
                    </View>

                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>PACE</Text>
                        <Text style={styles.metricValue}>{formatPace(runMetrics.averageSpeed)}</Text>
                    </View>

                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>ACTIVITY</Text>
                        <View style={styles.activityIndicator}>
                            {renderActivityIcon()}
                            <Text style={styles.activityText}>
                                {runMetrics.isRunning ? 'Running' : 'Walking'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Additional Metrics */}
                <View style={styles.secondaryMetricsRow}>
                    <View style={styles.metricItem}>
                        <Text style={styles.secondaryLabel}>CADENCE</Text>
                        <Text style={styles.secondaryValue}>{Math.round(runMetrics.stepsPerMinute)} spm</Text>
                    </View>

                    <View style={styles.metricItem}>
                        <Text style={styles.secondaryLabel}>CURRENT SPEED</Text>
                        <Text style={styles.secondaryValue}>{(runMetrics.currentSpeed * 2.23694).toFixed(1)} mph</Text>
                    </View>

                    <View style={styles.metricItem}>
                        <Text style={styles.secondaryLabel}>EST. FINISH</Text>
                        <Text style={styles.secondaryValue}>
                            {runMetrics.estimatedCompletion > 0
                                ? formatTime(runMetrics.elapsedTime + runMetrics.estimatedCompletion)
                                : runMetrics.distance >= TARGET_DISTANCE_METERS
                                    ? 'Complete!'
                                    : '--:--'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Control Button */}
            <View style={styles.buttonContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color="#4CAF50" />
                ) : (
                    <TouchableOpacity
                        style={[
                            styles.button,
                            isTracking ? styles.stopButton : styles.startButton
                        ]}
                        onPress={isTracking ? stopTracking : startTracking}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {isTracking ? 'STOP RUN' : 'START RUN'}
                        </Text>
                        <MaterialIcons
                            name={isTracking ? 'stop' : 'play-arrow'}
                            size={24}
                            color="white"
                        />
                    </TouchableOpacity>
                )}
                <Modal
                    visible={isPrepModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => {
                        setIsPrepModalVisible(false);
                    }}
                >
                    <View style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "rgba(0, 0, 0, 0.5)"
                    }}>
                        <View style={{
                            height: 200,
                            width: "70%",
                            backgroundColor: Theme.colors.primaryColor,
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 5
                        }}>
                            <View style={{
                                alignItems: "center"
                            }}>
                                <View style={{
                                    flexDirection: "row",
                                    alignItems: "flex-end",
                                }}>
                                    <Text style={{
                                        fontSize: 60,
                                        color: "white",
                                    }}>0{prepTime}</Text>
                                    <Text style={{
                                        fontSize: 17,
                                        bottom: 10,
                                        color: "white",
                                    }}>sec</Text>
                                </View>
                                <Text style={{
                                    color: "white"
                                }}>GET READY</Text>
                            </View>
                        </View>
                    </View>
                </Modal>
                <Modal
                    visible={isResultModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => {
                        setIsResultModalVisible(false);
                    }}
                >
                    <View style={{
                        flex: 1,
                        justifyContent: "flex-end"
                    }}>
                        <View style={{
                            height: 360,
                            backgroundColor: Theme.colors.primaryColor,
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 5,
                            gap: 10,
                        }}>
                            <View style={{
                                position: "absolute",
                                top: 0,
                                right: 0,
                                padding: 20
                            }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsResultModalVisible(false)
                                    }}
                                >
                                    <Text style={{
                                        fontSize: 17,
                                        color: "white",
                                    }}>close</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={{
                                color: "white",
                                fontSize: 25
                            }}>Run Summary</Text>
                            <View style={{
                                height: 230,
                                width: '80%',
                                borderRadius: 5,
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 10,
                                backgroundColor: "rgba(0, 0, 0, 0.3)"
                            }}>
                                <View style={{
                                    flexDirection: "row",
                                    alignItems: "center"
                                }}>
                                    <Text style={{
                                        fontSize: 18,
                                        color: "white"
                                    }}>Distance: </Text>
                                    <Text style={{
                                        fontSize: 18,
                                        color: "white",
                                        fontWeight: "200"
                                    }}>{(runMetrics.distance / 1609.34).toFixed(2)} miles</Text>
                                </View>
                                <View style={{
                                    flexDirection: "row",
                                    alignItems: "center"
                                }}>
                                    <Text style={{
                                        fontSize: 18,
                                        color: "white"
                                    }}>Time: </Text>
                                    <Text style={{
                                        fontSize: 18,
                                        color: "white",
                                        fontWeight: "200"
                                    }}>{formatTime(runMetrics.elapsedTime)}</Text>
                                </View>
                                <View style={{
                                    flexDirection: "row",
                                    alignItems: "center"
                                }}>
                                    <Text style={{
                                        fontSize: 18,
                                        color: "white"
                                    }}>Avg Pace: </Text>
                                    <Text style={{
                                        fontSize: 18,
                                        color: "white",
                                        fontWeight: "200",
                                    }}>{formatPace(runMetrics.averageSpeed)}/miles</Text>
                                </View>
                                <View style={{
                                    flexDirection: "row",
                                    alignItems: "center"
                                }}>
                                    <Text style={{
                                        fontSize: 18,
                                        color: "white"
                                    }}>Status: </Text>
                                    <Text style={{
                                        fontSize: 18,
                                        color: "white",
                                        fontWeight: "200"
                                    }}>{runMetrics.distance >= TARGET_DISTANCE_METERS ? 'Completed' : 'Incomplete'}</Text>
                                </View>
                                <TouchableOpacity style={styles.getStartedBtn}
                                    onPress={() => {
                                        setIsResultModalVisible(false);
                                        setPrepTime(5);
                                        navigation.goBack();
                                    }}
                                >
                                    <Text style={{
                                        fontFamily: Theme.Montserrat_Font.Mont400,
                                        color: "white"
                                    }}>Continue</Text>
                                    <Image source={require("../../../assets/downloadedIcons/fast.png")}
                                        style={{
                                            width: 25,
                                            height: 25,
                                            resizeMode: "contain"
                                        }}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    mapContainer: {
        flex: 1,
        height: 300,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    metricsContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        margin: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    progressBarContainer: {
        height: 20,
        backgroundColor: '#E0E0E0',
        borderRadius: 10,
        marginBottom: 15,
        overflow: 'hidden',
        position: 'relative',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 10,
    },
    progressText: {
        position: 'absolute',
        width: '100%',
        textAlign: 'center',
        color: '#000',
        fontWeight: 'bold',
        lineHeight: 20,
    },
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    secondaryMetricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingTop: 15,
    },
    metricItem: {
        flex: 1,
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: 12,
        color: '#757575',
        marginBottom: 5,
    },
    metricValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212121',
    },
    secondaryLabel: {
        fontSize: 10,
        color: '#9E9E9E',
        marginBottom: 3,
    },
    secondaryValue: {
        fontSize: 16,
        color: '#424242',
    },
    activityIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    activityText: {
        marginLeft: 5,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
    },
    buttonContainer: {
        padding: 20,
        alignItems: 'center',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 5,
        width: '100%',
    },
    startButton: {
        backgroundColor: Theme.colors.primaryColor,
    },
    stopButton: {
        backgroundColor: '#F44336',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 10,
    },
    getStartedBtn: {
        padding: 10,
        backgroundColor: "black",
        alignItems: "center",
        justifyContent: "space-between",
        width: "70%",
        alignSelf: "center",
        borderRadius: 5,
        gap: 10,
        flexDirection: "row"
    },
    road: {
        width: 6,
        height: '80%',
        backgroundColor: '#ccc',
        position: 'relative',
        borderRadius: 3,
        marginVertical: 10,
    },
    indicator: {
        left: -7,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#4285F4', // Google blue
    },
    distance: {
        marginTop: 10,
        fontWeight: 'bold',
    },
});

export default RunningTestScreen;