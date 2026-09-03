import { useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { ALUNO_ID, db } from '../firebase/config';

type Chamado = {
  id: string;
  description: string;
  photoUri?: string | null;
  address?: string | null;
  status: string;
};

const STATUS_INFO: Record<string, { label: string; color: string }> = {
  aberto: { label: 'ABERTO', color: '#1565c0' },
  atendendo: { label: 'ATENDENDO', color: '#ef6c00' },
  concluido: { label: 'CONCLUÍDO', color: '#2e7d32' },
  cancelado: { label: 'CANCELADO', color: '#d32f2f' },
};

export default function CallListScreen({ navigation }: any) {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregarChamados() {
        setLoading(true);
        setErro(null);
        try {
          const q = query(
            collection(db, 'alunos', ALUNO_ID, 'chamados'),
            orderBy('criadoEm', 'desc'),
          );
          const snapshot = await getDocs(q);
          const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Chamado);
          if (ativo) setChamados(lista);
        } catch (error) {
          if (ativo) setErro('Não foi possível carregar os chamados. Tente novamente.');
        } finally {
          if (ativo) setLoading(false);
        }
      }

      carregarChamados();

      return () => {
        ativo = false;
      };
    }, []),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {erro && <Text style={styles.errorText}>{erro}</Text>}

      <FlatList
        data={chamados}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !erro ? <Text style={styles.placeholderText}>Nenhum chamado registrado ainda</Text> : null
        }
        renderItem={({ item }) => {
          const statusInfo = STATUS_INFO[item.status] ?? {
            label: item.status?.toUpperCase() ?? '-',
            color: '#666',
          };

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('CallDetail', { chamadoId: item.id })}>
              <Text style={styles.cardTitle}>{item.description}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                <Text style={styles.statusText}>{statusInfo.label}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity style={styles.newButton} onPress={() => navigation.navigate('NewCall')}>
        <Text style={styles.newButtonText}>+ Novo Chamado</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' },
  list: { paddingBottom: 80 },
  placeholderText: { color: '#999', textAlign: 'center', marginTop: 40 },
  errorText: { color: '#d32f2f', fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  newButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  newButtonText: { color: '#fff', fontWeight: 'bold' },
});
