# 📋 SealTask

<div align="center">

![SealTask](https://img.shields.io/badge/SealTask-Sistema%20de%20Tarefas-0EA5E9?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)

**Sistema interno de gerenciamento de tarefas da Seal Store**

</div>

---

## 📖 Sobre o Projeto

O **SealTask** é um sistema de gerenciamento de tarefas desenvolvido para uso interno da Seal Store. Ele substitui o uso de papel e caneta, permitindo que gestores criem e distribuam tarefas, enquanto colaboradores acompanham e atualizam o progresso de suas atividades em tempo real.

## ✨ Funcionalidades

### 👔 Para Gestores
- ✅ Criar tarefas com título, descrição e prazo
- ✅ Atribuir tarefas para colaboradores específicos ou setores inteiros
- ✅ Adicionar checklists com até 20 itens por tarefa
- ✅ Visualizar todas as tarefas de todos os setores
- ✅ Excluir tarefas quando necessário
- ✅ Acompanhar estatísticas gerais do sistema

### 👥 Para Colaboradores
- ✅ Visualizar tarefas atribuídas diretamente ou ao seu setor
- ✅ Marcar/desmarcar itens do checklist
- ✅ Atualizar status das tarefas (Pendente → Em Andamento → Concluída)
- ✅ Acompanhar progresso visual das tarefas

### 🔧 Recursos Gerais
- 🔄 **Atualizações em tempo real** - Mudanças são sincronizadas instantaneamente
- 📱 **Totalmente responsivo** - Funciona perfeitamente em celulares e tablets
- 🖼️ **Foto de perfil** - Upload com crop circular para personalização
- 🔍 **Filtros e busca** - Encontre tarefas rapidamente
- 📊 **Dashboard com estatísticas** - Visão geral do progresso

## 🛠️ Tecnologias

| Tecnologia | Descrição |
|------------|-----------|
| **React 18** | Biblioteca para construção da interface |
| **TypeScript** | Tipagem estática para maior segurança |
| **Vite** | Build tool rápido e moderno |
| **Tailwind CSS** | Framework CSS utilitário |
| **shadcn/ui** | Componentes de UI elegantes |
| **Supabase** | Backend as a Service (Auth, Database, Storage, Realtime) |

## 🏗️ Estrutura do Banco de Dados

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐
│  profiles   │     │    tasks    │     │ task_checklist_items│
├─────────────┤     ├─────────────┤     ├─────────────────────┤
│ id          │◄────│ created_by  │     │ id                  │
│ full_name   │     │ assigned_to │     │ task_id             │────►
│ email       │     │ title       │     │ description         │
│ department  │     │ description │     │ is_completed        │
│ role        │     │ deadline    │     │ item_order          │
│ avatar_url  │     │ status      │     └─────────────────────┘
└─────────────┘     └─────────────┘
```

## 🚀 Como Executar Localmente

```bash
# Clone o repositório
git clone <url-do-repositorio>

# Entre na pasta do projeto
cd seal-task-manager

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O projeto estará disponível em `http://localhost:8080`

## 📋 Variáveis de Ambiente

O projeto utiliza Supabase. As variáveis já estão configuradas no cliente:

```env
VITE_SUPABASE_URL=<sua-url-do-supabase>
VITE_SUPABASE_ANON_KEY=<sua-chave-anonima>
```

## 👥 Tipos de Usuário

| Tipo | Permissões |
|------|------------|
| **Gestor (Manager)** | Criar, editar, excluir tarefas. Ver todas as tarefas. Atribuir para qualquer usuário ou setor. |
| **Colaborador (Member)** | Ver tarefas atribuídas a si ou ao seu setor. Atualizar status e marcar checklist. |

## 📱 Screenshots

<details>
<summary>Ver screenshots</summary>

### Dashboard
- Visualização de estatísticas
- Lista de tarefas com filtros
- Cards expandíveis com detalhes

### Criação de Tarefa
- Formulário intuitivo
- Seleção de atribuição
- Checklist dinâmico

### Perfil
- Upload de foto com crop
- Informações do usuário

</details>

## 📄 Licença

Este projeto é de uso interno da **Seal Store**.

---

<div align="center">

Desenvolvido com 💙 para a **Seal Store**

© 2025 SealTask

</div>
