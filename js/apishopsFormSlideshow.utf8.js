var apishopsFormSlideshow, apishopsFormSlideshowSlide;

apishopsFormSlideshow = "<section class=\"apishopsFormSlideshow\">\n    <ul>\n    </ul>\n    <nav>\n        <span class=\"apishopsFormSlideshowIcon apishopsFormSlideshowIconNavPrev\"></span>\n        <span class=\"apishopsFormSlideshowIcon apishopsFormSlideshowIconNavNext\"></span>\n        <span class=\"apishopsFormSlideshowIcon apishopsFormSlideshowIconNavClose\"></span>\n    </nav>\n    <div class=\"info-keys icon\">Используйте влево вправо</div>\n    <style>\n    .apishopsFormSlideLeft .apishopsFormImage::after {\n        content: \"Наведите для увеличения\" !important;\n    }\n    </style>\n</section>";

apishopsFormSlideshowSlide = "<li class='apishopsFormSlideshowSlide'>\n    <figure>\n        <figcaption>\n\n\n\n\n                <div class=\"apishopsFormSlideLeft\">\n                    <div class='apishopsFormImage'>\n\n                    </div>\n\n                    <div class='apishopsFormImagesContainer' currentLeft=0>\n                        <div class='apishopsFormImagesContainerLeft apishopsFormImagesContainerArrow' onClick='var currentLeft=parseInt($(this).parent().attr(\"currentLeft\")); currentLeft = currentLeft -98; $(this).parent().find(\".apishopsFormImagesContainerArea\").animate({scrollLeft: currentLeft}, 200); $(this).parent().attr(\"currentLeft\",currentLeft);'></div>\n                        <div class=\"apishopsFormImagesContainerArea\">\n                            <div class=\"apishopsFormImages\">\n\n                                    <div class='apishopsFormImagesImage' onmouseover=\"$(this).closest('.apishopsFormSlideLeft').find('.apishopsFormImage').attr('style',$(this).attr('style'));$(this).siblings().removeClass('apishopsFormImagesImageActive');$(this).addClass('apishopsFormImagesImageActive');\">\n                                    </div>\n\n                            </div>\n                        </div>\n                        <div class='apishopsFormImagesContainerRight apishopsFormImagesContainerArrow' onClick='var currentLeft=parseInt($(this).parent().attr(\"currentLeft\")); currentLeft = currentLeft+98; $(this).parent().find(\".apishopsFormImagesContainerArea\").animate({scrollLeft: currentLeft}, 200);  $(this).parent().attr(\"currentLeft\",currentLeft);'></div>\n                    </div>\n\n                </div>\n                <div class=\"apishopsFormSlideRight\">\n\n                    <div class=\"apishopsFormPriceBlock\">\n                        <small class='apishopsFormOldPriceBlock'>\n                            <span class='apishopsFormOldPrice'></span>\n                            <span class='apishopsFormCyr'></span>\n                        </small>\n                        <div class='apishopsFormCurrentPriceBlock'>\n                            <span class='apishopsFormCurentPrice'></span>\n                            <span class='apishopsFormCyr'> </span>\n                        </div>\n                    </div>\n\n                    <div class=\"apishopsFormName\"></div>\n                    <div class=\"apishopsFormFullDescription\"></div>\n                    <form class=\"apishopsFormOrder\">\n                        <input type=input name='phone' value='' placeholder='Ваш номер телефона' class='slidePhone'>\n                        <input type=submit value='Заказать'>\n                    </form>\n\n\n                </div>\n\n\n\n\n\n        </figcaption>\n    </figure>\n</li>";
