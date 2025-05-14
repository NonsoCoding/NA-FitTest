import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Theme } from "../Branding/Theme";
import { FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useState } from "react";
import { string } from "yup";

interface ICameraMedalProps {
    navigation?: any;
    isVisible?: any;
    onClose: () => void;
}

const CameraModal = ({
    navigation,
    isVisible,
    onClose
}: ICameraMedalProps) => {

    const [selectedImage, setSelectedImage] = useState<string | null>(null);


    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            alert("Camera permission is required!");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const imageUri = result.assets[0].uri;
            setSelectedImage(imageUri);
        }
    };


    const pickImage = async () => {
        // Delay closing modal just enough to prevent UI conflict
        setTimeout(async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageUri = result.assets[0].uri;
                setSelectedImage(imageUri);
            }
        }, 1000);
        onClose();
    };

    const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dkfh0oefs/image/upload";
    const UPLOAD_PRESET = "unsigned_preset"; // replace this

    const uploadToCloudinary = async (imageUri: string) => {
        const data = new FormData();
        data.append("file", {
            uri: imageUri,
            type: "image/jpeg",
            name: "profile.jpg",
        } as any);
        data.append("upload_preset", UPLOAD_PRESET);

        try {
            const res = await fetch(CLOUDINARY_URL, {
                method: "POST",
                body: data,
            });
            const json = await res.json();
            console.log("Uploaded image URL:", json.secure_url);
            return json.secure_url;
        } catch (err) {
            console.error("Upload failed", err);
            return null;
        }
    };

    const saveProfileImage = async (url: string) => {
        const auth = getAuth();
        const db = getFirestore();
        const user = auth.currentUser;

        if (!user) return;

        const userRef = doc(db, "UserDetails", user.uid);

        try {
            await updateDoc(userRef, {
                profilePic: url,
            });
            console.log("Profile image saved to Firestore ✅");
        } catch (err) {
            console.error("Failed to save image URL to Firestore ❌", err);
        }
    };



    return (
        <View style={{
            flex: 1
        }}>
            {selectedImage ? (
                <View style={{ flex: 1, backgroundColor: "white" }}>
                    <View style={{
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 20,
                        padding: 20,
                    }}>
                        <Image
                            source={{ uri: selectedImage }}
                            style={{
                                width: 200,
                                height: 200,
                                borderRadius: 10,
                                resizeMode: "cover"
                            }}
                        />
                        <View style={{ flexDirection: "row", gap: 20 }}>
                            <TouchableOpacity
                                onPress={() => setSelectedImage(null)}
                                style={{
                                    backgroundColor: "gray",
                                    padding: 10,
                                    borderRadius: 5
                                }}
                            >
                                <Text style={{ color: "white", fontWeight: "bold" }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={async () => {
                                    if (selectedImage) {
                                        const uploadedUrl = await uploadToCloudinary(selectedImage);
                                        if (uploadedUrl) {
                                            await saveProfileImage(uploadedUrl);
                                            setSelectedImage(null);
                                            onClose();
                                        }
                                    }
                                }}
                                style={{
                                    backgroundColor: "#657432",
                                    padding: 10,
                                    borderRadius: 5
                                }}
                            >
                                <Text style={{ color: "white", fontWeight: "bold" }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

            ) : (
                <Modal
                    visible={isVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => {
                        onClose;
                    }}
                >
                    <View style={{
                        flex: 1,
                        backgroundColor: "rgba(0, 0, 0, 0.4)",
                        justifyContent: "flex-end"
                    }}>
                        <View style={{
                            backgroundColor: Theme.colors.primaryColor,
                            height: "40%",
                            borderTopLeftRadius: 10,
                            borderTopRightRadius: 10,
                            justifyContent: "flex-start",
                            padding: 20,
                            gap: 30
                        }}>
                            <View style={{
                                flexDirection: "row",
                                justifyContent: 'space-between',
                            }}>
                                <View style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 20
                                }}>
                                    <Image
                                        style={{
                                            height: 40,
                                            width: 40,
                                            resizeMode: "contain"
                                        }}
                                        source={require("../../assets/downloadedIcons/profile.png")}
                                    />
                                    <Text style={{
                                        color: 'white',
                                        fontWeight: "700",
                                        fontSize: 18
                                    }}>Edit profile picture</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        onClose();
                                    }}
                                    style={{
                                        backgroundColor: "#657432",
                                        padding: 5,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        paddingHorizontal: 12,
                                        borderRadius: 30
                                    }}
                                >
                                    <FontAwesome5
                                        name="times"
                                        color={"white"}
                                        size={23}
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={{
                                backgroundColor: "#657432",
                                padding: 20,
                                borderRadius: 5,
                                gap: 30
                            }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        takePhoto();
                                    }}
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}>
                                    <Text style={{
                                        color: 'white',
                                        fontWeight: "700"
                                    }}>
                                        Take photo
                                    </Text>

                                    <Ionicons
                                        name="camera"
                                        size={25}
                                        color={"white"}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        pickImage();
                                    }}
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}>
                                    <Text style={{
                                        color: 'white',
                                        fontWeight: "700"
                                    }}>
                                        Choose photo
                                    </Text>

                                    <FontAwesome
                                        name="photo"
                                        size={22}
                                        color={"white"}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity style={{
                                    flexDirection: 'row',
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}>
                                    <Text style={{
                                        color: 'red',
                                        fontWeight: "700"
                                    }}>
                                        Delete photo
                                    </Text>

                                    <Ionicons
                                        name="trash-outline"
                                        size={25}
                                        color={'white'}
                                    />
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                </Modal>
            )}
        </View>
    )
}

export default CameraModal;

const styles = StyleSheet.create({

})