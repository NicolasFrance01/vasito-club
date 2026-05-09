import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield, User } from 'lucide-react';
import './Users.css';

interface UserData {
  id: string;
  username: string;
  role: string;
  createdAt: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setUsername('');
        setPassword('');
        setRole('user');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (name === 'admin') {
      alert('No se puede eliminar el administrador principal.');
      return;
    }
    if (window.confirm(`¿Estás seguro de eliminar al usuario "${name}"?`)) {
      try {
        const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
        if (res.ok) fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  if (isLoading) return <div className="p-4">Cargando usuarios...</div>;

  return (
    <div className="users-page animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="text-2xl">Gestión de Usuarios</h1>
          <p className="text-gray">Administra quiénes pueden acceder al sistema.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={20} />
          Nuevo Usuario
        </button>
      </div>

      <div className="card">
        <div className="users-list">
          <div className="users-header">
            <div className="col-user">Usuario</div>
            <div className="col-role">Rol</div>
            <div className="col-date">Creado el</div>
            <div className="col-actions">Acciones</div>
          </div>
          
          {users.map(user => (
            <div key={user.id} className="user-item">
              <div className="col-user">
                <div className="user-avatar">
                  {user.role === 'admin' ? <Shield size={16} /> : <User size={16} />}
                </div>
                <div>
                  <h4>{user.username}</h4>
                </div>
              </div>
              <div className="col-role">
                <span className={`badge badge-${user.role === 'admin' ? 'ready' : 'order'}`}>
                  {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
              </div>
              <div className="col-date text-sm text-gray">
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
              <div className="col-actions">
                {user.username !== 'admin' && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(user.id, user.username)}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Agregar Nuevo Usuario</h2>
              <button onClick={() => setIsModalOpen(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleAddUser} className="modal-body">
              <div className="input-group">
                <label>Nombre de Usuario *</label>
                <input type="text" className="input" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Contraseña *</label>
                <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Rol *</label>
                <select className="input" value={role} onChange={e => setRole(e.target.value)} required>
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
