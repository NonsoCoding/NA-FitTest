import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native"
import { DrawerParamList } from "../nav/type";

interface IAdminProps {

}

const AdminDashboard = ({

}: IAdminProps) => {

    const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

    return (
        <View style={styles.container}>
            <View>
                <Text>YOU ARE NOT AN ADMIN</Text>
            </View>
        </View>
    )
}

export default AdminDashboard;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
})