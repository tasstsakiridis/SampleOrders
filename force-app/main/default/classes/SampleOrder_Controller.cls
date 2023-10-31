public with sharing class SampleOrder_Controller {

    @AuraEnabled
    public static Map<String, Object> getCurrentUserInfo() {
    	User u = [SELECT Id, Name, Market__c, MobilePhone, UserRoleId, UserRole.Name, ProfileId, Profile.Name FROM User WHERE Id =:UserInfo.getUserId()];
        List<GroupMember> groups = [SELECT Id, UserOrGroupId FROM GroupMember WHERE Group.DeveloperName ='Korea_Supply_Chain_Manager'];
        Market__c m = [SELECT Id, Name, Country_ISO_Code_2__c, Sample_Order_Lead_Time__c, Allow_International_Orders__c, Allow_Status_Change__c,
                            Accounts__c, Activities__c, Cost_Centers__c, Internal_Order_Numbers__c, Storage_Lockers__c, Show_Product_Price__c,
                            Standard_Address_Input__c, Shipping_Instructions__c, Submit_Order_for_Approval__c, Capture_Volume_in_Bottles__c, 
                            Show_Wholesalers__c, Sample_Order_Account_RecordType__c, Sample_Order_Wholesaler_RecordType__c, Show_Sticker_Types__c,
                            Show_Approval_History__c, Delivery_Options__c, Show_Sample_Order_Guidance__c 
                         FROM Market__c 
                        WHERE Name =:u.Market__c LIMIT 1];

        Boolean isSupplyChain = false;
        if (groups != null && groups.size() > 0) {
            String userId = UserInfo.getUserId();
            String roleId = UserInfo.getUserRoleId();
            for(GroupMember gm : groups) {
                if (gm.UserOrGroupId == userId || gm.UserOrGroupId == roleId) {
                    isSupplyChain = true; break;
                }
            }

            if (!isSupplyChain) {
                isSupplyChain = u.ProfileId != null && u.Profile.Name == 'System Administrator';
            }
        }

        Map<String, Object> result = new Map<String, Object>();
        result.put('marketId', m.Id);
        result.put('marketName', m.Name);
        result.put('market', m);
        result.put('userId', u.Id);
        result.put('userName', u.Name);
        result.put('user', u);
        result.put('isSupplyChain', isSupplyChain);

        return result;
    }    
	@AuraEnabled
	public static String getUIThemeDescription() {
		String theme = UserInfo.getUiThemeDisplayed();
		return theme;
	}
    
    @AuraEnabled 
    public static Map<String, bfFieldDescribe> getPicklistValuesForRecordType(String recordType) {
        System.debug('recordType: ' + recordType);
        List<Salesforce_Picklist_Controlling_Values__c> spcvList = [SELECT Id, Controller__c, Controller_Value__c, Field_Name__c, Is_Active__c, IsDefault__c, RecordType__c, Value__c 
                                                                            FROM Salesforce_Picklist_Controlling_Values__c
                                                                           WHERE Object_Name__c = 'SAP_Interfaced_Data__c'
                                                                             AND Is_Active__c = true
                                                                             AND RecordType__c =:recordType
                                                                        ORDER BY Field_Name__c];

        Map<String, List<Salesforce_Picklist_Controlling_Values__c>> spcvMap = new Map<String, List<Salesforce_Picklist_Controlling_Values__c>>();
        for(Salesforce_Picklist_Controlling_Values__c spcv : spcvList) {
            if (spcvMap.containsKey(spcv.Field_Name__c)) {
                spcvMap.get(spcv.Field_Name__c).add(spcv);
            } else {
                List<Salesforce_Picklist_Controlling_Values__c> v = new List<Salesforce_Picklist_Controlling_Values__c>();
                v.add(spcv);
                spcvMap.put(spcv.Field_Name__c, v);
            }
        }
		System.debug('spcvMap: ' + spcvMap);
        Map<String, bfFieldDescribe> result = new Map<String, bfFieldDescribe>();
        
        Schema.DescribeSObjectResult d = SAP_Interfaced_Data__c.SObjectType.getDescribe();
        Map<String, Schema.SObjectField> fields = d.fields.getMap();
        for(Schema.SObjectField f : fields.values()) {
            Schema.DescribeFieldResult dfr = f.getDescribe();
            bfFieldDescribe fr = new bfFieldDescribe(dfr.name, dfr.label, dfr.type, dfr.calculated, dfr.accessible, dfr.updateable, dfr.nillable);
            //System.debug('field: ' + dfr.getName() + ', type: ' + dfr.getType());
            if (dfr.getType() == Schema.DisplayType.PICKLIST || dfr.getType() == Schema.DisplayType.MULTIPICKLIST || dfr.getType() == Schema.DisplayType.COMBOBOX) {                    
                List<Schema.PicklistEntry> picklistValues = dfr.getPicklistValues();
                List<Salesforce_Picklist_Controlling_Values__c> spcvSet = null;
                if (spcvMap.containsKey(dfr.getName())) {
                    spcvSet = spcvMap.get(dfr.getName());
                }
                for(Schema.PicklistEntry pe : picklistValues) {
                    //System.debug('field: ' + dfr.getName() + ', pe: ' + pe.getValue() + ', isactive: ' + pe.isActive());
                    if (pe.isActive()) {
                        if (spcvSet != null) {
                            for(Salesforce_Picklist_Controlling_Values__c spcv : spcvSet) {
                                System.debug('spcv.Value: ' + spcv.Value__c + ', pe.value: ' + pe.getValue());
                                if (spcv.Value__c == pe.getValue()) {
                                    fr.picklistValues.add(new SimpleListItem(pe.getValue(), pe.getLabel(), spcv.IsDefault__c, spcv.Controller_Value__c, spcv.IsDefault__c));                                                                            
                                }
                            }
                        } else {
                            fr.picklistValues.add(new SimpleListItem(pe.getValue(), pe.getLabel()));                                
                        }
                    }                        
                }
                
            }
            result.put(dfr.name, fr);
        }     
		System.debug('result: ' + result);
        return result;
    }

    @AuraEnabled
    public static bfObjectDescribe getObjectDetails() {
        system.debug('[SampleOrder_Controller.getObjectDetails]');
        bfObjectDescribe obj = new bfObjectDescribe('SAP_Interfaced_Data__c');
        obj.getDescribe(true, true, true);
        return obj;
    }
    
    @AuraEnabled
    public static List<Map<String, Object>> getSampleOrders() {
        System.debug('current user: ' + UserInfo.getLastName() + ', ' + UserInfo.getFirstName() + ', ' + UserInfo.getUserId());
        //Schema.DescribeSObjectResult dsr = SAP_Interfaced_Data__c.SObjectType.getDescribe();
        Schema.DescribeFieldResult dfrStatus = Schema.SObjectType.SAP_Interfaced_Data__c.fields.Approval_Status__c; 
        List<Schema.PicklistEntry> dfrStatus_picklist_values = dfrStatus.getPicklistValues();
        //Map<String, Schema.SObjectField> fields = d.fields.getMap();

        List<Map<String, Object>> result = new List<Map<String, Object>>();
        List<SAP_Interfaced_Data__c> orders = Sample_Order_Helper.getSampleOrders();
        String status = '';
        for(SAP_Interfaced_Data__c order : orders) {
            status = order.Approval_Status__c;
            for(Schema.PicklistEntry pe : dfrStatus_picklist_values) {
                if (status == pe.getValue()) {
                    status = pe.getLabel(); break;
                }
            }
            result.add(new Map<String, Object> {
                'Id' => order.Id,
                'Name' => order.Name,
                'Order_Number__c' => order.Order_Number__c,
                'Approval_Status__c' => status,
                'Requested_By__c' => order.Requested_By__c,
                'Requested_Delivery_Date__c' => order.Requested_Delivery_Date__c,
                'Authorised_By__c' => order.Authorised_By__c,
                'Authorised_By__r.Name' => order.Authorised_By__r.Name,
                'Authorised_Date__c' => order.Authorised_Date__c,
                'Business_Name__c' => order.Business_Name__c,
                'Contact_Name__c' => order.Contact_Name__c,
                'CreatedById' => order.CreatedById
            });                    

        }
        return result;
    	//return Sample_Order_Helper.getSampleOrders();
    }
    
    @AuraEnabled
    public static SAP_Interfaced_Data__c getSampleOrder(String recordId) {
        if (recordId == null || recordId == '') { return null; }
        return [SELECT Id, Name, RecordTypeId, RecordType.Name, Order_Number__c, Approval_Status__c, Requested_Delivery_Date__c, 
                       Authorised_By__c, Authorised_By__r.Name, Authorised_Date__c, Finance_Authorised_By__c, Finance_Authorised_Date__c, 
                       Classification__c, Banner_Group__c, Business_Name__c, Business_Address__c, Business_City__c, Business_State__c, 
                       Business_Postcode__c, Business_Country__c, Contact_Name__c, Contact_Phone__c, Reason__c, Is_International_Order__c, 
                       Storage_Locker__c, Cost_Center__c, Business_Address2__c, Account__c, Account_Name__c, Is_Gift__c, Is_Gift_Above_100__c,
                	   Gift_Register_Acknowledgement__c, Budget_Type__c, Reason_Code__c, Activity__c, Is_Approved__c, Order_Status__c, 
                       Shipping_Instructions__c, Sticker_Type__c, Wholesaler__c, Wholesaler__r.Name, Delivery_Options__c, Internal_Order_Number__c,
                       POD_Attached__c, Market__c, Market__r.Name, Order_Type__c,
                       (SELECT Id, Name, SAP_Interfaced_Data__c, Product__c, Brand_Name__c, Product_Code__c, Internal_Order_Number__c, 
                               Quantity__c, Units__c, Product__r.Used_For__c, Product__r.Pack_Quantity__c, Total_Ordered_Cases__c, PMI_Actual__c,
                        	   Product__r.Price__c
                          FROM SAP_Interfaced_Data_Items__r)
                  FROM SAP_Interfaced_Data__c 
                 WHERE Id=:recordId];

    }
    
    @AuraEnabled
    public static SAP_Interfaced_Data__c saveSampleOrder(SAP_Interfaced_Data__c theSampleOrder, String marketId, String marketName) {
        if (theSampleOrder != null) {
            if (String.isEmpty(marketId)) {
                Market__c market = [SELECT Id FROM Market__c WHERE Country_ISO_Code_2__c =:theSampleOrder.Business_Country__c LIMIT 1];
                if (market != null) {
                    theSampleOrder.Market__c = market.Id;
                }
            } else {
                theSampleOrder.Market__c = marketId;
            }

            List<SAP_Interfaced_Data_Configuration__c> configs = [SELECT Id, Classification__c, State__c, RecordTypeId, RecordType.Name, ShipTo_Code__c, 
                                                                         SoldTo_Code__c, Plant_Code__c, Market__c, Internal_Order_Number__c, Approver__c
                                                                    FROM SAP_Interfaced_Data_Configuration__c
                                                                   WHERE Market__c =:theSampleOrder.Market__c
                                                                     AND Is_Active__c = true];
                                                                     
            if (configs != null && configs.size() > 0) {
                for(SAP_Interfaced_Data_Configuration__c config : configs) {
                    if (!theSampleOrder.Classification__c.containsIgnoreCase('ecomm')) {
                        if (config.RecordType.Name == 'SoldTo' && config.Classification__c == theSampleOrder.Classification__c) {
                            theSampleOrder.SAP_SoldTo_Code__c = config.SoldTo_Code__c;
                            if (String.isNotEmpty(config.Internal_Order_Number__c)) {
                            	theSampleOrder.Internal_Order_Number__c = config.Internal_Order_Number__c;                                
                            }
                        }
    
                        if (config.RecordType.Name == 'ShipTo' && config.State__c == theSampleOrder.Business_State__c) {
                            theSampleOrder.SAP_ShipTo_Code__c = config.ShipTo_Code__c;
                        }                        
                    }

                    if (config.RecordType.Name == 'General' && config.Classification__c == theSampleOrder.Classification__c && (String.isEmpty(config.State__c) || config.State__c == theSampleOrder.Business_State__c)) {
                        theSampleOrder.SAP_ShipTo_Code__c = config.ShipTo_Code__c;
                        theSampleOrder.SAP_SoldTo_Code__c = config.SoldTo_Code__c;
                        theSampleOrder.SAP_Plant_Code__c = config.Plant_Code__c;
                        theSampleOrder.Authorised_By__c = config.Approver__c;
                        //theSampleOrder.Internal_Order_Number__c = config.Internal_Order_Number__c;
                    } else if (config.RecordType.Name == 'General' && config.Market__c == theSampleOrder.Market__c && config.Classification__c == null && config.State__c == null) {
                        theSampleOrder.SAP_ShipTo_Code__c = config.ShipTo_Code__c;  
                    }
                }
            }

            System.debug('delivery options: ' + theSampleOrder.Delivery_Options__c);
            System.debug('marketName: ' + marketName);
            System.debug('wholesaler: ' + theSampleOrder.Wholesaler__c);
            if (marketName == 'Korea' && theSampleOrder.Wholesaler__c != null) {
                Account theAccount = [SELECT Id, Name, SAP_Customer_Number__c, Sold_to_SAP__c FROM Account WHERE Id =:theSampleOrder.Wholesaler__c LIMIT 1];
                System.debug('theAccount: ' + theAccount);
                if (theAccount != null && theAccount.SAP_Customer_Number__c != null) {
                    theSampleOrder.SAP_ShipTo_Code__c = theAccount.SAP_Customer_Number__c;
                }
                if (theAccount != null && theAccount.Sold_to_SAP__c != null) {
                    theSampleOrder.SAP_SoldTo_Code__c = theAccount.Sold_to_SAP__c;
                }
            }

            if (marketName == 'Brazil' && theSampleOrder.Account__c != null) {
                Account theAccount = [SELECT Id, Name, SAP_Customer_Number__c, Sold_to_SAP__c FROM Account WHERE Id =:theSampleOrder.Account__c];
                if (theAccount != null && theAccount.SAP_Customer_Number__c != null) {
                    theSampleOrder.SAP_ShipTo_Code__c = theAccount.SAP_Customer_Number__c;
                }
                if (theAccount != null && theAccount.Sold_to_SAP__c != null) {
                    theSampleOrder.SAP_SoldTo_Code__c = theAccount.Sold_to_SAP__c;
                }                
            }

            if (theSampleOrder.Banner_Group__c != null) {
                Banner_Groups__c banner = [SELECT Id, Name, Ship_To_Code__c FROM Banner_Groups__c WHERE Id =:theSampleOrder.Banner_Group__c LIMIT 1];
                if (banner != null && banner.Ship_To_Code__c != null) {
                    theSampleOrder.SAP_ShipTo_Code__c = banner.Ship_To_Code__c;
                }                
            }

            if (marketName == 'Mexico') {
                String accountId = '';
                Boolean useAccount = false;
                if (theSampleOrder.Storage_Locker__c != null && (theSampleOrder.Classification__c.startsWith('SD0') || theSampleOrder.Classification__c.startsWith('SD5') || theSampleOrder.Classification__c.startsWith('SDA'))) {
                    accountId = theSampleOrder.Storage_Locker__c;
                }
                
                if (theSampleOrder.Account__c != null && (theSampleOrder.Classification__c.startsWith('SD0') || theSampleOrder.Classification__c.startsWith('SDC') || theSampleOrder.Classification__c.startsWith('SDB') || theSampleOrder.Classification__c.startsWith('MZ2'))) {
                    useAccount = true;
                    accountId = theSampleOrder.Account__c;
                }
                System.debug('accountId: ' + accountId);
                Account theAccount = [SELECT Id, Name, SAP_Customer_Number__c, Ship_to_SAP__c, Sold_to_SAP__c FROM Account WHERE Id =:accountId LIMIT 1];
                if (theAccount != null) {
                    if (useAccount && String.isNotEmpty(theAccount.Ship_to_SAP__c)) {
                        theSampleOrder.SAP_ShipTo_Code__c = theAccount.Ship_to_SAP__c;
                    }
                    if (String.isNotEmpty(theAccount.Sold_to_SAP__c)) {
                        theSampleOrder.SAP_SoldTo_Code__c = theAccount.Sold_to_SAP__c;
                    }
                }
            }

            upsert theSampleOrder;
        }
        
        return theSampleOrder;
    }
    
    @AuraEnabled
    public static List<SAP_Interfaced_Data_Item__c> saveOrderItems(String sapId, String recordTypeName, String market, String activityId, String sapItems) {
        if (sapId == null || sapId == '') { return null; }
        if (sapItems == null || sapItems.length() == 0) { return null; }
        
        Map<String, RecordTypeInfo> rtList = SAP_Interfaced_Data_Item__c.SObjectType.getDescribe().getRecordTypeInfosByName();
        String rtSampleOrder = rtList.get('Sample Order').getRecordTypeId();
        if (rtList.containsKey(recordTypeName)) {
            rtSampleOrder = rtList.get(recordTypeName).getRecordTypeId();
        }

        Map<String, RecordTypeInfo> rtPMIActual = PMI_Actual__c.SObjectType.getDescribe().getRecordTypeInfosByName();
        String rtPSA = '';

        Map<String, Integer> pmiActualsMap = new Map<String, Integer>();
        Promotion_Activity__c thePSA;
        if (String.isNotEmpty(activityId)) {
            thePSA = [SELECT Id, Name, RecordType.Name,
                            (SELECT Id, Name, Account__c FROM Promotions__r), 
                            (SELECT Id, Name, Product_Custom__c, Product_Custom__r.Price__c, Promotion__c FROM Promotion_Material_Items__r),
                            (SELECT Id, Promotion_Material_Item__c FROM PMI_Actuals__r WHERE Rebate_Type__c = 'Free Goods') 
                        FROM Promotion_Activity__c 
                       WHERE Id =:activityId];

            if (rtPMIActual.containsKey(thePSA.RecordType.Name)) {
                rtPSA = rtPMIActual.get(thePSA.RecordType.Name).getRecordTypeId();
            }
            
            Integer count = 0;
            if (thePSA.PMI_Actuals__r != null && thePSA.PMI_Actuals__r.size() > 0) {
                for(PMI_Actual__c p : thePSA.PMI_Actuals__r) {
                    count = 0;
                    if (pmiActualsMap.containsKey(p.Promotion_Material_Item__c)) {
                        count = pmiActualsMap.get(p.Promotion_Material_Item__c);
                    }

                    count++;
                    pmiActualsMap.put(p.Promotion_Material_Item__c, count);
                }
            }

        }
        
        System.debug('sapId: ' + sapId);
        List<SAP_Interfaced_Data_Item__c> l_SAPItems = new List<SAP_Interfaced_Data_Item__c>();
        List<SampleOrderItem> items = (List<SampleOrderItem>)System.JSON.deserializeStrict(sapItems, List<SampleOrderItem>.Class);
        System.debug('# of items to save: ' + items.size());
        Boolean hasHighValueItems = false; 
        SAP_Interfaced_Data_Item__c sapItem;
        List<PMI_Actual__c> actuals = new List<PMI_Actual__c>();
        List<String> toDelete = new List<String>();
        Map<String, String> sapProductMap = new Map<String, String>();
        Decimal orderTotal = 0;
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
                sapItem.Internal_Order_Number__c = i.internalOrderNumber;
                sapItem.Total_Ordered_Cases__c = i.convertedCases;
                orderTotal += i.quantity * i.price;
                if(i.id != i.productId && i.id != '') {
                    sapItem.Id = i.id;
                }
                if (i.usedFor != null && i.usedFor.contains('High Value')) {
                    hasHighValueItems = true;
                }
                if (i.quantity == 0) {
                    toDelete.add(i.id);
                } else {
                    l_SAPItems.add(sapItem);
                }

                if (market == 'Mexico' && thePSA != null && thePSA.Promotion_Material_Items__r != null) {
                    for(Promotion_Material_Item__c pmi : thePSA.Promotion_Material_Items__r) {
                        if (pmi.Product_Custom__c == i.productId) {                            
                            Integer count = 1;
                            if (pmiActualsMap.containsKey(pmi.Id)) {
                                count = pmiActualsMap.get(pmi.Id);
                            }
                            PMI_Actual__c pmia = new PMI_Actual__c();
                            if (String.isNotEmpty(i.pmiActualId)) {
                                pmia.Id = i.pmiActualId;
                            } else {
                                pmia.Sample_Order__c = sapId;
                                pmia.RecordTypeId = rtPSA;
                                pmia.Activity__c = activityId;
                                pmia.Promotion__c = pmi.Promotion__c;                                
                                pmia.Promotion_Material_Item__c = pmi.Id;
                                pmia.Payment_Date__c = Date.today();
                                pmia.Rebate_Type__c = 'Free Goods';
                                pmia.Approval_Status__c = 'Paid';
                                pmia.Period__c = 0;
                                pmia.External_Key__c = pmi.Promotion__c + '_' + pmi.Id + '_Free Goods-'+count;
                            }
                            pmia.Act_Qty__c = i.quantity;
                            pmia.Rebate_Amount__c = i.quantity;
                            actuals.add(pmia);

                            sapProductMap.put(pmia.External_Key__c, i.productId);

                            break;
                        }
                    }
                }

            }
        } catch(Exception ex) {
            System.debug('exception: ' + ex.getMessage());
        }     

        if (actuals.size() > 0) {
            upsert actuals;
            for(PMI_Actual__c pmia : actuals) {
                String productId = sapProductMap.get(pmia.External_Key__c);
                for(SAP_Interfaced_Data_Item__c sapi : l_SAPItems) {
                    if (sapi.Product__c == productId) {
                        sapi.PMI_Actual__c = pmia.Id;
                        break;
                    }
                }
            }

            String result = PromotionalSalesAgreement_Controller.updateActualTotals(new List<String>{activityId});

        }
        
        if (l_SAPItems.size() > 0) {
            upsert l_SAPItems;
        }

        if (toDelete.size() > 0) {
            List<SAP_Interfaced_Data_Item__c> itemsToDelete = [SELECT Id FROM SAP_Interfaced_Data_Item__c WHERE Id =: toDelete];
            delete itemsToDelete;
        }
        
        SAP_Interfaced_Data__c sampleOrder = [SELECT Id, RecordType.Name, Approval_Status__c, Classification__c, Business_State__c, 
                                              		Has_HighValue_Items__c, Market__c, SAP_ShipTo_Code__c, SAP_SoldTo_Code__c, SAP_Plant_Code__c,
                                              		Order_Total__c
                                                FROM SAP_Interfaced_Data__c 
                                               WHERE Id =:sapId];
                                               
        sampleOrder.Order_Total__c = orderTotal;
        sampleOrder.Has_HighValue_Items__c = hasHighValueItems;
        update sampleOrder;

        //if (hasHighValueItems) {
        //    configureHighValueApproval(sapId, items);
        //}
        /*
        for(SAP_Interfaced_Data_Item__c i : l_SAPItems) {
            for(SampleOrderItem soi : items) {
                if (soi.productId == i.Product__c) {
                    soi.Id = i.Id; break;
                }
            }
        }
        
        return items;
        */
        return l_SAPItems;
    }

	@AuraEnabled
    public static SAP_Interfaced_Data__c getInterfacedData(String sapId) {
        if (sapId == null || sapId.length() == 0) { return null; }
        
        SAP_Interfaced_Data__c sap = [SELECT Id, Name, RecordTypeId, RecordType.Name, Requested_Delivery_Date__c, Classification__c, 
                                        Business_Name__c, Business_Address__c, Business_City__c, Business_State__c, Business_Country__c, 
                                        Contact_Name__c, Contact_Phone__c, Reason__c, Is_Approved__c, Order_Status__c, Is_Gift__c, Is_Gift_Above_100__c,
                                        Gift_Register_Acknowledgement__c,
                                        (SELECT Id, Name, Product__c, SAP_Interfaced_Data__c, Brand_Name__c, Product_Code__c, 
                                                Internal_Order_Number__c, Total_Ordered_Cases__c 
                                           FROM SAP_Interfaced_Data_Items__r) 
                                      FROM SAP_Interfaced_Data__c 
                                      WHERE Id =:sapId];

        return sap;
    }   
    
    @AuraEnabled
    public static List<SampleOrderItem> getProducts(String recordTypeName) {        
        Map<String, Object> u = getCurrentUserInfo();
        String marketId;
        if (u.containsKey('marketId')) {
            marketId = String.valueOf(u.get('marketId'));
        }
        if (String.isEmpty(marketId)) {
            marketId = [SELECT Id, Name FROM Market__c WHERE Name = 'Australia'].Id;
        }
        Boolean found = false;
        List<Product__c> products = [SELECT Id, Name, ProductCode__c, Brand__c, Brand_Name__c, Pack_Quantity__c, Used_For__c, Price__c, COGS__c
                                       FROM Product__c 
                                      WHERE IsActive__c = true 
                                        AND Market__c=:marketId 
                                        AND Used_For__c INCLUDES ('Sample Order','Sample Order - E-Premise', 'Sample Order - UK', 'Sample Order - TWN','Sample Order - MEX','Sample Order - KOR','Sample Order - BRL')
                                   ORDER BY Name];
        
        List<SampleOrderItem> items = new List<SampleOrderItem>();
        for(Product__c p : products) {
            items.add(new SampleOrderItem('', p.Id, p.Name, p.ProductCode__c, p.Brand__c, p.Brand_Name__c, p.Used_For__c, (Integer)p.Pack_Quantity__c, 0, (Decimal)p.Price__c, (Decimal)p.COGS__c, '', '', 0, 0, ''));
        }
        return items;
    }
    
    @AuraEnabled
    public static List<Banner_Groups__c> getBannerGroups() {
        Map<String, Object> u = getCurrentUserInfo();
        String marketId;
        if (u.containsKey('marketId')) {
            marketId = String.valueOf(u.get('marketId'));
        }
        if (String.isEmpty(marketId)) {
            marketId = [SELECT Id, Name FROM Market__c WHERE Name = 'Australia'].Id;
        }

        return [SELECT Id, Name FROM Banner_Groups__c WHERE Market__c =:marketId AND Ship_To_Code__c <> NULL];

    }

    @AuraEnabled 
    public static List<Map<String, Object>> getStorerooms() {
        Map<String, Object> u = getCurrentUserInfo();
        String marketId;
        if (u.containsKey('marketId')) {
            marketId = String.valueOf(u.get('marketId'));
        }
        if (String.isEmpty(marketId)) {
            marketId = [SELECT Id, Name FROM Market__c WHERE Name = 'Australia'].Id;
        }

        List<Map<String, Object>> values = new List<Map<String, Object>>();
        List<Account> storerooms = [SELECT Id, Name, ShippingStreet, ShippingCity, ShippingPostalCode, ShippingState, ShippingCountry
                                      FROM Account 
                                     WHERE Market__c =:marketId 
                                       AND RecordType.Name = 'Storeroom' 
                                       AND Status__c ='Active'];

		List<AccountShare> owners = [SELECT Id, AccountId, UserOrGroupId, RowCause 
                                       FROM AccountShare
                                      WHERE Account.RecordType.Name = 'Storeroom'
                                        AND Account.Status__c = 'Active'
                                        AND (RowCause = 'Manual' OR RowCause = 'Owner')];
        
        List<String> users = new List<String>();
        for(AccountShare sh : owners) {
            Id userId = sh.UserOrGroupId;
            if (userId.getSobjectType().getDescribe().getName() == 'User') {
                users.add(userId);
            }
        }
        if (users.size() > 0) {
            Map<String, User> ownerDetails = new Map<String, User>([SELECT Id, Name, SmallPhotoUrl
							                                          FROM User
                                                                     WHERE Id =:users]);
            
            
            for (Account a : storerooms) {
		        Map<String, Object> room = new Map<String, Object>();
        		room.put('account', a);
                List<User> roomowners = new List<User>();
                for(AccountShare sh : owners) {
                    if (sh.AccountId == a.Id && ownerDetails.containsKey(sh.UserOrGroupId)) {
                        roomowners.add(ownerDetails.get(sh.UserOrGroupId));
                    }
                }
                
                room.put('owners', roomowners);
                
                values.add(room);
            }
        }
        
        
        return values;
    }

    @AuraEnabled 
    public static List<Account> getStorageLockers(String marketId) {
        if (String.isEmpty(marketId)) {
            Map<String, Object> u = getCurrentUserInfo();
            if (u.containsKey('marketId')) {
                marketId = String.valueOf(u.get('marketId'));
            }
            
            if (String.isEmpty(marketId)) {
                marketId = [SELECT Id, Name FROM Market__c WHERE Name = 'Australia'].Id;
            }
        }

        return [SELECT Id, Name, ShippingStreet, ShippingCity, ShippingPostalCode, ShippingState, ShippingCountry 
                  FROM Account 
                 WHERE Market__c =:marketId 
                   AND Status__c ='Active'
                   AND RecordType.Name = 'Storage Locker'];
    }

    @AuraEnabled
    public static List<Internal_Order__c> getInternalOrderNumbers(String marketId) {
        if (String.isEmpty(marketId)) {
            Map<String, Object> u = getCurrentUserInfo();
            if (u.containsKey('marketId')) {
                marketId = String.valueOf(u.get('marketId'));
            }
            if (String.isEmpty(marketId)) {
                marketId = [SELECT Id, Name FROM Market__c WHERE Name = 'United Kingdom'].Id;
            }
        }
        
        return [SELECT Id, Internal_Order_Number__c, Brand__c, Description__c FROM Internal_Order__c WHERE Internal_Order_Type__c = 'ZBS' AND Market__c =:marketId ORDER BY Brand__c, Internal_Order_Number__c];
    }

    @AuraEnabled 
    public static List<Promotion_Activity__c> getPromotionActivities(String activityType) {
        return [SELECT Id, Name, Begin_Date__c, End_Date__c, Account__c, Account__r.Name, Account__r.ShippingStreet, Account__r.ShippingCity,
                    Account__r.ShippingPostalCode, Account__r.ShippingState, Account__r.ShippingCountry, Contact__c, Contact__r.Name, Contact__r.Phone,
                    (SELECT Id, Product_Custom__c, Product_Name__c, Plan_Volume__c, Free_Bottle_Quantity__c, Total_Actual_Free_Bottle_Qty__c
                       FROM Promotion_Material_Items__r)
                  FROM Promotion_Activity__c 
                  WHERE OwnerId =:UserInfo.getUserId()
                    AND RecordType.Name =:activityType
                    AND ((Market__r.Name = 'Mexico' AND Status__c = 'Signed') 
                     OR (Market__r.Name != 'Mexico' AND Status__c = 'Approved'))];
    }

    @AuraEnabled
    public static List<Account> getAccountDetails(String accountId){
        return [SELECT Id, Name, ShippingStreet, ShippingCity, ShippingPostalCode, ShippingState, ShippingCountry, 
                    (SELECT Id, Name, Phone, MobilePhone FROM Contacts WHERE Primary_Contact__c = true)
                    FROM Account 
                    WHERE Id =:accountId];
    }

    @AuraEnabled
    public static void submitForApproval(String sapId, String market, String recordType) {
        System.debug('sapId: ' + sapId);        
        if (sapId != null && sapId.length() > 0) {            
            Approval.ProcessSubmitRequest req1 = new Approval.ProcessSubmitRequest();
            req1.setObjectId(sapId);
            Approval.ProcessResult result = Approval.process(req1);                
        }
        
    }
    
    @AuraEnabled
    public static ApprovalHistory getApprovalHistory(String orderId) {
        ApprovalHistory history = new ApprovalHistory();
        DateTime completedDate;

        if (String.isNotEmpty(orderId)) {
			List<ProcessInstance> piList = [SELECT Id, CreatedDate, TargetObjectid, Status, ElapsedTimeInDays, ElapsedTimeInHours, ElapsedTimeInMinutes, 
                                                (SELECT Id, CreatedDate, StepStatus, Comments, Actor.Name, ElapsedTimeInDays, ElapsedTimeInHours, 
                                                        ElapsedTimeInMinutes, IsPending, ProcessNodeId, ProcessNode.Name 
                                                   FROM StepsAndWorkItems 
                                                ORDER BY ProcessNodeId) 
                                             FROM ProcessInstance 
                                            WHERE TargetObjectId =:orderId 
                                         ORDER BY CreatedDate];      

            if (piList != null && piList.size() > 0) {
                history.CreatedDate = piList.get(0).CreatedDate.format('EE, dd MMM YYYY, h:mm a');
                for (ProcessInstance pi : piList) {
                    if (pi.StepsAndWorkItems != null) {
                        System.debug('# of work items: ' + pi.StepsAndWorkItems.size());
                    }
                    if (pi.StepsAndWorkItems != null && pi.StepsAndWorkItems.size() > 0) {                        
                        for(Integer i = 0; i < pi.StepsAndWorkitems.size(); i++) {
                            System.debug('actor: ' + pi.StepsAndWorkItems[i].Actor.Name + ', status: ' + pi.StepsAndWorkItems[i].StepStatus + ', stepname: ' + pi.StepsAndWorkItems[i].ProcessNode.Name);

                            completedDate = pi.CreatedDate;
                            if (pi.StepsAndWorkItems[i].ElapsedTimeInMinutes != null) {
                                completedDate = pi.CreatedDate.addMinutes((Integer)pi.StepsAndWorkItems[i].ElapsedTimeInMinutes);
                            }
                
                            String stepName = 'Approval Request Submitted';
                            if (String.isNotEmpty(pi.StepsAndWorkItems[i].ProcessNode.Name)) {
                                stepName = pi.StepsAndWorkItems[i].ProcessNode.Name;
                            }
                            history.items.add(new ApprovalHistoryItem(pi.StepsAndWorkItems[i].Actor.Name, pi.StepsAndWorkItems[i].StepStatus, pi.StepsAndWorkItems[i].Comments, completedDate, '', stepName));
                        }                    
                    }
                }
            }
        }

        return history;
    }

/*
    private static void configureHighValueApproval(String sapId, List<SampleOrderItem> items) {
        Set<String> brands = new Set<String>();
        for(SampleOrderItem soi : items) {
            brands.add('\'' + soi.brandName + '\'');
        }

        String soql = 'SELECT Id FROM User WHERE Manages_Brand__c INCLUDES ('+String.join(new List<String>(brands), ',')+')';
        List<User> brandManagers = Database.query(soql);
        if (brandManagers != null && brandManagers.size() > 0) {
            List<GroupMember> grpMembers;
            Group grp = [SELECT Id FROM Group WHERE Name = 'AU - Sample Order Brand Mgr Approvers' LIMIT 1];
            if (grp != null) {
                grpMembers = [SELECT Id FROM GroupMember WHERE GroupId =:grp.Id];
                if (grpMembers.size() > 0) {
                    delete grpMembers;                
                }

                if (grpMembers == null) { grpMembers = new List<GroupMember>(); } else { grpMembers.clear(); }
                for(User u : brandManagers) {
                    GroupMember gm = new GroupMember();
                    gm.GroupId = grp.Id;
                    gm.UserOrGroupId = u.Id;
                    grpMembers.add(gm);
                }

                if (grpMembers != null && grpMembers.size() > 0) {
                    insert grpMembers;
                }
            }   
        }
    }
*/
}