export const dateUtils = {
  formatDate(dateString: string) {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    return date.toLocaleDateString('fr-FR', options);
  },

  formatDateTime(dateString: string) {
    const date = new Date(dateString);
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };
    return `${date.toLocaleDateString('fr-FR', dateOptions)} à ${date.toLocaleTimeString('fr-FR', timeOptions)}`;
  },

  formatTime(dateString: string) {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleTimeString('fr-FR', options);
  },

  formatShortDate(dateString: string) {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
    };
    return date.toLocaleDateString('fr-FR', options);
  },

  isToday(dateString: string) {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  },

  isFuture(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    return date > now;
  },

  isPast(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    return date < now;
  },

  toISOString(date: string | number | Date) {
    return new Date(date).toISOString();
  },

  getDayOfWeek(dateString: string) {
    const date = new Date(dateString);
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[date.getDay()];
  },
};
