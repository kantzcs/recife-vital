import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../constants/theme';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, Maria!</Text>
          <Text style={styles.subGreeting}>Bem-vinda ao Recife Vital</Text>
        </View>

        <View style={styles.mainCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PRÓXIMA CONSULTA</Text>
          </View>
          <Text style={styles.dateText}>📅 14/08/2026 - 08:30</Text>
          <Text style={styles.locationText}>USF Boa Vista</Text>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Ver detalhes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          <View style={[styles.gridCard, { borderLeftColor: COLORS.points }]}>
            <Text style={styles.cardIcon}>🪙</Text>
            <Text style={styles.cardValue}>250 pts</Text>
            <Text style={styles.cardLabel}>Saldo Recife Saudável</Text>
          </View>

          <View style={[styles.gridCard, { borderLeftColor: COLORS.primary }]}>
            <Text style={styles.cardIcon}>❤️</Text>
            <Text style={styles.cardValue}>15</Text>
            <Text style={styles.cardLabel}>Consultas realizadas</Text>
          </View>

          <View style={[styles.gridCard, { borderLeftColor: COLORS.secondary }]}>
            <Text style={styles.cardIcon}>💊</Text>
            <Text style={styles.cardValue}>Em dia</Text>
            <Text style={styles.cardLabel}>Próxima retirada</Text>
          </View>

          <View style={[styles.gridCard, { borderLeftColor: COLORS.alert }]}>
            <Text style={styles.cardIcon}>🧪</Text>
            <Text style={styles.cardValue}>1 pendente</Text>
            <Text style={styles.cardLabel}>Hemoglobina Glicada</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20 },
  header: { marginBottom: 20 },
  greeting: { ...FONTS.title, color: COLORS.primary },
  subGreeting: { ...FONTS.body, color: COLORS.textDark },
  mainCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badge: {
    backgroundColor: '#E6F0FA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  dateText: { ...FONTS.subtitle, marginBottom: 4 },
  locationText: { ...FONTS.body, color: '#666', marginBottom: 16 },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 48,
  },
  primaryButtonText: { color: COLORS.surface, fontWeight: '600', fontSize: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridCard: {
    backgroundColor: COLORS.surface,
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 5,
    elevation: 2,
  },
  cardIcon: { fontSize: 24, marginBottom: 8 },
  cardValue: { ...FONTS.subtitle, fontWeight: '700' },
  cardLabel: { ...FONTS.caption, color: '#666', marginTop: 2 },
});
