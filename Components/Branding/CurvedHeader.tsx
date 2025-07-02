import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const height = 180; // height of the header

const CurvedHeader = () => {
    return (
        <View style={{ height }}>
            <LinearGradient
                colors={["#FFD700", "#FFB300"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            <Svg
                height={height}
                width={width}
                viewBox={`0 0 ${width} ${height}`}
                style={StyleSheet.absoluteFill}
            >
                <Path
                    d={`
            M0,0 
            H${width} 
            V${height - 60} 
            C${width * 0.75},${height} ${width * 0.25},${height - 120} 0,${height - 30} 
            Z
          `}
                    fill="white"
                />
            </Svg>
        </View>
    );
};

export default CurvedHeader;
