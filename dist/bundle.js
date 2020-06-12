(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  const setDomDisplay = (dom, value) => {
    dom.style.display = value;
  };

  const setuuid = () => {
    return new Date().getTime()
  };

  const setTextSelected = (className, text, id, styles) => {
    const span = document.createElement('span');
    span.className = className;
    span.id = id;
    span.innerHTML = text;
    if (styles) {
      Object.keys(styles).forEach(key => {
        span.style[key] = styles[key];
      });
    }
    return span
  };

  const getUserAgent = () => {
    const u = navigator.userAgent;
    const isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
    const isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    const eventName = {
      mousedown: isAndroid || isiOS ? 'touchstart' : 'mousedown',
      mouseup: isAndroid || isiOS ? 'touchend' : 'mouseup',
      mousemove: isAndroid || isiOS ? 'touchmove' : 'mousemove',
    };
    return {
      isAndroid,
      isiOS,
      eventName
    }
  };

  const setMarkClassName = (dom, index = 1) => {
    if (dom.childNodes) {
      for (let i = 0; i < dom.childNodes.length; i++) {
        const childNode = dom.childNodes[i];
        if (childNode.nodeType === 1) {
          const ingoreNodes = ['BR', 'HR', 'SCRIPT', 'BUTTON'];
          if (!ingoreNodes.includes(childNode.nodeName)) {
            childNode.className = childNode.className ? childNode.className + ` _WM-${index}-${i}` : `_WM-${index}-${i}`;
          }
          if (childNode.childNodes.length > 0) {
            setMarkClassName(childNode, index + 1 + `-${i}`);
          }
        }
      }
    }
  };

  const mergeTextNode = dom => {
    const parentNode = dom.parentNode;
    if(!parentNode) return
    const text = dom.innerText;
    const replaceTextNode = document.createTextNode(text);
    parentNode.replaceChild(replaceTextNode, dom);
    const preDom = replaceTextNode.previousSibling;
    const nextDom = replaceTextNode.nextSibling;

    // 合并文本节点
    if (preDom && preDom.nodeType === 3) {
      preDom.textContent = preDom.textContent + text;
      parentNode.removeChild(replaceTextNode);
      if (nextDom && nextDom.nodeType === 3) {
        preDom.textContent = preDom.textContent + nextDom.textContent;
        parentNode.removeChild(nextDom);
      }
    } else {
      if (nextDom && nextDom.nodeType === 3) {
        replaceTextNode.textContent = replaceTextNode.textContent + nextDom.textContent;
        parentNode.removeChild(nextDom);
      }
    }
  };

  const createBtnDom = (textMarker, styles) => {
      const defaultStyles = {
        position: 'absolute',
        textAlign: 'center',
        width: '100%',
        left: 0,
        top: 0,
        padding: '0 15px',
        height: '35px',
        lineHeight: '35px',
        backgroundColor: 'black',
        borderRadius: 3,
        display: 'none',
        color: '#fff',
        transition: 'all .3s',
        boxSizing: 'border-box',
        ...styles
      };
      const btnBox = document.createElement('div');

      btnBox.id = 'webMarkerBtnBox';
      Object.keys(defaultStyles).forEach(key => {
        btnBox.style[key] = defaultStyles[key];
      });
      btnBox.style.backgroundColor = 'transparent';
      const divStyle = `flex: 1; background-color: ${defaultStyles.backgroundColor}; border-right: 1px solid rgba(255,255,255,.3)`; 
      btnBox.innerHTML = `
      <div style="${divStyle}" id="webMarker_btn_mark">标记</div>
      <div style="${divStyle}" id="webMarker_btn_delete">删除标记</div>
      <div style="${divStyle}; border-right: 0" id="webMarker_btn_cancel">取消</div>
      <div id="webMarker_arrow"></div>
    `;

      document.body.appendChild(btnBox);

      const arrow = document.getElementById('webMarker_arrow');
      arrow.style.position = 'absolute';
      arrow.style.width = '10px';
      arrow.style.height = '10px';
      arrow.style.backgroundColor = defaultStyles.backgroundColor;
      arrow.style.left = '50%';
      arrow.style.marginLeft = '-5px';
      arrow.style.bottom = '-5px';
      arrow.style.transform = 'rotate(45deg)';
      arrow.style.transition = 'all .3s';

      textMarker.arrow = arrow;
      textMarker.btn_Box = document.getElementById('webMarkerBtnBox');
      textMarker.btn_mark = document.getElementById('webMarker_btn_mark');
      textMarker.btn_cancel = document.getElementById('webMarker_btn_cancel');
      textMarker.btn_delete = document.getElementById('webMarker_btn_delete');

      textMarker.btn_mark.addEventListener(getUserAgent().eventName.mousedown, textMarker.mark.bind(textMarker));
      textMarker.btn_cancel.addEventListener(getUserAgent().eventName.mousedown, textMarker.hide.bind(textMarker));
      textMarker.btn_delete.addEventListener(getUserAgent().eventName.mousedown, textMarker.del.bind(textMarker));
    
    };

  const createDebugDom = textMarker => {
      const styles = {
        position: 'fixed',
        width: '100%',
        bottom: 0,
        left: 0,
        padding: '10px',
        transition: 'all .3s',
        boxSizing: 'border-box',
        backgroundColor: '#f1f1f1',
  			fontSize: '12px',
  			borderTop: '1px solid #ddd',
      };
      const debugDom = document.createElement('div');

      debugDom.id = 'webMarkerDebugBox';
      Object.keys(styles).forEach(key => {
        debugDom.style[key] = styles[key];
      });
      debugDom.innerHTML = `
      <div id="debug_userAgaent"></div>
      <div id="debug_selectionText">选中文本:</div>
      <div id="debug_event">选中文本:</div>
    `;

      document.body.appendChild(debugDom);
      textMarker.debug_userAgaent = document.getElementById('debug_userAgaent');
      textMarker.debug_selectionText = document.getElementById('debug_selectionText');
      textMarker.debug_event = document.getElementById('debug_event');
    };

  const disabledElement = ['BUTTON', 'H1', 'H2', 'IMG'];

  /**
   * @class Marker
   * @param id: id, setuuid() 生成, 一个简单的按当前时间生成的字符串, 不需要太专业
   * @param parentClassName: 父节点className, 对应 selectedMarkers 中的 key,
   * @param childIndex: 在父节点中的索引
   * @param start: 标记开始位置
   * @param end: 标记结束位置
   */
  class Marker {
    constructor(id, parentClassName, childIndex, start, end) {
      this.id = id;
      this.childIndex = childIndex;
      this.start = start;
      this.end = end;
      if (parentClassName) {
        this.parentClassName = parentClassName;
      }
    }
  }

  /**
   * @class WebTextMarker
   * @param options.defaultMarkers: 初始标记数据
   * @param options.markedStyles: 标记文本样式
   * @param options.btnStyles: 操作框样式
   * @param options.onSave: 标记后回调, 必填
   */

  class WebTextMarker {
    constructor(options) {

      if (!options || !options.onSave) {
        throw new Error('options中的 onSave 选项为必填')
      }

      if (typeof options.onSave !== 'function') {
        throw new Error('onSave 必须为一个函数')
      }

      if (options.markedStyles && Object.prototype.toString.call(options.markedStyles) === '[object Object]') {
        throw new Error('defaultMarkers 必须为一个对象')
      }

      if (options.btnStyles && Object.prototype.toString.call(options.btnStyles) === '[object Object]') {
        throw new Error('btnStyles 必须为一个对象')
      }

      this.MAKRED_CLASSNAME = 'web_marker';
      this.TEMP_MARKED_CLASSNAME = 'temp_marker';



      // 标记样式
      this.markedStyles = {
        color: '#fff',
        backgroundColor: 'cadetblue',
        ...options.markedStyles
      };

      // 回调
      this.options = options || {};

      // 所有标记文本, 格式为: {parentClassName: [Marker, Marker, ...]}, 最后转换成json字符串保存到数据库
      this.selectedMarkers = {};

      // 选中文本对象, 从 window.getSelection() 中拿
      this.selectedText = {};

      // 临时标记节点
      this.tempMarkDom = null;

      // 临时保存标记信息, 鼠标抬起时设置, 解决点击"标记"按钮时 window.getSelection 影响 this.selectedText 的问题
      this.tempMarkerInfo = {};

      // 要删除的标记 id
      this.deleteId = '';

      // 是否已标记
      this.isMarked = false;

      this.pageY = 0;

      this.touch = null;

      this.isPc = true;

      this.init();
    }

    init() {
      const {
        defaultMarkers,
        btnStyles,
        debug
      } = this.options;

      // 获取浏览器环境
      this.userAgent = getUserAgent();
      if (this.userAgent.isAndroid || this.userAgent.isiOS) {
        this.isPc = false;
      }

      // 给每个节点加上特殊标识, 方便后面操作
      setMarkClassName(document.body);

      // 创建按钮节点
      createBtnDom(this, btnStyles);

      // 创建调试节点
      if (debug) {
        createDebugDom(this);
        this.debug_userAgaent.innerHTML = `安卓: ${this.userAgent.isAndroid};&nbsp;&nbsp;&nbsp;iOS: ${this.userAgent.isiOS};`;
      }

      // 当默认数据时, 设置标记状态, defaultMarkers 格式 this.selectedMarkers 
      if (defaultMarkers && Object.keys(defaultMarkers).length > 0) {
        this.selectedMarkers = defaultMarkers;
        this.setDefaultMarkers();
      }


      // 监听事件{}
      document.addEventListener('selectionchange', this.handleSelectionChange.bind(this));
      document.addEventListener(this.userAgent.eventName.mousedown, this.handleMouseDown.bind(this));
      if (this.isPc) {
        document.addEventListener(this.userAgent.eventName.mouseup, this.handleMouseUp.bind(this));
      } else {
        document.addEventListener(this.userAgent.eventName.mousemove, this.handleMouseMove.bind(this));
      }
    }

    // 选中文本事件
    handleSelectionChange() {

      if (window.getSelection()) {
        this.selectedText = window.getSelection();
        if (this.isPc) {
          if (this.tempMarkDom && this.tempMarkDom.className === this.MAKRED_CLASSNAME) return
          if (this.checkSelectionTextLength()) {
            this.hide();
          }
          return
        }

        /*** 下面是移动端的处理 ***/

        // 没有选中文本时隐藏弹框
        if (this.checkSelectionTextLength() && !this.isMarked) {
          this.hide();
          return
        }

        const {
          commonAncestorContainer
        } = this.selectedText.getRangeAt(0);


        if (!this.checkSelectionCount()) {
          this.hide();
          return
        }


        if (disabledElement.includes(commonAncestorContainer.parentNode.nodeName)) {
          return
        }

        if (this.selectedText.toString().length > 0 && !this.isPc) {
          this.handleMouseUp();
        }

        // 调试
        if (this.options.debug) {
          this.debug_selectionText.innerHTML = `选中文本: ${this.selectedText.toString()}`;
        }

      } else {
        if (this.options.debug) {
          this.debug_selectionText.innerHTML = '不支持 window.getSelection 属性';
        }
      }
    }

    // 鼠标按下
    handleMouseDown(e) {
      // e.preventDefault()
      if (!this.isPc) {
        this.touch = e.touches[0];
      } else {
        this.pageY = e.pageY;
      }
      const target = e.target;
      if (this.options.debug) {
        this.debug_event.innerHTML = `当前坐标: ${this.pageY}, 点击目标: ${e.target.className}`;
      }
      // 当选中的文本已经标记时的处理, 隐藏 "标记" 按钮, 显示 "删除" 按钮
      if (target.className === this.MAKRED_CLASSNAME) {
        setDomDisplay(this.btn_mark, 'none');
        setDomDisplay(this.btn_delete, 'block');
        this.deleteId = e.target.id;
        this.isMarked = true;
        if (this.isPc) {
          this.tempMarkDom = target;
        }
        setTimeout(() => {
          this.show();
        }, 10);

        return
      }
      this.isMarked = false;
    }

    handleMouseMove(e) {
      // e.preventDefault()
      if (this.userAgent.isAndroid || this.userAgent.isiOS) {
        this.touch = e.touches[0];
        this.pageY = this.touch.pageY;
      } else {
        this.pageY = e.pageY;
      }

    }

    // 鼠标抬起事件
    handleMouseUp() {

      // console.log(this.selectedText)
      // console.log(this.selectedText.getRangeAt(0))

      if (this.isPc) {

        if (this.checkSelectionTextLength()) {
          return
        }

        setTimeout(() => {
          if (this.checkSelectionTextLength() && !this.isMarked) {
            this.hide();
          }
        }, 0);
        const {
          commonAncestorContainer
        } = this.selectedText.getRangeAt(0);
        if (!this.checkSelectionCount()) {
          return
        }
        if (disabledElement.includes(commonAncestorContainer.parentNode.nodeName)) {
          return
        }
      }

      const {
        commonAncestorContainer
      } = this.selectedText.getRangeAt(0);

      setDomDisplay(this.btn_mark, 'block');
      setDomDisplay(this.btn_delete, 'none');

      const {
        anchorOffset,
        focusOffset
      } = this.selectedText;


      const startIndex = Math.min(anchorOffset, focusOffset);
      const endIndex = Math.max(anchorOffset, focusOffset);
      const className = commonAncestorContainer.parentNode.className.split(' ');
      let parentClassName = className[className.length - 1];
      this.tempMarkerInfo = new Marker(setuuid(), parentClassName, 0, startIndex, endIndex);
      if (this.isPc) {

        const text = this.selectedText.toString();
        const rang = this.selectedText.getRangeAt(0);
        const span = setTextSelected(this.TEMP_MARKED_CLASSNAME, text, this.tempMarkerInfo.id);
        rang.surroundContents(span);
        this.tempMarkDom = document.getElementsByClassName(this.TEMP_MARKED_CLASSNAME)[0];

        this.show();
      } else {

        this.show();
      }


      if (this.options.debug) {
        this.debug_event.innerHTML = '当前事件: 正在选择';
      }
    }

    hide() {
      setDomDisplay(this.btn_Box, 'none');
      if (this.isPc) {
        if (!this.tempMarkDom || this.tempMarkDom.className === this.MAKRED_CLASSNAME) return
        mergeTextNode(this.tempMarkDom);
      }
    }

    show() {
      setDomDisplay(this.btn_Box, 'flex');
      if (this.isPc) {
        const domAttr = this.tempMarkDom.getBoundingClientRect();
        this.btn_Box.style.top = domAttr.top + window.scrollY - 50 + 'px';
        let left = domAttr.left + this.tempMarkDom.offsetWidth / 2 - 5;
        if (domAttr.width + domAttr.left > window.innerWidth) {
          left = domAttr.left;
        }
        this.arrow.style.left = left + 'px';
      } else {
        this.btn_Box.style.top = this.pageY - 80 + 'px';
      }
    }

    mark(e) {
      e.stopPropagation();
      const {
        parentClassName
      } = this.tempMarkerInfo;
      if (this.isPc) {
        this.tempMarkDom.className = this.MAKRED_CLASSNAME;
        Object.keys(this.markedStyles).forEach(key => {
          this.tempMarkDom.style[key] = this.markedStyles[key];
        });
        this.tempMarkDom = null;
      } else {
        const text = this.selectedText.toString();
        const rang = this.selectedText.getRangeAt(0);
        const span = setTextSelected(this.TEMP_MARKED_CLASSNAME, text, this.tempMarkerInfo.id, this.markedStyles);
        rang.surroundContents(span);
      }
      if (!this.selectedMarkers[parentClassName]) {
        this.selectedMarkers[parentClassName] = [this.tempMarkerInfo];
      } else {
        this.selectedMarkers[parentClassName].push(this.tempMarkerInfo);
      }

      this.resetMarker(parentClassName);
      this.selectedText.removeAllRanges();
      this.save();
    }

    resetMarker(parentClassName) {
      const dom = document.getElementsByClassName(parentClassName)[0];
      const newMarkerArr = [];
      let preNodeLength = 0;
      for (let i = 0; i < dom.childNodes.length; i++) {
        const node = dom.childNodes[i];
        if (node.nodeName === '#text') {
          preNodeLength = node.textContent.length;
        }
        // childIndex 为什么是 i - 1 ? 根据当前已经标记节点索引, 在后面反序列的时候才能找到正确位置
        // 比如当前节点内容为"xxx <标记节点>ooo</标记节点>", i 就是 1, 反序列的时候其实他是处于 0 的位置 
        const childIndex = i - 1;
        this.selectedMarkers[parentClassName].forEach(marker => {
          if (dom.childNodes[i].id == marker.id) {
            newMarkerArr.push(new Marker(marker.id, '', childIndex, preNodeLength, preNodeLength + node.textContent.length));
          }
        });
      }
      if (newMarkerArr.length > 0) {
        this.selectedMarkers[parentClassName] = newMarkerArr;
      } else {
        delete this.selectedMarkers[parentClassName];
      }
    }

    save() {
      const markersJson = JSON.stringify(this.selectedMarkers);
      this.hide();
      if (this.userAgent.isAndroid) ;

      if (this.userAgent.isiOS) ;

      if (this.options.onSave) {
        this.options.onSave(markersJson);
      }

      console.log(this.selectedMarkers);
    }

    del(e) {
      e.preventDefault();
      this.tempMarkDom = null;
      const dom = document.getElementById(this.deleteId);
      const className = dom.parentNode.className.split(' ');
      const parentClassName = className[className.length - 1];
      mergeTextNode(dom);
      this.resetMarker(parentClassName);
      this.save();
    }

    setDefaultMarkers() {
      const defaultMarkers = this.selectedMarkers;
      Object.keys(defaultMarkers).forEach(className => {
        const dom = document.getElementsByClassName(className)[0];
        defaultMarkers[className].forEach(marker => {
          const currentNode = dom.childNodes[marker.childIndex];
          currentNode.splitText(marker.start);
          const nextNode = currentNode.nextSibling;
          nextNode.splitText(marker.end - marker.start);
          const markedNode = setTextSelected(this.MAKRED_CLASSNAME, nextNode.textContent, marker.id, this.markedStyles);
          dom.replaceChild(markedNode, nextNode);
        });
      });
    }

    checkSelectionCount() {
      // 判断是否选中了多个， 如果只选中了一个节点 nodeType === 3
      // 还有一种判断方式, getRangeAt(0).endContainer !== getRangeAt(0).startContainer 意味着选中了多个节点
      return this.selectedText.getRangeAt(0).endContainer === this.selectedText.getRangeAt(0).startContainer
    }

    checkSelectionTextLength(){
      return this.selectedText.toString().length === 0 || !this.selectedText.getRangeAt
    }

  }

  window.WebTextMarker = WebTextMarker;

})));
//# sourceMappingURL=bundle.js.map
