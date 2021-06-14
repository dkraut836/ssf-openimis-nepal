import { graphql } from "@openimis/fe-core";

export function fetchPolicies(chfid, claimDate) {

  if(!!claimDate){

    let payload = `
      {
        policiesByInsuree(chfId:"${chfid}", claimDate: "${claimDate}")
        {
          items{productCode, productName, expiryDate, status, ded, dedInPatient, dedOutPatient, ceiling, ceilingInPatient, ceilingOutPatient}
        }
      }
    `
    return graphql(payload, 'POLICY_INSUREE_POLICIES');
  }else{
      let payload = `
        {
          policiesByInsuree(chfId:"${chfid}")
          {
            items{productCode, productName, expiryDate, status, ded, dedInPatient, dedOutPatient, ceiling, ceilingInPatient, ceilingOutPatient}
          }
        }
      `;
      return graphql(payload, 'POLICY_INSUREE_POLICIES');
  }
  
}

export function fetchEligibility(chfid) {
  let payload = `
    {
      policyEligibilityByInsuree(chfId:"${chfid}")
      {
        prodId,
        totalAdmissionsLeft, totalVisitsLeft, totalConsultationsLeft, totalSurgeriesLeft, totalDeliveriesLeft, totalAntenatalLeft,
        consultationAmountLeft, surgeryAmountLeft, deliveryAmountLeft, hospitalizationAmountLeft, antenatalAmountLeft
      }
    }
  `
  return graphql(payload, 'POLICY_INSUREE_ELIGIBILITY');
}

export function fetchItemEligibility(chfid, code) {
  let payload = `
    {
      policyItemEligibilityByInsuree(chfId:"${chfid}", itemCode:"${code}")
      {
        minDateItem, itemLeft, isItemOk
      }
    }
  `
  return graphql(payload, 'POLICY_INSUREE_ITEM_ELIGIBILITY');
}

export function fetchServiceEligibility(chfid, code) {
  let payload = `
    {
      policyServiceEligibilityByInsuree(chfId:"${chfid}", serviceCode:"${code}")
      {
        minDateService,serviceLeft, isServiceOk
      }
    }
  `
  return graphql(payload, 'POLICY_INSUREE_SERVICE_ELIGIBILITY');
}
