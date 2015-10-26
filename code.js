        $('#modalButton').apishopsForm({ callback:1,
            type:'modal', /*тип открытия [inline|modal]*/
            debug:false, /*отладочный режим [true|false]*/
            successUrl:false, /*url благодарственной страницы [url|false]*/
            form:'light', /*тип формы [normal|light|jquery-selector]*/
            displayed_containers:['price','name'],
            theme:theme,
            siteId:147233,
            productId:888647,
            lang:'auto',
            page:{price:'.apishopsProductPrice',oldprice:'.apishopsProductOldPrice'}
        });