import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import {
  faTrashAlt,
  faCalendarDay,
  faChevronLeft,
  faChevronRight,
  faPlus,
  faCheck,
  faEdit
} from '@fortawesome/free-solid-svg-icons'


library.add(faTrashAlt, faCalendarDay, faChevronLeft, faChevronRight, faPlus, faCheck, faEdit)

export default {
  install(app: any) {
    // 全局注册组件，可自定义名称
    app.component('FaIcon', FontAwesomeIcon)
    app.component('FontAwesomeIcon', FontAwesomeIcon)
  }
}