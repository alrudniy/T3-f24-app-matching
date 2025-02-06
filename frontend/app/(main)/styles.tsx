import { StyleSheet } from "react-native";

const fontSize = {
  ExtraSmall: 12,
  SubtitleSmall: 14,
  Small: 15,
  Base: 16,
  Subtitle: 18,
  Large: 20,
  Title: 32,
};

const paddingSize = {
  ExtraSmall: 5,
  Small: 10,
  Medium: 15,
  Large: 20,
  ExtraLarge: 30,
};

const borderSize = {
  ExtraSmall: 8,
  Small: 10,
  Medium: 12,
  Large: 15,
  ExtraLarge: 25,
};

const colors = {
  White: "#FFFFFF",
  Pale: "#F9F9F9",
  Pale2: "#F5F5F5",
  Pale3: "#E0E0E0",
  LightGrey: "#CCCCCC",
  Grey: "#888888",
  Grey2: "#666666",
  DarkGrey: "#555555",
  Black: "#000000",
  TransparentBlack: "rgba(0, 0, 0, 0.5)",
  LightBlue: "#6C63FF",
  Blue: "#6200EE",
  Red: "#FF3B30",
  Purple: "#6A1B9A",
};

export const general = StyleSheet.create({
  halfWidth: {
    width: "48%",
  },
  logo: {
    width: 200, 
    height: 65,
  },
});

export const button = StyleSheet.create({
  base: {
    backgroundColor: colors.Blue,
    padding: paddingSize.Medium,
    borderRadius: borderSize.ExtraSmall,
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  baseText: {
    color: colors.White,
    fontSize: fontSize.Base,
    fontWeight: "bold",
    textAlign: "center",
  },
  logout: {
    marginTop: 20,
    backgroundColor: colors.Red,
    padding: paddingSize.Medium,
    borderRadius: borderSize.Small,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: colors.White,
    fontSize: fontSize.Base,
    fontWeight: "bold",
  },
  submit: {
    backgroundColor: colors.Purple,
    borderRadius: borderSize.ExtraSmall,
    paddingVertical: 12,
    alignItems: "center",
    marginVertical: 20,
  },
  submitText: {
    fontSize: fontSize.Subtitle,
    color: colors.White,
    fontWeight: "bold",
  },
  verify: {
    backgroundColor: colors.LightBlue,
    padding: paddingSize.Medium,
    borderRadius: borderSize.ExtraSmall,
    alignItems: "center",
  },
  verifyText: {
    color: colors.White,
    fontSize: fontSize.Base,
    fontWeight: "bold",
  },
  save: {
    backgroundColor: colors.Blue,
    padding: paddingSize.Medium,
    borderRadius: borderSize.ExtraSmall,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  saveText: {
    color: colors.White,
    fontSize: fontSize.Base,
    fontWeight: "bold",
  },
  cancel: {
    backgroundColor: colors.Red,
    padding: paddingSize.Medium,
    borderRadius: borderSize.ExtraSmall,
    alignItems: "center",
    flex: 1,
  },
  cancelText: {
    color: colors.White,
    fontSize: fontSize.Base,
    fontWeight: "bold",
  },
  family: {
    width: 40,
    height: 40,
    backgroundColor: colors.Pale3,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: borderSize.ExtraSmall,
    marginLeft: 10,
  },
  familyText: {
    fontSize: fontSize.Large,
    color: colors.DarkGrey,
  },
  circular: {
    width: 50,
    height: 50,
    borderRadius: borderSize.ExtraLarge,
    backgroundColor: colors.White,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.Black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  square: {
    backgroundColor: colors.Blue,
    padding: paddingSize.Large,
    borderRadius: borderSize.ExtraSmall,
    width: 120,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
  },
  toggle: {
    position: "absolute",
    right: 10, // Align the icon to the right
    top: "50%", // Vertically center the icon
    transform: [{ translateY: -12 }], // Fine-tune the vertical alignment to center the icon
  },
  imageUpload: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: paddingSize.Small,
    borderWidth: 1,
    borderColor: colors.LightGrey,
    borderRadius: borderSize.ExtraSmall,
    backgroundColor: colors.White,
    marginBottom: 15,
  },
  imageUploadText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
});

export const image = StyleSheet.create({
  preview: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: borderSize.ExtraSmall,
  },
  property: {
    width: "100%",
    height: 250, // Fixed height for the image
    resizeMode: "cover",
  },
  logo: {
    width: 425, // Adjust as needed
    height: 140, // Adjust as needed
    marginBottom: 10, // Space below the logo
    alignSelf: "center", // Center the image
  },
  loggedInLogo: {
    width: 40, // Adjust width of the logo
    height: 40, // Adjust height of the logo
  },
  loggedInHeaderIcon: {
    padding: paddingSize.ExtraSmall, // Add padding around icons for better touch area
  },
});

export const container = StyleSheet.create({
  base: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: paddingSize.Large,
    backgroundColor: colors.Pale2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  content: {
    flex: 1,
    marginTop: 100, // Push content below the header
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  input: {
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: borderSize.Small,
    paddingLeft: 15,
    marginBottom: 15,
    width: "100%", // Ensure it takes up full width
    paddingRight: 40, // Allow space for the toggle button
  },
  inner: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.TransparentBlack,
  },
  modalContent: {
    backgroundColor: "white",
    padding: paddingSize.Large,
    borderRadius: borderSize.Small,
    width: "80%",
    alignItems: "center",
  },
  incomeInfo: {
    marginBottom: 20,
    padding: paddingSize.Small,
    backgroundColor: colors.Pale,
    borderRadius: borderSize.ExtraSmall,
  },
  header: {
    width: "100%",
    height: 100, 
    backgroundColor: colors.White, // White background for the header
    justifyContent: "center",
    alignItems: "center",
    position: "absolute", // Keep the header fixed at the top
    top: 0,
    zIndex: 100, // Ensure it stays above other content
    borderBottomWidth: 1, // Optional: Add a border for separation
    borderBottomColor: "#ddd",
  },
  form: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.White,
    padding: paddingSize.Large,
    borderRadius: borderSize.ExtraSmall,
    shadowColor: colors.Black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  familyMembers: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  familyButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  profile: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: paddingSize.Large,
    backgroundColor: colors.Pale2,
  },
  profileDetails: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.White,
    padding: paddingSize.Large,
    borderRadius: borderSize.ExtraSmall,
    shadowColor: colors.Black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  profileActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  password: {
    position: "relative", // To position the toggle button
    marginBottom: 20,
    width: "100%", // Ensure the container takes full width
  },
  title: {
    paddingVertical: 10, // Space above and below titles
    alignItems: "center", // Center titles horizontally
    backgroundColor: colors.Pale, // Optional: Light background for separation
  },
  titleBanner: {
    backgroundColor: colors.White,
    borderRadius: borderSize.Small, // Modern rounded look
    padding: paddingSize.ExtraSmall, // Padding inside the banner
    shadowColor: colors.Black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    alignItems: "center", // Center text horizontally
    width: "50%", // Full width with padding from edges
    alignSelf: "center",
    marginTop: -20, // Pull closer to the image for overlap effect
    zIndex: 1, // Ensure it stays above the card body
  },
  swipeLeft: {
    backgroundColor: colors.Red,
    padding: paddingSize.Medium,
    borderRadius: borderSize.ExtraSmall,
    width: 120,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  swipeRight: {
    backgroundColor: "#4CAF50",
    padding: paddingSize.Medium,
    borderRadius: borderSize.ExtraSmall,
    width: 120,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    marginBottom: 20,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: colors.Pale3,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: borderSize.Small,
  },
  loggedInHeader: {
    flexDirection: "row", // Align items in a row
    justifyContent: "space-between", // Space items evenly
    alignItems: "center", // Vertically center items
    paddingHorizontal: 15, // Add horizontal padding
    paddingVertical: 10, // Add vertical padding
    backgroundColor: colors.White, // Background color
    borderBottomWidth: 1, // Optional border for header
    borderBottomColor: "#EEE", // Optional border color
  },
  navBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: colors.White,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  navBarItem: {
    alignItems: "center",
    flex: 1,
  },
  activeNavBarItem: {
    borderBottomWidth: 2,
    borderBottomColor: "#007BFF",
  },
  image: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  preview: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  editOverlay: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: colors.TransparentBlack,
    borderRadius: borderSize.Large,
    padding: paddingSize.ExtraSmall,
    alignItems: "center",
    justifyContent: "center",
  },
  noData: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }, 
  button: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  matchButton: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginVertical: 20,
    paddingHorizontal: 10, // Spacing from screen edges
    width: "100%",
  },
  cardButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 20,
  },
  cardText: {
    flex: 1, // Take the remaining horizontal space
    flexDirection: "column",
  },
  propertyCard: {
    width: "90%",
    backgroundColor: colors.White,
    borderRadius: borderSize.Medium, // Rounded corners for the card
    shadowColor: colors.Black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: "center",
    marginVertical: 10,
    overflow: "hidden", // Prevent overflow outside the card
  },
  propertyDetails: {
    padding: paddingSize.Medium,
    marginTop: 30, // Add spacing to push content below the banner
  },
  propertyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
});

export const text = StyleSheet.create({
  sectionHeader: {
    fontSize: fontSize.Subtitle,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  instructions: {
    fontSize: fontSize.SubtitleSmall,
    color: colors.Grey2,
    textAlign: "center",
    marginBottom: 15,
  },
  modal: {
    fontSize: fontSize.Base,
    marginBottom: 20,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: fontSize.Base,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  incomeInfo: {
    fontSize: fontSize.SubtitleSmall,
    color: colors.DarkGrey,
  },
  logo: {
    fontSize: fontSize.Base,
    color: colors.DarkGrey,
  },
  loading: {
    fontSize: fontSize.Base,
    color: colors.DarkGrey,
    textAlign: "center",
    marginVertical: 20,
  },
  familyMembersLabel: {
    fontSize: fontSize.Base,
    fontWeight: "500",
  },
  title: {
    fontSize: fontSize.Title,
    fontWeight: "bold",
    marginBottom: 40,
  },
  subtitle: {
    fontSize: fontSize.Subtitle,
    color: colors.DarkGrey,
    textAlign: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: fontSize.Subtitle,
    fontWeight: "bold",
    color: "#333",
  },
  cardSubtitle: {
    fontSize: fontSize.SubtitleSmall,
    color: colors.DarkGrey,
    marginTop: 5,
  },
  link: {
    color: colors.Blue,
    fontSize: fontSize.Base,
    textDecorationLine: "underline",
    marginVertical: 10,
  },
  footer: {
    fontSize: fontSize.SubtitleSmall,
    color: colors.Grey,
    textAlign: "center",
    marginTop: 20,
  },
  dropdown: {
    fontSize: fontSize.Base,
    fontWeight: "500",
  },
  dropdownValue: {
    fontSize: fontSize.Base,
    color: colors.DarkGrey,
  },
  profileLabel: {
    fontSize: fontSize.Base,
    fontWeight: "bold",
    color: colors.DarkGrey,
    marginBottom: 5,
  },
  profileValue: {
    fontSize: fontSize.Base,
    color: "#333",
    marginBottom: 15,
  },
  navBar: {
    fontSize: fontSize.ExtraSmall,
    color: colors.Grey2,
  },
  activeNavBar: {
    color: "#007BFF",
  },
  property: {
    fontSize: fontSize.Base,
    color: "#333",
    marginLeft: 10,
    flexShrink: 1,
  },
});