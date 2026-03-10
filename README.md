# Gerenciador de Rotas de Entregas - Fabiana Móveis

<img src="https://github.com/ICEI-PUC-Minas-PMGES-TI/pmg-es-2025-1-ti3-9577100-fabiana-moveis/blob/main/Artefatos/Imagens/logo-fabiana-moveis.png" alt="Descrição da imagem" width="400">


A Mercantil Comercial Fabiana LTDA é uma loja de móveis e eletrodomésticos sediada na cidade de Pedro Leopoldo, com 4 unidades no vetor norte de BH, possui uma dificuldade no gerenciamento de rotas de entregas de pordutos vendidos em toda a região metropolitana. A fim de solucionar essa questão, o software tem como objetivo auxiliar na logística de entrega de móveis e eletrodomésticos da Fabiana Móveis, criando uma rota dinâmica de acordo com a demanda diária de produtos vendidos a serem entregues e exibindo dados em relação a essas entregas quando solicitado pelo gerente. Os gerentes poderão se cadastrar e cadastrar os motoristas, e diariamente vão cadastrar as vendas a serem entregues com o produto, endereço, data de entrega e nome do cliente. No determinado dia, a rota poderá ser gerada e será exibida juntamente com todas as suas informações. Além disso, os usuários terão acesso a um dashboard das entregas semanais e poderão gerar relatórios escolhidos dentro de um período de data, assim tendo acesso às informações sobre as entregas e oportunidades de melhorias.

## Alunos integrantes da equipe

* Bernardo de Resende Marcelino 
* Flávio de Souza Ferreira Júnior 
* João Marcelo Carvalho Pereira Araújo 
* Luidi Cadete Silva
* Miguel Figueiredo Diniz 

## Professores responsáveis

* Prof. Danilo de Quadros Maia Filho
* Prof. João Paulo Aramuni
* Prof. Ramon Lacerda Marques

## Tecnologias Utilizadas

### Frontend
- **Next.js 15** - Framework React para desenvolvimento web
- **TypeScript** - Linguagem de programação tipada
- **Tailwind CSS** - Framework CSS para estilização
- **React Hook Form** - Gerenciamento de formulários
- **Chart.js & Recharts** - Bibliotecas para gráficos e visualizações
- **Axios** - Cliente HTTP para requisições API
- **Zustand** - Gerenciamento de estado global
- **HTML2PDF** - Geração de relatórios em PDF

### Backend
- **NestJS** - Framework Node.js para APIs
- **TypeScript** - Linguagem de programação tipada
- **TypeORM** - ORM para banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação e autorização
- **Google Maps API** - Serviços de geolocalização e rotas
- **Bcrypt** - Criptografia de senhas

### Infraestrutura
- **Docker** - Containerização da aplicação
- **AWS Database** - Hospedagem do banco de dados PostgreSQL

## Pré-requisitos

Antes de executar a aplicação, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **Docker** e **Docker Compose**
- **Git**

## Instruções de Instalação e Execução

### Opção 1: Executar com Docker (Recomendado)

1. **Clone o repositório:**

2. **Execute a aplicação com Docker Compose:**
```bash
docker-compose up --build
```

3. **Acesse a aplicação:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Opção 2: Executar Localmente

#### Backend

1. **Navegue até a pasta do backend:**
```bash
cd Codigo/backend
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
Crie um arquivo `.env` na pasta backend com as seguintes variáveis:
```
PORT=

DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
DB_SSL=

JWT_SECRET=
JWT_EXPIRATION=

JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRATION=
```

4. **Execute o backend:**
```bash
npm run start:dev
```

#### Frontend

1. **Navegue até a pasta do frontend:**
```bash
cd Codigo/frontend
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Execute o frontend:**
```bash
npm run dev
```

4. **Acesse a aplicação:**
   - Frontend: http://localhost:3000

## Funcionalidades do Sistema

### Para Gerentes
- ✅ **Autenticação segura** com login e senha
- ✅ **Cadastro de motoristas** e gerenciamento de funcionários
- ✅ **Cadastro de entregas** com informações detalhadas (produto, endereço, cliente, data)
- ✅ **Geração automática de rotas** otimizadas usando Google Maps API
- ✅ **Dashboard de entregas** com visualizações gráficas
- ✅ **Relatórios personalizados** por período
- ✅ **Histórico de rotas** e entregas realizadas

### Para Motoristas (Mobile)
- ✅ **Interface mobile otimizada** para smartphones
- ✅ **Visualização de rotas** do dia
- ✅ **Navegação integrada** com Google Maps
- ✅ **Atualização de status** das entregas

## Estrutura do Projeto

```
Codigo/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── app/            # Módulos da aplicação
│   │   ├── domains/        # Entidades e lógica de negócio
│   │   └── main.ts         # Arquivo principal
│   ├── Dockerfile          # Containerização do backend
│   └── package.json        # Dependências do backend
├── frontend/               # Aplicação Next.js
│   ├── app/               # Páginas e rotas
│   │   ├── dashboard/     # Dashboard principal
│   │   ├── deliveries/    # Gestão de entregas
│   │   ├── employees/     # Gestão de funcionários
│   │   ├── routes/        # Rotas de entrega
│   │   ├── reports/       # Relatórios
│   │   └── mobile/        # Interface mobile
│   ├── components/        # Componentes reutilizáveis
│   ├── Dockerfile         # Containerização do frontend
│   └── package.json       # Dependências do frontend
└── docker-compose.yml     # Orquestração dos containers
```

## Como Usar o Sistema

### 1. Primeiro Acesso
- Acesse http://localhost:3000
- Faça login com as credenciais de administrador
- Complete seu perfil de usuário

### 2. Cadastro de Entregas
- Acesse "Entregas" no menu
- Clique em "Nova Entrega"
- Preencha: produto, cliente, endereço e data de entrega
- Salve a entrega

### 3. Geração de Rotas
- Vá para "Gerador de Rotas"
- Selecione a data desejada
- Escolha o motorista
- Clique em "Gerar Rota Otimizada"
- O sistema calculará a melhor rota usando Google Maps

### 4. Acompanhamento
- Use o "Dashboard" para visualizar estatísticas
- Acesse "Rotas Recentes" para ver o histórico
- Gere "Relatórios" por período específico

### 5. Cadastro de Funcionários
- Navegue para "Funcionários" no menu lateral
- Clique em "Novo Funcionário"
- Preencha os dados do motorista
- Defina o tipo de usuário (Gerente ou Motorista)

### 6. Interface Mobile (Motoristas)
- Motoristas acessam pelo mesmo endereço
- Interface adaptada para dispositivos móveis
- Visualização simplificada das rotas do dia

## Interfaces do sistema

### Tela de Login
A tela de login é a porta de entrada do sistema, onde gerentes e motoristas fazem a autenticação.

![Tela de Login](Artefatos/Imagens/screenshots/tela-login.png)

### Dashboard Principal (Gerentes)
O dashboard oferece uma visão geral das entregas, estatísticas e métricas importantes.

![Dashboard](Artefatos/Imagens/screenshots/dashboard.png)

**Funcionalidades visíveis:**
- Resumo de entregas do dia/semana/mês
- Gráficos de performance
- Entregas pendentes e concluídas
- Estatísticas de motoristas

### Cadastro de Entregas
Interface para cadastro de novas entregas com todos os dados necessários.

![Cadastro de Entregas](Artefatos/Imagens/screenshots/cadastro-entregas.png)

**Campos disponíveis:**
- Dados do cliente (nome, telefone)
- Endereço completo de entrega
- Produto/descrição
- Data e horário de entrega
- Observações especiais

### Cadastro de Funcionários
Tela para gerenciamento de funcionários, incluindo motoristas e outros gerentes.

![Cadastro de Funcionários](Artefatos/Imagens/screenshots/cadastro-funcionarios.png)

**Informações gerenciadas:**
- Dados pessoais
- Tipo de usuário (Gerente/Motorista)
- Credenciais de acesso
- Status ativo/inativo

### Gerador de Rotas
Funcionalidade principal que otimiza rotas usando Google Maps API.

![Gerador de Rotas](Artefatos/Imagens/screenshots/gerador-rotas.png)

**Recursos:**
- Seleção de data
- Escolha de motorista
- Visualização do mapa
- Rota otimizada automática
- Estimativa de tempo e distância

### Relatórios
Sistema de geração de relatórios personalizados por período.

![Relatórios](Artefatos/Imagens/screenshots/relatorios.png)

**Tipos de relatório:**
- Entregas por período
- Performance de motoristas
- Análise de rotas
- Relatórios em PDF


## Configurações Adicionais

### Configuração da API do Google Maps

1. **Obtenha uma chave da API do Google Maps:**
   - Acesse o [Google Cloud Console](https://console.cloud.google.com/)
   - Ative as APIs: Maps JavaScript API, Geocoding API, Directions API
   - Crie uma chave de API

2. **Configure no backend:**
   - Adicione no arquivo `.env`: `GOOGLE_MAPS_API_KEY=sua_chave_aqui`

3. **Configure no frontend:**
   - Adicione no arquivo `.env.local`: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_aqui`

### Configuração do Banco de Dados Local (Opcional)

Para usar PostgreSQL local em vez da AWS:

1. **Instale PostgreSQL localmente**

2. **Configure as variáveis de ambiente:**
```env
DB_HOST=
DB_PORT=
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=fabianamoveis
DB_SSL=false
```

3. **Execute as migrations (se aplicável):**
```bash
npm run typeorm:migration:run
```

## Solução de Problemas Comuns

### Erro de Conexão com Banco de Dados
- Verifique se as credenciais estão corretas no arquivo `.env`
- Confirme se o banco de dados Azure está acessível
- Teste a conectividade de rede

### Problemas com Docker
```bash
# Limpar containers e imagens
docker-compose down --volumes
docker system prune -a

# Reconstruir containers
docker-compose up --build --force-recreate
```

### Porta já em uso
```bash
# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess
Stop-Process -Id <PID>

# Ou usar o script do projeto
npm run kill-port
```

### Problemas com dependências Node.js
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## Arquitetura do Sistema

### Backend (NestJS)
```
src/
├── app/
│   ├── auth/           # Autenticação e autorização
│   ├── users/          # Gestão de usuários
│   ├── deliveries/     # Gestão de entregas
│   ├── routes/         # Geração e gestão de rotas
│   └── reports/        # Geração de relatórios
├── domains/
│   ├── entities/       # Entidades do banco de dados
│   ├── dto/           # Data Transfer Objects
│   └── interfaces/    # Interfaces e contratos
└── shared/
    ├── guards/        # Guards de autenticação
    ├── decorators/    # Decorators customizados
    └── utils/         # Utilitários gerais
```

### Frontend (Next.js)
```
app/
├── (auth)/
│   └── login/         # Páginas de autenticação
├── dashboard/         # Dashboard principal
├── deliveries/        # Gestão de entregas
├── employees/         # Gestão de funcionários
├── routes/           # Rotas de entrega
├── reports/          # Relatórios
├── mobile/           # Interface mobile
└── components/       # Componentes reutilizáveis
    ├── ui/           # Componentes básicos de UI
    ├── forms/        # Formulários
    ├── charts/       # Gráficos e visualizações
    └── layout/       # Componentes de layout
```

## Performance e Otimização

### Métricas de Performance
- **Tempo de carregamento inicial:** < 3 segundos
- **Tempo de geração de rotas:** < 10 segundos
- **Suporte para:** 100+ entregas simultâneas
- **Otimização:** Lazy loading de componentes

### Monitoramento
- Logs estruturados no backend
- Métricas de uso da API do Google Maps
- Monitoramento de uptime da aplicação

## Desenvolvimento e Contribuição

### Estrutura de Branches
- `main` - Versão estável de produção
- `develop` - Branch de desenvolvimento
- `feature/*` - Novas funcionalidades
- `fix/*` - Correções de bugs

### Comandos de Desenvolvimento

```bash
# Backend
npm run start:dev      # Desenvolvimento com hot reload
npm run test          # Executar testes
npm run lint          # Verificar qualidade do código

# Frontend
npm run dev           # Desenvolvimento
npm run build         # Build de produção
npm run lint          # Verificar qualidade do código
```

### Padrões de Código
- **ESLint** configurado para TypeScript
- **Prettier** para formatação automática
- **Conventional Commits** para mensagens de commit
- **Husky** para hooks de pre-commit

## Licença e Contato

Este projeto foi desenvolvido como Trabalho Interdisciplinar para o curso de Engenharia de Software da PUC Minas.

### Equipe de Desenvolvimento
- **Bernardo de Resende Marcelino** - Desenvolvedor Full Stack
- **Flávio de Souza Ferreira Júnior** - Desenvolvedor Backend
- **João Marcelo Carvalho Pereira Araújo** - Desenvolvedor Frontend
- **Luidi Cadete Silva** - Desenvolvedor Full Stack
- **Miguel Figueiredo Diniz** - Desenvolvedor Frontend

### Orientação Acadêmica
- **Prof. Danilo de Quadros Maia Filho**
- **Prof. João Paulo Aramuni**
- **Prof. Ramon Lacerda Marques**

---

**Fabiana Móveis - Sistema de Gerenciamento de Entregas**  
*Desenvolvido com ❤️ pela equipe TI3 - PUC Minas 2025*
