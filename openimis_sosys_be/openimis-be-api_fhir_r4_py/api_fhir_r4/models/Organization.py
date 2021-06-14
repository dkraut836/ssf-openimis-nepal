from api_fhir_r4.models import DomainResource, Property, BackboneElement, FHIRDate

class organizationContact(BackboneElement):
    purpose = Property('purpose', 'CodeableConcept', count_max='*')
    name = Property('code', 'HumanName')
    telecom = Property('telecom','ContactPoint')
    address = Property('address', 'Address')

class organization(DomainResource):
    identifier = Property('identifier', 'Identifier', count_max='*')
    active = Property('active','bool')
    type = Property('type', 'CodeableConcept')
    name = Property('name',str)
    telecom = Property('telecom','ContactPoint')
    address = Property('address','Address',count_max='*')