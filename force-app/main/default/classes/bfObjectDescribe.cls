public class bfObjectDescribe {
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

        this.fields = new Map<String, bfFieldDescribe>();
        this.fieldSets = new Map<String, List<bfColumn>>();        
        this.recordTypes = new Map<String, bfColumn>();
    }
    
    public void getDescribe(Boolean includeFields, Boolean includeRecordTypes, Boolean includeFieldsets) {
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
            
            if (includeRecordTypes) {
	            Map<String, Schema.RecordTypeInfo> l_recordTypes = d.getRecordTypeInfosByName();                
                for(RecordTypeInfo rti : l_recordTypes.values()) {
                    if (rti.isAvailable()) {
                    	this.recordTypes.put(rti.getName(), new bfColumn(rti.getDeveloperName(), rti.getName(), rti.getRecordTypeId(), rti.isDefaultRecordTypeMapping()));                        
                    }
                }
            }
            
            if (includeFields) {
                Map<String, Schema.SObjectField> fields = d.fields.getMap();
                for(Schema.SObjectField f : fields.values()) {
                    Schema.DescribeFieldResult dfr = f.getDescribe();
                    bfFieldDescribe fr = new bfFieldDescribe(dfr.name, dfr.label, dfr.type, dfr.calculated, dfr.accessible, dfr.isUpdateable(), dfr.nillable);
                    if (dfr.type == Schema.DisplayType.PICKLIST) {
                        for(Schema.PicklistEntry pe : dfr.getPicklistValues()) {
                            if (pe.isActive()) {
	                            fr.picklistValues.add(new SimpleListItem(pe.getValue(), pe.getLabel(), pe.isDefaultValue(), pe.getValue(), pe.isDefaultValue()));                                
                            }
                        }
                    }
                    this.fields.put(dfr.name, fr);
                }                     
            }
            
            if (includeFieldsets) {
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