import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../constants/theme';

export default function RecompensasScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>250</Text>
          <Text style={styles.pointsLabel}>Pontos Recife Saudável</Text>
          
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
          <Text style={styles.progressLabel}>250 / 500 para o próximo nível</Text>
        </View>

        <Text style={styles.sectionTitle}>Recompensas Disponíveis</Text>

        <View style={styles.rewardCard}>
          <Text style={styles.rewardIcon}>🚌</Text>
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardTitle}>Crédito no VEM</Text>
            <Text style={styles.rewardCost}>200 pontos</Text>
          </View>
          <TouchableOpacity style={styles.claimButton}>
            <Text style={styles.claimButtonText}>Resgatar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rewardCard}>
          <Text style={styles.rewardIcon}>🎭</Text>
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardTitle}>Ingresso Cinema/Teatro</Text>
            <Text style={styles.rewardCost}>150 pontos</Text>
          </View>
          <TouchableOpacity style={styles.claimButton}>
            <Text style={styles.claimButtonText}>Resgatar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rewardCard}>
          <Text style={styles.rewardIcon}>📚</Text>
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardTitle}>Vaga Curso COMPAZ</Text>
            <Text style={styles.rewardCost}>300 pontos</Text>
          </View>
          <TouchableOpacity style={[styles.claimButton, styles.disabledButton]} disabled>
            <Text style={styles.claimButtonText}>Faltam 50 pts</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  pointsContainer: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
  },
  pointsText: { fontSize: 48, fontWeight: 'bold', color: COLORS.points },
  pointsLabel: { ...FONTS.subtitle, marginBottom: 16 },
  progressBg: { width: '100%', height: 12, backgroundColor: '#E0E0E0', borderRadius: 6, marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: COLORS.secondary, borderRadius: 6 },
  progressLabel: { ...FONTS.caption, color: '#666' },
  sectionTitle: { ...FONTS.title, marginBottom: 16 },
  rewardCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardIcon: { fontSize: 32, marginRight: 12 },
  rewardInfo: { flex: 1 },
  rewardTitle: { ...FONTS.subtitle, fontSize: 16 },
  rewardCost: { ...FONTS.caption, color: COLORS.primary, fontWeight: '700' },
  claimButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  disabledButton: { backgroundColor: '#CCC' },
  claimButtonText: { color: COLORS.surface, fontWeight: '600' },
});
