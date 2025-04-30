import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import ReactNativeModal from 'react-native-modal';

interface SuccessModalProps {
    visible: boolean;
    onClose: () => void;
}

const SuccessModal = ({ visible, onClose }: SuccessModalProps) => {
    return (
        <ReactNativeModal
            isVisible={visible}
            onBackdropPress={onClose}
            animationIn="fadeIn"
            animationOut="fadeOut"
            style={{ margin: 0 }}
        >
            <View style={{
                justifyContent: "flex-end",
                flex: 1,
                padding: 20,
                paddingBottom: 30
            }}>
                <View style={{
                    height: "8%",
                    borderRadius: 5,
                    paddingHorizontal: 20,
                    alignItems: "center",
                    gap: 15,
                    flexDirection: "row",
                    backgroundColor: "#006F46"
                }}>
                    <TouchableOpacity style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        paddingTop: 10,
                        paddingRight: 15
                    }}
                        onPress={() => {
                            onClose();
                        }}
                    >
                        <Text style={{
                            color: 'white'
                        }}>X</Text>
                    </TouchableOpacity>
                    <Image source={require("../../assets/downloadedIcons/info-fill.png")}
                        style={{
                            height: 24,
                            width: 24
                        }}
                    />
                    <Text style={{
                        color: "white"
                    }}>Successful!</Text>
                </View>
            </View>
        </ReactNativeModal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default SuccessModal;
