'use strict';

app.authenticationView = kendo.observable({
    onShow: function () {
		app.formView.removeStartReportView();
    },
    signIn: function(){
        var form = $('#sign-in');
		var data = form.serializeToJSON();
        if(data.username.length == 0){
            alert("Email is empty");
        }else if(data.password.length == 0){
            alert("Password is empty");
        }else if(data.username.length > 0 && data.password.length > 0){
            $(".spinner").show();
            User.signIn(data, function(err, data){
                $(".spinner").hide();
                if(err){
                    alert(err.message);
                }else{
                    form[0].reset();
                    app.mobileApp.navigate('components/formView/view.html');
                }
            });
        }
    },
    toggleView: function(){
        if($('.signin-view').hasClass('active')){
            $('.signin-view').removeClass('active');
            $('.signup-view').addClass('active');
            $('.signin-view').css("display", "none");
            $('.signup-view').css("display", "");
        }else if($('.signup-view').hasClass('active')){
            $('.signin-view').addClass('active');
            $('.signup-view').removeClass('active');
            $('.signin-view').css("display", "");
            $('.signup-view').css("display", "none");
        }
    },
    register: function(){
        var form = $('#register');
        var data = form.serializeToJSON();
        var regex = new RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/);
        if(data.username.length == 0 || !regex.test(data.username)){
            alert('Empty filed or not valid mail');
        }else if(data.password.length == 0){
            alert('No password');
        }else if(data.displayName.length == 0){
            alert('No name');
        }else if(data.username.length > 0 && data.password.length > 0 && data.displayName.length > 0){
            $(".spinner").show();
            User.register(data, function(err, data){
                $(".spinner").hide();
                if(err){
                    alert(err.message);
                }else{
                    form[0].reset();
                    $('#counter-update-reports .km-text').html(UpdateReport.getUpReports().length);
                    app.mobileApp.navigate('components/formView/view.html');
                }
            })
        }
    },
    facebookAuthnetication: function(){
        $(".spinner").show();
        User.fbAuth(function(err, data){
            if(err){
                alert(JSON.stringify(err));
            }else{
                $(".spinner").hide();
                app.mobileApp.navigate('components/formView/view.html');
            }
        })
    }
});