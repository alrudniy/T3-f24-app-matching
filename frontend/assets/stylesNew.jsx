// export const stylesNew = StyleSheet.create({
//     //add style mappings here
//   });
  
  export const colorsNew = {
        black:"#000000",
          primarypurple:"#472D5B", 
          secondarypurple:"#9e6394",
          primaryorange:"#FEC357",
          primaryblue:"#0063BE",
          secondaryblue:"#369FFF",
          tertiaryblue:"#004477",
  };
  
  export const fontsNew = {
    spacMono:"SpaceMono-Regular",
    popthin:"Poppings-Thin",
    popxlight:"Poppings-ExtraLight",
    poplight:"Poppings-Light",
    popreg:"Poppings-Regular",
    popmed:"Poppings-Medium",
    popsemb:"Poppings-SemiBold",
    popb:"Poppings-Bold",
    popxb:"Poppings-ExtraBold",
    popbl:"Poppings-Black",
    robthin:"Roboto-Thin",
    roblight:"Roboto-Light",
    robreg:"Roboto-Regular",
    robmed:"Roboto-Medium",
    robbold:"Roboto-Bold",
    robblack:"Roboto-Black",
    nunxlight:"Nunito-ExtraLight",
    nunlight: "Nunito-Light",
    nunreg: "Nunito-Regular",
    nunmed: "Nunito-Medium",
    nunsemb: "Nunito-SemiBold",
    nunb: "Nunito-Bold",
    nunxb: "Nunito-ExtraBold",
    nunbl: "Nunito-Black",
  };
  
  export const getFontStyles = (size, weight = fontsNew.spacMono, color = fontsNew.black, textAlign = "left")=> ({
    fontFamily: fontsNew[weight],
    fontSize: size,
    color: color,
    textAlign: textAlign,
  });