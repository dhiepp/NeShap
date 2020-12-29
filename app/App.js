import React, {Component} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import WelcomeScreen from './screens/WelcomeScreen';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import AccountScreen from './screens/AccountScreen';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import ViewUserScreen from './screens/ViewUserScreen';
import EditUserScreen from './screens/EditUserScreen';
import WritePostScreen from './screens/WritePostScreen';
import ViewPostScreen from './screens/ViewPostScreen';
import EditPostScreen from './screens/EditPostScreen';
import ViewTagScreen from './screens/ViewTagScreen';
import ListUserScreen from './screens/ListUserScreen';

const Stack = createStackNavigator();
const Tab = createMaterialBottomTabNavigator();

class HomeTabs extends Component {
  render() {
    return (
      <Tab.Navigator
        initialRouteName="Home"
        backBehavior="initialRoute"
        barStyle={{backgroundColor: '#6200ee'}}
        shifting={true}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Trang Chủ',
            tabBarIcon: ({color}) => (
              <MaterialCommunityIcons name="home" color={color} size={26} />
            ),
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            title: 'Tìm Kiếm',
            tabBarIcon: ({color}) => (
              <MaterialCommunityIcons name="magnify" color={color} size={26} />
            ),
          }}
        />
        <Tab.Screen
          name="Account"
          component={AccountScreen}
          options={{
            title: 'Tài Khoản',
            tabBarIcon: ({color}) => (
              <MaterialCommunityIcons name="account" color={color} size={26} />
            ),
          }}
        />
      </Tab.Navigator>
    );
  }
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="HomeTabs"
          component={HomeTabs}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{title: 'Đăng nhập'}}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{title: 'Đăng ký'}}
        />
        <Stack.Screen
          name="ViewUser"
          component={ViewUserScreen}
          options={{title: 'Trang cá nhân'}}
        />
        <Stack.Screen
          name="ListUser"
          component={ListUserScreen}
          options={{title: 'Danh sách tài khoản'}}
        />
        <Stack.Screen
          name="EditUser"
          component={EditUserScreen}
          options={{title: 'Sửa thông tin cá nhân'}}
        />
        <Stack.Screen
          name="WritePost"
          component={WritePostScreen}
          options={{title: 'Viết bài mới'}}
        />
        <Stack.Screen
          name="ViewPost"
          component={ViewPostScreen}
          options={{title: 'Bài viết'}}
        />
        <Stack.Screen
          name="EditPost"
          component={EditPostScreen}
          options={{title: 'Sửa bài viết'}}
        />
        <Stack.Screen
          name="ViewTag"
          component={ViewTagScreen}
          options={{title: 'Xem tag'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
