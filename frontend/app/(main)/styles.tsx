import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Original Styles
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
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
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
    marginTop: 5,
    textAlign: "center",
  },
  link: {
    color: "#6200ee",
    fontSize: 16,
    textDecorationLine: "underline",
    marginVertical: 10,
  },
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
    marginBottom: 30, // Added spacing for visual separation
  },
  footerText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },

  // Additions and Tweaks for New Design
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
  disclaimer: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
});
