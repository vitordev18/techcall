import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ALUNO_ID, db } from '../firebase/config';

type Chamado = {
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

export default function CallDetailScreen({ route }: any) {
  const { chamadoId } = route.params;
  const [chamado, setChamado] = useState<Chamado | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const saving = savingStatus !== null;

  useEffect(() => {
    async function carregarChamado() {
      setLoading(true);
      setErro(null);

      try {
        const referencia = doc(db, 'alunos', ALUNO_ID, 'chamados', chamadoId);
        const snapshot = await getDoc(referencia);

        if (snapshot.exists()) {
          setChamado(snapshot.data() as Chamado);
        } else {
          setErro('Chamado não encontrado.');
        }
      } catch (error) {
        setErro('Não foi possível carregar o chamado. Tente novamente.');
        Alert.alert('Erro', 'Não foi possível carregar o chamado. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }

    carregarChamado();
  }, [chamadoId]);

  async function mudarStatus(novoStatus: string) {
    setSavingStatus(novoStatus);

    try {
      const referencia = doc(db, 'alunos', ALUNO_ID, 'chamados', chamadoId);
      await updateDoc(referencia, { status: novoStatus });

      setChamado(anterior => (anterior ? { ...anterior, status: novoStatus } : anterior));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o status. Tente novamente.');
    } finally {
      setSavingStatus(null);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  if (!chamado) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{erro ?? 'Chamado não encontrado.'}</Text>
      </View>
    );
  }

  const statusInfo = STATUS_INFO[chamado.status] ?? {
    label: chamado.status?.toUpperCase() ?? '-',
    color: '#666',
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Detalhes do Chamado</Text>

      <Text style={styles.label}>Status do chamado</Text>
      <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
        <Text style={styles.statusText}>{statusInfo.label}</Text>
      </View>

      <Text style={styles.label}>Descrição do problema</Text>
      <View style={styles.textBox}>
        <Text style={styles.textBoxContent}>{chamado.description}</Text>
      </View>

      <Text style={styles.label}>Foto do equipamento</Text>
      {chamado.photoUri ? (
        <Image source={{ uri: chamado.photoUri }} style={styles.photo} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Nenhuma foto anexada</Text>
        </View>
      )}

      <Text style={styles.label}>Localização do chamado</Text>
      {chamado.address ? (
        <Text style={styles.addressText}>{chamado.address}</Text>
      ) : (
        <Text style={styles.placeholderText}>Nenhuma localização registrada</Text>
      )}

      {chamado.status === 'aberto' && (
        <>
          <TouchableOpacity
            style={[styles.button, styles.startButton, saving && styles.disabledButton]}
            disabled={saving}
            onPress={() => mudarStatus('atendendo')}
          >
            <Text style={styles.buttonText}>
              {savingStatus === 'atendendo' ? 'Salvando...' : 'Iniciar Atendimento'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton, saving && styles.disabledButton]}
            disabled={saving}
            onPress={() => mudarStatus('cancelado')}
          >
            <Text style={styles.buttonText}>
              {savingStatus === 'cancelado' ? 'Salvando...' : 'Cancelar Chamado'}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {chamado.status === 'atendendo' && (
        <TouchableOpacity
          style={[styles.button, styles.confirmButton, saving && styles.disabledButton]}
          disabled={saving}
          onPress={() => mudarStatus('concluido')}
        >
          <Text style={styles.buttonText}>
            {savingStatus === 'concluido' ? 'Salvando...' : 'Concluir Atendimento'}
          </Text>
        </TouchableOpacity>
      )}

      {(chamado.status === 'concluido' || chamado.status === 'cancelado') && (
        <Text style={styles.finalText}>Este chamado foi finalizado e não aceita novas ações.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20, paddingBottom: 40 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  textBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 12,
    minHeight: 80,
  },
  textBoxContent: { fontSize: 14, color: '#333' },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  placeholder: {
    height: 160,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { color: '#999' },
  photo: { width: '100%', height: 200, borderRadius: 8 },
  addressText: { fontSize: 14, color: '#333' },
  button: { borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  startButton: { backgroundColor: '#1565c0' },
  confirmButton: { backgroundColor: '#2e7d32' },
  cancelButton: { backgroundColor: '#d32f2f' },
  disabledButton: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  errorText: { color: '#d32f2f', fontWeight: 'bold', textAlign: 'center' },
  finalText: { marginTop: 24, color: '#666', fontSize: 14, textAlign: 'center' },
});
