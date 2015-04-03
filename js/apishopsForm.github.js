/*jshint -W117 */

(function ($) {
    "use strict";

    jQuery.fn.apishopsForm = function(options) {

        var settings = {
            type: "inline", /*inline,modal*/
            form: "normal", /*normal, light, html*/
            placement : ".apishopsModalContent", /*контейнер внутри модального окна, где должна размещаться форма (для встроенных это место передается в качестве инициализируемого объекта)*/
            inputs : {
                address : "[name=apishopsFormAddress]",
                count : "[name=apishopsFormCount]",
                delivery : "[name=apishopsFormDelivery]",
                email : "[name=apishopsFormEmail]",
                fio : "[name=apishopsFormFio]",
                payment : "[name=apishopsFormPayment]",
                phone : "[name=apishopsFormPhone]",
                promocode : "[name=apishopsFormPromocode]",
                region : "[name=apishopsFormRegion]",
                cost : "[name=apishopsFormCost]",
                button : ".apishopsFormBuy"
            },
            containers : {
                picture : ".apishopsFormImage",
                price : ".apishopsFormPrice",
                name : ".apishopsFormName",
                quickview : ".apishopsQuickView"
            },
            inputs_names : {
                address : "Поле адреса",
                count : "Поле количество значений",
                delivery : "Поле типа доставки",
                email : "Поле электронного адреса",
                promocode : "Поле для промокода",
                fio : "Поле ФИО",
                payment : "Поле типа оплаты",
                phone : "Поле номера телефона",
                region : "Поле региона",
                cost : "Поле стоимости заказа"
            },
            theme : 0,
            forms : [],
            placements : [],
            optional_fields : ["address"],
            hidden_fields : [],
            displayed_containers : [],
            siteId : 10221,
            productId : 632879,
            price : 0,
            lang : 1,
            gift : "auto",
            charset : "utf8",
            successUrl : "/finish.jsp?id=",

            // Callbacks
            onCancel : jQuery.noop, // If canceling
            beforeSend : jQuery.noop,
            afterSend : jQuery.noop,
            onLoaded : jQuery.noop,

            locales : [
                {},
                {
                    phone : {mask : "+7(999)999-99-99"},
                    currency : ['рублей','Р.','руб.','RUB']
                },
                {},
                {},
                {},
                {},
                {
                    phone : {mask : "+380(99)999-99-99"},
                    currency : ['гривень','Грн.','грн.','UAH']
                },
                {
                    phone : {mask : "+375(99)999-99-99"},
                    currency : ['рублей','Р.','руб.','BYR']
                },
                {
                    phone : {mask : "8(799)999-99-99"},
                    currency : ['тенге','Т.','тнг','KZT']
                }
            ]

        };

        jQuery.extend(settings, options);


        function init(object) {

            //wrap container if container and form is the same
            settings.object = (jQuery(settings.form).selector && jQuery(settings.form).selector === jQuery(object).selector) ? object.wrap('<some></some>').parent() : object;
            settings.type = (settings.type === 'inline' && jQuery(settings.object).is("input,button,a")) ? 'modal' : settings.type;
            settings.theme = (settings.featured && settings.featured.theme !== undefined) ?  settings.featured.theme : settings.theme;

            var templatesList = [];

            //add templates to load
            if (settings.featured ||
                (settings.form === 'normal' || settings.form === 'light') ||
                (settings.featured && settings.featured.form && (settings.featured.form === 'normal' || settings.featured.form === 'light')))
            {
                templatesList.push('theme');
            }


            if (templatesList.length) {

                apishopsFormLoadTemplates(_.uniq(templatesList), settings.charset, settings.theme,
                    function() {
                        prepare();
                        spawn();
                        construct('main');
                        getProductInfo();
                        render('main');
                        bind('main');
                    });

            } else {

                prepare();
                spawn();
                construct('main');
                getProductInfo();
                render('main');
                bind('main');
            }

            env();

            return settings;
        }




        //Get 'normal','light' or html code form
        function prepare() {

            var inputs_tmp;

            if (!settings.object.length) {
                alert('Ошибка формы:\n jQuery("' + settings.object.selector + '") к которому подключается форма  "jQuery("' + settings.object.selector + '").apishopsForm(..)" не найден. Проверьте, пожалуйста, код');
            }

            if (!settings.productId) {
                alert('Ошибка: settings.productId должен быть указан');
            }

            if (typeof apishopsFormThemeLight === 'undefined' && (settings.form === 'normal' || settings.form === 'light')) {
                alert('Ошибка: темы #' + settings.theme + ' (параметр "jQuery(...).apishopsForm({..theme:' + settings.theme + '..}) нет');
            }


            if (settings.form !== 'normal' && settings.form !== 'light' && !apishopsFormEnvironment.checked) {

                inputs_tmp = importInputs(settings.form);

                if (!inputs_tmp.fio || !inputs_tmp.phone || !inputs_tmp.address || !inputs_tmp.count) {
                    settings.form = 'light';
                } else if ((inputs_tmp.region) && (!inputs_tmp.count || !inputs_tmp.cost || !inputs_tmp.region || !inputs_tmp.delivery || !inputs_tmp.payment)) {
                    settings.form = 'normal';
                } else {
                    jQuery(settings.form).hide();
                    settings.form = jQuery('<div>').append(jQuery(settings.form).clone()).html();
                    settings.displayed_containers = importContainers(settings.form);
                }
            }



            if (settings.featured) {

                if (!settings.featured.container || !jQuery(settings.featured.container).length) {

                    alert('Контейнер "' + settings.featured.container + '"(параметр featured{..container:""..}), в котором будут размещаться формы для заказа дополнительных товаров не задан или не может быть найден');
                    delete settings.featured;

                } else {

                    settings.featured.count = settings.featured.count || 3;
                    settings.featured.last = settings.featured.last || 0;
                    settings.featured.theme = settings.featured.theme || settings.theme;
                    settings.featured.hidden_fields = settings.featured.hidden_fields || settings.hidden_fields;
                    settings.featured.container = settings.featured.container || "";
                    settings.featured.containerClosest = settings.featured.containerClosest || "";


                    inputs_tmp = settings.featured.form ? importInputs(settings.featured.form) : [];

                    if (settings.featured.form && inputs_tmp.fio && inputs_tmp.phone && inputs_tmp.address && inputs_tmp.count) {

                        if (settings.featured.more && !jQuery(settings.featured.more).length) {

                            alert('Параметр featured{...more:""..} ("' + settings.featured.more + '"), который будет использоваться для кнопки подгрузки других товаров в вашей собственной форме необходимо задать');
                            delete settings.featured;

                        } else {
                            jQuery(settings.featured.form).hide();
                            settings.featured.form = jQuery('<div>').append(jQuery(settings.featured.form).clone()).html();
                            settings.featured.displayed_containers = importContainers(settings.featured.form);
                        }

                    } else {
                        settings.featured.form = 'light';
                        settings.featured.displayed_containers = settings.featured.displayed_containers || settings.displayed_containers;
                    }

                }

            }

        }





        function spawn() {

            var $jsonp = {
                    action: "getFeaturedProductIdListForProductId",
                    siteId: settings.siteId,
                    lang: settings.lang
                };

            if (settings.featured) {

                if (!settings.featured.productIds || !jQuery.isArray(settings.featured.productIds) || !settings.featured.productIds.length) {

                    jQuery(settings.featured.container).hide();
                    jQuery(settings.featured.containerClosest).hide();
                    jQuery('.__apishopsFormFeaturedFormMoreButton__').hide();

                    apishopsFormGetJSONP($jsonp, function(result) {

                        if (result.data && jQuery.isArray(result.data) && result.data.length) {

                            settings.featured.productIds = result.data;
                            settings.featured.productIdsLoaded = [];

                            jQuery(settings.featured.container).show();
                            jQuery(settings.featured.containerClosest).show();
                            jQuery('.__apishopsFormFeaturedFormMoreButton__').show();

                            construct('featured');
                            spawnChilds();
                            bind('featured');
                        }
                    });

                } else {
                    spawnChilds();
                }
            }
        }




        function spawnChilds() {

            var productIdsLoading = _.first(_.difference(settings.featured.productIds, settings.featured.productIdsLoaded), settings.featured.count);

            _.each(productIdsLoading, function(productId) {
                jQuery(settings.featured.container).apishopsForm({
                    type : "inline",
                    successUrl : false,
                    form : settings.featured.form,
                    displayed_containers : settings.featured.displayed_containers,
                    theme : settings.featured.theme,
                    siteId : settings.siteId,
                    productId : productId,
                    checked : 1,
                    gift : false,
                    hidden_fields : settings.featured.hidden_fields,
                    lang : settings.lang
                });
            });

            settings.featured.productIdsLoaded = _.union(settings.featured.productIdsLoaded, productIdsLoading);

            if (_.isEmpty(_.difference(settings.featured.productIds, settings.featured.productIdsLoaded))) {
                jQuery(settings.featured.more).fadeOut();
            }

            if (settings.featured.max && settings.featured.max <= settings.featured.productIdsLoaded.length) {
                jQuery(settings.featured.more).fadeOut();
            }
        }



        //set in settings.form html code of normal or light default template
        function construct(context) {

            if (context === 'main') {

                settings.placement = (settings.type === 'modal') ? apishopsFormModalInit(settings.object, ['small', 'hide-close2', 'init']) : settings.object;
                settings.oldprice = 0;
                settings.discount = 0;
                settings.name = '';
                settings.img = '';

                if (settings.form === 'normal') {
                    settings.form = apishopsFormThemeNormal || '';
                    settings.form_type = 'normal';
                } else if (settings.form === 'light') {
                    settings.form = apishopsFormThemeLight || '';
                    settings.form_type = 'light';
                }

            } else {

                if (settings.featured.form === 'normal' || settings.featured.form === 'light') {
                    settings.featured.more = apishopsFormThemeMore;
                }

                if (settings.featured.more && jQuery(settings.featured.more).length) {
                    settings.featured.more = jQuery('<div>').addClass('featured__more').append(jQuery(settings.featured.more)).appendTo(settings.featured.container);
                }

                settings.featured.container = jQuery('<div>').addClass('featured__in').addClass('featured_grid').prependTo(jQuery(settings.featured.container));
            }
        }



        //fill template
        function getProductInfo() {

            var $jsonp = {
                    action : "getProductInfo",
                    productId : settings.productId,
                    siteId : settings.siteId,
                    charset : settings.charset,
                    lang : settings.lang
                };

            apishopsFormGetJSONP($jsonp, function(result) {

                var data = {};

                result.data = result.data || {};

                data.price = result.data.price || 0;
                data.oldPrice = result.data.oldPrice || data.price * 1.5;
                data.img = result.data.img || "";
                data.images = result.data.images || [data.img];
                data.name = result.data.name || ""
                data.fullName = result.data.name || ""
                data.description = result.data.shortDescription || "";
                data.fullDescription = result.data.description || "";
                data.discount = parseInt((100 - settings.price * 100 / settings.oldprice), 10);
                data.productVariants = result.data.productVariants || [];

                //name length fix
                data.name=data.name.replace(/^(.{40}[^\s]*).*/, "$1");
                //descr fix
                data.fullDescription = data.fullDescription.replace(/(<([^>]+)>)/ig,"")
                //round prices
                data.price = Math.round(data.price);
                data.oldPrice = Math.round(data.oldPrice);

                if (settings.page && settings.page.price && settings.page.oldprice){

                    jQuery(settings.page.price).html(data.price);
                    jQuery(settings.page.oldprice).html(data.oldprice);

                }

                if (!data.price) {
                    try {
                        jQuery(settings).trigger("onCancel");
                    } catch (err) {
                        apishopsLog("onCancel trigger error");
                    }
                    return false;
                }

                jQuery.extend(settings, data);

                renderForm();

                try {
                    jQuery(settings).trigger("onLoaded", [data]);
                } catch (err) {
                    apishopsLog("onLoaded trigger error");
                }

            });
        }





        function renderForm() {

            if (typeof settings.form === 'string') {

                settings.form = jQuery(templateStr(settings.form)).clone();

                //wrap product image
                jQuery('.__IMG__', settings.form).hide()
                    .wrap('<div class="apishopsFormImageWrapper apishopsFormImage""/>');

                settings.form.render(templateContext(),templateDirectives());

                //locale fixes
                settings.form.css('display', "").
                    addClass('featured_item').
                    addClass('apishopsFormItem').
                    addClass('animate');

                //charset encoding
                jQuery('body').append('<style>.apishopsFormImageWrapper:before{content: "Подробнее" !important;}</style>');

                //bind
                jQuery('.apishopsFormImageWrapper,.__QUICKVIEW__', settings.form).bind('click', function(event) {
                    event.preventDefault();
                    slideshowDoAction('show');
                });

                //place
                settings.placement.append(settings.form);

                formSlideRender();
                //formVariantsRender();

            } else {
                settings.form.render(templateContext(),templateDirectives());

                formSlideRender();

                //formVariantsRender();
            }
        }


        /**
         * Рендерит варианты
         * 1. Если вариантов нет, то ничего не загружаем
         * 2. Если вариант есть, то рендерит
         * @return {[type]} [description]
         */
        function formVariantsRender() {

            if (isQuery(settings.variants)) {

                if(settings.productVariants && settings.productVariants.length) {
                    settings.variants.css('display','inline-block');
                    settings.variants.render(templateContext(),templateDirectives());
                    formVariantsBind();
                } else {
                    settings.variants.hide();
                }

            } else {
                apishopsFormLoadTemplates(['variants'], settings.charset, settings.theme, function() {

                    var lastInput, styles;

                    lastInput = settings.form.find('input[type=text]:last').exists();

                    if(apishopsFormVariantesRadio && lastInput) {

                            styles = jQuery(lastInput).getStyleObject();


                            settings.variants = settings.variants || jQuery(apishopsFormVariantesRadio).insertAfter(lastInput);


                            settings.variants.
                                css('vertical-align','middle').
                                css('width',(lastInput.outerWidth()<150 ? 150 : lastInput.outerWidth())+'px');


                            settings.variants.find('.apishopsFormVariantsTitle').
                                css('height',(lastInput.outerHeight() || '40')+'px').
                                css('line-height',(lastInput.outerHeight() || '40')+'px').
                                css('color',styles.color||'').
                                css('background-color', (styles.backgroundColor === 'transparent' ? 'white' : styles.backgroundColor) ).
                                css('font-size',styles.fontSize||'').
                                css('border-radius',styles.borderBottomLeftRadius||'').
                                css('margin-bottom',styles.marginBottom||'').
                                css('font-family',styles.fontFamily||'');


                            settings.variants.find('.apishopsFormVariantsList').
                                css('margin-top',lastInput.outerHeight()+'px');


                            settings.variants.parent().css('text-align','center');

                            if(settings.productVariants && settings.productVariants.length) {

                                settings.variants.css('display','inline-block');
                                settings.variants.render(templateContext(),templateDirectives());
                                formVariantsBind();

                            } else {
                                settings.variants.hide();
                            }
                    }
                });
            }
        }



        function formVariantsBind() {

            settings.variants.find('.apishopsFormVariantsTitle').addClass('bound').bind('click', function() {
                settings.variants.find('.apishopsFormVariants').addClass('apishopsFormVariants-open');
            });

            settings.variants.find('input[type=radio]').addClass('bound').bind('click', function() {
                var title = settings.variants.find('.apishopsFormVariantsTitle');
                var currentVariant = jQuery(this).attr('alt');
                var currentVariantPrefix = 'Размер: ';
                var colors;
                var colorStyle = jQuery(this).closest('label').find('.apishopsFormVariantName').exists().attr('style');

                settings.variants.find('.apishopsFormVariants').removeClass('apishopsFormVariants-open');

                colors = helperGetColorFromName(currentVariant);
                if(colors.length) {
                    currentVariantPrefix = 'Расцветка: ';
                    //currentVariantPrefix = '';
                }

                title.html(currentVariantPrefix + currentVariant).attr('alt', currentVariant);
                if(colorStyle !== ''){
                    settings.variants.find('.apishopsFormVariantsDropDown').addClass('apishopsFormVariantsDropDownColor');
                    jQuery('<b></b>').addClass('apishopsFormVariantsTitleColor').attr('style',colorStyle).appendTo(title);
                } else {
                    settings.variants.find('.apishopsFormVariantsDropDown').removeClass('apishopsFormVariantsDropDownColor');
                }
            });

            settings.variants.find('.apishopsFormVariantName').addClass('bound').bind('mouseenter', function() {
                var variant = jQuery(this).attr('alt');
                var currentVariantPrefix = 'Размер: ';
                var currentVariant = settings.variants.find('.apishopsFormVariantsTitle').html();
                var title = settings.variants.find('.apishopsFormVariantsTitle');
                var colors = [];
                colors = helperGetColorFromName(currentVariant);
                if(colors.length) {
                    currentVariantPrefix = 'Расцветка: ';
                    //currentVariantPrefix = '';
                }
                //title.attr('alt',currentVariant);
                title.html(currentVariantPrefix+variant);

            }).bind('mouseleave', function() {
                var currentVariant = settings.variants.find('.apishopsFormVariantsTitle').attr('alt');
                var currentVariantPrefix = 'Размер: ';
                var title = settings.variants.find('.apishopsFormVariantsTitle');
                var colors = [];
                if(currentVariant){
                    colors = helperGetColorFromName(currentVariant);
                    if(colors.length) {
                        currentVariantPrefix = 'Расцветка: ';
                        //currentVariantPrefix = '';
                    }
                    title.html(currentVariantPrefix+currentVariant)
                }
            });


            settings.variants.find('input[type=radio]:first').click();

        }





        function formSlideRender() {

            if (isQuery(settings.slide)) {

                settings.slide.render(templateContext(),templateDirectives());
                formSlideBind();

            } else {

                //render slideshow
                apishopsFormLoadTemplates(['slideshow'], settings.charset, settings.theme,

                    function() {


                        //init slideshow if not set
                        settings.slideshow = jQuery('.apishopsFormSlideshow').exists();

                        if (!settings.slideshow) {
                            settings.slideshow = jQuery(apishopsFormSlideshow).appendTo('body');
                        }


                        //init one slide if not set
                        settings.slide = jQuery('.apishopsFormSlideshowSlide#'+settings.productId).exists();

                        if (!settings.slide) {
                            settings.slide = jQuery(apishopsFormSlideshowSlide).
                                attr('id',settings.productId).appendTo(settings.slideshow.find('ul'));
                        }


                        //slideshow controls
                        settings.slideshowCtrlPrev = settings.slideshowCtrlPrev || jQuery('.apishopsFormSlideshowIconNavPrev');
                        settings.slideshowCtrlNext = settings.slideshowCtrlNext || jQuery('.apishopsFormSlideshowIconNavNext');
                        settings.slideshowCtrlClose = settings.slideshowCtrlClose || jQuery('.apishopsFormSlideshowIconNavClose');


                        //slide elements
                        settings.slideBigImage = settings.slideBigImage || settings.slide.find('.apishopsFormImage');
                        settings.slideForm = settings.slideForm || settings.slide.find('.apishopsFormOrder');
                        settings.slidePhone = settings.slidePhone || settings.slide.find('.slidePhone');


                        //slideshow bind
                        if (!settings.slideshowCtrlPrev.hasClass('bound') &&
                                !settings.slideshowCtrlNext.hasClass('bound') &&
                                !settings.slideshowCtrlClose.hasClass('bound')) {


                            settings.slideshowCtrlPrev.addClass('bound').bind('click', function() {
                                slideshowDoAction('prev');
                            });

                            settings.slideshowCtrlNext.addClass('bound').bind('click', function() {
                                slideshowDoAction('next');
                            });

                            settings.slideshowCtrlClose.addClass('bound').bind('click', function() {
                                slideshowDoAction('close');
                            });

                            jQuery(document).bind('keydown', function(e) {

                                if (!settings.slideshow.is(':hidden')) {

                                    if ((e.which || e.keyCode) === 27) {
                                        slideshowDoAction('close');
                                    } else if ((e.which || e.keyCode) === 39 && !settings.slideshowCtrlNext.is(':hidden')) {
                                        slideshowDoAction('next');
                                    } else if ((e.which || e.keyCode) === 37 && !settings.slideshowCtrlPrev.is(':hidden')) {
                                        slideshowDoAction('prev');
                                    }

                                }
                            });
                        }


                        //slide bind
                        if(settings.name) {
                            settings.slide.render(templateContext(),templateDirectives());
                            formSlideBind();
                        }

                    });

            }
        }



        function formSlideBind(){

            //slide bind
            if (!settings.slideBigImage.hasClass('bound') && !settings.slideForm.hasClass('bound')){

                bindPhoneMask(settings.slidePhone);

                if(settings.slide.find('.apishopsFormImagesImage').length<=2){
                    settings.slide.find('.apishopsFormImagesContainerRight').hide();
                    settings.slide.find('.apishopsFormImagesContainerLeft').hide();
                } else {
                    settings.slide.find('.apishopsFormImagesContainerRight').show();
                    settings.slide.find('.apishopsFormImagesContainerLeft').show();
                }

                settings.slideBigImage.addClass('bound').bind('mousemove', function(e) {

                    var mousePosX = ((e.pageX-jQuery(this).offset().left) / jQuery(this).width()) * 100;
                    var mousePosY = ((e.pageY-jQuery(this).offset().top) / jQuery(this).height()) * 100;

                    jQuery(this).css({
                        'background-size' : 'auto',
                        'background-position': mousePosX + '%' + mousePosY + '%'
                    })

                }).bind('mouseout', function(e) {

                    jQuery(this).css({
                        'background-size' : 'cover',
                        'background-position': 'center'
                    });

                });

                settings.slideForm.addClass('bound').submit(function(event) {
                    var params;

                    event.preventDefault();

                    if (new RegExp('[_]').test(settings.slidePhone.val()) || settings.slidePhone.val().length<5) {
                        alert('Номер может состоять только из цифр, скобок и знака «+» и «-»')
                    }
                    else {
                        params={
                            object:settings.slideForm,
                            form:this,
                            count:1,
                            fio:'',
                            address:'',
                            phone:settings.slidePhone.val(),
                            promocode:'',
                            successUrl:false,
                            sourceRef:getSource("sourceRef"),
                            sourceParam:getSource("sourceParam"),
                            productId: settings.productId,
                            siteId:settings.siteId,
                            lang:settings.lang
                        };
                        apishopsFormSubmit(params);

                        try {
                            jQuery(settings).trigger("beforeSend");
                        }
                        catch(err) {

                        }
                    }
                });
            }

        }





        function slideshowDoAction(dir) {

            var translate,
                transformOutVal,
                transformIncomingVal,
                itemWidth = 460,
                support3d = true,
                clientWidth = window.document.documentElement.clientWidth || 0,
                innerWidth =  window.innerWidth || 0,
                viewportWidth = clientWidth < innerWidth ?  clientWidth : innerWidth,
                currentSlide,
                nextSlide,
                prevSlide,
                slides;


            translate = Number(viewportWidth / 2 + itemWidth / 2);

            slides = settings.slideshow.find('li');


            //close manipulations: remove all current and show markers, disable all transform
            if (dir === 'close') {
                settings.slideshow.removeClass('apishopsFormSlideshow-open').fadeOut();
                slides.removeClass('show current').css('transform', '');
                return;
            }


            //translation vector
            if (dir === 'prev') {
                transformOutVal = translate;
                transformIncomingVal = translate * -1;
            } else {
                transformOutVal = translate * -1;
                transformIncomingVal = translate;
            }


            //determinate current slide
            if (dir === 'show') {
                currentSlide = settings.slide;
            } else {
                currentSlide = settings.slideshow.find('li.current');
            }


            //remove current marker from current
            currentSlide.removeClass('current show');


            //detext current slide if next-prev direction
            if (dir === 'next') {
                currentSlide = currentSlide.next();
            } else if (dir === 'prev') {
                currentSlide = currentSlide.prev();
            }


            //detect next-prev slides for 100% current slide
            nextSlide = currentSlide.next().exists();
            prevSlide = currentSlide.prev().exists();


            //remove transfrom from 100% current slide
            currentSlide.css('transform', '');


            if (prevSlide) {
                prevSlide.addClass('show').css('transform', 'translate3d( ' + (dir === 'prev' ? transformIncomingVal : transformOutVal) + 'px, 0, -150px )');
                prevSlide.prev().css('transform', 'translate3d( ' + (dir === 'prev' ? 2 * transformIncomingVal : 2 * transformOutVal) + 'px, 0, -150px )');
                settings.slideshowCtrlPrev.show();
            } else {
                settings.slideshowCtrlPrev.hide();
            }


            if (nextSlide) {
                nextSlide.addClass('show').css('transform', 'translate3d( ' + (dir === 'prev' ? transformOutVal : transformIncomingVal) + 'px, 0, -150px )');
                nextSlide.next().css('transform', 'translate3d( ' + (dir === 'prev' ? 2 * transformOutVal : 2 * transformIncomingVal) + 'px, 0, -150px )');
                settings.slideshowCtrlNext.show();
            } else {
                settings.slideshowCtrlNext.hide();
            }


            //set current marker for 100% current marker
            currentSlide.addClass('current show');


            //after show
            if (dir === 'show') {
                settings.slideshow.addClass('apishopsFormSlideshow-open').fadeIn();
            }
        }





        function renderCallback() {

            if (settings.callback && !apishopsFormEnvironment.callback && !jQuery('.apishopsCallback').length) {

                apishopsFormEnvironment.callback = true;

                try {
                    apishopsFormLoadTemplates(['callback'], settings.charset, settings.callback,
                        function() {
                            if (apishopsFormCallbackIcon && apishopsFormCallbackText) {

                                apishopsFormCallbackIcon = jQuery(apishopsFormCallbackIcon);
                                apishopsFormCallbackIcon.appendTo('body');

                                apishopsFormCallbackIcon.click(function() {

                                    var apishopsFormCallbackWindow,
                                        apishopsFormCallbackForm,
                                        apishopsFormCallbackPhone;

                                    apishopsFormCallbackWindow = apishopsFormModalInit(apishopsFormCallbackText, ['normal', 'hide-close2']);
                                    apishopsFormCallbackForm = apishopsFormCallbackWindow.find('form');
                                    apishopsFormCallbackPhone = apishopsFormCallbackWindow.find('[name=apishopsFormPhone]');
                                    //apishopsFormCallbackClose2 = apishopsFormCallbackWindow.find('.apishopsModalClose2');

                                    bindPhoneMask(apishopsFormCallbackPhone);

                                    jQuery(apishopsFormCallbackForm).submit(function(event) {

                                        var lang, params;

                                        event.preventDefault();

                                        if (new RegExp('[_]').test(apishopsFormCallbackPhone.val()) || apishopsFormCallbackPhone.val().length<5) {
                                            alert('Номер может состоять только из цифр, скобок и знака «+» и «-»');
                                            return false;
                                        }

                                        lang = settings.lang || 1;

                                        params = {
                                            object: settings.inputs.button,
                                            form: settings.form,
                                            count: 1,
                                            fio: '',
                                            address: '',
                                            phone: apishopsFormCallbackPhone.val(),
                                            promocode: '',
                                            successUrl: false,
                                            sourceRef: getSource("sourceRef"),
                                            sourceParam: getSource("sourceParam"),
                                            productId: settings.productId,
                                            siteId: settings.siteId,
                                            charset: settings.charset,
                                            lang: settings.lang
                                        };

                                        try {
                                            jQuery(settings).trigger("beforeSend");
                                        } catch (err) {
                                            apishopsLog("beforeSend trigger error");
                                        }

                                        apishopsFormSubmit(params);
                                    });
                                });
                            }
                        });
                } catch (err) {
                    apishopsLog("renderCallback error");
                }

            }
        }








    function render(context){

        if(context=='main'){


            renderForm();
            renderCallback();
            toggleInputs()
            toggleContainers();

            /*
                Подгрузка подарков
            */
            try {
                if(typeof settings.gift !='undefined' && settings.gift!='false' && jQuery('.giftitems').length==0 && settings.gift!=false && (settings.gift=='auto' || settings.gift>0)){
                    apishopsFormGetJSONP({
                        action: "getProductInfo",
                        productId: settings.productId,
                        siteId: settings.siteId,
                        charset:settings.charset,
                        lang: settings.lang
                        },function(result){
                            settings.wpId=result.data.wpId;

                            apishopsFormGetJSONP(
                                {
                                    action: "getPresentsForProductId",
                                    siteId: settings.siteId,
                                    wpId: settings.wpId,
                                    charset:settings.charset,
                                    lang:settings.lang,
                                    jsonp:'dataType'
                                },
                                function(result){
                                    if(settings.gift=='auto')
                                        settings.gift=1;

                                    if(typeof result.data.presents!=='undefined' && result.data.presents.length>0)
                                    {
                                        settings.gifts=result.data.presents;
                                        apishopsFormLoadTemplates(['gift'],settings.charset, settings.gift,
                                            function(result){
                                                if(typeof apishopsFormGifts !='undefined' && typeof settings.inputs['phone']=='object'){

                                                    _.templateSettings = {
                                                      interpolate : /%(.+?)%/g
                                                    };

                                                    settings.apishopsFormGiftsTemplate = _.template(apishopsFormGifts);

                                                    settings.apishopsFormGiftsHtml=settings.apishopsFormGiftsTemplate(
                                                    {
                                                        GIFTNAME1 : (typeof settings.gifts[0] !='undefined' && typeof settings.gifts[0]['name']!='undefined')?settings.gifts[0]['name']:'',
                                                        GIFTDESC1 : (typeof settings.gifts[0] !='undefined' && typeof settings.gifts[0]['text']!='undefined')?settings.gifts[0]['text']:'',
                                                        GIFTIMAGE1 : (typeof settings.gifts[0] !='undefined' && typeof settings.gifts[0]['picture']!='undefined')?settings.gifts[0]['picture']:'',
                                                        GIFTSTYLE1 : (typeof settings.gifts[0] !='undefined' && typeof settings.gifts[0]['picture']!='undefined')?'':'display:none;',

                                                        GIFTNAME2 : (typeof settings.gifts[1] !='undefined' && typeof settings.gifts[1]['name']!='undefined')?settings.gifts[1]['name']:'',
                                                        GIFTDESC2 : (typeof settings.gifts[1] !='undefined' && typeof settings.gifts[1]['text']!='undefined')?settings.gifts[1]['text']:'',
                                                        GIFTIMAGE2 : (typeof settings.gifts[1] !='undefined' && typeof settings.gifts[1]['picture']!='undefined')?settings.gifts[1]['picture']:'',
                                                        GIFTSTYLE2 : (typeof settings.gifts[1] !='undefined' && typeof settings.gifts[1]['picture']!='undefined')?'':'display:none;',

                                                        GIFTSCLASS1 : (typeof settings.gifts[1] !='undefined')?'':'apishopsFormGiftItemOnce',
                                                        GIFTSCLASS2 : (typeof settings.gifts[1] !='undefined')?'':'apishopsFormGiftItemHidden'
                                                    });

                                                    settings.apishopsGiftsObject=jQuery(settings.apishopsFormGiftsHtml);
                                                    settings.apishopsFormGiftsModal="<h2>К каждому заказу мы дарим</h2>";
                                                    settings.apishopsFormGiftsObject=settings.apishopsGiftsObject.find('.apishopsFormGift');
                                                    settings.apishopsFormGiftsHoverCardObject=settings.apishopsGiftsObject.find('.apishopsFormGiftHoverCard');

                                                    if(typeof settings.gifts[0] !='undefined'){
                                                        settings.apishopsFormGiftsModal+="<img width='200' src='"+settings.gifts[0]['picture']+"' style='float:left;width:200px;'><h3>"+settings.gifts[0]['name']+"</h3>"+settings.gifts[0]['text']+"";
                                                    }

                                                    if(typeof settings.gifts[1] !='undefined'){
                                                        settings.apishopsFormGiftsModal+="<img width='200' src='"+settings.gifts[1]['picture']+"' style='float:left;width:200px;'><h3>"+settings.gifts[1]['name']+"</h3>"+settings.gifts[1]['text']+"";
                                                    }

                                                    var form=settings.inputs['phone'].closest('form');
                                                    var inputWidth=form.find('input[type=text]').outerWidth();
                                                    var buttonWidth=form.find('input[type=submit],input[type=button],button').outerWidth();
                                                    var giftWidth=0;
                                                    if(buttonWidth<inputWidth){
                                                        giftWidth=buttonWidth;
                                                    }else{
                                                        giftWidth=inputWidth;
                                                    }

                                                    settings.apishopsGiftsObject.css('width',giftWidth);

                                                    form.append(settings.apishopsGiftsObject);

                                                    if(settings.apishopsFormGiftsHoverCardObject.length>0 && settings.apishopsFormGiftsObject.length>0){

                                                        settings.apishopsFormGiftsHoverCardObject.css('top',settings.apishopsFormGiftsObject.offset().top);
                                                        jQuery('body').append(settings.apishopsFormGiftsHoverCardObject);

                                                        jQuery(settings.apishopsFormGiftsObject).mouseover(function() {
                                                            settings.apishopsFormGiftsHoverCardObject.addClass('apishopsFormGiftHoverCardActive')
                                                            settings.apishopsFormGiftsHoverCardObject.css('width',settings.apishopsFormGiftsObject.outerWidth());
                                                            settings.apishopsFormGiftsHoverCardObject.css('left',settings.apishopsFormGiftsObject.offset().left);
                                                            settings.apishopsFormGiftsHoverCardObject.css('top',settings.apishopsFormGiftsObject.offset().top);
                                                        });
                                                        jQuery(settings.apishopsFormGiftsObject).mouseout(function() {
                                                            settings.apishopsFormGiftsHoverCardObject.removeClass('apishopsFormGiftHoverCardActive')
                                                        });

                                                        jQuery(settings.apishopsFormGiftsObject).click(function() {
                                                            var apishopsFormGiftModalWindow=apishopsFormModalInit(settings.apishopsFormGiftsModal,['big'])
                                                        });
                                                    }


                                                }
                                            });
                                    }
                                });
                        });
                }
            }
            catch(err) {
                alert(err);
            }

        }else{

        }
   }




        //Update global environemt
        function env() {
            apishopsFormEnvironment.siteId = settings.siteId;
            apishopsFormEnvironment.productId = settings.productId;
            apishopsFormEnvironment.version = '2.0';
            apishopsFormEnvironment.lang = settings.lang;
            apishopsFormEnvironment.charset = settings.charset;
            apishopsFormEnvironment.checked = false;
        }



        //import inputs from jquery selector
        //return inputs array
        function importInputs(selector) {
            var $form = jQuery(selector),
                inputs_tmp = {},
                index,
                value,
                $input;

            for (index in settings.inputs) {
                if (settings.inputs.hasOwnProperty(index)) {
                    value = settings.inputs[index];
                    $input = jQuery(value, $form);
                    if ($input && $input.length) {
                        inputs_tmp[index] = $input;
                    }
                }
            }

            return inputs_tmp;
        }


        //return containers array
        function importContainers(selector) {

            var $form = jQuery(selector),
                displayed_containers = [],
                $html;

            $html = $form.html() || '';

            if ($html.indexOf("%NAME%") > -1) {
                displayed_containers.push('name');
            }
            if ($html.indexOf("%PRICE%") > -1) {
                displayed_containers.push('price');
            }
            if ($html.indexOf('%IMG%') > -1) {
                displayed_containers.push('picture');
            }
            if ($html.indexOf('%QUICKVIEW%') > -1) {
                displayed_containers.push('quickview');
            }
            return displayed_containers;
        }





        function toggleInputs() {

            var input, hidden_fields = settings.hidden_fields || [];

            jQuery.each(settings.inputs, function(name, value) {

                input = jQuery(value, settings.form);

                if (input && input.length && _.indexOf(hidden_fields, name) >= 0) {
                    input.hide();
                }
            });
        }




        function toggleContainers() {

            var container, displayed_containers = settings.displayed_containers || [];

            jQuery.each(settings.containers, function(index, value) {

                container = jQuery(value, settings.form);

                if (container && container.length && _.indexOf(displayed_containers, index) >= 0) {

                    if (index !== 'picture') {
                        container.show();
                    } else {
                        container.show().parent().show(); //.attr('style','none')
                        container.parent().css('display', 'initial'); /*FIX FOR INLINE IMG CONTAINERS*/
                    }

                } else {

                    if (index !== 'picture') {
                        container.hide();
                    } else {
                        container.hide().parent().hide();
                    }
                }

            });
        }


        function templateStr(str) {

            str = str.replace(/%NAME%/g,'<some class="apishopsFormName"></some>');
            str = str.replace(/%DESC%/g,'<some class="apishopsFormDescription"></some>');
            str = str.replace(/%PRICE%/g,'<some class="apishopsFormCurentPrice apishopsFormPrice"></some>');
            str = str.replace(/%OLDPRICE%/g,'<some class="apishopsFormOldPrice apishopsFormPrice"></some>');
            str = str.replace(/%DISCOUNT%/g,'<some class="apishopsFormDiscount apishopsFormPrice"></some>');
            str = str.replace(/%CYR%/g,'<some class="apishopsFormCyr apishopsFormPrice"></some>');
            str = str.replace(/%CY%/g,'<some class="apishopsFormCy apishopsFormPrice"></some>');
            str = str.replace(/%QUICKVIEW%/g,'__QUICKVIEW__ apishopsQuickView');
            str = str.replace('%IMG%','__IMG__');
            //apishopsFormImageWrapper apishopsFormImage

            return str;

        }

        function templateContext() {

            var locale, currency, context;

            locale = settings.locales[settings.lang] || {};
            currency = locale.currency || {};

            context = {
                apishopsFormName: settings.name,
                apishopsFormFullName: settings.fullName,
                apishopsFormDescription: settings.description,
                apishopsFormFullDescription: settings.fullDescription,
                apishopsFormCurentPrice: settings.price,
                apishopsFormOldPrice: settings.oldPrice,
                apishopsFormDiscount: settings.discount,
                apishopsFormImage : settings.img,
                apishopsFormImages : settings.images,
                apishopsFormVariants : templateVariantsContext(settings.productVariants),
                apishopsFormCyr: currency[2],
                apishopsFormCy: currency[1]
            };

            return context;
        }

        function templateVariantsContext(obj) {
            var returnObj = {};

            if (obj) {


                returnObj.apishopsFormVariantsList = [];

                jQuery.each(obj, function(index, value){
                    var vObj={},
                        nameColors;

                    nameColors = helperGetColorFromName(value.name);

                    vObj.apishopsFormVariantName = value.name;
                    vObj.apishopsFormVariantValue = value.id || '';
                    vObj.apishopsFormVariantColor = nameColors || [];

                    returnObj.apishopsFormVariantsList.splice(0, 0, vObj);
                });

                returnObj.apishopsFormVariantsTitle = 'Выберите вариант:';

            }

            return returnObj;
        }



        function helperGetColorFromName(name) {

            var colors = [],

                colorDef = {
                    'black' : ['черн'],
                    '#D2D2D2' : ['серебр','серы','Серы'],
                    'white' : ['бел'],
                    '#DD0B0B' : ['красн','Красн'],
                    '#6CADFC' : ['голуб'],
                    '#3C8DFC' : ['сини','синя','Синя'],
                    '#F9BCFF' : ['розов'],
                    '#FFDC00' : ['золот','ранж','желты','Желты'],
                    '#B2F132' : ['салат','Салат'],
                    '#7ECB5B' : ['зелен','Зеленый'],
                    '#C8A2C8' : ['сирен'],
                    '#F5F5DC' : ['бежев','Бежев'],
                    '#964B00' : ['коричн','Коричн'],
                    '#900020' : ['бордо','Бордо'],
                    '#5A009D' : ['иолет']
                },

                isDoubleColors = false;

            jQuery.each(colorDef, function(colorValue, colorNames){
                jQuery.each(colorNames, function(colorIndex, colorName){

                    if(name.indexOf(colorName)>=0) {

                        //if(jQuery.inArray(colorValue,colors)>=0) {
                        //    isDoubleColors = true;
                        //    alert(colorValue + ' in ' + colors);
                        //}
                        colors.splice(0, 0, colorValue);
                    }

                })
            })

            return colors;
        }

        function helperGenerateBg(colors) {

            var colorStr, colorStrFF, colorStrWK, colorStrOP, colorStrMS, percentStep;

            if (!colors.length) {
                return ''
            }

            percentStep = Math.round(100/colors.length);

            colorStrFF = 'background: -moz-linear-gradient(left ';
            colorStrWK = 'background: -webkit-linear-gradient(left ';
            colorStrOP = 'background: -o-linear-gradient(left ';
            colorStrMS = 'background: -ms-linear-gradient(left ';
            jQuery.each(colors, function(colorIndex, colorValue){
                colorStrFF = colorStrFF + ', '+colorValue + ' '+(percentStep*colorIndex)+'%, '+colorValue+' '+(percentStep*colorIndex+percentStep)+'%';
                colorStrWK = colorStrWK + ', '+colorValue + ' '+(percentStep*colorIndex)+'%, '+colorValue+' '+(percentStep*colorIndex+percentStep)+'%';
                colorStrOP = colorStrOP + ', '+colorValue + ' '+(percentStep*colorIndex)+'%, '+colorValue+' '+(percentStep*colorIndex+percentStep)+'%';
                colorStrMS = colorStrMS + ', '+colorValue + ' '+(percentStep*colorIndex)+'%, '+colorValue+' '+(percentStep*colorIndex+percentStep)+'%';
            })
            colorStrFF = colorStrFF + ');'
            colorStrWK = colorStrWK + ');'
            colorStrOP = colorStrOP + ');'
            colorStrMS = colorStrMS + ');'

            colorStr = colorStrFF + colorStrWK + colorStrOP + colorStrMS;

            return colorStr;

        }

        function helperIsDropdownMenu(apishopsFormVariants){
            var isDoubleVariants, isMultipleVariants = false, colors = [], colorsCol;

            if(apishopsFormVariants.apishopsFormVariantsList){

                jQuery.each(apishopsFormVariants.apishopsFormVariantsList, function(apishopsFormVariantIndex, apishopsFormVariant){
                    if(apishopsFormVariant.apishopsFormVariantColor.length>1) {
                        isMultipleVariants=true;
                    }
                    if(apishopsFormVariant.apishopsFormVariantColor.length){
                        //alert(apishopsFormVariant.apishopsFormVariantColor[0]);
                        colors.splice(0, 0, apishopsFormVariant.apishopsFormVariantColor[0]);
                    }
                });

                colorsCol=colors.length;
                //alert(jQuery.unique(colors) + '=' + colors);

                if(!colors.length){
                    return true;
                }
                if(jQuery.unique(colors).length != colorsCol) {
                    //alert ('is menu');
                    return true;
                } else {
                    //alert(isMultipleVariants);
                    return isMultipleVariants;
                }

            }

        }

        function templateDirectives() {

            var directives = {
                apishopsFormImage: {
                    'style': function(params) {
                        return "background:url('"+this.apishopsFormImage+"'); background-position:center; background-size: cover;";
                    },
                    'text' : function(params) {
                        return "";
                    }
                } ,
                apishopsFormImages: {
                    apishopsFormImagesImage : {
                        'style': function(params) {
                                return "background:url('"+this.value+"'); background-position:center; background-size: cover;";
                        },
                        'text' : function(params) {
                            return "";
                        },
                        'class' : function(params) {
                            if(!params.index)
                                return "apishopsFormImagesImage apishopsFormImagesImageActive";
                            else
                                return "apishopsFormImagesImage";
                        }
                    }
                } ,
                apishopsFormVariants: {
                    apishopsFormVariantsList : {
                        apishopsFormVariantName : {
                            'style': function(params) {
                                    return helperGenerateBg(this.apishopsFormVariantColor);
                            },
                            'alt': function(params) {
                                    return this.apishopsFormVariantName;
                            }
                        },
                        'apishopsFormVariantTitle' : {
                            text: function(params) {
                                    return this.apishopsFormVariantName;
                            }
                        },
                        'apishopsFormVariant' : {
                            value: function(params) {
                                    return this.apishopsFormVariantValue;
                            },
                            alt: function(params) {
                                    return this.apishopsFormVariantName;
                            }
                        }
                    } ,
                    'class' : function(params) {
                        if(helperIsDropdownMenu(this.apishopsFormVariants))
                            return "apishopsFormVariants apishopsFormVariantsDropDown"
                        else
                            return "apishopsFormVariants apishopsFormVariantsRadioBox"
                    }
                }
            };

            return directives;

        }

        function bindPhoneMask(elem) {

            var input, mask, phone, locale;

            try {

                input = isQuery(elem) ? elem : jQuery(elem);
                locale = settings.locales[settings.lang] || {};
                phone = locale.phone || {};
                mask = phone.mask || "";

                if (mask) {
                    input.inputmask(mask);
                }

            } catch (err) {
                apishopsLog('Error' + err);
            }
        }



   function bind(context){

        if(context=='main'){
                var inputs_tmp;

                settings.inputs = importInputs(settings.form);
                bindPhoneMask(settings.inputs.phone);



                /*
                Подсветка инпутов с ошибками
                (исключения — инпуты без pattern или с нулевым pattern)
                */
                jQuery.each(settings.inputs, function(index, value){
                    if(jQuery(value).is('input[type=text]') && typeof jQuery(value).attr('pattern')!='undefined' && jQuery(value).attr('pattern')!='')
                        jQuery(value).bind({
                              change: function() {
                                    if(!new RegExp(jQuery(value).attr('pattern')).test(jQuery(value).val()))
                                        jQuery(value).closest('.apishopsFormGroup').addClass('apishopsFormError');
                              },
                              keyup: function() {
                                    if(new RegExp(jQuery(value).attr('pattern')).test(jQuery(value).val()))
                                        jQuery(value).closest('.apishopsFormGroup').removeClass('apishopsFormError');
                              }
                          });

                    if(jQuery(value).is('select') && typeof jQuery(value).attr('pattern')!='undefined' && jQuery(value).attr('pattern')!='')
                        jQuery(value).bind({
                              change: function() {
                                    if(!new RegExp(jQuery(value).attr('pattern')).test(jQuery(value).val()))
                                        jQuery(value).closest('.apishopsFormGroup').addClass('apishopsFormError');
                                    else
                                        jQuery(value).closest('.apishopsFormGroup').removeClass('apishopsFormError');
                              }
                          });
                });

                if(settings.form_type=='normal' && settings.inputs['region']){
                    var params={
                        object:settings.inputs['region'],
                        price:settings.price,
                        productId:settings.productId,
                        siteId:settings.siteId,
                        charset:settings.charset,
                        lang:settings.lang||1,
                        retrys:3
                    };
                    apishopsFormLoadRegions(params);

                    settings.inputs['region'].bind('change', function(){
                            var params={
                                object:settings.inputs['delivery'],
                                regionId:jQuery(this).val(),
                                price:settings.price,
                                productId:settings.productId,
                                siteId:settings.siteId,
                                charset:settings.charset,
                                lang:settings.lang||1,
                                retrys:3
                            };
                          settings.inputs['delivery'].closest('.apishopsFormGroup').addClass('in');
                          apishopsFormLoadDeliveryTypes(params)
                    });

                    settings.inputs['delivery'].bind('change', function(){
                            var params={
                                object:settings.inputs['payment'],
                                deliveryId:jQuery(this).val(),
                                regionId:settings.inputs['region'].val(),
                                price:settings.price,
                                productId:settings.productId,
                                siteId:settings.siteId,
                                lang:settings.lang||1,
                                retrys:3
                            };
                          settings.inputs['payment'].closest('.apishopsFormGroup').addClass('in');
                          apishopsFormLoadPaymentTypes(params)
                    });

                    settings.inputs['payment'].bind('change', function(){
                            var params={
                                count:settings.inputs['count'].val(),
                                object:settings.inputs['cost'],
                                deliveryId:settings.inputs['delivery'].val(),
                                regionId:settings.inputs['region'].val(),
                                paymentId:jQuery(this).val(),
                                price:settings.price,
                                productId:settings.productId,
                                siteId:settings.siteId,
                                lang:settings.lang||1,
                                retrys:3
                            };
                          settings.inputs['cost'].closest('.apishopsFormGroup').addClass('in');
                          apishopsFormLoadPrice(params)
                    });

                    jQuery(settings.form).submit(function(event) {
                        var error='', promocode, params;
                        event.preventDefault();
                        jQuery.each(settings.inputs, function(index, value){
                            if(jQuery(value) && typeof jQuery(value) !='undefined' && typeof jQuery(value).attr('pattern')!='undefined' && jQuery(value).attr('pattern')!=''  && _.indexOf(settings.hidden_fields, index)<0  && _.indexOf(settings.optional_fields, index)<0)  {
                                    if(!new RegExp(jQuery(value).attr('pattern')).test(jQuery(value).val())  || new RegExp('[<>]').test(jQuery(value).val())){
                                            jQuery(value).closest('.apishopsFormGroup').addClass('apishopsFormError');
                                            error+=' - '+settings.inputs_names[index]+'\n';
                                    }
                                    else if(index=='phone' && new RegExp('[_]').test(jQuery(value).val())){
                                            error+='Поле телефона: допустимы только цифры, знак плюс, скобки и дефисы';
                                    }
                                    else{
                                        jQuery(value).closest('.apishopsFormGroup').removeClass('apishopsFormError');
                                    }
                            }
                        });
                        if(error!==''){
                            alert('Пожалуйста, заполните следующие поля:\n'+error);
                            return false;
                        }else{
                                promocode=(typeof settings.inputs['promocode']!='undefined' && settings.inputs['promocode'].length)?settings.inputs['promocode'].val():'';
                                params={
                                    object:settings.inputs['button'],
                                    form:settings.form,
                                    count:settings.inputs['count'].val(),
                                    fio:settings.inputs['fio'].val(),
                                    email:settings.inputs['email'].val(),
                                    address:settings.inputs['address'].val(),
                                    deliveryId:settings.inputs['delivery'].val(),
                                    regionId:settings.inputs['region'].val(),
                                    paymentId:settings.inputs['payment'].val(),
                                    phone:settings.inputs['phone'].val(),
                                    promocode:promocode,
                                    price:settings.price,
                                    productId:settings.productId,
                                    siteId:settings.siteId,
                                    lang:settings.lang||1,
                                    charset:settings.charset,
                                    successUrl:settings.successUrl,
                                    sourceRef:getSource("sourceRef"),
                                    sourceParam:getSource("sourceParam")
                                };
                                apishopsFormSubmit(params);
                                try {
                                    jQuery(settings).trigger("beforeSend");
                                }
                                catch(err) {

                                }
                        }
                        event.preventDefault();
                    });
                }else{

                    jQuery(settings.form).submit(function(event) {
                        var error='', promocode, params,productVariantId;
                        event.preventDefault();
                        jQuery.each(settings.inputs, function(index, value){
                            if(jQuery(value) && typeof jQuery(value) !='undefined' && typeof jQuery(value).attr('pattern')!='undefined' && jQuery(value).attr('pattern')!='' && _.indexOf(settings.hidden_fields, index)<0 && _.indexOf(settings.optional_fields, index)<0)  {
                                    if(!new RegExp(jQuery(value).attr('pattern')).test(jQuery(value).val())  || new RegExp('[<>]').test(jQuery(value).val())){
                                            jQuery(value).closest('.apishopsFormGroup').addClass('apishopsFormError');
                                            error+=' - '+settings.inputs_names[index]+'\n';
                                    }
                                    else if(index=='phone' && new RegExp('[_]').test(jQuery(value).val())){
                                            error+='Поле телефона: допустимы только цифры, знак плюс, скобки и дефисы';
                                    }
                                    else{
                                        jQuery(value).closest('.apishopsFormGroup').removeClass('apishopsFormError');
                                    }
                            }
                        });
                        if(error!==''){
                            alert('Пожалуйста, заполните следующие поля:\n'+error);
                            return false;
                        }else{
                                promocode=(typeof settings.inputs['promocode']!='undefined' && settings.inputs['promocode'].length)?settings.inputs['promocode'].val():'';
                                productVariantId=settings.form.find('[name=apishopsFormVariant]:checked').val() || '';
                                params={
                                    object:settings.inputs['button'],
                                    form:settings.form,
                                    count:settings.inputs['count'].val(),
                                    fio:settings.inputs['fio'].val(),
                                    address:settings.inputs['address'].val(),
                                    phone:settings.inputs['phone'].val(),
                                    promocode:promocode,
                                    successUrl:settings.successUrl,
                                    sourceRef:getSource("sourceRef"),
                                    sourceParam:getSource("sourceParam"),
                                    productId:settings.productId,
                                    siteId:settings.siteId,
                                    charset:settings.charset,
                                    lang:settings.lang||1,
                                    productVariantId: productVariantId
                                };
                                apishopsFormSubmit(params);
                                try {
                                    jQuery(settings).trigger("beforeSend");
                                }
                                catch(err) {

                                }
                        }
                        event.preventDefault();
                    });
                }



            }else{

                settings.featured.more.bind('click', function(event){
                    event.preventDefault();
                    spawn();
                    jQuery('html, body').animate({
                        scrollTop: jQuery(this).offset().top - 800
                    }, 1000);
                });
            }

            return true;
   }






    function getSource(name){
        var value=getCookie(name);
        if(value==null || value==''){
            value=extractSource(name);
            setCookie(name,value);
        }
        return value;
    }

    function extractSource(name){

        var sourceParam;

        if(name=='sourceParam'){
            if(typeof location.href.split('?')[1] != 'undefined')
            {
                var q = {};
                location.href.split('?')[1].split('&').forEach(function(i){
                    q[i.split('=')[0]]=i.split('=')[1];
                });
                return sourceParam=typeof q['utm_campaign']!='undefined'?q['utm_campaign']:(typeof q['sub_id']!='undefined'?q['sub_id']:'');
            }else{
                return "";
            }
        }
        else if(name=='sourceRef')
            return document.referrer;
        else
            return "";
    }

    function getCookie(name) {
      var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    function setCookie(name, value, options) {
      options = options || {};

      var expires = options.expires;

      if (typeof expires == "number" && expires) {
        var d = new Date();
        d.setTime(d.getTime() + expires*1000);
        expires = options.expires = d;
      }
      if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
      }

      value = encodeURIComponent(value);

      var updatedCookie = name + "=" + value;

      for(var propName in options) {
        updatedCookie += "; " + propName;
        var propValue = options[propName];
        if (propValue !== true) {
          updatedCookie += "=" + propValue;
         }
      }

      document.cookie = updatedCookie;

      return value;
    }

    function isQuery (obj) {
        return obj && obj.hasOwnProperty && obj instanceof $;
    }


    function log(text) {
      //if (window.console) {
       //  window.console.log(text);
      //}
    }





    return init(this);

};


jQuery.fn.exists = function () {
    return this.length > 0 ? this : false;
}

jQuery.fn.getStyleObject = function(){
    var dom = this.get(0);
    var style;
    var returns = {};
    if(window.getComputedStyle){
        var camelize = function(a,b){
            return b.toUpperCase();
        };
        style = window.getComputedStyle(dom, null);
        for(var i = 0, l = style.length; i < l; i++){
            var prop = style[i];
            var camel = prop.replace(/\-([a-z])/g, camelize);
            var val = style.getPropertyValue(prop);
            returns[camel] = val;
        };
        return returns;
    };
    if(style = dom.currentStyle){
        for(var prop in style){
            returns[prop] = style[prop];
        };
        return returns;
    };
    return this.css();
}


})(jQuery);

/**
 * Stack catcher
 */
!function(a,b){function c(a,b){try{if("function"!=typeof a)return a;if(!a.bugsnag){var c=e();a.bugsnag=function(d){if(b&&b.eventHandler&&(u=d),v=c,!y){var e=a.apply(this,arguments);return v=null,e}try{return a.apply(this,arguments)}catch(f){throw l("autoNotify",!0)&&(x.notifyException(f,null,null,"error"),s()),f}finally{v=null}},a.bugsnag.bugsnag=a.bugsnag}return a.bugsnag}catch(d){return a}}function d(){B=!1}function e(){var a=document.currentScript||v;if(!a&&B){var b=document.scripts||document.getElementsByTagName("script");a=b[b.length-1]}return a}function f(a){var b=e();b&&(a.script={src:b.src,content:l("inlineScript",!0)?b.innerHTML:""})}function g(b){var c=l("disableLog"),d=a.console;void 0===d||void 0===d.log||c||d.log("[Bugsnag] "+b)}function h(b,c,d){if(d>=5)return encodeURIComponent(c)+"=[RECURSIVE]";d=d+1||1;try{if(a.Node&&b instanceof a.Node)return encodeURIComponent(c)+"="+encodeURIComponent(r(b));var e=[];for(var f in b)if(b.hasOwnProperty(f)&&null!=f&&null!=b[f]){var g=c?c+"["+f+"]":f,i=b[f];e.push("object"==typeof i?h(i,g,d):encodeURIComponent(g)+"="+encodeURIComponent(i))}return e.join("&")}catch(j){return encodeURIComponent(c)+"="+encodeURIComponent(""+j)}}function i(a,b){if(null==b)return a;a=a||{};for(var c in b)if(b.hasOwnProperty(c))try{a[c]=b[c].constructor===Object?i(a[c],b[c]):b[c]}catch(d){a[c]=b[c]}return a}function j(a,b){a+="?"+h(b)+"&ct=img&cb="+(new Date).getTime();var c=new Image;c.src=a}function k(a){var b={},c=/^data\-([\w\-]+)$/;if(a)for(var d=a.attributes,e=0;e<d.length;e++){var f=d[e];if(c.test(f.nodeName)){var g=f.nodeName.match(c)[1];b[g]=f.value||f.nodeValue}}return b}function l(a,b){C=C||k(J);var c=void 0!==x[a]?x[a]:C[a.toLowerCase()];return"false"===c&&(c=!1),void 0!==c?c:b}function m(a){return a&&a.match(D)?!0:(g("Invalid API key '"+a+"'"),!1)}function n(b,c){var d=l("apiKey");if(m(d)&&A){A-=1;var e=l("releaseStage"),f=l("notifyReleaseStages");if(f){for(var h=!1,k=0;k<f.length;k++)if(e===f[k]){h=!0;break}if(!h)return}var n=[b.name,b.message,b.stacktrace].join("|");if(n!==w){w=n,u&&(c=c||{},c["Last Event"]=q(u));var o={notifierVersion:H,apiKey:d,projectRoot:l("projectRoot")||a.location.protocol+"//"+a.location.host,context:l("context")||a.location.pathname,userId:l("userId"),user:l("user"),metaData:i(i({},l("metaData")),c),releaseStage:e,appVersion:l("appVersion"),url:a.location.href,userAgent:navigator.userAgent,language:navigator.language||navigator.userLanguage,severity:b.severity,name:b.name,message:b.message,stacktrace:b.stacktrace,file:b.file,lineNumber:b.lineNumber,columnNumber:b.columnNumber,payloadVersion:"2"},p=x.beforeNotify;if("function"==typeof p){var r=p(o,o.metaData);if(r===!1)return}return 0===o.lineNumber&&/Script error\.?/.test(o.message)?g("Ignoring cross-domain script error. See https://bugsnag.com/docs/notifiers/js/cors"):(j(l("endpoint")||G,o),void 0)}}}function o(){var a,b,c=10,d="[anonymous]";try{throw new Error("")}catch(e){a="<generated>\n",b=p(e)}if(!b){a="<generated-ie>\n";var f=[];try{for(var h=arguments.callee.caller.caller;h&&f.length<c;){var i=E.test(h.toString())?RegExp.$1||d:d;f.push(i),h=h.caller}}catch(j){g(j)}b=f.join("\n")}return a+b}function p(a){return a.stack||a.backtrace||a.stacktrace}function q(a){var b={millisecondsAgo:new Date-a.timeStamp,type:a.type,which:a.which,target:r(a.target)};return b}function r(a){if(a){var b=a.attributes;if(b){for(var c="<"+a.nodeName.toLowerCase(),d=0;d<b.length;d++)b[d].value&&"null"!=b[d].value.toString()&&(c+=" "+b[d].name+'="'+b[d].value+'"');return c+">"}return a.nodeName}}function s(){z+=1,a.setTimeout(function(){z-=1})}function t(a,b,c){var d=a[b],e=c(d);a[b]=e}var u,v,w,x={},y=!0,z=0,A=10;x.noConflict=function(){return a.Bugsnag=b,x},x.refresh=function(){A=10},x.notifyException=function(a,b,c,d){b&&"string"!=typeof b&&(c=b,b=void 0),c||(c={}),f(c),n({name:b||a.name,message:a.message||a.description,stacktrace:p(a)||o(),file:a.fileName||a.sourceURL,lineNumber:a.lineNumber||a.line,columnNumber:a.columnNumber?a.columnNumber+1:void 0,severity:d||"warning"},c)},x.notify=function(b,c,d,e){n({name:b,message:c,stacktrace:o(),file:a.location.toString(),lineNumber:1,severity:e||"warning"},d)};var B="complete"!==document.readyState;document.addEventListener?(document.addEventListener("DOMContentLoaded",d,!0),a.addEventListener("load",d,!0)):a.attachEvent("onload",d);var C,D=/^[0-9a-f]{32}$/i,E=/function\s*([\w\-$]+)?\s*\(/i,F="https://notify.bugsnag.com/",G=F+"js",H="2.4.7",I=document.getElementsByTagName("script"),J=I[I.length-1];if(a.atob){if(a.ErrorEvent)try{0===new a.ErrorEvent("test").colno&&(y=!1)}catch(K){}}else y=!1;if(l("autoNotify",!0)){t(a,"onerror",function(b){return function(c,d,e,g,h){var i=l("autoNotify",!0),j={};!g&&a.event&&(g=a.event.errorCharacter),f(j),v=null,i&&!z&&n({name:h&&h.name||"window.onerror",message:c,file:d,lineNumber:e,columnNumber:g,stacktrace:h&&p(h)||o(),severity:"error"},j),b&&b(c,d,e,g,h)}});var L=function(a){return function(b,d){if("function"==typeof b){b=c(b);var e=Array.prototype.slice.call(arguments,2);return a(function(){b.apply(this,e)},d)}return a(b,d)}};t(a,"setTimeout",L),t(a,"setInterval",L),a.requestAnimationFrame&&t(a,"requestAnimationFrame",function(a){return function(b){return a(c(b))}}),a.setImmediate&&t(a,"setImmediate",function(a){return function(){var b=Array.prototype.slice.call(arguments);return b[0]=c(b[0]),a.apply(this,b)}}),"EventTarget Window Node ApplicationCache AudioTrackList ChannelMergerNode CryptoOperation EventSource FileReader HTMLUnknownElement IDBDatabase IDBRequest IDBTransaction KeyOperation MediaController MessagePort ModalWindow Notification SVGElementInstance Screen TextTrack TextTrackCue TextTrackList WebSocket WebSocketWorker Worker XMLHttpRequest XMLHttpRequestEventTarget XMLHttpRequestUpload".replace(/\w+/g,function(b){var d=a[b]&&a[b].prototype;d&&d.hasOwnProperty&&d.hasOwnProperty("addEventListener")&&(t(d,"addEventListener",function(a){return function(b,d,e,f){return d&&d.handleEvent&&(d.handleEvent=c(d.handleEvent,{eventHandler:!0})),a.call(this,b,c(d,{eventHandler:!0}),e,f)}}),t(d,"removeEventListener",function(a){return function(b,d,e,f){return a.call(this,b,d,e,f),a.call(this,b,c(d),e,f)}}))})}a.Bugsnag=x,"function"==typeof define&&define.amd?define([],function(){return x}):"object"==typeof module&&"object"==typeof module.exports&&(module.exports=x)}(window,window.Bugsnag);
Bugsnag.apiKey = "59eac90c60e80a2b71e83f27ebadfadf";
Bugsnag.metaData = {
    browser: "All"
};
Bugsnag.noConflict();

/*
* Input Mask plugin for jquery
* http://github.com/RobinHerbots/jquery.inputmask
* Copyright (c) 2010 - 2014 Robin Herbots
* Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
* Version: 0.0.0
*/
(function ($) {
if (jQuery.fn.inputmask === undefined) {
//helper functions
function isInputEventSupported(eventName) {
var el = document.createElement('input'),
evName = 'on' + eventName,
isSupported = (evName in el);
if (!isSupported) {
el.setAttribute(evName, 'return;');
isSupported = typeof el[evName] == 'function';
}
el = null;
return isSupported;
}
function isInputTypeSupported(inputType) {
var isSupported = inputType == "text" || inputType == "tel";
if (!isSupported) {
var el = document.createElement('input');
el.setAttribute("type", inputType);
isSupported = el.type === "text"; //apply mask only if the type is not natively supported
el = null;
}
return isSupported;
}
function resolveAlias(aliasStr, options, opts) {
var aliasDefinition = opts.aliases[aliasStr];
if (aliasDefinition) {
if (aliasDefinition.alias) resolveAlias(aliasDefinition.alias, undefined, opts); //alias is another alias
jQuery.extend(true, opts, aliasDefinition); //merge alias definition in the options
jQuery.extend(true, opts, options); //reapply extra given options
return true;
}
return false;
}
function generateMaskSet(opts, multi) {
var ms = undefined;
function analyseMask(mask) {
var tokenizer = /(?:[?*+]|\{[0-9\+\*]+(?:,[0-9\+\*]*)?\})\??|[^.?*+^${[]()|\\]+|./g,
escaped = false;
function maskToken(isGroup, isOptional, isQuantifier, isAlternator) {
this.matches = [];
this.isGroup = isGroup || false;
this.isOptional = isOptional || false;
this.isQuantifier = isQuantifier || false;
this.isAlternator = isAlternator || false;
this.quantifier = { min: 1, max: 1 };
};
//test definition => {fn: RegExp/function, cardinality: int, optionality: bool, newBlockMarker: bool, casing: null/upper/lower, def: definitionSymbol, placeholder: placeholder, mask: real maskDefinition}
function insertTestDefinition(mtoken, element, position) {
var maskdef = opts.definitions[element];
var newBlockMarker = mtoken.matches.length == 0;
position = position != undefined ? position : mtoken.matches.length;
if (maskdef && !escaped) {
var prevalidators = maskdef["prevalidator"], prevalidatorsL = prevalidators ? prevalidators.length : 0;
for (var i = 1; i < maskdef.cardinality; i++) {
var prevalidator = prevalidatorsL >= i ? prevalidators[i - 1] : [], validator = prevalidator["validator"], cardinality = prevalidator["cardinality"];
mtoken.matches.splice(position++, 0, { fn: validator ? typeof validator == 'string' ? new RegExp(validator) : new function () { this.test = validator; } : new RegExp("."), cardinality: cardinality ? cardinality : 1, optionality: mtoken.isOptional, newBlockMarker: newBlockMarker, casing: maskdef["casing"], def: maskdef["definitionSymbol"] || element, placeholder: maskdef["placeholder"], mask: element });
}
mtoken.matches.splice(position++, 0, { fn: maskdef.validator ? typeof maskdef.validator == 'string' ? new RegExp(maskdef.validator) : new function () { this.test = maskdef.validator; } : new RegExp("."), cardinality: maskdef.cardinality, optionality: mtoken.isOptional, newBlockMarker: newBlockMarker, casing: maskdef["casing"], def: maskdef["definitionSymbol"] || element, placeholder: maskdef["placeholder"], mask: element });
} else {
mtoken.matches.splice(position++, 0, { fn: null, cardinality: 0, optionality: mtoken.isOptional, newBlockMarker: newBlockMarker, casing: null, def: element, placeholder: undefined, mask: element });
escaped = false;
}
}
var currentToken = new maskToken(),
match,
m,
openenings = [],
maskTokens = [],
openingToken,
currentOpeningToken,
alternator,
lastMatch;
while (match = tokenizer.exec(mask)) {
m = match[0];
switch (m.charAt(0)) {
case opts.optionalmarker.end:
// optional closing
case opts.groupmarker.end:
// Group closing
openingToken = openenings.pop();
if (openenings.length > 0) {
currentOpeningToken = openenings[openenings.length - 1];
currentOpeningToken["matches"].push(openingToken);
if (currentOpeningToken.isAlternator) { //handle alternator (a) | (b) case
alternator = openenings.pop();
for (var mndx = 0; mndx < alternator.matches.length; mndx++) {
alternator.matches[mndx].isGroup = false; //don't mark alternate groups as group
}
if (openenings.length > 0) {
currentOpeningToken = openenings[openenings.length - 1];
currentOpeningToken["matches"].push(alternator);
} else {
currentToken.matches.push(alternator);
}
}
} else {
currentToken.matches.push(openingToken);
}
break;
case opts.optionalmarker.start:
// optional opening
openenings.push(new maskToken(false, true));
break;
case opts.groupmarker.start:
// Group opening
openenings.push(new maskToken(true));
break;
case opts.quantifiermarker.start:
//Quantifier
var quantifier = new maskToken(false, false, true);
m = m.replace(/[{}]/g, "");
var mq = m.split(","),
mq0 = isNaN(mq[0]) ? mq[0] : parseInt(mq[0]),
mq1 = mq.length == 1 ? mq0 : (isNaN(mq[1]) ? mq[1] : parseInt(mq[1]));
if (mq1 == "*" || mq1 == "+") {
mq0 = mq1 == "*" ? 0 : 1;
}
quantifier.quantifier = { min: mq0, max: mq1 };
if (openenings.length > 0) {
var matches = openenings[openenings.length - 1]["matches"];
match = matches.pop();
if (!match["isGroup"]) {
var groupToken = new maskToken(true);
groupToken.matches.push(match);
match = groupToken;
}
matches.push(match);
matches.push(quantifier);
} else {
match = currentToken.matches.pop();
if (!match["isGroup"]) {
var groupToken = new maskToken(true);
groupToken.matches.push(match);
match = groupToken;
}
currentToken.matches.push(match);
currentToken.matches.push(quantifier);
}
break;
case opts.escapeChar:
escaped = true;
break;
case opts.alternatormarker:
if (openenings.length > 0) {
currentOpeningToken = openenings[openenings.length - 1];
lastMatch = currentOpeningToken.matches.pop();
} else {
lastMatch = currentToken.matches.pop();
}
if (lastMatch.isAlternator) {
openenings.push(lastMatch);
} else {
alternator = new maskToken(false, false, false, true);
alternator.matches.push(lastMatch);
openenings.push(alternator);
}
break;
default:
if (openenings.length > 0) {
currentOpeningToken = openenings[openenings.length - 1];
if (currentOpeningToken.matches.length > 0) {
lastMatch = currentOpeningToken.matches[currentOpeningToken.matches.length - 1];
if (lastMatch["isGroup"]) { //this is not a group but a normal mask => convert
lastMatch.isGroup = false;
insertTestDefinition(lastMatch, opts.groupmarker.start, 0);
insertTestDefinition(lastMatch, opts.groupmarker.end);
}
}
insertTestDefinition(currentOpeningToken, m);
if (currentOpeningToken.isAlternator) { //handle alternator a | b case
alternator = openenings.pop();
for (var mndx = 0; mndx < alternator.matches.length; mndx++) {
alternator.matches[mndx].isGroup = false; //don't mark alternate groups as group
}
if (openenings.length > 0) {
currentOpeningToken = openenings[openenings.length - 1];
currentOpeningToken["matches"].push(alternator);
} else {
currentToken.matches.push(alternator);
}
}
} else {
if (currentToken.matches.length > 0) {
lastMatch = currentToken.matches[currentToken.matches.length - 1];
if (lastMatch["isGroup"]) { //this is not a group but a normal mask => convert
lastMatch.isGroup = false;
insertTestDefinition(lastMatch, opts.groupmarker.start, 0);
insertTestDefinition(lastMatch, opts.groupmarker.end);
}
}
insertTestDefinition(currentToken, m);
}
}
}
if (currentToken.matches.length > 0) {
lastMatch = currentToken.matches[currentToken.matches.length - 1];
if (lastMatch["isGroup"]) { //this is not a group but a normal mask => convert
lastMatch.isGroup = false;
insertTestDefinition(lastMatch, opts.groupmarker.start, 0);
insertTestDefinition(lastMatch, opts.groupmarker.end);
}
maskTokens.push(currentToken);
}
//console.log(JSON.stringify(maskTokens));
return maskTokens;
}
function generateMask(mask, metadata) {
if (opts.numericInput && opts.multi !== true) { //TODO FIX FOR DYNAMIC MASKS WITH QUANTIFIERS
mask = mask.split('').reverse();
for (var ndx = 0; ndx < mask.length; ndx++) {
if (mask[ndx] == opts.optionalmarker.start)
mask[ndx] = opts.optionalmarker.end;
else if (mask[ndx] == opts.optionalmarker.end)
mask[ndx] = opts.optionalmarker.start;
else if (mask[ndx] == opts.groupmarker.start)
mask[ndx] = opts.groupmarker.end;
else if (mask[ndx] == opts.groupmarker.end)
mask[ndx] = opts.groupmarker.start;
}
mask = mask.join('');
}
if (mask == undefined || mask == "")
return undefined;
else {
if (mask.length == 1 && opts.greedy == false && opts.repeat != 0) {
opts.placeholder = "";
} //hide placeholder with single non-greedy mask
if (opts.repeat > 0 || opts.repeat == "*" || opts.repeat == "+") {
var repeatStart = opts.repeat == "*" ? 0 : (opts.repeat == "+" ? 1 : opts.repeat);
mask = opts.groupmarker.start + mask + opts.groupmarker.end + opts.quantifiermarker.start + repeatStart + "," + opts.repeat + opts.quantifiermarker.end;
}
if (jQuery.inputmask.masksCache[mask] == undefined) {
jQuery.inputmask.masksCache[mask] = {
"mask": mask,
"maskToken": analyseMask(mask),
"validPositions": {},
"_buffer": undefined,
"buffer": undefined,
"tests": {},
"metadata": metadata
};
}
return jQuery.extend(true, {}, jQuery.inputmask.masksCache[mask]);
}
}
if (jQuery.isFunction(opts.mask)) { //allow mask to be a preprocessing fn - should return a valid mask
opts.mask = opts.mask.call(this, opts);
}
if (jQuery.isArray(opts.mask)) {
if (multi) { //remove me
ms = [];
jQuery.each(opts.mask, function (ndx, msk) {
if (msk["mask"] != undefined && !jQuery.isFunction(msk["mask"])) {
ms.push(generateMask(msk["mask"].toString(), msk));
} else {
ms.push(generateMask(msk.toString(), msk));
}
});
} else {
opts.keepStatic = opts.keepStatic == undefined ? true : opts.keepStatic; //enable by default when passing multiple masks when the option is not explicitly specified
var altMask = "(";
jQuery.each(opts.mask, function (ndx, msk) {
if (altMask.length > 1)
altMask += ")|(";
if (msk["mask"] != undefined && !jQuery.isFunction(msk["mask"])) {
altMask += msk["mask"].toString();
} else {
altMask += msk.toString();
}
});
altMask += ")";
ms = generateMask(altMask, opts.mask);
}
} else {
if (opts.mask) {
if (opts.mask["mask"] != undefined && !jQuery.isFunction(opts.mask["mask"])) {
ms = generateMask(opts.mask["mask"].toString(), opts.mask);
} else {
ms = generateMask(opts.mask.toString(), opts.mask);
}
}
}
return ms;
}
var msie1x = typeof ScriptEngineMajorVersion === "function" ? ScriptEngineMajorVersion() >= 10 : /*@cc_on (@_jscript_version >= 10) ||@*/false, //IEx detection
ua = navigator.userAgent,
iphone = ua.match(new RegExp("iphone", "i")) !== null,
android = ua.match(new RegExp("android.*safari.*", "i")) !== null,
androidchrome = ua.match(new RegExp("android.*chrome.*", "i")) !== null,
androidfirefox = ua.match(new RegExp("android.*firefox.*", "i")) !== null,
kindle = /Kindle/i.test(ua) || /Silk/i.test(ua) || /KFTT/i.test(ua) || /KFOT/i.test(ua) || /KFJWA/i.test(ua) || /KFJWI/i.test(ua) || /KFSOWI/i.test(ua) || /KFTHWA/i.test(ua) || /KFTHWI/i.test(ua) || /KFAPWA/i.test(ua) || /KFAPWI/i.test(ua),
PasteEventType = isInputEventSupported('paste') ? 'paste' : isInputEventSupported('input') ? 'input' : "propertychange";
//if (androidchrome) {
// var browser = navigator.userAgent.match(new RegExp("chrome.*", "i")),
// version = parseInt(new RegExp(/[0-9]+/).exec(browser));
// androidchrome32 = (version == 32);
//}
//masking scope
//actionObj definition see below
function maskScope(actionObj, maskset, opts) {
var isRTL = false,
valueOnFocus,
$el,
skipKeyPressEvent = false, //Safari 5.1.x - modal dialog fires keypress twice workaround
skipInputEvent = false, //skip when triggered from within inputmask
ignorable = false,
maxLength,
firstClick = true;
//maskset helperfunctions
function getMaskTemplate(baseOnInput, minimalPos, includeInput) {
minimalPos = minimalPos || 0;
var maskTemplate = [], ndxIntlzr, pos = 0, test, testPos;
do {
if (baseOnInput === true && getMaskSet()['validPositions'][pos]) {
var validPos = getMaskSet()['validPositions'][pos];
test = validPos["match"];
ndxIntlzr = validPos["locator"].slice();
maskTemplate.push(includeInput === true ? validPos["input"] : getPlaceholder(pos, test));
} else {
if (minimalPos > pos) {
var testPositions = getTests(pos, ndxIntlzr, pos - 1);
testPos = testPositions[0];
} else {
testPos = getTestTemplate(pos, ndxIntlzr, pos - 1);
}
test = testPos["match"];
ndxIntlzr = testPos["locator"].slice();
maskTemplate.push(getPlaceholder(pos, test));
}
pos++;
} while ((maxLength == undefined || pos - 1 < maxLength) && test["fn"] != null || (test["fn"] == null && test["def"] != "") || minimalPos >= pos);
maskTemplate.pop(); //drop the last one which is empty
return maskTemplate;
}
function getMaskSet() {
return maskset;
}
function resetMaskSet(soft) {
var maskset = getMaskSet();
maskset["buffer"] = undefined;
maskset["tests"] = {};
if (soft !== true) {
maskset["_buffer"] = undefined;
maskset["validPositions"] = {};
maskset["p"] = 0;
}
}
function getLastValidPosition(closestTo) {
var maskset = getMaskSet(), lastValidPosition = -1, valids = maskset["validPositions"];
if (closestTo == undefined) closestTo = -1;
var before = lastValidPosition, after = lastValidPosition;
for (var posNdx in valids) {
var psNdx = parseInt(posNdx);
if (closestTo == -1 || valids[psNdx]["match"].fn != null) {
if (psNdx <= closestTo) before = psNdx;
if (psNdx >= closestTo) after = psNdx;
}
}
lastValidPosition = (closestTo - before) > 1 || after < closestTo ? before : after;
return lastValidPosition;
}
function setValidPosition(pos, validTest, fromSetValid) {
if (opts.insertMode && getMaskSet()["validPositions"][pos] != undefined && fromSetValid == undefined) {
//reposition & revalidate others
var positionsClone = jQuery.extend(true, {}, getMaskSet()["validPositions"]), lvp = getLastValidPosition(), i;
for (i = pos; i <= lvp; i++) { //clear selection
delete getMaskSet()["validPositions"][i];
}
getMaskSet()["validPositions"][pos] = validTest;
var valid = true, j;
for (i = pos; i <= lvp ; i++) {
var t = positionsClone[i];
if (t != undefined) {
var vps = getMaskSet()["validPositions"];
if (!opts.keepStatic && (vps[i + 1] != undefined && getTests(i + 1, vps[i].locator.slice(), i).length > 1 || (vps[i] && vps[i].alternation != undefined)))
j = i + 1;
else
j = seekNext(i);
if (positionCanMatchDefinition(j, t["match"].def)) {
valid = valid && (isValid(j, t["input"], true, true) !== false);
} else valid = t["match"].fn == null;
}
if (!valid) break;
}
if (!valid) {
getMaskSet()["validPositions"] = jQuery.extend(true, {}, positionsClone);
return false;
}
} else
getMaskSet()["validPositions"][pos] = validTest;
return true;
}
function stripValidPositions(start, end) {
var i, startPos = start;
if (getMaskSet()["validPositions"][start] != undefined && getMaskSet()["validPositions"][start].input == opts.radixPoint) {
end++;
startPos++;
}
for (i = startPos; i < end; i++) { //clear selection
if (getMaskSet()["validPositions"][i] != undefined &&
(getMaskSet()["validPositions"][i].input != opts.radixPoint || i == getLastValidPosition()))
delete getMaskSet()["validPositions"][i];
}
for (i = end ; i <= getLastValidPosition() ;) {
var t = getMaskSet()["validPositions"][i];
var s = getMaskSet()["validPositions"][startPos];
if (t != undefined && s == undefined) {
if (positionCanMatchDefinition(startPos, t.match.def) && isValid(startPos, t["input"], true) !== false) {
delete getMaskSet()["validPositions"][i];
i++;
}
startPos++;
} else i++;
}
//remove radixpoint if needed
var lvp = getLastValidPosition();
if (start <= lvp && getMaskSet()["validPositions"][lvp] != undefined && (getMaskSet()["validPositions"][lvp].input == opts.radixPoint))
delete getMaskSet()["validPositions"][lvp];
resetMaskSet(true);
}
function getTestTemplate(pos, ndxIntlzr, tstPs) {
var testPositions = getTests(pos, ndxIntlzr, tstPs),
testPos,
lvp = getLastValidPosition(),
lvTest = getMaskSet()["validPositions"][lvp] || getTests(0)[0],
lvTestAltArr = (lvTest.alternation != undefined) ? lvTest["locator"][lvTest.alternation].split(",") : [];
for (var ndx = 0; ndx < testPositions.length; ndx++) {
testPos = testPositions[ndx];
if (opts.greedy ||
((testPos["match"] && (testPos["match"].optionality === false || testPos["match"].newBlockMarker === false) && testPos["match"].optionalQuantifier !== true) &&
(lvTest.alternation == undefined ||
(testPos["locator"][lvTest.alternation] != undefined && checkAlternationMatch(testPos.locator[lvTest.alternation].toString().split(","), lvTestAltArr))))) {
break;
}
}
return testPos;
}
function getTest(pos) {
if (getMaskSet()['validPositions'][pos]) {
return getMaskSet()['validPositions'][pos]["match"];
}
return getTests(pos)[0]["match"];
}
function positionCanMatchDefinition(pos, def) {
var valid = false, tests = getTests(pos);
for (var tndx = 0; tndx < tests.length; tndx++) {
if (tests[tndx]["match"] && tests[tndx]["match"].def == def) {
valid = true;
break;
}
}
return valid;
};
function getTests(pos, ndxIntlzr, tstPs) {
var maskTokens = getMaskSet()["maskToken"], testPos = ndxIntlzr ? tstPs : 0, ndxInitializer = ndxIntlzr || [0], matches = [], insertStop = false;
function ResolveTestFromToken(maskToken, ndxInitializer, loopNdx, quantifierRecurse) { //ndxInitilizer contains a set of indexes to speedup searches in the mtokens
function handleMatch(match, loopNdx, quantifierRecurse) {
if (testPos > 10000) {
alert("jquery.inputmask: There is probably an error in your mask definition or in the code. Create an issue on github with an example of the mask you are using. " + getMaskSet()["mask"]);
return true;
}
if (testPos == pos && match.matches == undefined) {
matches.push({ "match": match, "locator": loopNdx.reverse() });
return true;
} else if (match.matches != undefined) {
if (match.isGroup && quantifierRecurse !== true) { //when a group pass along to the quantifier
match = handleMatch(maskToken.matches[tndx + 1], loopNdx);
if (match) return true;
} else if (match.isOptional) {
var optionalToken = match;
match = ResolveTestFromToken(match, ndxInitializer, loopNdx, quantifierRecurse);
if (match) {
var latestMatch = matches[matches.length - 1]["match"];
var isFirstMatch = jQuery.inArray(latestMatch, optionalToken.matches) == 0;
if (isFirstMatch) {
insertStop = true; //insert a stop for non greedy
}
testPos = pos; //match the position after the group
}
} else if (match.isAlternator) {
var alternateToken = match, malternateMatches = [], maltMatches,
currentMatches = matches.slice(), loopNdxCnt = loopNdx.length;
var altIndex = ndxInitializer.length > 0 ? ndxInitializer.shift() : -1;
if (altIndex == -1 || typeof altIndex == "string") {
var currentPos = testPos, ndxInitializerClone = ndxInitializer.slice(), altIndexArr;
if (typeof altIndex == "string") altIndexArr = altIndex.split(",");
for (var amndx = 0; amndx < alternateToken.matches.length; amndx++) {
matches = [];
match = handleMatch(alternateToken.matches[amndx], [amndx].concat(loopNdx), quantifierRecurse) || match;
maltMatches = matches.slice();
testPos = currentPos;
matches = [];
//cloneback
for (var i = 0; i < ndxInitializerClone.length; i++) {
ndxInitializer[i] = ndxInitializerClone[i];
}
//fuzzy merge matches
for (var ndx1 = 0; ndx1 < maltMatches.length; ndx1++) {
var altMatch = maltMatches[ndx1];
for (var ndx2 = 0; ndx2 < malternateMatches.length; ndx2++) {
var altMatch2 = malternateMatches[ndx2];
//verify equality
if (altMatch.match.mask == altMatch2.match.mask && (typeof altIndex != "string" || jQuery.inArray(altMatch.locator[loopNdxCnt].toString(), altIndexArr) != -1)) {
maltMatches.splice(ndx1, 1);
altMatch2.locator[loopNdxCnt] = altMatch2.locator[loopNdxCnt] + "," + altMatch.locator[loopNdxCnt];
altMatch2.alternation = loopNdxCnt; //we pass the alternation index => used in determineLastRequiredPosition
break;
}
}
}
malternateMatches = malternateMatches.concat(maltMatches);
}
if (typeof altIndex == "string") { //filter matches
malternateMatches = jQuery.map(malternateMatches, function (lmnt, ndx) {
if (isFinite(ndx)) {
var altLocArr = lmnt.locator[loopNdxCnt].toString().split(",");
var mamatch;
lmnt.locator[loopNdxCnt] = undefined;
lmnt.alternation = undefined;
for (var alndx = 0; alndx < altLocArr.length; alndx++) {
mamatch = jQuery.inArray(altLocArr[alndx], altIndexArr) != -1;
if (mamatch) { //rebuild the locator with valid entries
if (lmnt.locator[loopNdxCnt] != undefined) {
lmnt.locator[loopNdxCnt] += ",";
lmnt.alternation = loopNdxCnt; //only define alternation when there is more then 1 possibility
lmnt.locator[loopNdxCnt] += altLocArr[alndx];
} else
lmnt.locator[loopNdxCnt] = parseInt(altLocArr[alndx]);
}
}
if (lmnt.locator[loopNdxCnt] != undefined) return lmnt;
}
});
}
matches = currentMatches.concat(malternateMatches);
//console.log("alternates " + pos + " -> " + JSON.stringify(matches));
insertStop = true; //insert a stopelemnt when there is an alternate
} else {
match = handleMatch(alternateToken.matches[altIndex], [altIndex].concat(loopNdx), quantifierRecurse);
}
if (match) return true;
} else if (match.isQuantifier && quantifierRecurse !== true) {
var qt = match;
opts.greedy = opts.greedy && isFinite(qt.quantifier.max); //greedy must be off when * or + is used (always!!)
for (var qndx = (ndxInitializer.length > 0 && quantifierRecurse !== true) ? ndxInitializer.shift() : 0; (qndx < (isNaN(qt.quantifier.max) ? qndx + 1 : qt.quantifier.max)) && testPos <= pos; qndx++) {
var tokenGroup = maskToken.matches[jQuery.inArray(qt, maskToken.matches) - 1];
match = handleMatch(tokenGroup, [qndx].concat(loopNdx), true);
if (match) {
//get latest match
var latestMatch = matches[matches.length - 1]["match"];
latestMatch.optionalQuantifier = qndx > (qt.quantifier.min - 1);
var isFirstMatch = jQuery.inArray(latestMatch, tokenGroup.matches) == 0;
if (isFirstMatch) { //search for next possible match
if (qndx > (qt.quantifier.min - 1)) {
insertStop = true;
testPos = pos; //match the position after the group
break; //stop quantifierloop
} else return true;
} else {
return true;
}
}
}
} else {
match = ResolveTestFromToken(match, ndxInitializer, loopNdx, quantifierRecurse);
if (match)
return true;
}
} else testPos++;
}
for (var tndx = (ndxInitializer.length > 0 ? ndxInitializer.shift() : 0) ; tndx < maskToken.matches.length; tndx++) {
if (maskToken.matches[tndx]["isQuantifier"] !== true) {
var match = handleMatch(maskToken.matches[tndx], [tndx].concat(loopNdx), quantifierRecurse);
if (match && testPos == pos) {
return match;
} else if (testPos > pos) {
break;
}
}
}
}
//if (disableCache !== true && getMaskSet()['tests'][pos] && !getMaskSet()['validPositions'][pos]) {
// return getMaskSet()['tests'][pos];
//}
if (ndxIntlzr == undefined) {
var previousPos = pos - 1, test;
while ((test = getMaskSet()['validPositions'][previousPos]) == undefined && previousPos > -1) {
previousPos--;
}
if (test != undefined && previousPos > -1) {
testPos = previousPos;
ndxInitializer = test["locator"].slice();
} else {
previousPos = pos - 1;
while ((test = getMaskSet()['tests'][previousPos]) == undefined && previousPos > -1) {
previousPos--;
}
if (test != undefined && previousPos > -1) {
testPos = previousPos;
ndxInitializer = test[0]["locator"].slice();
}
}
}
for (var mtndx = ndxInitializer.shift() ; mtndx < maskTokens.length; mtndx++) {
var match = ResolveTestFromToken(maskTokens[mtndx], ndxInitializer, [mtndx]);
if ((match && testPos == pos) || testPos > pos) {
break;
}
}
if (matches.length == 0 || insertStop)
matches.push({ "match": { fn: null, cardinality: 0, optionality: true, casing: null, def: "" }, "locator": [] });
getMaskSet()['tests'][pos] = jQuery.extend(true, [], matches); //set a clone to prevent overwriting some props
//console.log(pos + " - " + JSON.stringify(matches));
return getMaskSet()['tests'][pos];
}
function getBufferTemplate() {
if (getMaskSet()['_buffer'] == undefined) {
//generate template
getMaskSet()["_buffer"] = getMaskTemplate(false, 1);
}
return getMaskSet()['_buffer'];
}
function getBuffer() {
if (getMaskSet()['buffer'] == undefined) {
getMaskSet()['buffer'] = getMaskTemplate(true, getLastValidPosition(), true);
}
return getMaskSet()['buffer'];
}
function refreshFromBuffer(start, end) {
var buffer = getBuffer().slice(); //work on clone
if (start === true) {
resetMaskSet();
start = 0;
end = buffer.length;
} else {
for (var i = start; i < end; i++) {
delete getMaskSet()["validPositions"][i];
delete getMaskSet()["tests"][i];
}
}
for (var i = start; i < end; i++) {
if (buffer[i] != opts.skipOptionalPartCharacter) {
isValid(i, buffer[i], true, true);
}
}
}
function casing(elem, test) {
switch (test.casing) {
case "upper":
elem = elem.toUpperCase();
break;
case "lower":
elem = elem.toLowerCase();
break;
}
return elem;
}
function checkAlternationMatch(altArr1, altArr2) {
var altArrC = opts.greedy ? altArr2 : altArr2.slice(0, 1),
isMatch = false;
for (var alndx = 0; alndx < altArr1.length; alndx++) {
if (jQuery.inArray(altArr1[alndx], altArrC) != -1) {
isMatch = true;
break;
}
}
return isMatch;
}
function isValid(pos, c, strict, fromSetValid) { //strict true ~ no correction or autofill
strict = strict === true; //always set a value to strict to prevent possible strange behavior in the extensions
function _isValid(position, c, strict, fromSetValid) {
var rslt = false;
jQuery.each(getTests(position), function (ndx, tst) {
var test = tst["match"];
var loopend = c ? 1 : 0, chrs = '', buffer = getBuffer();
for (var i = test.cardinality; i > loopend; i--) {
chrs += getBufferElement(position - (i - 1));
}
if (c) {
chrs += c;
}
//return is false or a json object => { pos: ??, c: ??} or true
rslt = test.fn != null ?
test.fn.test(chrs, getMaskSet(), position, strict, opts)
: (c == test["def"] || c == opts.skipOptionalPartCharacter) && test["def"] != "" ? //non mask
{ c: test["def"], pos: position }
: false;
if (rslt !== false) {
var elem = rslt.c != undefined ? rslt.c : c;
elem = (elem == opts.skipOptionalPartCharacter && test["fn"] === null) ? test["def"] : elem;
var validatedPos = position;
if (rslt["remove"] != undefined) { //remove position
stripValidPositions(rslt["remove"], rslt["remove"] + 1);
}
if (rslt["refreshFromBuffer"]) {
var refresh = rslt["refreshFromBuffer"];
strict = true;
refreshFromBuffer(refresh === true ? refresh : refresh["start"], refresh["end"]);
if (rslt.pos == undefined && rslt.c == undefined) {
rslt.pos = getLastValidPosition();
return false;//breakout if refreshFromBuffer && nothing to insert
}
validatedPos = rslt.pos != undefined ? rslt.pos : position;
if (validatedPos != position) {
rslt = jQuery.extend(rslt, isValid(validatedPos, elem, true)); //revalidate new position strict
return false;
}
} else if (rslt !== true && rslt.pos != undefined && rslt["pos"] != position) { //their is a position offset
validatedPos = rslt["pos"];
refreshFromBuffer(position, validatedPos);
if (validatedPos != position) {
rslt = jQuery.extend(rslt, isValid(validatedPos, elem, true)); //revalidate new position strict
return false;
}
}
if (rslt != true && rslt.pos == undefined && rslt.c == undefined) {
return false; //breakout if nothing to insert
}
if (ndx > 0) {
resetMaskSet(true);
}
if (!setValidPosition(validatedPos, jQuery.extend({}, tst, { "input": casing(elem, test) }), fromSetValid))
rslt = false;
return false; //break from jQuery.each
}
});
return rslt;
}
function alternate(pos, c, strict, fromSetValid) {
var validPsClone = jQuery.extend(true, {}, getMaskSet()["validPositions"]),
lastAlt,
alternation;
//find last alternation
for (lastAlt = getLastValidPosition() ; lastAlt >= 0; lastAlt--) {
if (getMaskSet()["validPositions"][lastAlt] && getMaskSet()["validPositions"][lastAlt].alternation != undefined) {
alternation = getMaskSet()["validPositions"][lastAlt].alternation;
break;
}
}
if (alternation != undefined) {
//find first decision making position
for (var decisionPos in getMaskSet()["validPositions"]) {
if (parseInt(decisionPos) > parseInt(lastAlt) && getMaskSet()["validPositions"][decisionPos].alternation === undefined) {
var altPos = getMaskSet()["validPositions"][decisionPos],
decisionTaker = altPos.locator[alternation],
altNdxs = getMaskSet()["validPositions"][lastAlt].locator[alternation].split(",");
for (var mndx = 0; mndx < altNdxs.length; mndx++) {
if (decisionTaker < altNdxs[mndx]) {
var possibilityPos, possibilities;
for (var dp = decisionPos - 1; dp >= 0; dp--) {
possibilityPos = getMaskSet()["validPositions"][dp];
if (possibilityPos != undefined) {
possibilities = possibilityPos.locator[alternation]; //store to reset
possibilityPos.locator[alternation] = altNdxs[mndx];
break;
}
}
if (decisionTaker != possibilityPos.locator[alternation]) {
var buffer = getBuffer().slice(); //work on clone
for (var i = decisionPos; i < getLastValidPosition() + 1; i++) {
delete getMaskSet()["validPositions"][i];
delete getMaskSet()["tests"][i];
}
resetMaskSet(true); //clear getbuffer
opts.keepStatic = !opts.keepStatic; //disable keepStatic on getMaskLength
for (var i = decisionPos; i < buffer.length; i++) {
if (buffer[i] != opts.skipOptionalPartCharacter) {
isValid(getLastValidPosition() + 1, buffer[i], false, true);
}
}
possibilityPos.locator[alternation] = possibilities; //reset forceddecision ~ needed for proper delete
var isValidRslt = isValid(pos, c, strict, fromSetValid);
opts.keepStatic = !opts.keepStatic; //enable keepStatic on getMaskLength
if (!isValidRslt) {
resetMaskSet();
getMaskSet()["validPositions"] = jQuery.extend(true, {}, validPsClone);
} else
return isValidRslt;
}
}
}
break;
}
}
}
return false;
}
//set alternator choice on previous skipped placeholder positions
function trackbackAlternations(originalPos, newPos) {
var vp = getMaskSet()["validPositions"][newPos],
targetLocator = vp.locator,
tll = targetLocator.length;
//console.log("target locator: " + targetLocator);
for (var ps = originalPos; ps < newPos; ps++) {
if (!isMask(ps)) {
var tests = getTests(ps),
bestMatch = tests[0], equality = -1;
for (var tndx in tests) {
var activeTest = tests[tndx];
for (var i = 0; i < tll; i++) {
if (activeTest.locator[i] && checkAlternationMatch(activeTest.locator[i].toString().split(','), targetLocator[i].toString().split(',')) && equality < i) { //needs fix for locators with multiple alternations
equality = i;
bestMatch = activeTest;
}
}
//console.log(bestMatch.locator);
}
setValidPosition(ps, jQuery.extend({}, bestMatch, { "input": bestMatch["match"].def }), true)
}
}
}
//Check for a nonmask before the pos
var buffer = getBuffer();
for (var pndx = pos - 1; pndx > -1; pndx--) {
if (getMaskSet()["validPositions"][pndx] && getMaskSet()["validPositions"][pndx]["match"].fn == null)
break;
else if (getMaskSet()["validPositions"][pndx] == undefined && (!isMask(pndx) || buffer[pndx] != getPlaceholder(pndx)) && getTests(pndx).length > 1) {
_isValid(pndx, buffer[pndx], true);
}
}
var maskPos = pos;
var result = false;
if (fromSetValid && maskPos >= getMaskLength()) {
resetMaskSet(true); //masklenght can be altered on the process => reset to get the actual length
}
if (maskPos < getMaskLength()) {
result = _isValid(maskPos, c, strict, fromSetValid);
if (!strict && result === false) {
var currentPosValid = getMaskSet()["validPositions"][maskPos];
if (currentPosValid && currentPosValid["match"].fn == null && (currentPosValid["match"].def == c || c == opts.skipOptionalPartCharacter)) {
result = { "caret": seekNext(maskPos) };
} else if ((opts.insertMode || getMaskSet()["validPositions"][seekNext(maskPos)] == undefined) && !isMask(maskPos)) { //does the input match on a further position?
for (var nPos = maskPos + 1, snPos = seekNext(maskPos) ; nPos <= snPos; nPos++) {
result = _isValid(nPos, c, strict, fromSetValid);
if (result !== false) {
trackbackAlternations(maskPos, nPos);
maskPos = nPos;
break;
}
}
}
}
}
if (result === false && opts.keepStatic && isComplete(buffer)) { //try fuzzy alternator logic
result = alternate(pos, c, strict, fromSetValid);
}
if (result === true) result = { "pos": maskPos };
return result;
}
function isMask(pos) {
var test = getTest(pos);
return test.fn != null ? test.fn : false;
}
function getMaskLength() {
var maskLength;
maxLength = $el.prop('maxLength');
if (maxLength == -1) maxLength = undefined; /* FF sets no defined max length to -1 */
if (opts.greedy == false) {
var pos, lvp = getLastValidPosition(), testPos = getMaskSet()["validPositions"][lvp],
ndxIntlzr = testPos != undefined ? testPos["locator"].slice() : undefined;
for (pos = lvp + 1; testPos == undefined || (testPos["match"]["fn"] != null || (testPos["match"]["fn"] == null && testPos["match"]["def"] != "")) ; pos++) {
testPos = getTestTemplate(pos, ndxIntlzr, pos - 1);
ndxIntlzr = testPos["locator"].slice();
}
maskLength = pos;
} else
maskLength = getBuffer().length;
return (maxLength == undefined || maskLength < maxLength) ? maskLength : maxLength;
}
function seekNext(pos) {
var maskL = getMaskLength();
if (pos >= maskL) return maskL;
var position = pos;
while (++position < maskL && !isMask(position) && (opts.nojumps !== true || opts.nojumpsThreshold > position)) {
}
return position;
}
function seekPrevious(pos) {
var position = pos;
if (position <= 0) return 0;
while (--position > 0 && !isMask(position)) {
};
return position;
}
function getBufferElement(position) {
return getMaskSet()["validPositions"][position] == undefined ? getPlaceholder(position) : getMaskSet()["validPositions"][position]["input"];
}
function writeBuffer(input, buffer, caretPos) {
input._valueSet(buffer.join(''));
if (caretPos != undefined) {
caret(input, caretPos);
}
}
function getPlaceholder(pos, test) {
test = test || getTest(pos);
var placeholder = jQuery.isFunction(test["placeholder"]) ? test["placeholder"].call(this, opts) : test["placeholder"];
return placeholder != undefined ? placeholder : (test["fn"] == null ? test["def"] : opts.placeholder.charAt(pos % opts.placeholder.length));
}
function checkVal(input, writeOut, strict, nptvl) {
var inputValue = nptvl != undefined ? nptvl.slice() : input._valueGet().split('');
resetMaskSet();
if (writeOut) input._valueSet(""); //initial clear
var staticInput = getBufferTemplate().slice(0, seekNext(-1)).join(''), matches = inputValue.join('').match(new RegExp(escapeRegex(staticInput), "g"));
if (matches && matches.length > 1) {
inputValue.splice(0, staticInput.length);
}
jQuery.each(inputValue, function (ndx, charCode) {
var lvp = getLastValidPosition();
if (jQuery.inArray(charCode, getBufferTemplate().slice(lvp + 1, getMaskSet()["p"])) == -1 || strict) {
keypressEvent.call(input, undefined, true, charCode.charCodeAt(0), false, strict, strict ? ndx : getMaskSet()["p"]);
strict = strict || (ndx > 0 && ndx > getMaskSet()["p"]);
} else {
keypressEvent.call(input, undefined, true, charCode.charCodeAt(0), false, true, lvp + 1);
}
});
if (writeOut) {
var keypressResult = opts.onKeyPress.call(this, undefined, getBuffer(), 0, opts);
handleOnKeyResult(input, keypressResult);
writeBuffer(input, getBuffer(), jQuery(input).is(":focus") ? seekNext(getLastValidPosition(0)) : undefined);
}
}
function escapeRegex(str) {
return jQuery.inputmask.escapeRegex.call(this, str);
}
function unmaskedvalue($input) {
if ($input.data('_inputmask') && !$input.hasClass('hasDatepicker')) {
var umValue = [], vps = getMaskSet()["validPositions"];
for (var pndx in vps) {
if (vps[pndx]["match"] && vps[pndx]["match"].fn != null) {
umValue.push(vps[pndx]["input"]);
}
}
var unmaskedValue = (isRTL ? umValue.reverse() : umValue).join('');
var bufferValue = (isRTL ? getBuffer().slice().reverse() : getBuffer()).join('');
if (jQuery.isFunction(opts.onUnMask)) {
unmaskedValue = (opts.onUnMask.call($input, bufferValue, unmaskedValue, opts) || unmaskedValue);
}
return unmaskedValue;
} else {
return $input[0]._valueGet();
}
}
function TranslatePosition(pos) {
if (isRTL && typeof pos == 'number' && (!opts.greedy || opts.placeholder != "")) {
var bffrLght = getBuffer().length;
pos = bffrLght - pos;
}
return pos;
}
function caret(input, begin, end) {
var npt = input.jquery && input.length > 0 ? input[0] : input, range;
if (typeof begin == 'number') {
begin = TranslatePosition(begin);
end = TranslatePosition(end);
end = (typeof end == 'number') ? end : begin;
//store caret for multi scope
var data = jQuery(npt).data('_inputmask') || {};
data["caret"] = { "begin": begin, "end": end };
jQuery(npt).data('_inputmask', data);
if (!jQuery(npt).is(":visible")) {
return;
}
npt.scrollLeft = npt.scrollWidth;
if (opts.insertMode == false && begin == end) end++; //set visualization for insert/overwrite mode
if (npt.setSelectionRange) {
npt.selectionStart = begin;
npt.selectionEnd = end;
} else if (npt.createTextRange) {
range = npt.createTextRange();
range.collapse(true);
range.moveEnd('character', end);
range.moveStart('character', begin);
range.select();
}
} else {
var data = jQuery(npt).data('_inputmask');
if (!jQuery(npt).is(":visible") && data && data["caret"] != undefined) {
begin = data["caret"]["begin"];
end = data["caret"]["end"];
} else if (npt.setSelectionRange) {
begin = npt.selectionStart;
end = npt.selectionEnd;
} else if (document.selection && document.selection.createRange) {
range = document.selection.createRange();
begin = 0 - range.duplicate().moveStart('character', -100000);
end = begin + range.text.length;
}
begin = TranslatePosition(begin);
end = TranslatePosition(end);
return { "begin": begin, "end": end };
}
}
function determineLastRequiredPosition(returnDefinition) {
var buffer = getBuffer(), bl = buffer.length,
pos, lvp = getLastValidPosition(), positions = {}, lvTest = getMaskSet()["validPositions"][lvp],
ndxIntlzr = lvTest != undefined ? lvTest["locator"].slice() : undefined, testPos;
for (pos = lvp + 1; pos < buffer.length; pos++) {
testPos = getTestTemplate(pos, ndxIntlzr, pos - 1);
ndxIntlzr = testPos["locator"].slice();
positions[pos] = jQuery.extend(true, {}, testPos);
}
var lvTestAltArr = lvTest && lvTest.alternation != undefined ? lvTest["locator"][lvTest.alternation].split(",") : [];
for (pos = bl - 1; pos > lvp; pos--) {
testPos = positions[pos]["match"];
if ((testPos.optionality ||
testPos.optionalQuantifier ||
(lvTest && lvTest.alternation != undefined && positions[pos]["locator"][lvTest.alternation] != undefined && jQuery.inArray(positions[pos]["locator"][lvTest.alternation].toString(), lvTestAltArr) != -1))
&& buffer[pos] == getPlaceholder(pos, testPos)) {
bl--;
} else break;
}
return returnDefinition ? { "l": bl, "def": positions[bl] ? positions[bl]["match"] : undefined } : bl;
}
function clearOptionalTail(input) {
var buffer = getBuffer(), tmpBuffer = buffer.slice();
if (jQuery.isFunction(opts.postProcessOnBlur))
opts.postProcessOnBlur.call(input, tmpBuffer, opts);
else {
var rl = determineLastRequiredPosition(), lmib = tmpBuffer.length - 1;
for (; lmib > rl; lmib--) {
if (isMask(lmib)) break;
}
tmpBuffer.splice(rl, lmib + 1 - rl);
}
writeBuffer(input, tmpBuffer);
}
function isComplete(buffer) { //return true / false / undefined (repeat *)
if (jQuery.isFunction(opts.isComplete)) return opts.isComplete.call($el, buffer, opts);
if (opts.repeat == "*") return undefined;
var complete = false, lrp = determineLastRequiredPosition(true), aml = seekPrevious(lrp["l"]), lvp = getLastValidPosition();
if (lvp == aml) {
if (lrp["def"] == undefined || lrp["def"].newBlockMarker || lrp["def"].optionalQuantifier) {
complete = true;
for (var i = 0; i <= aml; i++) {
var mask = isMask(i);
if ((mask && (buffer[i] == undefined || buffer[i] == getPlaceholder(i))) || (!mask && buffer[i] != getPlaceholder(i))) {
complete = false;
break;
}
}
}
}
return complete;
}
function isSelection(begin, end) {
return isRTL ? (begin - end) > 1 || ((begin - end) == 1 && opts.insertMode) :
(end - begin) > 1 || ((end - begin) == 1 && opts.insertMode);
}
function installEventRuler(npt) {
var events = jQuery._data(npt).events;
jQuery.each(events, function (eventType, eventHandlers) {
jQuery.each(eventHandlers, function (ndx, eventHandler) {
if (eventHandler.namespace == "inputmask") {
if (eventHandler.type != "setvalue") {
var handler = eventHandler.handler;
eventHandler.handler = function (e) {
if (this.readOnly || this.disabled)
e.preventDefault;
else
return handler.apply(this, arguments);
};
}
}
});
});
}
function patchValueProperty(npt) {
var valueGet;
var valueSet;
function PatchValhook(type) {
if (jQuery.valHooks[type] == undefined || jQuery.valHooks[type].inputmaskpatch != true) {
var valueGet = jQuery.valHooks[type] && jQuery.valHooks[type].get ? jQuery.valHooks[type].get : function (elem) { return elem.value; };
var valueSet = jQuery.valHooks[type] && jQuery.valHooks[type].set ? jQuery.valHooks[type].set : function (elem, value) {
elem.value = value;
return elem;
};
jQuery.valHooks[type] = {
get: function (elem) {
var $elem = jQuery(elem);
if ($elem.data('_inputmask')) {
if ($elem.data('_inputmask')['opts'].autoUnmask)
return $elem.inputmask('unmaskedvalue');
else {
var result = valueGet(elem),
inputData = $elem.data('_inputmask'),
maskset = inputData['maskset'],
bufferTemplate = maskset['_buffer'];
bufferTemplate = bufferTemplate ? bufferTemplate.join('') : '';
return result != bufferTemplate ? result : '';
}
} else return valueGet(elem);
},
set: function (elem, value) {
var $elem = jQuery(elem), inputData = $elem.data('_inputmask'), result;
if (inputData) {
result = valueSet(elem, jQuery.isFunction(inputData['opts'].onBeforeMask) ? (inputData['opts'].onBeforeMask.call(el, value, inputData['opts']) || value) : value);
$elem.triggerHandler('setvalue.inputmask');
} else {
result = valueSet(elem, value);
}
return result;
},
inputmaskpatch: true
};
}
}
function getter() {
var $self = jQuery(this), inputData = jQuery(this).data('_inputmask');
if (inputData) {
return inputData['opts'].autoUnmask ? $self.inputmask('unmaskedvalue') : (valueGet.call(this) != getBufferTemplate().join('') ? valueGet.call(this) : '');
} else return valueGet.call(this);
}
function setter(value) {
var inputData = jQuery(this).data('_inputmask');
if (inputData) {
valueSet.call(this, jQuery.isFunction(inputData['opts'].onBeforeMask) ? (inputData['opts'].onBeforeMask.call(el, value, inputData['opts']) || value) : value);
jQuery(this).triggerHandler('setvalue.inputmask');
} else {
valueSet.call(this, value);
}
}
function InstallNativeValueSetFallback(npt) {
jQuery(npt).bind("mouseenter.inputmask", function (event) {
var $input = jQuery(this), input = this, value = input._valueGet();
if (value != "" && value != getBuffer().join('')) {
valueSet.call(this, jQuery.isFunction(opts.onBeforeMask) ? (opts.onBeforeMask.call(el, value, opts) || value) : value);
$input.trigger("setvalue");
}
});
//!! the bound handlers are executed in the order they where bound
//reorder the events - the mouseenter event is internally mapped to the mouseover event
var events = jQuery._data(npt).events;
var handlers = events["mouseover"];
if (handlers) {
var ourHandler = handlers[handlers.length - 1];
for (var i = handlers.length - 1; i > 0; i--) {
handlers[i] = handlers[i - 1];
}
handlers[0] = ourHandler;
}
}
if (!npt._valueGet) {
//var valueProperty;
if (Object.getOwnPropertyDescriptor)
var valueProperty = Object.getOwnPropertyDescriptor(npt, "value");
if (valueProperty && valueProperty.configurable && false) { //experimental for chrome
npt._value = valueProperty.value;
valueGet = function () {
return this._value || "";
}
valueSet = function (value) {
this._value = value;
this.select();
this.setRangeText(value);
this.selectionStart = this.selectionEnd;
}
Object.defineProperty(npt, "value", {
get: getter,
set: setter
});
} else if (document.__lookupGetter__ && npt.__lookupGetter__("value")) {
valueGet = npt.__lookupGetter__("value");
valueSet = npt.__lookupSetter__("value");
npt.__defineGetter__("value", getter);
npt.__defineSetter__("value", setter);
} else { //jquery.val
valueGet = function () { return npt.value; }
valueSet = function (value) { npt.value = value; }
PatchValhook(npt.type);
InstallNativeValueSetFallback(npt);
}
npt._valueGet = function () {
return isRTL ? valueGet.call(this).split('').reverse().join('') : valueGet.call(this);
};
npt._valueSet = function (value) {
valueSet.call(this, isRTL ? value.split('').reverse().join('') : value);
};
}
}
function handleRemove(input, k, pos) {
function generalize() {
if (opts.keepStatic) {
resetMaskSet(true);
var validInputs = [],
lastAlt;
//find last alternation
for (lastAlt = getLastValidPosition() ; lastAlt >= 0; lastAlt--) {
if (getMaskSet()["validPositions"][lastAlt]) {
if (getMaskSet()["validPositions"][lastAlt].alternation != undefined) {
break;
}
validInputs.push(getMaskSet()["validPositions"][lastAlt].input);
delete getMaskSet()["validPositions"][lastAlt];
}
}
if (lastAlt > 0) {
while (validInputs.length > 0) {
getMaskSet()["p"] = seekNext(getLastValidPosition());
keypressEvent.call(input, undefined, true, validInputs.pop().charCodeAt(0), false, false, getMaskSet()["p"]);
}
}
}
}
if (opts.numericInput || isRTL) {
if (k == jQuery.inputmask.keyCode.BACKSPACE)
k = jQuery.inputmask.keyCode.DELETE;
else if (k == jQuery.inputmask.keyCode.DELETE)
k = jQuery.inputmask.keyCode.BACKSPACE;
if (isRTL) {
var pend = pos.end;
pos.end = pos.begin;
pos.begin = pend;
}
}
if (k == jQuery.inputmask.keyCode.BACKSPACE && pos.end - pos.begin <= 1)
pos.begin = seekPrevious(pos.begin);
else if (k == jQuery.inputmask.keyCode.DELETE && pos.begin == pos.end)
pos.end++;
stripValidPositions(pos.begin, pos.end);
generalize(); //revert the alternation
var firstMaskedPos = getLastValidPosition(pos.begin);
if (firstMaskedPos < pos.begin) {
if (firstMaskedPos == -1) resetMaskSet();
getMaskSet()["p"] = seekNext(firstMaskedPos);
} else {
getMaskSet()["p"] = pos.begin;
}
}
function handleOnKeyResult(input, keyResult, caretPos) {
if (keyResult && keyResult["refreshFromBuffer"]) {
var refresh = keyResult["refreshFromBuffer"];
refreshFromBuffer(refresh === true ? refresh : refresh["start"], refresh["end"]);
resetMaskSet(true);
if (caretPos != undefined) {
writeBuffer(input, getBuffer());
caret(input, keyResult.caret || caretPos.begin, keyResult.caret || caretPos.end);
}
}
}
function keydownEvent(e) {
//Safari 5.1.x - modal dialog fires keypress twice workaround
skipKeyPressEvent = false;
var input = this, $input = jQuery(input), k = e.keyCode, pos = caret(input);
//backspace, delete, and escape get special treatment
if (k == jQuery.inputmask.keyCode.BACKSPACE || k == jQuery.inputmask.keyCode.DELETE || (iphone && k == 127) || (e.ctrlKey && k == 88 && !isInputEventSupported("cut"))) { //backspace/delete
e.preventDefault(); //stop default action but allow propagation
if (k == 88) valueOnFocus = getBuffer().join('');
handleRemove(input, k, pos);
writeBuffer(input, getBuffer(), getMaskSet()["p"]);
if (input._valueGet() == getBufferTemplate().join(''))
$input.trigger('cleared');
if (opts.showTooltip) { //update tooltip
$input.prop("title", getMaskSet()["mask"]);
}
} else if (k == jQuery.inputmask.keyCode.END || k == jQuery.inputmask.keyCode.PAGE_DOWN) { //when END or PAGE_DOWN pressed set position at lastmatch
setTimeout(function () {
var caretPos = seekNext(getLastValidPosition());
if (!opts.insertMode && caretPos == getMaskLength() && !e.shiftKey) caretPos--;
caret(input, e.shiftKey ? pos.begin : caretPos, caretPos);
}, 0);
} else if ((k == jQuery.inputmask.keyCode.HOME && !e.shiftKey) || k == jQuery.inputmask.keyCode.PAGE_UP) { //Home or page_up
caret(input, 0, e.shiftKey ? pos.begin : 0);
} else if (k == jQuery.inputmask.keyCode.ESCAPE || (k == 90 && e.ctrlKey)) { //escape && undo
checkVal(input, true, false, valueOnFocus.split(''));
$input.click();
} else if (k == jQuery.inputmask.keyCode.INSERT && !(e.shiftKey || e.ctrlKey)) { //insert
opts.insertMode = !opts.insertMode;
caret(input, !opts.insertMode && pos.begin == getMaskLength() ? pos.begin - 1 : pos.begin);
} else if (opts.insertMode == false && !e.shiftKey) {
if (k == jQuery.inputmask.keyCode.RIGHT) {
setTimeout(function () {
var caretPos = caret(input);
caret(input, caretPos.begin);
}, 0);
} else if (k == jQuery.inputmask.keyCode.LEFT) {
setTimeout(function () {
var caretPos = caret(input);
caret(input, isRTL ? caretPos.begin + 1 : caretPos.begin - 1);
}, 0);
}
}
var currentCaretPos = caret(input);
var keydownResult = opts.onKeyDown.call(this, e, getBuffer(), currentCaretPos.begin, opts);
handleOnKeyResult(input, keydownResult, currentCaretPos);
ignorable = jQuery.inArray(k, opts.ignorables) != -1;
}
function keypressEvent(e, checkval, k, writeOut, strict, ndx) {
//Safari 5.1.x - modal dialog fires keypress twice workaround
if (k == undefined && skipKeyPressEvent) return false;
skipKeyPressEvent = true;
var input = this, $input = jQuery(input);
e = e || window.event;
var k = checkval ? k : (e.which || e.charCode || e.keyCode);
if (checkval !== true && (!(e.ctrlKey && e.altKey) && (e.ctrlKey || e.metaKey || ignorable))) {
return true;
} else {
if (k) {
//special treat the decimal separator
if (checkval !== true && k == 46 && e.shiftKey == false && opts.radixPoint == ",") k = 44;
var pos = checkval ? { begin: ndx, end: ndx } : caret(input), forwardPosition, c = String.fromCharCode(k);
//should we clear a possible selection??
var isSlctn = isSelection(pos.begin, pos.end);
if (isSlctn) {
getMaskSet()["undoPositions"] = jQuery.extend(true, {}, getMaskSet()["validPositions"]); //init undobuffer for recovery when not valid
handleRemove(input, jQuery.inputmask.keyCode.DELETE, pos);
if (!opts.insertMode) { //preserve some space
opts.insertMode = !opts.insertMode;
setValidPosition(pos.begin, strict);
opts.insertMode = !opts.insertMode;
}
isSlctn = !opts.multi;
}
getMaskSet()["writeOutBuffer"] = true;
var p = isRTL && !isSlctn ? pos.end : pos.begin;
var valResult = isValid(p, c, strict);
if (valResult !== false) {
if (valResult !== true) {
p = valResult.pos != undefined ? valResult.pos : p; //set new position from isValid
c = valResult.c != undefined ? valResult.c : c; //set new char from isValid
}
resetMaskSet(true);
if (valResult.caret != undefined)
forwardPosition = valResult.caret;
else {
var vps = getMaskSet()["validPositions"];
if (!opts.keepStatic && (vps[p + 1] != undefined && getTests(p + 1, vps[p].locator.slice(), p).length > 1 || vps[p].alternation != undefined))
forwardPosition = p + 1;
else
forwardPosition = seekNext(p);
}
getMaskSet()["p"] = forwardPosition; //needed for checkval
}
if (writeOut !== false) {
var self = this;
setTimeout(function () { opts.onKeyValidation.call(self, valResult, opts); }, 0);
if (getMaskSet()["writeOutBuffer"] && valResult !== false) {
var buffer = getBuffer();
writeBuffer(input, buffer, checkval ? undefined : opts.numericInput ? seekPrevious(forwardPosition) : forwardPosition);
if (checkval !== true) {
setTimeout(function () { //timeout needed for IE
if (isComplete(buffer) === true)
$input.trigger("complete");
skipInputEvent = true;
$input.trigger("input");
}, 0);
}
} else if (isSlctn) {
getMaskSet()["buffer"] = undefined;
getMaskSet()["validPositions"] = getMaskSet()["undoPositions"];
}
} else if (isSlctn) {
getMaskSet()["buffer"] = undefined;
getMaskSet()["validPositions"] = getMaskSet()["undoPositions"];
}
if (opts.showTooltip) { //update tooltip
$input.prop("title", getMaskSet()["mask"]);
}
if (e && checkval != true) {
e.preventDefault();
var currentCaretPos = caret(input);
var keypressResult = opts.onKeyPress.call(this, e, getBuffer(), currentCaretPos.begin, opts);
handleOnKeyResult(input, keypressResult, currentCaretPos);
}
}
}
}
function keyupEvent(e) {
var $input = jQuery(this), input = this, k = e.keyCode, buffer = getBuffer();
var currentCaretPos = caret(input);
var keyupResult = opts.onKeyUp.call(this, e, buffer, currentCaretPos.begin, opts);
handleOnKeyResult(input, keyupResult, currentCaretPos);
if (k == jQuery.inputmask.keyCode.TAB && opts.showMaskOnFocus) {
if ($input.is(":focus") && input._valueGet().length == 0) {
resetMaskSet();
buffer = getBuffer();
writeBuffer(input, buffer);
caret(input, 0);
valueOnFocus = getBuffer().join('');
} else {
writeBuffer(input, buffer);
caret(input, TranslatePosition(0), TranslatePosition(getMaskLength()));
}
}
}
function pasteEvent(e) {
if (skipInputEvent === true && e.type == "input") {
skipInputEvent = false;
return true;
}
var input = this, $input = jQuery(input), inputValue = input._valueGet(), caretPos = caret(input);
//paste event for IE8 and lower I guess ;-)
if (e.type == "propertychange" && input._valueGet().length <= getMaskLength()) {
return true;
} else if (e.type == "paste") {
if (window.clipboardData && window.clipboardData.getData) { // IE
inputValue = inputValue.substr(0, caretPos.begin) + window.clipboardData.getData('Text') + inputValue.substr(caretPos.end, inputValue.length);
} else if (e.originalEvent && e.originalEvent.clipboardData && e.originalEvent.clipboardData.getData) {
inputValue = inputValue.substr(0, caretPos.begin) + e.originalEvent.clipboardData.getData('text/plain') + inputValue.substr(caretPos.end, inputValue.length);;
}
}
var pasteValue = jQuery.isFunction(opts.onBeforePaste) ? (opts.onBeforePaste.call(input, inputValue, opts) || inputValue) : inputValue;
checkVal(input, true, false, isRTL ? pasteValue.split('').reverse() : pasteValue.split(''));
$input.click();
if (isComplete(getBuffer()) === true)
$input.trigger("complete");
return false;
}
function mobileInputEvent(e) {
if (skipInputEvent === true && e.type == "input") {
skipInputEvent = false;
return true;
}
var input = this;
//backspace in chrome32 only fires input event - detect & treat
var caretPos = caret(input),
currentValue = input._valueGet();
currentValue = currentValue.replace(new RegExp("(" + escapeRegex(getBufferTemplate().join('')) + ")*"), "");
//correct caretposition for chrome
if (caretPos.begin > currentValue.length) {
caret(input, currentValue.length);
caretPos = caret(input);
}
if ((getBuffer().length - currentValue.length) == 1 && currentValue.charAt(caretPos.begin) != getBuffer()[caretPos.begin]
&& currentValue.charAt(caretPos.begin + 1) != getBuffer()[caretPos.begin]
&& !isMask(caretPos.begin)) {
e.keyCode = jQuery.inputmask.keyCode.BACKSPACE;
keydownEvent.call(input, e);
}
e.preventDefault();
}
function inputFallBackEvent(e) { //fallback when keypress & compositionevents fail
if (skipInputEvent === true && e.type == "input") {
skipInputEvent = false;
return true;
}
var input = this;
checkVal(input, false, false);
var forwardPosition = getMaskSet()["p"];
writeBuffer(input, getBuffer(), opts.numericInput ? seekPrevious(forwardPosition) : forwardPosition);
if (isComplete(getBuffer()) === true)
jQuery(input).trigger("complete");
e.preventDefault();
}
function compositionupdateEvent(e) { //fix for special latin-charset FF/Linux
skipInputEvent = true; //stop inutFallback
var input = this;
setTimeout(function () {
caret(input, caret(input).begin - 1);
var keypress = jQuery.Event("keypress");
keypress.which = e.originalEvent.data.charCodeAt(0);
skipKeyPressEvent = false;
ignorable = false;
keypressEvent.call(input, keypress, undefined, undefined, false);
var forwardPosition = getMaskSet()["p"];
writeBuffer(input, getBuffer(), opts.numericInput ? seekPrevious(forwardPosition) : forwardPosition);
}, 0);
return false;
}
function mask(el) {
$el = jQuery(el);
if ($el.is(":input") && isInputTypeSupported($el.attr("type"))) {
//store tests & original buffer in the input element - used to get the unmasked value
$el.data('_inputmask', {
'maskset': maskset,
'opts': opts,
'isRTL': false
});
//show tooltip
if (opts.showTooltip) {
$el.prop("title", getMaskSet()["mask"]);
}
if (el.dir == "rtl" || opts.rightAlign)
$el.css("text-align", "right");
if (el.dir == "rtl" || opts.numericInput) {
el.dir = "ltr";
$el.removeAttr("dir");
var inputData = $el.data('_inputmask');
inputData['isRTL'] = true;
$el.data('_inputmask', inputData);
isRTL = true;
}
//unbind all events - to make sure that no other mask will interfere when re-masking
$el.unbind(".inputmask");
//bind events
$el.closest('form').bind("submit", function (e) { //trigger change on submit if any
if (valueOnFocus != getBuffer().join('')) {
$el.change();
}
if ($el[0]._valueGet && $el[0]._valueGet() == getBufferTemplate().join('')) {
$el[0]._valueSet(''); //clear masktemplete on submit and still has focus
}
if (opts.removeMaskOnSubmit) {
$el.inputmask("remove");
}
}).bind('reset', function () {
setTimeout(function () {
$el.trigger("setvalue");
}, 0);
});
$el.bind("mouseenter.inputmask", function () {
var $input = jQuery(this), input = this;
if (!$input.is(":focus") && opts.showMaskOnHover) {
if (input._valueGet() != getBuffer().join('')) {
writeBuffer(input, getBuffer());
}
}
}).bind("blur.inputmask", function () {
var $input = jQuery(this), input = this;
if ($input.data('_inputmask')) {
var nptValue = input._valueGet(), buffer = getBuffer();
firstClick = true;
if (valueOnFocus != getBuffer().join('')) {
$input.change();
valueOnFocus = getBuffer().join('');
}
if (opts.clearMaskOnLostFocus && nptValue != '') {
if (nptValue == getBufferTemplate().join(''))
input._valueSet('');
else { //clearout optional tail of the mask
clearOptionalTail(input);
}
}
if (isComplete(buffer) === false) {
$input.trigger("incomplete");
if (opts.clearIncomplete) {
resetMaskSet();
if (opts.clearMaskOnLostFocus)
input._valueSet('');
else {
buffer = getBufferTemplate().slice();
writeBuffer(input, buffer);
}
}
}
}
}).bind("focus.inputmask", function (e) {
var $input = jQuery(this), input = this, nptValue = input._valueGet();
if (opts.showMaskOnFocus && (!opts.showMaskOnHover || (opts.showMaskOnHover && nptValue == ''))) {
if (input._valueGet() != getBuffer().join('')) {
writeBuffer(input, getBuffer(), seekNext(getLastValidPosition()));
}
}
valueOnFocus = getBuffer().join('');
}).bind("mouseleave.inputmask", function () {
var $input = jQuery(this), input = this;
if (opts.clearMaskOnLostFocus) {
if (!$input.is(":focus") && input._valueGet() != $input.attr("placeholder")) {
if (input._valueGet() == getBufferTemplate().join('') || input._valueGet() == '')
input._valueSet('');
else { //clearout optional tail of the mask
clearOptionalTail(input);
}
}
}
}).bind("click.inputmask", function () {
var $input = jQuery(this), input = this;
if ($input.is(":focus")) {
var selectedCaret = caret(input);
if (selectedCaret.begin == selectedCaret.end) {
if (opts.radixFocus && opts.radixPoint != "" && jQuery.inArray(opts.radixPoint, getBuffer()) != -1 && (firstClick || getBuffer().join('') == getBufferTemplate().join(''))) {
caret(input, jQuery.inArray(opts.radixPoint, getBuffer()));
firstClick = false;
} else {
var clickPosition = isRTL ? TranslatePosition(selectedCaret.begin) : selectedCaret.begin,
lastPosition = seekNext(getLastValidPosition(clickPosition));
if (clickPosition < lastPosition) {
caret(input, isMask(clickPosition) ? clickPosition : seekNext(clickPosition));
} else {
caret(input, lastPosition);
}
}
}
}
}).bind('dblclick.inputmask', function () {
var input = this;
setTimeout(function () {
caret(input, 0, seekNext(getLastValidPosition()));
}, 0);
}).bind(PasteEventType + ".inputmask dragdrop.inputmask drop.inputmask", pasteEvent
).bind('setvalue.inputmask', function () {
var input = this;
checkVal(input, true, false);
valueOnFocus = getBuffer().join('');
if ((opts.clearMaskOnLostFocus || opts.clearIncomplete) && input._valueGet() == getBufferTemplate().join(''))
input._valueSet('');
}).bind('cut.inputmask', function (e) {
skipInputEvent = true; //stop inutFallback
var input = this, $input = jQuery(input), pos = caret(input);
handleRemove(input, jQuery.inputmask.keyCode.DELETE, pos);
var keypressResult = opts.onKeyPress.call(this, e, getBuffer(), getMaskSet()["p"], opts);
handleOnKeyResult(input, keypressResult, { begin: getMaskSet()["p"], end: getMaskSet()["p"] });
if (input._valueGet() == getBufferTemplate().join(''))
$input.trigger('cleared');
if (opts.showTooltip) { //update tooltip
$input.prop("title", getMaskSet()["mask"]);
}
}).bind('complete.inputmask', opts.oncomplete
).bind('incomplete.inputmask', opts.onincomplete
).bind('cleared.inputmask', opts.oncleared);
$el.bind("keydown.inputmask", keydownEvent
).bind("keypress.inputmask", keypressEvent
).bind("keyup.inputmask", keyupEvent
).bind("compositionupdate.inputmask", compositionupdateEvent);
if (PasteEventType === "paste") {
$el.bind("input.inputmask", inputFallBackEvent);
}
if (android || androidfirefox || androidchrome || kindle) {
$el.unbind("input.inputmask");
$el.bind("input.inputmask", mobileInputEvent);
}
patchValueProperty(el);
//apply mask
var initialValue = jQuery.isFunction(opts.onBeforeMask) ? (opts.onBeforeMask.call(el, el._valueGet(), opts) || el._valueGet()) : el._valueGet();
checkVal(el, true, false, initialValue.split(''));
valueOnFocus = getBuffer().join('');
// Wrap document.activeElement in a try/catch block since IE9 throw "Unspecified error" if document.activeElement is undefined when we are in an IFrame.
var activeElement;
try {
activeElement = document.activeElement;
} catch (e) {
}
if (isComplete(getBuffer()) === false) {
if (opts.clearIncomplete)
resetMaskSet();
}
if (opts.clearMaskOnLostFocus) {
if (getBuffer().join('') == getBufferTemplate().join('')) {
el._valueSet('');
} else {
clearOptionalTail(el);
}
} else {
writeBuffer(el, getBuffer());
}
if (activeElement === el) { //position the caret when in focus
caret(el, seekNext(getLastValidPosition()));
}
installEventRuler(el);
}
}
//action object
if (actionObj != undefined) {
switch (actionObj["action"]) {
case "isComplete":
$el = jQuery(actionObj["el"]);
maskset = $el.data('_inputmask')['maskset'];
opts = $el.data('_inputmask')['opts'];
return isComplete(actionObj["buffer"]);
case "unmaskedvalue":
$el = actionObj["$input"];
maskset = $el.data('_inputmask')['maskset'];
opts = $el.data('_inputmask')['opts'];
isRTL = actionObj["$input"].data('_inputmask')['isRTL'];
return unmaskedvalue(actionObj["$input"]);
case "mask":
valueOnFocus = getBuffer().join('');
mask(actionObj["el"]);
break;
case "format":
$el = jQuery({});
$el.data('_inputmask', {
'maskset': maskset,
'opts': opts,
'isRTL': opts.numericInput
});
if (opts.numericInput) {
isRTL = true;
}
var valueBuffer = (jQuery.isFunction(opts.onBeforeMask) ? (opts.onBeforeMask.call($el, actionObj["value"], opts) || actionObj["value"]) : actionObj["value"]).split('');
checkVal($el, false, false, isRTL ? valueBuffer.reverse() : valueBuffer);
opts.onKeyPress.call(this, undefined, getBuffer(), 0, opts);
if (actionObj["metadata"]) {
return {
value: isRTL ? getBuffer().slice().reverse().join('') : getBuffer().join(''),
metadata: $el.inputmask("getmetadata")
}
}
return isRTL ? getBuffer().slice().reverse().join('') : getBuffer().join('');
case "isValid":
$el = jQuery({});
$el.data('_inputmask', {
'maskset': maskset,
'opts': opts,
'isRTL': opts.numericInput
});
if (opts.numericInput) {
isRTL = true;
}
var valueBuffer = actionObj["value"].split('');
checkVal($el, false, true, isRTL ? valueBuffer.reverse() : valueBuffer);
var buffer = getBuffer();
var rl = determineLastRequiredPosition(), lmib = buffer.length - 1;
for (; lmib > rl; lmib--) {
if (isMask(lmib)) break;
}
buffer.splice(rl, lmib + 1 - rl);
return isComplete(buffer) && actionObj["value"] == buffer.join('');
case "getemptymask":
$el = jQuery(actionObj["el"]);
maskset = $el.data('_inputmask')['maskset'];
opts = $el.data('_inputmask')['opts'];
return getBufferTemplate();
case "remove":
var el = actionObj["el"];
$el = jQuery(el);
maskset = $el.data('_inputmask')['maskset'];
opts = $el.data('_inputmask')['opts'];
//writeout the unmaskedvalue
el._valueSet(unmaskedvalue($el));
//unbind all events
$el.unbind(".inputmask");
//clear data
$el.removeData('_inputmask');
//restore the value property
var valueProperty;
if (Object.getOwnPropertyDescriptor)
valueProperty = Object.getOwnPropertyDescriptor(el, "value");
if (valueProperty && valueProperty.get) {
if (el._valueGet) {
Object.defineProperty(el, "value", {
get: el._valueGet,
set: el._valueSet
});
}
} else if (document.__lookupGetter__ && el.__lookupGetter__("value")) {
if (el._valueGet) {
el.__defineGetter__("value", el._valueGet);
el.__defineSetter__("value", el._valueSet);
}
}
try { //try catch needed for IE7 as it does not supports deleting fns
delete el._valueGet;
delete el._valueSet;
} catch (e) {
el._valueGet = undefined;
el._valueSet = undefined;
}
break;
case "getmetadata":
$el = jQuery(actionObj["el"]);
maskset = $el.data('_inputmask')['maskset'];
opts = $el.data('_inputmask')['opts'];
if (jQuery.isArray(maskset["metadata"])) {
//find last alternation
var alternation, lvp = getLastValidPosition();
for (var firstAlt = lvp; firstAlt >= 0; firstAlt--) {
if (getMaskSet()["validPositions"][firstAlt] && getMaskSet()["validPositions"][firstAlt].alternation != undefined) {
alternation = getMaskSet()["validPositions"][firstAlt].alternation;
break;
}
}
if (alternation != undefined) {
return maskset["metadata"][getMaskSet()["validPositions"][lvp].locator[alternation]];
} else return maskset["metadata"][0];
}
return maskset["metadata"];
}
}
}
jQuery.inputmask = {
//options default
defaults: {
placeholder: "_",
optionalmarker: { start: "[", end: "]" },
quantifiermarker: { start: "{", end: "}" },
groupmarker: { start: "(", end: ")" },
alternatormarker: "|",
escapeChar: "\\",
mask: null,
oncomplete: jQuery.noop, //executes when the mask is complete
onincomplete: jQuery.noop, //executes when the mask is incomplete and focus is lost
oncleared: jQuery.noop, //executes when the mask is cleared
repeat: 0, //repetitions of the mask: * ~ forever, otherwise specify an integer
greedy: true, //true: allocated buffer for the mask and repetitions - false: allocate only if needed
autoUnmask: false, //automatically unmask when retrieving the value with jQuery.fn.val or value if the browser supports __lookupGetter__ or getOwnPropertyDescriptor
removeMaskOnSubmit: false, //remove the mask before submitting the form.
clearMaskOnLostFocus: true,
insertMode: true, //insert the input or overwrite the input
clearIncomplete: false, //clear the incomplete input on blur
aliases: {}, //aliases definitions => see jquery.inputmask.extensions.js
alias: null,
onKeyUp: jQuery.noop, //callback to implement autocomplete on certain keys for example
onKeyPress: jQuery.noop, //callback to implement autocomplete on certain keys for example
onKeyDown: jQuery.noop, //callback to implement autocomplete on certain keys for example
onBeforeMask: undefined, //executes before masking the initial value to allow preprocessing of the initial value. args => initialValue, opts => return processedValue
onBeforePaste: undefined, //executes before masking the pasted value to allow preprocessing of the pasted value. args => pastedValue, opts => return processedValue
onUnMask: undefined, //executes after unmasking to allow postprocessing of the unmaskedvalue. args => maskedValue, unmaskedValue, opts
showMaskOnFocus: true, //show the mask-placeholder when the input has focus
showMaskOnHover: true, //show the mask-placeholder when hovering the empty input
onKeyValidation: jQuery.noop, //executes on every key-press with the result of isValid. Params: result, opts
skipOptionalPartCharacter: " ", //a character which can be used to skip an optional part of a mask
showTooltip: false, //show the activemask as tooltip
numericInput: false, //numericInput input direction style (input shifts to the left while holding the caret position)
rightAlign: false, //align to the right
//numeric basic properties
radixPoint: "", //".", // | ","
radixFocus: false, //position caret to radixpoint on initial click
//numeric basic properties
nojumps: false, //do not jump over fixed parts in the mask
nojumpsThreshold: 0, //start nojumps as of
keepStatic: undefined, //try to keep the mask static while typing. Decisions to alter the mask will be posponed if possible - undefined see auto selection for multi masks
definitions: {
'9': {
validator: "[0-9]",
cardinality: 1,
definitionSymbol: "*"
},
'a': {
validator: "[A-Za-z\u0410-\u044F\u0401\u0451\u00C0-\u00FF\u00B5]",
cardinality: 1,
definitionSymbol: "*"
},
'*': {
validator: "[0-9A-Za-z\u0410-\u044F\u0401\u0451\u00C0-\u00FF\u00B5]",
cardinality: 1
}
},
//specify keyCodes which should not be considered in the keypress event, otherwise the preventDefault will stop their default behavior especially in FF
ignorables: [8, 9, 13, 19, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 93, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123],
isComplete: undefined, //override for isComplete - args => buffer, opts - return true || false
postProcessOnBlur: undefined //do some postprocessing of the value on the blur event, this overrides the clearOptionalTail functionality, args => tmpBuffer, opts
},
keyCode: {
ALT: 18, BACKSPACE: 8, CAPS_LOCK: 20, COMMA: 188, COMMAND: 91, COMMAND_LEFT: 91, COMMAND_RIGHT: 93, CONTROL: 17, DELETE: 46, DOWN: 40, END: 35, ENTER: 13, ESCAPE: 27, HOME: 36, INSERT: 45, LEFT: 37, MENU: 93, NUMPAD_ADD: 107, NUMPAD_DECIMAL: 110, NUMPAD_DIVIDE: 111, NUMPAD_ENTER: 108,
NUMPAD_MULTIPLY: 106, NUMPAD_SUBTRACT: 109, PAGE_DOWN: 34, PAGE_UP: 33, PERIOD: 190, RIGHT: 39, SHIFT: 16, SPACE: 32, TAB: 9, UP: 38, WINDOWS: 91
},
masksCache: {},
escapeRegex: function (str) {
var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];
return str.replace(new RegExp('(\\' + specials.join('|\\') + ')', 'gim'), '\\$1');
},
format: function (value, options, metadata) {
var opts = jQuery.extend(true, {}, jQuery.inputmask.defaults, options);
resolveAlias(opts.alias, options, opts);
return maskScope({ "action": "format", "value": value, "metadata": metadata }, generateMaskSet(opts), opts);
},
isValid: function (value, options) {
var opts = jQuery.extend(true, {}, jQuery.inputmask.defaults, options);
resolveAlias(opts.alias, options, opts);
return maskScope({ "action": "isValid", "value": value }, generateMaskSet(opts), opts);
}
};
jQuery.fn.inputmask = function (fn, options, targetScope, targetData, msk) {
targetScope = targetScope || maskScope;
targetData = targetData || "_inputmask";
function importAttributeOptions(npt, opts, importedOptionsContainer) {
var $npt = jQuery(npt);
if ($npt.data("inputmask-alias")) {
resolveAlias($npt.data("inputmask-alias"), {}, opts);
}
for (var option in opts) {
var optionData = $npt.data("inputmask-" + option.toLowerCase());
if (optionData != undefined) {
if (option == "mask" && optionData.indexOf("[") == 0) {
opts[option] = optionData.replace(/[\s[\]]/g, "").split("','");
opts[option][0] = opts[option][0].replace("'", "");
opts[option][opts[option].length - 1] = opts[option][opts[option].length - 1].replace("'", "");
} else
opts[option] = typeof optionData == "boolean" ? optionData : optionData.toString();
if (importedOptionsContainer)
importedOptionsContainer[option] = opts[option];
}
}
return opts;
}
var opts = jQuery.extend(true, {}, jQuery.inputmask.defaults, options),
maskset;
if (typeof fn === "string") {
switch (fn) {
case "mask":
//resolve possible aliases given by options
resolveAlias(opts.alias, options, opts);
maskset = generateMaskSet(opts, targetScope !== maskScope);
if (maskset == undefined) { return this; }
return this.each(function () {
targetScope({ "action": "mask", "el": this }, jQuery.extend(true, {}, maskset), importAttributeOptions(this, opts));
});
case "unmaskedvalue":
var $input = jQuery(this);
if ($input.data(targetData)) {
return targetScope({ "action": "unmaskedvalue", "$input": $input });
} else return $input.val();
case "remove":
return this.each(function () {
var $input = jQuery(this);
if ($input.data(targetData)) {
targetScope({ "action": "remove", "el": this });
}
});
case "getemptymask": //return the default (empty) mask value, usefull for setting the default value in validation
if (this.data(targetData)) {
return targetScope({ "action": "getemptymask", "el": this });
}
else return "";
case "hasMaskedValue": //check wheter the returned value is masked or not; currently only works reliable when using jquery.val fn to retrieve the value
return this.data(targetData) ? !this.data(targetData)['opts'].autoUnmask : false;
case "isComplete":
if (this.data(targetData)) {
return targetScope({ "action": "isComplete", "buffer": this[0]._valueGet().split(''), "el": this });
} else return true;
case "getmetadata": //return mask metadata if exists
if (this.data(targetData)) {
return targetScope({ "action": "getmetadata", "el": this });
}
else return undefined;
case "_detectScope":
resolveAlias(opts.alias, options, opts);
if (msk != undefined && !resolveAlias(msk, options, opts) && jQuery.inArray(msk, ["mask", "unmaskedvalue", "remove", "getemptymask", "hasMaskedValue", "isComplete", "getmetadata", "_detectScope"]) == -1) {
opts.mask = msk;
}
if (jQuery.isFunction(opts.mask)) {
opts.mask = opts.mask.call(this, opts);
}
return jQuery.isArray(opts.mask);
default:
resolveAlias(opts.alias, options, opts);
//check if the fn is an alias
if (!resolveAlias(fn, options, opts)) {
//maybe fn is a mask so we try
//set mask
opts.mask = fn;
}
maskset = generateMaskSet(opts, targetScope !== maskScope);
if (maskset == undefined) { return this; }
return this.each(function () {
targetScope({ "action": "mask", "el": this }, jQuery.extend(true, {}, maskset), importAttributeOptions(this, opts));
});
}
} else if (typeof fn == "object") {
opts = jQuery.extend(true, {}, jQuery.inputmask.defaults, fn);
resolveAlias(opts.alias, fn, opts); //resolve aliases
maskset = generateMaskSet(opts, targetScope !== maskScope);
if (maskset == undefined) { return this; }
return this.each(function () {
targetScope({ "action": "mask", "el": this }, jQuery.extend(true, {}, maskset), importAttributeOptions(this, opts));
});
} else if (fn == undefined) {
//look for data-inputmask atribute - the attribute should only contain optipns
return this.each(function () {
var attrOptions = jQuery(this).attr("data-inputmask");
if (attrOptions && attrOptions != "") {
try {
attrOptions = attrOptions.replace(new RegExp("'", "g"), '"');
var dataoptions = jQuery.parseJSON("{" + attrOptions + "}");
jQuery.extend(true, dataoptions, options);
opts = jQuery.extend(true, {}, jQuery.inputmask.defaults, dataoptions);
opts = importAttributeOptions(this, opts);
resolveAlias(opts.alias, dataoptions, opts);
opts.alias = undefined;
jQuery(this).inputmask("mask", opts, targetScope);
} catch (ex) { } //need a more relax parseJSON
}
if (jQuery(this).attr("data-inputmask-mask") || jQuery(this).attr("data-inputmask-alias")) {
opts = jQuery.extend(true, {}, jQuery.inputmask.defaults, {});
var dataOptions = {};
opts = importAttributeOptions(this, opts, dataOptions);
resolveAlias(opts.alias, dataOptions, opts);
opts.alias = undefined;
jQuery(this).inputmask("mask", opts, targetScope);
}
});
}
};
}
return jQuery.fn.inputmask;
})(jQuery);
var apishopsJSONP={
    gates:[
    'http://gate1.apishops.org/single.page.ajax.php?callback=?',
    'http://template2.basing.ru/single.page.ajax.php?callback=?'],
    processes:[],
    checkInterval:0,
    results:[]
}

var apishopsFormPaths={
    rootdir:'http://apishops.github.io/apishopsForm/',
    cssdir:'css/',
    jsdir:'js/',
    giftsdir:'apishopsFormGifts/',
    callbacksdir:'apishopsFormCallback/',
    themesdir:'apishopsFormThemes/'
}

var apishopsFormEnvironment={};

var apishopsParcelParamaters={};

var apishopsFormTemplates={
    theme:{
        css:apishopsFormPaths.rootdir+apishopsFormPaths.cssdir+apishopsFormPaths.themesdir+'/%THEME%.css',
        js:apishopsFormPaths.rootdir+apishopsFormPaths.jsdir+apishopsFormPaths.themesdir+'/%THEME%%CHARSETSUFFIX%.js'
    },
    gift:{
        css:apishopsFormPaths.rootdir+apishopsFormPaths.cssdir+apishopsFormPaths.giftsdir+'/%THEME%.css',
        js:apishopsFormPaths.rootdir+apishopsFormPaths.jsdir+apishopsFormPaths.giftsdir+'/%THEME%%CHARSETSUFFIX%.js'
    },
    callback:{
        css:apishopsFormPaths.rootdir+apishopsFormPaths.cssdir+apishopsFormPaths.callbacksdir+'/%THEME%.css',
        js:apishopsFormPaths.rootdir+apishopsFormPaths.jsdir+apishopsFormPaths.callbacksdir+'/%THEME%%CHARSETSUFFIX%.js'
    },
    modal:{
        js:apishopsFormPaths.rootdir+apishopsFormPaths.jsdir+'/apishopsFormModal%CHARSETSUFFIX%.js'
    },
    quickview:{
        css:apishopsFormPaths.rootdir+apishopsFormPaths.cssdir+'/apishopsFormQuickView.css',
        js:apishopsFormPaths.rootdir+apishopsFormPaths.jsdir+'/apishopsFormQuickView%CHARSETSUFFIX%.js'
    },
    slideshow:{
        css:apishopsFormPaths.rootdir+apishopsFormPaths.cssdir+'/apishopsFormSlideshow.css',
        js:apishopsFormPaths.rootdir+apishopsFormPaths.jsdir+'/apishopsFormSlideshow%CHARSETSUFFIX%.js'
    },
    variants:{
        css:apishopsFormPaths.rootdir+apishopsFormPaths.cssdir+'/apishopsFormVariants.css',
        js:apishopsFormPaths.rootdir+apishopsFormPaths.jsdir+'/apishopsFormVariants%CHARSETSUFFIX%.js'
    }
}


function apishopsFormLoadTemplates(templates, charset, theme, successFunction){

    var templates_js_loaded=0 , css_dom_include, template_file;

    apishopsLog('Templates:'+theme+' '+templates_js_loaded+'/'+templates.length);

    for(template_no in templates){
        for(template_file_type in apishopsFormTemplates[templates[template_no]]){

            if (template_file_type=='css' && apishopsFormTemplates[templates[template_no]][template_file_type]!==true) {

                template_file=apishopsFormTemplates[templates[template_no]][template_file_type].replace("%THEME%", theme).replace("%CHARSETSUFFIX%",(charset=='utf8'?'.utf8':''));
                css_dom_include=jQuery("link[href$='"+template_file+"']").exists();

                if (!css_dom_include) {
                    jQuery('head').append(jQuery('<link rel="stylesheet" type="text/css" />').attr('href', template_file));
                }
            }

            if(apishopsFormTemplates[templates[template_no]][template_file_type]!==true)
            {
                var template_file=apishopsFormTemplates[templates[template_no]][template_file_type].replace("%THEME%", theme).replace("%CHARSETSUFFIX%",(charset=='utf8'?'.utf8':''));

                if(template_file_type=='js'){
                    jQuery.getScript(template_file).done(function( script, textStatus ) {
                        templates_js_loaded++;
                        if(templates_js_loaded==templates.length){
                            apishopsLog('Templates success:'+theme+' '+templates_js_loaded+'/'+templates.length);
                            successFunction()
                            for(template_no in templates){
                                //apishopsFormTemplates[templates[template_no]]['js']=true';
                            }
                        }
                    })
                }
            }
            else
            {
                if(template_file_type=='js')
                    templates_js_loaded++;
                if(templates_js_loaded==templates.length)
                    successFunction()
            }
        }
    }
}


function apishopsFormGetJSONP(jsonp, callBackFunction){

    clearInterval(apishopsJSONP.checkInterval);

    jsonp.processId=String.fromCharCode(65 + Math.floor(Math.random() * 26)) + _.now();

    apishopsJSONP.processes.push({jsonp:jsonp,callBackFunction:callBackFunction, processId:jsonp.processId, status:'run', retrys:0});

    apishopsLog('New process #'+jsonp.processId);

    jQuery.getJSON(apishopsJSONP.gates[0], jsonp, apishopsFormCallbackJSONP);

    apishopsJSONP.checkInterval=setInterval(function() {

            apishopsLog('Interval 5000 ms:')

            for(i in apishopsJSONP.processes){

                process=apishopsJSONP.processes[i];
                apishopsLog('Check process #'+process.processId+':');

                if (process.status=='run' && process.retrys<apishopsJSONP.gates.length){
                    apishopsLog("   Query no "+process.retrys+"("+apishopsJSONP.gates[process.retrys]+") failed");
                    process.retrys++;
                    jQuery.getJSON(apishopsJSONP.gates[process.retrys], process.jsonp, apishopsFormCallbackJSONP);
                    apishopsLog("   Sended query no "+process.retrys+"("+apishopsJSONP.gates[process.retrys]+")");
                }else if(process.status=='run'){
                    apishopsLog("   All retrys is failed "+process.retrys);
                    apishopsJSONP.processes.splice(i,1);
                }else if(process.status=='block'){
                    apishopsLog("   Process is blocked.");
                }

                if(apishopsJSONP.processes.length==0){
                    clearInterval(apishopsJSONP.checkInterval);
                }
            }

    }, 10000);
}

function apishopsFormCallbackJSONP(result){
    var processId=result.parameters.processId;
    apishopsLog('Got process #'+processId+' result:');
    for(i in apishopsJSONP.processes){
        if(apishopsJSONP.processes[i].processId==processId){
            apishopsJSONP.processes[i].status='block';
            apishopsLog('   Exec callback function');
            apishopsJSONP.processes[i].callBackFunction(result);
            apishopsLog('   Remove process from queue');
            apishopsJSONP.processes.splice(i,1);
        }
    }
    if(apishopsJSONP.processes.length==0){
        clearInterval(apishopsJSONP.checkInterval);
    }
}


var apishopsParcelParamaters={};


function apishopsFormLoadParcelParameters(params){

    apishopsFormGetJSONP(
        {
            action: "getWSPDeliveryInfo",
            count:params['count'],
            siteId: params['siteId'],
            productId: params['productId'],
            price:params['price'],
            paymentId:params['paymentId'],
            deliveryId:params['deliveryId'],
            region:params['regionId'],
            objectId:params['objectId'],
            jsonp: 'dataType',
            retrys:params['retrys'],
            charset:params['charset'],
            lang:params['lang'],
            callBackFunctionName:params['callBackFunctionName']
        },
        function(result){

            var objectId=result.parameters.objectId;
            var wpId=0;
            var siteId=result.parameters.siteId;
            var regionId=result.parameters.region;
            var productId=result.parameters.productId;
            var price=result.parameters.price;
            var retrys=result.parameters.retrys;
            var callBackFunctionName=result.parameters.callBackFunctionName;

            if(typeof apishopsParcelParamaters[siteId]=='undefined')
                apishopsParcelParamaters[siteId]={};

            if(typeof apishopsParcelParamaters[siteId][wpId]=='undefined')
                apishopsParcelParamaters[siteId][wpId]={};

            if(typeof apishopsParcelParamaters[siteId][wpId][regionId]=='undefined')
                apishopsParcelParamaters[siteId][wpId][regionId]={};

            if(typeof apishopsParcelParamaters[siteId][wpId][regionId][productId]=='undefined')
                apishopsParcelParamaters[siteId][wpId][regionId][productId]={};

            if(typeof apishopsParcelParamaters[siteId][wpId][regionId][productId][price]=='undefined')
                apishopsParcelParamaters[siteId][wpId][regionId][productId][price]={};

            if(typeof apishopsParcelParamaters[siteId][wpId][regionId][productId][price]['deliveries']=='undefined')
                apishopsParcelParamaters[siteId][wpId][regionId][productId][price]['deliveries']={};

            if(typeof apishopsParcelParamaters[siteId][wpId][regionId][productId][price]['payments']=='undefined')
                apishopsParcelParamaters[siteId][wpId][regionId][productId][price]['payments']={};

            if(typeof apishopsParcelParamaters[siteId][wpId][regionId][productId][price]['info']=='undefined')
                apishopsParcelParamaters[siteId][wpId][regionId][productId][price]['info']={};

            jQuery.each(result.data.deliveries, function () {
                apishopsParcelParamaters[siteId][wpId][regionId][productId][price]['deliveries'][this.value]=this.name;
            });

            jQuery.each(result.data.payments, function () {
                apishopsParcelParamaters[siteId][wpId][regionId][productId][price]['payments'][this.value]=this.name;
            });

            apishopsParcelParamaters[siteId][wpId][regionId][productId][price]['info'] = result.data.info;

            result.parameters['object']=jQuery('#'+result.parameters.objectId)
            result.parameters['regionId']=result.parameters.region;

            if(callBackFunctionName=='apishopsFormLoadDeliveryTypes')
                apishopsFormLoadDeliveryTypes(result.parameters);
            else if(callBackFunctionName=='apishopsFormLoadPaymentTypes')
                apishopsFormLoadPaymentTypes(result.parameters);
            else if(callBackFunctionName=='apishopsFormLoadPrice')
                apishopsFormLoadPrice(result.parameters);
         }
    );//.fail(function() {alert("Ошибка получения списка параметров заказа")});;
}




function apishopsFormLoadRegions(params){

    $object=jQuery(params['object']);
    $object.closest('.apishopsFormGroup').addClass('apishopsLoading');

    if(typeof $object.attr('id')=='undefined')
        $object.attr('id','apishopsId'+String.fromCharCode(65 + Math.floor(Math.random() * 26)) + _.now())


    apishopsFormGetJSONP(
        {
            action: "getWSPRegions",
            siteId: params['siteId'],
            productId: params['productId'],
            objectId:$object.attr('id'),
            charset:params['charset'],
            lang:params['lang'],
            jsonp: 'dataType'
        },
        function(result){

            $object=jQuery('#'+result.parameters.objectId);

            $object.append(jQuery('<option value="-1">Выберите регион доставки</option>'));

            var topRegions = [53, 421, 92, 0];
            jQuery.each(result.data, function () {
                if (jQuery.inArray(this.id, topRegions) != -1){
                    $object.append(jQuery('<option value="' + this.id + '">' + this.name + '</option>'));
                }
            });

            $object.append('<optgroup label="----------------">');

            jQuery.each(result.data, function () {
                if (jQuery.inArray(this.id, topRegions) == -1){
                    $object.append(jQuery('<option value="' + this.id + '">' + this.name + '</option>'));
                }
            });

            $object.append('</optgroup>');

            $object.closest('.apishopsFormGroup').removeClass('apishopsLoading').show();
        }
    );//.fail(function() {alert("Ошибка получения списка регионов")});
}



function apishopsFormLoadDeliveryTypes(params){

    if(params['retrys']<0){
        alert('Ошибка получения параметров доставки');
        return false;
    }

    $object=jQuery(params['object']);
    $object.closest('.apishopsFormGroup').addClass('apishopsLoading');

    if(typeof $object.attr('id') == 'undefined')
        $object.attr('id','apishopsId'+String.fromCharCode(65 + Math.floor(Math.random() * 26)) + _.now());


    try{
        $object.empty();
        $object.append(jQuery('<option value="-1">Выберите тип доставки</option>'));

        jQuery.each(apishopsParcelParamaters[params['siteId']][0][params['regionId']][params['productId']][params['price']]['info'].items, function () {
            var min = null;
            var max = null;
            jQuery.each(this.payments, function () {

                var bonus_ = 0;
                if (params['regionId'] == '0'){
                    bonus_ = 50;
                } else if (params['regionId'] != '53' && params['regionId'] != '421' && params['regionId'] != '824') {
                    if (this.paymentId == '0'){
                        bonus_ = 100;
                    }
                }
                var _sum = this.sum + bonus_;

                if (min == null || _sum < min) {
                    min = _sum;
                }
                if (max == null || _sum > max) {
                    max = _sum;
                }
            });
            if (min == max){
                $object.append(jQuery('<option value="' + this.deliveryId + '">' + apishopsParcelParamaters[params['siteId']][0][params['regionId']][params['productId']][params['price']]['deliveries'][this.deliveryId] + ' (' + Math.round(min*100)/100 + ' '+((params.lang==7)?'грн':'руб')+')' + '</option>'));
            } else {
                $object.append(jQuery('<option value="' + this.deliveryId + '">' + apishopsParcelParamaters[params['siteId']][0][params['regionId']][params['productId']][params['price']]['deliveries'][this.deliveryId] + ' (' + Math.round(min*100)/100 + ' - ' + Math.round(max*100)/100 + ' '+((params.lang==7)?'грн':'руб')+')' + '</option>'));
            }
        });

        $object.closest('.apishopsFormGroup').removeClass('apishopsLoading').show();
    }
    catch(err){
        params['retrys']=params['retrys']-1;
        params['objectId']=$object.attr('id');
        params['callBackFunctionName']='apishopsFormLoadDeliveryTypes';
        apishopsFormLoadParcelParameters(params);
    }

}




function apishopsFormLoadPaymentTypes(params){

    if(params['retrys']<0){
        alert('Ошибка получения параметров оплаты');
        return false;
    }

    $object=jQuery(params['object']);
    $object.closest('.apishopsFormGroup').addClass('apishopsLoading');

    if(typeof $object.attr('id') == 'undefined')
        $object.attr('id','apishopsId'+String.fromCharCode(65 + Math.floor(Math.random() * 26)) + _.now());


    try{
        $object.empty();
        jQuery.each(apishopsParcelParamaters[params['siteId']][0][params['regionId']][params['productId']][params['price']]['info'].items, function () {
            if (this.deliveryId == params['deliveryId']) {
                jQuery.each(this.payments, function () {
                    var bonus_ = 0;
                    if (params['regionId'] == '0'){
                        bonus_ = 50;
                    } else if (params['regionId'] != '53' && params['regionId'] != '421' && params['regionId'] != '824') {
                        if (this.paymentId == '0'){
                            bonus_ = 100;
                        }
                    }
                    $object.append(jQuery('<option value="' + this.paymentId + '" alt="' + this.sum + '" baseSum="' + this.baseSum + '" addKgSum="' + this.addKgSum + '">' + apishopsParcelParamaters[params['siteId']][0][params['regionId']][params['productId']][params['price']]['payments'][this.paymentId] + ' (доставка ' + Math.round((this.sum+bonus_)*100)/100 + ' '+((params.lang==7)?'грн':'руб')+')' + '</option>'));
                });
            }
        });
        $object.closest('.apishopsFormGroup').removeClass('apishopsLoading').show();
    }
    catch(err){
        params['retrys']=params['retrys']-1;
        params['objectId']=$object.attr('id');
        params['callBackFunctionName']='apishopsFormLoadPaymentTypes';
        apishopsFormLoadParcelParameters(params);
    }

}



function apishopsFormLoadPrice(params){


    if(params['retrys']<0){
        alert('Ошибка получения параметров цены');
        return false;
    }

    $object=jQuery(params['object']);
    $object.closest('.apishopsFormGroup').addClass('apishopsLoading');

    if(typeof $object.attr('id') == 'undefined')
        $object.attr('id','apishopsId'+String.fromCharCode(65 + Math.floor(Math.random() * 26)) + _.now());


    try{

        var count=1;
        var weight=apishopsParcelParamaters[params['siteId']][0][params['regionId']][params['productId']][params['price']]['info'].weight;
        var paySum=0;
        var baseSum=0;
        var addKgSum=0;

        jQuery.each(apishopsParcelParamaters[params['siteId']][0][params['regionId']][params['productId']][params['price']]['info'].items, function () {
            if (this.deliveryId == params['deliveryId']) {
                jQuery.each(this.payments, function () {
                    if(params['paymentId']==this.paymentId){
                        paySum=this.sum;
                        baseSum=this.baseSum;
                        addKgSum=this.addKgSum;
                    }
                });
            }
        });

        if(paySum>0){
            if(weight==null)
            {
                $object.html(Math.round(params['price']) * params['count'] + Math.round(paySum*100)/100 + ''+((params.lang==7)?'грн':'руб')+'');
            }else{
                var addKgCount = 0;
                var firstKg = false;
                var mass = parseFloat(weight) * count;
                while (mass > 0){
                    mass -= 1;
                    if (!firstKg){
                        firstKg = true;
                    } else {
                        addKgCount++;
                    }
                }
                var bonus_ = 0;
                var region = params['regionId'];
                if (region == '0'){
                    bonus_ = 50;
                } else if (region != '53' && region != '421' && region != '824') {
                    if (params['paymentId'] == '0'){
                        bonus_ = 100;
                    }
                }
                $object.html((Math.round(params['price']) * params['count'] + Math.round((baseSum + addKgCount*addKgSum)*100)/100 + bonus_) + ' '+((params.lang==7)?'грн':'руб')+'')
            }
        } else {
            alert('Параметры не выбраны');
        }
        $object.closest('.apishopsFormGroup').removeClass('apishopsLoading').show();
    }
    catch(err){
        params['retrys']=params['retrys']-1;
        params['objectId']=$object.attr('id');
        params['callBackFunctionName']='apishopsFormLoadPaymentTypes';
        apishopsFormLoadPrice(params);
    }

}

function apishopsFormIsIe () {
  var myNav = navigator.userAgent.toLowerCase();
  return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
}

function apishopsFormModalInit(apishopsFormVariableObject,parameters){

        //onclick

        /*litle hack for old css replacement*/

        var apishopsFormInclude=jQuery("link[href$='apishopsForm.css']");

        if(apishopsFormInclude.length) {
            apishopsFormInclude.attr('href','http://img.apishops.org/SinglePageWebsites/custom/css/apishopsForm.2.css');
        } else {
            jQuery('head').append(jQuery('<link rel="stylesheet" type="text/css" />').attr('href', 'http://img.apishops.org/SinglePageWebsites/custom/css/apishopsForm.2.css'));
        }

        //generate container for initiable place
        if(_.contains(parameters,'init')) {
             var apishopsFormModalInitContainer = jQuery('<some></some>');
        }

        apishopsFormLoadTemplates(_.uniq(['modal']), apishopsFormEnvironment.charset || 'utf8', 1,
            function() {

                var apishopsFormVariableModal=jQuery(apishopsFormModal).clone().appendTo('body');
                var apishopsFormVariableModalWindow=apishopsFormVariableModal.find('.apishopsModalWindow').css('z-index','3999');
                var apishopsFormVariableModalOverlay=apishopsFormVariableModal.find('.apishopsModalOverlay').css('z-index','3998');
                var apishopsFormVariableModalClose=apishopsFormVariableModal.find('.apishopsModalClose');
                var apishopsFormVariableModalClose2=apishopsFormVariableModal.find('.apishopsModalClose2');
                var apishopsFormVariableContent=apishopsFormVariableModal.find('.apishopsModalContent')
                var apishopsFormVairableHtml=jQuery('html');

                //append initiable place in modal place
                if(_.contains(parameters,'init') && apishopsFormModalInitContainer) {
                     apishopsFormVariableContent.append(apishopsFormModalInitContainer);
                }

                if(_.contains(parameters,'small')){
                    apishopsFormVariableModalWindow.addClass('apishopsModalWindowSmall');
                }
                if(_.contains(parameters,'normal')){
                    apishopsFormVariableModalWindow.addClass('apishopsModalWindowNormal');
                }
                if(_.contains(parameters,'big')){
                    apishopsFormVariableModalWindow.addClass('apishopsModalWindowBig');
                }
                if(_.contains(parameters,'hide-close2')){
                    apishopsFormVariableModalClose2.hide();
                }

                apishopsFormVariableModalClose2.find('a').html('Продолжить покупки');

                if(_.contains(parameters,'init')){
                    jQuery(apishopsFormVariableObject).bind('click', function(event){
                        event.preventDefault();
                        apishopsFormVairableHtml.addClass('apishopsModalHtml');
                        apishopsFormVariableModal.show();
                    });
                }
                else{
                    apishopsFormVairableHtml.addClass('apishopsModalHtml');
                    apishopsFormVariableModal.show();
                    apishopsFormVariableContent.html(apishopsFormVariableObject);
                }

                jQuery(apishopsFormVariableModalOverlay).bind('click', function(event){
                    if(_.contains(parameters,'init'))
                        apishopsFormVariableModal.hide();
                    else
                        apishopsFormVariableModal.remove();
                    apishopsFormVairableHtml.removeClass('apishopsModalHtml');
                });

                jQuery(apishopsFormVariableModalClose).bind('click', function(event){
                    if(_.contains(parameters,'init'))
                        apishopsFormVariableModal.hide();
                    else
                        apishopsFormVariableModal.remove();
                    apishopsFormVairableHtml.removeClass('apishopsModalHtml');
                });

                jQuery(apishopsFormVariableModalClose2).bind('click', function(event){
                    if(_.contains(parameters,'init'))
                        apishopsFormVariableModal.hide();
                    else
                        apishopsFormVariableModal.remove();
                    apishopsFormVairableHtml.removeClass('apishopsModalHtml');
                });

                if(_.contains(parameters,'init'))
                    return apishopsFormVariableContent;
                else
                    return apishopsFormVariableModalWindow;

        });

        return apishopsFormModalInitContainer;
}

/*

function apishopsFormModalInit(apishopsFormVariableObject,parameters){

        //onclick


        var apishopsFormInclude=jQuery("link[href$='apishopsForm.css']");

        if(apishopsFormInclude.length) {
            apishopsFormInclude.attr('href','http://img.apishops.org/SinglePageWebsites/custom/css/apishopsForm.2.css');
        } else {
            jQuery('head').append(jQuery('<link rel="stylesheet" type="text/css" />').attr('href', 'http://img.apishops.org/SinglePageWebsites/custom/css/apishopsForm.2.css'));
        }

        var apishopsFormVariableModal=jQuery(apishopsFormModal).clone().appendTo('body');
        var apishopsFormVariableModalWindow=apishopsFormVariableModal.find('.apishopsModalWindow').css('z-index','3999');
        var apishopsFormVariableModalOverlay=apishopsFormVariableModal.find('.apishopsModalOverlay').css('z-index','3998');
        var apishopsFormVariableModalClose=apishopsFormVariableModal.find('.apishopsModalClose');
        var apishopsFormVariableModalClose2=apishopsFormVariableModal.find('.apishopsModalClose2');
        var apishopsFormVariableContent=apishopsFormVariableModal.find('.apishopsModalContent')
        var apishopsFormVairableHtml=jQuery('html');

        if(_.contains(parameters,'small')){
            apishopsFormVariableModalWindow.addClass('apishopsModalWindowSmall');
        }
        if(_.contains(parameters,'normal')){
            apishopsFormVariableModalWindow.addClass('apishopsModalWindowNormal');
        }
        if(_.contains(parameters,'big')){
            apishopsFormVariableModalWindow.addClass('apishopsModalWindowBig');
        }
        if(_.contains(parameters,'hide-close2')){
            apishopsFormVariableModalClose2.hide();
        }

        apishopsFormVariableModalClose2.find('a').html('Продолжить покупки');

        if(_.contains(parameters,'init')){
            jQuery(apishopsFormVariableObject).bind('click', function(event){
                event.preventDefault();
                apishopsFormVairableHtml.addClass('apishopsModalHtml');
                apishopsFormVariableModal.show();
            });
        }
        else{
            apishopsFormVairableHtml.addClass('apishopsModalHtml');
            apishopsFormVariableModal.show();
            apishopsFormVariableContent.html(apishopsFormVariableObject);
        }

        jQuery(apishopsFormVariableModalOverlay).bind('click', function(event){
            if(_.contains(parameters,'init'))
                apishopsFormVariableModal.hide();
            else
                apishopsFormVariableModal.remove();
            apishopsFormVairableHtml.removeClass('apishopsModalHtml');
        });

        jQuery(apishopsFormVariableModalClose).bind('click', function(event){
            if(_.contains(parameters,'init'))
                apishopsFormVariableModal.hide();
            else
                apishopsFormVariableModal.remove();
            apishopsFormVairableHtml.removeClass('apishopsModalHtml');
        });

        jQuery(apishopsFormVariableModalClose2).bind('click', function(event){
            if(_.contains(parameters,'init'))
                apishopsFormVariableModal.hide();
            else
                apishopsFormVariableModal.remove();
            apishopsFormVairableHtml.removeClass('apishopsModalHtml');
        });

        if(_.contains(parameters,'init'))
            return apishopsFormVariableContent;
        else
            return apishopsFormVariableModalWindow;
}

 */


function apishopsFormSubmit(params){

    $object=jQuery(params['object']);
    $object.closest('.apishopsFormGroup').addClass('apishopsLoading');
    $form=jQuery(params['form']);
    $form.addClass('apishopsFormLoading').append('<div class="apishopsFormLoadingText">Отправка..</div>');

    if(typeof $object.attr('appishopsId')=='undefined')
        $object.attr('appishopsId','apishopsId'+String.fromCharCode(65 + Math.floor(Math.random() * 26)) + _.now())

    if(typeof $form.attr('appishopsId')=='undefined')
        $form.attr('appishopsId','apishopsId'+String.fromCharCode(65 + Math.floor(Math.random() * 26)) + _.now())

    if(!(typeof params['regionId']=='undefined' || typeof params['paymentId']=='undefined' || typeof params['deliveryId']=='undefined')){
        $jsonp={
                action: "submitOrder",
                objectId: $object.attr('appishopsId'),
                formId: $form.attr('appishopsId'),
                siteId: params.siteId,
                productId: params.productId,
                region: params.regionId,
                delivery: params.deliveryId,
                payment: params.paymentId,
                count: params.count,
                fio: params.fio,
                phone: params.phone,
                promocode: params.promocode,
                email: params.email,
                address: params.address,
                sourceParam: params.sourceParam,
                sourceRef: params.sourceRef,
                clientTimeZone: clientTimeZone,
                successUrl: params.successUrl,
                charset:params.charset,
                lang:params.lang
        };
    }else{
        $jsonp={
                action: "callingBack",
                objectId: $object.attr('appishopsId'),
                formId: $form.attr('appishopsId'),
                siteId: params.siteId,
                productId: params.productId,
                count: params.count,
                fio: params.fio,
                phone: params.phone,
                promocode: params.promocode,
                address: params.address,
                sourceParam: params.sourceParam,
                sourceRef: params.sourceRef,
                clientTimeZone: clientTimeZone,
                successUrl: params.successUrl,
                charset:params.charset,
                lang:params.lang,
                productVariantId:params.productVariantId || ''
        };
    }



    var objDate = new Date();
    var clientTimeZone = -objDate.getTimezoneOffset()/60;

    apishopsFormGetJSONP($jsonp,function(result){
            $object=jQuery('[appishopsId='+result.parameters.objectId+']');
            $object.closest('.apishopsFormGroup').removeClass('apishopsLoading');
            $form=jQuery('[appishopsId='+result.parameters.formId+']');
            $form.removeClass('apishopsFormLoading').find(".apishopsFormLoadingText").remove();

            if (result.data.error != null) {
                alert("Возникла ошибка при оформлении заказа.\n Пожалуйста, повторите попытку через несколько минут");
            }
            else
            {
                if(result.parameters.successUrl==false || result.parameters.successUrl=='false'){

                    jQuery('.apishopsModalClose').click();

                    if(!apishopsFormIsIe())
                    {
                        var successHtml='<h2 style="font-size: 45px;margin:0px;">Поздравляем!</h2><div>Ваш заказ #<b>'+result.data.id+'</b> принят и ожидает подтверждения.<br><div class="text">Скоро Вам позвонит оператор и уточнит все детали.<br></div><div class="merchant_grid"><div class="merchant_grid_cell"><div class="additionalProducts"></div></div><div class="merchant_grid_cell merhcnaht_grid_cell_propose"><div class="merchant_block merchant_block1"><img style="height: 35px; margin-bottom: 11px;" src="http://internetcompany.ru/data/apishops/card.png"><br><a href="https://apishops.internetcompany.ru/?id='+result.data.id+'&site_id='+result.parameters.siteId+'">Оплачивайте банковской картой и получайте <b class="bonus">5% скидку!</b><div class="button">Оплатить</div></a> </div></div>';
                        var successFilesCharsetSuffix=(result.parameters.charset=='utf8')?'.utf8':'';

                        jQuery('head').append( jQuery('<link rel="stylesheet" type="text/css" />').attr('href', 'http://img2.apishops.org/SinglePageWebsites/custom/css/apishopsAdditionalProductForm.css'));
                        jQuery('head').append( jQuery('<link rel="stylesheet" type="text/css" />').attr('href', 'http://internetcompany.ru/data/apishops/merchant.css'));

                        apishopsFormModalInit(successHtml,['big']);

                        jQuery.getScript('http://img2.apishops.org/SinglePageWebsites/custom/js/apishopsAdditionalProductForm'+successFilesCharsetSuffix+'.js').done(function( script, textStatus ) {
                            jQuery(".additionalProducts").apishopsAdditionalProductForm({siteId: result.parameters.siteId, orderId: result.data.id});
                        })

                    }else{
                        alert('Ваш заказ #<b>'+result.data.id+'</b> принят и ожидает подтверждения.<br><div class="text">Скоро Вам позвонит оператор и уточнит все детали');
                    }
                }
                else{
                    if(typeof result.parameters.isReserve == 'undefined' || result.parameters.isReserve==0){
                        var qpattern = /\?/im;
                        var amppattern = /\&/im;
                        var ipattern = /(([a-zZ-Z]+=)($|&))/im;

                        if(ipattern.test(result.parameters.successUrl))
                            result.parameters.successUrl=result.parameters.successUrl.replace(/(([a-zZ-Z]+=)($|&))/im,'$2'+result.data.id+((result.data.double ==true)?'&double=true':'')+'$3');
                        else{
                            if(!qpattern.test(result.parameters.successUrl))
                                result.parameters.successUrl=result.parameters.successUrl+'?id='+result.data.id+((result.data.double ==true)?'&double=true':'');
                            else if(!amppattern.test(result.parameters.successUrl))
                                result.parameters.successUrl=result.parameters.successUrl+'&id='+result.data.id+((result.data.double ==true)?'&double=true':'');
                        }

                        document.location.href = result.parameters.successUrl;
                    }
                    else
                        document.location.href = '/finish.html?id=' + result.data.id+((result.data.double ==true)?'&double=true':'');
                }
            }
        });
}




(function($){
    jQuery.fn.getStyleObject = function(){
        var dom = this.get(0);
        var style;
        var returns = {};
        if(window.getComputedStyle){
            var camelize = function(a,b){
                return b.toUpperCase();
            };
            style = window.getComputedStyle(dom, null);
            for(var i = 0, l = style.length; i < l; i++){
                var prop = style[i];
                var camel = prop.replace(/\-([a-z])/g, camelize);
                var val = style.getPropertyValue(prop);
                if(typeof val !== 'undefined')
                    returns[camel] = val;
            };
            return returns;
        };
        if(style = dom.currentStyle){
            for(var prop in style){
                if(typeof style[prop] !== 'undefined')
                    returns[prop] = style[prop];
            };
            return returns;
        };
        return this.css();
    }
})(jQuery);

function apishopsLog(text) {
    try {
        if (window.console && window.console.log) {
            window.console.log(text);
        }
        if (console) {
            console.log(text);
        }
    }
    catch(err) {

    }
}


(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var $, Context, Transparency, helpers, _,
__indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
_ = require('../lib/lodash.js');
helpers = require('./helpers');
Context = require('./context');
Transparency = {};
Transparency.render = function(context, models, directives, options) {
var log, _base;
if (models == null) {
models = [];
}
if (directives == null) {
directives = {};
}
if (options == null) {
options = {};
}
log = options.debug && console ? helpers.consoleLogger : helpers.nullLogger;
log("Transparency.render:", context, models, directives, options);
if (!context) {
return;
}
if (!_.isArray(models)) {
models = [models];
}
context = (_base = helpers.data(context)).context || (_base.context = new Context(context, Transparency));
return context.render(models, directives, options).el;
};
Transparency.matcher = function(element, key) {
return element.el.id === key || __indexOf.call(element.classNames, key) >= 0 || element.el.name === key || element.el.getAttribute('data-bind') === key;
};
Transparency.clone = function(node) {
return jQuery(node).clone()[0];
};
Transparency.jQueryPlugin = helpers.chainable(function(models, directives, options) {
var context, _i, _len, _results;
_results = [];
for (_i = 0, _len = this.length; _i < _len; _i++) {
context = this[_i];
_results.push(Transparency.render(context, models, directives, options));
}
return _results;
});
if ((typeof jQuery !== "undefined" && jQuery !== null) || (typeof Zepto !== "undefined" && Zepto !== null)) {
$ = jQuery || Zepto;
if ($ != null) {
jQuery.fn.render = Transparency.jQueryPlugin;
}
}
if (typeof module !== "undefined" && module !== null ? module.exports : void 0) {
module.exports = Transparency;
}
if (typeof window !== "undefined" && window !== null) {
window.Transparency = Transparency;
}
if (typeof define !== "undefined" && define !== null ? define.amd : void 0) {
define(function() {
return Transparency;
});
}
},{"../lib/lodash.js":7,"./context":3,"./helpers":5}],2:[function(require,module,exports){
var Attribute, AttributeFactory, BooleanAttribute, Class, Html, Text, helpers, _,
__hasProp = {}.hasOwnProperty,
__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
_ = require('../lib/lodash');
helpers = require('./helpers');
module.exports = AttributeFactory = {
Attributes: {},
createAttribute: function(element, name) {
var Attr;
Attr = AttributeFactory.Attributes[name] || Attribute;
return new Attr(element, name);
}
};
Attribute = (function() {
function Attribute(el, name) {
this.el = el;
this.name = name;
this.templateValue = this.el.getAttribute(this.name) || '';
}
Attribute.prototype.set = function(value) {
this.el[this.name] = value;
return this.el.setAttribute(this.name, value.toString());
};
return Attribute;
})();
BooleanAttribute = (function(_super) {
var BOOLEAN_ATTRIBUTES, name, _i, _len;
__extends(BooleanAttribute, _super);
BOOLEAN_ATTRIBUTES = ['hidden', 'async', 'defer', 'autofocus', 'formnovalidate', 'disabled', 'autofocus', 'formnovalidate', 'multiple', 'readonly', 'required', 'checked', 'scoped', 'reversed', 'selected', 'loop', 'muted', 'autoplay', 'controls', 'seamless', 'default', 'ismap', 'novalidate', 'open', 'typemustmatch', 'truespeed'];
for (_i = 0, _len = BOOLEAN_ATTRIBUTES.length; _i < _len; _i++) {
name = BOOLEAN_ATTRIBUTES[_i];
AttributeFactory.Attributes[name] = BooleanAttribute;
}
function BooleanAttribute(el, name) {
this.el = el;
this.name = name;
this.templateValue = this.el.getAttribute(this.name) || false;
}
BooleanAttribute.prototype.set = function(value) {
this.el[this.name] = value;
if (value) {
return this.el.setAttribute(this.name, this.name);
} else {
return this.el.removeAttribute(this.name);
}
};
return BooleanAttribute;
})(Attribute);
Text = (function(_super) {
__extends(Text, _super);
AttributeFactory.Attributes['text'] = Text;
function Text(el, name) {
var child;
this.el = el;
this.name = name;
this.templateValue = ((function() {
var _i, _len, _ref, _results;
_ref = this.el.childNodes;
_results = [];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
child = _ref[_i];
if (child.nodeType === helpers.TEXT_NODE) {
_results.push(child.nodeValue);
}
}
return _results;
}).call(this)).join('');
this.children = _.toArray(this.el.children);
if (!(this.textNode = this.el.firstChild)) {
this.el.appendChild(this.textNode = this.el.ownerDocument.createTextNode(''));
} else if (this.textNode.nodeType !== helpers.TEXT_NODE) {
this.textNode = this.el.insertBefore(this.el.ownerDocument.createTextNode(''), this.textNode);
}
}
Text.prototype.set = function(text) {
var child, _i, _len, _ref, _results;
while (child = this.el.firstChild) {
this.el.removeChild(child);
}
this.textNode.nodeValue = text;
this.el.appendChild(this.textNode);
_ref = this.children;
_results = [];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
child = _ref[_i];
_results.push(this.el.appendChild(child));
}
return _results;
};
return Text;
})(Attribute);
Html = (function(_super) {
__extends(Html, _super);
AttributeFactory.Attributes['html'] = Html;
function Html(el) {
this.el = el;
this.templateValue = '';
this.children = _.toArray(this.el.children);
}
Html.prototype.set = function(html) {
var child, _i, _len, _ref, _results;
while (child = this.el.firstChild) {
this.el.removeChild(child);
}
this.el.innerHTML = html + this.templateValue;
_ref = this.children;
_results = [];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
child = _ref[_i];
_results.push(this.el.appendChild(child));
}
return _results;
};
return Html;
})(Attribute);
Class = (function(_super) {
__extends(Class, _super);
AttributeFactory.Attributes['class'] = Class;
function Class(el) {
Class.__super__.constructor.call(this, el, 'class');
}
return Class;
})(Attribute);
},{"../lib/lodash":7,"./helpers":5}],3:[function(require,module,exports){
var Context, Instance, after, before, chainable, cloneNode, _ref;
_ref = require('./helpers'), before = _ref.before, after = _ref.after, chainable = _ref.chainable, cloneNode = _ref.cloneNode;
Instance = require('./instance');
module.exports = Context = (function() {
var attach, detach;
detach = chainable(function() {
this.parent = this.el.parentNode;
if (this.parent) {
this.nextSibling = this.el.nextSibling;
return this.parent.removeChild(this.el);
}
});
attach = chainable(function() {
if (this.parent) {
if (this.nextSibling) {
return this.parent.insertBefore(this.el, this.nextSibling);
} else {
return this.parent.appendChild(this.el);
}
}
});
function Context(el, Transparency) {
this.el = el;
this.Transparency = Transparency;
this.template = cloneNode(this.el);
this.instances = [new Instance(this.el, this.Transparency)];
this.instanceCache = [];
}
Context.prototype.render = before(detach)(after(attach)(chainable(function(models, directives, options) {
var children, index, instance, model, _i, _len, _results;
while (models.length < this.instances.length) {
this.instanceCache.push(this.instances.pop().remove());
}
while (models.length > this.instances.length) {
instance = this.instanceCache.pop() || new Instance(cloneNode(this.template), this.Transparency);
this.instances.push(instance.appendTo(this.el));
}
_results = [];
for (index = _i = 0, _len = models.length; _i < _len; index = ++_i) {
model = models[index];
instance = this.instances[index];
children = [];
_results.push(instance.prepare(model, children).renderValues(model, children).renderDirectives(model, index, directives).renderChildren(model, children, directives, options));
}
return _results;
})));
return Context;
})();
},{"./helpers":5,"./instance":6}],4:[function(require,module,exports){
var AttributeFactory, Checkbox, Element, ElementFactory, Input, Radio, Select, TextArea, VoidElement, helpers, _,
__hasProp = {}.hasOwnProperty,
__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
_ = require('../lib/lodash.js');
helpers = require('./helpers');
AttributeFactory = require('./attributeFactory');
module.exports = ElementFactory = {
Elements: {
input: {}
},
createElement: function(el) {
var El, name;
if ('input' === (name = el.nodeName.toLowerCase())) {
El = ElementFactory.Elements[name][el.type.toLowerCase()] || Input;
} else {
El = ElementFactory.Elements[name] || Element;
}
return new El(el);
}
};
Element = (function() {
function Element(el) {
this.el = el;
this.attributes = {};
this.childNodes = _.toArray(this.el.childNodes);
this.nodeName = this.el.nodeName.toLowerCase();
this.classNames = this.el.className.split(' ');
this.originalAttributes = {};
}
Element.prototype.empty = function() {
var child;
while (child = this.el.firstChild) {
this.el.removeChild(child);
}
return this;
};
Element.prototype.reset = function() {
var attribute, name, _ref, _results;
_ref = this.attributes;
_results = [];
for (name in _ref) {
attribute = _ref[name];
_results.push(attribute.set(attribute.templateValue));
}
return _results;
};
Element.prototype.render = function(value) {
return this.attr('text', value);
};
Element.prototype.attr = function(name, value) {
var attribute, _base;
attribute = (_base = this.attributes)[name] || (_base[name] = AttributeFactory.createAttribute(this.el, name, value));
if (value != null) {
attribute.set(value);
}
return attribute;
};
Element.prototype.renderDirectives = function(model, index, attributes) {
var directive, name, value, _results;
_results = [];
for (name in attributes) {
if (!__hasProp.call(attributes, name)) continue;
directive = attributes[name];
if (!(typeof directive === 'function')) {
continue;
}
value = directive.call(model, {
element: this.el,
index: index,
value: this.attr(name).templateValue
});
if (value != null) {
_results.push(this.attr(name, value));
} else {
_results.push(void 0);
}
}
return _results;
};
return Element;
})();
Select = (function(_super) {
__extends(Select, _super);
ElementFactory.Elements['select'] = Select;
function Select(el) {
Select.__super__.constructor.call(this, el);
this.elements = helpers.getElements(el);
}
Select.prototype.render = function(value) {
var option, _i, _len, _ref, _results;
value = value.toString();
_ref = this.elements;
_results = [];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
option = _ref[_i];
if (option.nodeName === 'option') {
_results.push(option.attr('selected', option.el.value === value));
}
}
return _results;
};
return Select;
})(Element);
VoidElement = (function(_super) {
var VOID_ELEMENTS, nodeName, _i, _len;
__extends(VoidElement, _super);
function VoidElement() {
return VoidElement.__super__.constructor.apply(this, arguments);
}
VOID_ELEMENTS = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
for (_i = 0, _len = VOID_ELEMENTS.length; _i < _len; _i++) {
nodeName = VOID_ELEMENTS[_i];
ElementFactory.Elements[nodeName] = VoidElement;
}
VoidElement.prototype.attr = function(name, value) {
if (name !== 'text' && name !== 'html') {
return VoidElement.__super__.attr.call(this, name, value);
}
};
return VoidElement;
})(Element);
Input = (function(_super) {
__extends(Input, _super);
function Input() {
return Input.__super__.constructor.apply(this, arguments);
}
Input.prototype.render = function(value) {
return this.attr('value', value);
};
return Input;
})(VoidElement);
TextArea = (function(_super) {
__extends(TextArea, _super);
function TextArea() {
return TextArea.__super__.constructor.apply(this, arguments);
}
ElementFactory.Elements['textarea'] = TextArea;
return TextArea;
})(Input);
Checkbox = (function(_super) {
__extends(Checkbox, _super);
function Checkbox() {
return Checkbox.__super__.constructor.apply(this, arguments);
}
ElementFactory.Elements['input']['checkbox'] = Checkbox;
Checkbox.prototype.render = function(value) {
return this.attr('checked', Boolean(value));
};
return Checkbox;
})(Input);
Radio = (function(_super) {
__extends(Radio, _super);
function Radio() {
return Radio.__super__.constructor.apply(this, arguments);
}
ElementFactory.Elements['input']['radio'] = Radio;
return Radio;
})(Checkbox);
},{"../lib/lodash.js":7,"./attributeFactory":2,"./helpers":5}],5:[function(require,module,exports){
var ElementFactory, expando, html5Clone, _getElements;
ElementFactory = require('./elementFactory');
exports.before = function(decorator) {
return function(method) {
return function() {
decorator.apply(this, arguments);
return method.apply(this, arguments);
};
};
};
exports.after = function(decorator) {
return function(method) {
return function() {
method.apply(this, arguments);
return decorator.apply(this, arguments);
};
};
};
exports.chainable = exports.after(function() {
return this;
});
exports.onlyWith$ = function(fn) {
if ((typeof jQuery !== "undefined" && jQuery !== null) || (typeof Zepto !== "undefined" && Zepto !== null)) {
return (function($) {
return fn(arguments);
})(jQuery || Zepto);
}
};
exports.getElements = function(el) {
var elements;
elements = [];
_getElements(el, elements);
return elements;
};
_getElements = function(template, elements) {
var child, _results;
child = template.firstChild;
_results = [];
while (child) {
if (child.nodeType === exports.ELEMENT_NODE) {
elements.push(new ElementFactory.createElement(child));
_getElements(child, elements);
}
_results.push(child = child.nextSibling);
}
return _results;
};
exports.ELEMENT_NODE = 1;
exports.TEXT_NODE = 3;
html5Clone = function() {
return document.createElement('nav').cloneNode(true).outerHTML !== '<:nav></:nav>';
};
exports.cloneNode = (typeof document === "undefined" || document === null) || html5Clone() ? function(node) {
return node.cloneNode(true);
} : function(node) {
var cloned, element, _i, _len, _ref;
cloned = Transparency.clone(node);
if (cloned.nodeType === exports.ELEMENT_NODE) {
cloned.removeAttribute(expando);
_ref = cloned.getElementsByTagName('*');
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
element = _ref[_i];
element.removeAttribute(expando);
}
}
return cloned;
};
expando = 'transparency';
exports.data = function(element) {
return element[expando] || (element[expando] = {});
};
exports.nullLogger = function() {};
exports.consoleLogger = function() {
return console.log(arguments);
};
exports.log = exports.nullLogger;
},{"./elementFactory":4}],6:[function(require,module,exports){
var Instance, chainable, helpers, _,
__hasProp = {}.hasOwnProperty;
_ = require('../lib/lodash.js');
chainable = (helpers = require('./helpers')).chainable;
module.exports = Instance = (function() {
function Instance(template, Transparency) {
this.Transparency = Transparency;
this.queryCache = {};
this.childNodes = _.toArray(template.childNodes);
this.elements = helpers.getElements(template);
}
Instance.prototype.remove = chainable(function() {
var node, _i, _len, _ref, _results;
_ref = this.childNodes;
_results = [];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
node = _ref[_i];
_results.push(node.parentNode.removeChild(node));
}
return _results;
});
Instance.prototype.appendTo = chainable(function(parent) {
var node, _i, _len, _ref, _results;
_ref = this.childNodes;
_results = [];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
node = _ref[_i];
_results.push(parent.appendChild(node));
}
return _results;
});
Instance.prototype.prepare = chainable(function(model) {
var element, _i, _len, _ref, _results;
_ref = this.elements;
_results = [];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
element = _ref[_i];
element.reset();
_results.push(helpers.data(element.el).model = model);
}
return _results;
});
Instance.prototype.renderValues = chainable(function(model, children) {
var element, key, value, _results;
if (_.isElement(model) && (element = this.elements[0])) {
return element.empty().el.appendChild(model);
} else if (typeof model === 'object') {
_results = [];
for (key in model) {
if (!__hasProp.call(model, key)) continue;
value = model[key];
if (value != null) {
if (_.isString(value) || _.isNumber(value) || _.isBoolean(value) || _.isDate(value)) {
_results.push((function() {
var _i, _len, _ref, _results1;
_ref = this.matchingElements(key);
_results1 = [];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
element = _ref[_i];
_results1.push(element.render(value));
}
return _results1;
}).call(this));
} else if (typeof value === 'object') {
_results.push(children.push(key));
} else {
_results.push(void 0);
}
}
}
return _results;
}
});
Instance.prototype.renderDirectives = chainable(function(model, index, directives) {
var attributes, element, key, _results;
_results = [];
for (key in directives) {
if (!__hasProp.call(directives, key)) continue;
attributes = directives[key];
if (!(typeof attributes === 'object')) {
continue;
}
if (typeof model !== 'object') {
model = {
value: model
};
}
_results.push((function() {
var _i, _len, _ref, _results1;
_ref = this.matchingElements(key);
_results1 = [];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
element = _ref[_i];
_results1.push(element.renderDirectives(model, index, attributes));
}
return _results1;
}).call(this));
}
return _results;
});
Instance.prototype.renderChildren = chainable(function(model, children, directives, options) {
var element, key, _i, _len, _results;
_results = [];
for (_i = 0, _len = children.length; _i < _len; _i++) {
key = children[_i];
_results.push((function() {
var _j, _len1, _ref, _results1;
_ref = this.matchingElements(key);
_results1 = [];
for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
element = _ref[_j];
_results1.push(this.Transparency.render(element.el, model[key], directives[key], options));
}
return _results1;
}).call(this));
}
return _results;
});
Instance.prototype.matchingElements = function(key) {
var el, elements, _base;
elements = (_base = this.queryCache)[key] || (_base[key] = (function() {
var _i, _len, _ref, _results;
_ref = this.elements;
_results = [];
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
el = _ref[_i];
if (this.Transparency.matcher(el, key)) {
_results.push(el);
}
}
return _results;
}).call(this));
helpers.log("Matching elements for '" + key + "':", elements);
return elements;
};
return Instance;
})();
},{"../lib/lodash.js":7,"./helpers":5}],7:[function(require,module,exports){
var _ = {};
_.toString = Object.prototype.toString;
_.toArray = function(obj) {
var arr = new Array(obj.length);
for (var i = 0; i < obj.length; i++) {
arr[i] = obj[i];
}
return arr;
};
_.isString = function(obj) { return _.toString.call(obj) == '[object String]'; };
_.isNumber = function(obj) { return _.toString.call(obj) == '[object Number]'; };
_.isArray = Array.isArray || function(obj) {
return _.toString.call(obj) === '[object Array]';
};
_.isDate = function(obj) {
return _.toString.call(obj) === '[object Date]';
};
_.isElement = function(obj) {
return !!(obj && obj.nodeType === 1);
};
_.isPlainValue = function(obj) {
var type;
type = typeof obj;
return (type !== 'object' && type !== 'function') || exports.isDate(obj);
};
_.isBoolean = function(obj) {
return obj === true || obj === false;
};
module.exports = _;
},{}]},{},[1]);
//     Underscore.js 1.7.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.7.0';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var createCallback = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  _.iteratee = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return createCallback(value, context, argCount);
    if (_.isObject(value)) return _.matches(value);
    return _.property(value);
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    if (obj == null) return obj;
    iteratee = createCallback(iteratee, context);
    var i, length = obj.length;
    if (length === +length) {
      for (i = 0; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    if (obj == null) return [];
    iteratee = _.iteratee(iteratee, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length),
        currentKey;
    for (var index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index = 0, currentKey;
    if (arguments.length < 3) {
      if (!length) throw new TypeError(reduceError);
      memo = obj[keys ? keys[index++] : index++];
    }
    for (; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== + obj.length && _.keys(obj),
        index = (keys || obj).length,
        currentKey;
    if (arguments.length < 3) {
      if (!index) throw new TypeError(reduceError);
      memo = obj[keys ? keys[--index] : --index];
    }
    while (index--) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    predicate = _.iteratee(predicate, context);
    _.some(obj, function(value, index, list) {
      if (predicate(value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    predicate = _.iteratee(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(_.iteratee(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    if (obj == null) return true;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    if (obj == null) return false;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (obj.length !== +obj.length) obj = _.values(obj);
    return _.indexOf(obj, target) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = obj && obj.length === +obj.length ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = _.iteratee(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = _.iteratee(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = low + high >>> 1;
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return obj.length === +obj.length ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = _.iteratee(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    for (var i = 0, length = input.length; i < length; i++) {
      var value = input[i];
      if (!_.isArray(value) && !_.isArguments(value)) {
        if (!strict) output.push(value);
      } else if (shallow) {
        push.apply(output, value);
      } else {
        flatten(value, shallow, strict, output);
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (array == null) return [];
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = _.iteratee(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = array.length; i < length; i++) {
      var value = array[i];
      if (isSorted) {
        if (!i || seen !== value) result.push(value);
        seen = value;
      } else if (iteratee) {
        var computed = iteratee(value, i, array);
        if (_.indexOf(seen, computed) < 0) {
          seen.push(computed);
          result.push(value);
        }
      } else if (_.indexOf(result, value) < 0) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true, []));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    if (array == null) return [];
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = array.length; i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(slice.call(arguments, 1), true, true, []);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function(array) {
    if (array == null) return [];
    var length = _.max(arguments, 'length').length;
    var results = Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var idx = array.length;
    if (typeof from == 'number') {
      idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
    }
    while (--idx >= 0) if (array[idx] === item) return idx;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var Ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    args = slice.call(arguments, 2);
    bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      Ctor.prototype = func.prototype;
      var self = new Ctor;
      Ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (_.isObject(result)) return result;
      return self;
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = hasher ? hasher.apply(this, arguments) : key;
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last > 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed before being called N times.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      } else {
        func = null;
      }
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    if (!_.isObject(obj)) return obj;
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];
      for (prop in source) {
        if (hasOwnProperty.call(source, prop)) {
            obj[prop] = source[prop];
        }
      }
    }
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj, iteratee, context) {
    var result = {}, key;
    if (obj == null) return result;
    if (_.isFunction(iteratee)) {
      iteratee = createCallback(iteratee, context);
      for (key in obj) {
        var value = obj[key];
        if (iteratee(value, key, obj)) result[key] = value;
      }
    } else {
      var keys = concat.apply([], slice.call(arguments, 1));
      obj = new Object(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        key = keys[i];
        if (key in obj) result[key] = obj[key];
      }
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(concat.apply([], slice.call(arguments, 1)), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    if (!_.isObject(obj)) return obj;
    for (var i = 1, length = arguments.length; i < length; i++) {
      var source = arguments[i];
      for (var prop in source) {
        if (obj[prop] === void 0) obj[prop] = source[prop];
      }
    }
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (
      aCtor !== bCtor &&
      // Handle Object.create(x) cases
      'constructor' in a && 'constructor' in b &&
      !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
        _.isFunction(bCtor) && bCtor instanceof bCtor)
    ) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size, result;
    // Recursively compare objects and arrays.
    if (className === '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size === b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      size = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      result = _.keys(b).length === size;
      if (result) {
        while (size--) {
          // Deep compare each member
          key = keys[size];
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around an IE 11 bug.
  if (typeof /./ !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    var pairs = _.pairs(attrs), length = pairs.length;
    return function(obj) {
      if (obj == null) return !length;
      obj = new Object(obj);
      for (var i = 0; i < length; i++) {
        var pair = pairs[i], key = pair[0];
        if (pair[1] !== obj[key] || !(key in obj)) return false;
      }
      return true;
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = createCallback(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? object[property]() : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));
