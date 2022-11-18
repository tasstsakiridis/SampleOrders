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
        Map<String, RecordTypeInfo> paRecordTypes = Schema.SObjectType.Promotion_Activity__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> promoRecordTypes = Schema.SObjectType.Promotion__c.getRecordTypeInfosByName();

        String rtAUAccount = aRecordTypes.get('AUD - Outlet').getRecordTypeId();
        String rtMXAccount = aRecordTypes.get('MX - Outlet On').getRecordTypeId();
        //String rtStoreroom = aRecordTypes.get('Storeroom').getRecordTypeId();
        String rtSampleOrder = sapRecordTypes.get('Sample Order').getRecordTypeId(); 
        String rtSampleOrderLocked = sapRecordTypes.get('Sample Order Locked').getRecordTypeId();
        String rtSampleOrderItem = sapiRecordTypes.get('Sample Order').getRecordTypeId();
        String rtSampleOrderMX = sapRecordTypes.get('Sample Order - MEX').getRecordTypeId();
        String rtWetGoods = pRecordTypes.get('Wet Goods').getRecordTypeId();
        String rtAUBannerGroup = bannerRecordTypes.get('AUD - Banner Groups').getRecordTypeId();
        String rtShipTo = sapConfigRecordTypes.get('ShipTo').getRecordTypeId();
        String rtSoldTo = sapConfigRecordTypes.get('SoldTo').getRecordTypeId();
        String rtGeneral = sapConfigRecordTypes.get('General').getRecordTypeId();
        String rtMexicoPSA = paRecordTypes.get('MX - PSA').getRecordTypeId();
        String rtPromoPSA = promoRecordTypes.get('MX - PSA').getRecordTypeId();
       
        Market__c mAU = helper.createMarket('Australia');
        mAU.Vistex_Clearing_Account__c = '0123456789';
		mAU.Country_ISO_Code_2__c = 'AU';
        mAU.Sample_Order_Notify_Brand_Managers__c = true;
        
        Market__c mMX = helper.createMarket('Mexico');
        mMX.Country_ISO_Code_2__c = 'MX';
        
        Market__c[] markets = new Market__c[]{mAU, mMX};
	    insert markets;
        
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
        
        Account account2 = new Account();
        account2.RecordTypeId = rtMXAccount;
        account2.Market__c = mMX.Id;
        account2.Name = 'Test MX Account';
        
        //Account storeroom = new Account();
        //storeroom.RecordTypeId = rtStoreroom;
        //storeroom.Market__c = mMX.Id;
        //storeroom.Name = 'Storeroom';
        //storeroom.Status__c = 'Active';
        
        Account[] accounts = new Account[]{account1, account2};
        insert accounts;
        
        Contact contact1 = new Contact();
        contact1.AccountId = account2.Id;
        contact1.FirstName = 'Test';
        contact1.LastName = 'Contact';
        contact1.Decision_Maker__c = true;
        insert contact1;
        
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
        lProducts[0].Used_For__c = 'Sample Order;High Value;Sample Order - MX';
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
        
		SAP_Interfaced_Data__c sampleOrder2 = new SAP_Interfaced_Data__c();
        sampleOrder2.RecordTypeId = rtSampleOrderMX;
        sampleOrder2.Approval_Status__c = 'New';
        sampleOrder2.Business_Address__c = '1 test street';
        sampleOrder2.Business_City__c = 'Sydney';
        sampleOrder2.Business_Country__c = 'AU';
        sampleOrder2.Business_State__c = 'NSW';
        sampleOrder2.Business_Postcode__c = '2000';
        sampleOrder2.Business_Name__c = 'Test Sample Order';
        sampleOrder2.Classification__c = 'Exhibits';
        sampleOrder2.Contact_Name__c = 'Test Sample Order Contact';
        sampleOrder2.Contact_Phone__c = '95551234';
        sampleOrder2.Market__c = mMX.Id;
        sampleOrder2.Reason__c = 'Because';
        sampleOrder2.Requested_Delivery_Date__c = today.addDays(7);
        
        SAP_Interfaced_Data__c[] sampleOrders = new SAP_Interfaced_Data__c[]{sampleOrder, sampleOrder2};
        insert sampleOrders;
        
		SAP_Interfaced_Data_Item__c sapi = new SAP_Interfaced_Data_Item__c();
        sapi.RecordTypeId = rtSampleOrderItem;
		sapi.SAP_Interfaced_Data__c = sampleOrder.Id;
		sapi.Product__c = lProducts.get(0).Id;
		sapi.Quantity__c = 1;
		insert sapi;     
        
        Promotion_Activity__c activity1 = new Promotion_Activity__c();
        activity1.RecordTypeId = rtMexicoPSA;
        activity1.Market__c = mMX.Id;
        activity1.Account__c = account2.Id;
        activity1.Contact__c = contact1.Id;
        activity1.Begin_Date__c = Date.today();
        activity1.End_Date__c = activity1.Begin_Date__c.addDays(30);
        activity1.Is_Length_in_Years__c = false;
        activity1.Length_of_Agreement__c = 1;
        activity1.Number_of_Payments__c = 2;
        activity1.Status__c = 'Approved';
        activity1.Limit_to_Selected_Accounts__c = false;
        activity1.Activity_Type__c = 'Direct Rebate';
        insert activity1;
        
        Promotion__c promo1 = new Promotion__c();
        promo1.RecordTypeId = rtPromoPSA;
        promo1.Account__c = account2.Id;
        promo1.Promotion_Activity__c = activity1.Id;
        insert promo1;
        
        Promotion_Material_Item__c pmi1 = new Promotion_Material_Item__c();
        pmi1.Activity__c = activity1.Id;
        pmi1.Promotion__c = promo1.Id;
        pmi1.Product_Custom__c = lProducts.get(0).Id;
        pmi1.Approval_Status__c = 'New';
        pmi1.Listing_Fee__c = 1000;
        pmi1.Free_Bottle_Quantity__c = 10;
        pmi1.Plan_Volume__c = 10;
        insert pmi1;
        
        PMI_Actual__c pmia = new PMI_Actual__c();
        pmia.Rebate_Type__c = 'Free Goods';
        pmia.Act_Qty__c = 5;
        pmia.Rebate_Amount__c = 5;
        pmia.Activity__c = activity1.Id;
        pmia.Promotion__c = promo1.Id;
        pmia.Promotion_Material_Item__c = pmi1.Id;
        pmia.Approval_Status__c = 'Paid';
        pmia.Period__c = 0;
        pmia.External_Key__c = pmi1.Promotion__c + '_' + pmi1.Id + '_Free Goods-0';
        insert pmia;
        
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
            
            SAP_Interfaced_Data__c interfacedData = SampleOrder_Controller.getInterfacedData(sampleOrder2.Id);
            System.assertNotEquals(null, interfacedData, 'interfaced data retrieved');
            
            //List<Account> storerooms = SampleOrder_Controller.getStorerooms();
            List<Promotion_Activity__c> activities = SampleOrder_Controller.getPromotionActivities('MX - PSA');
            
            
            String json = '[{"id":"","productId":"'+lProducts.get(0).Id+'","quantity":"1"}]';
            newSampleOrder = SampleOrder_Controller.saveSampleOrder(newSampleOrder, mAU.Id);
            List<SAP_Interfaced_Data_Item__c> items = SampleOrder_Controller.saveOrderItems(newSampleOrder.Id, 'Sample Order', 'Australia', '', json);
            System.assertNotEquals(0, items.size(), 'Items saved');
            
            List<SAP_Interfaced_Data_Item__c> order2Items = SampleOrder_Controller.saveOrderItems(sampleOrder2.Id, 'Sample Order - MEX', 'Mexico', activity1.Id, json);
                
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