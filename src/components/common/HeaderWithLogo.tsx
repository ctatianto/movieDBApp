import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export const HeaderWithLogo: React.FC = () => {
  return (
    <View style={styles.headerContainer}>
      <Image 
        source={require('../../assets/Logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 80,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  logo: {
    width: 150,
    height: 60,
  },
});