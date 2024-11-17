/** @type {import('tailwindcss').Config} */

/*in there, add  custom colors/fontfamilies (location to font file paths needs to be included
in the root layout.tsx (inside of whatever "hooks" are))
*/
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors:{
        primarypurple:"#472D5B", 
        secondarypurple:"#9e6394",
        primaryorange:"#FEC357",
        primaryblue:"#0063BE",
        secondaryblue:"#369FFF",
        tertiaryblue:"#004477",


      },
      fontFamily:{ //3 font families, Poppings, Roboto, and Nunito, for some options
        popthin:["Poppings-Thin","sans-serif"],
        popxlight:["Poppings-ExtraLight","sans-serif"],
        poplight:["Poppings-Light","sans-serif"],
        popreg:["Poppings-Regular","sans-serif"],
        popmed:["Poppings-Medium","sans-serif"],
        popsemb:["Poppings-SemiBold","sans-serif"],
        popb:["Poppings-Bold","sans-serif"],
        popxb:["Poppings-ExtraBold","sans-serif"],
        popbl:["Poppings-Black","sans-serif"],
        robthin:["Roboto-Thin", "sans-serif"],
        roblight:["Roboto-Light","sans-serif"],
        robregular:["Roboto-Regular","sans-serif"],
        robmedium:["Roboto-Medium","sans-serif"],
        robbold:["Roboto-Bold","sans-serif"],
        robblack:["Roboto-Black","sans-serif"],
        nunito:["Nunito-All","sans-serif"],

      },
      fontSize:{

      },
    },
  },
  plugins: [],
}

