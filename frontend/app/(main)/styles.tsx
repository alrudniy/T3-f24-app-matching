import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // General
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

  // Property card and image
  propertyCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: "center",
    marginVertical: 10,
    overflow: "hidden", // Ensures no overflow outside the card
    paddingBottom: 20, // Add extra padding for the buttons
    flexGrow: 1, // Ensures the card grows dynamically with content
    flexShrink: 1, // Prevents overflow for long content
    minHeight: 600, // Minimum height for smaller cards
  },  
  propertyImage: {
    width: "100%",
    height: "60%",
    objectFit: "cover",
  },
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
  cardButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around", // Spreads buttons evenly
    alignItems: "center",
    marginTop: 10, // Space above buttons
    paddingVertical: 10, // Padding for spacing above/below buttons
    borderTopWidth: 1, // Optional separator line
    borderTopColor: "#eee", // Light gray for the separator
    backgroundColor: "#fff", // Matches card background
  },  
  propertyDetails: {
    padding: 10,
    flexGrow: 1, // Allow content to determine height
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
    flexShrink: 1, // Ensure long text wraps
    flexWrap: "wrap", // Handle multiline text
  },
  circularButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginTop: 10,
  },
  cardSubtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 10,
  },
  
});
