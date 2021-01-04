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
  Portal,
  Dialog,
  Snackbar,
  Colors,
  Subheading,
} from 'react-native-paper';
import ImagePicker from 'react-native-image-picker';
import PostController from '../controllers/PostController';

import {ScrollView} from 'react-native-gesture-handler';

export default class EditPostScreen extends Component {
  state = {
    loading: true,
    message: false,
    delete: false,
    new_cover: false,
    new_title: '',
    new_content: '',
    new_tags: '',
  };
  async componentDidMount() {
    const post = await PostController.detail(this.props.route.params.post_id);
    const edit_tags = new Set();
    post.tags.forEach((tag) => edit_tags.add(tag));
    this.setState({
      loading: false,
      post: post,
      new_title: post.title,
      new_content: post.content,
      edit_tags: edit_tags,
    });
  }
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
              source={{
                uri: this.state.new_cover
                  ? this.state.new_cover.uri
                  : this.state.post.cover,
              }}
              style={styles.cover}
            />
            <Button
              mode="contained"
              icon="image"
              style={styles.child}
              onPress={this._handleImagePicker}>
              Chọn ảnh mới
            </Button>
            <Divider style={styles.child} />
            <Title style={styles.title}>Thông tin bài viết</Title>
            <TextInput
              label="Tiêu đề"
              mode="outlined"
              multiline={false}
              maxLength={50}
              defaultValue={this.state.new_title}
              style={styles.child}
              onChangeText={(text) => this.setState({new_title: text})}
            />
            <TextInput
              label="Nội dung"
              mode="outlined"
              multiline={true}
              maxLength={5000}
              defaultValue={this.state.new_content}
              style={styles.child}
              onChangeText={(text) => this.setState({new_content: text})}
            />
            <View style={styles.tags}>
              {Array.from(this.state.edit_tags).map((tag) => (
                <Chip
                  key={tag}
                  style={styles.tagchip}
                  onPress={() => null}
                  onClose={() => this._handleTagRemove(tag)}>
                  {tag}
                </Chip>
              ))}
            </View>
            <View style={styles.inline_box}>
              <TextInput
                dense
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
              icon="pencil"
              style={styles.child}
              onPress={this._handleSubmit}>
              Sửa bài viết
            </Button>
            <Button
              mode="contained"
              icon="delete"
              color={Colors.red500}
              style={styles.child}
              onPress={this._handleDeleteConfirm}>
              Xóa bài viết
            </Button>
          </Card>
        </ScrollView>
        <Portal>
          <Dialog visible={this.state.delete} onDismiss={this._hideDialog}>
            <Dialog.Title>Bài viết</Dialog.Title>
            <Dialog.Content>
              <Subheading>Bạn có muốn xóa bài viết này?</Subheading>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={this._handleDeletePost}>Có</Button>
              <Button onPress={this._hideDialog}>Không</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
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
        this.setState({new_cover: response});
      }
    });
  };
  _handleTagInput = () => {
    if (!this.state.new_tags) {
      return;
    }
    let current_tags = this.state.edit_tags;
    const new_tags = this.state.new_tags.toLowerCase().trim().split(/\s+/);
    new_tags.forEach((tag) => {
      if (tag.match(/^[0-9a-zA-Z]{3,20}$/)) {
        current_tags.add(tag);
      }
    });
    this.setState({edit_tags: current_tags, new_tags: ''});
  };
  _handleTagRemove = (tag) => {
    const edit_tags = this.state.edit_tags;
    edit_tags.delete(tag);
    this.setState({edit_tags: edit_tags});
  };
  _handleSubmit = () => {
    PostController.edit(this);
  };
  _handleDeleteConfirm = () => {
    this.setState({delete: true});
  };
  _hideDialog = () => {
    this.setState({delete: false});
  };
  _handleDeletePost = () => {
    this.setState({delete: false});
    PostController.delete(this);
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
