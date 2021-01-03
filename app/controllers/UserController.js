import * as AppData from '../miscs/AppData';
import * as Crypto from 'expo-crypto';
import {CommonActions} from '@react-navigation/native';

export default class UserController {
  static avatar(user_id) {
    if (!user_id) {
      return './screens/static/default_avatar.png';
    }
    return `${AppData.server}/user/avatar?userid=${user_id}&t=${Date.now()}`;
  }

  static async view(navigation, user_id) {
    navigation.push('ViewUser', {user_id: user_id});
  }

  static async checkPerm(check_id) {
    try {
      const user_data = await AppData.getUserData();
      const user_id = user_data.user_id;

      let value = 0;
      // Logged in
      if (user_id != null) {
        value = 1;
      }
      // Admin
      if (user_data.role === '1') {
        value = 3;
      }
      // Same user
      if (user_id === check_id) {
        value = 2;
      }
      return {user_id: user_id, value: value};
    } catch (exception) {
      console.log(exception);
      return 0;
    }
  }

  static async login(screen) {
    try {
      screen.setState({message: false});
      const name = screen.state.name;
      const password = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        screen.state.password,
      );

      console.log(password);
      const response = await fetch(
        `${AppData.server}/user/login?name=${name}&password=${password}`,
        {method: 'post'},
      );

      const json = await response.json();
      console.log(json);
      if (json.status) {
        AppData.setUserData({
          user_id: json.user_id,
          session_id: json.session_id,
          role: json.role,
        });
        screen.props.navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              {
                name: 'HomeTabs',
              },
            ],
          }),
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
        `${AppData.server}/user/register?name=${name}&password=${password}`,
        {method: 'post'},
      );
      const json = await response.json();
      console.log(json);
      if (json.status) {
        AppData.setUserData({
          user_id: json.user_id,
          session_id: json.session_id,
          role: json.role,
        });
        screen.props.navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              {
                name: 'HomeTabs',
                params: {screen: 'Account'},
              },
            ],
          }),
        );
      } else {
        screen.setState({message: json.message});
      }
    } catch (exception) {
      console.log(exception);
    }
  }

  static async logout(screen) {
    try {
      const session_id = (await AppData.getUserData()).session_id;
      await fetch(`${AppData.server}/user/logout?session_id=${session_id}`, {
        method: 'post',
      });

      const check = await AppData.removeUserData();
      if (check) {
        screen.props.navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              {
                name: 'Login',
              },
            ],
          }),
        );
      }
    } catch (exception) {
      console.log(exception);
    }
  }

  static async profile(user_id) {
    try {
      const viewer_id = (await AppData.getUserData()).user_id;
      const response = await fetch(
        `${AppData.server}/user/profile?user_id=${user_id}&viewer_id=${viewer_id}`,
        {method: 'get'},
      );
      let json = await response.json();
      // eslint-disable-next-line prettier/prettier
      json.user.avatar = `${AppData.server}/user/avatar?user_id=${user_id}&t=${Date.now()}`;
      return json;
    } catch (exception) {
      console.log(exception);
      return null;
    }
  }

  static async search(user_id, user_name) {
    try {
      let key;
      if (user_id) {
        key = `user_id=${user_id}`;
      } else if (user_name) {
        key = `user_name=${user_name}`;
      }
      const response = await fetch(`${AppData.server}/user/search?${key}`, {
        method: 'get',
      });

      let json = await response.json();
      if (json) {
        // eslint-disable-next-line prettier/prettier
        json.avatar = `${AppData.server}/user/avatar?user_id=${json.user_id}&t=${Date.now()}`;
      }
      return json;
    } catch (exception) {
      console.log(exception);
      return null;
    }
  }

  static async list(mode, page) {
    try {
      const user_data = await AppData.getUserData();
      const session_id = user_data.session_id;
      const user_id = user_data.user_id;

      const response = await fetch(
        `${AppData.server}/user/list?session_id=${session_id}&mode=${mode}&page=${page}&user_id=${user_id}`,
        {method: 'get'},
      );
      let json = await response.json();

      const time = Date.now();
      json = json.map((user) => {
        user.avatar = `${AppData.server}/user/avatar?user_id=${user.user_id}&t=${time}`;
        return user;
      });
      return json;
    } catch (exception) {
      console.log(exception);
      return null;
    }
  }

  static async edit(screen) {
    try {
      screen.setState({message: false, loading: true});

      const request = {};
      request.session_id = (await AppData.getUserData()).session_id;
      request.name = screen.state.new_name;
      request.password = screen.state.new_password
        ? await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            screen.state.new_password,
          )
        : undefined;
      const avatar = screen.state.new_avatar;

      const data = new FormData();
      data.append('data', JSON.stringify(request));
      if (avatar) {
        data.append('avatar', {
          name: avatar.fileName,
          type: avatar.type,
          uri: avatar.uri,
        });
      }
      const init = {
        method: 'post',
        body: data,
      };

      const response = await fetch(`${AppData.server}/user/edit`, init);
      const json = await response.json();
      console.log(json);
      if (json.status) {
        screen.setState({
          error: false,
          loading: false,
          message: 'Đã lưu thông tin cá nhân',
        });
      } else {
        screen.setState({error: true, loading: false, message: json.message});
      }
    } catch (exception) {
      console.log(exception);
    }
  }

  static async friend(screen) {
    try {
      screen.setState({message: false});

      const session_id = (await AppData.getUserData()).session_id;
      const friend_id = screen.state.user.user_id;
      const friended = screen.state.f2;
      const action = friended ? 'unfriend' : 'friend';

      const response = await fetch(
        `${AppData.server}/user/${action}?session_id=${session_id}&friend_id=${friend_id}`,
        {method: 'post'},
      );

      const json = await response.json();
      if (json.status) {
        screen.setState({
          error: false,
          message: json.message,
          f1: json.f1,
          f2: json.f2,
        });
      } else {
        screen.setState({error: true, message: json.message});
      }
    } catch (exception) {
      console.log(exception);
    }
  }

  static async delete(screen) {
    try {
      const session_id = (await AppData.getUserData()).session_id;
      const delete_id = screen.state.delete;
      const hard = screen.state.hard ? '&hard=true' : '';

      const response = await fetch(
        `${AppData.server}/user/delete?session_id=${session_id}&delete_id=${delete_id}${hard}`,
        {method: 'post'},
      );
      let json = await response.json();
      if (json.status) {
        screen.setState({error: false, message: 'Đã xóa tài khoản'});
      } else {
        screen.setState({error: true, message: json.message});
      }
    } catch (exception) {
      console.log(exception);
      return null;
    }
  }
}
