import React from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  PixelRatio,
  TouchableOpacity,
  Image,
  CameraRoll,
  TextInput
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import firebase from 'firebase';
import RNFetchBlob from 'react-native-fetch-blob';
import CameraRollPicker from 'react-native-camera-roll-picker'


export default class App extends React.Component {

  state = {
    avatarSource: null,
    videoSource: null,
    name: ''
  };

  constructor(props) {
    super(props);

    firebase.initializeApp({
      apiKey: "AIzaSyDOCuyWYV_qOzXjkYYTqIYoCTX4fA3u5Pk",
      authDomain: "deneme-e8424.firebaseapp.com",
      databaseURL: "https://deneme-e8424.firebaseio.com",
      projectId: "deneme-e8424",
      storageBucket: "deneme-e8424.appspot.com",
      messagingSenderId: "518705747661"
    });
  }

  selectPhotoTapped(mime = 'image/jpeg') {
    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      storageOptions: {
        skipBackup: true
      }
    };

    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
      }
      else if (response.error) {
      }
      else if (response.customButton) {
      }
      else {
        let { uri } = response
        this.setState({ avatarSource: response, selectedImageUri: uri })
      }
    });
  }


  uploadData = () => {
    const image = this.state.selectedImageUri

    const Blob = RNFetchBlob.polyfill.Blob
    const fs = RNFetchBlob.fs
    window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
    window.Blob = Blob


    let uploadBlob = null
    let imageName = new Date().getTime().toString()
    const imageRef = firebase.storage().ref().child(imageName)
    let mime = 'image/jpg'
    fs.readFile(image, 'base64')
      .then((data) => {
        return Blob.build(data, { type: `${mime};BASE64` })
      })
      .then((blob) => {
        uploadBlob = blob
        return imageRef.put(blob, { contentType: mime })
      })
      .then(() => {
        uploadBlob.close()
        return imageRef.getDownloadURL()
      })
      .then((url) => {

        const { name } = this.state
        firebase.database().ref('deneme').push({
          name,
          photoUrl: url
        })
      })
      .catch((error) => {
      })
  }

  render() {
    console.log(this.state.name)
    return (
      <View style={styles.container}>
        <TextInput
          placeholder="name"
          onChangeText={name => this.setState({ name })}
        />

        <TouchableOpacity onPress={this.selectPhotoTapped.bind(this)} callback={this.getSelectedImages}>
          <View style={[styles.avatar, styles.avatarContainer, { marginBottom: 20 }]}>
            {this.state.avatarSource === null ? <Text>Select a Photo</Text> :
              <Image style={styles.avatar} source={this.state.avatarSource} />
            }
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={this.uploadData}>
          <Text>Kaydet</Text>
        </TouchableOpacity>

        {this.state.videoSource &&
          <Text style={{ margin: 8, textAlign: 'center' }}>{this.state.videoSource}</Text>
        }
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  avatarContainer: {
    borderColor: '#9B9B9B',
    borderWidth: 1 / PixelRatio.get(),
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatar: {
    borderRadius: 75,
    width: 150,
    height: 150
  },

});
