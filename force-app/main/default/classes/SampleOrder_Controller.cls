public with sharing class SampleOrder_Controller {

    @AuraEnabled
    public static SimpleListItem getCurrentUserInfo() {
    	User u = [SELECT Id, Name, Market__c FROM User WHERE Id =:UserInfo.getUserId()];
        Market__c m = [SELECT Id, Name, Country_ISO_Code_2__c FROM Market__c WHERE Name =:u.Market__c LIMIT 1];
        SimpleListItem sli = new SimpleListItem(u.Id, u.Name);
        sli.value = m.Id;
        sli.description = m.Country_ISO_Code_2__c;
        return sli;
    }
    
	@AuraEnabled
	public static String getUIThemeDescription() {
		String theme = UserInfo.getUiThemeDisplayed();
		return theme;
	}
    
    @AuraEnabled 
    public static List<Salesforce_Picklist_Controlling_Values__c> getPicklistValuesForRecordType(String recordType) {
        return [SELECT Id, Controller__c, Controller_Value__c, Field_Name__c, Is_Active__c, IsDefault__c, RecordType__c, Value__c 
                                                                            FROM Salesforce_Picklist_Controlling_Values__c
                                                                           WHERE Object_Name__c = 'SAP_Interfaced_Data__c'
                                                                             AND Is_Active__c = true
                                                                             AND RecordType__c =:recordType
                                                                        ORDER BY Field_Name__c];

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
        return [SELECT Id, Name, RecordTypeId, RecordType.Name, Order_Number__c, Approval_Status__c, Requested_Delivery_Date__c, 
                       Authorised_By__c, Authorised_By__r.Name, Authorised_Date__c, Finance_Authorised_By__c, Finance_Authorised_Date__c, 
                       Classification__c, Banner_Group__c, Business_Name__c, Business_Address__c, Business_City__c, Business_State__c, 
                       Business_Postcode__c, Business_Country__c, Contact_Name__c, Contact_Phone__c, Reason__c, Is_International_Order__c, 
                       Storage_Locker__c, Cost_Center__c, Business_Address2__c,
                       (SELECT Id, Name, SAP_Interfaced_Data__c, Product__c, Brand_Name__c, Product_Code__c, Quantity__c, Units__c, Product__r.Used_For__c 
                          FROM SAP_Interfaced_Data_Items__r) 
                  FROM SAP_Interfaced_Data__c 
                 WHERE Id=:recordId];
    }
    
    @AuraEnabled
    public static SAP_Interfaced_Data__c saveSampleOrder(SAP_Interfaced_Data__c theSampleOrder) {
        if (theSampleOrder != null) {
            Market__c market = [SELECT Id FROM Market__c WHERE Country_ISO_Code_2__c =:theSampleOrder.Business_Country__c LIMIT 1];
            if (market != null) {
                theSampleOrder.Market__c = market.Id;
            }

            List<SAP_Interfaced_Data_Configuration__c> configs = [SELECT Id, Classification__c, State__c, RecordTypeId, RecordType.Name, ShipTo_Code__c, SoldTo_Code__c, Plant_Code__c, Market__c
                                                                    FROM SAP_Interfaced_Data_Configuration__c
                                                                   WHERE Market__c =:theSampleOrder.Market__c
                                                                     AND Is_Active__c = true];

            if (configs != null && configs.size() > 0) {
                for(SAP_Interfaced_Data_Configuration__c config : configs) {
                    if (!theSampleOrder.Classification__c.containsIgnoreCase('ecomm')) {
                        if (config.RecordType.Name == 'SoldTo' && config.Classification__c == theSampleOrder.Classification__c) {
                            theSampleOrder.SAP_SoldTo_Code__c = config.SoldTo_Code__c;
                        }
    
                        if (config.RecordType.Name == 'ShipTo' && config.State__c == theSampleOrder.Business_State__c) {
                            theSampleOrder.SAP_ShipTo_Code__c = config.ShipTo_Code__c;
                        }                        
                    }

                    if (config.RecordType.Name == 'General' && config.Classification__c == theSampleOrder.Classification__c && config.State__c == theSampleOrder.Business_State__c) {
                        theSampleOrder.SAP_ShipTo_Code__c = config.ShipTo_Code__c;
                        theSampleOrder.SAP_SoldTo_Code__c = config.SoldTo_Code__c;
                        theSampleOrder.SAP_Plant_Code__c = config.Plant_Code__c;
                    } else if (config.RecordType.Name == 'General' && config.Market__c == theSampleOrder.Market__c && config.Classification__c == null && config.State__c == null) {
                        theSampleOrder.SAP_ShipTo_Code__c = config.ShipTo_Code__c;  
                    }
                }
            }

            upsert theSampleOrder;
        }
        
        return theSampleOrder;
    }
    
    @AuraEnabled
    public static List<SAP_Interfaced_Data_Item__c> saveOrderItems(String sapId, String sapItems) {
        if (sapId == null || sapId == '') { return null; }
        if (sapItems == null || sapItems.length() == 0) { return null; }
        
        Map<String, RecordTypeInfo> rtList = SAP_Interfaced_Data_Item__c.SObjectType.getDescribe().getRecordTypeInfosByName();
        String rtSampleOrder = rtList.get('Sample Order').getRecordTypeId();
        
        System.debug('sapId: ' + sapId);
        List<SAP_Interfaced_Data_Item__c> l_SAPItems = new List<SAP_Interfaced_Data_Item__c>();
        List<SampleOrderItem> items = (List<SampleOrderItem>)System.JSON.deserializeStrict(sapItems, List<SampleOrderItem>.Class);
        System.debug('# of items to save: ' + items.size());
        Boolean hasHighValueItems = false; 
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
                if (i.usedFor != null && i.usedFor.contains('High Value')) {
                    hasHighValueItems = true;
                }
                l_SAPItems.add(sapItem);
            }
        } catch(Exception ex) {
            System.debug('exception: ' + ex.getMessage());
        }     
        
        upsert l_SAPItems;
        
        SAP_Interfaced_Data__c sampleOrder = [SELECT Id, Classification__c, Business_State__c, Has_HighValue_Items__c, Market__c, SAP_ShipTo_Code__c, SAP_SoldTo_Code__c, SAP_Plant_Code__c
                                                FROM SAP_Interfaced_Data__c 
                                               WHERE Id =:sapId];
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
        
        SAP_Interfaced_Data__c sap = [SELECT Id, Name, RecordTypeId, RecordType.Name, Requested_Delivery_Date__c, Classification__c, Business_Name__c, Business_Address__c, Business_City__c, Business_State__c, Business_Country__c, Contact_Name__c, Contact_Phone__c, Reason__c, (SELECT Id, Name, Product__c, SAP_Interfaced_Data__c, Brand_Name__c, Product_Code__c FROM SAP_Interfaced_Data_Items__r) FROM SAP_Interfaced_Data__c WHERE Id =:sapId];
        return sap;
    }   
    
    @AuraEnabled
    public static List<SampleOrderItem> getProducts(String recordTypeName) {        
        SimpleListItem u = getCurrentUserInfo();
        /*
        if (u != null) {
            market = [SELECT Id, Name FROM Market__c WHERE Name =:u.value];
        }
        */
        
		String marketId = u.value;
        if (marketId == null) {
            marketId = [SELECT Id, Name FROM Market__c WHERE Name = 'Australia'].Id;
        }
        //String usedFor = 'Sample Order';
        //if (recordTypeName != null && recordTypeName.contains('E-Premise')) {
        //    usedFor = recordTypeName;
        //}
        Boolean found = false;
        List<Product__c> products = [SELECT Id, Name, ProductCode__c, Brand__c, Brand_Name__c, Pack_Quantity__c, Used_For__c, Price__c, COGS__c
                                       FROM Product__c 
                                      WHERE IsActive__c = true 
                                        AND Market__c=:marketId 
                                        AND Used_For__c INCLUDES ('Sample Order','Sample Order - E-Premise', 'Sample Order - UK')
                                   ORDER BY Name];
        
        List<SampleOrderItem> items = new List<SampleOrderItem>();
        for(Product__c p : products) {
            items.add(new SampleOrderItem('', p.Id, p.Name, p.ProductCode__c, p.Brand_Name__c, p.Used_For__c, (Integer)p.Pack_Quantity__c, 0, (Decimal)p.COGS__c));
        }
        return items;
    }
    
    @AuraEnabled
    public static List<Banner_Groups__c> getBannerGroups() {
        SimpleListItem u = getCurrentUserInfo();
        /*
        if (u != null) {
            market = [SELECT Id, Name FROM Market__c WHERE Name =:u.value];
        }
        */
        String marketId = u.value;
        if (marketId == null) {
            marketId = [SELECT Id, Name FROM Market__c WHERE Name = 'Australia'].Id;
        }

        return [SELECT Id, Name FROM Banner_Groups__c WHERE Market__c =:marketId AND Management_Group_State_Level__c = 'MGT_NAT' AND Name LIKE '%Duty%'];
    }

    @AuraEnabled 
    public static List<Account> getStorageLockers() {
        SimpleListItem u = getCurrentUserInfo();
        String marketId = u.value;
        if (marketId == null) {
            marketId = [SELECT Id, Name FROM Market__c WHERE Name = 'Australia'].Id;
        }

        return [SELECT Id, Name, ShippingStreet, ShippingCity, ShippingPostalCode, ShippingState, ShippingCountry FROM Account WHERE Market__c =:marketId AND RecordType.Name = 'Storage Locker' AND Status__c ='Active'];
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