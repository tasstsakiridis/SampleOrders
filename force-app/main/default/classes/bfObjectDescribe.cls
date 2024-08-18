public class bfObjectDescribe {
    public class bfObjectDescribeParams {
        @AuraEnabled 
        public Boolean includeFields { get; set; }

        @AuraEnabled 
        public Boolean includeFieldsets { get; set; }

        @AuraEnabled 
        public Boolean includeRecordTypes { get; set; }

        @AuraEnabled 
        public Boolean getRelatedObjectFields { get; set; }

        @AuraEnabled 
        public String fieldset { get; set; }

        @AuraEnabled 
        public List<String> availableFields { get; set; }

        @AuraEnabled 
        public List<String> relatedObjects { get; set; }
    }

	@AuraEnabled
    public String apiName { get; set; }
    
    @AuraEnabled
    public String label { get; set; }
    
    @AuraEnabled
    public String labelPlural { get; set; }
    
    @AuraEnabled
    public String keyPrefix { get; set; }
    
    @AuraEnabled
    public Boolean canUpdate { get; set; }
    
    @AuraEnabled
    public Boolean canDelete { get; set; }
    
    @AuraEnabled
    public Boolean canInsert { get; set; }

    @AuraEnabled 
    public List<bfChildRelationship> childRelationships { get; set; }
    
    @AuraEnabled 
    public List<bfFieldDescribe> fieldValues { get; set; }

    @AuraEnabled
    public Map<String, bfFieldDescribe> fields { get; set; }
    
    @AuraEnabled
    public Map<String, List<bfColumn>> fieldSets { get; set; }
    
    @AuraEnabled
    public Map<String, bfColumn> recordTypes { get; set; }
    
    public bfObjectDescribe(String apiName) {
        Init();
        
        this.apiName = apiName;
    }
    public bfObjectDescribe(String apiName, String label, String labelPlural) {
        Init();
        
        this.apiName = apiName;
        this.label = label;
        this.labelPlural = labelPlural;
    }
    public bfObjectDescribe(String apiName, String label, String labelPlural, Boolean canUpdate, Boolean canDelete, Boolean canInsert) {
        Init();
        
        this.apiName = apiName;
        this.label = label;
        this.labelPlural = labelPlural;
        this.canUpdate = canUpdate;
        this.canDelete = canDelete;
        this.canInsert = canInsert;
    }
    
    void Init() {
        this.apiName = '';
        this.label = '';
        this.labelPlural = '';
        this.keyPrefix = '';
        this.canUpdate = true;
        this.canDelete = true;
        this.canInsert = true;

        this.childRelationships = new List<bfChildRelationship>();
        this.fields = new Map<String, bfFieldDescribe>();
        this.fieldSets = new Map<String, List<bfColumn>>();        
        this.recordTypes = new Map<String, bfColumn>();
    }
    
    public void getDescribe(Boolean includeFields, Boolean includeRecordTypes, Boolean includeFieldsets) {
        bfObjectDescribeParams params = new bfObjectDescribeParams();
        params.includeFields = includeFields;
        params.includeRecordTypes = includeRecordTypes;
        params.includeFieldsets = includeFieldsets;
        params.availableFields = null;
        params.relatedObjects = null;
        params.getRelatedObjectFields = false;
        this.getDescribe(params);
    }

    public void getDescribe(bfObjectDescribeParams params) {
        System.debug('[bfObjectDescribe.getDescribe] apiName: ' + this.apiName);
        Schema.DescribeSObjectResult[] describes = Schema.describeSObjects(new List<String>{this.apiName});
        if (describes != null && describes.size() > 0) {
            try {
                System.debug('[bfObjectDescribe.getDescribe] # of describes found: ' + describes.size());
                Schema.DescribeSObjectResult d = describes.get(0);
                this.label = d.label;
                this.labelPlural = d.labelplural;
                this.keyPrefix = d.keyPrefix;
                this.canDelete = d.deletable;
                this.canInsert = d.createable;
                this.canUpdate = d.updateable;
                
                List<Schema.ChildRelationship> r = d.getChildRelationships();
                System.debug('# of child relationships: ' + r.size());
                
                List<String> relatedObjects = params.relatedObjects == null ? new List<String>() : params.relatedObjects;
                for(Schema.ChildRelationship cr : d.getChildRelationships()) {
                    if (relatedObjects.size() == 0 || relatedObjects.contains(cr.getChildSObject().getDescribe().getName())) {
                        this.childRelationships.add(new bfChildRelationship(cr));
                    }
                }
                
                if (params.includeRecordTypes) {
                    Map<String, Schema.RecordTypeInfo> l_recordTypes = d.getRecordTypeInfosByName();                
                    for(RecordTypeInfo rti : l_recordTypes.values()) {
                        if (rti.isAvailable()) {
                            this.recordTypes.put(rti.getName(), new bfColumn(rti.getDeveloperName(), rti.getName(), rti.getRecordTypeId(), rti.isDefaultRecordTypeMapping()));                        
                        }
                    }
                }
                
                if (params.includeFields) {
                    List<String> availableFields;
                    if (params.availableFields == null || params.availableFields.size() == 0) {
                        if (String.isEmpty(params.fieldset)) {
                            availableFields = new List<String>();
                        } else {
                            Map<String, Schema.FieldSet> fsMap = d.fieldSets.getMap();
                            if (fsMap.containsKey(params.fieldset)) {
                                availableFields = new List<String>();
                                Schema.FieldSet fs = fsMap.get(params.fieldset);
                                for(Schema.FieldSetMember fsm : fs.getFields()) {
                                    availableFields.add(fsm.getFieldPath());
                                }
                            }
                        }                     
                    } else {
                        availableFields = params.availableFields == null ? new List<String>() : params.availableFields;
                    }
                    System.debug('available fields');
                    for(String s : availableFields) {
                        System.debug(s);
                    }
                    Map<String, Schema.SObjectField> fields = d.fields.getMap();
                    for(Schema.SObjectField f : fields.values()) {
                        System.debug('f: ' + f);
                        if (f != null) {
                            Schema.DescribeFieldResult dfr = f.getDescribe();
                            System.debug('field: ' + dfr.getName() + ', type: ' + dfr.getType());
                            if (availableFields.size() == 0 || availableFields.contains(dfr.getName())) {
                                bfFieldDescribe.bfFieldDescribeParams fieldParams = new bfFieldDescribe.bfFieldDescribeParams();
                                fieldParams.dfr = dfr;
                                fieldParams.availableFields = availableFields;
                                fieldParams.relatedObjects = relatedObjects;
                                fieldParams.getRelatedObjectFields = params.getRelatedObjectFields;
                                bfFieldDescribe fr = new bfFieldDescribe(fieldParams);
                                this.fields.put(dfr.getName(), fr);                                
                            }
                        }
                    }    
                    this.fieldValues = this.fields.values();
                    this.fieldValues.sort();
                }
                
                if (params.includeFieldsets) {
                    Map<String, Schema.FieldSet> fieldSets = d.fieldsets.getMap();
                    List<bfColumn> fieldSetMembers;
                    for(Schema.FieldSet fs : fieldSets.values()) {
                        fieldSetMembers = new List<bfColumn>();
                        for(Schema.FieldSetMember fsm : fs.fields) {
                            fieldSetMembers.add(new bfColumn(fsm.getFieldPath(), fsm.getLabel(), '', fsm.getType(), fsm.getDBRequired(), fsm.getRequired()));
                        }
                        
                        this.fieldSets.put(fs.getName(), fieldSetMembers);
                    }                
                }
                
            }catch(Exception ex) {
                System.debug('exception trying to get object details. ' + ex.getMessage());
            }
        } else {
	        System.debug('[bfObjectDescribe.getDescribe] no describes found for ' + this.apiName);     
        }
        
    }
}