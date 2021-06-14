import { parseData, pageInfo, formatServerError, formatGraphQLError } from '@openimis/fe-core';

function reducer(
    state = {
        fetching: false,
        fetched: false,
        error: null,
        insuree: null,
        fetchingFamilyMembers: false,
        fetchedFamilyMembers: false,
        errorFamilyMembers: null,
        familyMembers: null,
        fetchingInsurees: false,
        fetchedInsurees: false,
        errorInsurees: null,
        insurees: [],
        insureesPageInfo: { totalCount: 0 }
    },
    action,
) {
    switch (action.type) {
        case 'INSUREE_ENQUIRY_REQ':
            return {
                ...state,
                fetching: true,
                fetched: false,
                insuree: null,
                error: null,
            };
        case 'INSUREE_ENQUIRY_RESP':
            return {
                ...state,
                fetching: false,
                fetched: true,
                insuree: action.payload.data.insuree,
                error: formatGraphQLError(action.payload)
            };
        case 'INSUREE_ENQUIRY_ERR':
            return {
                ...state,
                fetching: false,
                error: formatServerError(action.payload)
            };
        case 'INSUREE_FAMILY_REQ':
            return {
                ...state,
                fetchingFamilyMembers: true,
                fetchedFamilyMembers: false,
                familyMembers: null,
                errorFamilyMembers: null,
            };
        case 'INSUREE_FAMILY_RESP':
            return {
                ...state,
                fetchingFamilyMembers: false,
                fetchedFamilyMembers: true,
                familyMembers: action.payload.data.insureeFamilyMembers,
                errorFamilyMembers: formatGraphQLError(action.payload)
            };
        case 'INSUREE_FAMILY_ERR':
            return {
                ...state,
                fetchingFamilyMembers: false,
                errorFamilyMembers: formatServerError(action.payload)
            };
        case 'INSUREE_INSUREES_REQ':
            return {
                ...state,
                fetchingInsurees: true,
                fetchedInsurees: false,
                insurees: [],
                errorInsurees: null,
            };
        case 'INSUREE_INSUREES_RESP':
            return {
                ...state,
                fetchingInsurees: false,
                fetchedInsurees: true,
                insurees: parseData(action.payload.data.insurees),
                insureesPageInfo: pageInfo(action.payload.data.insurees),
                errorInsurees: formatGraphQLError(action.payload)
            };
        case 'INSUREE_INSUREES_ERR':
            return {
                ...state,
                fetching: false,
                error: formatServerError(action.payload)
            };
        case 'INSUREE_CHANGE_CLAIM_DATE':
            return {
                ...state,
                insureeClaimDate: action.claimDate
            }
        default:
            return state;
    }
}

export default reducer;
