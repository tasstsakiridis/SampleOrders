global class SampleOrderItem {
	@AuraEnabled
    public String id { get; set; }
    
    @AuraEnabled
    public String productId { get; set; }
    
    @AuraEnabled
    public String productName { get; set; }
    
    @AuraEnabled
    public String brandId { get; set; }

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
    public Decimal cogs { get; set; }

    @AuraEnabled
    public String convertedCases { get; set; }
    
    @AuraEnabled 
    public String productCode { get; set; }

    @AuraEnabled 
    public String internalOrderNumber { get; set; }

    @AuraEnabled
    public Decimal totalActualQty { get; set; }

    @AuraEnabled
    public Decimal totalPlannedQty { get; set; }

    public SampleOrderItem() {
        this.id = '';
        this.productId = '';
        this.productName = '';
        this.productCode = '';
        this.brandId = '';
        this.brandName = '';
        this.usedFor = '';
        this.quantity = 0;
        this.packQty = 0;
        this.units = 0;
        this.price = 0;
        this.cogs = 0;
        this.internalOrderNumber = '';
        this.convertedCases = '';
        this.totalActualQty = 0;
        this.totalPlannedQty = 0;
    }
    
    public SampleOrderItem(String id, String productId, String productName, String productCode, String brandId, String brandName, String usedFor, Integer packQty, Integer quantity, Decimal price, Decimal cogs, String internalOrderNumber, String convertedCases, Decimal totalActualQty, Decimal totalPlannedQty) {
        this.id = (id == null || id == '' ? productId : id);
        this.productId = productId;
        this.productName = productName;
        this.productCode = productCode;
        this.brandId = brandId;
        this.brandName = brandName;
        this.usedFor = usedFor;
        this.packQty = packQty == null ? 1 : packQty;
        this.quantity = quantity == null ? 0 : quantity;
        this.units = this.quantity * this.packQty;        
        this.cogs = cogs == null ? 0 : cogs;
        this.price = price == null || price == 0 ? this.cogs : price;
        this.internalOrderNumber = internalOrderNumber;
        this.convertedCases = convertedCases;
        this.totalActualQty = totalActualQty;
        this.totalPlannedQty = totalPlannedQty;
    }
}