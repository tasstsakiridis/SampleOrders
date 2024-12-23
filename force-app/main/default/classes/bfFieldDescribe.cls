public class bfFieldDescribe {
	@AuraEnabled
    public String fieldPath { get; set; }
    
    @AuraEnabled
    public String label { get; set; }
    
    @AuraEnabled
    public Schema.DisplayType type { get; set; }
    
    @AuraEnabled
    public Boolean isFormula { get; set; }
    
    @AuraEnabled
    public Boolean isAccessible { get; set; }
    
    @AuraEnabled
    public Boolean isUpdateable { get; set; }
    
    @AuraEnabled
    public Boolean isRequired { get; set; }
    
    @AuraEnabled
    public List<SimpleListItem> picklistValues { get; set; }

    public bfFieldDescribe(String fieldPath, String label, Schema.DisplayType type, Boolean isFormula, Boolean isAccessible, Boolean isUpdateable, Boolean isRequired) { 
        this.fieldPath = fieldPath;
        this.label = label;
        this.type = type;
        this.isFormula = isFormula;
        this.isAccessible = isAccessible;
        this.isUpdateable = isUpdateable;
        this.isRequired = isRequired;
        
        this.picklistValues = new List<SimpleListItem>();
    }    
}