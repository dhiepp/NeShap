import React, {Component} from 'react';
import {StyleSheet, View, Keyboard} from 'react-native';
import {
  ActivityIndicator,
  TextInput,
  Title,
  Button,
  Divider,
  Card,
  Chip,
  Snackbar,
} from 'react-native-paper';
import ImagePicker from 'react-native-image-picker';
import PostController from '../controllers/PostController';

import {ScrollView} from 'react-native-gesture-handler';

export default class WritePostScreen extends Component {
  state = {
    message: false,
    cover: false,
    title: '',
    content: '',
    tags: new Set(),
    new_tags: '',
  };
  render() {
    if (this.state.loading) {
      return <ActivityIndicator size="large" style={styles.full} />;
    }
    return (
      <View style={styles.full}>
        <ScrollView keyboardShouldPersistTaps="handled" style={styles.full}>
          <Card style={styles.box} onPress={() => Keyboard.dismiss()}>
            <Title style={styles.title}>Ảnh bìa</Title>
            <Card.Cover
              source={
                this.state.cover
                  ? {uri: this.state.cover.uri}
                  : require('./static/default_cover.jpg')
              }
              resizeMode="contain"
              style={styles.cover}
            />
            <Button
              mode="contained"
              icon="image"
              style={styles.child}
              onPress={this._handleImagePicker}>
              Chọn ảnh
            </Button>
            <Divider style={styles.child} />
            <Title style={styles.title}>Thông tin bài viết</Title>
            <TextInput
              label="Tiêu đề"
              mode="outlined"
              multiline={false}
              maxLength={50}
              style={styles.child}
              onChangeText={(text) => this.setState({title: text})}
            />
            <TextInput
              label="Nội dung"
              mode="outlined"
              multiline={true}
              maxLength={5000}
              style={styles.child}
              onChangeText={(text) => this.setState({content: text})}
            />
            <View style={styles.tags}>
              {Array.from(this.state.tags).map((tag) => (
                <Chip
                  key={tag}
                  icon="tag"
                  style={styles.tagchip}
                  onPress={() => null}
                  onClose={() => this._handleTagRemove(tag)}>
                  {tag}
                </Chip>
              ))}
            </View>
            <View style={styles.inline_box}>
              <TextInput
                label="Tags"
                mode="outlined"
                style={styles.inline_input}
                value={this.state.new_tags}
                onChangeText={(text) => this.setState({new_tags: text})}
              />
              <Button
                mode="contained"
                style={styles.inline_button}
                onPress={this._handleTagInput}>
                Thêm
              </Button>
            </View>
            <Button
              mode="contained"
              icon="plus"
              style={styles.child}
              onPress={this._handleSubmit}>
              Đăng bài mới
            </Button>
          </Card>
        </ScrollView>
        <Snackbar
          visible={this.state.message}
          onDismiss={() => this.setState({message: false})}
          action={{
            label: 'OK',
            onPress: () => this.setState({message: false}),
          }}>
          {this.state.message}
        </Snackbar>
      </View>
    );
  }

  _handleImagePicker = () => {
    ImagePicker.showImagePicker((response) => {
      if (response.didCancel === undefined) {
        this.setState({cover: response});
      }
    });
  };
  _handleTagInput = () => {
    if (!this.state.new_tags) {
      return;
    }
    let current_tags = this.state.tags;
    const new_tags = this.state.new_tags.toLowerCase().trim().split(/\s+/);
    new_tags.forEach((tag) => {
      if (tag.match(/^[0-9a-zA-Z]{3,20}$/)) {
        current_tags.add(tag);
      }
    });
    this.setState({tags: current_tags, new_tags: ''});
  };
  _handleTagRemove = (tag) => {
    const tags = this.state.tags;
    tags.delete(tag);
    this.setState({tags: tags});
  };
  _handleSubmit = () => {
    PostController.write(this);
  };
}

const styles = StyleSheet.create({
  full: {
    flex: 1,
  },
  box: {
    padding: 10,
    margin: 10,
  },
  title: {
    flex: 1,
    margin: 10,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  child: {
    margin: 5,
    textAlign: 'center',
  },
  cover: {
    margin: 5,
    resizeMode: 'contain',
  },
  tags: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  tagchip: {
    margin: 2,
  },
  inline_box: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inline_input: {
    flex: 4,
    margin: 5,
  },
  inline_button: {
    flex: 1,
    margin: 5,
  },
});
