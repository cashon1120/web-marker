import {getUserAgent, setDomStyles} from './utils'

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
    }
    const btnBox = document.createElement('div')

    btnBox.id = 'webMarkerBtnBox'
    setDomStyles(btnBox, defaultStyles)

    btnBox.style.backgroundColor = 'transparent'
    const divStyle = `flex: 1; background-color: ${defaultStyles.backgroundColor}; border-right: 1px solid rgba(255,255,255,.3)` 
    btnBox.innerHTML = `
      <div style="${divStyle}" id="webMarker_btn_mark">标记</div>
      <div style="${divStyle}" id="webMarker_btn_delete">删除选中标记</div>
      <div style="${divStyle}; border-right: 0" id="webMarker_btn_cancel">取消</div>
      <div id="webMarker_arrow"></div>
    `

    document.body.appendChild(btnBox)

    const arrow = document.getElementById('webMarker_arrow')
    arrow.style.position = 'absolute'
    arrow.style.width = '10px'
    arrow.style.height = '10px'
    arrow.style.backgroundColor = defaultStyles.backgroundColor
    arrow.style.left = '50%'
    arrow.style.marginLeft = '-5px'
    arrow.style.bottom = '-5px'
    arrow.style.transform = 'rotate(45deg)'
    arrow.style.transition = 'all .3s'

    textMarker.arrow = arrow
    textMarker.btn_Box = document.getElementById('webMarkerBtnBox')
    textMarker.btn_mark = document.getElementById('webMarker_btn_mark')
    textMarker.btn_cancel = document.getElementById('webMarker_btn_cancel')
    textMarker.btn_delete = document.getElementById('webMarker_btn_delete')

    textMarker.btn_mark.addEventListener(getUserAgent().eventName.mousedown, textMarker.mark.bind(textMarker))
    textMarker.btn_cancel.addEventListener(getUserAgent().eventName.mousedown, textMarker.hide.bind(textMarker))
    textMarker.btn_delete.addEventListener(getUserAgent().eventName.mousedown, textMarker.del.bind(textMarker))
  
  }

  export default createBtnDom