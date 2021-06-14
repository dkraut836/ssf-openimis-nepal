from django.db.models import Q
from django.core.exceptions import PermissionDenied
import graphene
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField

from .models import Insuree, Photo, Gender, Family, FamilyType,InsureePolicy
from policy.models import Policy,Product
from .apps import InsureeConfig
from core import prefix_filterset, filter_validity, ExtendedConnection
from django.utils.translation import gettext as _
import sys
import requests
from datetime import datetime
from sosys.models import Employer,InsureeEmployer
from location.models import Location
import os
import base64
from datauri import DataURI
from mimetypes import guess_extension, guess_type
class GenderGQLType(DjangoObjectType):
    class Meta:
        model = Gender
        filter_fields = {
            "code": ["exact"]
        }


class PhotoGQLType(DjangoObjectType):
    photo_path = graphene.String()
    class Meta:
        model = Photo


class FamilyTypeGQLType(DjangoObjectType):
    class Meta:
        model = FamilyType


class FamilyGQLType(DjangoObjectType):
    class Meta:
        model = Family

import os
class InsureeGQLType(DjangoObjectType):
    age = graphene.Int(source='age')


    base_path = graphene.String()

    class Meta:
        model = Insuree
        filter_fields = {
            "chf_id": ["exact", "istartswith"],
            "last_name": ["exact", "istartswith", "icontains", "iexact"],
            "other_names": ["exact", "istartswith", "icontains", "iexact"],
            **prefix_filterset("gender__", GenderGQLType._meta.filter_fields)
        }
        interfaces = (graphene.relay.Node,)
        connection_class = ExtendedConnection

    @classmethod
    def get_queryset(cls, queryset, info):
        return Insuree.filter_queryset(queryset)
    def resolve_base_path(self,info):
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        data=''
        if self.photo:
            a = os.path.join(BASE_DIR, self.photo.folder + '' + self.photo.filename)
            if os.path.exists(a):
                uri = DataURI.from_file(a)
                with open(a, 'rb') as binary_file:
                    binary_file_data = binary_file.read()
                base64_encoded_data = base64.b64encode(binary_file_data)
                base64_message = base64_encoded_data.decode('utf-8')
                data = 'data:'+uri.mimetype+';base64,'+base64_message
        return data

class CustomInsureeSearchException(Exception):
    pass

class Query(graphene.ObjectType):
    insurees = DjangoFilterConnectionField(InsureeGQLType)
    insuree = graphene.relay.node.Field(
        InsureeGQLType,
        chfId=graphene.String(required=True),
        validity=graphene.Date()
    )
    insuree_family_members = graphene.List(
        InsureeGQLType,
        chfId=graphene.String(required=True),
        validity=graphene.Date()
    )

    @staticmethod
    def _resolve_insuree(info, **kwargs):
        if not info.context.user.has_perms(InsureeConfig.gql_query_insurees_perms):
            raise PermissionDenied(_("unauthorized"))
        if bool(kwargs.get('chfId').strip()):
            try:
                x = Insuree.objects.get(
                    Q(chf_id=kwargs.get('chfId')),
                    *filter_validity(**kwargs)
                )
                # getInsureeDetails(**kwargs)
                return x
            except Insuree.DoesNotExist:
                y = Query.getInsureeDetails(**kwargs)
                if y:
                    return Insuree.objects.get(
                        Q(chf_id=kwargs.get('chfId')),
                        *filter_validity(**kwargs)
                    )
                else:
                    raise CustomInsureeSearchException("Insuree not found")

    def parse_sosys_date(date_str,format="%m/%d/%Y"):
        a =  date_str.split(" ")
        formatted_date = datetime.strptime(a[0], format).strftime('%Y-%m-%d')
        return formatted_date


    def getInsureeDetails(chfId):
        # return False
        base_url = os.getenv("BASE_API_URL")
        url = base_url+str("auth/login")
        payload = "{\n\t'UserId':'% s',\n\t'Password':'% s',\n\t'wsType':'% s'\n}" % (os.getenv("API_USER"), os.getenv("API_PASSWORD"), os.getenv("API_WSTYPE"))
        headers = {
        'Content-Type': 'application/json'
        }
        response = requests.request("POST", url, headers=headers, data=payload, verify=False)
        token = response.json()
        fhir_url = "health/GetContributorFhir/"
        url = base_url+str(fhir_url)+str(chfId)
        payload = {}
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+token["token"]
        }
        resp = requests.request("GET", url, headers=headers, data=payload, verify = False)

        respData = resp.json()
        if respData["IsSucess"]:
            print(respData["ResponseData"])
            x = (respData["ResponseData"])
            genderMFO= Gender.objects.get(code='M') if x["gender"]=='male' else (Gender.objects.get(code='F') if x["gender"]=='female' else Gender.objects.get(code='O'))
            insureereturn = Insuree.objects.create(
                chf_id=x["id"],
                last_name= x["name"][0]["family"],
                other_names=x["name"][0]["given"][0]+" "+x["name"][0]["given"][1],
                gender= genderMFO,
                head=True,
                card_issued=False,
                email=x['telecom'][0]['value'],
                dob=Query.parse_sosys_date(x["birthDate"]),
                offline=False,
                current_address=x['address'][0]['text'],
                current_village=0,
                validity_from=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),audit_user_id=0)

            family_type = FamilyType.objects.get(code='H')
            familyreturn = Family.objects.create(
                location = Location.objects.get(id=3348),
                head_insuree = insureereturn,
                family_type = family_type,
                validity_from = datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                audit_user_id = 2,
                poverty= False,

            )
            insureereturn.family = familyreturn
            insureereturn.save()
            policy_medical = Query.create_policy(insureereturn, 'SSF0001', familyreturn,x['extension'])
            Query.create_insuree_policy(insureereturn,policy_medical)
            policy_accident = Query.create_policy(insureereturn, 'SSF0002', familyreturn,x['extension'])
            Query.create_insuree_policy(insureereturn,policy_accident)

            if "contact" in x:
                for dep in x["contact"]:
                    genderMFO = Gender.objects.get(code='M') if dep["gender"] == 'male' else (
                        Gender.objects.get(code='F') if dep["gender"] == 'female' else Gender.objects.get(
                            code='O'))
                    familyInsureereturn = Insuree.objects.create(
                        chf_id="S"+x["id"],
                        last_name= dep["name"]["family"],
                        other_names=dep["name"]["given"][0],
                        family = familyreturn,
                        gender= genderMFO,
                        head=False,
                        card_issued=True,
                        dob="1111-01-01",
                        offline=False,
                        current_address=x['address'][0]['text'],
                        current_village=0,
                        validity_from=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                        audit_user_id=1
                    )
                    Query.create_insuree_policy(familyInsureereturn, policy_medical)
                    Query.create_insuree_policy(familyInsureereturn, policy_accident)

            if 'link' in x:
                for emp in x["link"]:

                    iid = emp["other"]["identifier"]["value"]
                    empreturn = ''
                    try:
                        empreturn = Employer.objects.get(E_SSID=iid)
                    except Employer.DoesNotExist:
                        print("empreturn",empreturn)
                        namee = emp["other"]["extension"][0]["valueString"]
                        emalli = emp["other"]["extension"][1]["valueString"]
                        empreturn = Employer.objects.create(E_SSID = iid,EmployerNameEng = namee,EmployerNameNep = namee, AlertSource = "email", AlertSourceVal = emalli, Status = "A")
                    print("Inside")
                    InsureeEmployer.objects.create(employer= empreturn , insuree = insureereturn)
            
            if 'photo' in x:
                uri = x["photo"][0]["url"]
                ext = guess_extension(guess_type(uri)[0])
                photofileName = x["id"]+"_E00001_"+datetime.now().strftime('%Y%m%d')+"_0.0_0.0"+ext
                insureeid = x["id"]
                Photofolder = 'Images\\Updated\\'
                photodate = datetime.now().strftime('%Y-%m-%d')
                validityFrom = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                officerid = 3
                audituserid = -1
                # Create File in folder
                BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                path = os.path.join(BASE_DIR,Photofolder,photofileName)
                header, encoded = uri.split(",", 1)
                base64_img_bytes = encoded.encode('utf-8')
                with open(path, 'wb') as file_to_save:
                    decoded_image_data = base64.decodebytes(base64_img_bytes)
                    file_to_save.write(decoded_image_data)
                pho = Photo.objects.create(
                    insuree_id=insureereturn.id,
                    chf_id=x["id"],
                    folder=Photofolder,
                    validity_from=validityFrom,
                    filename=photofileName,
                    date=photodate,
                    officer_id=officerid,
                    audit_user_id=audituserid
                )
                insureereturn.photo = pho
                insureereturn.photo_date = pho.date
                insureereturn.save()
            return True
        else:
            raise CustomInsureeSearchException(respData["Message"])
            return False


    def create_policy(insuree,product_id,family,extension):
        policyRet = Policy.objects.create(
            family=family,
            # enroll_date=datetime.now().strftime('%Y-%m-%d'),
            enroll_date=Query.parse_sosys_date(extension[1]["valueString"],'%Y.%m.%d'),
            # start_date=datetime.now().strftime('%Y-%m-%d'),
            start_date=Query.parse_sosys_date(extension[1]["valueString"],'%Y.%m.%d'),
            product=Product.objects.get(code=product_id,validity_to=None),
            audit_user_id=1,
            # effective_date=datetime.now().strftime('%Y-%m-%d'),
            effective_date=Query.parse_sosys_date(extension[1]["valueString"],'%Y.%m.%d'),
            expiry_date=Query.parse_sosys_date(extension[2]["valueString"]),
            status=2,
            value=700000.00,
            stage='N'
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

    def resolve_insurees(self, info, **kwargs):
        if not info.context.user.has_perms(InsureeConfig.gql_query_insurees_perms):
            raise PermissionDenied(_("unauthorized"))

    def resolve_insuree(self, info, **kwargs):
        if not info.context.user.has_perms(InsureeConfig.gql_query_insuree_perms):
            raise PermissionDenied(_("unauthorized"))
        try:
            return Query._resolve_insuree(info=info, **kwargs)
        except Insuree.DoesNotExist:
            return None

    def resolve_insuree_family_members(self, info, **kwargs):
        if not info.context.user.has_perms(InsureeConfig.gql_query_insurees_perms):
            raise PermissionDenied(_("unauthorized"))
        insuree = Query._resolve_insuree(info=info, **kwargs)
        return Insuree.objects.filter(
            Q(family=insuree.family),
            *filter_validity(**kwargs)
        ).order_by('-head')
