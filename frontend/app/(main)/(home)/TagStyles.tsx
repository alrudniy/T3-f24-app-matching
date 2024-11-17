/*this file will contain a single const stylesheet that will contain all our app's styling values (at least
I hope); nope, that would've been if we were using react native styling, but we'll be using css styling
via nativewind/tailwindcss
*/

import { StyleSheet } from "react-native";

export const mainstyles = StyleSheet.create({ //stylesheet for "default" tag styling
    default_view:{
        backgroundColor: "[insert default color here]",
        borderColor: "[insert default bordercolor here]",
        opacity: 0, //change this
        //etc




    },

    heading_1:{ //if 1 property of the style attribute is undesirable, you can override it when
        //creating your element with style={[stylesheet.style, targetprop.value]}, where the other entries
        //in the style attribute array will replace anything the stylesheet applied
        color:"",
        fontFamily:"",
        fontSize:50, //change value
        fontStyle:'normal',
        fontWeight:'normal',
        letterSpacing:0, //change value
        lineHeight:0, //change this
        textAlign:'center',
        textAlignVertical:'center', //android specific
        userSelect: 'text', //should you be able to copy-paste?



    },

    text_input_default:{
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
});