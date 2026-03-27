'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'

type Task = {
  id: number
  title: string
  created_at: string
  done: boolean
}
export const dynamic = 'force-dynamic'
export default function Home() {
  const [task, setTask] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogged, setIsLogged] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      setIsLogged(true)
      loadTasks()
    }
  }

  async function login() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) {
      console.log('Erro:', error.message)
      alert('Credenciais incorretas')
    } else {
      setIsLogged(true)
      setEmail('')
      setPassword('')
      loadTasks()
    }
  }

  async function criarConta() {
    const { error } = await supabase.auth.signUp({
      email,
      password
    })
    if (error) {
      console.log('Erro:', error.message)
      alert('Erro: ' + error.message)
    } else {
      alert('Retorne e faca o login')
      setEmail('')
      setPassword('')
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    setIsLogged(false)
    setEmail('')
    setPassword('')
    setTasks([])
  }

  async function loadTasks() {
    const { data } = await supabase
      .from('tasks')
      .select('*')
    setTasks(data ?? [])
  }

  async function addTask() {
    if (task === '') {
      alert('Digite algo !')
      return
    }
    
    const { error } = await supabase
      .from('tasks')
      .insert({ title: task, done: false })
      
    if (error) {
      console.log('Erro ao adicionar tarefa:', error.message)
      alert('Erro do Supabase: ' + error.message)
      return
    }

    setTask('')
    loadTasks()
  }

  async function deleteTask(id: number) {
    await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    loadTasks()
  }

  async function toggleTask(id: number, currentDone: boolean) {
    await supabase
      .from('tasks')
      .update({ done: !currentDone })
      .eq('id', id)
    loadTasks()
  }

  let totalTarefas = tasks.length
  let tarefasConcluidas = tasks.filter(t => t.done).length
  let tarefasPendentes = tasks.filter(t => !t.done).length

  if (!isLogged) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Login</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{ padding: 5, marginRight: 5, display: 'block', marginBottom: 10 }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          style={{ padding: 5, marginRight: 5, display: 'block', marginBottom: 10 }}
        />
        <button onClick={login} style={{ padding: 5, marginRight: 5 }}>Entrar</button>
        <button onClick={criarConta} style={{ padding: 5 }}>Criar Conta</button>
      </div>
    )
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Lista de Tarefas</h1>
      <button onClick={logout} style={{ padding: 5, marginBottom: 20 }}>Sair</button>
      
      <div style={{ marginBottom: 30, padding: 20, backgroundColor: '#fff8dc', border: '3px dashed #ff6b6b', borderRadius: 10 }}>
        <h2 style={{ color: '#ff6b6b', marginBottom: 20, fontSize: 24 }}>📊 Seu Gráfico de Tarefas</h2>
        
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 250, gap: 20, marginBottom: 20 }}>
          {/* Barra Total */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 60,
              height: Math.max(totalTarefas * 20, 10),
              backgroundColor: '#4ecdc4',
              borderRadius: '8px 8px 0 0',
              boxShadow: '0 4px 8px rgba(78, 205, 196, 0.3)',
              transition: 'all 0.3s ease'
            }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 28, fontWeight: 'bold', color: '#4ecdc4', margin: 0 }}>{totalTarefas}</p>
              <p style={{ fontSize: 12, color: '#666', margin: '5px 0 0 0' }}>Total</p>
            </div>
          </div>

          {/* Barra Concluídas */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 60,
              height: Math.max(tarefasConcluidas * 20, 10),
              backgroundColor: '#95e1d3',
              borderRadius: '8px 8px 0 0',
              boxShadow: '0 4px 8px rgba(149, 225, 211, 0.3)',
              transition: 'all 0.3s ease'
            }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 28, fontWeight: 'bold', color: '#95e1d3', margin: 0 }}>{tarefasConcluidas}</p>
              <p style={{ fontSize: 12, color: '#666', margin: '5px 0 0 0' }}>✅ Concluídas</p>
            </div>
          </div>

          {/* Barra Pendentes */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 60,
              height: Math.max(tarefasPendentes * 20, 10),
              backgroundColor: '#ff6b6b',
              borderRadius: '8px 8px 0 0',
              boxShadow: '0 4px 8px rgba(255, 107, 107, 0.3)',
              transition: 'all 0.3s ease'
            }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 28, fontWeight: 'bold', color: '#ff6b6b', margin: 0 }}>{tarefasPendentes}</p>
              <p style={{ fontSize: 12, color: '#666', margin: '5px 0 0 0' }}>⏳ Pendentes</p>
            </div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Progresso: {totalTarefas > 0 ? Math.round((tarefasConcluidas / totalTarefas) * 100) : 0}%</p>
          <div style={{ 
            width: '100%', 
            height: 25, 
            backgroundColor: '#e0e0e0', 
            borderRadius: 15,
            overflow: 'hidden',
            border: '2px solid #ff6b6b'
          }}>
            <div style={{
              height: '100%',
              width: `${totalTarefas > 0 ? (tarefasConcluidas / totalTarefas) * 100 : 0}%`,
              backgroundColor: '#95e1d3',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>

      <input
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Digite uma tarefa"
        style={{ padding: 5, marginRight: 5 }}
      />
      <button onClick={addTask} style={{ padding: 5 }}>Adicionar</button>

      <ul style={{ marginTop: 20 }}>
        {tasks.map((t) => (
          <li key={t.id} style={{ marginBottom: 10 }}>
            <input 
              type="checkbox" 
              checked={t.done}
              onChange={() => toggleTask(t.id, t.done)}
            />
            <span style={{ marginLeft: 10 }}>
              {t.title}
            </span>
            <button onClick={() => deleteTask(t.id)} style={{ marginLeft: 10 }}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  )
}