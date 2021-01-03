import AsyncStorage from '@react-native-community/async-storage';

export async function checkUserData() {
  try {
    const user_id = await AsyncStorage.getItem('user_id');
    const session_id = await AsyncStorage.getItem('session_id');
    const role = await AsyncStorage.getItem('role');
    if (!user_id || !session_id || !role) {
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getUserData() {
  try {
    const user_id = await AsyncStorage.getItem('user_id');
    const session_id = await AsyncStorage.getItem('session_id');
    const role = await AsyncStorage.getItem('role');
    return {user_id: user_id, session_id: session_id, role: role};
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function setUserData(userdata) {
  try {
    await AsyncStorage.setItem('user_id', userdata.user_id);
    await AsyncStorage.setItem('session_id', userdata.session_id);
    await AsyncStorage.setItem('role', String(userdata.role));
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function removeUserData() {
  try {
    await AsyncStorage.removeItem('user_id');
    await AsyncStorage.removeItem('session_id');
    await AsyncStorage.removeItem('role');
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const server = 'http://10.0.2.2:6969';
// const server = 'http://neshap.3fmc.com';

export {server};
