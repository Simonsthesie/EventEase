export const dateUtils = {
  formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    return date.toLocaleDateString('fr-FR', options);
  },

  formatDateTime(dateString) {
    const date = new Date(dateString);
    const dateOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };
    return `${date.toLocaleDateString('fr-FR', dateOptions)} à ${date.toLocaleTimeString('fr-FR', timeOptions)}`;
  },

  formatTime(dateString) {
    const date = new Date(dateString);
    const options = {
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleTimeString('fr-FR', options);
  },

  formatShortDate(dateString) {
    const date = new Date(dateString);
    const options = {
      day: 'numeric',
      month: 'short',
    };
    return date.toLocaleDateString('fr-FR', options);
  },

  isToday(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  },

  isFuture(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    return date > now;
  },

  isPast(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    return date < now;
  },

  toISOString(date) {
    return new Date(date).toISOString();
  },

  getDayOfWeek(dateString) {
    const date = new Date(dateString);
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[date.getDay()];
  },
};
