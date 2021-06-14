import { graphql, formatQuery, formatPageQueryWithCount } from "@openimis/fe-core";

export function fetchInsuree(mm, chfid) {
  let payload = formatQuery("insuree",
    [`chfId:"${chfid}"`],
    ["id", "chfId", "lastName", "otherNames", "dob", "age",
      "family{id}",
      "photo{folder,filename}",
      "basePath",
      "gender{code, gender, altLanguage}",
      "healthFacility" + mm.getProjection("location.HealthFacilityPicker.projection")]
  );
  return graphql(payload, 'INSUREE_ENQUIRY');
}

export const changeClaimDate=(claimDate) => dispatch=>{
  dispatch({
    type: 'INSUREE_CHANGE_CLAIM_DATE', claimDate
  })
}


export function fetchInsurees(mm, filters) {
  let payload = formatPageQueryWithCount("insurees",
    filters,
    mm.getRef("insuree.InsureePicker.projection")
  );
  return graphql(payload, 'INSUREE_INSUREES');
}

export function fetchInsureeFamily(mm, chfid) {
  let payload = formatQuery("insureeFamilyMembers",
    [`chfId:"${chfid}"`],
    ["chfId", "otherNames", "lastName", "head", "phone"]
  );
  return graphql(payload, 'INSUREE_FAMILY');
}
