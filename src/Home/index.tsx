import { useEffect, useState } from 'react';
import { ImageSourcePropType, View } from 'react-native';
import { Camera, CameraType, FaceDetectionResult } from 'expo-camera';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import * as FaceDetector from 'expo-face-detector';

import neutralImg from '../assets/neutral.png';
import smilingImg from '../assets/smiling.png';
import winkingImg from '../assets/winking.png';

import { styles } from './styles';

export function Home() {
  const [isFaceDetected, setIsFaceDetected] = useState (false);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [isEmoji, setIsEmoji] = useState<ImageSourcePropType>(neutralImg);

  const faceValues = useSharedValue({
    width: 0,
    height: 0,
    x: 0,
    y: 0
  });

  function faceDetected({ faces }: FaceDetectionResult) {
    const faceArray = faces[0] as any;
    if (faceArray) {
      const { origin, size } = faceArray.bounds;
      faceValues.value = {
        width: size.width,
        height: size.height,
        x: origin.x,
        y: origin.y
      };

      setIsFaceDetected (true);

      if (faceArray.smilingProbability > 0.5) {
        setIsEmoji(smilingImg);
      } else if (faceArray.leftEyeOpenProbability > 0.5 && faceArray.rightEyeOpenProbability < 0.5) {
        setIsEmoji (winkingImg);
      } else {
        setIsEmoji (neutralImg);
      }
    } else {
      setIsFaceDetected (false);
    }
  };

  const styleAnimated = useAnimatedStyle(() => ({
    position: 'absolute',
    zIndex: 1,
    width: faceValues.value.width,
    height: faceValues.value.height,
    transform: [
      { translateX: faceValues.value.x },
      { translateY: faceValues.value.y + 300 },
    ],
  }))

  useEffect(() => {
    requestPermission();
  }, []);

  if(!permission?.granted){
    return (<></>);
  }

  return (
    <View style={styles.container}>
      {
        isFaceDetected && 
        <Animated.Image
          style={styleAnimated}
          source={isEmoji}
        /> 
      }

      <Camera
        style={styles.camera} 
        type={CameraType.front}
        onFacesDetected={faceDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.all,
          minDetectionInterval: 100,
          tracking: true,
        }}  
      />
    </View>
  )
}