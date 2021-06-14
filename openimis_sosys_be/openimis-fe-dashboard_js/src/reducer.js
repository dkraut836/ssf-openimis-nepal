import {
    parseData, dispatchMutationReq, dispatchMutationResp, dispatchMutationErr,
    pageInfo, formatServerError, formatGraphQLError
} from '@openimis/fe-core';

function reducer(
    state = {
        fetchingClaimApp: false,
        fetchedClaimApp: false,
        errorClaimApp: null,
        claimApp: null      
    },
    action,
) { 
    switch (action.type) {
        case 'DASHBOARD_CLAIMAPP_REQ':
            return {
                ...state,
                fetchingClaimApp: true,
                fetchedClaimApp: null,
                claimApp: null,
                errorClaimApp: null,
            };
        case 'DASHBOARD_CLAIMAPP_RESP':
            return {
                ...state, 
                fetchingClaimApp: false,
                fetchedClaimApp: true,
                claimApp: action.payload.data.dashboard,
                errorClaimApp: formatGraphQLError(action.payload)
            };
        case 'DASHBOARD_CLAIMAPP_ERR':
            return {
                ...state,
                fetchingClaimApp: null,
                errorClaimApp: formatServerError(action.payload)
            };          
        default:
            return state;
    }
}

export default reducer;
