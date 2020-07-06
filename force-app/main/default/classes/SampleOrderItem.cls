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
    public String usedFor { get; set; }

    @AuraEnabled
    public Integer quantity { get; set; }
    
    @AuraEnabled
    public Integer packQty { get; set; }
    
    @AuraEnabled
    public Integer units { get; set; }

    @AuraEnabled
    public Decimal price { get; set; }
    
    @AuraEnabled 
    public String productCode { get; set; }

    public SampleOrderItem() {
        this.id = '';
        this.productId = '';
        this.productName = '';
        this.productCode = '';
        this.brandName = '';
        this.usedFor = '';
        this.quantity = 0;
        this.packQty = 0;
        this.units = 0;
        this.price = 0;
    }
    
    public SampleOrderItem(String id, String productId, String productName, String productCode, String brandName, String usedFor, Integer packQty, Integer quantity, Decimal price) {
        this.id = (id == null || id == '' ? productId : id);
        this.productId = productId;
        this.productName = productName;
        this.productCode = productCode;
        this.brandName = brandName;
        this.usedFor = usedFor;
        this.packQty = packQty == null ? 1 : packQty;
        this.quantity = quantity == null ? 0 : quantity;
        this.units = this.quantity * this.packQty;        
        this.price = price == null ? 0 : price;
    }
}