import { CancelPresentationOutlined } from "@material-ui/icons";
import {
  baseApiUrl, graphql, formatQuery, formatPageQuery, formatPageQueryWithCount,
  formatMutation, decodeId, openBlob, formatJsonField
} from "@openimis/fe-core";
import _ from "lodash";
import _uuid from "lodash-uuid";

export function fetchClaimAdmins(mm, hf, str, prev) {console.log('Fetch Claimm', hf)
  var filters = [];
  if (!!hf) {
    filters.push(`healthFacility_Uuid: "${hf.uuid}"`)
  }
  if (!!str) {
    filters.push(`str: "${str}"`)
  }
  if (_.isEqual(filters, prev)) {
    return (dispatch) => { }
  }
  const payload = formatPageQuery(
    !str ? "claimAdmins" : "claimAdminsStr",
    filters,
    mm.getRef("claim.ClaimAdminPicker.projection")
  );
  return graphql(payload, 'CLAIM_CLAIM_ADMINS', filters);
}
export const changeVisitDate=(EventDate) => dispatch=>{
  dispatch({
    type: 'CLAIM_CHANGE_VISIT_DATE', EventDate
  })
}
export function selectClaimAdmin(admin) {
  return dispatch => {
    dispatch({ type: 'CLAIM_CLAIM_ADMIN_SELECTED', payload: admin })
  }
}

export function selectHealthFacility(hf) {
  console.log('Fetch Claimm1', hf)
  return dispatch => {
    dispatch({ type: 'CLAIM_CLAIM_HEALTH_FACILITY_SELECTED', payload: hf })
  }
}

export function selectClaimPicker(prod) {
  console.log('Fetch Claimm2', prod)
  return dispatch => {
    dispatch({ type: 'CLAIM_CLAIM_CLAIMPICKER_SELECTED', payload: prod })
  }
}

export function selectDistrict(district) {
  return dispatch => {
    dispatch({ type: 'CLAIM_CLAIM_DISTRICT_SELECTED', payload: district })
  }
}

export function selectRegion(region) {
  return dispatch => {
    dispatch({ type: 'CLAIM_CLAIM_REGION_SELECTED', payload: region })
  }
}

export function validateClaimCode(code) {
  const payload = formatQuery(
    "claims",
    [`code: "${code}"`],
    ["totalCount"]
  )
  return graphql(payload, 'CLAIM_CLAIM_CODE_COUNT');
}

export function reClaimPicker(chf_Id, hf_Id,product_Code) {

  const payload = formatQuery(
    "claims",
    [`insuree_ChfId: "${chf_Id}",healthFacility_Id: "${hf_Id}",rejectList: "y", product_Code:"${product_Code}"`],
    ["edges{node{code,id}}"]
  )
  console.log('claiiii', payload)
  return graphql(payload, 'CLAIM_CLAIM_RECLAIM');
}


export function fetchClaimOfficers(mm) {
  const payload = formatPageQuery("claimOfficers",
    null,
    mm.getRef("claim.ClaimOfficerPicker.projection")
  );
  return graphql(payload, 'CLAIM_CLAIM_OFFICERS');
}



export function fetchEmployerPicker(claim) {
  let payload = formatPageQuery("contributorEmployer",[`insuree_ChfId:"${claim.insuree.chfId}"`],
  ["employer{ESsid,EmployerNameNep}"]
);
return graphql(payload, 'CLAIM_CLAIM_EMPLOYERS');
}

export function fetchHealthFacilityPicker(mm) {
  let payload = formatPageQuery("healthFacilities",
  null,
  mm.getRef("claim.HealthFacilityPicker.projection")
);
return graphql(payload, 'CLAIM_CLAIM_HOSPITAL');
}



export function fetchBankPicker(mm,claim) {
  let payload = formatPageQuery("banks",
  null,
  mm.getRef("claim.BankNamePicker.projection")
);
return graphql(payload, 'CLAIM_CLAIM_BANKS');
}

export function fetchAccidentalPlacePicker(mm,claim) {

  let payload = formatPageQuery("subProducts",
  [`product_Uuid:"${!!claim ?claim.uuid:""}"`],
  mm.getRef("claim.AccidentialPlacePicker.projection")
);
return graphql(payload, 'CLAIM_CLAIM_ACCIDENTSCHEME');
}

export function checkAttachmentPicker(mm,claim) {
  console.log('fetcha stt', claim)
  let payload = formatPageQuery("claimDocumentsMaster",
  [`UseBy_Icontains:"${claim}"`],
  mm.getRef("claim.CheckAttachmentPicker.projection")
);

console.log('actttttt aa', payload)
return graphql(payload, 'CLAIM_CLAIM_CHECKATTACHMENT');
}

export function fetchBankTypePicker(mm,claim) {
  console.log('bank type action', claim.hfBank.BankId)
  let payload = formatPageQuery("bankBranches",[`Bank_Bankid:"${claim.hfBank.BankId}"`],
  mm.getRef("claim.BankTypePicker.projection")
);
return graphql(payload, 'CLAIM_CLAIM_BANKTYPES');
}

export function fetchClaimPicker(mm) {
  let payload = formatPageQuery("products",
  null,
  mm.getRef("claim.ClaimPicker.projection")
);
return graphql(payload, 'CLAIM_CLAIM_CLAIMPICKER');
}

export function fetchRecommender(claim) {

  let payload = formatPageQuery("ClaimRecommend",[`claim_Code:"${claim.code}"`],
  ["witnessName","capacity", "presentAfterCase", "presentBeforeApp",
"lastPresentDate", "joinDate", "accDate", "accTime", "workShift", "informDate", "healTime","leaveFromDate",
"leaveToDate","presentAfterAccDate","paymentType","accidentPlace","toolDescription", "workDuringAcc",
"recommenderSsid", "recommenderPost", "recommenderName", "recommendDate", "recommendRemarks",
"recommenderContact","recommendAttachment"]
);
console.log('action payload', payload)
return graphql(payload, 'CLAIM_CLAIM_RECOMMENDER');
}


export function fetchClaimAttachments(claim, id) {
  console.log('fetcha', id)
  const payload = formatPageQuery(
    "claimAttachments",
    [`claim_Uuid: "${claim.uuid}"`],
    ["id", "type", "title", "date", "filename","document", "mime","masterDocument{id,DocName}"]
  )
  console.log('fetcha AA', payload)
  return graphql(payload, 'CLAIM_CLAIM_ATTACHMENTS');
}

export function formatAttachment(attach) {
  console.log('attachh', attach)
  return `
    ${!!attach.id ? `id: "${decodeId(attach.id)}"` : ""}
    ${!!attach.claimUuid ? `claimUuid: "${attach.claimUuid}"` : ""}
    ${!!attach.title ? `title: "${attach.title}"` : ""}
    ${!!attach.date ? `date: "${attach.date}"` : ""}
    ${!!attach.mime ? `mime: "${attach.mime}"` : ""}
    ${!!attach.filename ? `filename: "${attach.filename}"` : ""}
    ${!!attach.document ? `document: "${attach.document}"` : ""}
    ${!!attach.masterDocument ? `masterDocumentId: ${decodeId(attach.masterDocument.id)}` : ""}
    ${!!attach.documentFrom ? `documentFrom: "${attach.documentFrom}"` : ""}
  `}

export function createAttachment(attach, clientMutationLabel) {
  let payload = formatAttachment(attach);
  let mutation = formatMutation("createClaimAttachment", payload, clientMutationLabel);
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ['CLAIM_MUTATION_REQ', 'CLAIM_CREATE_CLAIM_ATTACHMENT_RESP', 'CLAIM_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime
    }
  )
}

export function updateAttachment(attach, clientMutationLabel) {
  let payload = formatAttachment(attach);
  let mutation = formatMutation("updateClaimAttachment", payload, clientMutationLabel);
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ['CLAIM_MUTATION_REQ', 'CLAIM_UPDATE_CLAIM_ATTACHMENT_RESP', 'CLAIM_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime
    }
  )
}

export function deleteAttachment(attach, clientMutationLabel) {
  let mutation = formatMutation("deleteClaimAttachment", `id: "${decodeId(attach.id)}"`, clientMutationLabel);
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ['CLAIM_MUTATION_REQ', 'CLAIM_DELETE_CLAIM_ATTACHMENT_RESP', 'CLAIM_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime
    }
  )
}

export function downloadAttachment(attach) {
  var url = new URL(`${window.location.origin}${baseApiUrl}/claim/attach`);
  print(url)
  url.search = new URLSearchParams({ id: decodeId(attach.id) });

  return (dispatch) => {
    return fetch(url)
      .then(response => response.blob())
      .then(blob => {openBlob(blob, attach.filename, attach.mime), console.log('blobb is', blob)})
  }
}

export function fetchClaimSummaries(mm, filters, withAttachmentsCount) {
  var projections = [
    "uuid", "code", "jsonExt", "dateClaimed", "feedbackStatus", "reviewStatus", "claimed", "approved", "status",
    "clientMutationId",
    "healthFacility" + mm.getProjection("location.HealthFacilityPicker.projection"),
    "insuree" + mm.getProjection("insuree.InsureePicker.projection"),
    "product" + mm.getProjection("claim.ClaimPicker.projection")]
  if (withAttachmentsCount) {
    projections.push("attachmentsCount")
  }
  const payload = formatPageQueryWithCount("claims",
    filters,
    projections
  );
  return graphql(payload, 'CLAIM_CLAIM_SEARCHER');
}

export function formatDetail(type, detail) {
  return `{
    ${detail.id !== undefined && detail.id !== null ? `id: ${detail.id}` : ''}
    ${type}Id: ${decodeId(detail[type].id)}
    ${detail.priceAsked !== null ? `priceAsked: "${_.round(detail.priceAsked, 2).toFixed(2)}"` : ''}
    ${detail.qtyProvided !== null ? `qtyProvided: "${_.round(detail.qtyProvided, 2).toFixed(2)}"` : ''}
    status: 1
    ${detail.explanation !== undefined && detail.explanation !== null ? `explanation: "${detail.explanation}"` : ''}
    ${detail.justification !== undefined && detail.justification !== null ? `justification: "${detail.justification}"` : ''}
  }`
}

export function formatDetails(type, details) {
  if (!details) return "";
  let dets = details.filter(d => !!d[type]);
  return `${type}s: [
      ${dets.map(d => formatDetail(type, d)).join('\n')}
    ]`
}

export function formatAttachments(mm, attachments) {
  return `[
    ${attachments.map(a => `{
      ${formatAttachment(a)}
    }`).join('\n')}
  ]`
}

export function formatClaimGQL(mm, claim,productType,code,type = 'C') {
  console.log('aaaaaccccc', claim)
let essid = type === 'U'?((claim.employer===undefined || claim.employer===null)?"NULL":claim.employer.ESsid):(claim.employer===undefined?"NULL":claim.employer.employer.ESsid);
let prod = type === 'U'? decodeId(claim.product.id):decodeId(productType.id)

let json= `
    ${claim.uuid !== undefined && claim.uuid !== null ? `uuid: "${claim.uuid}"` : ''}
    insureeId: ${decodeId(claim.insuree.id)}
    ${!!claim.hfBank ? `hfBankId: ${decodeId(claim.hfBank.BankId)}` : ""}
    ${!!claim.hfBranch ? `hfBranchId: ${decodeId(claim.hfBranch.BranchId)}` : ""}
    adminId: ${decodeId(claim.admin.id)}
    dateFrom: "${claim.dateFrom}"
    code: "${code}"
    productId: ${prod}
    ${!!claim.subProduct ? `subProductId: ${decodeId(claim.subProduct.id)}` : ""}
    ${claim.dateTo ? `dateTo: "${claim.dateTo}"` : ''}
    icdId: ${decodeId(claim.icd.id)}
    ${!!claim.icd1 ? `icd1Id: ${decodeId(claim.icd1.id)}` : ""}
    ${!!claim.icd2 ? `icd2Id: ${decodeId(claim.icd2.id)}` : ""}
    ${!!claim.icd3 ? `icd3Id: ${decodeId(claim.icd3.id)}` : ""}
    ${!!claim.icd4 ? `icd4Id: ${decodeId(claim.icd4.id)}` : ""}
    ${!!claim.headClaim ? `headClaimId: ${decodeId(claim.headClaim.id)}` : ""}
    ${!claim.referToHealthFacility ? "" : `referToHealthFacilityId: ${decodeId(claim.referToHealthFacility.id)}`}
    ${!!claim.referFromHealthFacility ? `referFromHealthFacilityId: ${decodeId(claim.referFromHealthFacility.id)}` : ""}
    ${`jsonExt: ${formatJsonField(claim.jsonExt)}`}
    feedbackStatus: ${mm.getRef("claim.CreateClaim.feedbackStatus")}
    reviewStatus: ${mm.getRef("claim.CreateClaim.reviewStatus")}
    dateClaimed: "${claim.dateClaimed}"
    healthFacilityId: ${decodeId(claim.healthFacility.id)}
    ${!!claim.guaranteeId ? `guaranteeId: "${claim.guaranteeId}"` : ""}
    ${!!claim.explanation ? `explanation: "${claim.explanation}"` : ""}
    ${!!claim.isAdmitted ? `isAdmitted: "${claim.isAdmitted}"` : ""}
    ${!!claim.reasonOfSickness ? `reasonOfSickness: "${claim.reasonOfSickness}"` : ""}
    ${!!claim.conditionOfWound ? `conditionOfWound: "${claim.conditionOfWound}"` : ""}
    ${!!claim.isDead ? `isDead: "${claim.isDead}"` : ""}
    ${!!claim.deadDate ? `deadDate: "${claim.deadDate}"` : ""}
    ${!!claim.isReclaim ? `isReclaim: "${claim.isReclaim}"` : ""}
    ${!!claim.deadTime ? `deadTime: "${claim.deadTime}"` : ""}
    ${!!claim.deadReason ? `deadReason: "${claim.deadReason}"` : ""}
    ${!!claim.injuredBodyPart ? `injuredBodyPart: "${claim.injuredBodyPart}"` : ""}
    ${!!claim.adjustment ? `adjustment: "${claim.adjustment}"` : ""}
    ${!!claim.capability ? `capability: "${claim.capability}"` : ""}
    ${!!claim.accidentDescription ? `accidentDescription: "${claim.accidentDescription}"` : ""}
    ${!!claim.cancer ? `cancer: "${claim.cancer}"` : ""}
    ${!!claim.heartAttack ? `heartAttack: "${claim.heartAttack}"` : ""}
    ${!!claim.hiv ? `hiv: "${claim.hiv}"` : ""}
    ${!!claim.isDisable ? `isDisable: "${claim.isDisable}"` : ""}
    ${!!claim.highBp ? `highBp: "${claim.highBp}"` : ""}
    ${!!claim.diabetes ? `diabetes: "${claim.diabetes}"` : ""}
    ${!!claim.visitType ? `visitType: "${claim.visitType}"` : ""}
    ${!!claim.referFromDate ? `referFromDate: "${claim.referFromDate}"` : ""}
    ${!!claim.referFromHfOther ? `referFromHfOther: "${claim.referFromHfOther}"` : ""}
    ${!!claim.referToHfOther ? `referToHfOther: "${claim.referToHfOther}"` : ""}
    ${!!claim.hfAccountName ? `hfAccountName: "${claim.hfAccountName}"` : ""}
    ${!!claim.hfAccountNumber ? `hfAccountNumber: "${claim.hfAccountNumber}"` : ""}
    ${!!claim.checkRemarks ? `checkRemarks: "${claim.checkRemarks}"` : ""}
    ${!!claim.restPeriod ? `restPeriod: ${claim.restPeriod}` : ""}
    ${!!claim.followUpDate ? `followUpDate: "${claim.followUpDate}"` : ""}
    ${!!claim.payTo ? `payTo: ${claim.payTo}` : ""}

    ${!!claim.schemeAppId ? `schemeAppId: "${claim.schemeAppId}"` : ""}
    ${!!claim.attachment ? `attachment: "${claim.attachment}"` : ""}
    ${!!claim.dischargeType ? `dischargeType: "${claim.dischargeType}"` : ""}
    ${!!claim.dischargeSummary ? `dischargeSummary: "${claim.dischargeSummary}"` : ""}
    ${!!claim.referToDate ? `referToDate: "${claim.referToDate}"` : ""}
    ${!!claim.claimFor ? `claimFor: ${claim.claimFor}` : ""}
    ${!!claim.deadCertificateAttachment ? `deadCertificateAttachment: "${claim.deadCertificateAttachment}"` : ""}
    ${formatDetails("service", claim.services)}
    ${formatDetails("item", claim.items)}
    ${!!claim.attachments && !!claim.attachments.length ? `attachments: ${formatAttachments(mm, claim.attachments)}` : ""}
  `
  if ((!!productType && productType.code=="SSF0002") || (!!claim.product && claim.product.code=="SSF0002")){
    json+=`employerId: "${essid}"`
  }
  return json;
}

export function createClaim(mm, claim, productType, code,clientMutationLabel) {
  let mutation = formatMutation("createClaim", formatClaimGQL(mm, claim, productType,code), clientMutationLabel);
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ['CLAIM_MUTATION_REQ', 'CLAIM_CREATE_CLAIM_RESP', 'CLAIM_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime
    }
  )
}

export function generateCode(code) {
  console.log('generatee', code)
 let payload=`
 mutation{
  claimCode(
    input:{
      codedValue:"${code}",

    })
  {generatedCodedValue
    hospitalCode,

  }
}`
console.log('generatee', payload)
console.log('generatee', payload)
  return graphql(payload,'GENERATE_CODE')

  }

export function updateClaim(mm, claim, productType, code,clientMutationLabel) {
  // console.log('updatee action', claim)
  code = !!claim.code ? claim.code : code
  let mutation = formatMutation("updateClaim", formatClaimGQL(mm, claim,productType,code,'U'), clientMutationLabel);
  var requestedDateTime = new Date();
  claim.clientMutationId = mutation.clientMutationId;
  return graphql(
    mutation.payload,
    ['CLAIM_MUTATION_REQ', 'CLAIM_UPDATE_CLAIM_RESP', 'CLAIM_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime
    }
  )
}

export function fetchClaim(mm, claimUuid, claimCode, forFeedback, claim) {
  console.log('action hit', claimCode)
  let filter = !!claimUuid ? `uuid: "${claimUuid}"` : `code: "${claimCode}"`
  let projections = [
    "uuid", "code", "dateFrom", "dateTo", "dateClaimed", "claimed", "approved", "valuated", "status",
    "feedbackStatus", "reviewStatus", "guaranteeId", "explanation", "adjustment", "attachmentsCount",
    "isAdmitted","reasonOfSickness","conditionOfWound","injuredBodyPart","isDead", "deadDate","deadReason",
    "deadTime","accidentDescription","capability","cancer", "heartAttack", "hiv", "highBp", "diabetes",
    "hfAccountName", "hfAccountNumber","visitType","referFromDate", "checkAttachment","checkRemarks",
    "schemeAppId","referToDate","dischargeSummary", "dischargeType","deadCertificateAttachment",
    "referFromHfOther","referToHfOther","isDisable","restPeriod","followUpDate","isReclaim","claimFor","payTo",
    "healthFacility" + mm.getProjection("location.HealthFacilityPicker.projection"),
    "insuree" + mm.getProjection("insuree.InsureePicker.projection"),
    "admin" + mm.getProjection("claim.ClaimAdminPicker.projection"),
    "product" + mm.getProjection("claim.ClaimPicker.projection"),
    "icd" + mm.getProjection("medical.DiagnosisPicker.projection"),
    "icd1" + mm.getProjection("medical.DiagnosisPicker.projection"),
    "icd2" + mm.getProjection("medical.DiagnosisPicker.projection"),
    "icd3" + mm.getProjection("medical.DiagnosisPicker.projection"),
    "icd4" + mm.getProjection("medical.DiagnosisPicker.projection"),
    "employer" + mm.getProjection("claim.ClaimEmployerPicker.projection"),
    "headClaim" + mm.getProjection("claim.ReClaimPicker.projection"),
    "subProduct" + mm.getProjection("claim.AccidentialPlacePicker.projection"),
    "hfBank" + mm.getProjection("claim.BankNamePicker.projection"),
    "hfBranch" + mm.getProjection("claim.BankTypePicker.projection"),
    "referToHealthFacility" + mm.getProjection("claim.HealthFacilityPicker.projection"),
    "referFromHealthFacility" + mm.getProjection("claim.HealthFacilityPicker.projection"),
    "jsonExt",
  ]
  if (!!forFeedback) {
    projections.push("feedback{id, careRendered, paymentAsked, drugPrescribed, drugReceived, asessment, feedbackDate, officerId}")
  } else {
    projections.push(
      "services{" +
      "id, qtyProvided, priceAsked, qtyApproved, priceApproved, priceValuated, explanation, justification, rejectionReason, status, service" +
      mm.getProjection("medical.ServicePicker.projection") +
      "}",
      "items{" +
      "id, qtyProvided, priceAsked, qtyApproved, priceApproved, priceValuated, explanation, justification, rejectionReason, status, item" +
      mm.getProjection("medical.ItemPicker.projection") +
      "}",
    )
  }
  const payload = formatPageQuery("claims",
    [filter],
    projections
  );
  return graphql(payload, 'CLAIM_CLAIM');
}


export function fetchReClaim(mm,claim, code,forFeedback=false){
  let projections = [
    "uuid", "code", "dateFrom", "dateTo", "dateClaimed", "claimed", "approved", "valuated", "status",
    "feedbackStatus", "reviewStatus", "guaranteeId", "explanation", "adjustment", "attachmentsCount",
    "isAdmitted","reasonOfSickness","conditionOfWound","injuredBodyPart","isDead", "deadDate","deadReason",
    "deadTime","accidentDescription","capability","cancer", "heartAttack", "hiv", "highBp", "diabetes",
    "hfAccountName", "hfAccountNumber","visitType","referFromDate", "checkAttachment","checkRemarks",
    "schemeAppId","referToDate","dischargeSummary", "dischargeType","deadCertificateAttachment",
    "referFromHfOther","referToHfOther","isDisable","restPeriod","followUpDate","isReclaim",
    "healthFacility" + mm.getProjection("location.HealthFacilityPicker.projection"),
    "insuree" + mm.getProjection("insuree.InsureePicker.projection"),
    "admin" + mm.getProjection("claim.ClaimAdminPicker.projection"),
    "product" + mm.getProjection("claim.ClaimPicker.projection"),
    "icd" + mm.getProjection("medical.DiagnosisPicker.projection"),
    "icd1" + mm.getProjection("medical.DiagnosisPicker.projection"),
    "icd2" + mm.getProjection("medical.DiagnosisPicker.projection"),
    "icd3" + mm.getProjection("medical.DiagnosisPicker.projection"),
    "icd4" + mm.getProjection("medical.DiagnosisPicker.projection"),
    "employer" + mm.getProjection("claim.ClaimEmployerPicker.projection"),
    "headClaim" + mm.getProjection("claim.ReClaimPicker.projection"),
    "subProduct" + mm.getProjection("claim.AccidentialPlacePicker.projection"),
    "hfBank" + mm.getProjection("claim.BankNamePicker.projection"),
    "hfBranch" + mm.getProjection("claim.BankTypePicker.projection"),
    "referToHealthFacility" + mm.getProjection("claim.HealthFacilityPicker.projection"),
    "referFromHealthFacility" + mm.getProjection("claim.HealthFacilityPicker.projection"),
    "jsonExt",
  ]
  if (!!forFeedback) {
    projections.push("feedback{id, careRendered, paymentAsked, drugPrescribed, drugReceived, asessment, feedbackDate, officerId}")
  } else {
    projections.push(
      "services{" +
      "id, qtyProvided, priceAsked, qtyApproved, priceApproved, priceValuated, explanation, justification, rejectionReason, status, service" +
      mm.getProjection("medical.ServicePicker.projection") +
      "}",
      "items{" +
      "id, qtyProvided, priceAsked, qtyApproved, priceApproved, priceValuated, explanation, justification, rejectionReason, status, item" +
      mm.getProjection("medical.ItemPicker.projection") +
      "}",
    )}

  const payload = formatPageQuery(
    "claims",
    [`insuree_ChfId:"${claim.insuree.chfId}", code:"${code}"`],
    projections
);
console.log('reclaimm', payload)
return graphql(payload, 'CLAIM_CLAIM_FETCHRECLAIM');
}

// export function fetchEmployerPicker(claim) {
//   let payload = formatPageQuery("contributorEmployer",[`insuree_ChfId:"${claim.insuree.chfId}"`],
//   ["employer{ESsid,EmployerNameNep}"]
// );
// return graphql(payload, 'CLAIM_CLAIM_EMPLOYERS');
// }

export function fetchLastClaimAt(claim) {
  const payload = formatPageQuery("claims",
    [
      `insuree_ChfId: "${claim.insuree.chfId}"`,
      `codeIsNot: "${claim.code}"`,
      `healthFacility_Uuid: "${claim.healthFacility.uuid}"`,
      "first: 1", `orderBy: "-dateFrom"`],
    ["code", "dateFrom", "dateTo"]
  );
  return graphql(payload, 'CLAIM_LAST_CLAIM_AT');
}

export function submit(claims, clientMutationLabel, clientMutationDetails = null) {
  let claimUuids = `uuids: ["${claims.map(c => c.uuid).join("\",\"")}"]`
  let mutation = formatMutation("submitClaims", claimUuids, clientMutationLabel, clientMutationDetails);
  var requestedDateTime = new Date();
  claims.forEach(c => c.clientMutationId = mutation.clientMutationId);
  return graphql(
    mutation.payload,
    ['CLAIM_MUTATION_REQ', 'CLAIM_SUBMIT_CLAIMS_RESP', 'CLAIM_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      clientMutationDetails: !!clientMutationDetails ? JSON.stringify(clientMutationDetails) : null,
      requestedDateTime
    }
  )
}

export function del(claims, clientMutationLabel, clientMutationDetails = null) {
  let claimUuids = `uuids: ["${claims.map(c => c.uuid).join("\",\"")}"]`
  let mutation = formatMutation("deleteClaims", claimUuids, clientMutationLabel, clientMutationDetails);
  var requestedDateTime = new Date();
  claims.forEach(c => c.clientMutationId = mutation.clientMutationId);
  return graphql(
    mutation.payload,
    ['CLAIM_MUTATION_REQ', 'CLAIM_DELETE_CLAIMS_RESP', 'CLAIM_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      clientMutationDetails: !!clientMutationDetails ? JSON.stringify(clientMutationDetails) : null,
      requestedDateTime
    }
  )
}

export const changeSpouseId = (id) =>{
  console.log('spousee id', id)
  return dispatch => {
    dispatch({
      type: 'CHANGE_ID',
      payload:id
    })
  }

}

export function selectForFeedback(claims, clientMutationLabel, clientMutationDetails = null) {
  let claimUuids = `uuids: ["${claims.map(c => c.uuid).join("\",\"")}"]`
  let mutation = formatMutation("selectClaimsForFeedback", claimUuids, clientMutationLabel, clientMutationDetails);
  var requestedDateTime = new Date();
  claims.forEach(c => c.clientMutationId = mutation.clientMutationId);
  return graphql(
    mutation.payload,
    ['CLAIM_MUTATION_REQ', 'CLAIM_SELECT_CLAIMS_FOR_FEEDBACK_RESP', 'CLAIM_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      clientMutationDetails: !!clientMutationDetails ? JSON.stringify(clientMutationDetails) : null,
      requestedDateTime
    }
  )
}

export function bypassFeedback(claims, clientMutationLabel, clientMutationDetails = null) {
  let claimUuids = `uuids: ["${claims.map(c => c.uuid).join("\",\"")}"]`
  let mutation = formatMutation("bypassClaimsFeedback", claimUuids, clientMutationLabel, clientMutationDetails);
  var requestedDateTime = new Date();
  claims.forEach(c => c.clientMutationId = mutation.clientMutationId);
  return graphql(
    mutation.payload,
    ['CLAIM_MUTATION_REQ', 'CLAIM_BYPASS_CLAIMS_FEEDBACK_RESP', 'CLAIM_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      clientMutationDetails: !!clientMutationDetails ? JSON.stringify(clientMutationDetails) : null,
      requestedDateTime
    }
  )
}

export function deliverFeedback(claim, clientMutationLabel) {
  let feedback = { ...claim.feedback };
  let feedbackGQL = `
    claimUuid: "${claim.uuid}"
    feedback: {
      ${!!feedback.feedbackDate ? `feedbackDate: "${feedback.feedbackDate}"` : ''}
      ${!!feedback.officerId ? `officerId: ${feedback.officerId}` : ''}
      ${feedback.careRendered !== undefined && feedback.careRendered !== null ? `careRendered: ${feedback.careRendered}` : ''}
      ${feedback.paymentAsked !== undefined && feedback.paymentAsked !== null ? `paymentAsked: ${feedback.paymentAsked}` : ''}
      ${feedback.drugPrescribed !== undefined && feedback.drugPrescribed !== null ? `drugPrescribed: ${feedback.drugPrescribed}` : ''}
      ${feedback.drugReceived !== undefined && feedback.drugReceived !== null ? `drugReceived: ${feedback.drugReceived}` : ''}
      ${feedback.asessment !== undefined && feedback.asessment !== null ? `asessment: ${feedback.asessment}` : ''}
    }
  `
  let mutation = formatMutation("deliverClaimFeedback", feedbackGQL, clientMutationLabel)
  var requestedDateTime = new Date();
  claim.clientMutationId = mutation.clientMutationId;
  return graphql(
    mutation.payload,
    ['CLAIM_MUTATION_REQ', 'CLAIM_DELIVER_CLAIM_FEEDBACK_RESP', 'CLAIM_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime
    }
  )
}

export function skipFeedback(claims, clientMutationLabel, clientMutationDetails = null) {
  let claimUuids = `uuids: ["${claims.map(c => c.uuid).join("\",\"")}"]`
  let mutation = formatMutation("skipClaimsFeedback", claimUuids, clientMutationLabel, clientMutationDetails);
  var requestedDateTime = new Date();
  claims.forEach(c => c.clientMutationId = mutation.clientMutationId);
  return graphql(
    mutation.payload,
    ['CLAIM_MUTATION_REQ', 'CLAIM_SKIP_CLAIMS_FEEDBACK_RESP', 'CLAIM_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      clientMutationDetails: !!clientMutationDetails ? JSON.stringify(clientMutationDetails) : null,
      requestedDateTime
    }
  )
}

export function selectForReview(claims, clientMutationLabel, clientMutationDetails = null) {
  let mutation = formatMutation(
    "selectClaimsForReview",
    `uuids: ["${claims.map(c => c.uuid).join("\",\"")}"]`,
    clientMutationLabel,
    clientMutationDetails
  );
  var requestedDateTime = new Date();
  claims.forEach(c => c.clientMutationId = mutation.clientMutationId);
  return graphql(
    mutation.payload,
    ['CLAIM_MUTATION_REQ', 'CLAIM_SELECT_CLAIMS_FOR_REVIEW_RESP', 'CLAIM_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      clientMutationDetails: !!clientMutationDetails ? JSON.stringify(clientMutationDetails) : null,
      requestedDateTime
    }
  )
}

export function bypassReview(claims, clientMutationLabel, clientMutationDetails = null) {
  let claimUuids = `uuids: ["${claims.map(c => c.uuid).join("\",\"")}"]`
  let mutation = formatMutation(
    "bypassClaimsReview",
    claimUuids,
    clientMutationLabel,
    clientMutationDetails
  );
  var requestedDateTime = new Date();
  claims.forEach(c => c.clientMutationId = mutation.clientMutationId);
  return graphql(
    mutation.payload,
    ['CLAIM_MUTATION_REQ', 'CLAIM_BYPASS_CLAIMS_REVIEW_RESP', 'CLAIM_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      clientMutationDetails: !!clientMutationDetails ? JSON.stringify(clientMutationDetails) : null,
      requestedDateTime
    }
  )
}



export function formatReviewDetail(type, detail) {
  return `{
    id: ${detail.id}
    ${type}Id: ${decodeId(detail[type].id)}
    ${detail.qtyApproved !== null ? `qtyApproved: "${_.round(detail.qtyApproved, 2).toFixed(2)}"` : ''}
    ${detail.priceApproved !== null ? `priceApproved: "${_.round(detail.priceApproved, 2).toFixed(2)}"` : ''}
    ${detail.justification !== null ? `justification: "${detail.justification}"` : ''}
    status: ${detail.status}
    ${detail.rejectionReason !== null ? `rejectionReason: ${detail.rejectionReason}` : ''}
  }`
}


export function formatReviewDetails(type, details) {
  if (!details || details.length < 1) return "";
  return `${type}s: [
      ${details.map(d => formatReviewDetail(type, d)).join('\n')}
    ]`
}

export function saveReview(claim, clientMutationLabel) {
  console.log('dibya',claim)
  let schAppId=( !!claim.product && claim.product.code=="SSF0002") ? 2 : 1;
  let reviewGQL = `
    claimUuid: "${claim.uuid}"
    ${!!claim.adjustment ? `adjustment: "${claim.adjustment}"` : ""}
    ${!!claim.checkRemarks ? `checkRemarks: "${claim.checkRemarks}"` : ""}
    ${!!claim.checkAttachment ? `checkAttachment: "${claim.checkAttachment}"` : ""}
    ${!!claim.schemeId ? `schemeId: "${claim.schemeId}"` : ""}

    ${!!claim.schemeAppId ? `schemeAppId: "${schAppId}"` : ""}
    ${!!claim.capability ? `capability: "${claim.capability}"` : ""}
    ${formatReviewDetails("service", claim.services)}
    ${formatReviewDetails("item", claim.items)}
  `
  let mutation = formatMutation("saveClaimReview", reviewGQL, clientMutationLabel)
  var requestedDateTime = new Date();
  claim.clientMutationId = mutation.clientMutationId;
  return graphql(
    mutation.payload,
    ['CLAIM_MUTATION_REQ', 'CLAIM_SAVE_CLAIM_REVIEW_RESP', 'CLAIM_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime
    }
  )
}

export function deliverReview(claims, clientMutationLabel, clientMutationDetails = null) {
  let claimUuids = `uuids: ["${claims.map(c => c.uuid).join("\",\"")}"]`
  let mutation = formatMutation(
    "deliverClaimsReview",
    claimUuids,
    clientMutationLabel,
    clientMutationDetails
  );
  var requestedDateTime = new Date();
  claims.forEach(c => c.clientMutationId = mutation.clientMutationId);
  return graphql(
    mutation.payload,
    ['CLAIM_MUTATION_REQ', 'CLAIM_DELIVER_CLAIMS_REVIEW_RESP', 'CLAIM_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      clientMutationDetails: !!clientMutationDetails ? JSON.stringify(clientMutationDetails) : null,
      requestedDateTime
    }
  )
}

export function skipReview(claims, clientMutationLabel, clientMutationDetails = null) {
  let claimUuids = `uuids: ["${claims.map(c => c.uuid).join("\",\"")}"]`
  let mutation = formatMutation(
    "skipClaimsReview",
    claimUuids,
    clientMutationLabel,
    clientMutationDetails
  );
  var requestedDateTime = new Date();
  claims.forEach(c => c.clientMutationId = mutation.clientMutationId);
  return graphql(
    mutation.payload,
    ['CLAIM_MUTATION_REQ', 'CLAIM_SKIP_CLAIMS_REVIEW_RESP', 'CLAIM_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      clientMutationDetails: !!clientMutationDetails ? JSON.stringify(clientMutationDetails) : null,
      requestedDateTime
    }
  )
}

export function process(claims, clientMutationLabel, clientMutationDetails = null) {
  let claimUuids = `uuids: ["${claims.map(c => c.uuid).join("\",\"")}"]`
  let mutation = formatMutation(
    "processClaims",
    claimUuids,
    clientMutationLabel,
    clientMutationDetails
  );
  var requestedDateTime = new Date();
  claims.forEach(c => c.clientMutationId = mutation.clientMutationId);
  console.log('forrrrr p', mutation.payload)
  return graphql(
    mutation.payload,
    ['CLAIM_MUTATION_REQ', 'CLAIM_PROCESS_CLAIMS_RESP', 'CLAIM_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      clientMutationDetails: !!clientMutationDetails ? JSON.stringify(clientMutationDetails) : null,
      requestedDateTime
    }
  )
}


export function forward(claims, clientMutationLabel, clientMutationDetails = null) {
  let claimUuids = `uuids: ["${claims.map(c => c.uuid).join("\",\"")}"]`

  let mutation = formatMutation(
    "forwardClaims",
    claimUuids,
    clientMutationLabel,
    clientMutationDetails
  );
  var requestedDateTime = new Date();
  claims.forEach(c => c.clientMutationId = mutation.clientMutationId);
  console.log('forrrrr', mutation.payload)
  return graphql(
    mutation.payload,
    ['CLAIM_MUTATION_REQ', 'CLAIM_FORWARD_CLAIMS_RESP', 'CLAIM_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      clientMutationDetails: !!clientMutationDetails ? JSON.stringify(clientMutationDetails) : null,
      requestedDateTime
    }
  )
}

export function claimHealthFacilitySet(healthFacility) {
  return dispatch => {
    dispatch({ type: 'CLAIM_EDIT_HEALTH_FACILITY_SET', payload: healthFacility })
  }
}

export function print() {
  return dispatch => {
    dispatch({ type: 'CLAIM_PRINT' })
  }
}

export function generate(uuid) {
  var url = new URL(`${window.location.origin}${baseApiUrl}/claim/print/`);
  url.search = new URLSearchParams({ uuid });
  return (dispatch) => {
    return fetch(url)
      .then(response => response.blob())
      .then(blob => openBlob(blob, `${_uuid.uuid()}.pdf`, "pdf"))
      .then(e => dispatch({ type: 'CLAIM_PRINT_DONE' }))
  }
}
