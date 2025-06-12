// styles/commonStyles.ts
import { StyleSheet } from 'react-native';

// Common layout styles
export const layoutStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  containerNoPadding: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  scrollViewWithTopBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
    paddingTop: 15,
    paddingBottom: 15,
    flex: 1,
  },
  bottomButtonContainer: {
    marginTop: 0,
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.2)'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});

// Common text styles
export const textStyles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  subLabel: {
    fontSize: 12,
    marginTop: 0,
    opacity: 0.7,
    textAlign: 'center',
  },
  emptyState: {
    textAlign: 'center',
    marginTop: 50,
    opacity: 0.7,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
    opacity: 0.8,
    lineHeight: 22,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.8,
    lineHeight: 20,
  },
  noTransactionsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.8,
    lineHeight: 22,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// Common card styles
export const cardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 15,
    marginBottom: 10,
  },
  cardContent: {
    flex: 1,
  },
  cardActions: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Specific card variations
  entryCard: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  transactionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
});

// Common modal styles
export const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 10,
    borderWidth: 1,
    padding: 20,
  },
  modalContentWide: {
    width: '90%',
    borderRadius: 10,
    borderWidth: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    alignItems: 'stretch',
  },
  modalBodyScrollable: {
    maxHeight: 400,
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 1,
  },
});

// Common form styles
export const formStyles = StyleSheet.create({
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 0,
    paddingHorizontal: 10,
    width: '100%',
    textAlignVertical: 'center',
    paddingVertical: 0,
  },
  sectionContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputWrapper: {
    width: '80%',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  toggleLabel: {
    marginHorizontal: 8,
    fontSize: 14,
  },
  formButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tagInputContainer: {
    borderWidth: 1,
    borderRadius: 5,
    minHeight: 50,
    width: '100%',
    padding: 5,
  },
  tagInput: {
    minWidth: 100,
    height: 40,
    padding: 5,
    flex: 1,
  },
});

// Common spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Common border radius
export const borderRadius = {
  sm: 5,
  md: 8,
  lg: 10,
  xl: 12,
  round: 20,
};

// Action button spacing
export const actionButtonSpacing = {
  marginBottom: 15,
};

// Header styles
export const headerStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerPlaceholder: {
    width: 34, // Same as backButton to center the title
  },
  backButton: {
    paddingLeft: 20,
    paddingRight: 20,
  },
});

// Player-related styles
export const playerStyles = StyleSheet.create({
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  playerCardContent: {
    flex: 1,
  },
  playerCardActions: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerBuyIn: {
    fontSize: 16,
  },
  playerStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// Info container styles
export const infoStyles = StyleSheet.create({
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 16,
    marginRight: 5,
    opacity: 0.8,
  },
  infoAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: '#FFFFFF',
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
  },
});

// List styles
export const listStyles = StyleSheet.create({
  listContainer: {
    paddingBottom: 15,
    paddingTop: 15,
  },
  horizontalList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  listSeparator: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    marginVertical: 10,
  },
  transactionList: {
    width: '100%',
  },
});

// Icon container styles
export const iconStyles = StyleSheet.create({
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSpacing: {
    marginLeft: 5,
  },
  warningContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});

// Common button styles (to complement ThemedButton)
export const buttonStyles = StyleSheet.create({
  buttonSpacing: {
    marginTop: 20,
    marginBottom: 30,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
});

// Settings/configuration styles
export const settingsStyles = StyleSheet.create({
  settingsContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLabelContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
});