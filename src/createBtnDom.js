import {getUserAgent} from './utils'

const createBtnDom = (textMarker, styles) => {
    const defaultStyles = {
      position: 'absolute',
      textAlign: 'center',
      width: '98%',
      left: '1%',
      height: '35px',
      lineHeight: '35px',
      backgroundColor: 'black',
      borderRadius: 3,
      display: 'none',
      color: '#fff',
      transition: 'all .3s',
      ...styles
    }
    const btnBox = document.createElement('div')

    btnBox.id = 'webMarkerBtnBox'
    Object.keys(defaultStyles).forEach(key => {
      btnBox.style[key] = defaultStyles[key]
    })

    btnBox.innerHTML = `
      <div style="flex: 1" id="webMarker_btn_mark">标记</div>
      <div style="flex: 1" id="webMarker_btn_delete">删除标记</div>
      <div style="flex: 1" id="webMarker_btn_cancel">取消</div>
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
    textMarker.btn_cancel.addEventListener('click', textMarker.hide.bind(textMarker))
    textMarker.btn_delete.addEventListener('click', textMarker.del.bind(textMarker))
  
  }

  export default createBtnDom