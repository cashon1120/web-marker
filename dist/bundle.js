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

  const setTextSelected = (text, id, color, bgColor) => {
    return `<span class="selected_text" id="${id}" style="color: ${color}; background-color: ${bgColor}">${text}</span>`
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

  const setDomMap = (dom, arr = []) => {
    if (dom.parentNode) {
      for (let i = 0; i < dom.parentNode.childNodes.length; i++) {
        if (dom.parentNode.childNodes[i] === dom) {
          arr.push(i);
          if (dom.parentNode !== document.body) {
            setDomMap(dom.parentNode, arr);
          }
        }
      }
    }
    return arr
  };

  const getDom = (deeps, childIndex) => {
    let dom = document.body;
    deeps.forEach(domIndex => {
      for (let i = 0; i < dom.childNodes.length; i++) {
        if (i === domIndex) {
          dom = dom.childNodes[i];
        }
      }
    });
    return dom.childNodes[childIndex]
  };

  const createBtnDom = (textMarker, styles) => {

    console.log(textMarker);

      const defaultStyles = {
        position: 'fixed',
        display: 'flex',
        textAlign: 'center',
        width: '80%',
        left: '10%',
        height: '35px',
        lineHeight: '35px',
        backgroundColor: 'black',
        borderRadius: 3,
        display: 'none',
        color: '#fff',
        ...styles
      };

      const btnBox = document.createElement('div');
      btnBox.id = 'webMarkerBtnBox';

      Object.keys(defaultStyles).forEach(key => {
        btnBox.style[key] = defaultStyles[key];
      });

      btnBox.innerHTML = `
      <div style="flex: 1" id="btn_mark">标记</div>
      <div style="flex: 1" id="btn_delete">删除当前标记</div>
      <div style="flex: 1" id="btn_cancel">取消</div>
    `;
      document.body.appendChild(btnBox);
      textMarker.btn_Box = document.getElementById('webMarkerBtnBox');
      textMarker.btn_mark = document.getElementById('btn_mark');
      textMarker.btn_cancel = document.getElementById('btn_cancel');
      textMarker.btn_delete = document.getElementById('btn_delete');

      textMarker.btn_mark.addEventListener(getUserAgent().eventName.mousedown, textMarker.mark);
      textMarker.btn_cancel.addEventListener('click', textMarker.hide);
      textMarker.btn_delete.addEventListener('click', textMarker.del);
    
    };

  class textMarker {
    constructor(options) {



      // 标记样式
      this.markedStyles = {
        color: '#fff',
        backgroundColor: 'cadetblue',
        ...options.markedStyles
      };

      this.onSave = options.onSave;

      // 所有标记文本, 最后转换成json字符串保存到数据库
      this.selectedMarkers = [];

      // 当前操作dom, 目前只能是一个
      this.selectedDom = null;

      // 选中文本对象, 从 window.getSelection() 中拿
      this.selectedText = {};

      // 当前选中的节点, 多个节点不处理
      this.currentSelectedDom = [];

      // 操作框显示位置
      this.pageY = 0;

      // 临时保存标记信息, 鼠标抬起时设置, 解决点击"标记"按钮时 window.getSelection 影响 this.selectedText 的问题
      this.tempMarkerInfo = {};

      // 要删除的标记 id
      this.deleteId = '';

      // 获取浏览器环境
      this.userAgent = getUserAgent();

      // 当数据库有标记数据时, 设置标记状态
      if (Array.isArray(options.defaultMarkers) && options.defaultMarkers.length > 0) {
        this.setDefaultMarkers(options.defaultMarkers);
      }

      // 创建按钮节点
      createBtnDom(this, options.btnStyles);
      // 监听事件
      document.addEventListener("selectionchange", this.handleSelectionChange);

      document.addEventListener(this.userAgent.eventName.mousedown, (e) => {
        const target = e.target;
        // 当选中的文本已经标记时的处理, 隐藏 "标记" 按钮, 显示 "删除" 按钮
        if (target.className === 'selected_text') {
          this.pageY = e.pageY;
          setDomDisplay(this.btn_mark, 'none');
          setDomDisplay(this.btn_delete, 'block');
          this.deleteId = e.target.id;
          this.show();
          return
        }
        this.currentSelectedDom = [];
        this.selectedDom = target;
        this.currentSelectedDom.push(target);
        document.addEventListener(this.userAgent.eventName.mousemove, this.handleMouseMove);
        document.addEventListener(this.userAgent.eventName.mouseup, this.handleMouseUp);
      });

    }

    // 选中文本事件
    handleSelectionChange = () => {
      if (window.getSelection()) {
        this.selectedText = window.getSelection();
      } else {
        return
      }
    }

    // 鼠标移动事件
    handleMouseMove = e => {
      if (!this.currentSelectedDom.includes(e.target)) {
        this.currentSelectedDom.push(e.target);
      }
    }

    // 鼠标抬起事件
    handleMouseUp = e => {
      document.removeEventListener(this.userAgent.eventName.mousemove, this.handleMouseMove);
      document.removeEventListener(this.userAgent.eventName.mouseup, this.handleMouseUp);

      if (this.selectedText.toString().length === 0 || !this.selectedText.getRangeAt){
        this.hide();
        return
      }

      // 遇到以下节点时不处理, 可按需要添加
      const igonreDomElement = ['BUTTON', 'H1', 'H2', 'IMG'];
      if (igonreDomElement.includes(this.selectedText.getRangeAt(0).commonAncestorContainer.parentNode.nodeName)) {
        return
      }

      // 选中多个节点时不处理
      if (this.currentSelectedDom.length > 1) {
        return
      }

      setDomDisplay(this.btn_mark, 'block');
      setDomDisplay(this.btn_delete, 'none');


      const {
        anchorOffset,
        focusOffset
      } = this.selectedText;

      this.pageY = e.pageY;
      let childIndex = 0;
      for (let i = 0; i < this.selectedDom.childNodes.length; i++) {
        if (this.selectedDom.childNodes[i] === this.selectedText.anchorNode) {
          childIndex = i;
        }
      }
      const deeps = setDomMap(this.selectedDom, []);
      this.tempMarkerInfo = {
        id: setuuid(),
        domDeeps: deeps.reverse(),
        childIndex,
        startIndex: Math.min(anchorOffset, focusOffset),
        endIndex: Math.max(anchorOffset, focusOffset)
      };
      this.show();

    }

    hide = () => {
      setDomDisplay(this.btn_Box, 'none');
    }

    show = () => {
      setDomDisplay(this.btn_Box, 'flex');
      this.btn_Box.style.top = this.pageY + 20 + 'px';
    }

    mark = e => {
      e.preventDefault();
      e.stopPropagation();
      const text = this.selectedText.toString();
      const rang = this.selectedText.getRangeAt(0);
      var span = document.createElement("span");
      span.className = 'selected_text';
      span.id = this.tempMarkerInfo.id;
      span.style.color = this.markedStyles.color;
      span.style.backgroundColor = this.markedStyles.backgroundColor;
      span.innerHTML = text;
      rang.surroundContents(span);
      this.selectedMarkers.push(this.tempMarkerInfo);
      this.selectedText.removeAllRanges();
      this.hide();
      this.save();
    }

    save = () => {
      const markersJson = JSON.stringify(this.selectedMarkers);
      const userAgent = getUserAgent();

      if(this.onSave){
        this.onSave(markersJson);
      }
    }

    del = () => {
      this.selectedMarkers.forEach((marker, index) => {
        const dom = document.getElementById(this.deleteId);
        if (marker.id.toString() === this.deleteId) {
          const replaceTextNode = document.createTextNode(dom.innerText);
          dom.parentNode.replaceChild(replaceTextNode, dom);

          // 当删除同一节点的前面的标记时, 修正后面标记相关参数
          const {domDeeps, childIndex, endIndex } = marker;
          this.selectedMarkers.forEach(item => {
            if(JSON.stringify(item.domDeeps) === JSON.stringify(domDeeps) && item.childIndex > childIndex){
              item.childIndex = item.childIndex - 2;
              item.startIndex = item.startIndex + endIndex;
              item.endIndex = item.endIndex + endIndex;
            }
          });

          this.selectedMarkers.splice(index, 1);
          this.save();
        }
      });
    }

    setDefaultMarkers = defaultMarkers => {
      this.selectedMarkers = defaultMarkers;
      defaultMarkers.forEach(marker => {
        const textNode = getDom(marker.domDeeps, marker.childIndex);
        if(!textNode) return
        const html = textNode.textContent;
        const startHtml = html.substr(0, marker.startIndex);
        const replaceHtml = html.substr(marker.startIndex, marker.endIndex - marker.startIndex);
        const endHtml = html.substr(marker.endIndex);
        textNode.textContent =
          `${startHtml}${setTextSelected(replaceHtml, marker.id, this.markedStyles.color, this.markedStyles.backgroundColor)}${endHtml}`;
        const parentNode = textNode.parentNode;
        let parentHtml = parentNode.innerHTML;
        parentHtml = parentHtml.replace(/\&lt;/g, '<').replace(/\&gt;/g, '>');
        parentNode.innerHTML = parentHtml;
      });
    }
  }

  window.webMarker = textMarker;

})));
