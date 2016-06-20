'use strict';

app.selectedView = kendo.observable({
    onShow: function (event) {
        app.formView.removeStartReportView();
        var report;
        if(switchView == 0){
            report = Report.getSelectedArround();
        }else if(switchView == 1){
            report = Report.getSelectedLast();
        }
        var items = {
            data: report.Images,
            pageSize: 0
        };
        var height = screen.width;
        items.data[0].Url = 'https://bs1.cdn.telerik.com/image/v1/'+app.data.mayorMobile.setup.apiKey+'/resize=w:'+height+'/'+items.data[0].Url;
        var ds = new kendo.data.DataSource(items);
        var scrollView = $("#selectedReportView").data("kendoMobileScrollView");
        scrollView.setDataSource(ds);
        //var html = "<h5> Време: #=dateFormat(data.CreatedAt)#</h5><h5>Категория: #=data.Category.Name# </h5><h5>Статус: #=problemStatus[data.Status]# </h5><h5>Последователи: #=getFollowers(data) #</h5><h5>Адрес: #=data.Address#</h5><h5>Потребител: #=data.Owner.DisplayName#</h5><h5>Организация:  #=data.Region#</h5><h5> Коментар: #=data.Comment#</h5>";
        var html = "<div class=\"info-row\"><label>Докладвано преди</label> #=dateFormat(data.CreatedAt)#</div><div class=\"info-row\"><label>Докладвано от</label>#=data.Owner.DisplayName#</div><div class=\"info-row\"><label>Отговорен орган</label>#=data.Region#</div><div class=\"info-row\"><label>Адрес</label>#=data.Address#</div><div class=\"info-row comment-info\"><label>Коментар</label><div class=\"comment-txt\">#=data.Comment#</div></div>";
        var template = kendo.template(html);
        var result = template(report);
        var scroller = $("#reportInfo").data("kendoMobileScroller");
        scroller.scrollElement.html(result);
        
        User.isFollowedProblem(report.Id, function(err, data, user){
            $(".spinner").hide();
            if(err){
                console.log(err);
            }else{
                 if(user.IsAdmin){
                    var chanteStatusHTML = '<div class="styled-select"><select onchange="app.selectedView.changeStatus(\''+ report.Id + '\')">';
                    problemStatus.forEach(function(el, i){
                        if(i == report.Status){
                             chanteStatusHTML += '<option value="'+ i +'" selected>'+ el +'</option>';
                        }else{
                             chanteStatusHTML += '<option value="'+ i +'">'+ el +'</option>';
                        }
                    });
                    chanteStatusHTML += '</select></div>';
                    $('#ts-changeStatus').html(chanteStatusHTML);
                }
                app.selectedView.renderFollowerButton(data, report.Id);
            }
        });
    },
	renderFollowerButton: function(bool, id){
        if (bool) {
            $('#follow').html('<a class=\"button\" onclick="app.selectedView.unFollow(\''+ id + '\');">Не искам да следя този проблем</a>');
        } else {
            $('#follow').html('<a class=\"button\" onclick="app.selectedView.follow(\''+ id + '\');">Това е проблем и за мен</a>');
        }
    },
    follow: function(id){
        $(".spinner").show();
		Report.followReport(id, function(err){
            if(err){
                console.log(err);
            }else{
                $('#follow').html('<a class=\"button\" onclick="app.selectedView.unFollow(\''+ id + '\');">Не искам да следя този проблем</a>');
            	$(".spinner").hide();
            }
        });
    },
    unFollow: function(id){
        $(".spinner").show();
		Report.unFollowReport(id, function(err){
            if(err){
                console.log(err);
            }else{
                $('#follow').html('<a class=\"button\" onclick="app.selectedView.follow(\''+ id + '\');">Това е проблем и за мен</a>');
            	$(".spinner").hide();
            }
        });
    },
    changeStatus: function(id){
        $(".spinner").show();
        var status = $('#ts-changeStatus option:selected').val();
        Report.changeStatus(id, status, function(err, data){
			$(".spinner").hide();
            if(err){
                console.log(err);
            }
        });
    }
});