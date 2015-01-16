var apishopsFormThemeLight, apishopsFormThemeMore, apishopsFormThemeNormal;

apishopsFormThemeLight = "<form class='apishopsForm apishopsFormInline apishopsFormTheme0'>\n\n   <div class=\"apishopsFormTheme0____caption apishopsFormName\"  style=\"display:none\">\n      <some class=\"__NAME__\">%NAME%</some>\n   </div>\n   <div class=\"apishopsFormTheme0____img apishopsFormImage\">\n   <img class=\"__IMG__\" width=180 src=\"img/watch_img1.jpg\" alt=\"watch\"/>\n   </div>\n   <div class=\"apishopsFormTheme0____price apishopsFormPrice\"  style=\"display:none\">\n      <h3>\n         Цена:\n         <span>\n            <some  class=__OLDPRICE__>%OLDPRICE%</some>\n            <some class=__CYR__>%CYR%</some>\n         </span>\n      </h3>\n      <h4>\n         <some  class=__PRICE__>%PRICE%</some>\n         <span>\n            <some class=__CYR__>%CYR%</some>\n         </span>\n      </h4>\n   </div>\n\n<div class='apishopsFormGroup'>\n   <select name='apishopsFormCount'>\n      <option>1</option>\n      <option>2</option>\n      <option>3</option>\n      <option>4</option>\n      <option>5</option>\n   </select>\n</div>\n<div class='apishopsFormGroup'>\n<input type='text' name='apishopsFormFio' placeholder='Введите ваше имя' pattern='.{3,}'>\n</div>\n<div class='apishopsFormGroup'>\n<input type='text'  name='apishopsFormPhone' placeholder='Введите ваш номер телефона' pattern='.{3,}'>\n</div>\n<div class='apishopsFormGroup'>\n<input type='text'  name='apishopsFormAddress' placeholder='Адрес доставки' pattern='.{3,}'>\n</div>\n<div class='apishopsFormGroup'>\n<a href='#' onclick='jQuery(this).closest(\"form\").submit(); return false;' class='apishopsFormButton apishopsFormBuy underline'>\n<b>Заказать товар!</b>\n</a>\n</div>\n</form>";

apishopsFormThemeNormal = "<form id=customForm class='apishopsForm apishopsFormTheme0'>\n   <div class=\"apishopsFormTheme0____caption apishopsFormName\">\n      <some class=\"__NAME__\">%NAME%</some>\n   </div>\n   <div class=\"apishopsFormTheme0____img apishopsFormImage\"  style=\"display:none\">    <img class=\"__IMG__\" width=180 src=\"img/watch_img1.jpg\" alt=\"watch\"/>    </div>\n   <div class=\"apishopsFormTheme0____price apishopsFormPrice\"  style=\"display:none\">\n      <h3>\n         Цена:\n         <span>\n            <some  class=__OLDPRICE__>%OLDPRICE%</some>\n            <some class=__CYR__>%CYR%</some>\n         </span>\n      </h3>\n      <h4>\n         <some  class=__PRICE__>%PRICE%</some>\n         <span>\n            <some class=__CYR__>%CYR%</some>\n         </span>\n      </h4>\n   </div>\n   <div class='apishopsFormGroup apishopsFormCount'>\n      <label>Количество</label>\n      <select name='apishopsFormCount' pattern='^[1-9][0-9]*$'>\n         <option>1</option>\n         <option>2</option>\n         <option>3</option>\n         <option>4</option>\n         <option>5</option>\n      </select>\n   </div>\n\n   <div class='apishopsFormGroup apishopsFormFio'>\n   <label for='inputSuccess'> &nbsp;</label>\n   <input type='text' name='apishopsFormFio' placeholder='Введите ваше имя' pattern='.{3,}'>\n   </div>\n\n   <div class='apishopsFormGroup apishopsFormMail'>\n   <input type='text' name='apishopsFormEmail' placeholder='email@email.com' pattern='.*'>\n   </div>\n\n   <div class='apishopsFormGroup apishopsFormPhone'>\n   <input type='text' name='apishopsFormPhone' placeholder='Введите ваш номер телефона' pattern='.{3,}'>\n   </div>\n\n   <div class='apishopsFormGroup apishopsFormAddress'>\n   <input type='text' name='apishopsFormAddress' placeholder='Адрес доставки' pattern='.{3,}'>\n   </div>\n\n   <div class='apishopsFormGroup apishopsFormCity'>\n   <label>Выберите город доставки</label>\n   <select name='apishopsFormRegion' pattern='^[0-9][0-9]*$'>\n   </select>\n   </div>\n\n   <div class='apishopsFormGroup apishopsFormDelivery apishopsAnimation apishopsSlide'>\n   <label>Выберите способ доставки</label>\n   <select name='apishopsFormDelivery' pattern='^[0-9][0-9]*$'>\n   </select>\n   </div>\n\n   <div class='apishopsFormGroup apishopsFormPayment apishopsAnimation apishopsSlide'>\n   <label>Выберите способ оплаты</label>\n   <select name='apishopsFormPayment' pattern='^[0-9][0-9]*$'>         </select>\n   </div>\n\n   <div class='apishopsFormGroup apishopsFormCost apishopsAnimation apishopsSlide apishopsLoading'>\n   <label>\n   <span name='apishopsFormCost'></span>\n   </label>\n   </div>\n\n   <div class='apishopsFormGroup'>\n   <a href='#' class='apishopsFormButton apishopsFormBuy underline' onclick='jQuery(this).closest(\"form\").submit(); return false;'>              <b>Заказать товар!</b>                      </a>        </div>\n</form>";

apishopsFormThemeMore = "<a class=\"apishopsFormButton apishopsFormBuy underline\" onclick=\"return false;\" href=\"#\">\n<b>Показать другие товары</b>\n</a>";
