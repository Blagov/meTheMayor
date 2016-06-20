'use strict';
var el = app.data.mayorMobile;

app.profileView = kendo.observable({
    onShow: function() {
        app.formView.removeStartReportView();
    },
    logout: function() {
        User.logout(function(err){
            console.log('logout');
            if(err == null){
                app.mobileApp.navigate('components/home/view.html');
            }else{
                console.log(err);
            }
        });
    },
    afterShow: function() {}
});