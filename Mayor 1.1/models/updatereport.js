'use strict'

class UpdateReport{
    
    constructor(){
        this.selected = null;
        this.reports = null;
        this.newRepId = null;
    }
    
    static setUpReport(id){
        this.selected = id;
    }
    
    static getUpReport(){
        var report = this.reports[this.selected];
        return report;
    }
    
    static setUpReports(reports){
        this.reports = reports;
    }
    
    static getUpReports(){
        return this.reports;
    }
    
    static removeReport(id){
        this.reports.splice(id,1);
    }
    
    static setNewReportId(id){
        this.newRepId = id;
    }
    
    static getNewReport(callback){
        var self = this;
        var filter = new Everlive.Query();
        var provider = app.data.mayorMobile;
        var data = provider.data('Problems');
        filter.where().eq('Id', self.newRepId);
        data.withHeaders({
                'X-Everlive-Expand': {
                    "Category": {
                        "TargetTypeName": "Problems"
                    },
                    "Owner": {
                        "TargetTypeName": "Problems"
                    },
                    "Followers.Problem": {
                        "ReturnAs": "Followers"
                    },
                    "Images.Problem": {
                        "ReturnAs": "Images",
                        "Fields": {
                            "Url": 1,
                            "Problem": 0
                        }
                    }

                }
            })
            .get(filter)
            .then(function (data) {
                    callback(null, data.result);
                },
                function (error) {
                   callback(error, null);
                });
    }
}