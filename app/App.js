import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import HomeTabs from './screens/components/HomeTabs';
import WelcomeScreen from './screens/WelcomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import ViewUserScreen from './screens/ViewUserScreen';
import EditUserScreen from './screens/EditUserScreen';
import WritePostScreen from './screens/WritePostScreen';
import ViewPostScreen from './screens/ViewPostScreen';
import EditPostScreen from './screens/EditPostScreen';
import ViewTagScreen from './screens/ViewTagScreen';
import ListUserScreen from './screens/ListUserScreen';
import ManageUserScreen from './screens/ManageUserScreen';
import ViewChatScreen from './screens/ViewChatScreen';

const Stack = createStackNavigator();

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
          options={{title: 'Danh sách người dùng'}}
        />
        <Stack.Screen
          name="ManageUser"
          component={ManageUserScreen}
          options={{title: 'Quản lý người dùng'}}
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
        <Stack.Screen
          name="ViewChat"
          component={ViewChatScreen}
          options={{title: 'Nhắn tin'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
