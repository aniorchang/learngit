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
                // ����
                return;
            }
            if (typeof html === 'function') {
                //�����һ����������ô�ͽ������󶨵�onload�ϲ�����
                //onload = html

                //�ж��Ƿ��Ѿ��к���
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
                    // ѡ����
                    // select( html );
                    push.apply(this, Anior.select(html));
                    this.selector = html;
                }

            }
            if (html && html.type === 'Anior') {
                // ��һ�� Anior ����
                // ������� Anior �������е�Ԫ�ض��ӵ� this ��
                push.apply(this, html);
                this.selector = html.selector;
                this.events = html.events;
            }

            //�ж��ǲ���һ��DOM����
            if (html.nodeType) {
                //this[0] = html;
                //this.length = 1;
                push.call(this, html)
            }

            this.events = {};

        },

        selector: '',//������ʾʹ����ѡ����

        type: 'Anior',

    };
    Anior.fn.events = {};

    Anior.fn.init.prototype = Anior.fn;

    // ��ӿ���չ�ķ��� extend
    Anior.extend = Anior.fn.extend = function (obj) {
        for (var k in obj) {
            // if ( k �� obj �Լ��ṩ�ķ��� ) obj.hasOwnProperty( k )
            this[k] = obj[k];
        }
    }


    //select����
    var select =
        (function () {
            var push = [].push;//������д


            try {
                var div = document.createElement("div");//����һ��div
                div.innerHTML = '<p></p>';//��div���p��ǩ
                var arr = [];//����һ��������
                push.apply(arr, div.getElementsByTagName('p'));//��������p��ӵ�arr��
            } catch (e) {
                push = {
                    apply: function (array1, array2) {
                        //��array2ѭ��������array1��
                        for (var i = 0; i < array2.length; i++) {
                            array1[array1.length++] = array2[i];//length��Ҫ++��ֹ�������
                        }
                    }
                };
            }

            // ������ʽ
            var rnative = /\{\s*\[native/;
            var rtrim = /^\s+|\s+$/g;
            var rbaseselector = /^(?:\#([\w\-]+)|\.([\w\-]+)|(\*)|(\w+))$/;


            //��������support����
            var support = {};//����һ������
            support.qsa = rnative.test(document.querySelectorAll + '');
            support.getElementsByClassName = rnative.test(document.getElementsByClassName + '');
            support.trim = rnative.test(String.prototype.trim + '');
            support.indexOf = rnative.test(Array.prototype.indexOf + '');


            //��������
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

            //�Զ���ʵ��trim����
            var myTrim = function (str) {
                if (support.trim) {
                    //���ϵͳ����trim��������ֱ�ӵ��ø÷���������
                    return str.trim;
                } else {
                    //���ϵͳû��trim���������Զ���ʵ�ָ÷���
                    return str.replace(rtrim, '');
                }
            }

            var myIndexOf = function (array, search, startIndex) {
                startIndex = startIndex || 0;
                if (support.index) {
                    //���ϵͳ����indexOf��������ֱ�ӵ��ø÷���������
                    return array.indexOf(search, startIndex);
                } else {
                    //���ϵͳû��indexOf���������Զ���ʵ�ָ÷���
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
                //����֮ǰ��������ʽ��õ����������з����ж�
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
                        //m[3]��m[4]�ϲ�
                        return node.getElementsByTagName(selector);
                    }
                }
                return [];
            }

            function select2(selector, results) {

                results = results || [];

                var selectors = selector.split(' ');

                // �ٶ� 'div p .c'

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

                // ����������û������, �������������ѡ��
                // �����ж� qsa �Ƿ����
                // Ȼ���� һ������ �Լ�ʵ��
                if (support.qsa) {
                    push.apply(results, document.querySelectorAll(selector));
                } else {
                    // ���������������Լ�ʵ��
                    selectors = selector.split(',');
                    // ѭ��
                    for (i = 0; i < selectors.length; i++) {
                        subselector = myTrim(selectors[i]);
                        // ���������� ���� subselector
                        if (rbaseselector.test(subselector)) {
                            // ����ѡ����
                            push.apply(results, basicSelect(subselector));
                        } else {
                            // select2 ����
                            select2(subselector, results);
                        }
                    }
                }
                // ���� result
                return unique(results);
            }


            return select;
        })();


    Anior.select = select;   // ����Ҫ��ʱ�� ����ʹ�õ������� ѡ��������

// ��ҪһЩ�жϵķ���
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

// DOM �����ķ���
// ���ַ���ת��Ϊ DOM ����ĺ���
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
        //��Ӿ�̬����each��map
        each: function (arr, func) {
            var i;
            // �� ES5 �л������� Array.isArray �ķ���ר�����ж�����
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
        //��Ӻ��ķ���
        //�˿�this�������ԭ�ʹ���������ʵ��

        //appendTo ������ʵ��


        /*appendTo: function (dom) {
         for (var i = 0; i < this.length; i++) {
         dom.appendChild(this[i]);
         }
         },*/

        /*
         appendTo: function (selector) {
         var iObj = this.constructor(selector);
         //�� this[i] ��ӵ� iObj[0] ��
         for (var i = 0; i < this.length; i++) {
         iObj[ 0 ].appendChild( this[i] );
         }
         }
         */


        // �Ľ�
        /*
         appendTo: function (selector) {
         var iObj = this.constructor(selector);
         // �� this[i] ��ӵ� iObj[j] ��
         for (var i = 0; i < this.length; i++) {
         for(var j = 0 ; j < iObj.length ; j++){
         iObj[j].appendChild(this[i].cloneNode(true));
         // ����ʱ����һ��this[i]�����Ի���Ҫ�Ľ������һ������Ҫ��¡
         }
         }
         }
         */


        // �ٴθĽ�
        /*
         // ���һ�ν�this[i]������ӵ�iObj[j]��
         // Ҳ�������һ�β���¡
         appendTo: function (selector) {
         var iObj = this.constructor(selector);
         //�� this[i] ��ӵ� iObj[j] ��
         for (var i = 0; i < this.length; i++) {
         for (var j = 0; j < iObj.length; j++) {

         // ��Ԫ���ʽ�ķ�����д
         iObj[j].appendChild(
         j == iObj.length - 1    //�ж�����
         ? this[i]    //�ж���������ʱִ�еĴ���
         : this[i].cloneNode(true)    //�ж�������������ִ�еĴ���
         );
         // �ж������һ�εķ������� j==iObj.length-1

         //if else �ķ�����д
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

        //������
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

            //��һ��д��
            /*
             this.constructor(selector).appendTo(this);
             */

            return this;
        },

        //prependTo ������ʵ��

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


        //toArray ������ʵ��
        //��Anior����ת��Ϊһ��DOM����

        toArray: function () {
            //arr.slice(0)��ʾ�ӵ�0��Ԫ�ؿ�ʼ��ȡ���飬����������
            return slice.call(this, 0);//�����slice��������Ĳ�����slice = [].slice
        },

        //�������Զ���ķ���������:

        /*var res = [];
         //���������Ԫ����ӵ�res������
         for (var i = 0; i < this.length; i++) {
         res.push(this[i]);
         }
         return res;*/

        //get ������ʵ��
        //���ݲ���index���ض�Ӧ�±��DOMԪ�أ����indexû�д��ݣ���ô��������DOMԪ������
        get: function (index) {
            if (index === undefined) {
                return this.toArray();
            }
            return this[index];
        }

        ,

        //eq ������ʵ��
        eq: function (num) {
            var dom;
            if (num >= 0) {
                dom = this.get(num);//�������Ĳ��������֣�������Ż��Ԫ�ؼ��ɣ����ҵõ�����jQuery����
            } else {
                dom = this.get(this.length + num);//�������Ĳ����Ǹ�������ôʹ�� length+���� ���Ԫ��
            }
            //��Ԫ���ʽ�ķ�����д   dom = this.get(num+(num>=0?0:this.length));
            return this.constructor(dom);
        }
        ,

        //���ʵ������each��map����
        each: function (func) {
            Anior.each(this, func);//�����this���ᷢ���ı䣬����ֱ�ӷ���this
            return this;
        }
        ,
        map: function (func) {
            var res = Anior.map(this, func);//����map��᷵��һ�������飬���Զ���һ����������,������
            return res;
        }
    });

    //�¼�����ģ��
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

        //�¼��Ƴ�����
        off: function (type, fn) {
            var arr = this.events[type];
            if (arr) {
                //�������飬��������ɾ������
                for (var i = arr.length; i >= 0; i++) {
                    //�жϵ�i�������Ƿ��fnһ�������һ�����Ƴ�
                    if (arr[i] == fn) {
                        arr.splice(i, 1);
                    }
                }
            }
            return this;
        }

    });

    //�����¼�����
    var eventArr = ( "blur focus focusin focusout load resize scroll unload click dblclick " +
    "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
    "change select submit keydown keypress keyup error contextmenu" ).split(' ');
    //����arr�е�ÿһ���¼��ַ���
    Anior.each(eventArr, function (i, v) {
        // console.log(v); // ÿһ���¼��ַ���
        Anior.fn[v] = function (fn) {
            this.on(v, fn);
            return this; // this����Anior����
        }
    })

    //hover��toggle
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

    //��ʽ����
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

        // css ( ��dom���������ʽ )
        css: function (option) {
            var args = arguments,
                len = args.length;
            //�������������
            if (len == 2) {
                //�ж����������Ƿ�Ϊ�ַ���
                //args[0]����������args[1]������ֵ
                if (Anior.isString(args[0]) && Anior.isString(args[1])) {
                    //����Anior�����е�DOMԪ�أ���������ʽ
                    return this.each(function () {
                        this.style[args[0]] = args[1];
                    });
                }
            } else if (len == 1) {
                if (Anior.isString(option)) { // ���option������һ���ַ���
                    return this[0].style[option] || Anior.getStyle(this[0], option);
                } else if (typeof option == 'object') { // ���option �������һ������
                    //ѭ��Anoir�����ÿһ��DOMԪ��
                        return this.each(function () {
                            //ѭ����Ҫ���õ�������
                            for (var k in option) {
                                //����ÿһ��DOM�����style����k Ϊoption�е�����ֵ
                                this.style[k] = option[k];
                            }
                        });
                }
            }
            return this;
            // ����this֧����ʽ���
        },

        // addClass ( Ϊdom�������ĳ������ )
        addClass: function (name) {
            return this.each(function () {
                var classTxt = this.className;
                // �ж�classTxt�Ƿ���ֵ
                if (classTxt) {
                    // ���ж�classTxt���Ƿ��Ѿ�����name
                    if ((' ' + classTxt + ' ').indexOf(' ' + name + ' ') == -1) {
                        //classTxt��δ����name���ͽ�name��ӽ�ȥ
                        this.className += ' ' + name;
                    }
                } else { //û��ֵ�Ļ� ��ֱ�ӽ�name���ΪDOMԪ�ص�����
                    this.className = name;
                }
            });
        },

        // removeClass ( ȥ��dom�����ĳ������ )
        removeClass: function (name) {
            // ����this�е�ÿһ��domԪ��
            return this.each(function () {
                // ���DOMԪ�ص�class����
                var classTxt = this.className;
                // �����domԪ����class����
                if (classTxt) {
                    // ͨ���ո�classTxt�ָ���һ������
                    var arr = classTxt.split(' ');
                    //���������������
                    for (var i = arr.length - 1; i >= 0; i--) {
                        //�����������name����ȥ����
                        if (arr[i] == name) {
                            arr.splice(i, 1);
                        }
                    }
                    //�����������������ÿո�ƴ�ӣ���ֵ����domԪ�ص�class������
                    this.className = arr.join(' ');
                }
            });
        },

        // hasClass ( �����ж��Ƿ����ĳ������������true��false )
        hasClass: function (name) {
            // ����this�е����е�domԪ��
            for (var i = 0; i < this.length; i++) {
                // �ж����е�dom�����class�����Ƿ���name
                if ((' ' + this[i].className + ' ').indexOf(' ' + name + ' ') != -1) {
                    //�������name������true
                    return true;
                }
            }
            // ������е�dom�����class���Զ�������name������false
            return false;
        },

        // toggleClass
        toggleClass: function (name) {
            // �ж��Ƿ�ӵ��name�������
            if (this.hasClass(name)) {
                // �����������������Ƴ�
                this.removeClass(name);
            } else {
                // ���û�����������������������
                this.addClass(name);
            }
            return this;// ֧����ʽ���
        }

    });

    // ���Բ���ģ��
    Anior.fn.extend({

        // attr ( ΪdomԪ������ �Զ��� ���Ժ�����ֵ )
        attr: function (name, value) {
            // �ж�value�Ƿ���� �� Ϊ��
            if (value || value == '') {
                // �ж�name��value�Ƿ�Ϊ�ַ���
                if (Anior.isString(name) && Anior.isString(value)) {
                    // ����this�е�����domԪ��
                    return this.each(function () {
                        // Ϊ����domԪ�ص�����name���� ����ֵΪvalue
                        this.setAttribute(name, value);
                    });
                }
            } else {
                // �ж�name�Ƿ�Ϊ�ַ���
                if (Anior.isString(name)) {
                    // ���ص�һ��domԪ�ص�name����ֵ
                    return this[0].getAttribute(name);
                }
            }
            return this;// ֧����ʽ���
        },

        // prop ( ΪdomԪ������ ԭ�� ���Ժ�����ֵ )
        prop: function (name, value) {
            // �ж�value�Ƿ���� �� Ϊ��
            if (value || value == '') {
                // �ж�name�Ƿ�Ϊ�ַ���
                if (Anior.isString(name)) {
                    // ����this�е�����domԪ��
                    return this.each(function () {
                        // Ϊ����domԪ�ص�����name���� ����ֵΪvalue
                        this[name] = value;
                    });
                }
            } else {
                // �ж�name�Ƿ�Ϊ�ַ���
                if (Anior.isString(name)) {
                    // ���ص�һ��domԪ�ص�name����ֵ
                    return this[0][name];
                }
            }
            return this;// ֧����ʽ���
        },

        //val ( ΪdomԪ������value���Ե�����ֵ )
        val: function (v) {
            return this.attr('value', v);
        },

        //html
        html: function (html) {
            return this.prop('innerHTML', html);
        },

        //text
        text: function (txt) {
            // �ж�txt�Ƿ���� �� Ϊ��
            if (txt || txt === '') {
                // ����this�е�����domԪ��
                return this.each(function () {
                    this.innerHTML = ''; // ɾ���������еĶ���
                    // ��txt����һ���ı��ڵ�temp
                    var temp = document.createTextNode(txt + '');
                    // ��temp��ӵ�DOMԪ����
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


    // ��������

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
            // ���� props ���� x �� y
            var x = this[ 0 ],
                isOver = false,
                that = this;
            // 1. ��õ�ǰλ����ʱ��
            var startx = parseInt( x.style.left || x.offsetLeft ),
                starty = parseInt( x.style.top  || x.offsetTop ),

                startTime = +new Date();

            // 2.��ʱ��ģ��
            this.intervalId = setInterval(function () {
                // 3. ����Ѿ�����ʱ��
                var t = (+new Date) - startTime;

                if ( t >= dur ) {
                    clearInterval( this.intervalId );
                    t = dur;
                    isOver = true;
                }

                // 4. ʵ�ֻ���
                easing = easing || 'change';// ����Ĭ��ֵΪchange����

                // 5. ��������ֵ
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




    // ����ں�����¶�������û����Է���ʹ��
    window.I = window.Anior = Anior;

})
(window);