"use client";

import { useState, useEffect } from "react";
import styles from "./accesos.module.css";
import { RESTAURANTS } from "@/lib/constants";

export default function AccesosPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [newUser, setNewUser] = useState({ restaurant_id: "", username: "", password: "" });
  const [userLoading, setUserLoading] = useState(false);
  const [userMessage, setUserMessage] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserLoading(true);
    setUserMessage("");

    // Obtener el nombre real del restaurante a partir del ID seleccionado
    const selectedRestaurant = RESTAURANTS.find(r => r.id === newUser.restaurant_id);
    if (!selectedRestaurant) {
      setUserMessage("❌ Por favor selecciona un restaurante válido.");
      setUserLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: selectedRestaurant.name, 
          email: `${newUser.username.trim()}@ventu.com`, 
          password: newUser.password, 
          restaurant_id: newUser.restaurant_id,
          role: "restaurant" 
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear usuario");
      
      setUserMessage("✅ Restaurante creado exitosamente");
      setNewUser({ restaurant_id: "", username: "", password: "" });
      fetchUsers(); // Refresh table
    } catch (err) {
      setUserMessage("❌ " + err.message);
    } finally {
      setUserLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Gestión de Accesos</h2>
        <p>Controla qué restaurantes tienen acceso al portal de validación</p>
      </header>

      <div className={styles.contentGrid}>
        {/* Formulario */}
        <div className={`glass-card ${styles.formCard}`}>
          <h3>Crear Nuevo Acceso</h3>
          <p className={styles.subtitle}>Genera credenciales para un restaurante.</p>
          
          <form onSubmit={handleCreateUser} className={styles.form}>
            <div className="form-group">
              <label className="form-label">Restaurante</label>
              <select 
                className="form-input" 
                value={newUser.restaurant_id} 
                onChange={(e) => setNewUser({ ...newUser, restaurant_id: e.target.value })} 
                required
              >
                <option value="">Selecciona el restaurante...</option>
                {RESTAURANTS.map(r => (
                  <option key={r.id} value={r.id}>{r.name} - {r.type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Usuario</label>
              <div className={styles.inputGroup}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="ej: finca8" 
                  value={newUser.username} 
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })} 
                  required 
                />
                <span className={styles.inputSuffix}>@ventu.com</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña Temporal</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Mínimo 6 caracteres" 
                value={newUser.password} 
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} 
                required 
                minLength={6}
              />
            </div>

            <button type="submit" disabled={userLoading} className="btn btn-primary">
              {userLoading ? "Creando..." : "Otorgar Acceso"}
            </button>
            {userMessage && <div className={styles.message}>{userMessage}</div>}
          </form>
        </div>

        {/* Tabla */}
        <div className={`glass-card ${styles.tableCard}`}>
          <h3>Restaurantes con Acceso</h3>
          
          {loading ? (
            <div className={styles.loading}>Cargando accesos...</div>
          ) : users.length === 0 ? (
            <div className={styles.empty}>No hay restaurantes registrados aún.</div>
          ) : (
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Restaurante</th>
                    <th>Usuario de Ingreso</th>
                    <th>ID Interno</th>
                    <th>Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.uid}>
                      <td className={styles.fwBold}>{user.name || "Sin nombre"}</td>
                      <td>{user.email}</td>
                      <td><code>{user.restaurant_id || "N/A"}</code></td>
                      <td><span className={styles.badge}>{user.role || "restaurant"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
