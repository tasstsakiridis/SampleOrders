trigger SAPInterfacedData on SAP_Interfaced_Data__c (before update) {
    Map<String, RecordTypeInfo> sapRecordTypes = Schema.SObjectType.SAP_Interfaced_Data__c.getRecordTypeInfosByName();
    
    String rtSampleOrder = sapRecordTypes.get('Sample Order Locked').getRecordTypeId(); 
	
    Set<Id> sampleOrderIds = new Set<Id>();
    for(SAP_Interfaced_Data__c sap : Trigger.new) {
        if (sap.Notify_Brand_Managers__c && sap.Approval_Status__c == 'Approved' && sap.RecordTypeId == rtSampleOrder && sap.Brand_Manager_Emailed__c == false) {
            sampleOrderIds.add(sap.Id);
            sap.Brand_Manager_Emailed__c = true;
        }
    }
    if (sampleOrderIds.size() > 0) {
        User u = [SELECT Id, Name, Market__c FROM User WHERE Id =:UserInfo.getUserId() LIMIT 1];
        String marketName = 'Australia';
        if (u.Market__c != null) {
            marketName = u.Market__c;
        }
        
        List<EmailTemplate> emailTemplates = [SELECT Id, Body, Subject FROM EmailTemplate WHERE DeveloperName = 'AU_Sample_Orders_Approved'];
        List<SAP_Interfaced_Data_Item__c> items = [SELECT Id, Product__c, SAP_Interfaced_Data__c, Brand_Name__c FROM SAP_Interfaced_Data_Item__c WHERE SAP_Interfaced_Data__c =:sampleOrderIds];
        Map<String, Set<String>> brandMap = new Map<String, Set<String>>();
		Set<String> sapIdsForBrandList;
        for(SAP_Interfaced_Data_Item__c item : items) {
            if (brandMap.containsKey(item.Brand_Name__c)) {
                sapIdsForBrandList = brandMap.get(item.Brand_Name__c);
            } else {
                sapIdsForBrandList = new Set<String>();
            }
            
            sapIdsForBrandList.add(item.SAP_Interfaced_Data__c);
            brandMap.put(item.Brand_Name__c, sapIdsForBrandList);
        }
        
        if (brandMap.size() > 0) {
            // Temporary fix to avoid sending Sample Order emails to users who manage the brands on the Sample Order for other markets
            // Need to restructure this so that the correct email template for the market is loaded as well
            String brandQueryStr = 'SELECT Id, Email, Manages_Brand__c FROM User WHERE Market__c =:marketName AND Manages_Brand__c INCLUDES (';
            for(String s : brandMap.keySet()) {
                brandQueryStr += '\'' + String.escapeSingleQuotes(s) + '\',';
            }
            brandQueryStr = brandQueryStr.removeEnd(',');
            brandQueryStr += ')';
            System.debug('brandQueryStr: ' + brandQueryStr);
            Set<String> sapIds;
            Set<String> emailList;
            List<String> brands;
            List<User> brandManagers = Database.query(brandQueryStr);
            Map<String, Set<String>> emailMap = new Map<String, Set<String>>();
            for(User mgr : brandManagers) {
                brands = mgr.Manages_Brand__c.split(';');
                for(String b : brands) {
                    if (brandMap.containsKey(b)) {
                        sapIds = brandMap.get(b);
                        for(String sapId : sapIds) {
                            if (emailMap.containsKey(sapId)) {
                                emailList = emailMap.get(sapId);
                            } else {
                                emailList = new Set<String>();
                            }
                            
                            emailList.add(mgr.Email);
                            emailMap.put(sapId, emailList);
                        }
                    }
                }
            }
            
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            mail.setTemplateId(emailTemplates[0].Id);
            mail.setSaveAsActivity(false);
            mail.setTargetObjectId(UserInfo.getUserId());
            List<String> toEmails;
            for(String sapId : emailMap.keySet()) {
                toEmails = new List<String>(emailMap.get(sapId));
                System.debug('toEmails: ' + toEmails);
                mail.setToAddresses(toEmails);
                mail.setWhatId(sapId);
                Messaging.SendEmailResult[] emailResult = Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{mail});                
            }
        }
            
    }
    
}