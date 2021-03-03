import React, {Component} from 'react';
import {View, StyleSheet, Keyboard, ScrollView} from 'react-native';
import {
  Card,
  Searchbar,
  Text,
  Chip,
  Avatar,
  Subheading,
  withTheme,
  TouchableRipple,
  Headline,
} from 'react-native-paper';

import ListPostComponent from './components/ListPostComponent';
import UserController from '../controllers/UserController';

class SearchScreen extends Component {
  state = {
    refresh: false,
    keyword: '',
    message: 'Hãy nhập từ khóa tìm kiếm',
  };
  scroll;
  render() {
    return (
      <View style={styles.full}>
        <Card elevation={10} style={styles.top}>
          <Searchbar
            placeholder="Nhập từ khóa..."
            value={this.state.keyword}
            autoCapitalize="none"
            iconColor={this.props.theme.colors.primary}
            onChangeText={(text) => this._handleSearchInput(text)}
            onIconPress={this._handleSearch}
            onSubmitEditing={this._handleSearch}
          />
        </Card>
        <ScrollView
          ref={(r) => {
            this.scroll = r;
          }}>
          <View style={styles.inline}>
            {this.state.tag && (
              <Card style={styles.col}>
                <View style={styles.inline}>
                  <Text>Xem Tag: </Text>
                  <Chip icon="tag" onPress={this._handleViewTag}>
                    {this.state.tag}
                  </Chip>
                </View>
              </Card>
            )}
            {this.state.user && (
              <Card style={styles.col}>
                <TouchableRipple
                  borderles
                  style={styles.inline}
                  onPress={this._handleViewUser}>
                  <View style={styles.user}>
                    <Avatar.Image
                      size={32}
                      source={{uri: this.state.user.avatar}}
                      style={styles.comment_avatar}
                    />
                    <Subheading style={styles.username}>
                      {this.state.user.name}
                    </Subheading>
                  </View>
                </TouchableRipple>
              </Card>
            )}
          </View>
          {this.state.message ? (
            <Headline style={styles.title}>{this.state.message}</Headline>
          ) : (
            <ListPostComponent
              mode="search"
              keyword={this.state.keyword}
              navigation={this.props.navigation}
              refresh={this.state.refresh}
              onFinishRefresh={this._finishRefresh}
              style={styles.full}
            />
          )}
        </ScrollView>
      </View>
    );
  }

  _handleSearchInput = (text) => {
    if (!text) {
      this.setState({search: false});
    }
    this.setState({keyword: text});
  };
  _handleSearch = async () => {
    Keyboard.dismiss();
    const keyword = this.state.keyword.toLowerCase();
    if (keyword.length < 3) {
      this.setState({message: 'Từ khóa quá ngắn!', tag: tag, user: user});
      return;
    }
    let tag;
    let user;
    if (keyword.match(/^[0-9a-zA-Z,]{3,20}$/)) {
      tag = keyword;
      user = await UserController.search(null, keyword);
    }
    this.setState({refresh: true, message: false, tag: tag, user: user});
  };
  _handleViewTag = () => {
    this.props.navigation.push('ViewTag', {tag: this.state.tag});
  };
  _handleViewUser = () => {
    this.props.navigation.push('ViewUser', {user_id: this.state.user.user_id});
  };
  _finishRefresh = () => {
    this.setState({refresh: false});
  };
}

export default withTheme(SearchScreen);

const styles = StyleSheet.create({
  full: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
  },
  top: {
    padding: 10,
  },
  box: {
    margin: 10,
    padding: 10,
  },
  inline: {
    flex: 1,
    margin: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  col: {
    flex: 1,
    margin: 5,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  user: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  username: {
    fontWeight: 'bold',
    marginLeft: 10,
  },
  child: {
    flex: 1,
  },
});
