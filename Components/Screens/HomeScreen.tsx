import { StyleSheet, View } from "react-native";


interface IHomePageProps {
    navigation: any;
}

const HomePage = ({ }: IHomePageProps) => {
    return (
        <View style={{
            flex: 1
        }}>
            <View style={styles.top_container}>

            </View>
        </View>
    )
}

export default HomePage;

const styles = StyleSheet.create({
    container: {

    },
    top_container: {
        height: 300,
        backgroundColor: "black"
    }
})
