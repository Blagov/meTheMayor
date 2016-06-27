'use strict';
app.profileView = kendo.observable({
    onShow: function(event) {
        $(".spinner").show();
        app.formView.removeStartReportView();
        app.profileView.userEdit();
        Report.getUserReports(function(error, reports){
            $(".spinner").hide();
            if(error){
                console.log(error);
            }else{
                $("#status-report").html("<li>Отворени<br>"+reports.open.length+"</li><li>В обработка<br>"+reports.progress.length+"</li><li>Приключени<br>"+reports.closed.length+"</li>");
              
                var h = event.view.content[0].clientHeight;
                var html = app.profileView.reportView();
                var template = kendo.template(html);
                var result;
                if(switchviewProfile == 0){
                    result = template(reports.open);
                }else if(switchviewProfile == 1){
                    result = template(reports.progress);
                }else if(switchviewProfile == 2){
                    result = template(reports.closed);
                }
                var scroller = $("#user-reports").data("kendoMobileScroller");
                scroller.scrollElement.html(result);
                $(".item").height(h / 2.120);
                
                $("#status-report").kendoMobileButtonGroup({
                    select: function (e) {
                        
                        if(e.index == 0){
                            result = template(reports.open);
                            switchviewProfile = 0;
                        }else if(e.index == 1){
                            result = template(reports.progress);
                            switchviewProfile = 1;
                        }else if(e.index == 2){
                            result = template(reports.closed);
                            switchviewProfile = 2;
                        }
                        
                        scroller = $("#user-reports").data("kendoMobileScroller");
                        scroller.scrollElement.html(result);
                    },
                    index: 0
                });
              
                var buttongroup = $("#status-report").data("kendoMobileButtonGroup");
            buttongroup.select(switchviewProfile);
            }
        });
    },
    reportView: function(items){
        var s = '';
        var height = screen.width;
        var img = 'https://bs1.cdn.telerik.com/image/v1/'+app.data.mayorMobile.setup.apiKey+'/resize=w:'+height+'/';
        if(switchView==0){
            s = '#=data[i].Address#';
        }else{
            s = '#=data[i].Address#, #=data[i].Region#';
        }
        var html =
        '# for (var i= 0; i < data.length; i++) { #'
            + '<div id=#=i# onclick="app.profileView.select(this.id)"  class="listview-item item" >' 
            +	  '<img class="item-img" src='+img+'#=data[i].Images[0].Url#>' 
            +     '<div class="profile-image">' 
            +         '# if (data[i].Owner.IdentityProvider == "Facebook") {  # <img style="border-radius: 50%;" src="https://graph.facebook.com/#=data[i].Owner.Picture#/picture?type=large" width="50"> # }else{  # <img src="images/temp/user_profile_img.png" width="50"> #}#' 
            +     '</div>' 
                + '<div class="box-top-right">'
                + 	'<div class="report-date">' 
                + 		'<span class="km-icon km-icon-clock"></span>' 
                + 		'#=dateFormat(data[i].CreatedAt)#' 
                + 	'</div>' 
                + '</div>' 
                + '<div class="ad-category-info">' 
                + 	'<div class="address">'
                + 		'<span class="km-icon km-icon-pinmap"></span>' 
                + 		s
                + 	'</div>' 
                + 	'<div class="category">'
                + 		'<a class="km-widgetr km-button">' 
                + 			'<span class="km-text km-icon km-icon-#=data[i].Category.Class #"><!--&num;#=data[i].Category.Name #--></span>' 
                + 		'</a>'
                + 	'</div>'
                + '</div>'
            + '</div>'
        + '# } #'
        return html;
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
    select: function(id){
        Report.setUsrRepSelected(id);
        app.mobileApp.navigate('components/selectUpdatedReport/view.html');
    },
    userEdit: function(){
        var user = User.getUser();
        $("#user-info").html(`
                <h2>
                    Покажи още
                </h2>
                <h2>
                    Твоят профил
                </h2>
				<div id="user-data">
					<div class="info-row"><label>име</label>${user.DisplayName}</div>
                    <div class="info-row"><label>телефон</label>0891234567</div>
                    <div class="info-row"><label>ел. поща</label>${user.Email}</div>
                    <button class="button" onclick="app.profileView.edit();">
                        Редактирай
                    </button>
				</div>
				<div id="user-data-update" style="display: none;">
					<ul class="input-list style-4 clearfix">
                      <li>
                        <input type="text" id="user-name" value="${user.DisplayName}">
                      </li>
					  <li>
                        <input type="text" id="user-email" value="${user.Email}">
                      </li>
						<li>
                        <input type="text" id="user-phone" value="0894664326">
                      </li>
                    </ul>
                    <button class="button" onclick="app.profileView.save();">
                        Запиши
                    </button>
				</div>
                <div class="info-row" style="height:50px;"><label></label></div>
                <h2>
                    Други
                </h2>
                <div class="info-row"><label>Често задавани Въпроси</label> </div>
                <div class="info-row"><label>Покани приятел</label> </div>
                <div class="info-row" onclick="app.profileView.logout()"><label>Изход от приложението</label> </div>
                <div class="info-row" style="height:150px;"><label></label></div>
                <h2>
                    Правила и условия<br>
                    Декларация за поверителност
                </h2>`)
    },
    edit: function(){
        $("#user-data").hide();
        $("#user-data-update").show();
    },
    save: function(){
        $(".spinner").show();
        var t = {
            DisplayName: $("#user-name").val(),
            Email: $("#user-email").val()
        }
        User.userUpdate(t, function(err){
            if(err){
                console.log(err);
            }
            app.profileView.userEdit();
            $(".spinner").hide();
        });
        $("#user-data").show();
        $("#user-data-update").hide();
    }
});