import {getUserAgent} from './utils'


const createBtnDom = (textMarker, styles) => {
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
    }
    const btnBox = document.createElement('div')

    btnBox.id = 'webMarkerBtnBox'
    Object.keys(defaultStyles).forEach(key => {
      btnBox.style[key] = defaultStyles[key]
    })

    btnBox.innerHTML = `
      <div style="flex: 1" id="webMarker_btn_mark">标记</div>
      <div style="flex: 1" id="webMarker_btn_delete">删除当前标记</div>
      <div style="flex: 1" id="webMarker_btn_cancel">取消</div>
    `
    document.body.appendChild(btnBox)
    textMarker.btn_Box = document.getElementById('webMarkerBtnBox')
    textMarker.btn_mark = document.getElementById('webMarker_btn_mark')
    textMarker.btn_cancel = document.getElementById('webMarker_btn_cancel')
    textMarker.btn_delete = document.getElementById('webMarker_btn_delete')

    textMarker.btn_mark.addEventListener(getUserAgent().eventName.mousedown, textMarker.mark)
    textMarker.btn_cancel.addEventListener('click', textMarker.hide)
    textMarker.btn_delete.addEventListener('click', textMarker.del)
  
  }

  export default createBtnDom