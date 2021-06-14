import { CompassCalibrationOutlined, ContactsOutlined } from '@material-ui/icons';
import {
    parseData, dispatchMutationReq, dispatchMutationResp, dispatchMutationErr,
    pageInfo, formatServerError, formatGraphQLError
} from '@openimis/fe-core';

function reducer(
    state = {
        fetchingClaimAdmins: false,
        fetchedClaimAdmins: null,
        errorClaimAdmins: null,
        claimAdmins: null,
        fetchingEmployers: false,
        fetchedEmployers: false,
        errorEmployers: null,
        employers: null,
        pickerr:null,
        fetchingClaimPickers: false,
        fetchedClaimPickers: false,
        errorClaimPickers: null,
        claimPickers: null,
        fetchingRecommenders: false,
        fetchedRecommenders: false,
        errorRecommenders: null,
        recommenders: null,
        rec:[],
        fetchingBankName: false,
        fetchedBankName: false,
        errorBankName: null,
        checkAttachments: null,
        fetchingCheckAttachment: false,
        fetchedCheckAttachment: false,
        errorCheckAttachment: null,
        banks: null,


        fetchingHospitals: false,
        fetchedHospitals: false,
        errorHospitals: null,
        hospitals: null,
        
        fetchReclaimData:null,

        fetchingAccidentSchemes: false,
        fetchedAccidentSchemes: false,
        errorAccidentSchemes: null,
        accidentSchemes: null,

        fetchingReclaims: false,
        fetchedReclaims: false,
        errorReclaims: null,
        reclaims: null,

        fetchingBankType: false,
        fetchedBankType: false,
        errorBankType: null,
        bankType: null,
        fetchingClaimAttachments: false,
        fetchedClaimAttachments: false,
        errorClaimAttachments: null,
        claimAttachments: null,
        fetchingClaimOfficers: false,
        fetchedClaimOfficers: false,
        errorClaimOfficers: null,
        claimOfficers: null,
        fetchingClaims: false,
        fetchedClaims: false,
        errorClaims: null,
        claims: null,
        claimsPageInfo: { totalCount: 0 },
        fetchingClaim: false,
        fetchedClaim: false,
        errorClaim: null,
        claim: {},
        fetchingLastClaimAt: false,
        fetchedLastClaimAt: false,
        errorLastClaimAt: null,
        lastClaimAt: {},
        submittingMutation: false,
        mutation: {},
        fetchingClaimCodeCount: false,
        fetchedClaimCodeCount: false,
        claimCodeCount: null,
        errorClaimCodeCount: null,
        options:[{name:'a'}, {name:'b'}],
        id:'',
        generateCode:null,
        fetchingGeneratedCode:false,
        fetchedGeneratedCode:false,
        errGeneratedCode:false
    },
    action,
) {
    switch (action.type) {

        case 'CHANGE_ID':
            console.log('change reducerr', action.payload)
            return{
                ...state,
                id:action.payload
            }
        case 'CLAIM_CLAIM_ADMINS_REQ':
            return {
                ...state,
                fetchingClaimAdmins: true,
                fetchedClaimAdmins: null,
                claimAdmins: null,
                errorClaimAdmins: null,
            };
        case 'CLAIM_CLAIM_ADMINS_RESP':
            return {
                ...state,
                fetchingClaimAdmins: false,
                fetchedClaimAdmins: action.meta,
                claimAdmins: parseData(action.payload.data.claimAdmins || action.payload.data.claimAdminsStr),
                errorClaimAdmins: formatGraphQLError(action.payload)
            };
        case 'CLAIM_CLAIM_ADMINS_ERR':
            return {
                ...state,
                fetchingClaimAdmins: null,
                errorClaimAdmins: formatServerError(action.payload)
            };

            case 'CLAIM_CLAIM_EMPLOYERS_REQ':
            return {
                ...state,
                fetchingEmployers: true,
                fetchedEmployers: false,
                employers: null,
                errorEmployers: null,
            };
        case 'CLAIM_CLAIM_EMPLOYERS_RESP':
            return {
                ...state,
                fetchingEmployers: false,
                fetchedEmployers: true,
                employers: parseData(action.payload.data.contributorEmployer),
                errorEmployers: formatGraphQLError(action.payload)
            };
        case 'CLAIM_CLAIM_EMPLOYERS_ERR':
            return {
                ...state,
                fetchingEmployers: false,
                errorEmployers: formatServerError(action.payload)
            };

            case 'CLAIM_CLAIM_CLAIMPICKER_REQ':
            return {
                ...state,
                fetchingClaimPickers: true,
                fetchedClaimPickers: false,
                claimPickers: null,
                errorClaimPickers: null,
            };

            case 'CLAIM_CLAIM_CLAIMPICKER_RESP':
            return {
                ...state,
                fetchingClaimPickers: false,
                fetchedClaimPickers: true,
                claimPickers: parseData(action.payload.data.products),
                errorClaimPickers: formatGraphQLError(action.payload)
            };

            case 'CLAIM_CLAIM_CLAIMPICKER_ERR':
            return {
                ...state,
                fetchingClaimPickers: false,
                errorClaimPickers: formatServerError(action.payload)
            };
            case 'GENERATE_CODE_REQ':return{
                ...state,
                fetchingGeneratedCode:true,
                fetchedGeneratedCode:null,
                generateCode:null,
                errGeneratedCode:null
            }

            case 'CLAIM_CLAIM_RECLAIM_REQ':
            return {
                ...state,
                fetchingReclaims: true,
                fetchedReclaims: false,
                reclaims: null,
                errorReclaims: null,
            };

            case 'CLAIM_CLAIM_RECLAIM_RESP':
            return {
                ...state,
                fetchingReclaims: false,
                fetchedReclaims: true,
                reclaims: parseData(action.payload.data.claims),
                errorReclaims: formatGraphQLError(action.payload)
            };
            // case 'GENERATE_CODE_RESP':
            //     return{
            //     ...state,
            //     fetchingGeneratedCode:false,
            //     fetchedGeneratedCode:true,
            //     generateCode:action.payload.data.claimCode.generatedCodedValue
            // }
            case 'CLAIM_CLAIM_RECLAIM_ERR':
            return {
                ...state,
                fetchingReclaims: false,
                errorReclaims: formatServerError(action.payload)
            };

            case 'CLAIM_CLAIM_HOSPITAL_REQ':
                return {
                    ...state,
                    fetchingHospitals: true,
                    fetchedHospitals: false,
                    hospitals: null,
                    errorHospitals: null,
                };
            case 'CLAIM_CLAIM_HOSPITAL_RESP':
                return {
                    ...state,
                    fetchingHospitals: false,
                    fetchedHospitals: true,
                    hospitals: parseData(action.payload.data.healthFacilities),
                    errorHospitals: formatGraphQLError(action.payload)
                };
            case 'CLAIM_CLAIM_HOSPITAL_ERR':
                return {
                    ...state,
                    fetchingHospitals: false,
                    errorHospitals: formatServerError(action.payload)
                };

            case 'CLAIM_CLAIM_FETCHRECLAIM_RES':
                var claims = parseData(action.payload.data.claims);
                return{
                    ...state,
                    fetchReclaimData: (!!claims && claims.length > 0) ? claims[0] : null,
                }
            case 'CLAIM_CLAIM_RECOMMENDER_REQ':
            return {
                ...state,
                fetchingRecommenders: true,
                fetchedRecommenders: false,
                recommenders: null,
                errorRecommenders: null,
            };
        case 'CLAIM_CLAIM_RECOMMENDER_RESP':
            console.log('reducerssss', parseData(action.payload.data.ClaimRecommend))
            return {
                ...state,
                fetchingRecommenders: false,
                fetchedRecommenders: true,
                recommenders: parseData(action.payload.data.ClaimRecommend),
                errorRecommenders: formatGraphQLError(action.payload)
            };
        case 'CLAIM_CLAIM_RECOMMENDER_ERR':
            return {
                ...state,
                fetchingEmployers: false,
                errorEmployers: formatServerError(action.payload)
            };

            case 'CLAIM_CLAIM_BANKS_REQ':
            return {
                ...state,
                fetchingBankName: true,
                fetchedBankName: false,
                banks: null,
                errorBankName: null,
            };
        case 'CLAIM_CLAIM_BANKS_RESP':
            console.log('bank claim reducer', action.payload)
            return {
                ...state,
                fetchingBankName: false,
                fetchedBankName: true,
                banks: parseData(action.payload.data.banks),
                errorBankName: formatGraphQLError(action.payload)
            };
        case 'CLAIM_CLAIM_BANKS_ERR':
            return {
                ...state,
                fetchingBankName: false,
                errorBankName: formatServerError(action.payload)
            };

            case 'CLAIM_CLAIM_ACCIDENTSCHEME_REQ':
            return {
                ...state,
                fetchingAccidentSchemes: true,
                fetchedAccidentSchemes: false,
                accidentSchemes: null,
                errorAccidentSchemes: null,
            };
        case 'CLAIM_CLAIM_ACCIDENTSCHEME_RESP':
            return {
                ...state,
                fetchingAccidentSchemes: false,
                fetchedAccidentSchemes: true,
                accidentSchemes: parseData(action.payload.data.subProducts),
                errorAccidentSchemes: formatGraphQLError(action.payload)
            };
        case 'CLAIM_CLAIM_ACCIDENTSCHEME_ERR':
            return {
                ...state,
                fetchingAccidentSchemes: false,
                errorAccidentSchemes: formatServerError(action.payload)
            };

            case 'CLAIM_CLAIM_CHECKATTACHMENT_REQ':
                return {
                    ...state,
                    fetchingCheckAttachment: true,
                    fetchedCheckAttachment: false,
                    checkAttachments: null,
                    errorCheckAttachment: null,
                };
            case 'CLAIM_CLAIM_CHECKATTACHMENT_RESP':
                console.log('bank claim reducer', action.payload)
                return {
                    ...state,
                    fetchingCheckAttachment: false,
                    fetchedCheckAttachment: true,
                    checkAttachments: parseData(action.payload.data.claimDocumentsMaster),
                    errorCheckAttachment: formatGraphQLError(action.payload)
                };
            case 'CLAIM_CLAIM_CHECKATTACHMENT_ERR':
                return {
                    ...state,
                    fetchingCheckAttachment: false,
                    errorCheckAttachment: formatServerError(action.payload)
                };

            case 'CLAIM_CLAIM_BANKTYPES_REQ':
            return {
                ...state,
                fetchingBankType: true,
                fetchedBankType: false,
                bankType: null,
                errorBankType: null,
            };
        case 'CLAIM_CLAIM_BANKTYPES_RESP':
            console.log('bank claim type reducer', action.payload)
            return {
                ...state,
                fetchingBankType: false,
                fetchedBankType: true,
                bankType: parseData(action.payload.data.bankBranches),
                errorBankType: formatGraphQLError(action.payload)
            };
        case 'CLAIM_CLAIM_BANKTYPES_ERR':
            return {
                ...state,
                fetchingBankName: false,
                errorBankName: formatServerError(action.payload)
            };


        case 'CLAIM_CLAIM_ATTACHMENTS_REQ':
            return {
                ...state,
                fetchingClaimAttachments: true,
                fetchedClaimAttachments: false,
                claimAttachments: null,
                errorClaimAttachments: null,
            };
        case 'CLAIM_CLAIM_ATTACHMENTS_RESP':
            return {
                ...state,
                fetchingClaimAttachments: false,
                fetchedClaimAttachments: true,
                claimAttachments: parseData(action.payload.data.claimAttachments),
                errorClaimAttachments: formatGraphQLError(action.payload),
            };
        case 'CLAIM_CLAIM_ATTACHMENTS_ERR':
            return {
                ...state,
                fetchingClaimAttachments: false,
                errorClaimAttachments: formatServerError(action.payload)
            };
        case 'CLAIM_CLAIM_ADMIN_SELECTED':
            var claimAdmin = action.payload;
            var s = { ...state, claimAdmin }
            if (claimAdmin) {
                s.claimHealthFacility = claimAdmin.healthFacility
                s.claimDistrict = s.claimHealthFacility.location
                s.claimRegion = s.claimDistrict.parent
            }
            return s

            case 'CLAIM_CLAIM_CLAIMPICKER_SELECTED':
            var claimPick = action.payload;
            var pickerr = { ...state, claimPick }
                  console.log('redd', action.payload)
            return {
                ...state,
                pickerr: action.payload
            }

        case 'CLAIM_CLAIM_HEALTH_FACILITY_SELECTED':
            var claimHealthFacility = action.payload;
            var s = { ...state, claimHealthFacility }
            if (claimHealthFacility) {
                s.claimDistrict = s.claimHealthFacility.location
                s.claimRegion = s.claimDistrict.parent
            } else {
                delete (s.claimAdmin);
            }
            return s
        case 'CLAIM_CLAIM_DISTRICT_SELECTED':
            var claimDistrict = action.payload;
            var s = { ...state, claimDistrict }
            if (claimDistrict) {
                s.claimRegion = claimDistrict.parent
            } else {
                delete (s.claimHealthFacility);
                delete (s.claimAdmin);
            }
            return s
        case 'CLAIM_CLAIM_REGION_SELECTED':
            var claimRegion = action.payload;
            var s = { ...state, claimRegion }
            if (!claimRegion) {
                delete (s.claimDistrict);
                delete (s.claimHealthFacility);
                delete (s.claimAdmin);
            }
            return s
        case 'CLAIM_CLAIM_OFFICERS_REQ':
            return {
                ...state,
                fetchingClaimOfficers: true,
                fetchedClaimOfficers: false,
                claimOfficers: null,
                errorClaimOfficers: null,
            };
        case 'CLAIM_CLAIM_OFFICERS_RESP':
            return {
                ...state,
                fetchingClaimOfficers: false,
                fetchedClaimOfficers: true,
                claimOfficers: parseData(action.payload.data.claimOfficers),
                errorClaimOfficers: formatGraphQLError(action.payload)
            };
        case 'CLAIM_CLAIM_OFFICERS_ERR':
            return {
                ...state,
                fetchingClaimOfficers: false,
                errorClaimOfficers: formatServerError(action.payload)
            };
        case 'CLAIM_CLAIM_SEARCHER_REQ':
            return {
                ...state,
                fetchingClaims: true,
                fetchedClaims: false,
                claims: null,
                claimsPageInfo: { totalCount: 0 },
                errorClaims: null,
            };
        case 'CLAIM_CLAIM_SEARCHER_RESP':
            return {
                ...state,
                fetchingClaims: false,
                fetchedClaims: true,
                claims: parseData(action.payload.data.claims),
                claimsPageInfo: pageInfo(action.payload.data.claims),
                errorClaims: formatGraphQLError(action.payload)
            };
        case 'CLAIM_CLAIM_SEARCHER_ERR':
            return {
                ...state,
                fetchingClaims: false,
                errorClaims: formatServerError(action.payload)
            };
        case 'CLAIM_CLAIM_REQ':
            return {
                ...state,
                fetchingClaim: true,
                fetchedClaim: false,
                claim: null,
                errorClaim: null,
            };
        case 'CLAIM_CLAIM_RESP':
            var claims = parseData(action.payload.data.claims);
            console.log('reducerr', claims)
            return {
                ...state,
                fetchingClaim: false,
                fetchedClaim: true,
                claim: (!!claims && claims.length > 0) ? claims[0] : null,
                errorClaim: formatGraphQLError(action.payload)
            };
        case 'CLAIM_CLAIM_ERR':
            return {
                ...state,
                fetchingClaim: false,
                errorClaim: formatServerError(action.payload)
            };



        case 'CLAIM_LAST_CLAIM_AT_REQ':
            return {
                ...state,
                fetchingLastClaimAt: true,
                fetchedLastClaimAt: false,
                lastClaimAt: null,
                errorLastClaimAt: null,
            };
        case 'CLAIM_LAST_CLAIM_AT_RESP':

            var claims = parseData(action.payload.data.claims);
            return {
                ...state,
                fetchingLastClaimAt: false,
                fetchedLastClaimAt: true,
                lastClaimAt: (!!claims && claims.length > 0) ? claims[0] : null,
                errorCLastClaimAt: formatGraphQLError(action.payload)
            };
        case 'CLAIM_LAST_CLAIM_AT_ERR':
            return {
                ...state,
                fetchingLastClaimAt: false,
                errorLastClaimAt: formatServerError(action.payload)
            };
        case 'CLAIM_CLAIM_CODE_COUNT_REQ':
            return {
                ...state,
                fetchingClaimCodeCount: true,
                fetchedClaimCodeCount: false,
                claimCodeCount: null,
                errorClaimCodeCount: null,
            }
        case 'CLAIM_CLAIM_CODE_COUNT_RESP':
            return {
                ...state,
                fetchingClaimCodeCount: false,
                fetchedClaimCodeCount: true,
                claimCodeCount: action.payload.data.claims.totalCount,
            }
        case 'CLAIM_CLAIM_CODE_COUNT_ERR':
            return {
                ...state,
                fetchingClaimCodeCount: false,
                errorClaimCodeCount: formatServerError(action.payload)
            };
        case 'CLAIM_CHANGE_VISIT_DATE':
            return {
                ...state,
                insureeEventDate: action.EventDate
            }
        case 'CLAIM_MUTATION_REQ':
            return dispatchMutationReq(state, action)
        case 'CLAIM_MUTATION_ERR':
            return dispatchMutationErr(state, action);
        case 'CLAIM_CREATE_CLAIM_RESP':
            return dispatchMutationResp(state, "createClaim", action);
        case 'CLAIM_UPDATE_CLAIM_RESP':
            return dispatchMutationResp(state, "updateClaim", action);
        case 'CLAIM_SUBMIT_CLAIMS_RESP':
            return dispatchMutationResp(state, "submitClaims", action);
        case 'CLAIM_DELETE_CLAIMS_RESP':
            return dispatchMutationResp(state, "deleteClaims", action);
        case 'CLAIM_SELECT_CLAIMS_FOR_FEEDBACK_RESP':
            return dispatchMutationResp(state, "selectClaimsForFeedback", action);
        case 'CLAIM_BYPASS_CLAIMS_FEEDBACK_RESP':
            return dispatchMutationResp(state, "bypassClaimsFeedback", action);
        case 'CLAIM_SKIP_CLAIMS_FEEDBACK_RESP':
            return dispatchMutationResp(state, "skipClaimsFeedback", action);
        case 'CLAIM_DELIVER_CLAIM_FEEDBACK_RESP':
            return dispatchMutationResp(state, "deliverClaimFeedback", action);
        case 'CLAIM_SELECT_CLAIMS_FOR_REVIEW_RESP':
            return dispatchMutationResp(state, "selectClaimsForReview", action);
        case 'CLAIM_BYPASS_CLAIMS_REVIEW_RESP':
            return dispatchMutationResp(state, "bypassClaimsReview", action);
        case 'CLAIM_SKIP_CLAIMS_REVIEW_RESP':
            return dispatchMutationResp(state, "skipClaimsReview", action);
        case 'CLAIM_SAVE_CLAIM_REVIEW_RESP':
            return dispatchMutationResp(state, "saveClaimReview", action);
        case 'CLAIM_DELIVER_CLAIMS_REVIEW_RESP':
            return dispatchMutationResp(state, "deliverClaimsReview", action);
        case 'CLAIM_PROCESS_CLAIMS_RESP':
            return dispatchMutationResp(state, "processClaims", action);
        case 'CLAIM_FORWARD_CLAIMS_RESP':
            return dispatchMutationResp(state, "forwardClaims", action);
        case 'CLAIM_CREATE_CLAIM_ATTACHMENT_RESP':
            return dispatchMutationResp(state, "createClaimAttachment", action);
        case 'CLAIM_UPDATE_CLAIM_ATTACHMENT_RESP':
            return dispatchMutationResp(state, "updateClaimAttachment", action);
        case 'CLAIM_DELETE_CLAIM_ATTACHMENT_RESP':
            return dispatchMutationResp(state, "deleteClaimAttachment", action);
        case 'CORE_ALERT_CLEAR':
            var s = { ...state };
            delete (s.alert);
            return s;
        case 'CLAIM_PRINT':
            return {
                ...state,
                generating: true,
            };
        case 'CLAIM_PRINT_DONE':
            return {
                ...state,
                generating: false
            };
        default:
            return state;
    }
}

export default reducer;
