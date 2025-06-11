import {StyleSheet} from 'react-native';

export const chipConfigurationStyles = StyleSheet.create({
  chipList: {
    width: '100%',
    marginBottom: 20,
  },
  chipHeaderRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 5,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  chipHeaderColor: {
    width: 50,
    textAlign: 'center',
  },
  chipHeaderName: {
    flex: 1,
    textAlign: 'left',
  },
  chipHeaderValue: {
    width: 60,
    textAlign: 'center',
  },
  chipHeaderQuantity: {
    width: 80,
    textAlign: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 5,
  },
  chipColorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipColorCircleInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipName: {
    flex: 1,
  },
  chipValue: {
    width: 60,
    textAlign: 'center',
  },
  chipQuantityInput: {
    width: 80,
    height: 35,
    marginLeft: 10,
    textAlign: 'center',
    paddingVertical: 0,
    textAlignVertical: 'center',
    fontSize: 14,
    includeFontPadding: false,
  },
  chipSetContainer: {
    width: '100%',
    marginBottom: 15,
  },
  chipConfigHeader: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 0,
  },
  chipConfigLabel: {
    fontSize: 14,
    marginRight: 2,
    opacity: 0.8,
  },
  chipValueInput: {
    width: 60,
    height: 35,
    textAlign: 'center',
    marginHorizontal: 5,
  },
  chipValueInputSmall: {
    width: 60,
    height: 35,
    textAlign: 'center',
    marginHorizontal: 5,
    fontSize: 14,
    paddingVertical: 0,
  },
  chipConfigSummaryText: {
    paddingBottom: 10,
    fontSize: 12,
    opacity: 0.7,
  },
  chipConfigEditBtn: {
    flexDirection: 'row',
    height: 22,
  },
  chipConfigEditText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#1976d2',
    textTransform: 'lowercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 320,
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 8,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
});
