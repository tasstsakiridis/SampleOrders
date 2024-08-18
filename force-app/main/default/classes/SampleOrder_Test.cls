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
        String rtStoreroom = aRecordTypes.get('Storeroom').getRecordTypeId();
        String rtSampleOrder = sapRecordTypes.get('Sample Order').getRecordTypeId(); 
        String rtSampleOrderLocked = sapRecordTypes.get('Sample Order Locked').getRecordTypeId();
        String rtSampleOrderItem = sapiRecordTypes.get('Sample Order').getRecordTypeId();
        String rtSampleOrderMX = sapRecordTypes.get('Sample Order - MEX').getRecordTypeId();
        String rtSampleOrderStoreroom = sapRecordTypes.get('Sample Order - Storeroom Request').getRecordTypeId();
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
                
        Account[] accounts = new Account[]{account1, account2};
        insert accounts;
        
        Banner_Groups__c banner1 = new Banner_Groups__c();
        banner1.Name = 'Test Duty Free Banner';
        banner1.Management_Group_State_Level__c = 'MGT_NAT';
        banner1.Market__c = mAU.Id;
        banner1.Ship_To_Code__c = '9999';
        banner1.Is_Active__c = true;
        insert banner1;

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
        sapConfig4.Classification__c = 'AU1-Samples for Brand Related Activities';
        sapConfig4.SoldTo_Code__c = 'CCA907C';
        sapConfig4.Is_Active__c = true;

        SAP_Interfaced_Data_Configuration__c sapConfig5 = new SAP_Interfaced_Data_Configuration__c();
        sapConfig5.RecordTypeId = rtGeneral;
        sapConfig5.Market__c = mAU.Id;
        sapConfig5.Classification__c = 'AU1-Samples for Brand Related Activities';
        sapConfig5.SoldTo_Code__c = 'CCA907C';
        sapConfig5.Is_Active__c = true;
        

        /*
        SAP_Interfaced_Data_Configuration__c mxConfig1 = new SAP_Interfaced_Data_Configuration__c();
        mxConfig1.RecordTypeId = rtSoldTo;
        mxConfig1.Market__c = mMX.Id;
        mxConfig1.Classification__c = 'Exhibits';
        mxConfig1.SoldTo_Code__c = 'CCA907C';
        mxConfig1.Is_Active__c = true;

        SAP_Interfaced_Data_Configuration__c mxConfig2 = new SAP_Interfaced_Data_Configuration__c();
        mxConfig2.RecordTypeId = rtShipTo;
        mxConfig2.Market__c = mMX.Id;
        mxConfig2.Classification__c = 'Exhibits';
        mxConfig2.ShipTo_Code__c = 'CCA907C';
        mxConfig2.Is_Active__c = true;
        
        SAP_Interfaced_Data_Configuration__c mxConfig3 = new SAP_Interfaced_Data_Configuration__c();
        mxConfig3.RecordTypeId = rtGeneral;
        mxConfig3.Market__c = mMX.Id;
        mxConfig3.Classification__c = 'Exhibits';
        mxConfig3.SoldTo_Code__c = 'CCA907C';
        mxConfig3.ShipTo_Code__c = 'CCA907C';
        mxConfig3.Plant_Code__c = 'PP1';
        mxConfig3.Is_Active__c = true;
        
        SAP_Interfaced_Data_Configuration__c[] l_sapConfigs = new SAP_Interfaced_Data_Configuration__c[]{sapConfig1, sapConfig2, sapConfig3, sapConfig4, mxConfig1, mxConfig2, mxConfig3};
        */
        SAP_Interfaced_Data_Configuration__c[] l_sapConfigs = new SAP_Interfaced_Data_Configuration__c[]{sapConfig1, sapConfig2, sapConfig3, sapConfig4, sapConfig5};
        insert l_sapConfigs;    
        
        Salesforce_Picklist_Controlling_Values__c spcv1 = new Salesforce_Picklist_Controlling_Values__c();
        spcv1.RecordType__c = 'Sample Order';
        spcv1.Object_Name__c = 'SAP_Interfaced_Data__c';
        spcv1.Field_Name__c = 'Classification__c';
        spcv1.Controller__c = 'RecordType';
        spcv1.Controller_Value__c = 'Sample Order';
        spcv1.Value__c = 'AU1-Samples for Brand Related Activities';
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
        
		SAP_Interfaced_Data__c sampleOrderAU = new SAP_Interfaced_Data__c();
        sampleOrderAU.RecordTypeId = rtSampleOrder;
        sampleOrderAU.Approval_Status__c = 'New';
        sampleOrderAU.Business_Address__c = '1 test street';
        sampleOrderAU.Business_City__c = 'Sydney';
        sampleOrderAU.Business_Country__c = 'AU';
        sampleOrderAU.Business_State__c = 'NSW';
        sampleOrderAU.Business_Postcode__c = '2000';
        sampleOrderAU.Business_Name__c = 'Test Sample Order';
        sampleOrderAU.Classification__c = 'AU1-Samples for Brand Related Activities';
        sampleOrderAU.Contact_Name__c = 'Test Sample Order Contact';
        sampleOrderAU.Contact_Phone__c = '95551234';
        sampleOrderAU.Market__c = mAU.Id;
        sampleOrderAU.Reason__c = 'Because';
        sampleOrderAU.Requested_Delivery_Date__c = today.addDays(7);
        sampleOrderAU.Banner_Group__c = banner1.Id;
        
		SAP_Interfaced_Data__c sampleOrderMX = new SAP_Interfaced_Data__c();
        sampleOrderMX.RecordTypeId = rtSampleOrderMX;
        sampleOrderMX.Approval_Status__c = 'New';
        sampleOrderMX.Business_Address__c = '1 test street';
        sampleOrderMX.Business_City__c = 'Sydney';
        sampleOrderMX.Business_Country__c = 'AU';
        sampleOrderMX.Business_State__c = 'NSW';
        sampleOrderMX.Business_Postcode__c = '2000';
        sampleOrderMX.Business_Name__c = 'Test Sample Order';
        sampleOrderMX.Classification__c = 'SD5 - SG&A';
        sampleOrderMX.Contact_Name__c = 'Test Sample Order Contact';
        sampleOrderMX.Contact_Phone__c = '95551234';
        sampleOrderMX.Market__c = mMX.Id;
        sampleOrderMX.Reason__c = 'Because';
        sampleOrderMX.Requested_Delivery_Date__c = today.addDays(7);
                
        SAP_Interfaced_Data__c[] sampleOrders = new SAP_Interfaced_Data__c[]{sampleOrderAU, sampleOrderMX};
        insert sampleOrders;
        
		SAP_Interfaced_Data_Item__c sapi = new SAP_Interfaced_Data_Item__c();
        sapi.RecordTypeId = rtSampleOrderItem;
		sapi.SAP_Interfaced_Data__c = sampleOrderAU.Id;
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
            Test.startTest();

            String theme = SampleOrder_Controller.getUIThemeDescription();
            System.assertEquals('Theme3', theme, 'Theme is not classic 2010 interface');

			//Map<String, Object> runningAsUser = SampleOrder_Controller.getCurrentUserInfo();
			//System.assertEquals('Test Tsakiridis', String.valueOf(runningAsUser.get('userName')));
            
            //bfObjectDescribe obj = SampleOrder_Controller.getObjectDetails();
            //System.assertEquals('SAP_Interfaced_Data__c', obj.apiName);
            
            List<Map<String, Object>> lSampleOrders = SampleOrder_Controller.getSampleOrders();
            System.assertNotEquals(0, lSampleOrders.size(), 'Sample orders have been found');
            
            SAP_Interfaced_Data__c newSampleOrder = SampleOrder_Controller.getSampleOrder(sampleOrderAU.Id);
            System.assertNotEquals(null, newSampleOrder, 'sample order retrieved');
            
            SAP_Interfaced_Data__c interfacedData = SampleOrder_Controller.getInterfacedData(sampleOrderMX.Id);
            System.assertNotEquals(null, interfacedData, 'interfaced data retrieved');
            
            List<Promotion_Activity__c> activities = SampleOrder_Controller.getPromotionActivities('MX - PSA');
            
            
            String json = '[{"id":"","productId":"'+lProducts.get(0).Id+'","quantity":"1", "price":"1", "usedFor":"Sample Order"}]';
            
            sampleOrderAU = SampleOrder_Controller.saveSampleOrder(sampleOrderAU, mAU.Id, mAU.Name);
            sampleOrderMX = SampleOrder_Controller.saveSampleOrder(sampleOrderMX, mMX.Id, mMX.Name);
            List<SAP_Interfaced_Data_Item__c> orderItems = SampleOrder_Controller.saveOrderItems(sampleOrderMX.Id, 'Sample Order - MEX', 'Mexico', activity1.Id, json);
                
            sampleOrderMX = SampleOrder_Controller.getSampleOrder(sampleOrderMX.Id);
            System.assertNotEquals(null, sampleOrderMX);
            
            List<SampleOrderItem> newProducts = SampleOrder_Controller.getProducts(sampleOrderAU.Id);
            System.assertNotEquals(0, newProducts.size());
            
            List<Banner_Groups__c> bannerGroups = SampleOrder_Controller.getBannerGroups();
            System.assertNotEquals(bannerGroups, null);
            
            List<Account> storageLockers = SampleOrder_Controller.getStorageLockers('');
            List<Map<String, Object>> storerooms = SampleOrder_Controller.getStorerooms();
            List<Internal_Order__c> internalOrderNumbers = SampleOrder_Controller.getInternalOrderNumbers('');
            System.debug('internalOrderNumbers: ' + internalOrderNumbers);
            
            List<Account> accountDetails = SampleOrder_Controller.getAccountDetails(account1.Id);
            System.assertNotEquals(null, accountDetails);
            
            SampleOrderItem soi = new SampleOrderItem();
            System.assertEquals('', soi.id);
            
            sampleOrderAU.Approval_Status__c = 'Approved';
            sampleOrderAU.RecordTypeId = rtSampleOrderLocked;
            update sampleOrderAU;
            
            SimpleListItem sli = new SimpleListItem();
            System.assertNotEquals(null, sli);
            
            sli = new SimpleListItem('id', 'name');
            System.assertEquals('id', sli.id);
            
            sli = new SimpleListItem('id', 'name', false, '');
            System.assertEquals('id', sli.id);
            
            sli = new SimpleListItem('id', 'name', false, '', false);
            System.assertEquals('id', sli.id);
            
            Map<String, bfFieldDescribe> l_controllingValues = SampleOrder_Controller.getPicklistValuesForRecordType('Sample Order');
            
            ApprovalHistory ahist = SampleOrder_Controller.getApprovalHistory(sampleOrderAU.Id);
            System.debug('approvalhistory: ' + ahist);
            
            ApprovalHistoryItem ahi = new ApprovalHistoryItem();
            ahi = new ApprovalHistoryItem('actor','status','comments', now);
            ahi = new ApprovalHistoryItem('actor','status','comments', now, 'role');

            bfColumn col = new bfColumn('name', 'label', 'value');
            bfColumn col2 = new bfColumn('name', 'label', 'value', Schema.DisplayType.STRING, false, false);
            
            bfObjectDescribe desc1 = new bfObjectDescribe('Account', 'Account', 'Accounts');
            bfObjectDescribe desc2 = new bfObjectDescribe('Account', 'Account', 'Accounts', true, false, false);
            
            SampleOrder_Controller.submitForApproval(sampleOrderMX.Id, 'Mexico', 'Sample Order - MEX', 'Approved');

            Test.stopTest();
       }
        
        
    }
}