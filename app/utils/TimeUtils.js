import moment from 'moment';

export default class TimeUtils {
  static translate(data) {
    const time = moment(data);
    const check = time.clone().add(7, 'days');
    if (check.isBefore(moment())) {
      return time.format('DD/MM/YYYY HH:mm');
    } else {
      return time.fromNow();
    }
  }
}
