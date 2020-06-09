export const setDomDisplay = (dom, value) => {
  dom.style.display = value
}

export const setuuid = () => {
  return new Date().getTime()
}

export const setTextSelected = (className, text, id, styles, type) => {
  const span = document.createElement('span')
  span.className = className
  span.id = id
  span.innerHTML = text
  Object.keys(styles).forEach(key => {
    span.style[key] = styles[key]
  })
  if(type){
    return span
  }
  const div = document.createElement('div')
  div.appendChild(span)
  return div.innerHTML
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

export const setDomMap = (dom, arr = []) => {
  if (dom.parentNode) {
    for (let i = 0; i < dom.parentNode.childNodes.length; i++) {
      if (dom.parentNode.childNodes[i] === dom) {
        arr.push(i)
        if (dom.parentNode !== document.body) {
          setDomMap(dom.parentNode, arr)
        }
      }
    }
  }
  return arr
}

export const getDom = (deeps, childIndex) => {
  let dom = document.body
  deeps.forEach(domIndex => {
    for (let i = 0; i < dom.childNodes.length; i++) {
      if (i === domIndex) {
        dom = dom.childNodes[i]
      }
    }
  })
  return dom.childNodes[childIndex]
}