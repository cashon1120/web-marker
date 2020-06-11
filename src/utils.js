export const setDomDisplay = (dom, value) => {
  dom.style.display = value
}

export const setuuid = () => {
  return new Date().getTime()
}

export const setTextSelected = (className, text, id, styles) => {
  const span = document.createElement('span')
  span.className = className
  span.id = id
  span.innerHTML = text
  if (styles) {
    Object.keys(styles).forEach(key => {
      span.style[key] = styles[key]
    })
  }
  return span
}

export const getUserAgent = () => {
  const u = navigator.userAgent
  const isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1
  const isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
  const eventName = {
    mousedown: isAndroid || isiOS ? 'touchstart' : 'mousedown',
    mouseup: isAndroid || isiOS ? 'touchend' : 'mouseup',
    mousemove: isAndroid || isiOS ? 'touchmove' : 'mousemove',
  }
  return {
    isAndroid,
    isiOS,
    eventName
  }
}

export const setMarkClassName = (dom, index = 1) => {
  if (dom.childNodes) {
    for (let i = 0; i < dom.childNodes.length; i++) {
      const childNode = dom.childNodes[i]
      if (childNode.nodeType === 1) {
        const ingoreNodes = ['BR', 'HR', 'SCRIPT', 'BUTTON']
        if (!ingoreNodes.includes(childNode.nodeName)) {
          childNode.className = childNode.className ? childNode.className + ` _WM-${index}-${i}` : `_WM-${index}-${i}`
        }
        if (childNode.childNodes.length > 0) {
          setMarkClassName(childNode, index + 1 + `-${i}`)
        }
      }
    }
  }
}

export const mergeTextNode = dom => {
  const parentNode = dom.parentNode
  if(!parentNode) return
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
}