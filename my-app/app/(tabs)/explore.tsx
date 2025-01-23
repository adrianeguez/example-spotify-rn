import {StyleSheet, Image, Platform, Pressable} from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as WebBrowser from 'expo-web-browser';

import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import {useEffect} from "react";

WebBrowser.maybeCompleteAuthSession();

// Endpoint
const discovery = {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
};


export default function TabTwoScreen() {
    const [request, response, promptAsync] = useAuthRequest(
        {
            clientId:  process.env.EXPO_PUBLIC_CLIENT_ID ?? '',
            scopes: [
                'user-read-email',
                "user-library-read",
                "user-read-recently-played",
                "user-top-read",
                "playlist-read-private",
                "playlist-read-collaborative",
                "playlist-modify-public",
                "app-remote-control",
                "user-read-playback-state",
                "user-modify-playback-state",
                "user-read-currently-playing",
            ],
            // To follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
            // this must be set to false
            usePKCE: false,
            redirectUri: makeRedirectUri({ native: 'myapp://' }),
        },
        discovery
    );

    useEffect(() => {
        console.log(response);
        if (response?.type === 'success') {
            const { code, state } = response.params;
            if(code && state){
                console.log('Have state and code', code, state);
                const requestAuthorization = async ()=>{
                    console.log('requesting', (process.env.EXPO_PUBLIC_BACKEND_URL ?? '' ) + 'api/callback');
                    try{
                        const response = await fetch(
                            (process.env.EXPO_PUBLIC_BACKEND_URL ?? '' ) + 'api/callback?code=' + code + '&state=' + state, {
                                method: 'POST',
                                headers: {
                                    Accept: 'application/json',
                                    'Content-Type': 'application/json',
                                },
                            });
                        console.log('response', JSON.stringify( await response.json()));
                    }catch (e) {
                        console.error(e);
                    }
                };
                requestAuthorization().then().catch();
            }
        }
    }, [response]);


    return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>
      <ThemedText>This app includes example code to help you get started.</ThemedText>
        <Pressable
            onPress={()=>{
                promptAsync();
            }}
            style={{
            }}
        >
            <ThemedText>Sign In with spotify</ThemedText>
        </Pressable>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
