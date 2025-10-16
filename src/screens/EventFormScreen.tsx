/**
 * EventFormScreen
 * Formulaire création/édition d'événement + localisation + date/heure modal
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEvents } from '../contexts/EventContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { theme } from '../utils/theme';
import { validation } from '../utils/validation';
import { dateUtils } from '../utils/dateUtils';
import { locationService } from '../services/locationService';
import { placesService } from '../services/placesService';

export const EventFormScreen = ({ navigation, route }) => {
  const { eventId } = route.params || {};
  const { addEvent, updateEvent, getEventById } = useEvents();
  const [loading, setLoading] = useState(false);
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [pickerMode, setPickerMode] = useState('date'); // 'date' | 'time'
  const [tempDate, setTempDate] = useState(new Date());

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    location: '',
    latitude: null,
    longitude: null,
  });

  const [errors, setErrors] = useState({});

  // Autocomplétion lieu
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState([]);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const debounceRef = useRef(null);

  const loadExistingEvent = useCallback(() => {
    if (!eventId) return;
    const event = getEventById(eventId);
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        date: new Date(event.date),
        location: event.location || '',
        latitude: event.latitude || null,
        longitude: event.longitude || null,
      });
    }
  }, [eventId, getEventById]);

  useEffect(() => {
    loadExistingEvent();
  }, [loadExistingEvent]);

  // Debounce recherche lieux
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (!placeQuery || placeQuery.trim().length < 2) {
      setPlaceResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearchingPlaces(true);
      const results = await placesService.search(placeQuery, 6);
      setPlaceResults(results);
      setSearchingPlaces(false);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [placeQuery]);

  const handleSubmit = async () => {
    // Validation
    const newErrors = {};

    if (!validation.validateEventTitle(formData.title)) {
      newErrors.title = validation.getErrorMessage('title', formData.title);
    }

    if (!validation.validateEventDescription(formData.description)) {
      newErrors.description = validation.getErrorMessage('description', formData.description);
    }

    if (!validation.validateEventDate(formData.date)) {
      newErrors.date = validation.getErrorMessage('date', formData.date);
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: formData.date.toISOString(),
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      let result;
      if (eventId) {
        result = await updateEvent(eventId, eventData);
      } else {
        result = await addEvent(eventData);
      }

      if (result.success) {
        Alert.alert(
          'Succès',
          eventId ? 'Événement modifié avec succès' : 'Événement créé avec succès',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Sélection date/heure gérée via modal (tempDate + pickerMode)

  const handleUseCurrentLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      setFormData({
        ...formData,
        latitude: location.latitude,
        longitude: location.longitude,
        location: formData.location || 'Ma position actuelle',
      });
      Alert.alert('Succès', 'Position actuelle enregistrée');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer la position');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.surface }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {eventId ? "Modifier l'événement" : 'Nouvel événement'}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label="Titre de l'événement"
          value={formData.title}
          onChangeText={text => setFormData({ ...formData, title: text })}
          placeholder="Ex: Conférence React Native"
          error={errors.title}
          icon={<Ionicons name="text-outline" size={20} color={theme.colors.textSecondary} />}
        />

        <Input
          label="Description"
          value={formData.description}
          onChangeText={text => setFormData({ ...formData, description: text })}
          placeholder="Décrivez votre événement..."
          multiline
          numberOfLines={4}
          error={errors.description}
          icon={
            <Ionicons name="document-text-outline" size={20} color={theme.colors.textSecondary} />
          }
        />

        <View style={styles.dateTimeContainer}>
          <Text style={styles.label}>Date et heure</Text>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => {
              setTempDate(new Date(formData.date));
              setPickerMode('date');
              setShowPickerModal(true);
            }}
          >
            <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.dateTimeText}>
              {dateUtils.formatDate(formData.date.toISOString())} •{' '}
              {dateUtils.formatTime(formData.date.toISOString())}
            </Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={showPickerModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPickerModal(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {pickerMode === 'date' ? 'Sélectionner la date' : "Sélectionner l'heure"}
                </Text>
                <TouchableOpacity onPress={() => setShowPickerModal(false)}>
                  <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={tempDate}
                mode={pickerMode}
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={(event, selected) => {
                  if (!selected) return;
                  const next = new Date(tempDate);
                  if (pickerMode === 'date') {
                    next.setFullYear(selected.getFullYear());
                    next.setMonth(selected.getMonth());
                    next.setDate(selected.getDate());
                  } else {
                    next.setHours(selected.getHours());
                    next.setMinutes(selected.getMinutes());
                  }
                  setTempDate(next);
                }}
                minimumDate={new Date()}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={() => setShowPickerModal(false)}
                >
                  <Text style={styles.modalButtonSecondaryText}>Annuler</Text>
                </TouchableOpacity>
                {pickerMode === 'date' ? (
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonPrimary]}
                    onPress={() => setPickerMode('time')}
                  >
                    <Text style={styles.modalButtonPrimaryText}>Suivant</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonPrimary]}
                    onPress={() => {
                      setFormData({ ...formData, date: tempDate });
                      setShowPickerModal(false);
                    }}
                  >
                    <Text style={styles.modalButtonPrimaryText}>Valider</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>

        <Input
          label="Lieu (optionnel)"
          value={formData.location}
          onChangeText={text => {
            setFormData({ ...formData, location: text, latitude: null, longitude: null });
            setPlaceQuery(text);
          }}
          placeholder="Ex: 10 rue de Rivoli, Paris"
          icon={<Ionicons name="location-outline" size={20} color={theme.colors.textSecondary} />}
        />

        {/* Suggestions d'adresses */}
        {placeQuery?.length >= 2 && (
          <View style={styles.placesContainer}>
            {searchingPlaces ? (
              <Text style={styles.placesHint}>Recherche d’adresses…</Text>
            ) : placeResults.length === 0 ? (
              <Text style={styles.placesHint}>Aucune adresse trouvée</Text>
            ) : (
              placeResults.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.placeItem}
                  onPress={() => {
                    setFormData({
                      ...formData,
                      location: item.displayName,
                      latitude: item.lat,
                      longitude: item.lon,
                    });
                    setPlaceQuery('');
                    setPlaceResults([]);
                  }}
                >
                  <Ionicons name="location" size={16} color={theme.colors.textSecondary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.placeTitle} numberOfLines={1}>{item.title}</Text>
                    {item.subtitle ? (
                      <Text style={styles.placeSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        <TouchableOpacity style={styles.locationButton} onPress={handleUseCurrentLocation}>
          <Ionicons name="navigate" size={20} color={theme.colors.primary} />
          <Text style={styles.locationButtonText}>Utiliser ma position actuelle</Text>
        </TouchableOpacity>

        {formData.latitude && formData.longitude && (
          <View style={styles.locationInfo}>
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
            <Text style={styles.locationInfoText}>Position enregistrée</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title="Annuler"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title={eventId ? 'Modifier' : 'Créer'}
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    marginBottom: theme.spacing.sm,
  },
  dateTimeContainer: {
    marginBottom: theme.spacing.md,
  },
  dateTimeButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  dateTimeText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  locationButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight + '20',
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  locationButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  locationInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginBottom: theme.spacing.lg,
  },
  locationInfoText: {
    color: theme.colors.success,
    fontSize: theme.fontSize.sm,
  },
  placesContainer: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  placesHint: {
    color: theme.colors.textSecondary,
    padding: theme.spacing.md,
  },
  placeItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
  },
  placeTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  placeSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  // Modal styles
  modalBackground: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'flex-end',
    marginTop: theme.spacing.md,
  },
  modalButton: {
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  modalButtonSecondary: {
    backgroundColor: theme.colors.background,
  },
  modalButtonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  modalButtonSecondaryText: {
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  modalButtonPrimaryText: {
    color: '#fff',
    fontWeight: theme.fontWeight.semibold,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});
