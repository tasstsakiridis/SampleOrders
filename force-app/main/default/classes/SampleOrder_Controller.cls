public with sharing class SampleOrder_Controller {

    @AuraEnabled
    public static SimpleListItem getCurrentUserInfo() {
    	User u = [SELECT Id, Name, Market__c, MobilePhone FROM User WHERE Id =:UserInfo.getUserId()];
        Market__c m = [SELECT Id, Name, Country_ISO_Code_2__c, Sample_Order_Lead_Time__c FROM Market__c WHERE Name =:u.Market__c LIMIT 1];
        SimpleListItem sli = new SimpleListItem(u.Id, u.Name);
        sli.value = m.Id;
        sli.itemId = m.Country_ISO_Code_2__c;
        sli.label = String.valueOf(m.Sample_Order_Lead_Time__c);
        sli.description = m.Name;
        sli.record = u;
        return sli;
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
                                    fr.picklistValues.add(new SimpleListItem(pe.getValue(), pe.getLabel(), spcv.isDefault__c, spcv.Controller_Value__c, spcv.IsDefault__c));                                                                            
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
                       Storage_Locker__c, Cost_Center__c, Business_Address2__c, Account__c, Account_Name__c, Is_Gift__c, Gift_Register_Acknowledgement__c,
                       Budget_Type__c, Reason_Code__c,
                       (SELECT Id, Name, SAP_Interfaced_Data__c, Product__c, Brand_Name__c, Product_Code__c, Internal_Order_Number__c, 
                               Quantity__c, Units__c, Product__r.Used_For__c, Product__r.Pack_Quantity__c, Total_Ordered_Cases__c 
                          FROM SAP_Interfaced_Data_Items__r)
                  FROM SAP_Interfaced_Data__c 
                 WHERE Id=:recordId];
    }
    
    @AuraEnabled
    public static SAP_Interfaced_Data__c saveSampleOrder(SAP_Interfaced_Data__c theSampleOrder, String marketId) {
        if (theSampleOrder != null) {
            if (String.isEmpty(marketId)) {
                Market__c market = [SELECT Id FROM Market__c WHERE Country_ISO_Code_2__c =:theSampleOrder.Business_Country__c LIMIT 1];
                if (market != null) {
                    theSampleOrder.Market__c = market.Id;
                }
            } else {
                theSampleOrder.Market__c = marketId;
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

                    if (config.RecordType.Name == 'General' && config.Classification__c == theSampleOrder.Classification__c && (String.isEmpty(config.State__c) || config.State__c == theSampleOrder.Business_State__c)) {
                        theSampleOrder.SAP_ShipTo_Code__c = config.ShipTo_Code__c;
                        theSampleOrder.SAP_SoldTo_Code__c = config.SoldTo_Code__c;
                        theSampleOrder.SAP_Plant_Code__c = config.Plant_Code__c;
                    } else if (config.RecordType.Name == 'General' && config.Market__c == theSampleOrder.Market__c && config.Classification__c == null && config.State__c == null) {
                        theSampleOrder.SAP_ShipTo_Code__c = config.ShipTo_Code__c;  
                    }
                }
            }

            if (theSampleOrder.Banner_Group__c != null) {
                Banner_Groups__c banner = [SELECT Id, Name, Ship_To_Code__c FROM Banner_Groups__c WHERE Id =:theSampleOrder.Banner_Group__c LIMIT 1];
                if (banner != null && banner.Ship_To_Code__c != null) {
                    theSampleOrder.SAP_ShipTo_Code__c = banner.Ship_To_Code__c;
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
                sapItem.Internal_Order_Number__c = i.internalOrderNumber;
                sapItem.Total_Ordered_Cases__c = i.convertedCases;
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
        
        SAP_Interfaced_Data__c sap = [SELECT Id, Name, RecordTypeId, RecordType.Name, Requested_Delivery_Date__c, Classification__c, 
                                        Business_Name__c, Business_Address__c, Business_City__c, Business_State__c, Business_Country__c, 
                                        Contact_Name__c, Contact_Phone__c, Reason__c, 
                                        (SELECT Id, Name, Product__c, SAP_Interfaced_Data__c, Brand_Name__c, Product_Code__c, 
                                                Internal_Order_Number__c, Total_Ordered_Cases__c 
                                           FROM SAP_Interfaced_Data_Items__r) 
                                      FROM SAP_Interfaced_Data__c 
                                      WHERE Id =:sapId];
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
                                        AND Used_For__c INCLUDES ('Sample Order','Sample Order - E-Premise', 'Sample Order - UK', 'Sample Order - TWN')
                                   ORDER BY Name];
        
        List<SampleOrderItem> items = new List<SampleOrderItem>();
        for(Product__c p : products) {
            items.add(new SampleOrderItem('', p.Id, p.Name, p.ProductCode__c, p.Brand__c, p.Brand_Name__c, p.Used_For__c, (Integer)p.Pack_Quantity__c, 0, (Decimal)p.Price__c, (Decimal)p.COGS__c, '', ''));
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

        return [SELECT Id, Name FROM Banner_Groups__c WHERE Market__c =:marketId AND Ship_To_Code__c <> NULL];

    }

    @AuraEnabled 
    public static List<Account> getStorerooms() {
        SimpleListItem u = getCurrentUserInfo();
        String marketId = u.value;
        if (marketId == null) {
            marketId = [SELECT Id, Name FROM Market__c WHERE Name = 'Australia'].Id;
        }

        return [SELECT Id, Name, ShippingStreet, ShippingCity, ShippingPostalCode, ShippingState, ShippingCountry FROM Account WHERE Market__c =:marketId AND RecordType.Name = 'Storeroom' AND Status__c ='Active'];
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
    public static List<Internal_Order__c> getInternalOrderNumbers() {
        SimpleListItem u = getCurrentUserInfo();
        String marketId = u.value;
        if (marketId == null) {
            marketId = [SELECT Id, Name FROM Market__c WHERE Name = 'United Kingdom'].Id;
        }
        
        return [SELECT Id, Internal_Order_Number__c, Brand__c, Description__c FROM Internal_Order__c WHERE Internal_Order_Type__c = 'ZBS' AND Market__c =:marketId ORDER BY Brand__c, Internal_Order_Number__c];
    }

    @AuraEnabled
    public static List<Account> getAccountDetails(String accountId){
        return [SELECT Id, Name, ShippingStreet, ShippingCity, ShippingPostalCode, ShippingState, ShippingCountry, 
                    (SELECT Id, Name, Phone, MobilePhone FROM Contacts WHERE Primary_Contact__c = true)
                    FROM Account 
                    WHERE Id =:accountId];
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