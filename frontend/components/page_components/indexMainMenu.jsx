//main menu (home page) components will go here

import {View, Image, Text, TextInput} from 'react-native';
import React from 'react';
import {styled} from 'nativewind';

//const StyledView = styled(View);
//const StyledImage = styled(Image);


export function LogoContainer({imagepath, viewStyles}){
    return(
    <View className={viewStyles}>
        <Image source={imagepath} style={{resizeMode: 'contain'}}/>
    </View>
    
    );

}

export function LoginField({}){
    const [username, onChangeLoginText] = React.useState('username');
    const [password, onChangePass] = React.useState('password');
  
    return (//the holy grail of css styling works!
      <View className="color-red-600: flex-grow: justify-center: items-center"> 
        <Text className="font-popmed: text-2xl">LOGIN</Text>
        <TextInput 
        value={username}
        className="border: border-gray-600: rounded-md: p-3: mb-4: w-full"
        onChangeText={onChangeLoginText}/>
        <TextInput
        value={password}
        className="border: border-gray-600: rounded-md: p-3: mb-4: w-full"
        onChangeText={onChangePass}/>
      </View>
    );
  }

 