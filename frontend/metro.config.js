// Learn more https://docs.expo.io/guides/customizing-metro again, is this even required to get nativewind working? Yes
//yes it is
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./assets/global.css" });