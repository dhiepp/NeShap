import AsyncStorage from '@react-native-community/async-storage';

export async function checkUserData() {
  try {
    const value = await AsyncStorage.getItem('userid');
    if (value != null) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getUserData() {
  try {
    const userid = await AsyncStorage.getItem('userid');
    const role = await AsyncStorage.getItem('role');
    return {userid: userid, role: role};
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function setUserData(userdata) {
  try {
    console.log(userdata);
    await AsyncStorage.setItem('userid', userdata.userid);
    await AsyncStorage.setItem('role', String(userdata.role));
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function removeUserData() {
  try {
    await AsyncStorage.removeItem('userid');
    await AsyncStorage.removeItem('role');
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const server = 'http://127.0.0.1:6969';

export {server};
