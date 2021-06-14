import { CancelPresentationOutlined } from "@material-ui/icons";
import {
  baseApiUrl, graphql, formatQuery, formatPageQuery, formatPageQueryWithCount,
  formatMutation, decodeId, openBlob, formatJsonField
} from "@openimis/fe-core";
import _ from "lodash";
import _uuid from "lodash-uuid";

export function dashboard() {
  let payload = `
  {
    dashboard
    {
      AccidentClaimApplication,
      AccidentInProgress,
      AccidentSettled,
      AccidentRejected,
      AccidentRecommendedByEmployer,
      AccidentForwarded,
      AccidentEntered,
      
      MedicalClaimApplication,
      MedicalInProgress,
      MedicalSettled,
      MedicalRejected,
      MedicalForwarded,
      MedicalEntered, 
      workPlaceAccident,accident, occupationalDisease, other, range1, range2, range3, range4, range5
    }
  }
`
console.log('kkkkkkkkk',payload)
    return graphql(payload, 'DASHBOARD_CLAIMAPP');
  }
  