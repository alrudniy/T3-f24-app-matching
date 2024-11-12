//this file will be used to bring together all the tags that we will be using, and setting a particular
//style to them based on a custom stylesheet that will be populated by collections of attributes that
//will be assigned to each custom tag

//slider and picker not showing up - could be due to "outdated" react-native library (ask the bois if
//upgrading would be beneficial (pubspec yaml))
import { View, Text, Image, ScrollView, Button, TextInput, Modal, Switch, ActivityIndicator, StatusBar, SafeAreaView} from 'react-native'; //react-native element/tag library is fit for mobile, react is for web html!

export const StyledView = ({type, color}) =>{
    return <View style={[type==="",]} />;

}


export const StyledText = ({}) => {
    return <Text/>;
}

export function StyleImage(){
    return <Image/>;
}

export function StyledScrollView(){
    return <ScrollView/>;
}

export function StyledButton(){
    return <Button title = ''/>;
}

export function StyledTextInput(){
    return 
}


//etc, do the rest for everything we'll need/will be using...!

//*NOPE, NVM, THIS WOULD BE TOO MUCH WORK - SIMPLY CALL THE REACT NATIVE ELEMENTS/TAGS WHEREVER
//THEY'RE NEEDED (COULD STILL USE THE SHARED FILE FOR THE STYLES THOUGH)