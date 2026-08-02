# Totl

Aplicativo Android de controle de orçamento mensal com autenticação de usuário e sincronização em nuvem. Cadastre seu salário fixo, lance gastos à vista ou parcelados e acompanhe o saldo livre dos próximos 12 meses numa linha do tempo visual.

## Funcionalidades

- **Autenticação Segura**: Cadastro e Login usando nome de usuário e senha com alternador de visibilidade de senha.
- **Privacidade e Isolamento**: Dados e orçamentos isolados por usuário com políticas de segurança em nível de linha (RLS).
- **Salário Fixo Editável**: Controle de salário mensal por perfil.
- **Linha do Tempo (12 Meses)**: Visualização horizontal dos próximos 12 meses com barras de saldo livre vs. comprometido.
- **Lançamentos & Parcelamentos**: Cadastro de gastos à vista ou parcelados com mês inicial configurável.
- **Cálculo Automático**: Cálculo automático da parcela atual, término do parcelamento e status ("Quitado", "Parcela X/Y", "Começa em MM/AA").
- **Sincronização em Nuvem**: Dados mantidos no banco de dados PostgreSQL via Supabase.

## Tech Stack

- **React Native CLI (Bare Native)**
- **TypeScript**
- **Supabase** (`@supabase/supabase-js` — Auth & PostgreSQL com RLS)
- **`lucide-react-native`** para ícones
- **Fontes Nativas**: `Fraunces` e `JetBrains Mono` em `assets/fonts/`

## Como rodar o projeto

### Pré-requisitos

- Node.js & npm
- Android SDK & Android Studio configurados
- Emulador Android ou dispositivo físico conectado via USB (`adb devices`)

### Instalação e Execução

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Em um terminal, inicie o bundler do Metro:
   ```bash
   npx react-native start
   ```

3. Em outro terminal, compile e instale o app no emulador/dispositivo:
   ```bash
   npx react-native run-android --no-packager
   ```

## Gerar um APK local

Para compilar o APK em modo Debug:

```bash
cd android
./gradlew assembleDebug
```

O arquivo `.apk` gerado estará em `android/app/build/outputs/apk/debug/app-debug.apk`.

## Estrutura do projeto

```
src/
  components/   Componentes reutilizáveis de UI (Header, ExpenseRow, ExpenseForm, MonthRibbon, SummaryGrid, MonthStepper, SectionLabel)
  screens/      Telas da aplicação (AuthScreen, BudgetScreen)
  services/     Integração com Supabase (supabase.ts, auth.ts, db.ts)
  theme/        Cores e fontes (colors.ts)
  types/        Tipos TypeScript compartilhados
  utils/        Utilitários de data e formatação de moeda
assets/
  fonts/        Arquivos de fontes .ttf (Fraunces e JetBrains Mono)
```

## Paleta de cores

| Nome  | Hex       | Descrição |
|-------|-----------|-----------|
| Ink   | `#12151B` | Fundo principal (Dark) |
| Panel | `#1A1F28` | Cards e painéis |
| Brass | `#D7B56D` | Destaques e títulos |
| Jade  | `#4FA184` | Indicador de saldo positivo e ações |
| Rust  | `#C0603B` | Alertas e erros |

## Licença

MIT
