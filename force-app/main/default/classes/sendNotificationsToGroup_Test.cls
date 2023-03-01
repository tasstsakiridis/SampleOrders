@isTest(SeeAllData=true)
private class sendNotificationsToGroup_Test {
    static testMethod void unitTest1() {
        INFW_TestHelper helper = new INFW_TestHelper();
        
        Map<String, RecordTypeInfo> aRecordTypes = Schema.SObjectType.Account.getRecordTypeInfosByName();

        String rtAUAccount = aRecordTypes.get('AUD - Outlet').getRecordTypeId();
        String rtStoreroom = aRecordTypes.get('Storeroom').getRecordTypeId();
               
        /*
        User user1 = helper.createUser('System Administrator', 'Test', 'Tsakiridis', '');
        user1.Market__c = 'Australia';
        user1.Manages_Brand__c = 'Gentleman Jack';
        user1.Email = 'tass_tsakiridis@b-f.com';
        insert user1;
        */
        Group group1 = new Group();
        group1.Name = 'TestGroup';
        group1.DeveloperName = 'Test_Group';
        insert group1;
        
        GroupMember member1 = new GroupMember();
        member1.GroupId = group1.Id;
        member1.UserOrGroupId = UserInfo.getUserId();
        insert member1;        
            
        System.runAs(new User(Id = UserInfo.getUserId())) {
            Account account1 = new Account();
            account1.RecordTypeId = rtStoreroom;
            account1.Name = 'Test Account';    
            insert account1;

            AccountShare aShare = new AccountShare();
            aShare.AccountId = account1.Id;
            aShare.AccountAccessLevel = 'Edit';
            aShare.OpportunityAccessLevel = 'Read';
            aShare.RowCause = 'manual';
            aShare.UserOrGroupId = group1.Id;
            insert aShare;
            
            List<String> accountIds = new List<String>{account1.Id};
                
            List<sendNotificationsToGroup.sendNotificationsToGroupParams> params = new List<sendNotificationsToGroup.sendNotificationsToGroupParams>();
            sendNotificationsToGroup.sendNotificationsToGroupParams param = new sendNotificationsToGroup.sendNotificationsToGroupParams();
            params.add(param);

            List<sendNotificationsToGroup.sendNotificationsToGroupResults> results = sendNotificationsToGroup.sendNotificationsToGroup(params);
            
            param.recordIds = accountIds;
            params.clear();
            params.add(param);

            results = sendNotificationsToGroup.sendNotificationsToGroup(params);

            param.recordIds = accountIds;
            param.emailTemplateName = 'AU_Sample_Order_Submitter_Notification';
            params.clear();
            params.add(param);

            results = sendNotificationsToGroup.sendNotificationsToGroup(params);
            
            param.objectApiName = 'Account';
            param.includeGroups = false;
            param.onlyNotifyOwner = true;
            param.userOrGroup = '';
            param.userOrGroupName = '';
            params.add(param);
            
			results = sendNotificationsToGroup.sendNotificationsToGroup(params);
            
            param.includeGroups = true;
            param.onlyNotifyOwner = false;
            param.userOrGroup = 'Group';
            param.userOrGroupName = 'TestGroup';
            params.clear();
            params.add(param);
            results = sendNotificationsToGroup.sendNotificationsToGroup(params);
        }
    }
}