import React from 'react';
import { TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';

export default function ImagePickerComponent({ images, setImages }) {
  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      selectionLimit: 5,
    });

    if (!result.cancelled) {
      const selected = result.assets.map(asset => asset.uri);
      setImages([...images, ...selected]); // อัพเดต array images
    }
  };

  return (
    <TouchableOpacity style={styles.imageBox} onPress={pickImages}>
      {images.length === 0 ? (
        <Image
          source={require('../assets/image-placeholder.png')}
          style={styles.placeholder}
          resizeMode="contain"
        />
      ) : (
        <ScrollView horizontal>
          {images.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.selectedImage} />
          ))}
        </ScrollView>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  imageBox: {
    backgroundColor: '#ddd',
    height: 220,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: { width: 150, height: 150, opacity: 0.6 },
  selectedImage: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 8,
  },
});
