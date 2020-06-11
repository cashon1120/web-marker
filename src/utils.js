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
  Object.keys(styles).forEach(key => {
    span.style[key] = styles[key]
  })
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
        const ingoreNodes = ['BR', 'HR']
        if(ingoreNodes.includes(childNode.nodeName)) return
        childNode.className = childNode.className ? childNode.className + ` _WM-${index}-${i}` : `_WM-${index}-${i}`
        if (childNode.childNodes.length > 0) {
          setMarkClassName(childNode, index + 1 + `-${i}`)
        }
      }
    }
  }
}