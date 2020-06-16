(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  const setDomDisplay = (dom, value) => {
    if(!dom) return
    dom.style.display = value;
  };

  const setuuid = () => {
    return new Date().getTime()
  };

  const setTextSelected = (className, text, id) => {
    const span = document.createElement('span');
    span.className = className;
    span.id = id;
    span.innerHTML = text;
    return span
  };

  const getUserAgent = () => {
    const u = navigator.userAgent;
    const isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
    const isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    const isPC = (isAndroid || isiOS) ? false : true;
    const isSafari = /Safari/.test(u) && !/Chrome/.test(u);
    const eventName = {
      mousedown: isPC ? 'mousedown' : 'touchstart',
      mouseup: isPC ? 'mouseup' : 'touchend',
      mousemove: isPC ? 'mousemove': 'touchmove'
    };
    return {
      isAndroid,
      isiOS,
      isPC,
      isSafari,
      eventName
    }
  };

  const setMarkClassName = (dom, index = 1) => {
    if(dom === document.body){
      dom.className = '_WM-0';
    }
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

  const setDomStyles = (dom, styles) => {
    Object.keys(styles).forEach(key => {
      dom.style[key] = styles[key];
    });
  };

  const loadStyles = url => {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(link);
  };

  const getElementById = id => document.getElementById(id);

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
      setDomStyles(debugDom, styles);
      debugDom.innerHTML = `
      <div id="debug_userAgaent"></div>
      <div id="debug_selectionText">选中文本:</div>
      <div id="debug_event">事件:</div>
    `;

      // 
      document.body.appendChild(debugDom);
      textMarker.debug_userAgaent = document.getElementById('debug_userAgaent');
      textMarker.debug_selectionText = document.getElementById('debug_selectionText');
      textMarker.debug_event = document.getElementById('debug_event');
    };

  const createBtnDom = () => {

    const btnBox = document.createElement('div');

    btnBox.id = 'webMarkerBtnBox';
   
    btnBox.innerHTML = `<div>
        <div id="webMarker_arrow"></div>
        <div id="webMarker_btn_mark">高亮</div>
        <div id="webMarker_btn_notes">笔记</div>
        <div id="webMarker_btn_discuss">讨论</div>
        <div id="webMarker_btn_delete">移除</div>
        <div id="webMarker_btn_save">保存</div>
      </div>
    `;

    document.body.appendChild(btnBox);
  };

  const loadData = () => {
    window.addEventListener('load', () => {

      createBtnDom();
      loadStyles('./style.css');
      // localStorage.removeItem('markers')
      // 获取已有数据
      let defaultMarkers = {};
      if (window.jsObject && window.jsObject.getCallBack) {
        if(window.jsObject.getCallBack().length > 0){
          defaultMarkers = JSON.parse(window.jsObject.getCallBack());
        }
        
        // document.getElementById('windowobject').innerHTML = window.jsObject.getCallBack().length
      } else {
      
        defaultMarkers = JSON.parse(localStorage.getItem('markers'));
        // document.getElementById('windowobject').innerHTML = '没有 getCallBack 对象'
      }
    
      const myTextMarker = new window.WebTextMarker({
        defaultMarkers,
        debug: true,
        markedClassName: '_web_marker',
        focusMarkedClassName: '_focus_web_marker',
        selectedClassName: '_temp_marker',
        btnWrapperID: 'webMarkerBtnBox',
        btnArrowID: 'webMarker_arrow',
        btnMarkID: 'webMarker_btn_mark',
        btnDeleteID: 'webMarker_btn_delete'
      });

      const handleSave = () => {
        const markersJson = JSON.stringify(myTextMarker.getAllMarkes());
        if (myTextMarker.userAgent.isAndroid && window.jsObject) {
          window.jsObject.save(markersJson);
          return
        }

        if (myTextMarker.userAgent.isiOS) {
          // window.webkit.jsObject.callBack.postMessage(this.selectedMarkers)
          return
        }

        localStorage.setItem('markers', markersJson);
      };

      const handleDelete = () => {
        myTextMarker.del();
      };

      const handleNotes = () => {
        const id = myTextMarker.getCurrentId();
        if (myTextMarker.userAgent.isAndroid && window.jsObject) {
          window.jsObject.save(id);
          return
        }

        if (myTextMarker.userAgent.isiOS) {
          // window.webkit.jsObject.callBack.postMessage(this.selectedMarkers)
          return
        }

        console.log('笔记', id);
      };

      const handleDiscuss = () => {
        const id = myTextMarker.getCurrentId();
        if (myTextMarker.userAgent.isAndroid && window.jsObject) {
          window.jsObject.save(id);
          return
        }

        if (myTextMarker.userAgent.isiOS) {
          // window.webkit.jsObject.callBack.postMessage(this.selectedMarkers)
          return
        }

        console.log('讨论', id);
      };

      const btn_mark = getElementById('webMarker_btn_mark');
      // const btn_cancel = getElementById('webMarker_btn_cancel')
      const btn_delete = getElementById('webMarker_btn_delete');
      const btn_notes = getElementById('webMarker_btn_notes');
      const btn_discuss = getElementById('webMarker_btn_discuss');
      const btn_save = getElementById('webMarker_btn_save');
    
      const { mousedown } = getUserAgent().eventName;
      btn_mark.addEventListener(mousedown, (e) => myTextMarker.mark(e));
      // btn_cancel.addEventListener(mousedown, (e) => textMarker.hide(e))
      btn_delete.addEventListener(mousedown, handleDelete);
      btn_save.addEventListener(mousedown, handleSave);
      btn_notes.addEventListener(mousedown, handleNotes);
      btn_discuss.addEventListener(mousedown, handleDiscuss);

    });
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
   * @param options.focusMarkedStyles: 选中已标记文本样式
   * @param options.onSave: 标记后回调, 必填
   */

  class WebTextMarker {
    constructor(options) {

      this.MARKED_CLASSNAME = options.markedClassName;
      this.TEMP_MARKED_CLASSNAME = options.selectedClassName;
      this.FOUCE_MARKED_CLASSNAME = options.focusMarkedClassName;

      this.options = options || {};

      this.btnWrapper = null;

      // 所有标记文本, 格式为: {parentClassName: [Marker, Marker, ...]}, 最后转换成json字符串保存到数据库
      this.selectedMarkers = {};

      // 选中文本对象, 从 window.getSelection() 中拿
      this.selectedText = {};

      // 临时标记节点, 主要是 PC 端用
      this.tempMarkDom = null;

      this.hasTempDom = false;

      // 临时保存标记信息, 鼠标抬起时设置, 解决点击"标记"按钮时 window.getSelection 影响 this.selectedText 的问题
      this.tempMarkerInfo = {};

      // 要删除的标记 id
      this.currentId = '';

      // 是否已标记
      this.isMarked = false;

      // 弹框顶部位置
      this.pageY = 0;

      // 移动端获取点击坐标, touchs[0]
      this.touch = null;

      this.init();
    }

    init() {
      const {
        defaultMarkers,
        debug
      } = this.options;

      // 获取浏览器环境
      this.userAgent = getUserAgent();

      // 给每个节点加上特殊标识, 方便后面操作
      setMarkClassName(document.body);


      // 创建调试节点
      if (debug) {
        createDebugDom(this);
        this.debug_userAgaent.innerHTML = `
        android: ${this.userAgent.isAndroid};&nbsp;&nbsp;&nbsp;
        iOS: ${this.userAgent.isiOS};&nbsp;&nbsp;&nbsp;
        pc: ${this.userAgent.isPC}`;
      }

      // 当默认数据时, 设置标记状态, defaultMarkers 格式 this.selectedMarkers 
      if (defaultMarkers && Object.keys(defaultMarkers).length > 0) {
        this.selectedMarkers = defaultMarkers;
        this.setDefaultMarkers();
      }

      // 监听事件{}
      document.addEventListener('selectionchange', this.handleSelectionChange.bind(this));
      document.addEventListener(this.userAgent.eventName.mousedown, this.handleMouseDown.bind(this));

      // 移动端在选择文本的时候无法监听移动事件, 所以分开处理, 移动端口直接在 selectionchange 事件中控制流程
      // PC 端的优势在选中文本后先添加一个临时节点, 方便定位, 鼠标抬起后再执行后续, 移动端暂不能做到

      if (this.userAgent.isPC) {
        document.addEventListener(this.userAgent.eventName.mouseup, this.handleMouseUp.bind(this));
      }
    }

    // 选中文本事件
    handleSelectionChange() {

      if (window.getSelection()) {
        this.selectedText = window.getSelection();
        // 没有选中文本时隐藏弹框1
        if (this.isMarked) {
          return
        }
        if (this.userAgent.isPC) {
          if (this.checkNoSelectionText() && !this.isMarked && !this.hasTempDom) {
            this.hide();
            return
          }
          // 当前选中的是已标记节点不执行任何操作
          if (this.tempMarkDom && this.tempMarkDom.className.indexOf(this.MARKED_CLASSNAME) > -1) return
          return
        }

        /*** 下面是移动端的处理 ***/

        // 选中的是已标记文本
        const {
          commonAncestorContainer
        } = this.selectedText.getRangeAt(0);

        if (this.checkNoSelectionText() && !this.isMarked || !this.checkSelectionCount() || disabledElement.includes(commonAncestorContainer.parentNode.nodeName)) {
          this.hide();
          return
        }

        if (this.selectedText.toString().length > 0) {
          this.handleMouseUp();
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
      if (this.userAgent.isPC) {
        this.pageY = e.pageY;

      } else {
        this.touch = e.touches[0];
      }
      const tempDom = document.getElementsByClassName(this.TEMP_MARKED_CLASSNAME)[0];
      if (tempDom) {
        mergeTextNode(tempDom);
        this.hide();
      }
      const target = e.target;
      if (this.options.debug) {
        this.debug_event.innerHTML = `当前坐标: ${this.pageY}, 点击目标: ${e.target.className}`;
      }
      // 当选中的文本已经标记时的处理, 隐藏 "标记" 按钮, 显示 "删除" 按钮
      if (target.className.indexOf(this.MARKED_CLASSNAME) > -1) {
        this.removeFocusStyle();
        target.className = `${this.MARKED_CLASSNAME} ${this.FOUCE_MARKED_CLASSNAME}`;

        setDomDisplay(document.getElementById(this.options.btnMarkID), 'none');
        setDomDisplay(document.getElementById(this.options.btnDeleteID), 'block');
        this.currentId = e.target.id;
        this.isMarked = true;
        this.tempMarkDom = target;
        setTimeout(() => {
          this.show();
        }, 0);
        return
      }
      this.tempMarkDom = null;
      this.isMarked = false;
      this.hide();
    }

    // 鼠标抬起事件, 在移动端是由 handleSelectionChange 触发
    handleMouseUp() {
      if (this.userAgent.isPC) {

        if (this.checkNoSelectionText()) {
          return
        }

        setTimeout(() => {
          if (this.checkNoSelectionText() && !this.isMarked && !this.hasTempDom) {
            this.hide();
          }
        }, 0);

        const {
          commonAncestorContainer
        } = this.selectedText.getRangeAt(0);
        if (!this.checkSelectionCount() || disabledElement.includes(commonAncestorContainer.parentNode.nodeName)) {
          return
        }
      }

      const {
        commonAncestorContainer
      } = this.selectedText.getRangeAt(0);
      setDomDisplay(document.getElementById(this.options.btnMarkID), 'block');
      setDomDisplay(document.getElementById(this.options.btnDeleteID), 'none');

      const {
        anchorOffset,
        focusOffset
      } = this.selectedText;

      const startIndex = Math.min(anchorOffset, focusOffset);
      const endIndex = Math.max(anchorOffset, focusOffset);
      const className = commonAncestorContainer.parentNode.className.split(' ');
      let parentClassName = className[className.length - 1];
      this.tempMarkerInfo = new Marker(setuuid(), parentClassName, 0, startIndex, endIndex);
      this.hasTempDom = true;
      if (this.userAgent.isPC) {
        const text = this.selectedText.toString();
        const rang = this.selectedText.getRangeAt(0);
        const span = setTextSelected(this.TEMP_MARKED_CLASSNAME, text, this.tempMarkerInfo.id);
        rang.surroundContents(span);
      }

      this.show();
    }

    hide() {
      setDomDisplay(this.btnWrapper, 'none');
      this.removeFocusStyle();
      this.currentId = null;
      if (this.userAgent.isPC) {
        const tempDom = document.getElementsByClassName(this.TEMP_MARKED_CLASSNAME)[0];
        if (!tempDom || tempDom.className.indexOf(this.MARKED_CLASSNAME) > -1) return
        mergeTextNode(tempDom);
        this.hasTempDom = false;
      } else {
        this.tempMarkDom = null;
      }
    }

    // 显示操作按钮
    show() {
      if(!this.btnWrapper){
        this.btnWrapper = document.getElementById(this.options.btnWrapperID);
      }
      if(!this.arrow){
        this.arrow = document.getElementById(this.options.btnArrowID);
      }
      setDomDisplay(this.btnWrapper, 'flex');
      let tempDomAttr = null;
      let left = '50%';
      let top = 0;
      let tempDom = null;
      if (this.tempMarkDom) {
        tempDom = this.tempMarkDom;
      } else {
        tempDom = document.getElementsByClassName(this.TEMP_MARKED_CLASSNAME)[0];
      }

      if (tempDom) {
        tempDomAttr = tempDom.getBoundingClientRect();
        left = tempDomAttr.left + tempDom.offsetWidth / 2;
        if (tempDomAttr.width + tempDomAttr.left > window.innerWidth) {
          left = tempDomAttr.left + 5;
        }
        top = tempDomAttr.top;
      }

      if (this.userAgent.isPC) {
        left = Math.min(window.innerWidth - 30, Math.max(10, left - 15)); 
        this.btnWrapper.style.top = top + window.scrollY - 50 + 'px';
        this.arrow.style.left = left + 'px';
      } else {
        top = tempDom ? top + window.scrollY - 50 : this.touch.pageY - 80;
        left = tempDom ? left : this.touch.pageX;
        this.debug_event.innerHTML = top;
        this.btnWrapper.style.top = top + 'px';
        this.arrow.style.left = left + 'px';
      }
    }

    // 重新设置当前节点标记信息, domClassName 为当前节点 className
    resetMarker(domClassName) {
      const dom = document.getElementsByClassName(domClassName)[0];
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
        this.selectedMarkers[domClassName].forEach(marker => {
          if (dom.childNodes[i].id == marker.id) {
            newMarkerArr.push(new Marker(marker.id, '', childIndex, preNodeLength, preNodeLength + node.textContent.length));
          }
        });
      }
      if (newMarkerArr.length > 0) {
        this.selectedMarkers[domClassName] = newMarkerArr;
      } else {
        delete this.selectedMarkers[domClassName];
      }
    }

    // 设置默认选中数据
    setDefaultMarkers() {
      const defaultMarkers = this.selectedMarkers;
      Object.keys(defaultMarkers).forEach(className => {
        const dom = document.getElementsByClassName(className)[0];
        if (!dom) return
        defaultMarkers[className].forEach(marker => {
          const currentNode = dom.childNodes[marker.childIndex];
          currentNode.splitText(marker.start);
          const nextNode = currentNode.nextSibling;
          nextNode.splitText(marker.end - marker.start);
          const markedNode = setTextSelected(this.MARKED_CLASSNAME, nextNode.textContent, marker.id);
          dom.replaceChild(markedNode, nextNode);
        });
      });
    }

    // 判断当前选中内容所包含的节点数量
    checkSelectionCount() {
      // 判断是否选中了多个， 如果只选中了一个节点 nodeType === 3
      // 还有一种判断方式, getRangeAt(0).endContainer !== getRangeAt(0).startContainer 意味着选中了多个节点
      return this.selectedText.getRangeAt(0).endContainer === this.selectedText.getRangeAt(0).startContainer
    }

    // 判断当前是否有选中文本
    checkNoSelectionText() {
      return this.selectedText.toString().length === 0 || !this.selectedText.getRangeAt
    }

    // 移除焦点样式
    removeFocusStyle() {
      const focusMarker = document.getElementsByClassName(this.FOUCE_MARKED_CLASSNAME)[0];
      if (focusMarker) {
        focusMarker.className = this.MARKED_CLASSNAME;
      }
    }

    // 标记选中文本
    mark(e) {
      e.stopPropagation();
      const {
        parentClassName
      } = this.tempMarkerInfo;
      if (this.userAgent.isPC) {
        const tempMarkDom = document.getElementsByClassName(this.TEMP_MARKED_CLASSNAME)[0];
        tempMarkDom.className = this.MARKED_CLASSNAME;
      } else {
        const text = this.selectedText.toString();
        const rang = this.selectedText.getRangeAt(0);
        const span = setTextSelected(this.MARKED_CLASSNAME, text, this.tempMarkerInfo.id);
        rang.surroundContents(span);
      }

      if (!this.selectedMarkers[parentClassName]) {
        this.selectedMarkers[parentClassName] = [this.tempMarkerInfo];
      } else {
        this.selectedMarkers[parentClassName].push(this.tempMarkerInfo);
      }

      this.resetMarker(parentClassName);
      this.selectedText.removeAllRanges();
      this.hide();
    }

    // 删除当前标记
    del() {
      if(!this.currentId) return
      this.tempMarkDom = null;
      const dom = document.getElementById(this.currentId);
      const className = dom.parentNode.className.split(' ');
      const parentClassName = className[className.length - 1];
      mergeTextNode(dom);
      this.resetMarker(parentClassName);
    }

    // 返回当前选中标记ID
    getCurrentId(){
      return this.currentId
    }

    // 返回当前页所有已标记数据
    getAllMarkes() {
      return this.selectedMarkers
    }

  }

  window.WebTextMarker = WebTextMarker;

  loadData();

})));
//# sourceMappingURL=bundle.js.map
