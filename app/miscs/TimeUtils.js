import moment from 'moment';

export function translate(data) {
  const time = moment(data);
  const check = time.clone().add(7, 'days');
  if (check.isBefore(moment())) {
    return time.format('DD/MM/YYYY HH:mm');
  } else {
    if (time.isAfter(moment())) {
      return 'vừa xong';
    }
    return time.fromNow();
  }
}
