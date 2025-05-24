import { createDrawerNavigator } from '@react-navigation/drawer';
import HomePage from '../Screens/HomeScreen';
import { DrawerParamList } from '../nav/type';
import CustomDrawerContent from './CustomDrawerContent';
import Profile from '../Screens/Profile';
import EditDetails from '../Screens/EditDetails';
import History from '../Screens/History';
import AdminDashboard from '../Screens/AdminDashboard';
import About from '../LegalDocument/About';

const Drawer = createDrawerNavigator<DrawerParamList>();

export const DrawerNavigator = () => {
  return (
    <Drawer.Navigator screenOptions={{
      headerShown: false,
      drawerType: 'front',
      drawerStyle: {
        flex: 1,
        width: "80%"
      }
    }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="HomePage" component={HomePage} />
      <Drawer.Screen name="Profile" component={Profile} />
      <Drawer.Screen name="AdminDashbaord" component={AdminDashboard} />
      <Drawer.Screen name="EditDetails" component={EditDetails} />
      <Drawer.Screen name="History" component={History} />
      <Drawer.Screen name="About" component={About} />
    </Drawer.Navigator>
  );
};
