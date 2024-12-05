import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // General
  bottomNavBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
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
  navBarText: {
    fontSize: 12,
    color: "#666",
  },
  activeNavBarText: {
    color: "#007BFF",
  },  
  LoggedInHeader: {
    flexDirection: "row", // Align items in a row
    justifyContent: "space-between", // Space items evenly
    alignItems: "center", // Vertically center items
    paddingHorizontal: 15, // Add horizontal padding
    paddingVertical: 10, // Add vertical padding
    backgroundColor: "#FFF", // Background color
    borderBottomWidth: 1, // Optional border for header
    borderBottomColor: "#EEE", // Optional border color
  },
  
  LoggedInHeaderIcon: {
    padding: 5, // Add padding around icons for better touch area
  },
  
  LoggedInLogo: {
    width: 40, // Adjust width of the logo
    height: 40, // Adjust height of the logo
  },
  
  logoImage: {
    width: 425, // Adjust as needed
    height: 140, // Adjust as needed
    marginBottom: 10, // Space below the logo
    alignSelf: "center", // Center the image
  },
  header: {
    width: "100%",
    height: 100, 
    backgroundColor: "#ffffff", // White background for the header
    justifyContent: "center",
    alignItems: "center",
    position: "absolute", // Keep the header fixed at the top
    top: 0,
    zIndex: 100, // Ensure it stays above other content
    borderBottomWidth: 1, // Optional: Add a border for separation
    borderBottomColor: "#ddd",
  },
  logo: {
    width: 200, 
    height: 65,
  },
  subtitle: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  contentContainer: {
    flex: 1,
    marginTop: 100, // Push content below the header
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },  
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  innerContainer: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  input: {
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 15,
    marginBottom: 15,
    width: "100%", // Ensure it takes up full width
    paddingRight: 40, // Allow space for the toggle button
  },
  button: {
    backgroundColor: "#6200ee",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  // Modals
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },

  // Titles and Links
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
  },
  link: {
    color: "#6200ee",
    fontSize: 16,
    textDecorationLine: "underline",
    marginVertical: 10,
  },

  // Buttons
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  squareButton: {
    backgroundColor: "#6200ee",
    padding: 20,
    borderRadius: 8,
    width: 120,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
  },

  // Form Container
  formContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 30,
  },

  // Footer
  footerText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },

  // Logos
  logoContainer: {
    marginBottom: 20,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  logoText: {
    fontSize: 16,
    color: "#555",
  },

  // Dropdowns
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: "500",
  },
  dropdownValue: {
    fontSize: 16,
    color: "#555",
  },

  // Family Members
  familyMembersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  familyMembersLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  familyButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  familyButton: {
    width: 40,
    height: 40,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginLeft: 10,
  },
  familyButtonText: {
    fontSize: 20,
    color: "#555",
  },

  // Income Information
  incomeInfo: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
  },
  incomeInfoText: {
    fontSize: 14,
    color: "#555",
  },

  // Verify Button
  verifyButton: {
    backgroundColor: "#6C63FF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Profile Page Specific Styles
  profileContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#E0E0E0",
    marginBottom: 20,
    marginTop: 20,
  },
  profileDetails: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  profileLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 5,
  },
  profileValue: {
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
  },
  profileActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: "#6200ee",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Matching Page Specific Styles

  // Buttons for swiping
  matchButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginVertical: 20,
    paddingHorizontal: 10, // Spacing from screen edges
    width: "100%",
  },
  // circleButton: {
  //   width: 60, // Set width and height to make it a circle
  //   height: 60,
  //   borderRadius: 30, // Half of width/height to make it circular
  //   backgroundColor: "#fff", // White background for the buttons
  //   justifyContent: "center",
  //   alignItems: "center",
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 3,
  //   elevation: 4, // Add elevation for a subtle shadow effect
  // },
  swipeLeft: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 8,
    width: 120,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  swipeRight: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    width: 120,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  passwordContainer: {
    position: "relative", // To position the toggle button
    marginBottom: 20,
    width: "100%", // Ensure the container takes full width
  },
  toggleButton: {
    position: "absolute",
    right: 10, // Align the icon to the right
    top: "50%", // Vertically center the icon
    transform: [{ translateY: -12 }], // Fine-tune the vertical alignment to center the icon
  },
  imageContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  editOverlay: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 15,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  noData: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }, 
  titleContainer: {
    paddingVertical: 10, // Space above and below titles
    alignItems: "center", // Center titles horizontally
    backgroundColor: "#f9f9f9", // Optional: Light background for separation
  },
propertyCard: {
  width: "90%",
  backgroundColor: "#fff",
  borderRadius: 12, // Rounded corners for the card
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
  alignSelf: "center",
  marginVertical: 10,
  overflow: "hidden", // Prevent overflow outside the card
},

propertyImage: {
  width: "100%",
  height: 250, // Fixed height for the image
  resizeMode: "cover",
},

titleBanner: {
  backgroundColor: "#fff",
  borderRadius: 10, // Modern rounded look
  padding: 5, // Padding inside the banner
  shadowColor: "#000",
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

cardTitle: {
  fontSize: 18,
  fontWeight: "bold",
  color: "#333",
},

cardSubtitle: {
  fontSize: 14,
  color: "#555",
  marginTop: 5,
},

propertyDetails: {
  padding: 15,
  marginTop: 30, // Add spacing to push content below the banner
},

propertyRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 10,
},

propertyText: {
  fontSize: 16,
  color: "#333",
  marginLeft: 10,
  flexShrink: 1,
},

cardButtonsContainer: {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  marginTop: 20,
},

circularButton: {
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: "#fff",
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 2,
},

});

export const matchingHistoryStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  innerContainer: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  propertyCard: {
    flexDirection: "row", // Align content horizontally
    alignItems: "center", // Center items vertically
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 8, // Slightly rounded corners for a clean look
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: "center",
    marginVertical: 10,
    padding: 15, // Add padding inside the card
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 8, // Slightly rounded square
    backgroundColor: "#E0E0E0", // Placeholder color
    marginRight: 15, // Space between image and text
  },
  propertyDetails: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#555",
  },
  propertyText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  loadingText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginVertical: 20,
  },
  noData: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 20,
  },
  cardTextContainer: {
    flex: 1, // Take the remaining horizontal space
    flexDirection: "column",
  },
});
