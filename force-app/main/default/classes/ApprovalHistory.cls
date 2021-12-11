global class ApprovalHistory {
    @AuraEnabled
    public String TeamLeader { get; set; }

    @AuraEnabled
    public String TeamManager { get; set; }

    @AuraEnabled 
    public String FinanceManager { get; set; }

    @AuraEnabled 
    public String CreatedDate { get; set; }

    @AuraEnabled 
    public List<ApprovalHistoryItem> items { get; set; }

    public ApprovalHistory() {
        this.TeamLeader = '';
        this.TeamManager = '';
        this.FinanceManager = '';

        DateTime now = DateTime.now();
        this.CreatedDate = now.format('EE, dd MMM YYYY, hh:mm a');

        this.items = new List<ApprovalHistoryItem>();
    }

    public ApprovalHistory(DateTime createdDate) {
        this.TeamLeader = '';
        this.TeamManager = '';
        this.FinanceManager = '';

        this.CreatedDate = createdDate.format('EE, dd MMM YYYY, hh:mm a');

        this.items = new List<ApprovalHistoryItem>();
    }

    public ApprovalHistory(String teamLeader, String teamManager, String financeManager, DateTime createdDate) {
        this.TeamLeader = teamLeader;
        this.TeamManager = teamManager;
        this.FinanceManager = financeManager;
        this.CreatedDate = createdDate.format('EE, dd MMM YYYY, hh:mm a');

        this.items = new List<ApprovalHistoryItem>();
    }

}