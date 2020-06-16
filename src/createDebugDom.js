import {setDomStyles} from './utils'
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
    }
    const debugDom = document.createElement('div')

    debugDom.id = 'webMarkerDebugBox'
    setDomStyles(debugDom, styles)
    debugDom.innerHTML = `
      <div id="debug_userAgaent"></div>
      <div id="debug_selectionText">选中文本:</div>
      <div id="debug_event">事件:</div>
    `

    // 
    document.body.appendChild(debugDom)
    textMarker.debug_userAgaent = document.getElementById('debug_userAgaent')
    textMarker.debug_selectionText = document.getElementById('debug_selectionText')
    textMarker.debug_event = document.getElementById('debug_event')
  }

  export default createDebugDom