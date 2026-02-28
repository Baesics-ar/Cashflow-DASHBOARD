import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api.js";

export function useData() {
  const [transactions, setTransactions] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [dashConfig, setDashConfig] = useState({
    proveedores: 0, talleres: 0, sueldos_pendientes: 0,
    oblig_oficinas: 0, dinero_liquidar: 0, saldo_respaldo: 0
  });
  const [dineroEstimado, setDineroEstimado] = useState([]);
  const [fondosInversion, setFondosInversion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [txs, ctas, dash] = await Promise.all([
        api.getTransactions(),
        api.getCuentas(),
        api.getDashboard(),
      ]);
      setTransactions(txs);
      setCuentas(ctas);
      setDashConfig(dash.config || {});
      setDineroEstimado(dash.dineroEstimado || []);
      setFondosInversion(dash.fondosInversion || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Transactions
  const addTransaction = async (data) => {
    const tx = await api.createTransaction(data);
    setTransactions(prev => [tx, ...prev]);
    return tx;
  };

  const updateTransaction = async (id, data) => {
    const tx = await api.updateTransaction(id, data);
    setTransactions(prev => prev.map(t => t.id === id ? tx : t));
    return tx;
  };

  const deleteTransaction = async (id) => {
    await api.deleteTransaction(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Cuentas
  const addCuenta = async (nombre) => {
    const c = await api.createCuenta(nombre);
    setCuentas(prev => [...prev, c]);
    return c;
  };

  const deleteCuenta = async (id) => {
    await api.deleteCuenta(id);
    setCuentas(prev => prev.filter(c => c.id !== id));
  };

  // Dashboard config
  const saveConfig = async (data) => {
    const cfg = await api.updateConfig(data);
    setDashConfig(cfg);
    return cfg;
  };

  // Dinero estimado
  const addEstimado = async (data) => {
    const item = await api.createEstimado(data);
    setDineroEstimado(prev => [...prev, item]);
    return item;
  };

  const updateEstimado = async (id, data) => {
    const item = await api.updateEstimado(id, data);
    setDineroEstimado(prev => prev.map(x => x.id === id ? item : x));
    return item;
  };

  const deleteEstimado = async (id) => {
    await api.deleteEstimado(id);
    setDineroEstimado(prev => prev.filter(x => x.id !== id));
  };

  // Fondos
  const addFondo = async (data) => {
    const item = await api.createFondo(data);
    setFondosInversion(prev => [...prev, item]);
    return item;
  };

  const updateFondo = async (id, data) => {
    const item = await api.updateFondo(id, data);
    setFondosInversion(prev => prev.map(x => x.id === id ? item : x));
    return item;
  };

  const deleteFondo = async (id) => {
    await api.deleteFondo(id);
    setFondosInversion(prev => prev.filter(x => x.id !== id));
  };

  return {
    transactions, cuentas, dashConfig, dineroEstimado, fondosInversion,
    loading, error, reload: load,
    addTransaction, updateTransaction, deleteTransaction,
    addCuenta, deleteCuenta,
    saveConfig,
    addEstimado, updateEstimado, deleteEstimado,
    addFondo, updateFondo, deleteFondo,
  };
}
