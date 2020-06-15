const loadData = () => {
  window.addEventListener('load', () => {

    // localStorage.removeItem('markers')
    // 获取已有数据
    let defaultMarkers = {}
    if (window.jsObject && window.jsObject.getCallBack) {
      if(window.jsObject.getCallBack().length > 0){
        defaultMarkers = JSON.parse(window.jsObject.getCallBack())
      }
      
      // document.getElementById('windowobject').innerHTML = window.jsObject.getCallBack().length
    } else {
    
      defaultMarkers = JSON.parse(localStorage.getItem('markers'))
      // document.getElementById('windowobject').innerHTML = '没有 getCallBack 对象'
    }
  
    console.log(defaultMarkers)
    const myTextMarker = new window.WebTextMarker({
      defaultMarkers,
      debug: true,
      onSave: markers => {
        const markersJson = JSON.stringify(markers)
        if (myTextMarker.userAgent.isAndroid && window.jsObject) {
          window.jsObject.save(markersJson)
          return
        }
  
        if (myTextMarker.userAgent.isiOS) {
          // window.webkit.jsObject.callBack.postMessage(this.selectedMarkers)
          return
        }
  
        localStorage.setItem('markers', markersJson)
      }
    })
  })
}

export default loadData 