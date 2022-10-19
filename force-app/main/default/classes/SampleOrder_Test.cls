@isTest
public class SampleOrder_Test {
    static testMethod void unitTest1() {
        Date today = Date.today();
        DateTime now = DateTime.now();

        INFW_TestHelper helper = new INFW_TestHelper();

        Map<String, RecordTypeInfo> aRecordTypes = Schema.SObjectType.Account.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> pRecordTypes = Schema.SObjectType.Product__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> sapRecordTypes = Schema.SObjectType.SAP_Interfaced_Data__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> sapiRecordTypes = Schema.SObjectType.SAP_Interfaced_Data_Item__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> bannerRecordTypes = Schema.SObjectType.Banner_Groups__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> sapConfigRecordTypes = Schema.SObjectType.SAP_Interfaced_Data_Configuration__c.getRecordTypeInfosByName();

        String rtAUAccount = aRecordTypes.get('AUD - Outlet').getRecordTypeId();
        String rtSampleOrder = sapRecordTypes.get('Sample Order').getRecordTypeId(); 
        String rtSampleOrderLocked = sapRecordTypes.get('Sample Order Locked').getRecordTypeId();
        String rtSampleOrderItem = sapiRecordTypes.get('Sample Order').getRecordTypeId();
        String rtWetGoods = pRecordTypes.get('Wet Goods').getRecordTypeId();
        String rtAUBannerGroup = bannerRecordTypes.get('AUD - Banner Groups').getRecordTypeId();
        String rtShipTo = sapConfigRecordTypes.get('ShipTo').getRecordTypeId();
        String rtSoldTo = sapConfigRecordTypes.get('SoldTo').getRecordTypeId();
        String rtGeneral = sapConfigRecordTypes.get('General').getRecordTypeId();
       
        Market__c mAU = helper.createMarket('Australia');
        mAU.Vistex_Clearing_Account__c = '0123456789';
		mAU.Country_ISO_Code_2__c = 'AU';
        mAU.Sample_Order_Notify_Brand_Managers__c = true;
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
		      
        Account account1 = new Account();
        account1.RecordTypeId = rtAUAccount;
        account1.Market__c = mAU.Id;
        account1.Name = 'Test Account';
        insert account1;
        
		SAP_Interfaced_Data_Configuration__c sapConfig1 = new SAP_Interfaced_Data_Configuration__c();
        sapConfig1.RecordTypeId = rtShipTo;
        sapConfig1.Market__c = mAU.Id;
        sapConfig1.State__c = 'ACT';
        sapConfig1.ShipTo_Code__c = '2016919';
        sapConfig1.Is_Active__c = true;

		SAP_Interfaced_Data_Configuration__c sapConfig2 = new SAP_Interfaced_Data_Configuration__c();
        sapConfig2.RecordTypeId = rtShipTo;
        sapConfig2.Market__c = mAU.Id;
        sapConfig2.State__c = 'NSW';
        sapConfig2.ShipTo_Code__c = '2016919';
        sapConfig2.Is_Active__c = true;

		SAP_Interfaced_Data_Configuration__c sapConfig3 = new SAP_Interfaced_Data_Configuration__c();
        sapConfig3.RecordTypeId = rtShipTo;
        sapConfig3.Market__c = mAU.Id;
        sapConfig3.State__c = 'VIC';
        sapConfig3.ShipTo_Code__c = '2016921';
        sapConfig3.Is_Active__c = true;
        
        SAP_Interfaced_Data_Configuration__c sapConfig4 = new SAP_Interfaced_Data_Configuration__c();
        sapConfig4.RecordTypeId = rtSoldTo;
        sapConfig4.Market__c = mAU.Id;
        sapConfig4.Classification__c = 'AU1-Samples for Marketing Related Activities';
        sapConfig4.SoldTo_Code__c = 'CCA907C';
        sapConfig4.Is_Active__c = true;
        
        SAP_Interfaced_Data_Configuration__c[] l_sapConfigs = new SAP_Interfaced_Data_Configuration__c[]{sapConfig1, sapConfig2, sapConfig3, sapConfig4};
        insert l_sapConfigs;    
        
        Salesforce_Picklist_Controlling_Values__c spcv1 = new Salesforce_Picklist_Controlling_Values__c();
        spcv1.RecordType__c = 'Sample Order';
        spcv1.Object_Name__c = 'SAP_Interfaced_Data__c';
        spcv1.Field_Name__c = 'Classification__c';
        spcv1.Controller__c = 'RecordType';
        spcv1.Controller_Value__c = 'Sample Order';
        spcv1.Value__c = 'AU1-Samples for Marketing Related Activities';
        spcv1.Is_Active__c = true;
        spcv1.Market__c = mAU.Id;
        
        Salesforce_Picklist_Controlling_Values__c spcv2 = new Salesforce_Picklist_Controlling_Values__c();
        spcv2.RecordType__c = 'Sample Order';
        spcv2.Object_Name__c = 'SAP_Interfaced_Data__c';
        spcv2.Field_Name__c = 'Classification__c';
        spcv2.Controller__c = 'RecordType';
        spcv2.Controller_Value__c = 'Sample Order';
        spcv2.Value__c = 'AU2-Samples for Sales Related Activities';
        spcv2.Is_Active__c = true;
        spcv2.Market__c = mAU.Id;
        
        Salesforce_Picklist_Controlling_Values__c spcv3 = new Salesforce_Picklist_Controlling_Values__c();
        spcv3.RecordType__c = 'Sample Order';
        spcv3.Object_Name__c = 'SAP_Interfaced_Data__c';
        spcv3.Field_Name__c = 'Classification__c';
        spcv3.Controller__c = 'RecordType';
        spcv3.Controller_Value__c = 'Sample Order';
        spcv3.Value__c = 'AU6-Ecomm Sample Orders';
        spcv3.Is_Active__c = true;
        spcv3.Market__c = mAU.Id;
        
        Salesforce_Picklist_Controlling_Values__c[] l_spcv = new Salesforce_Picklist_Controlling_Values__c[]{spcv1, spcv2, spcv3};
        insert l_spcv;
        
        
        
        Supplier__c supplier = helper.createSupplier('Test Supplier', true);
        insert supplier;
        
        Brand__c brand = helper.createBrand('Gentleman Jack', 'Spirits', '0987', supplier.Id);
        insert brand;
        
        List<Product__c> lProducts = helper.createProducts(5, 'Wet Goods', mAU.Id, brand.Id, false);
        for(Product__c p : lProducts) {
            p.Used_For__c = 'Sample Order';
        }
        lProducts[0].Used_For__c = 'Sample Order;High Value';
        insert lProducts;
        
        Banner_Groups__c banner1 = new Banner_Groups__c();
        banner1.Name = 'Test Duty Free Banner';
        banner1.Management_Group_State_Level__c = 'MGT_NAT';
        banner1.Market__c = mAU.Id;
        insert banner1;

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

			SimpleListItem runningAsUser = SampleOrder_Controller.getCurrentUserInfo();
			System.assertEquals('Test Tsakiridis', runningAsUser.name);
            
            bfObjectDescribe obj = SampleOrder_Controller.getObjectDetails();
            System.assertEquals('SAP_Interfaced_Data__c', obj.apiName);
            
            List<Map<String, Object>> lSampleOrders = SampleOrder_Controller.getSampleOrders();
            System.assertNotEquals(0, lSampleOrders.size(), 'Sample orders have been found');
            
            SAP_Interfaced_Data__c newSampleOrder = SampleOrder_Controller.getSampleOrder(sampleOrder.Id);
            System.assertNotEquals(null, newSampleOrder, 'sample order retrieved');
            
            String json = '[{"id":"","productId":"'+lProducts.get(0).Id+'","quantity":"1"}]';
            newSampleOrder = SampleOrder_Controller.saveSampleOrder(newSampleOrder, mAU.Id);
            List<SAP_Interfaced_Data_Item__c> items = SampleOrder_Controller.saveOrderItems(newSampleOrder.Id, json);
            System.assertNotEquals(0, items.size(), 'Items saved');
            
            newSampleOrder = SampleOrder_Controller.getSampleOrder(newSampleOrder.Id);
            System.assertNotEquals(null, newSampleOrder);
            
            List<SampleOrderItem> newProducts = SampleOrder_Controller.getProducts(sampleOrder.Id);
            System.assertNotEquals(0, newProducts.size());
            
            List<Banner_Groups__c> bannerGroups = SampleOrder_Controller.getBannerGroups();
            System.assertNotEquals(bannerGroups, null);

            System.debug('record type id: ' + newSampleOrder.RecordTypeId);
            System.debug('status: ' + newSampleOrder.Approval_Status__c);
            //SampleOrder_Controller.submitForApproval(newSampleOrder.Id);
            
            List<Account> storageLockers = SampleOrder_Controller.getStorageLockers();
            
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
            
            Map<String, bfFieldDescribe> l_controllingValues = SampleOrder_Controller.getPicklistValuesForRecordType('Sample Order');

            List<Internal_Order__c> internalOrderNumbers = SampleOrder_Controller.getInternalOrderNumbers();
            System.debug('internalOrderNumbers: ' + internalOrderNumbers);
            
            List<Account> accountDetails = SampleOrder_Controller.getAccountDetails(account1.Id);
            System.assertNotEquals(null, accountDetails);
            
            ApprovalHistory ahist = SampleOrder_Controller.getApprovalHistory(sampleOrder.Id);
            System.debug('approvalhistory: ' + ahist);
            
            ApprovalHistoryItem ahi = new ApprovalHistoryItem();
            ahi = new ApprovalHistoryItem('actor','status','comments', now);
            ahi = new ApprovalHistoryItem('actor','status','comments', now, 'role');
        }
        
        
    }
}