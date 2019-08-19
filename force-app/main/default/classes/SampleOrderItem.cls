global class SampleOrderItem {
	@AuraEnabled
    public String id { get; set; }
    
    @AuraEnabled
    public String productId { get; set; }
    
    @AuraEnabled
    public String productName { get; set; }
    
    @AuraEnabled
    public String brandName { get; set; }
    
    @AuraEnabled
    public Integer quantity { get; set; }
    
    @AuraEnabled
    public Integer packQty { get; set; }
    
    @AuraEnabled
    public Integer units { get; set; }
    
    public SampleOrderItem() {
        this.id = '';
        this.productId = '';
        this.productName = '';
        this.brandName = '';
        this.quantity = 0;
        this.packQty = 0;
        this.units = 0;
    }
    
    public SampleOrderItem(String id, String productId, String productName, String brandName, Integer packQty, Integer quantity) {
        this.id = (id == null || id == '' ? productId : id);
        this.productId = productId;
        this.productName = productName;
        this.brandName = brandName;
        this.packQty = packQty == null ? 1 : packQty;
        this.quantity = quantity == null ? 0 : quantity;
        this.units = this.quantity * this.packQty;
    }
       
}