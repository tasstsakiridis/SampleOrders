global class sendNotificationsToGroup {
    @InvocableMethod
    public static List<sendNotificationsToGroupResults> sendNotificationsToGroup(List<sendNotificationsToGroupParams> params) {
        /**
         * Params:
         * ids:   List of record id's for the records we're trying to find owners/shared owners for
         * objectApiName :  The api name of the object to query, eg:  Account,  Order__c
         * userOrGroup   :  'user' : to limit notifications to a single user,  indicated by the userOrGroupName parameter
         *               :  'group' : to limit notifications to a public group, indicated by the userOrGroupName parameter
         *               :  blank or null : to limit notification to only the owner of record(s)
         * userOrGroupName : the name of the user or group to limit notifications to
         * emailTemplateName : the name of the email template to use for the notification
         */

        List<String> ids = params[0].recordIds;
        String objectApiName = params[0].objectApiName;
        String userOrGroup = params[0].userOrGroup;
        String userOrGroupName = params[0].userOrGroupName;
        String emailTemplateName = params[0].emailTemplateName;
        Boolean onlyNotifyOwner = params[0].onlyNotifyOwner;
        Boolean includeGroups = params[0].includeGroups;

        List<sendNotificationsToGroupResults> results = new List<sendNotificationsToGroupResults>();
        sendNotificationsToGroupResults result = new sendNotificationsToGroupResults();

        String soql = '';

        try {
            if (ids == null || ids.size() == 0) {
                throw new bfException('No ids to process');
            }
            if (String.isEmpty(emailTemplateName)) {
                throw new bfException('No email template specified');
            }
            if (String.isEmpty(objectApiName)) {
                Id firstId = Id.valueOf(ids[0]);
                objectApiName = firstId.getSObjectType().getDescribe().getName();
            }

            String lookupField = 'ParentId';
            String shareName = objectApiName;
            if (objectApiName.indexOf('__c') < 0) {
                shareName += 'Share';
                lookupField = objectApiName + 'Id';
            } else {
                shareName.replace('__c', '__Share');
            }
            System.debug('shareName: ' + shareName);

            EmailTemplate template = [SELECT Id FROM EmailTemplate WHERE DeveloperName =:emailTemplateName];
            if (template == null) {
                throw new bfException('No email template found with name ' + emailTemplateName);
            }
            System.debug('email template id: ' + template.Id);

            if (String.isEmpty(userOrGroup)) {
                userOrGroup = 'user';
            }

            List<String> usersToEmail = new List<String>();
            if (onlyNotifyOwner) {
                soql = 'SELECT Id, OwnerId FROM ' + shareName + ' WHERE '+ lookupField + ' =:ids';
                userOrGroupName = 'OwnerId';
            } else {                
                soql = 'SELECT Id, UserOrGroupId FROM ' + shareName + ' WHERE ' + lookupField + ' =:ids';                
                if (String.isNotEmpty(userOrGroupName)) {
                    soql += ' AND UserOrGroup.Name =:userOrGroupName';
                }
            }
            System.debug('soql: ' + soql);

            List<sObject> objectList = Database.query(soql);
            for(sObject s : objectList) {
                if (onlyNotifyOwner) {
                    usersToEmail.add(String.valueOf(s.get('OwnerId')));
                } else {
                    String groupId = String.valueOf(s.get('UserOrGroupId'));
                    String memberType = getMemberType(groupId);
                    if (memberType == 'User') {
                        usersToEmail.add(groupId);
                    } else if (memberType == 'Group' && includeGroups) {
                        List<String> groupMembers = getGroupMembers(groupId, userOrGroup, userOrGroupName);                    
                        if (groupMembers.size() > 0) {
                            usersToEmail.addAll(groupMembers);
                        }                        
                    }
                }
            }
            
            System.debug('# of users to email: ' + usersToEmail.size());
            result.usersToEmail = [SELECT Id, Name, Email FROM User WHERE Id =:usersToEmail];
            result.emailString = String.join(result.usersToEmail, ',');
            result.emails = new List<String>();
            for(User s : result.usersToEmail) {
                result.emails.add(s.Email);
                System.debug('user id: ' + s.Id + ', name: ' + s.Name);
            }

            result.status = 'OK';
        } catch(Exception ex) {
            result.status = 'Error';
            result.message = ex.getMessage();
        }

        results.add(result);
        return results;
    }

    private static String getMemberType(String memberId) {
        Id userOrGroupId = Id.valueOf(memberId);
        return userOrGroupId.getSObjectType().getDescribe().getName();

    }
    private static List<String> getGroupMembers(String groupId, String userOrGroup, String userOrGroupName) {
        String memberType = getMemberType(groupId);
        List<String> result = new List<String>();
        if (memberType == 'User') {
            result.add(groupId);
        } else {
            List<GroupMember> groupMembers = [SELECT Id, UserOrGroupId FROM GroupMember WHERE GroupId =:groupId];
            if (groupMembers != null && groupMembers.size() > 0) {
                System.debug('# of members in group ['+groupId+'] : ' + groupMembers.size());
                for(GroupMember g : groupMembers) {
                    memberType = getMemberType(g.UserOrGroupId);
                    System.debug('member with id : ' + g.UserOrGroupId + ' is a ' + memberType);
                    if (memberType == 'User') {
                        result.add(g.UserOrGroupId);
                    } else if (memberType == 'Group') {
                        List<String> otherGroupMembers = getGroupMembers(g.UserOrGroupId, userOrGroup, userOrGroupName);
                        if (otherGroupMembers.size() > 0) {
                            result.addAll(otherGroupMembers);
                        }
                    }
                }
            }

        }

        System.debug('# of user to email in group: ' + result.size());
        return result;
    }

    public class sendNotificationsToGroupParams {
        @InvocableVariable(label='Record Ids' description='List of record ids to send notifications for' required=true)
        public List<String> recordIds;

        @InvocableVariable(label='Object API Name' description='API name of the object' required=true)
        public String objectApiName;

        @InvocableVariable(label='Only message owner' description='Only notify owner of the record?' required=true)
        public Boolean onlyNotifyOwner;

        @InvocableVariable(label='Include users in groups' description='Include users that in groups' required=false)
        public Boolean includeGroups;

        @InvocableVariable(label='User or Group' description='Limit notifications to this type of member' required=false)
        public String userOrGroup;

        @InvocableVariable(label='Name of User or Group' description='The name of the user or group to limit notifications to' required=false)
        public String userOrGroupName;

        @InvocableVariable(label='Email Template Name' description='Name of the Email Template to user in notification' required=true)
        public String emailTemplateName;
    }
    public class sendNotificationsToGroupResults {
        @InvocableVariable(label='Status' description='The status of the request to send notifications' required=true)
        public String status;

        @InvocableVariable(label='Message' description='Exception messages, if any' required=false)
        public String message;

        @InvocableVariable(label='Users' description='Users to email' required=false)
        public List<User> usersToEmail;

        @InvocableVariable(label='Emails' description='Email address of users to email' required=false)
        public List<String> emails;

        @InvocableVariable(label='EmailString' description='Comma separated list of emails' required=false)
        public String emailString;
    }
}