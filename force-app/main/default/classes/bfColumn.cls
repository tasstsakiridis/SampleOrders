global class bfColumn {
	@AuraEnabled
    public String name { get; set; }
    
    @AuraEnabled
    public String label { get; set; }
    
    @AuraEnabled
    public String value { get; set; }
    
    @AuraEnabled
    public Boolean isRequired { get; set; }
    
    @AuraEnabled
    public Boolean isDBRequired { get; set; }

    @AuraEnabled 
    public Boolean isDefault { get; set; }

    @AuraEnabled 
    public Boolean isMaster { get; set; }
    
    @AuraEnabled
    public Schema.DisplayType type { get; set; }
    
    public bfColumn(String name, String label, String value) {
        this.name = name;
        this.label = label;
        this.value = value;        
        this.isDBRequired = false;
        this.isRequired = false;
        this.isMaster = false;
        this.type = Schema.DisplayType.STRING;
    }
    public bfColumn(String name, String label, String value, Boolean isDefault) {
        this.name = name;
        this.label = label;
        this.value = value;     
        this.isDefault = isDefault;   
        this.isDBRequired = false;
        this.isRequired = false;
        this.isMaster = false;
        this.type = Schema.DisplayType.STRING;
    }
    public bfColumn(String name, String label, String value, Schema.DisplayType type, Boolean isRequired, Boolean isDBRequired) {
        this.name = name;
        this.label = label;
        this.value = value;        
        this.isDBRequired = isDBRequired;
        this.isRequired = isRequired;
        this.type = type;
        this.isMaster = false;
    }
    public bfColumn(String name, String label, String value, Schema.DisplayType type, Boolean isRequired, Boolean isDBRequired, Boolean isMaster) {
        this.name = name;
        this.label = label;
        this.value = value;        
        this.isDBRequired = isDBRequired;
        this.isRequired = isRequired;
        this.type = type;
        this.isMaster = isMaster;
    }

}