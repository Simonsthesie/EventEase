/**
 * LoginScreen
 * Connexion / Inscription locale (sans backend) + validation
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { theme } from '../utils/theme';
import { validation } from '../utils/validation';

type LoginForm = {
  name: string;
  email: string;
  password: string;
};

type LoginErrors = Partial<Record<'name' | 'email' | 'password', string>>;

export const LoginScreen = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<LoginForm>({
    name: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<LoginErrors>({});

  const handleSubmit = async () => {
    // Validation
    const newErrors: LoginErrors = {};

    if (!isLogin && !validation.validateName(formData.name)) {
      newErrors.name = validation.getErrorMessage('name', formData.name);
    }

    if (!validation.validateEmail(formData.email)) {
      newErrors.email = validation.getErrorMessage('email', formData.email);
    }

    if (!validation.validatePassword(formData.password)) {
      newErrors.password = validation.getErrorMessage('password', formData.password);
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.name, formData.email, formData.password);
      }

      if (!result.success) {
        Alert.alert('Erreur', result.error);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="calendar" size={64} color={theme.colors.primary} />
          </View>
          <Text style={styles.title}>EventEase</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Connectez-vous pour continuer' : 'Créez votre compte'}
          </Text>
        </View>

        <View style={styles.form}>
          {!isLogin && (
            <Input
              label="Nom complet"
              value={formData.name}
              onChangeText={text => setFormData({ ...formData, name: text })}
              placeholder="Jean Dupont"
              autoCapitalize="words"
              error={errors.name}
              icon={<Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} />}
            />
          )}

          <Input
            label="Email"
            value={formData.email}
            onChangeText={text => setFormData({ ...formData, email: text })}
            placeholder="jean@example.com"
            keyboardType="email-address"
            error={errors.email}
            icon={<Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />}
          />

          <Input
            label="Mot de passe"
            value={formData.password}
            onChangeText={text => setFormData({ ...formData, password: text })}
            placeholder="••••••••"
            secureTextEntry
            error={errors.password}
            icon={
              <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />
            }
          />

          <Button
            title={isLogin ? 'Se connecter' : "S'inscrire"}
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />

          <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
            <Text style={styles.toggleText}>
              {isLogin ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
              <Text style={styles.toggleTextBold}>{isLogin ? "S'inscrire" : 'Se connecter'}</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Créez et gérez vos événements en toute simplicité</Text>
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
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  footerText: {
    color: theme.colors.textLight,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
  },
  form: {
    marginBottom: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight + '20',
    borderRadius: theme.borderRadius.full,
    height: 100,
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    width: 100,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    textAlign: 'center',
  },
  title: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.xs,
  },
  toggleButton: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  toggleText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
  toggleTextBold: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
});
