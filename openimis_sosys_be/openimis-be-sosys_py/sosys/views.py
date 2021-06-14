from django.db.models.expressions import Exists, OuterRef
from django.db.models.lookups import IsNull
from django.db.models.query import EmptyQuerySet
from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import status
from api_fhir_r4.converters import OperationOutcomeConverter
from rest_framework.views import APIView
from rest_framework.response import Response
from api_fhir_r4.permissions import FHIRApiClaimPermissions, FHIRApiCoverageEligibilityRequestPermissions, \
    FHIRApiCoverageRequestPermissions, FHIRApiCommunicationRequestPermissions, FHIRApiPractitionerPermissions, \
    FHIRApiHFPermissions, FHIRApiInsureePermissions, FHIRApiMedicationPermissions, FHIRApiConditionPermissions, \
    FHIRApiActivityDefinitionPermissions, FHIRApiHealthServicePermissions
from api_fhir_r4.serializers import PatientSerializer,ConditionSerializer,MedicationSerializer,HealthcareServiceSerializer,ActivityDefinitionSerializer
from .serializers import(
    ClaimRecommendSerializer,
    AddressSerializer,
    DependentSerializer,
    EmployerSerializer,
    InsureeEmployerSerializer,
    InsureeSerializer,
    BankSerializer,
    BankBranchSerializer,
    HospitalSerializer,
    ItemSerializer,
    ServiceSerializer,
    DiagnosisSerializer,
    ClaimDocumentsMasterSerializer
)
from rest_framework.authentication import SessionAuthentication
from location.models import HealthFacility
from medical.models import Item, Service, Diagnosis
from insuree.models import Insuree as Insureee
from insuree.schema import Query
from product.models import Product
from .models import (
    ClaimRecommend,
    Address,
    Dependent,
    Employer,
    Insuree,
    InsureeEmployer,
    ClaimDocumentsMaster,
    Bank,
    BankBranch
)
from datauri import DataURI
from claim.models import  Claim,ClaimAttachment
from rest_framework import generics, mixins , viewsets
#post claim 
class APIPostClaim(generics.GenericAPIView, mixins.ListModelMixin, mixins.CreateModelMixin):
    serializer_class = ClaimRecommendSerializer
    queryset = Claim.objects.all()
    permission_classes = (FHIRApiClaimPermissions,)
    def post(self, request):
        x = request.data
        print('data',x)
        try:
            claim = Claim.objects.all().filter(code = x["Identifier"][0]["Value"])
            print('claaaaaim',x["Diagnosis"][0]["ElementId"] is None)
            print(x["Extension"][14]["Value"]["Value"])
            if not claim:
                insureeeee = Insureee.objects.get(chf_id=x["Patient"]["Identifier"]["Value"],validity_to=None)
                emp = Employer.objects.get(E_SSID=x["Extension"][12]["Value"]["Value"])
                hff = HealthFacility.objects.get(code=x["Extension"][14]["Value"]["Value"],validity_to=None) if x["Extension"][14]["Value"]["Value"] is not None else None
                hft = HealthFacility.objects.get(code=x["Extension"][17]["Value"]["Value"],validity_to=None) if x["Extension"][17]["Value"]["Value"] is not None else None
                health_facility = HealthFacility.objects.get(uuid = x["Facility"]["Identifier"]["Value"])
                main_diag = Diagnosis.objects.get(code=x["Diagnosis"][0]["ElementId"],validity_to=None)
                product = Product.objects.get(code = x["Insurance"][0]["Coverage"]["Identifier"]["Value"]) if x["Insurance"][0]["Coverage"]["Identifier"]["Value"] is not None else None
                createdClaim = Claim.objects.create(
                    code=x["Identifier"][0]["Value"],
                    date_from=x["BillablePeriod"]["Start"],
                    date_to=x["BillablePeriod"]["End"],
                    date_claimed=x["Created"],
                    health_facility=health_facility,
                    icd=main_diag,
                    icd_1=Diagnosis.objects.get(code=x["Diagnosis"][1]["ElementId"],validity_to=None) if x["Diagnosis"][1]["ElementId"] is not None else None,
                    icd_2=Diagnosis.objects.get(code=x["Diagnosis"][2]["ElementId"],validity_to=None) if x["Diagnosis"][2]["ElementId"] is not None else None,
                    icd_3=Diagnosis.objects.get(code=x["Diagnosis"][3]["ElementId"],validity_to=None) if x["Diagnosis"][3]["ElementId"] is not None else None,
                    icd_4=Diagnosis.objects.get(code=x["Diagnosis"][4]["ElementId"],validity_to=None) if x["Diagnosis"][4]["ElementId"] is not None else None,
                    insuree= insureeeee,
                    claimed=x["Total"]["Value"],
                    visit_type=x['Type']["Text"],
                    capability=x["Extension"][0]["Value"]["Value"],
                    explanation=x["Extension"][1]["Value"]["Value"],
                    is_admitted=x["Extension"][2]["Value"]["Value"],
                    accident_description=x["Extension"][3]["Value"]["Value"],
                    injured_body_part=x["Extension"][4]["Value"]["Value"],
                    reason_of_sickness=x["Extension"][5]["Value"]["Value"],
                    condition_of_wound=x["Extension"][6]["Value"]["Value"],
                    cancer=x["Extension"][7]["Value"]["Value"],
                    heart_attack=x["Extension"][8]["Value"]["Value"],
                    hiv=x["Extension"][9]["Value"]["Value"],
                    high_bp=x["Extension"][10]["Value"]["Value"],
                    diabetes=x["Extension"][11]["Value"]["Value"],
                    employer=emp,
                    refer_from_date=x["Extension"][13]["Value"]["Value"],
                    refer_from_hf_other=hff,
                    discharge_type=x["Extension"][15]["Value"]["Value"],
                    refer_to_date=x["Extension"][16]["Value"]["Value"],
                    refer_to_health_facility=hft,
                    discharge_summary=x["Extension"][18]["Value"]["Value"],
                    status=x["Extension"][19]["Value"]["Value"],
                    audit_user_id = -1,
                    product=product
                )
                return Response(status=status.HTTP_201_CREATED,data=createdClaim.code)
            else:
                return Response(status=status.HTTP_409_CONFLICT)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST,data=e)
# get patients details
class APIGetPatientDetails(generics.GenericAPIView, mixins.UpdateModelMixin, mixins.RetrieveModelMixin,mixins.DestroyModelMixin, mixins.ListModelMixin):
    serializer_class = PatientSerializer
    permission_classes = (FHIRApiInsureePermissions,)
    lookup_field = 'chf_id'

    def get(self, request, chf_id=None):
        queryset = self.get_queryset().select_related('gender').select_related('photo').select_related(
        'family__location')
        respatient =queryset.filter(chf_id=chf_id)
        serializer = PatientSerializer(respatient , many=True)
        print("timqq", respatient)
        if not respatient:
            if Query.getInsureeDetails(chf_id):
                print("hitting")
                queryset = self.get_queryset().select_related('gender').select_related('photo').select_related(
                'family__location')
                serializer = PatientSerializer(queryset.filter(chf_id=chf_id), many=True)
        return Response(serializer.data)

    def get_queryset(self):
        return Insureee.objects.all()

# get Claim Recommended

class APIGetClaimRecommend(generics.GenericAPIView, mixins.ListModelMixin, mixins.CreateModelMixin):
    serializer_class = ClaimRecommendSerializer
    queryset = ClaimRecommend.objects.all()
    permission_classes = (FHIRApiClaimPermissions,)

    def post(self, request):
        try:
            claim_uuid = request.data.get('claim_uuid')
            claim_instance = Claim.objects.filter(uuid = claim_uuid)[0]
            claim_id = claim_instance.id
            request.data.update({'claim': claim_id})
            documents = request.data.get('RecommendDoc')
            for document in documents:
                uri = DataURI(document['document'])
                document['claim_id'] = claim_id
                master_id = document['masterDocumentId']
                document.pop('masterDocumentId')
                document['masterDocument_id'] = master_id
                # masterDocIns = ClaimDocumentsMaster.objects.filter(id=master_id)
                document['mime'] = uri.mimetype
                document['document'] = document['document'].split(",")[1]
                from core import datetime
                now = datetime.datetime.now()
                document['validity_from'] = now
                document['documentFrom'] = 'E'
                ClaimAttachment.objects.create(**document)
            claim_instance.status = 6
            claim_instance.save()
            return self.create(request)
            # return Response(status=status.HTTP_202_ACCEPTED)
        except Claim.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def get(self, request):
        return self.list(self, request)


class APIGetClaimRecommendDetails(generics.GenericAPIView, mixins.UpdateModelMixin, mixins.RetrieveModelMixin,
                            mixins.DestroyModelMixin, mixins.ListModelMixin):
    serializer_class = ClaimRecommendSerializer
    queryset = ClaimRecommend.objects.all()
    permission_classes = (FHIRApiClaimPermissions,)
    lookup_field = 'claim_id'

    def get(self, request, claim_id=None):
        if claim_id:
            return self.retrieve(request, claim_id)

    def put(self, request, claim_id=None):
        return self.update(request, claim_id)

    def delete(self, request, claim_id):
        return self.destroy(request, claim_id)

# get Hospitals

class APIGetHospitals(generics.GenericAPIView, mixins.ListModelMixin, mixins.CreateModelMixin):
    serializer_class = HealthcareServiceSerializer
    queryset = HealthFacility.objects.all()
    def get(self, request):
            return self.list(self,request)

class APIGetHospitalDetails(generics.GenericAPIView, mixins.UpdateModelMixin, mixins.RetrieveModelMixin, mixins.DestroyModelMixin, mixins.ListModelMixin):
    serializer_class = HealthcareServiceSerializer
    queryset = HealthFacility.objects.all()
    permission_classes = (FHIRApiHealthServicePermissions,)
    lookup_field = 'uuid'

    def get(self, request, uuid=None):
        if uuid:
            return self.retrieve(request,uuid)
    
# get Items
class APIGetItems(generics.GenericAPIView, mixins.ListModelMixin, mixins.CreateModelMixin):
    serializer_class = MedicationSerializer
    queryset = Item.objects.all()
    def get(self, request):
            return self.list(self,request)

class APIGetItemDetails(generics.GenericAPIView, mixins.UpdateModelMixin, mixins.RetrieveModelMixin, mixins.DestroyModelMixin, mixins.ListModelMixin):
    serializer_class = MedicationSerializer
    queryset = Item.objects.all()
    lookup_field = 'uuid'
    permission_classes = (FHIRApiMedicationPermissions,)

    def get(self, request, uuid=None):
        if uuid:
            return self.retrieve(request,uuid)

# get Services


class APIGetServices(generics.GenericAPIView, mixins.ListModelMixin, mixins.CreateModelMixin):
    serializer_class = ActivityDefinitionSerializer
    queryset = Service.objects.all()
    permission_classes = (FHIRApiActivityDefinitionPermissions,)
    def get(self, request):
            return self.list(self,request)

class APIGetServiceDetails(generics.GenericAPIView, mixins.UpdateModelMixin, mixins.RetrieveModelMixin, mixins.DestroyModelMixin, mixins.ListModelMixin):
    serializer_class = ActivityDefinitionSerializer
    queryset = Service.objects.all()
    permission_classes = (FHIRApiActivityDefinitionPermissions,)
    lookup_field = 'uuid'

    def get(self, request, uuid=None):
        if uuid:
            return self.retrieve(request,uuid)
 
# get Diagnosis

class APIGetDiagnosis(generics.GenericAPIView, mixins.ListModelMixin, mixins.CreateModelMixin):
    serializer_class = ConditionSerializer
    queryset = Diagnosis.objects.all()
    permission_classes = (FHIRApiConditionPermissions,)
    def get(self, request):
            return self.list(self,request)

class APIGetDiagnosisDetails(generics.GenericAPIView, mixins.UpdateModelMixin, mixins.RetrieveModelMixin, mixins.DestroyModelMixin, mixins.ListModelMixin):
    #serializer_class = ConditionSerializer
    serializer_class = ConditionSerializer
    queryset = Diagnosis.objects.all()
    permission_classes = (FHIRApiConditionPermissions,)
    lookup_field = 'id'

    def get(self, request, id=None):
        if id:
            return self.retrieve(request,id)
        
# address

def get_objectAddress(self, AddressId):
        try:
            return Address.objects.all().filter(AddressId=AddressId)
        except Address.DoesNotExist:
            return HttpResponse(status=status.HTTP_404_NOT_FOUND)


class GenericAPIAddress(generics.GenericAPIView, mixins.ListModelMixin, mixins.CreateModelMixin):
    serializer_class = AddressSerializer
    queryset = Address.objects.all()
    lookup_field = 'AddressId'

    def post(self, request):
        return self.create(request)

    def get(self, request, AddressId=None):
        if AddressId:
            return self.retrieve(request, AddressId)
        else:
            return self.list(self,request)

class GenericAPIAddressDetails(generics.GenericAPIView, mixins.UpdateModelMixin, mixins.RetrieveModelMixin, mixins.DestroyModelMixin, mixins.ListModelMixin):
    serializer_class = AddressSerializer
    queryset = Address.objects.all()
    lookup_field = 'AddressId'

    def put(self, request, AddressId=None):
        return self.update(request, AddressId)

    def delete(self, request, AddressId):
        return self.destroy(request, AddressId)

    def get(self, request, AddressId=None):
        if AddressId:
            # return get_objectAddress(request, AddressId)
            # if AddressId:
            adds = get_objectAddress(self, AddressId)
            serializer = AddressSerializer(adds, many=True)
            return Response(serializer.data)
        else:
            return self.list(request, AddressId)

# Contributor only
def get_objectContributor(self, p_ssid):
        try:
            return Insuree.objects.all().filter(p_ssid=p_ssid)
        except Insuree.DoesNotExist:
            return HttpResponse(status=status.HTTP_404_NOT_FOUND)

class APIContributorList(generics.GenericAPIView, mixins.ListModelMixin, mixins.CreateModelMixin):
    serializer_class = InsureeSerializer
    queryset = Insuree.objects.select_related('AddressId')

    def post(self, request):
        return self.create(request)

    def get(self, request):
        return self.list(self,request)
        # Employees = Insuree.objects.all()
        # serializer = InsureeSerializer(Employees, many=True)
        # return Response(serializer.data)

class APIContributorDetails(generics.GenericAPIView, mixins.UpdateModelMixin, mixins.RetrieveModelMixin, mixins.DestroyModelMixin, mixins.ListModelMixin):
    serializer_class = InsureeSerializer
    queryset = Insuree.objects.select_related('addresses')
    # queryset = Insuree.objects.all()
    lookup_field = 'p_ssid'

    def put(self, request, p_ssid=None):
        return self.update(request, p_ssid)

    def delete(self, request, p_ssid):
        return self.destroy(request, p_ssid)

    def get(self, request, p_ssid=None):
        if p_ssid:
            adds = get_objectContributor(self, p_ssid)
            serializer = InsureeSerializer(adds, many=True)
            return Response(serializer.data)
        else:
            return self.list(request, p_ssid)

# ContributorEmployee only
def get_objectContributorEmp(self, insuree_id):
        try:
            ins = Insureee.objects.get(chf_id=insuree_id)
            xyz = InsureeEmployer.objects.all().filter(insuree_id=ins,TerminatedDate  = None)
            print("aa",xyz)
            return xyz
        except InsureeEmployer.DoesNotExist:
            return HttpResponse(status=status.HTTP_404_NOT_FOUND)


class APIContributorEmpList(generics.GenericAPIView, mixins.ListModelMixin, mixins.CreateModelMixin):
    serializer_class = InsureeEmployerSerializer
    queryset = InsureeEmployer.objects.all()

    def post(self, request):
        return self.create(request)

    def get(self, request):
        return self.list(self,request)

class APIContributorEmpDetails(generics.GenericAPIView, mixins.UpdateModelMixin, mixins.RetrieveModelMixin, mixins.DestroyModelMixin, mixins.ListModelMixin):
    serializer_class = InsureeEmployerSerializer
    queryset = InsureeEmployer.objects.all()
    lookup_field = 'insuree_id'

    def put(self, request, insuree_id=None):
        return self.update(request, insuree_id)

    def delete(self, request, insuree_id):
        return self.destroy(request, insuree_id)

    def get(self, request, insuree_id=None):
        if insuree_id:
            adds = get_objectContributorEmp(self, insuree_id)
            serializer = InsureeEmployerSerializer(adds, many=True)
            return Response(serializer.data)
        else:
            return self.list(request, insuree_id)
    
# Employer only
def get_objectEmployer(self, E_SSID):
        try:
            return Employer.objects.all().filter(E_SSID=E_SSID)
        except Employer.DoesNotExist:
            return HttpResponse(status=status.HTTP_404_NOT_FOUND)


class APIEmpList(generics.GenericAPIView, mixins.ListModelMixin, mixins.CreateModelMixin):
    serializer_class = EmployerSerializer
    queryset = Employer.objects.all()

    def post(self, request):
        return self.create(request)

    def get(self, request):
        return self.list(self,request)

class APIEmpDetails(generics.GenericAPIView, mixins.UpdateModelMixin, mixins.RetrieveModelMixin, mixins.DestroyModelMixin, mixins.ListModelMixin):
    serializer_class = EmployerSerializer
    queryset = Employer.objects.all()
    lookup_field = 'E_SSID'

    def put(self, request, E_SSID=None):
        return self.update(request, E_SSID)

    def delete(self, request, E_SSID):
        return self.destroy(request, E_SSID)

    def get(self, request, E_SSID=None):
        if E_SSID:
            adds = get_objectEmployer(self, E_SSID)
            serializer = EmployerSerializer(adds, many=True)
            return Response(serializer.data)
        else:
            return self.list(request, E_SSID)


#region Bank classes
class APIListBank(generics.GenericAPIView, mixins.ListModelMixin):
    serializer_class = BankSerializer
    queryset = Bank.objects.all().filter(Status='A')
    lookup_field = 'BankId'
    def get(self, request):
        return self.list(self, request)


class APIListBankBranch(generics.ListAPIView):
    serializer_class = BankBranchSerializer
    queryset = BankBranch.objects.select_related('Bank')
    lookup_field = 'Bank_id'

    def get(self, request,BankId = None):
        if(BankId):
            data = self.get_BankBranchList(BankId)
            if(data):
                serializer = self.serializer_class(data,many=True)
                return Response(serializer.data)
            else:
                return HttpResponse(status=status.HTTP_404_NOT_FOUND,content="404, Data not found")
        else:
            return self.list(request,BankId)


    def get_BankBranchList(self, BankId):
        try:
            return self.queryset.filter(Bank_id=BankId,Status = 'A')
        except BankBranch.DoesNotExist:
            return HttpResponse(status=status.HTTP_404_NOT_FOUND)


#endregion


#region MasterDocuments
class GetClaimDocuments(generics.GenericAPIView,mixins.ListModelMixin):
    serializer_class = ClaimDocumentsMasterSerializer
    queryset = ClaimDocumentsMaster.objects.all().filter(Status=True)
    lookup_field = 'UseBy'

    def get(self, request, useBy=None):
        try:
            useDict = {
                "applicant": "A",
                "employer": "E",
                "reviewer":"R"
            }
            a = useDict.get(useBy,None)
            query = ClaimDocumentsMaster.objects.all().filter(Status=True)
            filtered = query.filter(UseBy__contains=a)
            serializer = ClaimDocumentsMasterSerializer(filtered, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(data=str(e) ,status=status.HTTP_400_BAD_REQUEST)


#endregion