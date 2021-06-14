import graphene
from django.core.exceptions import PermissionDenied
from .services import ByInsureeRequest, ByInsureeService
from .services import EligibilityRequest, EligibilityService
from .apps import PolicyConfig
from django.utils.translation import gettext as _
from datetime import datetime

from insuree.models import InsureePolicy,Insuree
from .models import Policy
from product.models import Product
class PolicyByInsureeItemGQLType(graphene.ObjectType):
    # policy_id = graphene.Int()
    # policy_value = graphene.Float()
    # premiums_amount = graphene.Float()
    # balance = graphene.Float()
    product_code = graphene.String()
    product_name = graphene.String()
    expiry_date = graphene.Date()
    status = graphene.String()
    ded = graphene.Float()
    ded_in_patient = graphene.Float()
    ded_out_patient = graphene.Float()
    ceiling = graphene.Float()
    ceiling_in_patient = graphene.Float()
    ceiling_out_patient = graphene.Float()


class PoliciesByInsureeGQLType(graphene.ObjectType):
    items = graphene.List(PolicyByInsureeItemGQLType)


class EligibilityGQLType(graphene.ObjectType):
    prod_id = graphene.String()
    total_admissions_left = graphene.Int()
    total_visits_left = graphene.Int()
    total_consultations_left = graphene.Int()
    total_surgeries_left = graphene.Int()
    total_deliveries_left = graphene.Int()
    total_antenatal_left = graphene.Int()
    consultation_amount_left = graphene.Float()
    surgery_amount_left = graphene.Float()
    delivery_amount_left = graphene.Float()
    hospitalization_amount_left = graphene.Float()
    antenatal_amount_left = graphene.Float()
    min_date_service = graphene.types.datetime.Date()
    min_date_item = graphene.types.datetime.Date()
    service_left = graphene.Int()
    item_left = graphene.Int()
    is_item_ok = graphene.Boolean()
    is_service_ok = graphene.Boolean()

class CustomInsureeSearchException(Exception):
    pass
class Query(graphene.ObjectType):
    # TODO: refactoring
    # A Policy is bound to a Family
    # ... and should not make the assumption that a Family
    # is made of 'Insurees'
    # This requires to refactor the ByInsureeService
    policies_by_insuree = graphene.Field(
        PoliciesByInsureeGQLType,
        chfId=graphene.String(required=True),
        claimDate = graphene.String()
    )
    # TODO: refactoring
    # Eligibility is calculated for a Policy
    # ... which is bound to a Family (not an Insuree)
    # This requires to refactor the EligibilityService
    policy_eligibility_by_insuree = graphene.Field(
        EligibilityGQLType,
        chfId=graphene.String(required=True)
    )
    policy_item_eligibility_by_insuree = graphene.Field(
        EligibilityGQLType,
        chfId=graphene.String(required=True),
        itemCode=graphene.String(required=True)
    )
    policy_service_eligibility_by_insuree = graphene.Field(
        EligibilityGQLType,
        chfId=graphene.String(required=True),
        serviceCode=graphene.String(required=True),
    )

    @staticmethod
    def _to_policy_by_insuree_item(item):
        return PolicyByInsureeItemGQLType(
            # TODO: return the policy (summary) info
            # Requires to denormalize database for the premiums_amount
            # ---
            # policy_id=item.policy_id,
            # policy_value=item.policy_value,
            # premiums_amount=item.premiums_amount,
            # balance=item.balance,
            # ---
            product_code=item.product_code,
            product_name=item.product_name,
            expiry_date=item.expiry_date,
            status=item.status,
            ded=item.ded,
            ded_in_patient=item.ded_in_patient,
            ded_out_patient=item.ded_out_patient,
            ceiling=item.ceiling,
            ceiling_in_patient=item.ceiling_in_patient,
            ceiling_out_patient=item.ceiling_out_patient
        )

    def resolve_policies_by_insuree(self, info, **kwargs):
        #if not info.context.user.has_perms(PolicyConfig.gql_query_policies_by_insuree_perms):
        #    raise PermissionDenied(_("unauthorized"))
        claimDate = kwargs.get('claimDate')
        if not claimDate:
            claimDate = datetime.now().strftime('%Y-%m-%d')
        print(claimDate)
        data = Query.getEligibilityFromSosys(pssid=kwargs.get('chfId'),claimDate = claimDate)
        req = ByInsureeRequest(chf_id=kwargs.get('chfId'))
        insureeFamily = Insuree.objects.all().filter(chf_id=kwargs.get('chfId'),validity_to =None)[0].family
        insuree_obj = Insuree.objects.all().filter(chf_id=kwargs.get('chfId'),validity_to =None)[0]
        for i in data:
            # Medical SSF0001
            # Accident SSF0002
            if i['Status'] == 'cancelled':
                print(i['ProductCode']+' cancel')
                Query.activate_deactivate_policy(i['ProductCode'],insureeFamily,Policy.STATUS_SUSPENDED,i['ExpiryDate'],insuree_obj)
            elif i['Status'] == 'active':
                print(i['ProductCode']+'Active')
                Query.activate_deactivate_policy(i['ProductCode'],insureeFamily,Policy.STATUS_ACTIVE,i['ExpiryDate'],insuree_obj)
        res = ByInsureeService(user=info.context.user).request(req)
        return PoliciesByInsureeGQLType(
            items=tuple(map(
                lambda x: Query._to_policy_by_insuree_item(x), res.items))
        )
    

    @staticmethod
    def activate_deactivate_policy(product_code,insureeFamily,status,expiry_date,insuree_obj):
        prod = Product.objects.get(code=product_code,validity_to__isnull = True)
        insureePolicy = Policy.objects.get(family=insureeFamily, validity_to=None, product=prod)
        if insureePolicy:
            #try:
            print(insureePolicy.expiry_date < datetime.now())
            if insureePolicy.expiry_date < datetime.now():
                # Expire existingpolicy
                insureePolicy.status = Policy.STATUS_EXPIRED
                insureePolicy.validity_to =  datetime.now()
                insureePolicy.save()
                # Create new Policy
                new_policy = Query.create_policy(insuree_obj,product_code,insureeFamily,expiry_date,insureePolicy.effective_date,status)
                # Update Insuree policy policy field to new one
                insuree_policies = InsureePolicy.objects.all().filter(policy=insureePolicy,validity_to__isnull=True)
                for insuree_policy in insuree_policies:
                    insuree_policy.policy = new_policy
                    insuree_policy.expiry_date = expiry_date
                    insuree_policy.save()
            else:
                insureePolicy.status = status
                insureePolicy.save()
            #except Exception as e:
            #    print(e)

    # Get Eligibilty of contributor for product from sosys
    @staticmethod
    def getEligibilityFromSosys(claimDate,pssid=None):
        processed_ssid = ''.join(filter(lambda i: i.isdigit(), pssid))
        data = []
        if pssid:
            import requests
            import os
            try:
                base_url = os.getenv("BASE_API_URL")
                url = base_url + str("auth/login")
                payload = "{\n\t'UserId':'% s',\n\t'Password':'% s',\n\t'wsType':'% s'\n}" % (
                os.getenv("API_USER"), os.getenv("API_PASSWORD"), os.getenv("API_WSTYPE"))
                headers = {
                    'Content-Type': 'application/json'
                }
                response = requests.request("POST", url, headers=headers, data=payload, verify=False)
                token = response.json()
                fhir_url = "health/GetContributorStatusFhir/"
                url = base_url + str(fhir_url) + str(processed_ssid)+'/'+str(claimDate)
                payload = {}
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token["token"]
                }
                resp = requests.request("GET", url, headers=headers, data=payload, verify=False)

                respData = resp.json()
                print(respData)
                if respData["IsSucess"]:
                    data = Query.CoverageFhirToIMISobj(respData['ResponseData'])
                if not data:
                    for x in range(2):
                        data+=[{'ProductCode':'SSF000'+str((x+1)),
                                'Status':'Fail to get Status'}]
                return data
            except Exception as e:
                # raise CustomInsureeSearchException('Fail to get Contributor status from SOSYS')
                print(e)
                return data
    @staticmethod
    def CoverageFhirToIMISobj(res=None):
        data = []
        if res:
            for coverage in res:
                data+=[
                    {
                        'ProductCode':coverage['identifier'][1]['value'],
                        'Status':coverage['status'],
                        'ExpiryDate':Query.parse_sosys_date(coverage["extension"][0]["valueString"])
                    }
                    ]
        return data

    @staticmethod
    def parse_sosys_date(date_str,format="%m/%d/%Y"):
        a =  date_str.split(" ")
        formatted_date = datetime.strptime(a[0], format).strftime('%Y-%m-%d')
        return formatted_date

    def create_policy(insuree,product_code,family,expiry_date,effective_date,status):
        policyRet = Policy.objects.create(
            family=family,
            # enroll_date=datetime.now().strftime('%Y-%m-%d'),
            enroll_date=effective_date,
            # start_date=datetime.now().strftime('%Y-%m-%d'),
            start_date=effective_date,
            product=Product.objects.get(code=product_code,validity_to=None),
            audit_user_id=1,
            # effective_date=datetime.now().strftime('%Y-%m-%d'),
            effective_date=effective_date,
            expiry_date=expiry_date,
            status=status,
            value=700000.00,
            stage=Policy.STAGE_RENEWED
        )
        return policyRet

    def create_insuree_policy(insuree,policy):
        insureePolicyRet = InsureePolicy.objects.create(
            insuree=insuree,
            policy=policy,
            audit_user_id=1,
            enrollment_date=policy.enroll_date,
            start_date=policy.enroll_date,
            effective_date=policy.enroll_date,
            # expiry_date=datetime.now().strftime('%Y-%m-%d'),
            expiry_date=policy.expiry_date,
            validity_from=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            # validity_to=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        )
    @staticmethod
    def _resolve_policy_eligibility_by_insuree(user, req):
        res = EligibilityService(user=user).request(req)
        return EligibilityGQLType(
            prod_id=res.prod_id,
            total_admissions_left=res.total_admissions_left,
            total_visits_left=res.total_visits_left,
            total_consultations_left=res.total_consultations_left,
            total_surgeries_left=res.total_surgeries_left,
            total_deliveries_left=res.total_deliveries_left,
            total_antenatal_left=res.total_antenatal_left,
            consultation_amount_left=res.consultation_amount_left,
            surgery_amount_left=res.surgery_amount_left,
            delivery_amount_left=res.delivery_amount_left,
            hospitalization_amount_left=res.hospitalization_amount_left,
            antenatal_amount_left=res.antenatal_amount_left,
            min_date_service=res.min_date_service,
            min_date_item=res.min_date_item,
            service_left=res.service_left,
            item_left=res.item_left,
            is_item_ok=res.is_item_ok,
            is_service_ok=res.is_service_ok
        )

    def resolve_policy_eligibility_by_insuree(self, info, **kwargs):
        if not info.context.user.has_perms(PolicyConfig.gql_query_eligibilities_perms):
            raise PermissionDenied(_("unauthorized"))
        req = EligibilityRequest(
            chf_id=kwargs.get('chfId')
        )
        return Query._resolve_policy_eligibility_by_insuree(
            user=info.context.user,
            req=req
        )

    def resolve_policy_item_eligibility_by_insuree(self, info, **kwargs):
        if not info.context.user.has_perms(PolicyConfig.gql_query_eligibilities_perms):
            raise PermissionDenied(_("unauthorized"))
        req = EligibilityRequest(
            chf_id=kwargs.get('chfId'),
            item_code=kwargs.get('itemCode')
        )
        return Query._resolve_policy_eligibility_by_insuree(
            user=info.context.user,
            req=req
        )

    def resolve_policy_service_eligibility_by_insuree(self, info, **kwargs):
        if not info.context.user.has_perms(PolicyConfig.gql_query_eligibilities_perms):
            raise PermissionDenied(_("unauthorized"))
        req = EligibilityRequest(
            chf_id=kwargs.get('chfId'),
            service_code=kwargs.get('serviceCode')
        )
        return Query._resolve_policy_eligibility_by_insuree(
            user=info.context.user,
            req=req
        )
