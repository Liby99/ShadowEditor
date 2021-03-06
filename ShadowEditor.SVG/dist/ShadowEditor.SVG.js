(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Shadow = {})));
}(this, (function (exports) { 'use strict';

	var ID = -1;

	/**
	 * 所有控件基类
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Control(options = {}) {
	    this.parent = options.parent || document.body;
	    this._id = options.id || this.constructor.name + ID--;
	    this._scope = options.scope || 'global';

	    this.children = options.children || [];
	    this.html = options.html || null;

	    this.attr = options.attr || null; // 控件属性
	    this.cls = options.cls || null; // class属性
	    this.data = options.data || null; // 控件数据
	    this.style = options.style || null; // 控件样式
	    this.listeners = options.listeners || null; // 监听器
	    this.userData = options.userData || null; // 自定义数据

	    window.UI.add(this._id, this, this._scope);
	}

	Object.defineProperties(Control.prototype, {
	    /**
	     * 控件id
	     */
	    id: {
	        get: function () {
	            return this._id;
	        },
	        set: function (id) {
	            console.warn(`Control: It is not allowed to assign new value to id.`);
	            this._id = id;
	        }
	    },

	    /**
	     * 命名空间
	     */
	    scope: {
	        get: function () {
	            return this._scope;
	        },
	        set: function (scope) {
	            console.warn(`Control: It is not allowed to assign new value to scope.`);
	            this._scope = scope;
	        }
	    }
	});

	/**
	 * 添加子控件
	 * @param {*} obj 
	 */
	Control.prototype.add = function (obj) {
	    this.children.push(obj);
	};

	/**
	 * 插入子控件
	 * @param {*} index 
	 * @param {*} obj 
	 */
	Control.prototype.insert = function (index, obj) {
	    this.children.splice(index, 0, obj);
	};

	/**
	 * 移除子控件
	 * @param {*} obj 
	 */
	Control.prototype.remove = function (obj) {
	    var index = this.children.indexOf(obj);
	    if (index > -1) {
	        this.children.splice(index, 1);
	    }
	};

	/**
	 * 渲染控件
	 */
	Control.prototype.render = function () {
	    this.children.forEach(n => {
	        var obj = window.UI.create(n);
	        obj.parent = this.parent;
	        obj.render();
	    });
	};

	/**
	 * 渲染dom，将dom添加到父dom并给dom赋值，然后循环渲染子dom
	 * @param {*} dom 
	 */
	Control.prototype.renderDom = function (dom) {
	    this.dom = dom;
	    this.parent.appendChild(this.dom);

	    // 属性，通过setAttribute给节点赋值
	    if (this.attr) {
	        Object.keys(this.attr).forEach(n => {
	            this.dom.setAttribute(n, this.attr[n]);
	        });
	    }

	    // class属性
	    if (this.cls) {
	        this.dom.className = this.cls;
	    }

	    // 数据，直接赋值给dom
	    if (this.data) {
	        Object.assign(this.dom, this.data);
	    }

	    // 样式，赋值给dom.style
	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    // 监听器，赋值给dom
	    if (this.listeners) {
	        Object.keys(this.listeners).forEach(n => {
	            this.dom['on' + n] = this.listeners[n];
	        });
	    }

	    // 自定义数据，赋值给dom.userData
	    if (this.userData) {
	        this.dom.userData = {};
	        Object.assign(this.dom.userData, this.userData);
	    }

	    // innerHTML属性
	    if (this.html) {
	        this.dom.innerHTML = this.html;
	    }

	    // 渲染子节点
	    this.children.forEach(n => {
	        var control = window.UI.create(n);
	        control.parent = this.dom;
	        control.render();
	    });
	};

	/**
	 * 清空控件（可调用render函数重新渲染）
	 */
	Control.prototype.clear = function () {
	    (function remove(items) {
	        if (items == null || items.length === 0) {
	            return;
	        }

	        items.forEach(n => {
	            if (n.id) {
	                window.UI.remove(n.id, n.scope);
	            }
	            if (n.listeners) {
	                Object.keys(n.listeners).forEach(m => {
	                    if (n.dom) {
	                        n.dom['on' + m] = null;
	                    }
	                });
	            }
	            remove(n.children);
	        });
	    })(this.children);

	    this.children.length = 0;

	    if (this.dom) {
	        this.parent.removeChild(this.dom);

	        if (this.listeners) {
	            this.listeners.forEach(n => {
	                this.dom['on' + n] = null;
	            });
	        }

	        this.dom = null;
	    }
	};

	/**
	 * 摧毁控件
	 */
	Control.prototype.destroy = function () {
	    this.clear();
	    if (this.parent) {
	        this.parent = null;
	    }
	    if (this.id) {
	        window.UI.remove(this._id, this._scope);
	    }
	};

	/**
	 * UI类
	 * @author tengge / https://github.com/tengge1
	 */
	function UICls() {
	    this.xtypes = {};
	    this.objects = {};
	}

	/**
	 * 添加xtype
	 * @param {*} name xtype字符串
	 * @param {*} cls xtype对应类
	 */
	UICls.prototype.addXType = function (name, cls) {
	    if (this.xtypes[name] === undefined) {
	        this.xtypes[name] = cls;
	    } else {
	        console.warn(`UICls: xtype named ${name} has already been added.`);
	    }
	};

	/**
	 * 删除xtype
	 * @param {*} name xtype字符串
	 */
	UICls.prototype.removeXType = function (name) {
	    if (this.xtypes[name] !== undefined) {
	        delete this.xtypes[name];
	    } else {
	        console.warn(`UICls: xtype named ${name} is not defined.`);
	    }
	};

	/**
	 * 获取xtype
	 * @param {*} name xtype字符串
	 */
	UICls.prototype.getXType = function (name) {
	    if (this.xtypes[name] === undefined) {
	        console.warn(`UICls: xtype named ${name} is not defined.`);
	    }
	    return this.xtypes[name];
	};

	/**
	 * 添加一个对象到缓存
	 * @param {*} id 对象id
	 * @param {*} obj 对象
	 * @param {*} scope 对象作用域（默认为global）
	 */
	UICls.prototype.add = function (id, obj, scope = "global") {
	    var key = `${scope}:${id}`;
	    if (this.objects[key] !== undefined) {
	        console.warn(`UICls: object named ${id} has already been added.`);
	    }
	    this.objects[key] = obj;
	};

	/**
	 * 从缓存中移除一个对象
	 * @param {*} id 对象id
	 * @param {*} scope 对象作用域（默认为global）
	 */
	UICls.prototype.remove = function (id, scope = 'global') {
	    var key = `${scope}:${id}`;
	    if (this.objects[key] != undefined) {
	        delete this.objects[key];
	    } else {
	        console.warn(`UICls: object named ${id} is not defined.`);
	    }
	};

	/**
	 * 从缓存中获取一个对象
	 * @param {*} id 控件id
	 * @param {*} scope 对象作用域（默认为global）
	 */
	UICls.prototype.get = function (id, scope = 'global') {
	    var key = `${scope}:${id}`;
	    return this.objects[key];
	};

	/**
	 * 通过json配置创建UI实例，并自动将包含id的控件添加到缓存
	 * @param {*} config xtype配置
	 */
	UICls.prototype.create = function (config) {
	    if (config instanceof Control) { // config是Control实例
	        return config;
	    }

	    // config是json配置
	    if (config == null || config.xtype == null) {
	        throw 'UICls: config is undefined.';
	    }

	    if (config.xtype === undefined) {
	        throw 'UICls: config.xtype is undefined.';
	    }

	    var cls = this.xtypes[config.xtype];
	    if (cls == null) {
	        throw `UICls: xtype named ${config.xtype} is undefined.`;
	    }

	    return new cls(config);
	};

	/**
	 * UICls
	 */
	const UI = new UICls();

	window.UI = UI;

	const xlinkns = "http://www.w3.org/1999/xlink";

	/**
	* 渲染dom
	* @param {*} dom 
	*/
	Control.prototype.renderDom = function (dom) {
	    this.dom = dom;
	    this.parent.appendChild(this.dom);

	    if (this.attr) {
	        Object.keys(this.attr).forEach(n => {
	            // 对于类似`xlink:href`的属性，需要使用setAttributeNS设置属性，否则svg显示不出来
	            if (n.startsWith('xlink')) {
	                this.dom.setAttributeNS(xlinkns, n, this.attr[n]);
	            } else {
	                this.dom.setAttribute(n, this.attr[n]);
	            }
	        });
	    }

	    if (this.cls) {
	        this.dom.className = this.cls;
	    }

	    if (this.data) {
	        Object.assign(this.dom, this.data);
	    }

	    if (this.style) {
	        Object.assign(this.dom.style, this.style);
	    }

	    if (this.listeners) {
	        Object.keys(this.listeners).forEach(n => {
	            this.dom['on' + n] = this.listeners[n];
	        });
	    }

	    if (this.userData) {
	        this.dom.userData = {};
	        Object.assign(this.dom.userData, this.userData);
	    }

	    if (this.html) {
	        this.dom.innerHTML = this.html;
	    }

	    this.children.forEach(n => {
	        var control = window.UI.create(n);
	        control.parent = this.dom;
	        control.render();
	    });
	};

	/**
	 * SVG文档
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Dom(options = {}) {
	    Control.call(this, options);
	}

	Dom.prototype = Object.create(Control.prototype);
	Dom.prototype.constructor = Dom;

	Dom.prototype.render = function () {
	    var dom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	    this.renderDom(dom);
	};

	UI.addXType('svgdom', Dom);

	/**
	 * SVG圆
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Circle(options = {}) {
	    Control.call(this, options);
	}

	Circle.prototype = Object.create(Control.prototype);
	Circle.prototype.constructor = Circle;

	Circle.prototype.render = function () {
	    var dom = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
	    this.renderDom(dom);
	};

	UI.addXType('svgcircle', Circle);

	/**
	 * SVG矩形
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Rect(options = {}) {
	    Control.call(this, options);
	}

	Rect.prototype = Object.create(Control.prototype);
	Rect.prototype.constructor = Rect;

	Rect.prototype.render = function () {
	    var dom = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	    this.renderDom(dom);
	};

	UI.addXType('svgrect', Rect);

	/**
	 * SVG椭圆
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Ellipse(options = {}) {
	    Control.call(this, options);
	}

	Ellipse.prototype = Object.create(Control.prototype);
	Ellipse.prototype.constructor = Ellipse;

	Ellipse.prototype.render = function () {
	    var dom = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
	    this.renderDom(dom);
	};

	UI.addXType('svgellipse', Ellipse);

	/**
	 * SVG线
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Line(options = {}) {
	    Control.call(this, options);
	}

	Line.prototype = Object.create(Control.prototype);
	Line.prototype.constructor = Line;

	Line.prototype.render = function () {
	    var dom = document.createElementNS('http://www.w3.org/2000/svg', 'line');
	    this.renderDom(dom);
	};

	UI.addXType('svgline', Line);

	/**
	 * SVG曲线
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Polyline(options = {}) {
	    Control.call(this, options);
	}

	Polyline.prototype = Object.create(Control.prototype);
	Polyline.prototype.constructor = Polyline;

	Polyline.prototype.render = function () {
	    var dom = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
	    this.renderDom(dom);
	};

	UI.addXType('svgpolyline', Polyline);

	/**
	 * SVG面
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Polygon(options = {}) {
	    Control.call(this, options);
	}

	Polygon.prototype = Object.create(Control.prototype);
	Polygon.prototype.constructor = Polygon;

	Polygon.prototype.render = function () {
	    var dom = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
	    this.renderDom(dom);
	};

	UI.addXType('svgpolygon', Polygon);

	/**
	 * SVG线
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Path(options = {}) {
	    Control.call(this, options);
	}

	Path.prototype = Object.create(Control.prototype);
	Path.prototype.constructor = Path;

	Path.prototype.render = function () {
	    var dom = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	    this.renderDom(dom);
	};

	UI.addXType('svgpath', Path);

	/**
	 * SVG文本
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Text(options = {}) {
	    Control.call(this, options);

	    this.text = options.text || null;
	}

	Text.prototype = Object.create(Control.prototype);
	Text.prototype.constructor = Text;

	Text.prototype.render = function () {
	    var dom = document.createElementNS('http://www.w3.org/2000/svg', 'text');
	    this.renderDom(dom);
	};

	UI.addXType('svgtext', Text);

	/**
	 * SVG文本路径
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function TextPath(options = {}) {
	    Control.call(this, options);

	    this.text = options.text || null;
	}

	TextPath.prototype = Object.create(Control.prototype);
	TextPath.prototype.constructor = TextPath;

	TextPath.prototype.render = function () {
	    var dom = document.createElementNS('http://www.w3.org/2000/svg', 'textPath');
	    this.renderDom(dom);
	};

	UI.addXType('svgtextpath', TextPath);

	/**
	 * SVG链接
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Anchor(options = {}) {
	    Control.call(this, options);
	}

	Anchor.prototype = Object.create(Control.prototype);
	Anchor.prototype.constructor = Anchor;

	Anchor.prototype.render = function () {
	    var dom = document.createElementNS('http://www.w3.org/2000/svg', 'a');
	    this.renderDom(dom);
	};

	UI.addXType('svga', Anchor);

	/**
	 * SVG定义
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Defs(options = {}) {
	    Control.call(this, options);
	}

	Defs.prototype = Object.create(Control.prototype);
	Defs.prototype.constructor = Defs;

	Defs.prototype.render = function () {
	    var dom = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
	    this.renderDom(dom);
	};

	UI.addXType('svgdefs', Defs);

	/**
	 * SVG Use
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Use(options = {}) {
	    Control.call(this, options);
	}

	Use.prototype = Object.create(Control.prototype);
	Use.prototype.constructor = Use;

	Use.prototype.render = function () {
	    var dom = document.createElementNS('http://www.w3.org/2000/svg', 'use');
	    this.renderDom(dom);
	};

	UI.addXType('svguse', Use);

	/**
	 * SVG滤镜
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function Filter(options = {}) {
	    Control.call(this, options);
	}

	Filter.prototype = Object.create(Control.prototype);
	Filter.prototype.constructor = Filter;

	Filter.prototype.render = function () {
	    var dom = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
	    this.renderDom(dom);
	};

	UI.addXType('svgfilter', Filter);

	/**
	 * SVG高斯滤镜
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function feGaussianBlur(options = {}) {
	    Control.call(this, options);
	}

	feGaussianBlur.prototype = Object.create(Control.prototype);
	feGaussianBlur.prototype.constructor = feGaussianBlur;

	feGaussianBlur.prototype.render = function () {
	    var dom = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
	    this.renderDom(dom);
	};

	UI.addXType('svgfegaussianblur', feGaussianBlur);

	/**
	 * SVG偏移滤镜
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function feOffset(options = {}) {
	    Control.call(this, options);
	}

	feOffset.prototype = Object.create(Control.prototype);
	feOffset.prototype.constructor = feOffset;

	feOffset.prototype.render = function () {
	    var dom = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
	    this.renderDom(dom);
	};

	UI.addXType('svgfeoffset', feOffset);

	/**
	 * SVG融合滤镜
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function feBlend(options = {}) {
	    Control.call(this, options);
	}

	feBlend.prototype = Object.create(Control.prototype);
	feBlend.prototype.constructor = feBlend;

	feBlend.prototype.render = function () {
	    var dom = document.createElementNS('http://www.w3.org/2000/svg', 'feBlend');
	    this.renderDom(dom);
	};

	UI.addXType('svgfeblend', feBlend);

	/**
	 * SVG融合滤镜
	 * @author tengge / https://github.com/tengge1
	 * @param {*} options 
	 */
	function feColorMatrix(options = {}) {
	    Control.call(this, options);
	}

	feColorMatrix.prototype = Object.create(Control.prototype);
	feColorMatrix.prototype.constructor = feColorMatrix;

	feColorMatrix.prototype.render = function () {
	    var dom = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
	    this.renderDom(dom);
	};

	UI.addXType('svgfecolormatrix', feColorMatrix);

	exports.Control = Control;
	exports.UI = UI;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
