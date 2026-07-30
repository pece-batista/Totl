# Meu Orçamento

Aplicativo Android de controle de orçamento mensal. Cadastre seu salário fixo, lance gastos à vista ou parcelados e acompanhe o saldo livre dos próximos 12 meses numa linha do tempo visual.

## Funcionalidades

- Salário fixo mensal editável
- Linha do tempo horizontal dos próximos 12 meses, com barras de saldo livre vs. comprometido
- Cadastro de gastos à vista ou parcelados, com mês inicial configurável
- Cálculo automático de parcela atual e término do parcelamento
- Filtro dos gastos ativos do mês selecionado
- Lista completa de lançamentos com status ("Quitado", "Parcela X/Y", "Começa em MM/AA")
- Dados salvos localmente no dispositivo (AsyncStorage)

## Tech stack

- [Expo](https://expo.dev/) (SDK 57) + React Native
- TypeScript
- `@react-native-async-storage/async-storage` para persistência
- `lucide-react-native` para ícones
- `@expo-google-fonts/fraunces` e `@expo-google-fonts/jetbrains-mono` para tipografia

## Como rodar

```bash
npm install
npx expo start
```

Escaneie o QR code com o app **Expo Go** no Android, ou pressione `a` para abrir num emulador configurado.

## Gerar um APK

**Build na nuvem (EAS, sem precisar de Android Studio):**

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

**Build local (com Android Studio + SDK instalados):**

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleDebug
```

O APK gerado fica em `android/app/build/outputs/apk/debug/app-debug.apk`.

## Estrutura do projeto

```
src/
  components/   Componentes de UI reutilizáveis
  screens/      Tela principal (BudgetScreen)
  storage/      Camada de persistência (AsyncStorage)
  theme/        Cores e fontes
  types/        Tipos compartilhados
  utils/        Funções de data e formatação de moeda
```

## Paleta de cores

| Nome  | Hex       |
|-------|-----------|
| Ink   | `#12151B` |
| Brass | `#D7B56D` |
| Jade  | `#4FA184` |
| Rust  | `#C0603B` |

## Licença

MIT
