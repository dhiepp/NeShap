import React, {Component} from 'react';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from '../HomeScreen';
import SearchScreen from '../SearchScreen';
import AccountScreen from '../AccountScreen';
import ListNotificationScreen from '../ListNotificationScreen';
import ListChatScreen from '../ListChatScreen';

import NotificationController from '../../controllers/NotificationController';

const Tab = createMaterialBottomTabNavigator();

export default class HomeTabs extends Component {
  async componentDidMount() {
    await this.loadBadges();
  }
  render() {
    return (
      <Tab.Navigator
        initialRouteName="Home"
        backBehavior="initialRoute"
        // eslint-disable-next-line react-native/no-inline-styles
        barStyle={{backgroundColor: '#6200ee'}}>
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
          name="Notification"
          options={{
            title: 'Thông báo',
            tabBarBadge: this.state?.notifications,
            tabBarIcon: ({color}) => (
              <MaterialCommunityIcons name="bell" color={color} size={26} />
            ),
          }}>
          {(props) => (
            <ListNotificationScreen
              {...props}
              loadBadges={() => this.loadBadges()}
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Chat"
          options={{
            title: 'Tin nhắn',
            tabBarBadge: this.state?.chats,
            tabBarIcon: ({color}) => (
              <MaterialCommunityIcons name="chat" color={color} size={26} />
            ),
          }}>
          {(props) => (
            <ListChatScreen {...props} loadBadges={() => this.loadBadges()} />
          )}
        </Tab.Screen>
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
  async loadBadges() {
    const badges = await NotificationController.badge();
    const notifications =
      badges.notifications > 0 ? badges.notifications : false;
    const chats = badges.chats > 0 ? badges.chats : false;
    this.setState({notifications: notifications, chats: chats});
  }
}
