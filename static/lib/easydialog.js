/**
 * easyDialog v2.2
 * Url : http://stylechen.com/easydialog-v2.0.html
 * Author : chenmnkken@gmail.com
 * Date : 2012-04-22
 */
(function (win, undefined) {

    var doc = win.document,
        docElem = doc.documentElement;

    var easyDialog = function () {

        var body = doc.body,
            isIE = !-[1,],    // åˆ¤æ–­IE6/7/8 ä¸èƒ½åˆ¤æ–­IE9
            isIE6 = isIE && /msie 6/.test(navigator.userAgent.toLowerCase()), // åˆ¤æ–­IE6
            uuid = 1,
            expando = 'cache' + (+new Date() + "").slice(-8),  // ç”Ÿæˆéšæœºæ•°
            cacheData = {
                /**
                 *    1 : {
                 *        eclick : [ handler1, handler2, handler3 ];
                 *        clickHandler : function(){ //... };
                 *    }
                 */
            };

        var Dialog = function () {
        };

        Dialog.prototype = {
            // å‚æ•°è®¾ç½®
            getOptions: function (arg) {
                var i,
                    options = {},
                    // é»˜è®¤å‚æ•°
                    defaults = {
                        container: null,            // string / object   å¼¹å¤„å±‚å†…å®¹çš„idæˆ–å†…å®¹æ¨¡æ¿
                        overlay: true,            // boolean           æ˜¯å¦æ·»åŠ é®ç½©å±‚
                        drag: true,            // boolean           æ˜¯å¦ç»‘å®šæ‹–æ‹½äº‹ä»¶
                        fixed: true,            // boolean           æ˜¯å¦é™æ­¢å®šä½
                        follow: null,            // string / object   æ˜¯å¦è·Ÿéšè‡ªå®šä¹‰å…ƒç´ æ¥å®šä½
                        followX: 0,                // number            ç›¸å¯¹äºŽè‡ªå®šä¹‰å…ƒç´ çš„Xåæ ‡çš„åç§»
                        followY: 0,                // number               ç›¸å¯¹äºŽè‡ªå®šä¹‰å…ƒç´ çš„Yåæ ‡çš„åç§»
                        autoClose: 0,                // number            è‡ªåŠ¨å…³é—­å¼¹å‡ºå±‚çš„æ—¶é—´
                        lock: false,            // boolean           æ˜¯å¦å…è®¸ESCé”®æ¥å…³é—­å¼¹å‡ºå±‚
                        callback: null            // function          å…³é—­å¼¹å‡ºå±‚åŽæ‰§è¡Œçš„å›žè°ƒå‡½æ•°
                        /**
                         *  containerä¸ºobjectæ—¶çš„å‚æ•°æ ¼å¼
                         *    container : {
                         *        header : 'å¼¹å‡ºå±‚æ ‡é¢˜',
                         *        content : 'å¼¹å‡ºå±‚å†…å®¹',
                         *        yesFn : function(){},        // ç¡®å®šæŒ‰é’®çš„å›žè°ƒå‡½æ•°
                         *        noFn : function(){} / true,    // å–æ¶ˆæŒ‰é’®çš„å›žè°ƒå‡½æ•°
                         *        yesText : 'ç¡®å®š',            // ç¡®å®šæŒ‰é’®çš„æ–‡æœ¬ï¼Œé»˜è®¤ä¸ºâ€˜ç¡®å®šâ€™
                         *        noText : 'å–æ¶ˆ'             // å–æ¶ˆæŒ‰é’®çš„æ–‡æœ¬ï¼Œé»˜è®¤ä¸ºâ€˜å–æ¶ˆâ€™
                         *    }
                         */
                    };

                for (i in defaults) {
                    options[i] = arg[i] !== undefined ? arg[i] : defaults[i];
                }
                Dialog.data('options', options);
                return options;
            },

            // é˜²æ­¢IE6æ¨¡æ‹Ÿfixedæ—¶å‡ºçŽ°æŠ–åŠ¨
            setBodyBg: function () {
                if (body.currentStyle.backgroundAttachment !== 'fixed') {
                    body.style.backgroundImage = 'url(about:blank)';
                    body.style.backgroundAttachment = 'fixed';
                }
            },

            // é˜²æ­¢IE6çš„selectç©¿é€
            appendIframe: function (elem) {
                elem.innerHTML = '<iframe style="position:absolute;left:0;top:0;width:100%;height:100%;z-index:-1;border:0 none;filter:alpha(opacity=0)"></iframe>';
            },

            /**
             * è®¾ç½®å…ƒç´ è·Ÿéšå®šä½
             * @param { Object } è·Ÿéšçš„DOMå…ƒç´
             * @param { String / Object } è¢«è·Ÿéšçš„DOMå…ƒç´
             * @param { Number } ç›¸å¯¹äºŽè¢«è·Ÿéšå…ƒç´ çš„Xè½´çš„åç§»
             * @param { Number } ç›¸å¯¹äºŽè¢«è·Ÿéšå…ƒç´ çš„Yè½´çš„åç§»
             */
            setFollow: function (elem, follow, x, y) {
                follow = typeof follow === 'string' ? doc.getElementById(follow) : follow;
                var style = elem.style;
                style.position = 'absolute';
                style.left = Dialog.getOffset(follow, 'left') + x + 'px';
                style.top = Dialog.getOffset(follow, 'top') + y + 'px';
            },

            /**
             * è®¾ç½®å…ƒç´ å›ºå®š(fixed) / ç»å¯¹(absolute)å®šä½
             * @param { Object } DOMå…ƒç´
             * @param { Boolean } true : fixed, fasle : absolute
             */
            setPosition: function (elem, fixed) {
                var style = elem.style;
                style.position = isIE6 ? 'absolute' : fixed ? 'fixed' : 'absolute';
                if (fixed) {
                    if (isIE6) {
                        style.setExpression('top', 'fuckIE6=document.documentElement.scrollTop+document.documentElement.clientHeight/2+"px"');
                    } else {
                        style.top = '50%';
                    }
                    if ($(window).width() > 800) {
                        style.maxWidth = '15%';
                    } else {
                        style.maxWidth = '60%';
                    }

                } else {
                    if (isIE6) {
                        style.removeExpression('top');
                    }
                    style.top = docElem.clientHeight / 2 + Dialog.getScroll('top') + 'px';
                    style.left = docElem.clientWidth / 2 + Dialog.getScroll('left') + 'px';
                }
            },

            /**
             * åˆ›å»ºé®ç½©å±‚
             * @return { Object } é®ç½©å±‚
             */
            createOverlay: function () {
                var overlay = doc.createElement('div'),
                    style = overlay.style;

                style.cssText = 'margin:0;padding:0;border:none;width:100%;height:100%;z-index:9999;position:fixed;top:0;left:0;';

                // IE6æ¨¡æ‹Ÿfixed
                if (isIE6) {
                    body.style.height = '100%';
                    style.position = 'absolute';
                    style.setExpression('top', 'fuckIE6=document.documentElement.scrollTop+"px"');
                }

                overlay.id = 'overlay';
                return overlay;
            },

            /**
             * åˆ›å»ºå¼¹å‡ºå±‚
             * @return { Object } å¼¹å‡ºå±‚
             */
            createDialogBox: function () {
                var dialogBox = doc.createElement('div');
                dialogBox.style.cssText = 'left:0;right:0;text-align:center;margin:0 auto;padding:10px;border:none;z-index:10000;color:#fff;border-radius:4px';
                dialogBox.id = 'easyDialogBox';
                return dialogBox;
            },

            /**
             * åˆ›å»ºé»˜è®¤çš„å¼¹å‡ºå±‚å†…å®¹æ¨¡æ¿
             * @param { Object } æ¨¡æ¿å‚æ•°
             * @return { Object } å¼¹å‡ºå±‚å†…å®¹æ¨¡æ¿
             */
            createDialogWrap: function (tmpl) {
                // å¼¹å‡ºå±‚æ ‡é¢˜
                var header = tmpl.header ?
                        '<h4 class="easyDialog_title" id="easyDialogTitle">' + tmpl.header + '<a href="javascript:void(0)" title="å…³é—­çª—å£" class="close_btn" id="closeBtn">Ã—</a></h4>' :
                        '',
                    // ç¡®å®šæŒ‰é’®
                    yesBtn = typeof tmpl.yesFn === 'function' ?
                        '<button class="btn_highlight" id="easyDialogYesBtn">' + (typeof tmpl.yesText === 'string' ? tmpl.yesText : 'Confirm') + '</button>' :
                        '',
                    // å–æ¶ˆæŒ‰é’®
                    noBtn = typeof tmpl.noFn === 'function' || tmpl.noFn === true ?
                        '<button class="btn_normal" id="easyDialogNoBtn">' + (typeof tmpl.noText === 'string' ? tmpl.noText : 'å–æ¶ˆ') + '</button>' :
                        '',
                    // footer
                    footer = yesBtn === '' && noBtn === '' ? '' :
                        '<div class="easyDialog_footer">' + noBtn + yesBtn + '</div>',

                    dialogTmpl = [
                        '<div class="easyDialog_content">',
                        header,
                        '<div class="easyDialog_text" style="">' + tmpl.content + '</div>',
                        footer,
                        '</div>'
                    ].join(''),

                    dialogWrap = doc.getElementById('easyDialogWrapper'),
                    rScript = /<[\/]*script[\s\S]*?>/ig;

                if (!dialogWrap) {
                    dialogWrap = doc.createElement('div');
                    dialogWrap.id = 'easyDialogWrapper';
                    dialogWrap.className = 'easyDialog_wrapper';
                }
                dialogWrap.innerHTML = dialogTmpl.replace(rScript, '');
                return dialogWrap;
            }
        };

        /**
         * è®¾ç½®å¹¶è¿”å›žç¼“å­˜çš„æ•°æ® å…³äºŽç¼“å­˜ç³»ç»Ÿè¯¦è§ï¼šhttp://stylechen.com/cachedata.html
         * @param { String / Object } ä»»æ„å­—ç¬¦ä¸²æˆ–DOMå…ƒç´
         * @param { String } ç¼“å­˜å±žæ€§å
         * @param { Anything } ç¼“å­˜å±žæ€§å€¼
         * @return { Object }
         */
        Dialog.data = function (elem, val, data) {
            if (typeof elem === 'string') {
                if (val !== undefined) {
                    cacheData[elem] = val;
                }
                return cacheData[elem];
            } else if (typeof elem === 'object') {
                // å¦‚æžœæ˜¯windowã€documentå°†ä¸æ·»åŠ è‡ªå®šä¹‰å±žæ€§
                // windowçš„ç´¢å¼•æ˜¯0 documentç´¢å¼•ä¸º1
                var index = elem === win ? 0 :
                        elem.nodeType === 9 ? 1 :
                            elem[expando] ? elem[expando] :
                                (elem[expando] = ++uuid),

                    thisCache = cacheData[index] ? cacheData[index] : (cacheData[index] = {});

                if (data !== undefined) {
                    // å°†æ•°æ®å­˜å…¥ç¼“å­˜ä¸­
                    thisCache[val] = data;
                }
                // è¿”å›žDOMå…ƒç´ å­˜å‚¨çš„æ•°æ®
                return thisCache[val];
            }
        };

        /**
         * åˆ é™¤ç¼“å­˜
         * @param { String / Object } ä»»æ„å­—ç¬¦ä¸²æˆ–DOMå…ƒç´
         * @param { String } è¦åˆ é™¤çš„ç¼“å­˜å±žæ€§å
         */
        Dialog.removeData = function (elem, val) {
            if (typeof elem === 'string') {
                delete cacheData[elem];
            } else if (typeof elem === 'object') {
                var index = elem === win ? 0 :
                    elem.nodeType === 9 ? 1 :
                        elem[expando];

                if (index === undefined) return;
                // æ£€æµ‹å¯¹è±¡æ˜¯å¦ä¸ºç©º
                var isEmptyObject = function (obj) {
                        var name;
                        for (name in obj) {
                            return false;
                        }
                        return true;
                    },
                    // åˆ é™¤DOMå…ƒç´ æ‰€æœ‰çš„ç¼“å­˜æ•°æ®
                    delteProp = function () {
                        delete cacheData[index];
                        if (index <= 1) return;
                        try {
                            // IE8åŠæ ‡å‡†æµè§ˆå™¨å¯ä»¥ç›´æŽ¥ä½¿ç”¨deleteæ¥åˆ é™¤å±žæ€§
                            delete elem[expando];
                        } catch (e) {
                            // IE6/IE7ä½¿ç”¨removeAttributeæ–¹æ³•æ¥åˆ é™¤å±žæ€§(documentä¼šæŠ¥é”™)
                            elem.removeAttribute(expando);
                        }
                    };

                if (val) {
                    // åªåˆ é™¤æŒ‡å®šçš„æ•°æ®
                    delete cacheData[index][val];
                    if (isEmptyObject(cacheData[index])) {
                        delteProp();
                    }
                } else {
                    delteProp();
                }
            }
        };

// äº‹ä»¶å¤„ç†ç³»ç»Ÿ
        Dialog.event = {

            bind: function (elem, type, handler) {
                var events = Dialog.data(elem, 'e' + type) || Dialog.data(elem, 'e' + type, []);
                // å°†äº‹ä»¶å‡½æ•°æ·»åŠ åˆ°ç¼“å­˜ä¸­
                events.push(handler);
                // åŒä¸€äº‹ä»¶ç±»åž‹åªæ³¨å†Œä¸€æ¬¡äº‹ä»¶ï¼Œé˜²æ­¢é‡å¤æ³¨å†Œ
                if (events.length === 1) {
                    var eventHandler = this.eventHandler(elem);
                    Dialog.data(elem, type + 'Handler', eventHandler);
                    if (elem.addEventListener) {
                        elem.addEventListener(type, eventHandler, false);
                    } else if (elem.attachEvent) {
                        elem.attachEvent('on' + type, eventHandler);
                    }
                }
            },

            unbind: function (elem, type, handler) {
                var events = Dialog.data(elem, 'e' + type);
                if (!events) return;

                // å¦‚æžœæ²¡æœ‰ä¼ å…¥è¦åˆ é™¤çš„äº‹ä»¶å¤„ç†å‡½æ•°åˆ™åˆ é™¤è¯¥äº‹ä»¶ç±»åž‹çš„ç¼“å­˜
                if (!handler) {
                    events = undefined;
                }
                // å¦‚æžœæœ‰å…·ä½“çš„äº‹ä»¶å¤„ç†å‡½æ•°åˆ™åªåˆ é™¤ä¸€ä¸ª
                else {
                    for (var i = events.length - 1, fn = events[i]; i >= 0; i--) {
                        if (fn === handler) {
                            events.splice(i, 1);
                        }
                    }
                }
                // åˆ é™¤äº‹ä»¶å’Œç¼“å­˜
                if (!events || !events.length) {
                    var eventHandler = Dialog.data(elem, type + 'Handler');
                    if (elem.addEventListener) {
                        elem.removeEventListener(type, eventHandler, false);
                    } else if (elem.attachEvent) {
                        elem.detachEvent('on' + type, eventHandler);
                    }
                    Dialog.removeData(elem, type + 'Handler');
                    Dialog.removeData(elem, 'e' + type);
                }
            },

            // ä¾æ¬¡æ‰§è¡Œäº‹ä»¶ç»‘å®šçš„å‡½æ•°
            eventHandler: function (elem) {
                return function (event) {
                    event = Dialog.event.fixEvent(event || win.event);
                    var type = event.type,
                        events = Dialog.data(elem, 'e' + type);

                    for (var i = 0, handler; handler = events[i++];) {
                        if (handler.call(elem, event) === false) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }
                }
            },

            // ä¿®å¤IEæµè§ˆå™¨æ”¯æŒå¸¸è§çš„æ ‡å‡†äº‹ä»¶çš„API
            fixEvent: function (e) {
                // æ”¯æŒDOM 2çº§æ ‡å‡†äº‹ä»¶çš„æµè§ˆå™¨æ— éœ€åšä¿®å¤
                if (e.target) return e;
                var event = {}, name;
                event.target = e.srcElement || document;
                event.preventDefault = function () {
                    e.returnValue = false;
                };
                event.stopPropagation = function () {
                    e.cancelBubble = true;
                };
                // IE6/7/8åœ¨åŽŸç”Ÿçš„window.eventä¸­ç›´æŽ¥å†™å…¥è‡ªå®šä¹‰å±žæ€§
                // ä¼šå¯¼è‡´å†…å­˜æ³„æ¼ï¼Œæ‰€ä»¥é‡‡ç”¨å¤åˆ¶çš„æ–¹å¼
                for (name in e) {
                    event[name] = e[name];
                }
                return event;
            }
        };

        /**
         * é¦–å­—æ¯å¤§å†™è½¬æ¢
         * @param { String } è¦è½¬æ¢çš„å­—ç¬¦ä¸²
         * @return { String } è½¬æ¢åŽçš„å­—ç¬¦ä¸² top => Top
         */
        Dialog.capitalize = function (str) {
            var firstStr = str.charAt(0);
            return firstStr.toUpperCase() + str.replace(firstStr, '');
        };

        /**
         * èŽ·å–æ»šåŠ¨æ¡çš„ä½ç½®
         * @param { String } 'top' & 'left'
         * @return { Number }
         */
        Dialog.getScroll = function (type) {
            var upType = this.capitalize(type);
            return docElem['scroll' + upType] || body['scroll' + upType];
        };

        /**
         * èŽ·å–å…ƒç´ åœ¨é¡µé¢ä¸­çš„ä½ç½®
         * @param { Object } DOMå…ƒç´
         * @param { String } 'top' & 'left'
         * @return { Number }
         */
        Dialog.getOffset = function (elem, type) {
            var upType = this.capitalize(type),
                client = docElem['client' + upType] || body['client' + upType] || 0,
                scroll = this.getScroll(type),
                box = elem.getBoundingClientRect();

            return Math.round(box[type]) + scroll - client;
        };

        /**
         * æ‹–æ‹½æ•ˆæžœ
         * @param { Object } è§¦å‘æ‹–æ‹½çš„DOMå…ƒç´
         * @param { Object } è¦è¿›è¡Œæ‹–æ‹½çš„DOMå…ƒç´
         */
        Dialog.drag = function (target, moveElem) {
            // æ¸…é™¤æ–‡æœ¬é€‰æ‹©
            var clearSelect = 'getSelection' in win ? function () {
                    win.getSelection().removeAllRanges();
                } : function () {
                    try {
                        doc.selection.empty();
                    } catch (e) {
                    }
                    ;
                },

                self = this,
                event = self.event,
                isDown = false,
                newElem = isIE ? target : doc,
                fixed = moveElem.style.position === 'fixed',
                _fixed = Dialog.data('options').fixed;

            // mousedown
            var down = function (e) {
                isDown = true;
                var scrollTop = self.getScroll('top'),
                    scrollLeft = self.getScroll('left'),
                    edgeLeft = fixed ? 0 : scrollLeft,
                    edgeTop = fixed ? 0 : scrollTop;

                Dialog.data('dragData', {
                    x: e.clientX - self.getOffset(moveElem, 'left') + (fixed ? scrollLeft : 0),
                    y: e.clientY - self.getOffset(moveElem, 'top') + (fixed ? scrollTop : 0),
                    // è®¾ç½®ä¸Šä¸‹å·¦å³4ä¸ªä¸´ç•Œç‚¹çš„ä½ç½®
                    // å›ºå®šå®šä½çš„ä¸´ç•Œç‚¹ = å½“å‰å±çš„å®½ã€é«˜(ä¸‹ã€å³è¦å‡åŽ»å…ƒç´ æœ¬èº«çš„å®½åº¦æˆ–é«˜åº¦)
                    // ç»å¯¹å®šä½çš„ä¸´ç•Œç‚¹ = å½“å‰å±çš„å®½ã€é«˜ + æ»šåŠ¨æ¡å·èµ·éƒ¨åˆ†(ä¸‹ã€å³è¦å‡åŽ»å…ƒç´ æœ¬èº«çš„å®½åº¦æˆ–é«˜åº¦)
                    el: edgeLeft,    // å·¦ä¸´ç•Œç‚¹
                    et: edgeTop,  // ä¸Šä¸´ç•Œç‚¹
                    er: edgeLeft + docElem.clientWidth - moveElem.offsetWidth,  // å³ä¸´ç•Œç‚¹
                    eb: edgeTop + docElem.clientHeight - moveElem.offsetHeight  // ä¸‹ä¸´ç•Œç‚¹
                });

                if (isIE) {
                    // IE6å¦‚æžœæ˜¯æ¨¡æ‹Ÿfixedåœ¨mousedownçš„æ—¶å€™å…ˆåˆ é™¤æ¨¡æ‹Ÿï¼ŒèŠ‚çœæ€§èƒ½
                    if (isIE6 && _fixed) {
                        moveElem.style.removeExpression('top');
                    }
                    target.setCapture();
                }

                event.bind(newElem, 'mousemove', move);
                event.bind(newElem, 'mouseup', up);

                if (isIE) {
                    event.bind(target, 'losecapture', up);
                }

                e.stopPropagation();
                e.preventDefault();

            };

            event.bind(target, 'mousedown', down);

            // mousemove
            var move = function (e) {
                if (!isDown) return;
                clearSelect();
                var dragData = Dialog.data('dragData'),
                    left = e.clientX - dragData.x,
                    top = e.clientY - dragData.y,
                    et = dragData.et,
                    er = dragData.er,
                    eb = dragData.eb,
                    el = dragData.el,
                    style = moveElem.style;

                // è®¾ç½®ä¸Šä¸‹å·¦å³çš„ä¸´ç•Œç‚¹ä»¥é˜²æ­¢å…ƒç´ æº¢å‡ºå½“å‰å±
                style.marginLeft = style.marginTop = '0px';
                style.left = (left <= el ? el : (left >= er ? er : left)) + 'px';
                style.top = (top <= et ? et : (top >= eb ? eb : top)) + 'px';
                e.stopPropagation();
            };

            // mouseup
            var up = function (e) {
                isDown = false;
                if (isIE) {
                    event.unbind(target, 'losecapture', arguments.callee);
                }
                event.unbind(newElem, 'mousemove', move);
                event.unbind(newElem, 'mouseup', arguments.callee);
                if (isIE) {
                    target.releaseCapture();
                    // IE6å¦‚æžœæ˜¯æ¨¡æ‹Ÿfixedåœ¨mouseupçš„æ—¶å€™è¦é‡æ–°è®¾ç½®æ¨¡æ‹Ÿ
                    if (isIE6 && _fixed) {
                        var top = parseInt(moveElem.style.top) - self.getScroll('top');
                        moveElem.style.setExpression('top', "fuckIE6=document.documentElement.scrollTop+" + top + '+"px"');
                    }
                }
                e.stopPropagation();
            };
        };

        var timer,    // å®šæ—¶å™¨
            // ESCé”®å…³é—­å¼¹å‡ºå±‚
            escClose = function (e) {
                if (e.keyCode === 27) {
                    extend.close();
                }
            },
            // æ¸…é™¤å®šæ—¶å™¨
            clearTimer = function () {
                if (timer) {
                    clearTimeout(timer);
                    timer = undefined;
                }
            };

        var extend = {
            open: function () {
                var $ = new Dialog(),
                    options = $.getOptions(arguments[0] || {}),    // èŽ·å–å‚æ•°
                    event = Dialog.event,
                    docWidth = docElem.clientWidth,
                    docHeight = docElem.clientHeight,
                    self = this,
                    overlay,
                    dialogBox,
                    dialogWrap,
                    boxChild;

                clearTimer();

                // ------------------------------------------------------
                // ---------------------æ’å…¥é®ç½©å±‚-----------------------
                // ------------------------------------------------------

                // å¦‚æžœé¡µé¢ä¸­å·²ç»ç¼“å­˜é®ç½©å±‚ï¼Œç›´æŽ¥æ˜¾ç¤º
                if (options.overlay) {
                    overlay = doc.getElementById('overlay');
                    if (!overlay) {
                        overlay = $.createOverlay();
                        body.appendChild(overlay);
                        if (isIE6) {
                            $.appendIframe(overlay);
                        }
                    }
                    overlay.style.display = 'block';
                }

                if (isIE6) {
                    $.setBodyBg();
                }

                // ------------------------------------------------------
                // ---------------------æ’å…¥å¼¹å‡ºå±‚-----------------------
                // ------------------------------------------------------

                // å¦‚æžœé¡µé¢ä¸­å·²ç»ç¼“å­˜å¼¹å‡ºå±‚ï¼Œç›´æŽ¥æ˜¾ç¤º
                dialogBox = doc.getElementById('easyDialogBox');
                if (!dialogBox) {
                    dialogBox = $.createDialogBox();
                    body.appendChild(dialogBox);
                }

                if (options.follow) {
                    var follow = function () {
                        $.setFollow(dialogBox, options.follow, options.followX, options.followY);
                    };

                    follow();
                    event.bind(win, 'resize', follow);
                    Dialog.data('follow', follow);
                    if (overlay) {
                        overlay.style.display = 'none';
                    }
                    options.fixed = false;
                } else {
                    $.setPosition(dialogBox, options.fixed);
                }
                dialogBox.style.display = 'block';

                // ------------------------------------------------------
                // -------------------æ’å…¥å¼¹å‡ºå±‚å†…å®¹---------------------
                // ------------------------------------------------------

                // åˆ¤æ–­å¼¹å‡ºå±‚å†…å®¹æ˜¯å¦å·²ç»ç¼“å­˜è¿‡
                dialogWrap = typeof options.container === 'string' ?
                    doc.getElementById(options.container) :
                    $.createDialogWrap(options.container);

                boxChild = dialogBox.getElementsByTagName('*')[0];

                if (!boxChild) {
                    dialogBox.appendChild(dialogWrap);
                } else if (boxChild && dialogWrap !== boxChild) {
                    boxChild.style.display = 'none';
                    body.appendChild(boxChild);
                    dialogBox.appendChild(dialogWrap);
                }

                dialogWrap.style.display = 'block';

                var eWidth = dialogWrap.offsetWidth,
                    eHeight = dialogWrap.offsetHeight,
                    widthOverflow = eWidth > docWidth,
                    heigthOverflow = eHeight > docHeight;

                // å¼ºåˆ¶åŽ»æŽ‰è‡ªå®šä¹‰å¼¹å‡ºå±‚å†…å®¹çš„margin
                dialogWrap.style.marginTop = dialogWrap.style.marginRight = dialogWrap.style.marginBottom = dialogWrap.style.marginLeft = '0px';

                // å±…ä¸­å®šä½
                if (!options.follow) {
                    // dialogBox.style.marginLeft = '-' + (widthOverflow ? docWidth/2 : eWidth/2) + 'px';
                    // dialogBox.style.marginTop = '-' + (heigthOverflow ? docHeight/2 : eHeight/2) + 'px';
                } else {
                    dialogBox.style.marginLeft = dialogBox.style.marginTop = '0px';
                }

                // é˜²æ­¢selectç©¿é€å›ºå®šå®½åº¦å’Œé«˜åº¦
                if (isIE6 && !options.overlay) {
                    dialogBox.style.width = eWidth + 'px';
                    dialogBox.style.height = eHeight + 'px';
                }

                // ------------------------------------------------------
                // --------------------ç»‘å®šç›¸å…³äº‹ä»¶----------------------
                // ------------------------------------------------------
                var closeBtn = doc.getElementById('closeBtn'),
                    dialogTitle = doc.getElementById('easyDialogTitle'),
                    dialogYesBtn = doc.getElementById('easyDialogYesBtn'),
                    dialogNoBtn = doc.getElementById('easyDialogNoBtn');

                // ç»‘å®šç¡®å®šæŒ‰é’®çš„å›žè°ƒå‡½æ•°
                if (dialogYesBtn) {
                    event.bind(dialogYesBtn, 'click', function (event) {
                        if (options.container.yesFn.call(self, event) !== false) {
                            self.close();
                        }
                    });
                }

                // ç»‘å®šå–æ¶ˆæŒ‰é’®çš„å›žè°ƒå‡½æ•°
                if (dialogNoBtn) {
                    var noCallback = function (event) {
                        if (options.container.noFn === true || options.container.noFn.call(self, event) !== false) {
                            self.close();
                        }
                    };
                    event.bind(dialogNoBtn, 'click', noCallback);
                    // å¦‚æžœå–æ¶ˆæŒ‰é’®æœ‰å›žè°ƒå‡½æ•° å…³é—­æŒ‰é’®ä¹Ÿç»‘å®šåŒæ ·çš„å›žè°ƒå‡½æ•°
                    if (closeBtn) {
                        event.bind(closeBtn, 'click', noCallback);
                    }
                }
                // å…³é—­æŒ‰é’®ç»‘å®šäº‹ä»¶
                else if (closeBtn) {
                    event.bind(closeBtn, 'click', self.close);
                }

                // ESCé”®å…³é—­å¼¹å‡ºå±‚
                if (!options.lock) {
                    event.bind(doc, 'keyup', escClose);
                }
                // è‡ªåŠ¨å…³é—­å¼¹å‡ºå±‚
                if (options.autoClose && typeof options.autoClose === 'number') {
                    timer = setTimeout(self.close, options.autoClose);
                }
                // ç»‘å®šæ‹–æ‹½(å¦‚æžœå¼¹å‡ºå±‚å†…å®¹çš„å®½åº¦æˆ–é«˜åº¦æº¢å‡ºå°†ä¸ç»‘å®šæ‹–æ‹½)
                if (options.drag && dialogTitle && !widthOverflow && !heigthOverflow) {
                    dialogTitle.style.cursor = 'move';
                    Dialog.drag(dialogTitle, dialogBox);
                }

                // ç¡®ä¿å¼¹å‡ºå±‚ç»å¯¹å®šä½æ—¶æ”¾å¤§ç¼©å°çª—å£ä¹Ÿå¯ä»¥åž‚ç›´å±…ä¸­æ˜¾ç¤º

                if (!options.follow && !options.fixed) {
                    var resize = function () {
                        $.setPosition(dialogBox, false);
                    };
                    // å¦‚æžœå¼¹å‡ºå±‚å†…å®¹çš„å®½åº¦æˆ–é«˜åº¦æº¢å‡ºå°†ä¸ç»‘å®šresizeäº‹ä»¶
                    if (!widthOverflow && !heigthOverflow) {
                        event.bind(win, 'resize', resize);
                    }
                    Dialog.data('resize', resize);
                }

                // ç¼“å­˜ç›¸å…³å…ƒç´ ä»¥ä¾¿å…³é—­å¼¹å‡ºå±‚çš„æ—¶å€™è¿›è¡Œæ“ä½œ
                Dialog.data('dialogElements', {
                    overlay: overlay,
                    dialogBox: dialogBox,
                    closeBtn: closeBtn,
                    dialogTitle: dialogTitle,
                    dialogYesBtn: dialogYesBtn,
                    dialogNoBtn: dialogNoBtn
                });
            },

            close: function () {
                var options = Dialog.data('options'),
                    elements = Dialog.data('dialogElements'),
                    event = Dialog.event;

                clearTimer();
                //    éšè—é®ç½©å±‚
                if (options.overlay && elements.overlay) {
                    elements.overlay.style.display = 'none';
                }
                // éšè—å¼¹å‡ºå±‚
                elements.dialogBox.style.display = 'none';
                // IE6æ¸…é™¤CSSè¡¨è¾¾å¼
                if (isIE6) {
                    elements.dialogBox.style.removeExpression('top');
                }

                // ------------------------------------------------------
                // --------------------åˆ é™¤ç›¸å…³äº‹ä»¶----------------------
                // ------------------------------------------------------
                if (elements.closeBtn) {
                    event.unbind(elements.closeBtn, 'click');
                }

                if (elements.dialogTitle) {
                    event.unbind(elements.dialogTitle, 'mousedown');
                }

                if (elements.dialogYesBtn) {
                    event.unbind(elements.dialogYesBtn, 'click');
                }

                if (elements.dialogNoBtn) {
                    event.unbind(elements.dialogNoBtn, 'click');
                }

                if (!options.follow && !options.fixed) {
                    event.unbind(win, 'resize', Dialog.data('resize'));
                    Dialog.removeData('resize');
                }

                if (options.follow) {
                    event.unbind(win, 'resize', Dialog.data('follow'));
                    Dialog.removeData('follow');
                }

                if (!options.lock) {
                    event.unbind(doc, 'keyup', escClose);
                }
                // æ‰§è¡Œcallback
                if (typeof options.callback === 'function') {
                    options.callback.call(extend);
                }
                // æ¸…é™¤ç¼“å­˜
                Dialog.removeData('options');
                Dialog.removeData('dialogElements');
            }
        };

        return extend;

    };

// ------------------------------------------------------
// ---------------------DOMåŠ è½½æ¨¡å—----------------------
// ------------------------------------------------------
    var loaded = function () {
            win.easyDialog = easyDialog();
        },

        doScrollCheck = function () {
            if (doc.body) return;

            try {
                docElem.doScroll("left");
            } catch (e) {
                setTimeout(doScrollCheck, 1);
                return;
            }
            loaded();
        };

    (function () {
        if (doc.body) {
            loaded();
        } else {
            if (doc.addEventListener) {
                doc.addEventListener('DOMContentLoaded', function () {
                    doc.removeEventListener('DOMContentLoaded', arguments.callee, false);
                    loaded();
                }, false);
                win.addEventListener('load', loaded, false);
            } else if (doc.attachEvent) {
                doc.attachEvent('onreadystatechange', function () {
                    if (doc.readyState === 'complete') {
                        doc.detachEvent('onreadystatechange', arguments.callee);
                        loaded();
                    }
                });
                win.attachEvent('onload', loaded);
                var toplevel = false;
                try {
                    toplevel = win.frameElement == null;
                } catch (e) {
                }

                if (docElem.doScroll && toplevel) {
                    doScrollCheck();
                }
            }
        }
    })();

})(window, undefined);

// 2012-04-12 ä¿®å¤è·Ÿéšå®šä½ç¼©æ”¾æµè§ˆå™¨æ—¶æ— æ³•ç»§ç»­è·Ÿéšçš„BUG
// 2012-04-22 ä¿®å¤å¼¹å‡ºå±‚å†…å®¹çš„å°ºå¯¸å¤§äºŽæµè§ˆå™¨å½“å‰å±å°ºå¯¸çš„BUG