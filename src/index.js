import {
  setDomDisplay,
  setuuid,
  setTextSelected,
  getUserAgent,
  setMarkClassName
} from './utils'
import createBtnDom from './createBtnDom.js'


/**
 * @class Marker
 * @param id: id
 * @param parentClassName: 父节点className, 对应 selectedText 
 * @param childIndex: 操作框样式
 * @param start: 标记后回调, 必填
 * @param end: 标记后回调, 必填
 */
class Marker {
  constructor(id, parentClassName, childIndex, start, end){
    this.id = id
    this.childIndex = childIndex
    this.start = start
    this.end = end
    if(parentClassName){
      this.parentClassName = parentClassName
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

    if(options.markedStyles && Object.prototype.toString.call(options.markedStyles) === '[object Object]'){
      throw new Error('defaultMarkers 必须为一个对象')
    }

    if(options.btnStyles && Object.prototype.toString.call(options.btnStyles) === '[object Object]'){
      throw new Error('btnStyles 必须为一个对象')
    }

    this.MAKRED_CLASSNAME = 'web_text_marker'

    // 标记样式
    this.markedStyles = {
      color: '#fff',
      backgroundColor: 'cadetblue',
      ...options.markedStyles
    }

    // 回调
    this.onSave = options.onSave

    // 所有标记文本, 最后转换成json字符串保存到数据库
    this.selectedMarkers = {}

    // 当前操作dom, 目前只能是一个
    this.selectedDom = null

    // 选中文本对象, 从 window.getSelection() 中拿
    this.selectedText = {}

    // 操作框显示位置
    this.pageY = 0

    // 临时保存标记信息, 鼠标抬起时设置, 解决点击"标记"按钮时 window.getSelection 影响 this.selectedText 的问题
    this.tempMarkerInfo = {}

    // 要删除的标记 id
    this.deleteId = ''

    // 是否已标记
    this.isMarked = false

    // 获取浏览器环境
    this.userAgent = getUserAgent()

    // 给每个节点加上特殊标识, 方便后面操作
    setMarkClassName(document.body)

    // 当数据库有标记数据时, 设置标记状态
    if (options.defaultMarkers && Object.keys(options.defaultMarkers).length > 0) {
      this.selectedMarkers = options.defaultMarkers
      this.setDefaultMarkers()
    }

    // 创建按钮节点
    createBtnDom(this, options.btnStyles)

    // 监听事件
    document.addEventListener('selectionchange', this.handleSelectionChange.bind(this))
    document.addEventListener(this.userAgent.eventName.mousedown, this.handleMouseDown.bind(this))
    document.addEventListener(this.userAgent.eventName.mouseup, this.handleMouseUp.bind(this))
  }

  // 选中文本事件
  handleSelectionChange() {
    if (window.getSelection()) {
      this.selectedText = window.getSelection()
    } else {
      return
    }
  }

  // 鼠标按下
  handleMouseDown(e) {
    const target = e.target
    // 当选中的文本已经标记时的处理, 隐藏 "标记" 按钮, 显示 "删除" 按钮
    if (target.className === this.MAKRED_CLASSNAME) {
      this.pageY = e.pageY
      setDomDisplay(this.btn_mark, 'none')
      setDomDisplay(this.btn_delete, 'block')
      this.deleteId = e.target.id
      this.show()
      this.isMarked = true
      return
    }
    this.isMarked = false
  }

  // 鼠标抬起事件
  handleMouseUp(e) {

    if (this.isMarked) {
      return
    }

    if (this.selectedText.toString().length === 0 || !this.selectedText.getRangeAt) {
      return
    }

    setTimeout(() => {
      if (this.selectedText.toString().length === 0 || !this.selectedText.getRangeAt) {
        this.hide()
      }
    }, 0);

    const {
      commonAncestorContainer
    } = this.selectedText.getRangeAt(0)
    if (commonAncestorContainer.nodeType !== 3 || commonAncestorContainer.parentNode.className === this.MAKRED_CLASSNAME) {
      return
    }

    this.selectedDom = commonAncestorContainer.parentNode
    // 遇到以下节点时不处理, 可按需要添加
    const disabledElement = ['BUTTON', 'H1', 'H2', 'IMG']
    if (disabledElement.includes(commonAncestorContainer.parentNode.nodeName)) {
      return
    }

    setDomDisplay(this.btn_mark, 'block')
    setDomDisplay(this.btn_delete, 'none')

    const {
      anchorOffset,
      focusOffset
    } = this.selectedText
    this.pageY = e.pageY

    const startIndex = Math.min(anchorOffset, focusOffset)
    const endIndex = Math.max(anchorOffset, focusOffset)
    const className = commonAncestorContainer.parentNode.className.split(' ')
    const parentClassName = className[className.length - 1]
    this.tempMarkerInfo = new Marker(setuuid(), parentClassName, 0, startIndex, endIndex)
    this.show()

  }

  hide() {
    setDomDisplay(this.btn_Box, 'none')
  }

  show() {
    setDomDisplay(this.btn_Box, 'flex')
    this.btn_Box.style.top = this.pageY + 20 + 'px'
  }

  mark(e) {
    e.preventDefault()
    e.stopPropagation()
    const text = this.selectedText.toString()
    const rang = this.selectedText.getRangeAt(0)
    const span = setTextSelected(this.MAKRED_CLASSNAME, text, this.tempMarkerInfo.id, this.markedStyles)
    rang.surroundContents(span);
    const {
      parentClassName,
      id,
      start,
      end
    } = this.tempMarkerInfo
    const newMark = {
      id,
      start,
      end
    }

    if (!this.selectedMarkers[parentClassName]) {
      this.selectedMarkers[parentClassName] = [newMark]
    } else {
      this.selectedMarkers[parentClassName].push(newMark)
    }

    const newMarkerArr = this.resetMarker(parentClassName)
    this.selectedMarkers[parentClassName] = newMarkerArr
    this.selectedText.removeAllRanges()
    this.hide()
    this.save()
  }

  resetMarker(parentClassName) {
    const dom = document.getElementsByClassName(parentClassName)[0]
    const newMarkerArr = []
    let childIndex = 0
    let preNodeLength = 0
    for (let i = 0; i < dom.childNodes.length; i++) {
      const node = dom.childNodes[i]
      if (node.nodeType !== 1 || node.className.indexOf(this.MAKRED_CLASSNAME) < 0) {
        preNodeLength = node.textContent.length
      }
      this.selectedMarkers[parentClassName].forEach(marker => {
        if (dom.childNodes[i].id == marker.id) {
          newMarkerArr.push(new Marker(marker.id, '', childIndex, preNodeLength, preNodeLength + dom.childNodes[i].textContent.length,))
          childIndex += 2
        }

      })
    }
    return newMarkerArr
  }

  save() {
    const markersJson = JSON.stringify(this.selectedMarkers)
    const userAgent = getUserAgent()
    this.hide()
    if (userAgent.isAndroid) {
      // window.jsObject...
    }

    if (userAgent.isiOS) {
      // window.webkit.jsObject.callBack.postMessage(this.selectedMarkers)
    }

    if (this.onSave) {
      this.onSave(markersJson)
    }

    console.log(this.selectedMarkers)
  }

  del() {

    const dom = document.getElementById(this.deleteId)
    const parentNode = dom.parentNode
    const className = parentNode.className.split(' ')
    const parentClassName = className[className.length - 1]
    const text = dom.innerText
    const replaceTextNode = document.createTextNode(text)
    parentNode.replaceChild(replaceTextNode, dom)
    const preDom = replaceTextNode.previousSibling
    const nextDom = replaceTextNode.nextSibling

    // 合并文本节点
    if (preDom && preDom.nodeType === 3) {
      preDom.textContent = preDom.textContent + text
      parentNode.removeChild(replaceTextNode)
      if (nextDom && nextDom.nodeType === 3) {
        preDom.textContent = preDom.textContent + nextDom.textContent
        parentNode.removeChild(nextDom)
      }
    } else {
      if (nextDom && nextDom.nodeType === 3) {
        replaceTextNode.textContent = replaceTextNode.textContent + nextDom.textContent
        parentNode.removeChild(nextDom)
      }
    }
    const newMarkerArr = this.resetMarker(parentClassName)
    this.selectedMarkers[parentClassName] = newMarkerArr
    this.save()
  }

  setDefaultMarkers() {
    const defaultMarkers = this.selectedMarkers
    console.log(defaultMarkers)
    Object.keys(defaultMarkers).forEach(className => {
      const dom = document.getElementsByClassName(className)[0]
      defaultMarkers[className].forEach(marker => {
        const currentNode = dom.childNodes[marker.childIndex]
        currentNode.splitText(marker.start);
        const nextNode = currentNode.nextSibling;
        nextNode.splitText(marker.end - marker.start)
        const markedNode = setTextSelected(this.MAKRED_CLASSNAME, nextNode.textContent, marker.id, this.markedStyles)
        dom.replaceChild(markedNode, nextNode)
      })
    })
  }
}

window.WebTextMarker = WebTextMarker