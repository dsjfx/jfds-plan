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

library.add(
  faTrashAlt, faCalendarDay, faChevronLeft, faChevronRight, faPlus, faCheck, faEdit,
)

import {
  faAlarmClock as farAlarmClock,
  faCalendar as farCalendar,
  faChartBar as farChartBar,
  faLightbulb as farLightbulb,
  faPenToSquare as farPenToSquare,
  faRectangleList as farRectangleList,
  faTrashCan as farTrashCan,
  faUser as farUser,
} from '@fortawesome/free-regular-svg-icons'

library.add(farAlarmClock, farCalendar, farChartBar, farLightbulb, farPenToSquare, farRectangleList, farTrashCan, farUser)

export default {
  install(app: any) {
    // 全局注册组件，可自定义名称
    app.component('FaIcon', FontAwesomeIcon)
    app.component('FontAwesomeIcon', FontAwesomeIcon)
  }
}