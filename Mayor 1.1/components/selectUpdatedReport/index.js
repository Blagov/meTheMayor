'use strict';

app.selectUpdatedReport = kendo.observable({
    onShow: function() {
        app.formView.removeStartReportView();
        var report = UpdateReport.getUpReport().Problem;
        var height = screen.width;
        var items = {
            data: report.Images,
            pageSize: 0
        };
        $('#updateReportView').height(height-80);
        items.data[0].Url = 'https://bs1.cdn.telerik.com/image/v1/'+app.data.mayorMobile.setup.apiKey+'/resize=w:'+height+'/'+items.data[0].Url;
        var ds = new kendo.data.DataSource(items);
        var scrollView = $("#updateReportView").data("kendoMobileScrollView");
        scrollView.setDataSource(ds);
        //var html = "<h5> Време: #=dateFormat(data.CreatedAt)#</h5><h5>Категория: #=data.Category.Name# </h5><h5>Статус: #=problemStatus[data.Status]# </h5><h5>Последователи: #=getFollowers(data) #</h5><h5>Адрес: #=data.Address#</h5><h5>Потребител: #=data.Owner.DisplayName#</h5><h5>Организация:  #=data.Region#</h5><h5> Коментар: #=data.Comment#</h5>";
        var html = "<div class=\"info-row\"><label>Докладвано преди</label> #=dateFormat(data.CreatedAt)#</div><div class=\"info-row\"><label>Докладвано от</label>#=data.Owner.DisplayName#</div><div class=\"info-row\"><label>Отговорен орган</label>#=data.Region#</div><div class=\"info-row\"><label>Адрес</label>#=data.Address#</div><div class=\"info-row comment-info\"><label>Коментар</label><div class=\"comment-txt\">#=data.Comment#</div></div>";
        var template = kendo.template(html);
        var result = template(report);
        var scroller = $("#updateRportInfo").data("kendoMobileScroller");
        scroller.scrollElement.html(result);
		$('#followUpdateReport').html('<a class=\"button\" onclick="app.selectUpdatedReport.unFollow(\''+ report.Id + '\');">Не искам да следя този проблем</a>');
        // change status for admins
        if(User.getUser().IsAdmin){
            var chanteStatusHTML = '<div class="styled-select"><select onchange="app.selectUpdatedReport.changeStatus(\''+ report.Id + '\')">';
            problemStatus.forEach(function(el, i){
                if(i == report.Status){
                     chanteStatusHTML += '<option value="'+ i +'" selected>'+ el +'</option>';
                }else{
                     chanteStatusHTML += '<option value="'+ i +'">'+ el +'</option>';
                }
            });
            chanteStatusHTML += '</select></div>';
            $('#ts-changeStatusUpdateReport').html(chanteStatusHTML);
        }
        
        // update status
        
        var data = app.data.mayorMobile.data('Followers');
        data.updateSingle({ Id: UpdateReport.getUpReport().Id, Seen: true},
            function(data){
                //console.log(JSON.stringify(data));
                UpdateReport.removeReport(UpdateReport.selected);
                $('#counter-update-reports .km-text').html(UpdateReport.getUpReports().length);
            },
            function(error){
                console.log(error);
        });
    },
    follow: function(id){
        $(".spinner").show();
		Report.followReport(id, function(err){
            if(err){
                console.log(err);
            }else{
                $('#followUpdateReport').html('<a class=\"button\" onclick="app.selectUpdatedReport.unFollow(\''+ id + '\');">Не искам да следя този проблем</a>');
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
                $('#followUpdateReport').html('<a class=\"button\" onclick="app.selectUpdatedReport.follow(\''+ id + '\');">Това е проблем и за мен</a>');
            	$(".spinner").hide();
            }
        });
    },
    changeStatus: function(id){
        $(".spinner").show();
        var status = $('#ts-changeStatusUpdateReport option:selected').val();
        Report.changeStatus(id, status, function(err, data){
            if(err){
                console.log(err);
            }else{
            	$(".spinner").hide();
            }
        });
    }
});