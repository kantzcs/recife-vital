import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../constants/theme';

const APPOINTMENTS = [
  {
    id: '1',
    type: 'Consulta',
    date: '14/08/2026',
    time: '08:30',
    location: 'USF Boa Vista',
    points: 50,
  },
  {
    id: '2',
    type: 'Retirada de medicamento',
    date: '18/08/2026',
    time: '10:00',
    location: 'Farmácia da Família',
    points: 30,
  },
];

export default function AgendaScreen() {
  const handleConfirm = (item) => {
    Alert.alert(
      "Presença Confirmada!",
      `Você ganhou +${item.points} pontos Recife Saudável.`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Sua Agenda</Text>
      
      <FlatList
        data={APPOINTMENTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.typeText}>{item.type}</Text>
              <Text style={styles.pointsBadge}>+{item.points} pts</Text>
            </View>
            <Text style={styles.dateText}>📅 {item.date} às {item.time}</Text>
            <Text style={styles.locationText}>📍 {item.location}</Text>
            
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={() => handleConfirm(item)}
            >
              <Text style={styles.confirmButtonText}>Confirmar presença</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerTitle: { ...FONTS.title, marginHorizontal: 20, marginTop: 20 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  typeText: { ...FONTS.subtitle, color: COLORS.primary },
  pointsBadge: { color: COLORS.secondary, fontWeight: '700', fontSize: 16 },
  dateText: { ...FONTS.body, marginBottom: 6 },
  locationText: { ...FONTS.body, color: '#666', marginBottom: 16 },
  confirmButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
  },
  confirmButtonText: { color: COLORS.surface, fontWeight: '600', fontSize: 16 },
});
