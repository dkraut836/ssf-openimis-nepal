from claim import ClaimItemSubmit, ClaimServiceSubmit
from claim.models import Claim, ClaimItem, ClaimService
from medical.models import Diagnosis, Item, Service
from insuree.models import InsureePolicy
from policy.models import Policy
from django.utils.translation import gettext
import core

from api_fhir_r4.configurations import R4IdentifierConfig, R4ClaimConfig
from api_fhir_r4.converters import BaseFHIRConverter, LocationConverter, PatientConverter, PractitionerConverter, \
    ReferenceConverterMixin, PractitionerRoleConverter
from api_fhir_r4.converters.conditionConverter import ConditionConverter
from api_fhir_r4.converters.medicationConverter import MedicationConverter
from api_fhir_r4.converters.healthcareServiceConverter import HealthcareServiceConverter
from api_fhir_r4.converters.activityDefinitionConverter import ActivityDefinitionConverter
from api_fhir_r4.converters.coverageConverter import CoverageConverter
from api_fhir_r4.models import Claim as FHIRClaim, ClaimItem as FHIRClaimItem, Period, ClaimDiagnosis, Money, \
    ImisClaimIcdTypes, ClaimSupportingInfo, Quantity, Condition, Extension, Reference, CodeableConcept, ClaimInsurance
from api_fhir_r4.utils import TimeUtils, FhirUtils, DbManagerUtils
from api_fhir_r4.exceptions import FHIRRequestProcessException

class ClaimConverter(BaseFHIRConverter, ReferenceConverterMixin):

    @classmethod
    def to_fhir_obj(cls, imis_claim):
        fhir_claim = FHIRClaim()
        cls.build_fhir_pk(fhir_claim, imis_claim.uuid)
        fhir_claim.created = imis_claim.date_claimed.isoformat()
        if imis_claim.health_facility is None:
            raise FHIRRequestProcessException(['Cannot construct a %s claim if HF is None' % (imis_claim.uuid) ])
        fhir_claim.facility = HealthcareServiceConverter.build_fhir_resource_reference(imis_claim.health_facility,'Location', imis_claim.health_facility.code+' '+imis_claim.health_facility.name )
        cls.build_fhir_identifiers(fhir_claim, imis_claim)
        if imis_claim.insuree is  None:
            raise FHIRRequestProcessException(['Cannot construct a %s claim if Insuree is None' % (imis_claim.uuid)] )
        fhir_claim.patient = PatientConverter.build_fhir_resource_reference(imis_claim.insuree, 'Patient', imis_claim.insuree.chf_id)
        cls.build_fhir_billable_period(fhir_claim, imis_claim)
        cls.build_fhir_diagnoses(fhir_claim, imis_claim)
        cls.build_fhir_total(fhir_claim, imis_claim)
        if imis_claim.admin is not None:
            fhir_claim.enterer = PractitionerConverter.build_fhir_resource_reference(imis_claim.admin, 'Practitioner')
        #else:
        #    raise FHIRRequestProcessException(['Cannot construct a %s claim if claim admin is None' %(imis_claim.uuid)] )
        cls.build_fhir_type(fhir_claim, imis_claim)
        cls.build_fhir_supportingInfo(fhir_claim, imis_claim)
        cls.build_fhir_items(fhir_claim, imis_claim)
        cls.build_fhir_provider(fhir_claim, imis_claim)
        cls.build_fhir_use(fhir_claim)
        cls.build_fhir_priority(fhir_claim)
        cls.build_fhir_status(fhir_claim)
        cls.build_fhir_insurance(fhir_claim, imis_claim)
        return fhir_claim

    @classmethod
    def to_imis_obj(cls, fhir_claim, audit_user_id):
        errors = []
        imis_claim = Claim()
        cls.build_imis_date_claimed(imis_claim, fhir_claim, errors)
        cls.build_imis_health_facility(errors, fhir_claim, imis_claim)
        cls.build_imis_identifier(imis_claim, fhir_claim, errors)
        cls.build_imis_patient(imis_claim, fhir_claim, errors)
        cls.build_imis_date_range(imis_claim, fhir_claim, errors)
        cls.build_imis_diagnoses(imis_claim, fhir_claim, errors)
        cls.build_imis_total_claimed(imis_claim, fhir_claim, errors)
        cls.build_imis_claim_admin(imis_claim, fhir_claim, errors)
        cls.build_imis_visit_type(imis_claim, fhir_claim)
        cls.build_imis_supportingInfo(imis_claim, fhir_claim)
        cls.build_imis_submit_items_and_services(imis_claim, fhir_claim)
        #cls.build_imis_adjuster(imis_claim, fhir_claim, errors)
        cls.check_errors(errors)
        return imis_claim

    @classmethod
    def get_reference_obj_id(cls, imis_claim):
        return imis_claim.uuid

    @classmethod
    def get_fhir_resource_type(cls):
        return FHIRClaim

    @classmethod
    def get_imis_obj_by_fhir_reference(cls, reference, errors=None):
        imis_claim_code = cls.get_resource_id_from_reference(reference)
        return DbManagerUtils.get_object_or_none(Claim, code=imis_claim_code)

    @classmethod
    def build_imis_date_claimed(cls, imis_claim, fhir_claim, errors):
        if fhir_claim.created:
            imis_claim.date_claimed = TimeUtils.str_to_date(fhir_claim.created)
        cls.valid_condition(imis_claim.date_claimed is None, gettext('Missing the date of creation'), errors)

    @classmethod
    def build_fhir_identifiers(cls, fhir_claim, imis_claim):
        identifiers = []
        cls.build_fhir_uuid_identifier(identifiers, imis_claim)
        claim_code = cls.build_fhir_identifier(imis_claim.code,
                                               R4IdentifierConfig.get_fhir_identifier_type_system(),
                                               R4IdentifierConfig.get_fhir_claim_code_type())
        identifiers.append(claim_code)
        fhir_claim.identifier = identifiers

    @classmethod
    def build_imis_identifier(cls, imis_claim, fhir_claim, errors):
        value = cls.get_fhir_identifier_by_code(fhir_claim.identifier, R4IdentifierConfig.get_fhir_claim_code_type())
        if value:
            imis_claim.code = value
        cls.valid_condition(imis_claim.code is None, gettext('Missing the claim code'), errors)

    @classmethod
    def build_imis_patient(cls, imis_claim, fhir_claim, errors):
        if fhir_claim.patient:
            insuree = PatientConverter.get_imis_obj_by_fhir_reference(fhir_claim.patient)
            if insuree:
                imis_claim.insuree = insuree
                imis_claim.insuree_chf_code = insuree.chf_id
        cls.valid_condition(imis_claim.insuree is None, gettext('Missing the patient reference'), errors)

    @classmethod
    def build_imis_health_facility(cls, errors, fhir_claim, imis_claim):
        if fhir_claim.facility:
            health_facility = LocationConverter.get_imis_obj_by_fhir_reference(fhir_claim.facility)
            if health_facility:
                imis_claim.health_facility = health_facility
                imis_claim.health_facility_code = health_facility.code
        cls.valid_condition(imis_claim.health_facility is None, gettext('Missing the facility reference'), errors)

    @classmethod
    def build_fhir_billable_period(cls, fhir_claim, imis_claim):
        billable_period = Period()
        if imis_claim.date_from:
            billable_period.start = imis_claim.date_from.isoformat()
        if imis_claim.date_to:
            billable_period.end = imis_claim.date_to.isoformat()
        fhir_claim.billablePeriod = billable_period

    @classmethod
    def build_imis_date_range(cls, imis_claim, fhir_claim, errors):
        billable_period = fhir_claim.billablePeriod
        if billable_period:
            if billable_period.start:
                imis_claim.date_from = TimeUtils.str_to_date(billable_period.start)
            if billable_period.end:
                imis_claim.date_to = TimeUtils.str_to_date(billable_period.end)
        cls.valid_condition(imis_claim.date_from is None, gettext('Missing the billable start date'), errors)
    """
    @classmethod
    def build_fhir_diagnoses(cls, fhir_claim, imis_claim):
        diagnoses = []
        cls.build_fhir_diagnosis(diagnoses, imis_claim.icd.code, ImisClaimIcdTypes.ICD_0.value)
        if imis_claim.icd_1:
            cls.build_fhir_diagnosis(diagnoses, imis_claim.icd_1, ImisClaimIcdTypes.ICD_1.value)
        if imis_claim.icd_2:
            cls.build_fhir_diagnosis(diagnoses, imis_claim.icd_2, ImisClaimIcdTypes.ICD_2.value)
        if imis_claim.icd_3:
            cls.build_fhir_diagnosis(diagnoses, imis_claim.icd_3, ImisClaimIcdTypes.ICD_3.value)
        if imis_claim.icd_4:
            cls.build_fhir_diagnosis(diagnoses, imis_claim.icd_4, ImisClaimIcdTypes.ICD_4.value)
        fhir_claim.diagnosis = diagnoses
    
    @classmethod
    def build_fhir_diagnosis(cls, diagnoses, icd_code, icd_type):
        claim_diagnosis = ClaimDiagnosis()
        claim_diagnosis.sequence = FhirUtils.get_next_array_sequential_id(diagnoses)
        #claim_diagnosis.diagnosisCodeableConcept = cls.build_codeable_concept(icd_code, None)
        fhir_condition = Condition()
        imis_claim = Claim()

        claim_diagnosis.diagnosisReference = ConditionConverter.build_fhir_resource_reference(imis_claim.code)
        claim_diagnosis.type = [cls.build_simple_codeable_concept(icd_type)]
        diagnoses.append(claim_diagnosis)
    """

    @classmethod
    def build_fhir_diagnoses(cls, fhir_claim, imis_claim):
        diagnoses = []
        cls.build_fhir_diagnosis(diagnoses, imis_claim.icd, ImisClaimIcdTypes.ICD_0.value)
        if imis_claim.icd_1 is not None:
            cls.build_fhir_diagnosis(diagnoses, imis_claim.icd_1, ImisClaimIcdTypes.ICD_1.value)
        if imis_claim.icd_2 is not None:
            cls.build_fhir_diagnosis(diagnoses, imis_claim.icd_2, ImisClaimIcdTypes.ICD_2.value)
        if imis_claim.icd_3 is not None:
            cls.build_fhir_diagnosis(diagnoses, imis_claim.icd_3, ImisClaimIcdTypes.ICD_3.value)
        if imis_claim.icd_4 is not None:
            cls.build_fhir_diagnosis(diagnoses, imis_claim.icd_4, ImisClaimIcdTypes.ICD_4.value)

        fhir_claim.diagnosis = diagnoses

    @classmethod
    def build_fhir_diagnosis(cls, diagnoses, icd_code, icd_type):
        if icd_code is None:
            raise FHIRRequestProcessException(['ICD code cannot be null'])
        if icd_type is None:
            raise FHIRRequestProcessException(['ICD Type cannot be null'])
        claim_diagnosis = ClaimDiagnosis()
        claim_diagnosis.sequence = FhirUtils.get_next_array_sequential_id(diagnoses)
        claim_diagnosis.diagnosisReference = ConditionConverter.build_fhir_resource_reference(icd_code)
        claim_diagnosis.type = [cls.build_codeable_concept(icd_type)]
        claim_diagnosis.name = cls.build_simple_codeable_concept(icd_code.name)
        diagnoses.append(claim_diagnosis)

    # TODO: fix the issue with POST
    @classmethod
    def build_imis_diagnoses(cls, imis_claim, fhir_claim, errors):
        diagnoses = fhir_claim.diagnosis
        if diagnoses:
            for diagnosis in diagnoses:
                diagnosis_type = cls.get_diagnosis_type(diagnosis)
                diagnosis_code = cls.get_diagnosis_code(diagnosis)
                if diagnosis_type == ImisClaimIcdTypes.ICD_0.value:
                    imis_claim.icd = cls.get_claim_diagnosis_by_code(diagnosis_code)
                    imis_claim.icd_code = diagnosis_code
                elif diagnosis_type == ImisClaimIcdTypes.ICD_1.value:
                    imis_claim.icd_1 = diagnosis_code
                    imis_claim.icd1_code = cls.get_claim_diagnosis_code_by_id(diagnosis_code)
                elif diagnosis_type == ImisClaimIcdTypes.ICD_2.value:
                    imis_claim.icd_2 = diagnosis_code
                    imis_claim.icd2_code = cls.get_claim_diagnosis_code_by_id(diagnosis_code)
                elif diagnosis_type == ImisClaimIcdTypes.ICD_3.value:
                    imis_claim.icd_3 = diagnosis_code
                    imis_claim.icd3_code = cls.get_claim_diagnosis_code_by_id(diagnosis_code)
                elif diagnosis_type == ImisClaimIcdTypes.ICD_4.value:
                    imis_claim.icd_4 = diagnosis_code
                    imis_claim.icd4_code = cls.get_claim_diagnosis_code_by_id(diagnosis_code)
        cls.valid_condition(imis_claim.icd is None, gettext('Missing the main diagnosis for claim'), errors)

    @classmethod
    def get_diagnosis_type(cls, diagnosis):
        diagnosis_type = None
        type_concept = cls.get_first_diagnosis_type(diagnosis)
        if type_concept:
            diagnosis_type = type_concept
        return diagnosis_type

    @classmethod
    def get_first_diagnosis_type(cls, diagnosis):
        return diagnosis.type[0]

    @classmethod
    def get_claim_diagnosis_by_code(cls, icd_code):
        return Diagnosis.objects.get(code=icd_code)

    @classmethod
    def get_claim_diagnosis_code_by_id(cls, diagnosis_id):
        code = None
        if diagnosis_id is not None:
            diagnosis = DbManagerUtils.get_object_or_none(Diagnosis, pk=diagnosis_id)
            if diagnosis:
                code = diagnosis.code
        return code

    @classmethod
    def get_diagnosis_code(cls, diagnosis):
        code = None
        concept = diagnosis.diagnosisCodeableConcept
        if concept:
            coding = cls.get_first_coding_from_codeable_concept(concept)
            icd_code = coding.code
            if icd_code:
                code = icd_code

        #if diagnosis.diagnosisReference:
            #code = ConditionConverter.get_imis_obj_by_fhir_reference(diagnosis.diagnosisReference)
            #if code:
            #    imis_claim.icd = code
            #    imis_claim.icd_code = code.code

        return code

    @classmethod
    def build_fhir_total(cls, fhir_claim, imis_claim):
        total_claimed = imis_claim.claimed
        if not total_claimed:
            total_claimed = 0
        fhir_total = Money()
        fhir_total.value = total_claimed
        if hasattr(core, 'currency'):
            fhir_total.currency = core.currency
        fhir_claim.total = fhir_total

    @classmethod
    def build_imis_total_claimed(cls, imis_claim, fhir_claim, errors):
        total_money = fhir_claim.total
        if total_money is not None:
            imis_claim.claimed = total_money.value
        cls.valid_condition(imis_claim.claimed is None,
                            gettext('Missing the value for `total` attribute'), errors)

    @classmethod
    def build_imis_claim_admin(cls, imis_claim, fhir_claim, errors):
        if fhir_claim.enterer:
            admin = PractitionerConverter.get_imis_obj_by_fhir_reference(fhir_claim.enterer)
            if admin:
                imis_claim.admin = admin
                imis_claim.claim_admin_code = admin.code
        cls.valid_condition(imis_claim.admin is None, gettext('Missing the enterer reference'), errors)

    @classmethod
    def build_fhir_type(cls, fhir_claim, imis_claim):
        if imis_claim.visit_type:
            fhir_claim.type = cls.build_simple_codeable_concept(imis_claim.visit_type)

    @classmethod
    def build_imis_visit_type(cls, imis_claim, fhir_claim):
        if fhir_claim.type:
            imis_claim.visit_type = fhir_claim.type.text

    @classmethod
    def build_fhir_supportingInfo(cls, fhir_claim, imis_claim):
        guarantee_id_code = R4ClaimConfig.get_fhir_claim_information_guarantee_id_code()
        cls.build_fhir_string_information(fhir_claim.supportingInfo, guarantee_id_code, imis_claim.guarantee_id)
        explanation_code = R4ClaimConfig.get_fhir_claim_information_explanation_code()
        cls.build_fhir_string_information(fhir_claim.supportingInfo, explanation_code, imis_claim.explanation)
        is_admitted = R4ClaimConfig.get_fhir_claim_information_is_admitted_code()
        cls.build_fhir_string_information(fhir_claim.supportingInfo, is_admitted, imis_claim.is_admitted)
        accident_description = R4ClaimConfig.get_fhir_claim_information_accident_description_code()
        cls.build_fhir_string_information(fhir_claim.supportingInfo, accident_description, imis_claim.accident_description)
        injured_body_part = R4ClaimConfig.get_fhir_claim_information_injured_body_part_code()
        cls.build_fhir_string_information(fhir_claim.supportingInfo, injured_body_part, imis_claim.injured_body_part)
        discharge_type = R4ClaimConfig.get_fhir_claim_information_discharge_type_code()
        cls.build_fhir_string_information(fhir_claim.supportingInfo, discharge_type, imis_claim.discharge_type)

        discharge_date = R4ClaimConfig.get_fhir_claim_information_discharge_date_code()
        cls.build_fhir_string_information(fhir_claim.supportingInfo, discharge_date, imis_claim.refer_to_date)

        discharge_summary = R4ClaimConfig.get_fhir_claim_information_discharge_summary_code()
        cls.build_fhir_string_information(fhir_claim.supportingInfo, discharge_summary, imis_claim.discharge_summary)

        condition_of_wound = R4ClaimConfig.get_fhir_claim_information_condition_of_wound_code()
        cls.build_fhir_string_information(fhir_claim.supportingInfo, condition_of_wound, imis_claim.condition_of_wound)

        cancer = R4ClaimConfig.get_fhir_claim_information_cancer_code()
        cls.build_fhir_string_information(fhir_claim.supportingInfo, cancer, imis_claim.cancer)

        heart_attack = R4ClaimConfig.get_fhir_claim_information_heart_attack_code()
        cls.build_fhir_string_information(fhir_claim.supportingInfo, heart_attack, imis_claim.heart_attack)

        hiv = R4ClaimConfig.get_fhir_claim_information_hiv_code()
        cls.build_fhir_string_information(fhir_claim.supportingInfo, hiv, imis_claim.hiv)

        high_bp = R4ClaimConfig.get_fhir_claim_information_high_bp_code()
        cls.build_fhir_string_information(fhir_claim.supportingInfo, high_bp, imis_claim.high_bp)

        diabetes = R4ClaimConfig.get_fhir_claim_information_diabetes_code()
        cls.build_fhir_string_information(fhir_claim.supportingInfo, diabetes, imis_claim.diabetes)

        reason_of_sickness = R4ClaimConfig.get_fhir_claim_information_reason_of_sickness_code()
        cls.build_fhir_string_information(fhir_claim.supportingInfo, reason_of_sickness, imis_claim.reason_of_sickness)

        if imis_claim.refer_to_health_facility is not None:
            refer_to_health_facility = R4ClaimConfig.get_fhir_claim_information_refer_to_health_facility_code()
            cls.build_fhir_string_information(fhir_claim.supportingInfo, refer_to_health_facility, imis_claim.refer_to_health_facility.code)

        if imis_claim.refer_from_health_facility is not None:
            refer_from_health_facility = R4ClaimConfig.get_fhir_claim_information_refer_from_health_facility_code()
            cls.build_fhir_string_information(fhir_claim.supportingInfo, refer_from_health_facility,
                                              imis_claim.refer_from_health_facility.code)

        refer_from_date = R4ClaimConfig.get_fhir_claim_information_refer_from_date_code()
        cls.build_fhir_string_information(fhir_claim.supportingInfo, refer_from_date,
                                          imis_claim.refer_from_date)

    @classmethod
    def build_imis_supportingInfo(cls, imis_claim, fhir_claim):
        if fhir_claim.supportingInfo:
            for supportingInfo in fhir_claim.supportingInfo:
                category = supportingInfo.category
                if category and category.text == R4ClaimConfig.get_fhir_claim_information_guarantee_id_code():
                    imis_claim.guarantee_id = supportingInfo.valueString
                elif category and category.text == R4ClaimConfig.get_fhir_claim_information_explanation_code():
                    imis_claim.explanation = supportingInfo.valueString

    @classmethod
    def build_fhir_string_information(cls, claim_information, code, value_string):
        result = None
        if value_string:
            supportingInfo_concept = ClaimSupportingInfo()
            supportingInfo_concept.sequence = FhirUtils.get_next_array_sequential_id(claim_information)
            supportingInfo_concept.category = cls.build_simple_codeable_concept(code)
            supportingInfo_concept.valueString = value_string
            claim_information.append(supportingInfo_concept)
            result = supportingInfo_concept
        return result

    @classmethod
    def build_fhir_items(cls, fhir_claim, imis_claim):
        cls.build_items_for_imis_item(fhir_claim, imis_claim)
        cls.build_items_for_imis_services(fhir_claim, imis_claim)

    @classmethod
    def build_items_for_imis_item(cls, fhir_claim, imis_claim):
        for item in imis_claim.items.all():
            if item:
                type = R4ClaimConfig.get_fhir_claim_item_code()
                cls.build_fhir_item(fhir_claim, item.item.code, type, item)

    @classmethod
    def get_imis_items_for_claim(cls, imis_claim):
        items = []
        if imis_claim and imis_claim.id:
            items = ClaimItem.objects.filter(claim_id=imis_claim.id)
        return items

    @classmethod
    def build_fhir_item(cls, fhir_claim, code, item_type, item):
        fhir_item = FHIRClaimItem()
        fhir_item.sequence = FhirUtils.get_next_array_sequential_id(fhir_claim.item)
        unit_price = Money()
        unit_price.value = item.price_asked
        if hasattr(core, 'currency'):
            unit_price.currency = core.currency
        fhir_item.unitPrice = unit_price
        fhir_quantity = Quantity()
        fhir_quantity.value = item.qty_provided
        fhir_item.quantity = fhir_quantity
        fhir_item.productOrService = cls.build_simple_codeable_concept(code)
        fhir_item.category = cls.build_simple_codeable_concept(item_type)
        item_explanation_code = R4ClaimConfig.get_fhir_claim_item_explanation_code()
        fhir_item.name = cls.build_simple_codeable_concept(item.item.name if item_type == "item" else item.service.name)
        information = cls.build_fhir_string_information(fhir_claim.supportingInfo, item_explanation_code, item.explanation)
        if information:
            fhir_item.informationSequence = [information.sequence]

        extension = Extension()

        if fhir_item.category.text == "item":
            medication = cls.build_medication_extension(extension)
            fhir_item.extension.append(medication)

        elif fhir_item.category.text == "service":
            activity_definition = cls.build_activity_definition_extension(extension)
            fhir_item.extension.append(activity_definition)

        fhir_claim.item.append(fhir_item)

    @classmethod
    def build_items_for_imis_services(cls, fhir_claim, imis_claim):
        for service in imis_claim.services.all():
            if service:
                type = R4ClaimConfig.get_fhir_claim_service_code()
                cls.build_fhir_item(fhir_claim, service.service.code, type, service)

    @classmethod
    def get_imis_services_for_claim(cls, imis_claim):
        services = []
        if imis_claim and imis_claim.id:
            services = ClaimService.objects.filter(claim_id=imis_claim.id)
        return services

    @classmethod
    def build_medication_extension(cls, extension):
        #extension = Extension()
        imis_item = ClaimItem()
        reference = Reference()
        extension.valueReference = reference
        extension.url = "Medication"
        imis_item.item = Item()
        if imis_item.item is None:
            raise FHIRRequestProcessException(['Cannot construct medication on  None (Item) '] )
        extension.valueReference = MedicationConverter.build_fhir_resource_reference(imis_item.item)
        return extension

    @classmethod
    def build_activity_definition_extension(cls, extension):
        #extension = Extension()
        imis_service = ClaimService()
        reference = Reference()
        extension.valueReference = reference
        extension.url = "ActivityDefinition"
        imis_service.service = Service()
        if imis_service.service is None:
            raise FHIRRequestProcessException(['Cannot construct activity on None (service) '] )
        extension.valueReference = ActivityDefinitionConverter.build_fhir_resource_reference(imis_service.service)
        return extension

    @classmethod
    def build_imis_submit_items_and_services(cls, imis_claim, fhir_claim):
        imis_items = []
        imis_services = []
        if fhir_claim.item:
            for item in fhir_claim.item:
                if item.category:
                    if item.category.text == R4ClaimConfig.get_fhir_claim_item_code():
                        cls.build_imis_submit_item(imis_items, item)
                    elif item.category.text == R4ClaimConfig.get_fhir_claim_service_code():
                        cls.build_imis_submit_service(imis_services, item)
        # added additional attributes which will be used to create ClaimRequest in serializer
        imis_claim.submit_items = imis_items
        imis_claim.submit_services = imis_services

    @classmethod
    def build_imis_submit_item(cls, imis_items, fhir_item):
        price_asked = cls.get_fhir_item_price_asked(fhir_item)
        qty_provided = cls.get_fhir_item_qty_provided(fhir_item)
        item_code = cls.get_fhir_item_code(fhir_item)
        imis_items.append(ClaimItemSubmit(item_code, qty_provided, price_asked))

    @classmethod
    def build_imis_submit_service(cls, imis_services, fhir_item):
        price_asked = cls.get_fhir_item_price_asked(fhir_item)
        qty_provided = cls.get_fhir_item_qty_provided(fhir_item)
        service_code = cls.get_fhir_item_code(fhir_item)
        imis_services.append(ClaimServiceSubmit(service_code, qty_provided, price_asked))

    @classmethod
    def get_fhir_item_code(cls, fhir_item):
        item_code = None
        if fhir_item.productOrService:
            item_code = fhir_item.productOrService.text
        return item_code

    @classmethod
    def get_fhir_item_qty_provided(cls, fhir_item):
        qty_provided = None
        if fhir_item.quantity:
            qty_provided = fhir_item.quantity.value
        return qty_provided

    @classmethod
    def get_fhir_item_price_asked(cls, fhir_item):
        price_asked = None
        if fhir_item.unitPrice:
            price_asked = fhir_item.unitPrice.value
        return price_asked

    @classmethod
    def build_fhir_provider(cls, fhir_claim, imis_claim):
        #fhir_claim.provider = imis_claim.adjuster
        if imis_claim.admin is not None:
            fhir_claim.provider = PractitionerRoleConverter.build_fhir_resource_reference(imis_claim.admin)

    @classmethod
    def build_imis_adjuster(cls, imis_claim, fhir_claim, errors):
        adjuster = fhir_claim.provider
        if not cls.valid_condition(adjuster is None,
                                   gettext('Missing claim `adjuster` attribute'), errors):
            imis_claim.adjuster = adjuster

    @classmethod
    def build_fhir_use(cls, fhir_claim):
        fhir_claim.use = "claim"

    @classmethod
    def build_fhir_priority(cls, fhir_claim):
        fhir_claim.priority = cls.build_codeable_concept("normal", None, None)

    @classmethod
    def build_fhir_status(cls, fhir_claim):
        fhir_claim.status = "active"

    @classmethod
    def build_fhir_insurance(cls, fhir_claim, imis_claim):
        fhir_insurance = ClaimInsurance()
        imis_insuree_policy  = imis_claim.insuree.insuree_policies.all()
        # fixme get latest policy, not the one active at the claim
        for pol in imis_insuree_policy:
            policy = pol.policy
            fhir_insurance.coverage = CoverageConverter.build_fhir_resource_reference(policy)

        if fhir_insurance.coverage is None:
            fhir_insurance.coverage = Reference()
            fhir_insurance.coverage.reference = "Coverage"
            
        fhir_insurance.sequence = 0
        fhir_insurance.focal = True

        fhir_claim.insurance = [fhir_insurance]
