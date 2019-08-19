global class SimpleListItem {
	@AuraEnabled
    public String id { get; set; }
    
    @AuraEnabled
    public String itemId { get; set; }
    
    /* To be able to use this class to load select options */
    @AuraEnabled
    public string value { get; set; }

    @AuraEnabled
    public String name { get; set; }
    
    @AuraEnabled
    public String label { get; set; }
    
    @AuraEnabled
    public String description { get; set; }
    
    @AuraEnabled
    public Boolean selected { get; set; }
    
    @AuraEnabled
    public Boolean isDefault { get; set; }
    
    public SimpleListItem() {
        init('', '', false, '', false);
    }
    public SimpleListItem(String id, String name) {
        init(id, name, false, '', false);        
    }
    public SimpleListItem(String id, String name, String description) {
        init(id, name, false, description, false);
    }
    public SimpleListItem(String id, String name, Boolean selected, String description) {
        init(id, name, selected, description, false);
    }
    public SimpleListItem(String id, String name, Boolean selected, String description, Boolean isDefault) {
        init(id, name, selected, description, isDefault);
    }
    
    void init(String id, String name, Boolean selected, String description, Boolean isDefault) {
        this.id = id;
        this.itemId = id;
        this.value = id;
        this.name = name;
        this.label = name;
        this.selected = selected;
        this.description = description;
        this.isDefault = isDefault;                
    }
}