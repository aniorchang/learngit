/**
 * Created by SN on 2017/2/17.
 */

(function (window) {
    var arr = [],
        push = arr.push,
        slice = arr.slice;

    function Anior(html) {
        return new Anior.fn.init(html);
    }

    Anior.fn = Anior.prototype = {
        constructor: Anior,

        length: 0,

        init: function (html) {
            if (html == null || html === '') {
                // 结束
                return;
            }
            if (typeof html === 'function') {
                //如果是一个函数，那么就将函数绑定到onload上并返回
                //onload = html

                //判断是否已经有函数
                var oldFn = onload;
                if (typeof oldFn === 'function') {
                    onload = function () {
                        oldFn();
                        html();
                    };
                } else {
                    onload = html;
                }
                return;
            }

            if (Anior.isString(html)) {
                if (/^</.test(html)) {
                    push.apply(this, parseHTML(html));
                } else {
                    // 选择器
                    // select( html );
                    push.apply(this, Anior.select(html));
                    this.selector = html;
                }

            }
            if (html && html.type === 'Anior') {
                // 是一个 Anior 对象
                // 将传入的 Anior 对象所有的元素都加到 this 中
                push.apply(this, html);
                this.selector = html.selector;
                this.events = html.events;
            }

            //判断是不是一个DOM对象
            if (html.nodeType) {
                //this[0] = html;
                //this.length = 1;
                push.call(this, html)
            }

            this.events = {};

        },

        selector: '',//用来表示使用了选择器

        type: 'Anior',

    };
    Anior.fn.events = {};

    Anior.fn.init.prototype = Anior.fn;

    // 添加可扩展的方法 extend
    Anior.extend = Anior.fn.extend = function (obj) {
        for (var k in obj) {
            // if ( k 是 obj 自己提供的方法 ) obj.hasOwnProperty( k )
            this[k] = obj[k];
        }
    }


    //select引擎
    var select =
        (function () {
            var push = [].push;//方便书写


            try {
                var div = document.createElement("div");//创建一个div
                div.innerHTML = '<p></p>';//给div添加p标签
                var arr = [];//定义一个新数组
                push.apply(arr, div.getElementsByTagName('p'));//将新增的p添加到arr中
            } catch (e) {
                push = {
                    apply: function (array1, array2) {
                        //将array2循环遍历到array1后
                        for (var i = 0; i < array2.length; i++) {
                            array1[array1.length++] = array2[i];//length需要++防止特殊情况
                        }
                    }
                };
            }

            // 正则表达式
            var rnative = /\{\s*\[native/;
            var rtrim = /^\s+|\s+$/g;
            var rbaseselector = /^(?:\#([\w\-]+)|\.([\w\-]+)|(\*)|(\w+))$/;


            //基本函数support对象
            var support = {};//定义一个对象
            support.qsa = rnative.test(document.querySelectorAll + '');
            support.getElementsByClassName = rnative.test(document.getElementsByClassName + '');
            support.trim = rnative.test(String.prototype.trim + '');
            support.indexOf = rnative.test(Array.prototype.indexOf + '');


            //基本方法
            function getByClassName(className, node) {
                node = node || document;
                var allElem, res = [], i;

                if (support.getElementsByClassName) {
                    return node.getElementsByClassName(className);
                } else {
                    allElem = node.getElementsByTagName("*");
                    for (var i = 0; i < allElem.length; i++) {
                        if (allElem[i].className === className) {
                            res.push(allElem[i]);
                        }
                    }
                    return res;
                }
            }

            //自定义实现trim方法
            var myTrim = function (str) {
                if (support.trim) {
                    //如果系统中有trim方法，则直接调用该方法并返回
                    return str.trim;
                } else {
                    //如果系统没有trim方法，就自定义实现该方法
                    return str.replace(rtrim, '');
                }
            }

            var myIndexOf = function (array, search, startIndex) {
                startIndex = startIndex || 0;
                if (support.index) {
                    //如果系统中有indexOf方法，则直接调用该方法并返回
                    return array.indexOf(search, startIndex);
                } else {
                    //如果系统没有indexOf方法，就自定义实现该方法
                    for (var i = startIndex; i < array.length; i++) {
                        if (array[i] === search) {
                            return i;
                        }
                    }
                    return -1;
                }
            }

            var unique = function (array) {
                var resArray = [], i = 0;
                for (; i < array.length; i++) {
                    if (myIndexOf(resArray, array[i]) == -1) {
                        resArray.push(array[i]);
                    }
                }
                return resArray;
            }

            function basicSelect(selector, node) {
                node = node || document;
                var m, res;
                //根据之前的正则表达式获得的数组来进行分类判断
                if (m = rbaseselector.exec(selector)) {
                    if (m[1]) { // id
                        res = document.getElementById(m[1]);
                        if (res) {
                            return [res];
                        } else {
                            return [];
                        }
                    } else if (m[2]) {//class
                        return getByClassName(m[2], node);
                    } else {
                        //m[3]和m[4]合并
                        return node.getElementsByTagName(selector);
                    }
                }
                return [];
            }

            function select2(selector, results) {

                results = results || [];

                var selectors = selector.split(' ');

                // 假定 'div p .c'

                var arr = [], node = [document];


                for (var j = 0; j < selectors.length; j++) {
                    for (var i = 0; i < node.length; i++) {
                        push.apply(arr, basicSelect(selectors[j], node[i]));
                    }
                    node = arr;
                    arr = [];
                }

                push.apply(results, node);
                return results;

            }

            function select(selector, results) {
                results = results || [];
                var m, temp, selectors, i, subselector;

                if (typeof selector != 'string') return results;

                // 表明参数都没有问题, 接下来就是如何选择
                // 首先判断 qsa 是否可用
                // 然后再 一步步的 自己实现
                if (support.qsa) {
                    push.apply(results, document.querySelectorAll(selector));
                } else {
                    // 不存在再来考虑自己实现
                    selectors = selector.split(',');
                    // 循环
                    for (i = 0; i < selectors.length; i++) {
                        subselector = myTrim(selectors[i]);
                        // 接下来就是 处理 subselector
                        if (rbaseselector.test(subselector)) {
                            // 基本选择器
                            push.apply(results, basicSelect(subselector));
                        } else {
                            // select2 函数
                            select2(subselector, results);
                        }
                    }
                }
                // 返回 result
                return unique(results);
            }


            return select;
        })();


    Anior.select = select;   // 在需要的时候 可以使用第三方的 选择器引擎

// 需要一些判断的方法
    Anior.extend({
        isString: function (data) {
            return typeof data === 'string';
        },
        isFunction: function (data) {
            return typeof data === 'function';
        },
        isDom: function (data) {
            return !!data.nodeType;
        },
        getStyle: function (o, name) {
            if (o.currentStyle) {
                return o.currentStyle[name];
            } else {
                return window.getComputedStyle(o)[name];
            }
        }


    });

// DOM 操作的方法
// 将字符串转换为 DOM 对象的函数
    var parseHTML = (function () {
        var div = document.createElement('div');

        function parseHTML(html) {
            div.innerHTML = html;
            var res = [];
            for (var i = 0; i < div.childNodes.length; i++) {
                res.push(div.childNodes[i]);
            }
            div.innerHTML = '';
            return res;
        }

        return parseHTML;
    })();

    Anior.extend({
        //添加静态方法each和map
        each: function (arr, func) {
            var i;
            // 在 ES5 中还引入了 Array.isArray 的方法专门来判断数组
            if (arr instanceof Array || arr.length >= 0) {
                for (i = 0; i < arr.length; i++) {
                    func.call(arr[i], i, arr[i]);
                }
            } else {
                for (i in arr) {
                    func.call(arr[i], i, arr[i]);
                }
            }
            return arr;
        },

        map: function (arr, func) {
            var i, res = [], tmp;
            if (arr instanceof Array || arr.length >= 0) {
                for (i = 0; i < arr.length; i++) {
                    tmp = func(arr[i], i);
                    if (tmp != null) {
                        res.push(tmp);
                    }
                }
            } else {
                for (i in arr) {
                    tmp = func(arr[i], i);
                    if (tmp != null) {
                        res.push(tmp);
                    }
                }
            }
            return res;
        },
        prependChild: function (parent, element) {
            parent.insertBefore(element, parent.firstChild);
        }
    })


    Anior.fn.extend({
        //添加核心方法
        //此刻this代表根据原型创建出来的实例

        //appendTo 方法的实现


        /*appendTo: function (dom) {
         for (var i = 0; i < this.length; i++) {
         dom.appendChild(this[i]);
         }
         },*/

        /*
         appendTo: function (selector) {
         var iObj = this.constructor(selector);
         //将 this[i] 添加到 iObj[0] 中
         for (var i = 0; i < this.length; i++) {
         iObj[ 0 ].appendChild( this[i] );
         }
         }
         */


        // 改进
        /*
         appendTo: function (selector) {
         var iObj = this.constructor(selector);
         // 将 this[i] 添加到 iObj[j] 中
         for (var i = 0; i < this.length; i++) {
         for(var j = 0 ; j < iObj.length ; j++){
         iObj[j].appendChild(this[i].cloneNode(true));
         // 但此时会多出一个this[i]，所以还需要改进，最后一个不需要克隆
         }
         }
         }
         */


        // 再次改进
        /*
         // 最后一次将this[i]本体添加到iObj[j]中
         // 也就是最后一次不克隆
         appendTo: function (selector) {
         var iObj = this.constructor(selector);
         //将 this[i] 添加到 iObj[j] 中
         for (var i = 0; i < this.length; i++) {
         for (var j = 0; j < iObj.length; j++) {

         // 三元表达式的方法书写
         iObj[j].appendChild(
         j == iObj.length - 1    //判断条件
         ? this[i]    //判断条件成立时执行的代码
         : this[i].cloneNode(true)    //判断条件不成立是执行的代码
         );
         // 判断是最后一次的方法就是 j==iObj.length-1

         //if else 的方法书写
         /!*
         if (j == iObj.length - 1) {
         iObj[j].appendChild( this[i] );
         }else{
         iObj[j].appendChild(this[i].cloneNode(true));
         }
         *!/
         }
         }
         },
         */

        //完整版
        appendTo: function (selector) {
            var iObj = this.constructor(selector);
            var newObj = this.constructor();
            for (var i = 0; i < this.length; i++) {
                for (var j = 0; j < iObj.length; j++) {
                    var temp =
                        i == this.length - 1 && j == iObj.length - 1
                            ? this[i]
                            : this[i].cloneNode(true);

                    [].push.call(newObj, temp);
                    iObj[j].appendChild(temp);
                }
            }
            return newObj;
        },

        append: function (selector) {
            var iObj = this.constructor(selector);
            for (var i = 0; i < iObj.length; i++) {
                for (var j = 0; j < this.length; j++) {
                    var temp = i == iObj.length - 1 && j == this.length - 1
                        ? iObj[i]
                        : iObj[i].cloneNode(true);
                    this[j].appendChild(temp);
                }
            }

            //另一种写法
            /*
             this.constructor(selector).appendTo(this);
             */

            return this;
        },

        //prependTo 方法的实现

        prependTo: function (selector) {
            var iObj = this.constructor(selector);
            var newObj = this.constructor();
            for (var i = 0; i < this.length; i++) {
                for (var j = 0; j < iObj.length; j++) {
                    var temp =
                        i == this.length - 1 && j == iObj.length - 1
                            ? this[i]
                            : this[i].cloneNode(true);

                    [].push.call(newObj, temp);
                    Anior.prependChild(iObj[j], temp);
                }
            }
            return newObj;
        },


        //toArray 方法的实现
        //将Anior对象转化为一个DOM数组

        toArray: function () {
            //arr.slice(0)表示从第0个元素开始截取数组，即拷贝数组
            return slice.call(this, 0);//这里的slice经过上面的操作，slice = [].slice
        },

        //或者用自定义的方法，如下:

        /*var res = [];
         //遍历对象的元素添加到res数组里
         for (var i = 0; i < this.length; i++) {
         res.push(this[i]);
         }
         return res;*/

        //get 方法的实现
        //根据参数index返回对应下标的DOM元素，如果index没有传递，那么返回整个DOM元素数组
        get: function (index) {
            if (index === undefined) {
                return this.toArray();
            }
            return this[index];
        }

        ,

        //eq 方法的实现
        eq: function (num) {
            var dom;
            if (num >= 0) {
                dom = this.get(num);//如果传入的参数是数字，根据序号获得元素即可，而且得到的是jQuery对象
            } else {
                dom = this.get(this.length + num);//如果传入的参数是负数，那么使用 length+数字 获得元素
            }
            //三元表达式的方法书写   dom = this.get(num+(num>=0?0:this.length));
            return this.constructor(dom);
        }
        ,

        //添加实例方法each和map方法
        each: function (func) {
            Anior.each(this, func);//这里的this不会发生改变，所以直接返回this
            return this;
        }
        ,
        map: function (func) {
            var res = Anior.map(this, func);//这里map后会返回一个新数组，所以定义一个变量接收,并返回
            return res;
        }
    });

    //事件处理模块
    Anior.fn.extend({
        on: function (type, fn) {
            if (!this.events[type]) {
                this.events[type] = [];


                var iObj = this;
                this.each(function () {
                    var self = this;
                    var f = function (e) {
                        for (var i = 0; i < iObj.events[type].length; i++) {
                            iObj.events[type][i].call(self, e);
                        }
                    };
                    if (this.addEventListener) {
                        this.addEventListener(type, f);
                    } else {
                        this.attachEvent('on' + type, f);
                    }
                });
            }
            this.events[type].push(fn);
            return this;
        },

        //事件移除函数
        off: function (type, fn) {
            var arr = this.events[type];
            if (arr) {
                //遍历数组，从数组中删除函数
                for (var i = arr.length; i >= 0; i++) {
                    //判断第i个函数是否和fn一样，如果一样则移除
                    if (arr[i] == fn) {
                        arr.splice(i, 1);
                    }
                }
            }
            return this;
        }

    });

    //其他事件汇总
    var eventArr = ( "blur focus focusin focusout load resize scroll unload click dblclick " +
    "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
    "change select submit keydown keypress keyup error contextmenu" ).split(' ');
    //遍历arr中的每一个事件字符串
    Anior.each(eventArr, function (i, v) {
        // console.log(v); // 每一个事件字符串
        Anior.fn[v] = function (fn) {
            this.on(v, fn);
            return this; // this就是Anior对象
        }
    })

    //hover和toggle
    Anior.fn.extend({
        hover: function (f1, f2) {
            return this.mouseover(f1)
                .mouseout(f2)
            //this.mouseover(f1);
            //this.mouseout(f2);
            //return this;
        },
        toggle: function () {
            var i = 0;
            var args = arguments;
            this.on('click', function (e) {
                args[i % args.length].call(this, e);
                ++i;
            })
        }
    });

    //样式操作
    Anior.fn.extend({
        /*
         css: function (option) {
         for (var i = 0; i < this.length; i++) {
         for (var k in option) {
         this[i].style[k] = option[k];
         }
         }
         return this;
         },
         */

        /*
         css: function (option) {
         return this.each(function () {
         for (var k in option) {
         this.style[k] = option[k];
         }
         }
         );
         },
         */

        // css ( 给dom对象添加样式 )
        css: function (option) {
            var args = arguments,
                len = args.length;
            //如果参数是两个
            if (len == 2) {
                //判断两个参数是否都为字符串
                //args[0]是属性名，args[1]是属性值
                if (Anior.isString(args[0]) && Anior.isString(args[1])) {
                    //遍历Anior中所有的DOM元素，并设置样式
                    return this.each(function () {
                        this.style[args[0]] = args[1];
                    });
                }
            } else if (len == 1) {
                if (Anior.isString(option)) { // 如果option传入是一个字符串
                    return this[0].style[option] || Anior.getStyle(this[0], option);
                } else if (typeof option == 'object') { // 如果option 传入的是一个对象
                    //循环Anoir对象的每一个DOM元素
                        return this.each(function () {
                            //循环需要设置的属性名
                            for (var k in option) {
                                //设置每一个DOM对象的style属性k 为option中的属性值
                                this.style[k] = option[k];
                            }
                        });
                }
            }
            return this;
            // 返回this支持链式编程
        },

        // addClass ( 为dom对象添加某个类名 )
        addClass: function (name) {
            return this.each(function () {
                var classTxt = this.className;
                // 判断classTxt是否有值
                if (classTxt) {
                    // 再判断classTxt中是否已经包含name
                    if ((' ' + classTxt + ' ').indexOf(' ' + name + ' ') == -1) {
                        //classTxt中未包含name，就将name添加进去
                        this.className += ' ' + name;
                    }
                } else { //没有值的话 就直接将name添加为DOM元素的类名
                    this.className = name;
                }
            });
        },

        // removeClass ( 去除dom对象的某个类名 )
        removeClass: function (name) {
            // 遍历this中的每一个dom元素
            return this.each(function () {
                // 获得DOM元素的class属性
                var classTxt = this.className;
                // 如果该dom元素有class属性
                if (classTxt) {
                    // 通过空格将classTxt分隔成一个数组
                    var arr = classTxt.split(' ');
                    //从右往左遍历数组
                    for (var i = arr.length - 1; i >= 0; i--) {
                        //如果数组中有name，则去掉他
                        if (arr[i] == name) {
                            arr.splice(i, 1);
                        }
                    }
                    //将遍历处理后的数组用空格拼接，赋值到该dom元素的class属性上
                    this.className = arr.join(' ');
                }
            });
        },

        // hasClass ( 用来判断是否包含某个类名，返回true或false )
        hasClass: function (name) {
            // 遍历this中的所有的dom元素
            for (var i = 0; i < this.length; i++) {
                // 判断所有的dom对象的class属性是否含有name
                if ((' ' + this[i].className + ' ').indexOf(' ' + name + ' ') != -1) {
                    //如果包含name，返回true
                    return true;
                }
            }
            // 如果所有的dom对象的class属性都不包含name，返回false
            return false;
        },

        // toggleClass
        toggleClass: function (name) {
            // 判断是否拥有name这个类名
            if (this.hasClass(name)) {
                // 如果有这个类名，就移除
                this.removeClass(name);
            } else {
                // 如果没有这个类名，就添加这个类名
                this.addClass(name);
            }
            return this;// 支持链式编程
        }

    });

    // 属性操作模块
    Anior.fn.extend({

        // attr ( 为dom元素设置 自定义 属性和属性值 )
        attr: function (name, value) {
            // 判断value是否存在 或 为空
            if (value || value == '') {
                // 判断name和value是否为字符串
                if (Anior.isString(name) && Anior.isString(value)) {
                    // 遍历this中的所有dom元素
                    return this.each(function () {
                        // 为所有dom元素的设置name属性 属性值为value
                        this.setAttribute(name, value);
                    });
                }
            } else {
                // 判断name是否为字符串
                if (Anior.isString(name)) {
                    // 返回第一个dom元素的name属性值
                    return this[0].getAttribute(name);
                }
            }
            return this;// 支持链式编程
        },

        // prop ( 为dom元素设置 原有 属性和属性值 )
        prop: function (name, value) {
            // 判断value是否存在 或 为空
            if (value || value == '') {
                // 判断name是否为字符串
                if (Anior.isString(name)) {
                    // 遍历this中的所有dom元素
                    return this.each(function () {
                        // 为所有dom元素的设置name属性 属性值为value
                        this[name] = value;
                    });
                }
            } else {
                // 判断name是否为字符串
                if (Anior.isString(name)) {
                    // 返回第一个dom元素的name属性值
                    return this[0][name];
                }
            }
            return this;// 支持链式编程
        },

        //val ( 为dom元素设置value属性的属性值 )
        val: function (v) {
            return this.attr('value', v);
        },

        //html
        html: function (html) {
            return this.prop('innerHTML', html);
        },

        //text
        text: function (txt) {
            // 判断txt是否存在 或 为空
            if (txt || txt === '') {
                // 遍历this中的所有dom元素
                return this.each(function () {
                    this.innerHTML = ''; // 删除里面现有的东西
                    // 用txt创建一个文本节点temp
                    var temp = document.createTextNode(txt + '');
                    // 将temp添加到DOM元素中
                    this.appendChild(temp);
                });
            } else {
                var arr = [];
                getText(this[0], arr);
                return arr.join(' ');
            }
            return this;

            function getText(node, list) {
                var arr = node.childNodes;
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].nodeType === 3) {
                        list.push(arr[i].nodeValue);
                    }
                    if (arr[i].nodeType === 1) {
                        getText(arr[i], list);
                    }
                }
            }
        }


    });


    // 动画处理

    Anior.Easing = {
        line: function ( x, t, b, c, d ) {
            var speed = ( c - b ) / d;
            return speed * t;
        },
        change: function ( x, t, b, c, d ) {
            return Math.log( t + 1 ) / Math.log( d + 1 ) * ( c - b );
        },
        easeInQuad: function (x, t, b, c, d) {
            return c*(t/=d)*t + b;
        },
        easeOutQuad: function (x, t, b, c, d) {
            return -c *(t/=d)*(t-2) + b;
        },
        easeInOutQuad: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t + b;
            return -c/2 * ((--t)*(t-2) - 1) + b;
        },
        easeInCubic: function (x, t, b, c, d) {
            return c*(t/=d)*t*t + b;
        },
        easeOutCubic: function (x, t, b, c, d) {
            return c*((t=t/d-1)*t*t + 1) + b;
        },
        easeInOutCubic: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t + b;
            return c/2*((t-=2)*t*t + 2) + b;
        },
        easeInQuart: function (x, t, b, c, d) {
            return c*(t/=d)*t*t*t + b;
        },
        easeOutQuart: function (x, t, b, c, d) {
            return -c * ((t=t/d-1)*t*t*t - 1) + b;
        },
        easeInOutQuart: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
            return -c/2 * ((t-=2)*t*t*t - 2) + b;
        },
        easeInQuint: function (x, t, b, c, d) {
            return c*(t/=d)*t*t*t*t + b;
        },
        easeOutQuint: function (x, t, b, c, d) {
            return c*((t=t/d-1)*t*t*t*t + 1) + b;
        },
        easeInOutQuint: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
            return c/2*((t-=2)*t*t*t*t + 2) + b;
        },
        easeInSine: function (x, t, b, c, d) {
            return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
        },
        easeOutSine: function (x, t, b, c, d) {
            return c * Math.sin(t/d * (Math.PI/2)) + b;
        },
        easeInOutSine: function (x, t, b, c, d) {
            return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
        },
        easeInExpo: function (x, t, b, c, d) {
            return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
        },
        easeOutExpo: function (x, t, b, c, d) {
            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
        },
        easeInOutExpo: function (x, t, b, c, d) {
            if (t==0) return b;
            if (t==d) return b+c;
            if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
            return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        easeInCirc: function (x, t, b, c, d) {
            return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
        },
        easeOutCirc: function (x, t, b, c, d) {
            return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
        },
        easeInOutCirc: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
            return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
        },
        easeInElastic: function (x, t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        },
        easeOutElastic: function (x, t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
        },
        easeInOutElastic: function (x, t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
            return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
        },
        easeInBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c*(t/=d)*t*((s+1)*t - s) + b;
        },
        easeOutBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        },
        easeInOutBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
            return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
        },
        easeOutBounce: function (x, t, b, c, d) {
            if ((t/=d) < (1/2.75)) {
                return c*(7.5625*t*t) + b;
            } else if (t < (2/2.75)) {
                return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
            } else if (t < (2.5/2.75)) {
                return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
            } else {
                return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
            }
        }

    };


    Anior.fn.extend({

        animate: function ( props, dur, easing, fn ) {
            // 假设 props 就是 x 和 y
            var x = this[ 0 ],
                isOver = false,
                that = this;
            // 1. 获得当前位置与时间
            var startx = parseInt( x.style.left || x.offsetLeft ),
                starty = parseInt( x.style.top  || x.offsetTop ),

                startTime = +new Date();

            // 2.计时器模块
            this.intervalId = setInterval(function () {
                // 3. 获得已经过的时间
                var t = (+new Date) - startTime;

                if ( t >= dur ) {
                    clearInterval( this.intervalId );
                    t = dur;
                    isOver = true;
                }

                // 4. 实现缓动
                easing = easing || 'change';// 设置默认值为change变速

                // 5. 设置属性值
                x.style.left = startx +
                    Anior.Easing[ easing ]( null, t, startx, parseInt(props[ 'left' ]), dur )
                    + 'px';
                x.style.top = starty +
                    Anior.Easing[ easing ]( null, t, starty, parseInt(props[ 'top' ]), dur )
                    + 'px';



                if ( isOver && fn ) {
                    fn.apply( that );
                }
            }, 20 );


        },
        intervalId: null,
        stop: function () {
            clearInterval( this.intervalId );
            this.intervalId = null;
        }
    });




    // 将入口函数暴露在外让用户可以访问使用
    window.I = window.Anior = Anior;

})
(window);
