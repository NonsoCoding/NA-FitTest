// ResultModal.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Modal from 'react-native-modal';

interface ResultModalProps {
    isVisible: boolean;
    onClose: () => void;
    type: 'success' | 'failure'; // 🔥 type decides which modal it is
    message: string;
}

const ResultModal: React.FC<ResultModalProps> = ({ isVisible, onClose, type, message }) => {
    return (
        <Modal
            isVisible={isVisible}
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
                    backgroundColor: type === "success" ? '#006F46' : '#AC1D1B'
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
                    }}>{type === "success" ? 'Success!' : 'Invalid OTP!'}</Text>
                </View>
            </View>
        </Modal>
    );
};

export default ResultModal;
