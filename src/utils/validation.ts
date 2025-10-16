export const validation = {
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePassword(password) {
    // Au moins 6 caractères
    return password && password.length >= 6;
  },

  validateName(name) {
    return name && name.trim().length >= 2;
  },

  validateEventTitle(title) {
    return title && title.trim().length >= 3;
  },

  validateEventDescription(description) {
    return description && description.trim().length >= 10;
  },

  validateEventDate(date) {
    if (!date) return false;
    const eventDate = new Date(date);
    return eventDate instanceof Date && !isNaN(eventDate);
  },

  getErrorMessage(field, value) {
    switch (field) {
      case 'email':
        if (!value) return "L'email est requis";
        if (!this.validateEmail(value)) return 'Email invalide';
        break;
      case 'password':
        if (!value) return 'Le mot de passe est requis';
        if (!this.validatePassword(value))
          return 'Le mot de passe doit contenir au moins 6 caractères';
        break;
      case 'name':
        if (!value) return 'Le nom est requis';
        if (!this.validateName(value)) return 'Le nom doit contenir au moins 2 caractères';
        break;
      case 'title':
        if (!value) return 'Le titre est requis';
        if (!this.validateEventTitle(value)) return 'Le titre doit contenir au moins 3 caractères';
        break;
      case 'description':
        if (!value) return 'La description est requise';
        if (!this.validateEventDescription(value))
          return 'La description doit contenir au moins 10 caractères';
        break;
      case 'date':
        if (!value) return 'La date est requise';
        if (!this.validateEventDate(value)) return 'Date invalide';
        break;
      default:
        return '';
    }
    return '';
  },
};
