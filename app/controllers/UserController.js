import * as AppData from '../AppData';
import * as Crypto from 'expo-crypto';
import { CommonActions } from '@react-navigation/native';

export default class UserController {
  static async view(navigation, userid) {
    navigation.push('ViewUser', {userid: userid});
  }

  static async login(screen) {
    try {
      screen.setState({message: false});
      const name = screen.state.name;
      const password = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        screen.state.password,
      );
      
      const response = await fetch(
        `${
          AppData.server
        }/user/login?name=${name}&password=${password}`,
        {method: 'post'},
      );

      const json = await response.json();
      console.log(json);
      if (json.status) {
        AppData.setUserData({user_id: json.user_id, session_id: json.session_id, role: json.role});
        screen.props.navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              {
                name: 'HomeTabs',
                params: {screen: 'Account'},
              },
            ],
          })
        );
      } else {
        screen.setState({message: json.message});
      }
    } catch (exception) {
      console.log(exception);
    }
  }

  static async register(screen) {
    try {
      screen.setState({message: false});
      const name = screen.state.name;
      const password = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        screen.state.password,
      );

      const response = await fetch(
        `${
          AppData.server
        }/user/register?name=${name}&password=${password}`,
        {method: 'post'},
      );
      const json = await response.json();
      console.log(json);
      if (json.status) {
        AppData.setUserData({user_id: json.user_id, session_id: json.session_id, role: json.role});
        screen.props.navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              {
                name: 'HomeTabs',
                params: {screen: 'Account'},
              },
            ],
          })
        );
      } else {
        screen.setState({message: json.message});
      }
    } catch (exception) {
      console.log(exception);
    }
  }

  static async logout(screen) {
    const check = await AppData.removeUserData();
    if (check) {
      screen.setState({isLoggedIn: false});
    }
  }

  static async get(userid) {
    try {
      if (userid === undefined) {
        userid = (await AppData.getUserData()).userid;
      }
      const response = await fetch(
        `${AppData.server}/user/get?userid=${userid}`,
        {method: 'get'},
      );
      let json = await response.json();
      if (!json) {
        json = {username: '[đã xóa]'};
      }
      json.avatar = `${
        AppData.server
      }/user/avatar?userid=${userid}&t=${Date.now()}`;
      return json;
    } catch (exception) {
      console.log(exception);
      return null;
    }
  }

  static async list(page) {
    try {
      const adminid = (await AppData.getUserData()).userid;
      const response = await fetch(
        `${AppData.server}/user/list?adminid=${adminid}&page=${page}`,
        {method: 'get'},
      );
      let json = await response.json();
      return json;
    } catch (exception) {
      console.log(exception);
    }
  }

  static async search(username) {
    try {
      const response = await fetch(
        `${AppData.server}/user/search?username=${username}`,
        {method: 'get'},
      );
      let json = await response.json();
      if (!json) {
        return null;
      }
      console.log(json);
      // eslint-disable-next-line prettier/prettier
      json.avatar = `${AppData.server}/user/avatar?userid=${json._id}&t=${Date.now()}`;
      return json;
    } catch (exception) {
      console.log(exception);
      return null;
    }
  }

  static async checkPerm(checkid) {
    try {
      const userdata = await AppData.getUserData();
      const userid = userdata.userid;
      let value = 0;
      // Logged in
      if (userid != null) {
        value = 1;
      }
      // Same user
      if (userid === checkid) {
        value = 2;
      }
      // Admin
      if (userdata.role === '1') {
        value = 3;
      }
      return {userid: userid, value: value};
    } catch (exception) {
      console.log(exception);
      return 0;
    }
  }

  static async edit(screen) {
    try {
      screen.setState({message: false});

      const userid = screen.state.user._id;
      const username = screen.state.newUsername;
      const password = screen.state.newPassword;
      const avatar = screen.state.newAvatar;

      let request = `${AppData.server}/user/edit?userid=${userid}`;
      let init = {method: 'post'};
      if (username) {
        request += `&username=${username}`;
      }
      if (password) {
        request += `&password=${password}`;
      }
      if (avatar) {
        const data = new FormData();
        data.append('avatar', {
          name: avatar.fileName,
          type: avatar.type,
          uri: avatar.uri,
        });
        init = {
          method: 'post',
          body: data,
        };
      }

      const response = await fetch(request, init);
      const json = await response.json();
      console.log(json);
      if (json.status === 'success') {
        screen.setState({error: false, message: 'Đã lưu thông tin cá nhân'});
      } else {
        screen.setState({error: true, message: json.message});
      }
    } catch (exception) {
      console.log(exception);
    }
  }

  static async delete(screen) {
    try {
      const adminid = (await AppData.getUserData()).userid;
      const deleteid = screen.state.delete;

      const response = await fetch(
        `${AppData.server}/user/delete?adminid=${adminid}&deleteid=${deleteid}`,
        {method: 'post'},
      );
      let json = await response.json();
      if (json.status === 'success') {
        screen.setState({error: false, message: 'Đã xóa tài khoản'});
      } else {
        screen.setState({error: true, message: json.message});
      }
    } catch (exception) {
      console.log(exception);
      return null;
    }
  }

  static async follow(screen) {
    try {
      screen.setState({message: false});

      const userid = (await AppData.getUserData()).userid;
      const followid = screen.state.user._id;
      let followed = screen.state.followed;

      // eslint-disable-next-line prettier/prettier
      let request = `${AppData.server}/user/follow?userid=${userid}&followid=${followid}`;
      if (followed) {
        // eslint-disable-next-line prettier/prettier
        request = `${AppData.server}/user/unfollow?userid=${userid}&followid=${followid}`;
      }

      const response = await fetch(request, {method: 'post'});
      const json = await response.json();
      console.log(json);
      if (json.status === 'success') {
        let followers = screen.state.followers;
        followed = !followed;
        if (followed) {
          followers.push(userid);
        } else {
          followers = followers.filter(follower => follower !== userid);
        }
        screen.setState({
          error: false,
          message: json.message,
          followers: followers,
          followed: followed,
        });
      } else {
        screen.setState({error: true, message: json.message});
      }
    } catch (exception) {
      console.log(exception);
    }
  }
}
