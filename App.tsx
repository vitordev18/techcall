import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import CallDetailScreen from './src/screens/CallDetailScreen';
import CallListScreen from './src/screens/CallListScreen';
import NewCallScreen from './src/screens/NewCallScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="CallList">
        <Stack.Screen
          name="CallList"
          component={CallListScreen}
          options={{ title: 'Chamados' }}
        />
        <Stack.Screen
          name="NewCall"
          component={NewCallScreen}
          options={{ title: 'Novo Chamado' }}
        />
        <Stack.Screen
          name="CallDetail"
          component={CallDetailScreen}
          options={{ title: 'Detalhes do Chamado' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
