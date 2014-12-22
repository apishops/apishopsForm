$(document).ready( function() {

    new Switchery(document.querySelector('.apishopsFormConstructorShowPicture'), { color: '#008300', secondaryColor: '#c4efc4' });
    new Switchery(document.querySelector('.apishopsFormConstructorShowPrice'), { color: '#36c8c6', secondaryColor: '#abe6e5' });
    new Switchery(document.querySelector('.apishopsFormConstructorShowName'), { color: '#ffa900', secondaryColor: '#f7e1b7' });
    new Switchery(document.querySelector('.apishopsFormConstructorShowCount'), { color: '#0097ff', secondaryColor: '#b6ddf8' });

    $('.apishopsFormConstructorType').radioImageSelect();
    $('.apishopsFormConstructorMainTheme').radioImageSelect();
    $('.apishopsFormConstructorAdditionalTheme').radioImageSelect();

    var codeInput=$('[name=apishopsConstructorCode]','.apishopsFormConstructor');
    var containerInput=$('.apishopsFormConstructorContainer','.apishopsFormConstructor');

    $('.apishopsFormConstructorControl').change(function() {

          var typeInput=$('[name=apishopsFormConstructorType]:checked','.apishopsFormConstructor');

          var siteIdInput=$('.apishopsFormConstructorSiteId','.apishopsFormConstructor');
          var wpIdproductIdInput=$('.apishopsFormConstructorwpIdproductId','.apishopsFormConstructor');

          var isModalInput=$('.apishopsFormConstructorIsModal','.apishopsFormConstructor');


          var isAddJquery=$('.apishopsFormConstructorAddJquery');
          var isAddApishops=$('.apishopsFormConstructorAddApishops');

          var isFinishInput=$('.apishopsFormConstructordIsFinish','.apishopsFormConstructor');
          var finishUrlInput=$('.apishopsFormConstructordFinishUrl','.apishopsFormConstructor');

          var isShowFeature=$('.apishopsFormConstructorIsShowFeature','.apishopsFormConstructor');
          var featureCount=$('.apishopsFormConstructordFeatureCount','.apishopsFormConstructor');


          var showPictureInput=$('.apishopsFormConstructorShowPicture','.apishopsFormConstructor');
          var showPriceInput=$('.apishopsFormConstructorShowPrice','.apishopsFormConstructor');
          var showNameInput=$('.apishopsFormConstructorShowName','.apishopsFormConstructor');
          var showCountInput=$('.apishopsFormConstructorShowCount','.apishopsFormConstructor');

          var langInput=$('.apishopsFormConstructorLang','.apishopsFormConstructor');

          var formStartColor=$('.apishopsFormConstructorFormColorStart','.apishopsFormConstructor').val();
          var formEndColor=$('.apishopsFormConstructorFormColorEnd','.apishopsFormConstructor').val();
          var textColor=$('.apishopsFormConstructorTextColor','.apishopsFormConstructor').val();
          var buttonStartColor=$('.apishopsFormConstructorButtonColorStart','.apishopsFormConstructor').val();
          var buttonEndColor=$('.apishopsFormConstructorButtonColorEnd','.apishopsFormConstructor').val();





          var displayed_containers=[];
          if(showPictureInput.is(':checked'))
            displayed_containers.push('picture');
          if(showPriceInput.is(':checked'))
            displayed_containers.push('price')
          if(showNameInput.is(':checked'))
            displayed_containers.push('name')

          var hidden_fields=[];
          var optional_fields=[];
          if(!showCountInput.is(':checked')){
            hidden_fields.push('count')
            optional_fields.push('count');
          }

          if(typeInput.val()=='light'){
            hidden_fields.push('fio')
            hidden_fields.push('address')
            optional_fields.push('fio');
            optional_fields.push('address')
          }




          var code="";
/*
          var isAddJquery=$('.apishopsFormConstructorAddJquery');
          var isAddApishops=$('.apishopsFormConstructorAddApishops');
 */
          if(isAddJquery.is(':checked')){
            code += "<!-- init jquery -->\n";
            code += "<script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js\"></script>\n";
          }

          if(isAddApishops.is(':checked')){
            code += "<!-- init apishops -->\n";
            code += "<script src=\"http://img.apishops.org/SinglePageWebsites/custom/js/apishopsForm.2.js\"></script>\n";
            code += "<link href=\"http://img.apishops.org/SinglePageWebsites/custom/css/apishopsForm.2.css\" rel=\"stylesheet\">\n";
          }

          if(isModalInput.is(':checked')){
            code += "<div id=\"buttonId\"><a class='apishopsFormButton apishopsFormBuy' href=#>Кнопка оформления заказ</a><\/div>\n";
            $('.apishopsFormConstructorOptionsArrows').hide();
          }
          else{
            code += "<div id=\"containerId\"><\/div>\n";
            $('.apishopsFormConstructorOptionsArrows').show();
          }

          code += "<script>\n";
          code += "    $(document).ready( function() {\n";

          if(!isModalInput.is(':checked')){
            code += "        $('#containerId').apishopsForm({\n";
            code += "            type:'inline', /*тип открытия [inline|modal]*/\n";
          }
          else{
            code += "        $('#buttonId').apishopsForm({\n";
            code += "            type:'modal', /*тип открытия [inline|modal]*/\n";
          }

         if(isFinishInput.is(':checked')){
            finishUrlInput.removeAttr('disabled');
            code += "            successUrl:'"+finishUrlInput.val()+"', /*url благодарственной страницы [url|false]*/\n";
          }
          else{
            finishUrlInput.attr('disabled','true');
            code += "            successUrl:false, /*url благодарственной страницы [url|false]*/\n";
          }

          if(typeInput.val()=='extended')
              code += "            form:'normal', /*тип формы [normal|light|jquery-selector]*/\n";
          else
              code += "            form:'light', /*тип формы [normal|light|jquery-selector]*/\n";
          if(displayed_containers.length>0)
              code += "            displayed_containers:['"+displayed_containers.join("','")+"'],\n";
          if(hidden_fields.length>0)
              code += "            hidden_fields:['"+hidden_fields.join("','")+"'],\n";
          if(optional_fields.length>0)
              code += "            optional_fields:['"+optional_fields.join("','")+"'],\n";


          if($('.apishopsFormConstructorMainTheme:checked').val()>0)
            code += "            theme:"+$('.apishopsFormConstructorMainTheme:checked').val()+",\n";

          code += "            siteId:"+siteIdInput.val()+",/*айди сайта из панели партнера http://www.apishops.com/Webmaster/WebsiteGroup/WebsiteGroupList.jsp */\n";
          code += "            productId:"+wpIdproductIdInput.val()+", /*айди товара из ассортимента на странице http://www.apishops.com*/\n";
          code += "            lang:"+langInput.val()+",\n";

          if(isShowFeature.is(':checked')){
            code += "            featured:{\n";
            code += "               container: '#containerAdditionalItemsId',\n";
            code += "               count: "+featureCount.val()+"\n";
            code += "            }\n";
          }

          code += "        });\n";
          code += "    });\n";
          code += "<\/script>\n";

          if(isShowFeature.is(':checked')){
            code += "<div id='containerAdditionalItemsId'></div>\n";
          }

          if($(apishopsFormConstructorFormElement).attr('class') && $(apishopsFormConstructorButtonElement).attr('class')){
            var formClass='.'+$(apishopsFormConstructorFormElement).attr('class').replace(/\s/gim,'.');
            var buttonClass='.'+$(apishopsFormConstructorButtonElement).attr('class').replace(/\s/gim,'.');
            code += "<style>\n";
            code += "    "+formClass+"{\n";
            code += "    color:"+textColor+";\n";
            code += "    background:"+formStartColor+";\n";
            code += "    background: -moz-linear-gradient(top,  "+formStartColor+" 0%, "+formStartColor+" 100%); \n";
            code += "    background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,"+formStartColor+"), color-stop(100%,"+formEndColor+"));;\n";
            code += "    background: -webkit-linear-gradient(top,  "+formStartColor+" 0%,"+formEndColor+" 100%);\n";
            code += "    background: -o-linear-gradient(top,  "+formStartColor+" 0%,"+formEndColor+" 100%);\n";
            code += "    background: -ms-linear-gradient(top,  "+formStartColor+" 0%,"+formEndColor+" 100%);\n";
            code += "    background: linear-gradient(to bottom,  "+formStartColor+" 0%,"+formEndColor+" 100%); \n";
            code += "    }\n";
            code += "    "+buttonClass+"{\n";
            code += "    background:"+buttonStartColor+";\n";
            code += "    background: -moz-linear-gradient(top,  "+buttonStartColor+" 0%, "+buttonEndColor+" 100%); \n";
            code += "    background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,"+buttonStartColor+"), color-stop(100%,"+buttonEndColor+"));;\n";
            code += "    background: -webkit-linear-gradient(top,  "+buttonStartColor+" 0%,"+buttonEndColor+" 100%);\n";
            code += "    background: -o-linear-gradient(top,  "+buttonStartColor+" 0%,"+buttonEndColor+" 100%);\n";
            code += "    background: -ms-linear-gradient(top,  "+buttonStartColor+" 0%,"+buttonEndColor+" 100%);\n";
            code += "    background: linear-gradient(to bottom,  "+buttonStartColor+" 0%,"+buttonEndColor+" 100%); \n";
            code += "    }\n";
            code += "</style>\n";
          }

          codeInput.val(code).change();

    });

    $(codeInput).bind({
          change: function() {
                apishopsConstructorEvalCode(codeInput.val(), containerInput);
                apishopsFormConstructorInterval=setInterval(apishopsFormConstructorWaitFormElements, 1000)
          }
    });


    $('.apishopsFormConstructorFormColorStart','.apishopsFormConstructor').ColorPicker({
      onShow: function (colpkr) {
        $(colpkr).fadeIn(500);
        return false;
      },
      onHide: function (colpkr) {
        $(colpkr).fadeOut(500);
        //$('.apishopsFormConstructorButtonColorEnd','.apishopsFormConstructor').change();
        return false;
      },
      onChange: function (hsb, hex, rgb) {
        $('.apishopsFormConstructorFormColorStart','.apishopsFormConstructor').css('backgroundColor', '#' + hex).val('#' + hex);
        apishopsFormConstructorShowColorsForm();
      }
    });

    $('.apishopsFormConstructorFormColorEnd','.apishopsFormConstructor').ColorPicker({
      onShow: function (colpkr) {
        $(colpkr).fadeIn(500);
        return false;
      },
      onHide: function (colpkr) {
        $(colpkr).fadeOut(500);
        //$('.apishopsFormConstructorFormColorEnd','.apishopsFormConstructor').change();
        return false;
      },
      onChange: function (hsb, hex, rgb) {
        $('.apishopsFormConstructorFormColorEnd','.apishopsFormConstructor').css('backgroundColor', '#' + hex).val('#' + hex);
        apishopsFormConstructorShowColorsForm();
      }
    });

    $('.apishopsFormConstructorTextColor','.apishopsFormConstructor').ColorPicker({
      onShow: function (colpkr) {
        $(colpkr).fadeIn(500);
        return false;
      },
      onHide: function (colpkr) {
        $(colpkr).fadeOut(500);
        //$('.apishopsFormConstructorTextColor','.apishopsFormConstructor').change();
        return false;
      },
      onChange: function (hsb, hex, rgb) {
        $('.apishopsFormConstructorTextColor','.apishopsFormConstructor').css('backgroundColor', '#' + hex).val('#' + hex);
        apishopsFormConstructorShowColorsForm();
      }
    });

    $('.apishopsFormConstructorButtonColorStart','.apishopsFormConstructor').ColorPicker({
      onShow: function (colpkr) {
        $(colpkr).fadeIn(500);
        return false;
      },
      onHide: function (colpkr) {
        $(colpkr).fadeOut(500);
        //$('.apishopsFormConstructorButtonColorStart','.apishopsFormConstructor').change();
        return false;
      },
      onChange: function (hsb, hex, rgb) {
        $('.apishopsFormConstructorButtonColorStart','.apishopsFormConstructor').css('backgroundColor', '#' + hex).val('#' + hex);
        apishopsFormConstructorShowColorsButton();
      }
    });

    $('.apishopsFormConstructorButtonColorEnd','.apishopsFormConstructor').ColorPicker({
      onShow: function (colpkr) {
        $(colpkr).fadeIn(500);
        return false;
      },
      onHide: function (colpkr) {
        $(colpkr).fadeOut(500);
        //$('.apishopsFormConstructorButtonColorEnd','.apishopsFormConstructor').change();
        return false;
      },
      onChange: function (hsb, hex, rgb) {
        $('.apishopsFormConstructorButtonColorEnd','.apishopsFormConstructor').css('backgroundColor', '#' + hex).val('#' + hex);
        apishopsFormConstructorShowColorsButton();
      }
    });

    apishopsConstructorEvalCode(codeInput.val(), containerInput);
    apishopsFormConstructorInterval=setInterval(apishopsFormConstructorWaitFormElements, 1000)
});


    var apishopsFormConstructorInterval=null;

    var apishopsFormConstructorFormElement=null

    var apishopsFormConstructorPriceElement=null
    var apishopsFormConstructorImageElement=null
    var apishopsFormConstructorCountElement=null
    var apishopsFormConstructorNameElement=null

    var apishopsFormConstructorButtonElement=null

    var editor=null;

    function apishopsFormConstructorWaitFormElements()
    {
        if(apishopsFormConstructorGetElements()){
          //clearInterval(apishopsFormConstructorInterval);
          apishopsFormConstructorOptionsPrepare();
          apishopsFormConstructorGetColors();
        }
    }

    function apishopsFormConstructorGetElements()
    {
        apishopsFormConstructorFormElement=$($('.apishopsFormItem').get(0));

        apishopsFormConstructorPriceElement=$($('.apishopsFormPrice:last',apishopsFormConstructorFormElement).get(0))
        apishopsFormConstructorImageElement=$($('.apishopsFormImageWrapper',apishopsFormConstructorFormElement).get(0))
        apishopsFormConstructorCountElement=$($('[name=apishopsFormCount]',apishopsFormConstructorFormElement).get(0))
        apishopsFormConstructorNameElement=$($('.apishopsFormName',apishopsFormConstructorFormElement).get(0))

        apishopsFormConstructorButtonElement=$($('[type=button],[type=submit],button',apishopsFormConstructorFormElement).get(0))

        if(!apishopsFormConstructorFormElement.length || !apishopsFormConstructorPriceElement.length || !apishopsFormConstructorButtonElement.length)
            return false;
        else{
            return true;
        }
    }

    function apishopsFormConstructorGetColors(){


        var colorBgStart='#ffffff'
        var colorBgEnd='#ffffff'
        var colorText='#000000'
        if(/(rgb\([^\)]+\)) 0%, (rgb\([^\)]+\))/im.exec($(apishopsFormConstructorFormElement).css('background-image'))!=null){
          var arr=/(rgb\([^\)]+\)) 0%, (rgb\([^\)]+\))/im.exec($(apishopsFormConstructorFormElement).css('background-image'));
          var colorBgStart=rgb2hex(arr[1]);
          var colorBgEnd=rgb2hex(arr[2]);
        }
        if(/(rgb\([^\)]+\))/im.exec($(apishopsFormConstructorFormElement).css('color'))!=null){
          var arr=/(rgb\([^\)]+\))/im.exec($(apishopsFormConstructorFormElement).css('color'));
          var colorText=rgb2hex(arr[1]);
        }
        $('.apishopsFormConstructorFormColorStart','.apishopsFormConstructor').val(colorBgStart).css('background-color',colorBgStart);
        $('.apishopsFormConstructorFormColorEnd','.apishopsFormConstructor').val(colorBgEnd).css('background-color',colorBgEnd);
        $('.apishopsFormConstructorTextColor','.apishopsFormConstructor').val(colorText).css('background-color',colorText);


        var colorButtonStart='#000000'
        var colorButtonEnd='#000000'
        if(/(rgb\([^\)]+\)) 0%, (rgb\([^\)]+\))/im.exec($(apishopsFormConstructorButtonElement).css('background-image'))!=null){
          var arr=/(rgb\([^\)]+\)) 0%, (rgb\([^\)]+\))/im.exec($(apishopsFormConstructorButtonElement).css('background-image'));
          var colorButtonStart=rgb2hex(arr[1]);
          var colorButtonEnd=rgb2hex(arr[2]);
        }
        $('.apishopsFormConstructorButtonColorStart','.apishopsFormConstructor').val(colorButtonStart).css('background-color',colorButtonStart);
        $('.apishopsFormConstructorButtonColorEnd','.apishopsFormConstructor').val(colorButtonEnd).css('background-color',colorButtonEnd);

        $(apishopsFormConstructorFormElement).css('color')
    }


    function apishopsFormConstructorShowColorsForm()
    {
      var colorBgStart=$('.apishopsFormConstructorFormColorStart','.apishopsFormConstructor').val();
      var colorBgEnd=$('.apishopsFormConstructorFormColorEnd','.apishopsFormConstructor').val();
      var colorText=$('.apishopsFormConstructorTextColor','.apishopsFormConstructor').val();
      $(apishopsFormConstructorFormElement).css('background','linear-gradient(to bottom, '+colorBgStart+' 0%,'+colorBgEnd+' 100%)');//.css('background-image','-moz-linear-gradient(to bottom, '+colorBgStart+' 0%,'+colorBgEnd+' 100%)').css('background-image','-webkit-linear-gradient(to bottom, '+colorBgStart+' 0%,'+colorBgEnd+' 100%)')
      $(apishopsFormConstructorFormElement).css('color',colorText);
    }
    function apishopsFormConstructorApplyColorsForm()
    {
      $('.apishopsFormConstructorFormColorStart','.apishopsFormConstructor').change();
      $('.apishopsFormConstructorFormColorEnd','.apishopsFormConstructor').change();
      $('.apishopsFormConstructorTextColor','.apishopsFormConstructor').change();
      $('.apishopsFormConstructorOptionsHoverCardForm').removeClass('apishopsFormConstructorOptionsHoverCardsHover');
    }
    function apishopsFormConstructorCancelColorsForm()
    {
      var colorBgStart=$('.apishopsFormConstructorFormColorStart','.apishopsFormConstructor').attr('oldval');
      var colorBgEnd=$('.apishopsFormConstructorFormColorEnd','.apishopsFormConstructor').attr('oldval');
      var colorText=$('.apishopsFormConstructorTextColor','.apishopsFormConstructor').attr('oldval');

      $('.apishopsFormConstructorFormColorStart','.apishopsFormConstructor').val(colorBgStart).css('backgroundColor',colorBgStart);
      $('.apishopsFormConstructorFormColorEnd','.apishopsFormConstructor').val(colorBgEnd).css('backgroundColor',colorBgEnd);
      $('.apishopsFormConstructorTextColor','.apishopsFormConstructor').val(colorText).css('backgroundColor',colorText);

      $(apishopsFormConstructorFormElement).css('background','linear-gradient(to bottom, '+colorBgStart+' 0%,'+colorBgEnd+' 100%)');//.css('background-image','-moz-linear-gradient(to bottom, '+colorBgStart+' 0%,'+colorBgEnd+' 100%)').css('background-image','-webkit-linear-gradient(to bottom, '+colorBgStart+' 0%,'+colorBgEnd+' 100%)')
      $(apishopsFormConstructorFormElement).css('color',colorText);
      $('.apishopsFormConstructorOptionsHoverCardForm').removeClass('apishopsFormConstructorOptionsHoverCardsHover');
    }


    function apishopsFormConstructorShowColorsButton()
    {
      var colorButtonStart=$('.apishopsFormConstructorButtonColorStart','.apishopsFormConstructor').val();
      var colorButtonEnd=$('.apishopsFormConstructorButtonColorEnd','.apishopsFormConstructor').val();
      $(apishopsFormConstructorButtonElement).css('background','linear-gradient(to bottom, '+colorButtonStart+' 0%,'+colorButtonEnd+' 100%)');
    }
    function apishopsFormConstructorApplyColorsButton()
    {
      $('.apishopsFormConstructorButtonColorStart','.apishopsFormConstructor').change();
      $('.apishopsFormConstructorButtonColorEnd','.apishopsFormConstructor').change();
      $('.apishopsFormConstructorOptionsHoverCardButton').removeClass('apishopsFormConstructorOptionsHoverCardsHover');
    }
    function apishopsFormConstructorCancelColorsButton()
    {
      var colorButtonStart=$('.apishopsFormConstructorButtonColorStart','.apishopsFormConstructor').attr('oldval');
      var colorButtonEnd=$('.apishopsFormConstructorButtonColorEnd','.apishopsFormConstructor').attr('oldval');

      $('.apishopsFormConstructorButtonColorStart','.apishopsFormConstructor').val(colorButtonStart).css('backgroundColor',colorButtonStart);
      $('.apishopsFormConstructorButtonColorEnd','.apishopsFormConstructor').val(colorButtonEnd).css('backgroundColor',colorButtonEnd);

      $(apishopsFormConstructorButtonElement).css('background','linear-gradient(to bottom, '+colorButtonStart+' 0%,'+colorButtonEnd+' 100%)');
      $('.apishopsFormConstructorOptionsHoverCardButton').removeClass('apishopsFormConstructorOptionsHoverCardsHover');
    }




    function apishopsFormConstructorOptionsPrepare()
    {

      $( ".apishopsFormConstructorOptionsArrowImage,.apishopsFormConstructorOptionsHoverCards,.apishopsFormConstructorOptionsArrowCount,.apishopsFormConstructorOptionsArrowPrice,.apishopsFormConstructorOptionsArrowName" ).mouseover(function() {
        $('.apishopsFormConstructorOptionsArrows').addClass('apishopsFormConstructorOptionsArrowsHalfHidden');
        $('.apishopsFormConstructorOptionsHoverCards').addClass('apishopsFormConstructorOptionsArrowsHalfHidden');
        $(this).removeClass('apishopsFormConstructorOptionsArrowsHalfHidden')
      });

      $( ".apishopsFormConstructorOptionsArrowImage,.apishopsFormConstructorOptionsHoverCards,.apishopsFormConstructorOptionsArrowCount,.apishopsFormConstructorOptionsArrowPrice,.apishopsFormConstructorOptionsArrowName" ).mouseout(function() {
        $('.apishopsFormConstructorOptionsArrows').removeClass('apishopsFormConstructorOptionsArrowsHalfHidden');
        $('.apishopsFormConstructorOptionsHoverCards').removeClass('apishopsFormConstructorOptionsArrowsHalfHidden');
        $(this).removeClass('apishopsFormConstructorOptionsArrowsHalfHidden')
      });

      $( ".apishopsFormConstructorOptionsHoverCardForm" ).click(function(event) {
        if(!$(event.target).is('a') && !$(this).hasClass('apishopsFormConstructorOptionsHoverCardsHover')) {
          $('.apishopsFormConstructorFormColorStart','.apishopsFormConstructor').attr('oldval',$('.apishopsFormConstructorFormColorStart','.apishopsFormConstructor').val());
          $('.apishopsFormConstructorFormColorEnd','.apishopsFormConstructor').attr('oldval',$('.apishopsFormConstructorFormColorEnd','.apishopsFormConstructor').val());
          $('.apishopsFormConstructorTextColor','.apishopsFormConstructor').attr('oldval',$('.apishopsFormConstructorTextColor','.apishopsFormConstructor').val());
          $(this).addClass('apishopsFormConstructorOptionsHoverCardsHover')
        }
      });

      $( ".apishopsFormConstructorOptionsHoverCardButton" ).click(function(event) {
        if(!$(event.target).is('a') && !$(this).hasClass('apishopsFormConstructorOptionsHoverCardsHover')) {
          $('.apishopsFormConstructorButtonColorStart','.apishopsFormConstructor').attr('oldval',$('.apishopsFormConstructorButtonColorStart','.apishopsFormConstructor').val());
          $('.apishopsFormConstructorButtonColorEnd','.apishopsFormConstructor').attr('oldval',$('.apishopsFormConstructorButtonColorEnd','.apishopsFormConstructor').val());
          $(this).addClass('apishopsFormConstructorOptionsHoverCardsHover')
        }
      });

        //apishopsFormConstructorFormElement=$('.apishopsForm')
        if($(apishopsFormConstructorImageElement).is(":visible")){
              var left=$(apishopsFormConstructorImageElement).offset().left-$( ".apishopsFormConstructorOptionsArrowImage").outerWidth()+15;
              var top=$(apishopsFormConstructorImageElement).offset().top-$( ".apishopsFormConstructorOptionsArrowImage").outerHeight()+20;
              $( ".apishopsFormConstructorOptionsArrowImage").css("left",left).css("top",top)
        }else{
              var left=$(apishopsFormConstructorFormElement).offset().left-$( ".apishopsFormConstructorOptionsArrowImage").outerWidth()+10;
              var top=$(apishopsFormConstructorFormElement).offset().top-$( ".apishopsFormConstructorOptionsArrowImage").outerHeight()+20;
              $( ".apishopsFormConstructorOptionsArrowImage").css("left",left).css("top",top)
        }

        if($(apishopsFormConstructorNameElement).is(":visible")){
              var left=$(apishopsFormConstructorNameElement).offset().left+$( ".apishopsFormConstructorOptionsArrowName").outerWidth()/2;
              var top=$(apishopsFormConstructorNameElement).offset().top-$( ".apishopsFormConstructorOptionsArrowName").outerHeight()+20;
              $( ".apishopsFormConstructorOptionsArrowName").css("left",left).css("top",top)
        }else{
              var left=$(apishopsFormConstructorFormElement).offset().left+$(apishopsFormConstructorFormElement).outerWidth()-20;
              var top=$(apishopsFormConstructorFormElement).offset().top-$( ".apishopsFormConstructorOptionsArrowName").outerHeight()+20;
              $( ".apishopsFormConstructorOptionsArrowName").css("left",left).css("top",top)
        }

        if($(apishopsFormConstructorPriceElement).is(":visible")){
              var left=$(apishopsFormConstructorPriceElement).offset().left+$(apishopsFormConstructorPriceElement).outerWidth()-20;
              var top=$(apishopsFormConstructorPriceElement).offset().top-$( ".apishopsFormConstructorOptionsArrowPrice").outerHeight()+$(apishopsFormConstructorPriceElement).outerHeight()/2+14;
              $( ".apishopsFormConstructorOptionsArrowPrice").css("left",left).css("top",top)
        }else{
              var left=$(apishopsFormConstructorFormElement).offset().left+$(apishopsFormConstructorFormElement).outerWidth()-20;
              var top=$(apishopsFormConstructorFormElement).offset().top-$( ".apishopsFormConstructorOptionsArrowPrice").outerHeight()+20;
              $( ".apishopsFormConstructorOptionsArrowPrice").css("left",left).css("top",top)
        }

        if($(apishopsFormConstructorCountElement).is(":visible")){
              var left=$(apishopsFormConstructorCountElement).offset().left+$(apishopsFormConstructorCountElement).outerWidth()-20;
              var top=$(apishopsFormConstructorCountElement).offset().top-$( ".apishopsFormConstructorOptionsArrowCount").outerHeight()+$(apishopsFormConstructorCountElement).outerHeight()/2+17;
              $( ".apishopsFormConstructorOptionsArrowCount").css("left",left).css("top",top)
        }else{
              var left=$(apishopsFormConstructorFormElement).offset().left+$(apishopsFormConstructorFormElement).outerWidth()-20;
              var top=$(apishopsFormConstructorFormElement).offset().top-$( ".apishopsFormConstructorOptionsArrowCount").outerHeight()+20;
              $( ".apishopsFormConstructorOptionsArrowCount").css("left",left).css("top",top)
        }


        var left=$(apishopsFormConstructorFormElement).offset().left+$(apishopsFormConstructorFormElement).outerWidth()+24;
        var top=$(apishopsFormConstructorFormElement).offset().top+$(apishopsFormConstructorFormElement).outerHeight()/2;
        $( ".apishopsFormConstructorOptionsHoverCardForm").css("left",left).css("top",top)

        var left=$(apishopsFormConstructorButtonElement).offset().left+$(apishopsFormConstructorButtonElement).outerWidth()/2-15;
        var top=$(apishopsFormConstructorButtonElement).offset().top+$(apishopsFormConstructorButtonElement).outerHeight()+20;
        $( ".apishopsFormConstructorOptionsHoverCardButton").css("left",left).css("top",top)


        var top=$('#containerId').offset().top+$('#containerId form:first').height()/2-$('.apishopsFormConstructorMainOptions').height()/2-20;
        var left=$('#containerId form:first').offset().left - $('.apishopsFormConstructorMainOptions').outerWidth() -40;
        $('.apishopsFormConstructorMainOptions').css('top',top).css('left',left);


        var top=$($(apishopsFormConstructorFormElement).get(0)).offset().top+$($(apishopsFormConstructorFormElement).get(0)).outerHeight()-$('.apishopsFormConstructorAdditionalOptions').height()-20;
        var left=$($(apishopsFormConstructorFormElement).get(0)).offset().left+$($(apishopsFormConstructorFormElement).get(0)).outerWidth()+25;
        $('.apishopsFormConstructorAdditionalOptions').css('top',top).css('left',left);


        //apishopsFormConstructorPriceElement=$('.apishopsFormPrice')
        //apishopsFormConstructorImageElement=$('.apishopsFormImage')
        //apishopsFormConstructorCountElement=$('.apishopsFormCount')

        //apishopsFormConstructorButtonElement=$('.apishopsFormButton')



    }

    var hexDigits = new Array
            ("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");

    //Function to convert hex format to a rgb color
    function rgb2hex(rgb) {
     rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
     return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }

    function hex(x) {
      return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
     }


    function apishopsConstructorEvalCode(code,container)
    {
        code=code.replace(/<script[^>]+>/im,'');
        code=code.replace(/<link[^<>]+>/im,'');
        $(container).html(code);
    }

    function apishopsConstructorUpdateCode()
    {
      alert();
    }