export const setDomDisplay = (dom, value) => {
  if(!dom) return
  dom.style.display = value
}

export const setuuid = () => {
  return new Date().getTime()
}

export const setTextSelected = (className, text, id) => {
  const span = document.createElement('span')
  span.className = className
  span.id = id
  span.innerHTML = text
  return span
}

export const getUserAgent = () => {
  const u = navigator.userAgent
  const isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1
  const isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
  const isPC = (isAndroid || isiOS) ? false : true
  const isSafari = /Safari/.test(u) && !/Chrome/.test(u);
  const eventName = {
    mousedown: isPC ? 'mousedown' : 'touchstart',
    mouseup: isPC ? 'mouseup' : 'touchend',
    mousemove: isPC ? 'mousemove': 'touchmove'
  }
  return {
    isAndroid,
    isiOS,
    isPC,
    isSafari,
    eventName
  }
}

export const setMarkClassName = (dom, index = 1) => {
  if(dom === document.body){
    dom.className = '_WM-0'
  }
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

export const setDomStyles = (dom, styles) => {
  Object.keys(styles).forEach(key => {
    dom.style[key] = styles[key]
  })
}

export const loadStyles = url => {
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = url;
  var head = document.getElementsByTagName('head')[0];
  head.appendChild(link);
}

export const getElementById = id => document.getElementById(id)