public with sharing class SampleOrder_Controller {

    @AuraEnabled
    public static User getCurrentUserInfo() {
    	User u = [SELECT Id, Name, Market__c FROM User WHERE Id =:UserInfo.getUserId()];
        return u;
    }
    
	@AuraEnabled
	public static String getUIThemeDescription() {
		String theme = UserInfo.getUiThemeDisplayed();
		return theme;
	}
    
    @AuraEnabled
    public static bfObjectDescribe getObjectDetails() {
        system.debug('[SampleOrder_Controller.getObjectDetails]');
        bfObjectDescribe obj = new bfObjectDescribe('SAP_Interfaced_Data__c');
        obj.getDescribe(true, true, true);
        return obj;
    }
    
    @AuraEnabled
    public static List<SAP_Interfaced_Data__c> getSampleOrders() {
        System.debug('current user: ' + UserInfo.getLastName() + ', ' + UserInfo.getFirstName() + ', ' + UserInfo.getUserId());
    	return Sample_Order_Helper.getSampleOrders();
    }
    
    @AuraEnabled
    public static SAP_Interfaced_Data__c getSampleOrder(String recordId) {
        if (recordId == null || recordId == '') { return null; }
        return [SELECT Id, Name, Order_Number__c, Approval_Status__c, Requested_Delivery_Date__c, Authorised_By__c, Authorised_By__r.Name, Authorised_Date__c, Finance_Authorised_By__c, Finance_Authorised_Date__c, Classification__c, Business_Name__c, Business_Address__c, Business_City__c, Business_State__c, Business_Postcode__c, Business_Country__c, Contact_Name__c, Contact_Phone__c, Reason__c, Is_International_Order__c, (SELECT Id, Name, SAP_Interfaced_Data__c, Product__c, Brand_Name__c, Product_Code__c, Quantity__c FROM SAP_Interfaced_Data_Items__r) FROM SAP_Interfaced_Data__c WHERE Id=:recordId];
    }
    
    @AuraEnabled
    public static SAP_Interfaced_Data__c saveSampleOrder(SAP_Interfaced_Data__c theSampleOrder) {
        if (theSampleOrder != null) {
            Market__c market = [SELECT Id FROM Market__c WHERE Country_ISO_Code_2__c =:theSampleOrder.Business_Country__c LIMIT 1];
            if (market != null) {
                theSampleOrder.Market__c = market.Id;
            }
            upsert theSampleOrder;
        }
        
        return theSampleOrder;
    }
    
    @AuraEnabled
    public static List<SampleOrderItem> saveOrderItems(String sapId, String sapItems) {
        if (sapId == null || sapId == '') { return null; }
        if (sapItems == null || sapItems.length() == 0) { return null; }
        
        Map<String, RecordTypeInfo> rtList = SAP_Interfaced_Data_Item__c.SObjectType.getDescribe().getRecordTypeInfosByName();
        String rtSampleOrder = rtList.get('Sample Order').getRecordTypeId();
        
        System.debug('sapId: ' + sapId);
        List<SAP_Interfaced_Data_Item__c> l_SAPItems = new List<SAP_Interfaced_Data_Item__c>();
        List<SampleOrderItem> items = (List<SampleOrderItem>)System.JSON.deserializeStrict(sapItems, List<SampleOrderItem>.Class);
        System.debug('# of items to save: ' + items.size());
        SAP_Interfaced_Data_Item__c sapItem;
        try {
            for(SampleOrderItem s : items) {
                System.debug('items.key id: ' + s.id + ', product: ' + s.productId);
            }
            
            for(SampleOrderItem i : items) {
                sapItem = new SAP_Interfaced_Data_Item__c();
                sapItem.RecordTypeId = rtSampleOrder;
                sapItem.SAP_Interfaced_Data__c = sapId;
                sapItem.Product__c = i.productId;
                sapItem.Quantity__c = i.quantity;
                if(i.id != i.productId && i.id != '') {
                    sapItem.Id = i.Id;
                }
                l_SAPItems.add(sapItem);
            }
        } catch(Exception ex) {
            System.debug('exception: ' + ex.getMessage());
        }     
        
        upsert l_SAPItems;
        for(SAP_Interfaced_Data_Item__c i : l_SAPItems) {
            for(SampleOrderItem soi : items) {
                if (soi.productId == i.Product__c) {
                    soi.Id = i.Id; break;
                }
            }
        }
        
        return items;
    }

	@AuraEnabled
    public static SAP_Interfaced_Data__c getInterfacedData(String sapId) {
        if (sapId == null || sapId.length() == 0) { return null; }
        
        SAP_Interfaced_Data__c sap = [SELECT Id, Name, Requested_Delivery_Date__c, Classification__c, Business_Name__c, Business_Address__c, Business_City__c, Business_State__c, Business_Country__c, Contact_Name__c, Contact_Phone__c, Reason__c, (SELECT Id, Name, Product__c, SAP_Interfaced_Data__c, Brand_Name__c, Product_Code__c FROM SAP_Interfaced_Data_Items__r) FROM SAP_Interfaced_Data__c WHERE Id =:sapId];
        return sap;
    }   
    
    @AuraEnabled
    public static List<SampleOrderItem> getProducts(String sapId) {        
		Market__c market;
        User u = getCurrentUserInfo();
        if (u != null) {
            market = [SELECT Id, Name FROM Market__c WHERE Name =:u.Market__c];
        }
        if (market == null) {
            market = [SELECT Id, Name FROM Market__c WHERE Name = 'Australia'];
        }
        
        Boolean found = false;
        List<Product__c> products = [SELECT Id, Name, Brand__c, Brand_Name__c, Pack_Quantity__c FROM Product__c WHERE IsActive__c = true AND Market__c=:market.Id AND Used_For__c INCLUDES ('Sample Order')];
        
        List<SampleOrderItem> items = new List<SampleOrderItem>();
        for(Product__c p : products) {
            items.add(new SampleOrderItem('', p.Id, p.Name, p.Brand_Name__c, (Integer)p.Pack_Quantity__c, 0));
        }
        return items;
    }
    
    @AuraEnabled
    public static void submitForApproval(String sapId) {
        System.debug('sapId: ' + sapId);
        if (sapId != null && sapId.length() > 0) {            
            Approval.ProcessSubmitRequest req1 = new Approval.ProcessSubmitRequest();
            req1.setObjectId(sapId);
            Approval.ProcessResult result = Approval.process(req1);
        }
        
    }
}