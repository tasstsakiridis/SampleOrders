@isTest
public class SampleOrder_Test {
    static testMethod void unitTest1() {
        Date today = Date.today();
        DateTime now = DateTime.now();

        INFW_TestHelper helper = new INFW_TestHelper();

        Map<String, RecordTypeInfo> pRecordTypes = Schema.SObjectType.Product__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> sapRecordTypes = Schema.SObjectType.SAP_Interfaced_Data__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> sapiRecordTypes = Schema.SObjectType.SAP_Interfaced_Data_Item__c.getRecordTypeInfosByName();

        String rtSampleOrder = sapRecordTypes.get('Sample Order').getRecordTypeId(); 
        String rtSampleOrderLocked = sapRecordTypes.get('Sample Order Locked').getRecordTypeId();
        String rtSampleOrderItem = sapiRecordTypes.get('Sample Order').getRecordTypeId();
        String rtWetGoods = pRecordTypes.get('Wet Goods').getRecordTypeId();
       
        Market__c mAU = helper.createMarket('Australia');
        mAU.Vistex_Clearing_Account__c = '0123456789';
		mAU.Country_ISO_Code_2__c = 'AU';
	    insert mAU;
        
        User mgr = helper.createUser('System Administrator', 'Mgr', 'Tsakiridis', '');
        mgr.Market__c = 'Australia';
        insert mgr;

        User user1 = helper.createUser('System Administrator', 'Test', 'Tsakiridis', '');
        user1.Market__c = 'Australia';
        user1.ManagerId = mgr.Id;
        user1.Manages_Brand__c = 'Gentleman Jack';
        user1.Email = 'tass_tsakiridis@b-f.com';
        insert user1;
		        
        Supplier__c supplier = helper.createSupplier('Test Supplier', true);
        insert supplier;
        
        Brand__c brand = helper.createBrand('Gentleman Jack', 'Spirits', '0987', supplier.Id);
        insert brand;
        
        List<Product__c> lProducts = helper.createProducts(5, 'Wet Goods', mAU.Id, brand.Id, false);
        for(Product__c p : lProducts) {
            p.Used_For__c = 'Sample Order';
        }
        insert lProducts;
        
		SAP_Interfaced_Data__c sampleOrder = new SAP_Interfaced_Data__c();
        sampleOrder.RecordTypeId = rtSampleOrder;
        sampleOrder.Approval_Status__c = 'New';
        sampleOrder.Business_Address__c = '1 test street';
        sampleOrder.Business_City__c = 'Sydney';
        sampleOrder.Business_Country__c = 'AU';
        sampleOrder.Business_State__c = 'NSW';
        sampleOrder.Business_Postcode__c = '2000';
        sampleOrder.Business_Name__c = 'Test Sample Order';
        sampleOrder.Classification__c = 'AU1-Samples for Marketing Related Activities';
        sampleOrder.Contact_Name__c = 'Test Sample Order Contact';
        sampleOrder.Contact_Phone__c = '95551234';
        sampleOrder.Market__c = mAU.Id;
        sampleOrder.Reason__c = 'Because';
        sampleOrder.Requested_Delivery_Date__c = today.addDays(7);
        insert sampleOrder;
        
		SAP_Interfaced_Data_Item__c sapi = new SAP_Interfaced_Data_Item__c();
        sapi.RecordTypeId = rtSampleOrderItem;
		sapi.SAP_Interfaced_Data__c = sampleOrder.Id;
		sapi.Product__c = lProducts.get(0).Id;
		sapi.Quantity__c = 1;
		insert sapi;     
        
        System.runAs(user1) {
            String theme = SampleOrder_Controller.getUIThemeDescription();
            System.assertEquals('Theme3', theme, 'Theme is not classic 2010 interface');

			User runningAsUser = SampleOrder_Controller.getCurrentUserInfo();
			System.assertEquals('Test Tsakiridis', runningAsUser.Name);
            
            bfObjectDescribe obj = SampleOrder_Controller.getObjectDetails();
            System.assertEquals('SAP_Interfaced_Data__c', obj.apiName);
            
            List<SAP_Interfaced_Data__c> lSampleOrders = SampleOrder_Controller.getSampleOrders();
            System.assertNotEquals(0, lSampleOrders.size(), 'Sample orders have been found');
            
            SAP_Interfaced_Data__c newSampleOrder = SampleOrder_Controller.getSampleOrder(sampleOrder.Id);
            System.assertNotEquals(null, newSampleOrder, 'sample order retrieved');
            
            String json = '[{"id":"","productId":"'+lProducts.get(0).Id+'","quantity":"1"}]';
            newSampleOrder = SampleOrder_Controller.saveSampleOrder(newSampleOrder);
            List<SAP_Interfaced_Data_Item__c> items = SampleOrder_Controller.saveOrderItems(newSampleOrder.Id, json);
            System.assertNotEquals(0, items.size(), 'Items saved');
            
            newSampleOrder = SampleOrder_Controller.getInterfacedData(newSampleOrder.Id);
            System.assertNotEquals(null, newSampleOrder);
            
            List<SampleOrderItem> newProducts = SampleOrder_Controller.getProducts(sampleOrder.Id);
            System.assertNotEquals(0, newProducts.size());
            
            SampleOrder_Controller.submitForApproval(sampleOrder.Id);
            
            SampleOrderItem soi = new SampleOrderItem();
            System.assertEquals('', soi.id);
            
            sampleOrder.Approval_Status__c = 'Approved';
            sampleOrder.RecordTypeId = rtSampleOrderLocked;
            update sampleOrder;
            
            SimpleListItem sli = new SimpleListItem();
            System.assertNotEquals(null, sli);
            
            sli = new SimpleListItem('id', 'name');
            System.assertEquals('id', sli.id);
            
            sli = new SimpleListItem('id', 'name', false, '');
            System.assertEquals('id', sli.id);
            
            sli = new SimpleListItem('id', 'name', false, '', false);
            System.assertEquals('id', sli.id);
            
        }
        
        
    }
}