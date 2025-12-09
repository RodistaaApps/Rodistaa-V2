/**
 * Help & Support Screen
 * Pure React Native CLI component
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { RodistaaColors, MobileTextStyles, RodistaaSpacing } from '@rodistaa/design-system';
import { useTranslation } from '../i18n';

export interface HelpScreenProps {
  navigation: any;
}

export const HelpScreen: React.FC<HelpScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmitTicket = () => {
    if (!subject || !message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // TODO: Submit ticket to API
    Alert.alert(
      'Success',
      'Support ticket created. We will get back to you soon.',
      [{ text: 'OK', onPress: () => {
        setSubject('');
        setMessage('');
      }}]
    );
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+918000000000');
  };

  const faqs = [
    {
      question: 'How do I place a bid?',
      answer: 'Navigate to Available Bookings, select a booking, and click Place Bid. Enter your bid amount and submit.',
    },
    {
      question: 'How do I track my shipment?',
      answer: 'Go to My Shipments, select your shipment, and click Track to see live location and status.',
    },
    {
      question: 'How do I upload POD?',
      answer: 'In Trip Detail screen, navigate to POD section, capture or select photos, and upload.',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Support</Text>
        
        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleCallSupport}
          accessibilityLabel="Call support"
        >
          <Text style={styles.contactIcon}>📞</Text>
          <View style={styles.contactContent}>
            <Text style={styles.contactLabel}>Call Support</Text>
            <Text style={styles.contactValue}>+91 8000 000 000</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => Linking.openURL('mailto:support@rodistaa.com')}
          accessibilityLabel="Email support"
        >
          <Text style={styles.contactIcon}>✉️</Text>
          <View style={styles.contactContent}>
            <Text style={styles.contactLabel}>Email Support</Text>
            <Text style={styles.contactValue}>support@rodistaa.com</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Create Support Ticket</Text>
        
        <Text style={styles.inputLabel}>Subject</Text>
        <TextInput
          style={styles.input}
          value={subject}
          onChangeText={setSubject}
          placeholder="Enter subject"
          placeholderTextColor={RodistaaColors.text.disabled}
          accessibilityLabel="Ticket subject input"
        />

        <Text style={styles.inputLabel}>Message</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={message}
          onChangeText={setMessage}
          placeholder="Describe your issue..."
          placeholderTextColor={RodistaaColors.text.disabled}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          accessibilityLabel="Ticket message input"
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitTicket}
          accessibilityLabel="Submit support ticket"
        >
          <Text style={styles.submitButtonText}>Submit Ticket</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Q: {faq.question}</Text>
            <Text style={styles.faqAnswer}>A: {faq.answer}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RodistaaColors.background.default,
  },
  header: {
    backgroundColor: RodistaaColors.background.paper,
    padding: RodistaaSpacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: RodistaaColors.border.light,
  },
  headerTitle: {
    ...MobileTextStyles.h2,
    color: RodistaaColors.text.primary,
  },
  section: {
    backgroundColor: RodistaaColors.background.paper,
    marginTop: RodistaaSpacing.lg,
    padding: RodistaaSpacing.xl,
  },
  sectionTitle: {
    ...MobileTextStyles.h3,
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.lg,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RodistaaColors.background.default,
    borderRadius: RodistaaSpacing.borderRadius.md,
    padding: RodistaaSpacing.lg,
    marginBottom: RodistaaSpacing.md,
  },
  contactIcon: {
    fontSize: 32,
    marginRight: RodistaaSpacing.md,
  },
  contactContent: {
    flex: 1,
  },
  contactLabel: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
  },
  contactValue: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
  },
  inputLabel: {
    ...MobileTextStyles.bodySmall,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.xs,
    marginTop: RodistaaSpacing.md,
  },
  input: {
    ...MobileTextStyles.body,
    backgroundColor: RodistaaColors.background.default,
    borderRadius: RodistaaSpacing.borderRadius.md,
    padding: RodistaaSpacing.md,
    borderWidth: 1,
    borderColor: RodistaaColors.border.light,
    color: RodistaaColors.text.primary,
  },
  textArea: {
    height: 120,
    paddingTop: RodistaaSpacing.md,
  },
  submitButton: {
    backgroundColor: RodistaaColors.primary.main,
    borderRadius: RodistaaSpacing.borderRadius.md,
    paddingVertical: RodistaaSpacing.lg,
    alignItems: 'center',
    marginTop: RodistaaSpacing.lg,
  },
  submitButtonText: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.primary.contrast,
  },
  faqItem: {
    marginBottom: RodistaaSpacing.lg,
    paddingBottom: RodistaaSpacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: RodistaaColors.border.light,
  },
  faqQuestion: {
    ...MobileTextStyles.body,
    fontWeight: '600',
    color: RodistaaColors.text.primary,
    marginBottom: RodistaaSpacing.sm,
  },
  faqAnswer: {
    ...MobileTextStyles.bodySmall,
    color: RodistaaColors.text.secondary,
  },
});

